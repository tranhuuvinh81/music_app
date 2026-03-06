import React, { createContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { AppState } from 'react-native'; // [THÊM MỚI] Theo dõi trạng thái App
import AsyncStorage from '@react-native-async-storage/async-storage'; // [THÊM MỚI]
import api from '../api/api';

export const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [activeSong, setActiveSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);

  const playlistRef = useRef<any[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const soundRef = useRef<Audio.Sound | null>(null);
  const activeSongRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);

  // [TÍNH NĂNG MỚI 1] Khôi phục bài hát đang nghe dở khi mở App
  useEffect(() => {
    const loadSavedPlayback = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@saved_playback');
        if (savedData) {
          const { song, playlist, pos } = JSON.parse(savedData);
          if (song) {
            setActiveSong(song);
            activeSongRef.current = song;
            setCurrentPlaylist(playlist || []);
            playlistRef.current = playlist || [];
            setPosition(pos || 0);

            // Nạp file nhạc nhưng KHÔNG phát luôn (tránh giật mình)
            const audioUrl = getResourceUrl(song.file_url);
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: audioUrl },
              { shouldPlay: false, positionMillis: pos || 0, volume: volume },
              onPlaybackStatusUpdate
            );
            soundRef.current = newSound;
            setSound(newSound);
          }
        }
      } catch (e) {
        console.error("Lỗi khôi phục nhạc:", e);
      }
    };

    // Cấu hình chạy nền
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    loadSavedPlayback();
  }, []);

  // [TÍNH NĂNG MỚI 2] Lưu lại vị trí nghe nhạc khi người dùng thoát/ẩn App
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Khi app bị ẩn xuống nền hoặc tắt
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (activeSongRef.current && soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            const currentPos = status.isLoaded ? status.positionMillis : 0;
            const playbackData = {
              song: activeSongRef.current,
              playlist: playlistRef.current,
              pos: currentPos
            };
            await AsyncStorage.setItem('@saved_playback', JSON.stringify(playbackData));
          } catch (e) { }
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const getResourceUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      // Lưu tự động sau mỗi 10 giây (dự phòng trường hợp app crash đột ngột)
      if (status.isPlaying && status.positionMillis % 10000 < 500) {
        AsyncStorage.setItem('@saved_playback', JSON.stringify({
          song: activeSongRef.current,
          playlist: playlistRef.current,
          pos: status.positionMillis
        })).catch(()=>{});
      }

      if (status.didJustFinish) {
        playNextRef.current();
      }
    }
  };

  const playSong = async (song: any, playlist: any[] = [], index: number = 0) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      if (activeSongRef.current && activeSongRef.current.id === song.id) {
        await togglePlayPauseAction();
        isProcessingRef.current = false;
        return;
      }

      if (soundRef.current) {
        const oldSound = soundRef.current;
        soundRef.current = null;
        setIsPlaying(false);
        await oldSound.unloadAsync();
      }

      // [TÍNH NĂNG MỚI 3] Lưu bài hát vào Lịch sử nghe nhạc
      const historyStr = await AsyncStorage.getItem('@listening_history');
      let history = historyStr ? JSON.parse(historyStr) : [];
      history = history.filter((s: any) => s.id !== song.id); // Xóa nếu trùng để đẩy lên đầu
      history.unshift(song);
      if (history.length > 20) history.pop(); // Chỉ lưu tối đa 20 bài gần nhất cho nhẹ máy
      await AsyncStorage.setItem('@listening_history', JSON.stringify(history));

      playlistRef.current = playlist.length > 0 ? playlist : [song];
      setCurrentPlaylist(playlistRef.current);
      currentIndexRef.current = index;

      const audioUrl = getResourceUrl(song.file_url);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: volume },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setSound(newSound);
      setActiveSong(song);
      activeSongRef.current = song;
      setIsPlaying(true);

    } catch (error) {
      console.error("Lỗi phát nhạc:", error);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const playNextAction = async () => {
    if (playlistRef.current.length <= 1 || isProcessingRef.current) return;
    let nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= playlistRef.current.length) nextIndex = 0; 
    await playSong(playlistRef.current[nextIndex], playlistRef.current, nextIndex);
  };

  const playPrevAction = async () => {
    if (playlistRef.current.length <= 1 || isProcessingRef.current) return;
    let prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) prevIndex = playlistRef.current.length - 1;
    await playSong(playlistRef.current[prevIndex], playlistRef.current, prevIndex);
  };

  const playNextRef = useRef(playNextAction);
  useEffect(() => {
    playNextRef.current = playNextAction;
  }, [currentPlaylist]);

  const togglePlayPauseAction = async () => {
    if (!soundRef.current || isProcessingRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (e) {}
  };

  const seekToAction = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setPosition(value);
    }
  };

  const setVolumeAction = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(value);
      setVolumeState(value);
    }
  };

  const updatePlaylistOrder = (newList: any[]) => {
    playlistRef.current = newList;
    setCurrentPlaylist(newList);
    if (activeSongRef.current) {
      const newIndex = newList.findIndex((s: any) => s.id === activeSongRef.current.id);
      if (newIndex !== -1) currentIndexRef.current = newIndex;
    }
  };

  return (
    <AudioContext.Provider value={{ 
      sound, activeSong, isPlaying, position, duration, volume, currentPlaylist,
      playSong, togglePlayPause: togglePlayPauseAction, playNext: playNextAction, playPrev: playPrevAction, seekTo: seekToAction, setVolume: setVolumeAction, getResourceUrl, updatePlaylistOrder
    }}>
      {children}
    </AudioContext.Provider>
  );
};