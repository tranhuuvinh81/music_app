//music-mobile-app/context/AudioContext.tsx
import React, { createContext, useState, useRef } from 'react';
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

  const playlistRef = useRef<any[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const soundRef = useRef<Audio.Sound | null>(null);
  // [NEW] Dùng ref để kiểm tra tức thời bài đang phát, tránh lỗi closure
  const activeSongRef = useRef<any>(null);

  const getResourceUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        playNext();
      }
    }
  };

  const playSong = async (song: any, playlist: any[] = [], index: number = 0) => {
    try {
      // 1. CHỐNG ĐÈ NHẠC: Nếu bấm lại đúng bài đang phát -> Đổi thành Toggle Play/Pause
      if (activeSongRef.current && activeSongRef.current.id === song.id) {
        await togglePlayPause();
        return;
      }

      // 2. DỌN NHẠC CŨ: Giải phóng bộ nhớ ngay lập tức trước khi tải bài mới
      if (soundRef.current) {
        const oldSound = soundRef.current;
        soundRef.current = null; // Ngắt kết nối ngay lập tức để dừng update UI
        await oldSound.unloadAsync();
      }

      // 3. CẬP NHẬT PLAYLIST
      playlistRef.current = playlist.length > 0 ? playlist : [song];
      currentIndexRef.current = index;

      // 4. PHÁT BÀI MỚI
      const audioUrl = getResourceUrl(song.file_url);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: volume },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      setSound(newSound);
      setActiveSong(song);
      activeSongRef.current = song; // Cập nhật ref
      setIsPlaying(true);
    } catch (error) {
      console.error("Lỗi phát nhạc:", error);
    }
  };

  const playNext = async () => {
    if (playlistRef.current.length <= 1) return;
    let nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= playlistRef.current.length) nextIndex = 0; 
    await playSong(playlistRef.current[nextIndex], playlistRef.current, nextIndex);
  };

  const playPrev = async () => {
    if (playlistRef.current.length <= 1) return;
    let prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) prevIndex = playlistRef.current.length - 1;
    await playSong(playlistRef.current[prevIndex], playlistRef.current, prevIndex);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    // Kiểm tra trạng thái thực tế từ đối tượng sound để tránh lệch state
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const seekTo = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setPosition(value);
    }
  };

  const setVolume = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(value);
      setVolumeState(value);
    }
  };

  return (
    <AudioContext.Provider value={{ 
      sound, activeSong, isPlaying, position, duration, volume,
      playSong, togglePlayPause, playNext, playPrev, seekTo, setVolume, getResourceUrl 
    }}>
      {children}
    </AudioContext.Provider>
  );
};