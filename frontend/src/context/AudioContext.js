// frontend/src/context/AudioContext.js (Đã sửa lỗi)
import React, { createContext, useState, useRef, useEffect, useCallback } from 'react'; // 👈 1. Thêm useCallback
import api from '../api/api';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cập nhật progress và currentTime
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  // Xử lý Play/Pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Tải bài hát mới và lấy duration
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      audio.src = currentSong;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
      setProgress(0);
      setCurrentTime(0);

      const setAudioDuration = () => {
        setDuration(audio.duration || 0);
      };
      audio.addEventListener('loadedmetadata', setAudioDuration);

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioDuration);
      };
    }
  }, [currentSong, isPlaying]); // Giữ isPlaying ở đây để đảm bảo tự động phát khi chọn bài mới

  // --- 2. BỌC CÁC HÀM TRONG useCallback ---

  const playSong = useCallback(async (song, playlist = [], index = 0) => {
    const songUrl = `${api.defaults.baseURL}${song.file_url}`;
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true);

    try {
      await api.post('/api/users/history', { song_id: song.id });
    } catch (err) {
      console.error('Error saving history:', err);
    }
  }, []); // api.defaults.baseURL là hằng số, không cần đưa vào dependency

  const togglePlay = useCallback(() => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  }, []);

  // 👇 3. KHÔI PHỤC LOGIC VÀ BỌC useCallback
  const nextSong = useCallback(() => {
    if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
      playSong(currentPlaylist[currentIndex + 1], currentPlaylist, currentIndex + 1);
    }
  }, [currentPlaylist, currentIndex, playSong]);

  // 👇 4. KHÔI PHỤC LOGIC VÀ BỌC useCallback
  const prevSong = useCallback(() => {
    if (currentPlaylist.length > 0 && currentIndex > 0) {
      playSong(currentPlaylist[currentIndex - 1], currentPlaylist, currentIndex - 1);
    }
  }, [currentPlaylist, currentIndex, playSong]);

  const handleSeek = useCallback((e) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTo = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTo;
      setProgress(e.target.value);
      setCurrentTime(seekTo);
    }
  }, []); // audioRef là stable ref

  const handleVolumeChange = useCallback((e) => {
    setVolume(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  }, []);

  // 👇 5. Cập nhật useEffect 'onended'
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = nextSong; // Gán hàm nextSong đã được useCallback
    }
    // Cần cleanup để tránh gán sự kiện cũ
    return () => {
      if (audio) {
        audio.onended = null;
      }
    }
  }, [nextSong]); // Chỉ phụ thuộc vào nextSong

  return (
    <AudioContext.Provider value={{
      currentSong,
      isPlaying,
      volume,
      progress,
      currentTime,
      duration,
      playSong,
      togglePlay,
      nextSong,
      prevSong,
      handleSeek,
      handleVolumeChange,
      currentPlaylist,
      currentIndex
    }}>
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};