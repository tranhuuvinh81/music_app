// // frontend/src/context/AudioContext.js (updated)
// import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
// import api from '../api/api';
// import { AuthContext } from '../context/AuthContext';
// export const AudioContext = createContext();

// export const AudioProvider = ({ children }) => {
//   const [currentSong, setCurrentSong] = useState(null);
//   const [currentPlaylist, setCurrentPlaylist] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [progress, setProgress] = useState(0);
//   const audioRef = useRef(null);
//   const { isAuthenticated } = useContext(AuthContext);

//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.volume = volume;
//     }
//   }, [volume]);

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (audio) {
//       const updateProgress = () => {
//         if (audio.duration) {
//           setProgress((audio.currentTime / audio.duration) * 100);
//         }
//       };
//       audio.addEventListener('timeupdate', updateProgress);
//       return () => audio.removeEventListener('timeupdate', updateProgress);
//     }
//   }, []);

//   useEffect(() => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.play().catch(() => {});
//       } else {
//         audioRef.current.pause();
//       }
//     }
//   }, [isPlaying]);

//   useEffect(() => {
//     if (currentSong && audioRef.current) {
//       const audio = audioRef.current;
//       audio.src = currentSong;
//       audio.load();
//       if (isPlaying) {
//         audio.play().catch(() => {});
//       }
//       setProgress(0);
//     }
//   }, [currentSong]);

//  const playSong = (song, playlist = [], index = 0) => {
//     const songUrl = `${api.defaults.baseURL}${song.file_url}`;
//     setCurrentPlaylist(playlist);
//     setCurrentIndex(index);
//     setCurrentSong(songUrl);
//     setIsPlaying(true);

//     // Log listening if authenticated
//     if (isAuthenticated) {
//       api.post('/api/songs/log-listen', { song_id: song.id })
//         .catch(err => console.error('Error logging listen:', err));
//     }
//   };

//   const togglePlay = () => {
//     setIsPlaying(!isPlaying);
//   };

//   const nextSong = () => {
//     if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
//       playSong(currentPlaylist[currentIndex + 1], currentPlaylist, currentIndex + 1);
//     }
//   };

//   const prevSong = () => {
//     if (currentPlaylist.length > 0 && currentIndex > 0) {
//       playSong(currentPlaylist[currentIndex - 1], currentPlaylist, currentIndex - 1);
//     }
//   };

//   const handleSeek = (e) => {
//     const seekTo = (e.target.value / 100) * audioRef.current.duration;
//     audioRef.current.currentTime = seekTo;
//     setProgress(e.target.value);
//   };

//   const handleVolumeChange = (e) => {
//     setVolume(e.target.value);
//   };

//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.onended = nextSong;
//     }
//   }, [currentIndex, currentPlaylist]);

//   // Thêm resume function để resume playback
//   const resumePlay = () => {
//     if (audioRef.current && isPlaying) {
//       audioRef.current.play().catch(error => console.log('Playback resumption failed', error));
//     }
//   };

//   return (
//     <AudioContext.Provider value={{
//       currentSong,
//       isPlaying,
//       volume,
//       progress,
//       playSong,
//       togglePlay,
//       nextSong,
//       prevSong,
//       handleSeek,
//       handleVolumeChange,
//       currentPlaylist,
//       currentIndex,
//       resumePlay // Thêm resumePlay
//     }}>
//       {children}
//       <audio ref={audioRef} />
//     </AudioContext.Provider>
//   );
// };

// frontend/src/context/AudioContext.js (updated - add history save on play)
import React, { createContext, useState, useRef, useEffect } from 'react';
import api from '../api/api'; // Thêm import api

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
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

  const playSong = async (song, playlist = [], index = 0) => {
    const songUrl = `${api.defaults.baseURL}${song.file_url}`;
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true);

    // Lưu lịch sử nghe nhạc
    try {
      await api.post('/api/users/history', { song_id: song.id });
    } catch (err) {
      console.error('Error saving history:', err);
    }
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