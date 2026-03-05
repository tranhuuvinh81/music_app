//music-mobile-app/context/AudioContext.tsx
import React, { createContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
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

  // Các Ref để lưu trữ trạng thái ngầm, không bị ảnh hưởng bởi re-render
  const playlistRef = useRef<any[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const soundRef = useRef<Audio.Sound | null>(null);
  const activeSongRef = useRef<any>(null);
  
  // [QUAN TRỌNG] Ổ khóa chống spam click (Ngăn lỗi phát nhạc đè lên nhau)
  const isProcessingRef = useRef<boolean>(false);

  const getResourceUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      // Khi bài hát kết thúc, gọi hàm Next thông qua Ref để tránh lỗi Stale Closure
      if (status.didJustFinish) {
        playNextRef.current();
      }
    }
  };

  const playSong = async (song: any, playlist: any[] = [], index: number = 0) => {
    // Nếu hệ thống đang tải bài khác, khóa không cho click tiếp
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      // 1. CHỐNG ĐÈ NHẠC: Bấm lại đúng bài đang phát -> Chuyển thành Pause/Play
      if (activeSongRef.current && activeSongRef.current.id === song.id) {
        await togglePlayPauseAction();
        isProcessingRef.current = false;
        return;
      }

      // 2. DỌN SẠCH NHẠC CŨ
      if (soundRef.current) {
        const oldSound = soundRef.current;
        soundRef.current = null; // Cắt đứt UI ngay lập tức
        setIsPlaying(false);
        await oldSound.unloadAsync(); // Đợi hủy xong bài cũ
      }

      // 3. CẬP NHẬT DANH SÁCH MỚI
      playlistRef.current = playlist.length > 0 ? playlist : [song];
      setCurrentPlaylist(playlistRef.current);
      currentIndexRef.current = index;

      // 4. BẬT BÀI MỚI
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
      // Mở khóa khi đã xử lý xong
      isProcessingRef.current = false;
    }
  };

  // [THÊM MỚI] Hàm cập nhật lại danh sách và vị trí hiện tại sau khi kéo thả
  const updatePlaylistOrder = (newList: any[]) => {
    playlistRef.current = newList;
    setCurrentPlaylist(newList);
    
    // Tìm lại xem bài đang phát hiện tại đang nằm ở vị trí thứ mấy trong danh sách mới
    if (activeSongRef.current) {
      const newIndex = newList.findIndex((s: any) => s.id === activeSongRef.current.id);
      if (newIndex !== -1) {
        currentIndexRef.current = newIndex;
      }
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

  // Dùng Ref để cất giữ hàm playNext, giúp sự kiện didJustFinish gọi chuẩn xác
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
    } catch (e) {
      console.error("Lỗi Play/Pause:", e);
    }
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

  return (
    <AudioContext.Provider value={{ 
      sound, activeSong, isPlaying, position, duration, volume, currentPlaylist,
      playSong, togglePlayPause: togglePlayPauseAction, playNext: playNextAction, playPrev: playPrevAction, seekTo: seekToAction, setVolume: setVolumeAction, getResourceUrl, updatePlaylistOrder 
    }}>
      {children}
    </AudioContext.Provider>
  );
};