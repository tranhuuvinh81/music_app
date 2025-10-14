// frontend/src/context/AudioContext.js (updated)
import React, { createContext, useState, useRef, useEffect } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]); // Mảng các song objects
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Từ 0 đến 1
  const [progress, setProgress] = useState(0); // Phần trăm tiến độ
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      audio.src = currentSong;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
      setProgress(0);
    }
  }, [currentSong]);

  const playSong = (song, playlist = [], index = 0) => {
    const songUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${song.file_url}`;
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
      playSong(currentPlaylist[currentIndex + 1], currentPlaylist, currentIndex + 1);
    }
  };

  const prevSong = () => {
    if (currentPlaylist.length > 0 && currentIndex > 0) {
      playSong(currentPlaylist[currentIndex - 1], currentPlaylist, currentIndex - 1);
    }
  };

  const handleSeek = (e) => {
    const seekTo = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTo;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = nextSong;
    }
  }, [currentIndex, currentPlaylist]);

  return (
    <AudioContext.Provider value={{
      currentSong,
      isPlaying,
      volume,
      progress,
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