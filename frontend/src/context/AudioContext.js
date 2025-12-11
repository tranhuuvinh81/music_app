// // frontend/src/context/AudioContext.js
// import React, {
//   createContext,
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";
// import api from "../api/api";

// export const AudioContext = createContext();

// export const AudioProvider = ({ children }) => {
//   const [currentSong, setCurrentSong] = useState(null);
//   const [currentPlaylist, setCurrentPlaylist] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(-1);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const [currentLyricsUrl, setCurrentLyricsUrl] = useState(null);

//   const audioRef = useRef(null);

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
//           setCurrentTime(audio.currentTime);
//         }
//       };
//       audio.addEventListener("timeupdate", updateProgress);
//       return () => audio.removeEventListener("timeupdate", updateProgress);
//     }
//   }, []);

//   // Play/Pause
//   useEffect(() => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.play().catch(() => {});
//       } else {
//         audioRef.current.pause();
//       }
//     }
//   }, [isPlaying]);

//   // Tải bài hát mới và lấy duration
//   useEffect(() => {
//     if (currentSong && audioRef.current) {
//       const audio = audioRef.current;
//       audio.src = currentSong;
//       audio.load();
//       if (isPlaying) {
//         audio.play().catch(() => {});
//       }
//       setProgress(0);
//       setCurrentTime(0);

//       const setAudioDuration = () => {
//         setDuration(audio.duration || 0);
//       };
//       audio.addEventListener("loadedmetadata", setAudioDuration);

//       return () => {
//         audio.removeEventListener("loadedmetadata", setAudioDuration);
//       };
//     }
//   }, [currentSong]);

//   // --- BỌC CÁC HÀM TRONG useCallback ---

//   const playSong = useCallback(async (song, playlist = [], index = 0) => {
//     console.log("Đang phát:", song);
//     setCurrentLyricsUrl(song.lyrics_url || null);

//     const songUrl = `${api.defaults.baseURL}${song.file_url}`;
//     setCurrentPlaylist(playlist);
//     setCurrentIndex(index);
//     setCurrentSong(songUrl);
//     setIsPlaying(true);

//     try {
//       // Gọi API để tăng lượt nghe, không cần await
//       api.post(`/api/songs/${song.id}/listen`); 
//     } catch (err) {
//       // Không cần làm gì, lỗi này không nên dừng việc phát nhạc
//       console.error("Lỗi khi tăng lượt nghe:", err);
//     }

//     try {
//       await api.post("/api/users/history", { song_id: song.id });
//     } catch (err) {
//       console.error("Error saving history:", err);
//     }
//   }, []);

//   const togglePlay = useCallback(() => {
//     setIsPlaying((prevIsPlaying) => !prevIsPlaying);
//   }, []);

//   // KHÔI PHỤC LOGIC VÀ BỌC useCallback
//   const nextSong = useCallback(() => {
//     if (
//       currentPlaylist.length > 0 &&
//       currentIndex < currentPlaylist.length - 1
//     ) {
//       playSong(
//         currentPlaylist[currentIndex + 1],
//         currentPlaylist,
//         currentIndex + 1
//       );
//     }
//   }, [currentPlaylist, currentIndex, playSong]);

//   // KHÔI PHỤC LOGIC VÀ BỌC useCallback
//   const prevSong = useCallback(() => {
//     if (currentPlaylist.length > 0 && currentIndex > 0) {
//       playSong(
//         currentPlaylist[currentIndex - 1],
//         currentPlaylist,
//         currentIndex - 1
//       );
//     }
//   }, [currentPlaylist, currentIndex, playSong]);

//   const handleSeek = useCallback((e) => {
//     if (audioRef.current && audioRef.current.duration) {
//       const seekTo = (e.target.value / 100) * audioRef.current.duration;
//       audioRef.current.currentTime = seekTo;
//       setProgress(e.target.value);
//       setCurrentTime(seekTo);
//     }
//   }, []);

//   const handleVolumeChange = useCallback((e) => {
//     setVolume(e.target.value);
//     if (audioRef.current) {
//       audioRef.current.volume = e.target.value;
//     }
//   }, []);

//   // Cập nhật useEffect 'onended'
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (audio) {
//       audio.onended = nextSong; // Gán hàm nextSong đã được useCallback
//     }
//     return () => {
//       if (audio) {
//         audio.onended = null;
//       }
//     };
//   }, [nextSong]); // Chỉ phụ thuộc vào nextSong

//   return (
//     <AudioContext.Provider
//       value={{
//         currentSong,
//         isPlaying,
//         volume,
//         progress,
//         currentTime,
//         duration,
//         currentLyricsUrl,
//         playSong,
//         togglePlay,
//         nextSong,
//         prevSong,
//         handleSeek,
//         handleVolumeChange,
//         currentPlaylist,
//         currentIndex,
//       }}
//     >
//       {children}
//       <audio ref={audioRef} />
//     </AudioContext.Provider>
//   );
// };

// frontend/src/context/AudioContext.js
import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import api from "../api/api";

export const AudioContext = createContext();

// [FIX] Hàm helper để xác định URL (Cloudinary hay Local)
const getResourceUrl = (url) => {
  if (!url) return '';
  // Nếu là link online (Cloudinary) thì giữ nguyên
  if (url.startsWith('http')) return url;
  // Nếu là link local thì nối thêm base URL của server
  return `${api.defaults.baseURL}${url}`;
};

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [currentLyricsUrl, setCurrentLyricsUrl] = useState(null);

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
          setCurrentTime(audio.currentTime);
        }
      };
      audio.addEventListener("timeupdate", updateProgress);
      return () => audio.removeEventListener("timeupdate", updateProgress);
    }
  }, []);

  // Play/Pause
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
      audio.addEventListener("loadedmetadata", setAudioDuration);

      return () => {
        audio.removeEventListener("loadedmetadata", setAudioDuration);
      };
    }
  }, [currentSong]);

  // --- BỌC CÁC HÀM TRONG useCallback ---

  const playSong = useCallback(async (song, playlist = [], index = 0) => {
    console.log("Đang phát:", song);
    
    // [FIX] Xử lý URL cho Lyrics (nếu cần fetch)
    setCurrentLyricsUrl(song.lyrics_url || null);

    // [FIX] SỬ DỤNG HÀM HELPER ĐỂ LẤY URL ĐÚNG
    const songUrl = getResourceUrl(song.file_url);
    
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true);

    try {
      // Gọi API để tăng lượt nghe, không cần await
      api.post(`/api/songs/${song.id}/listen`); 
    } catch (err) {
      // Không cần làm gì, lỗi này không nên dừng việc phát nhạc
      console.error("Lỗi khi tăng lượt nghe:", err);
    }

    try {
      await api.post("/api/users/history", { song_id: song.id });
    } catch (err) {
      console.error("Error saving history:", err);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  }, []);

  // KHÔI PHỤC LOGIC VÀ BỌC useCallback
  const nextSong = useCallback(() => {
    if (
      currentPlaylist.length > 0 &&
      currentIndex < currentPlaylist.length - 1
    ) {
      playSong(
        currentPlaylist[currentIndex + 1],
        currentPlaylist,
        currentIndex + 1
      );
    }
  }, [currentPlaylist, currentIndex, playSong]);

  // KHÔI PHỤC LOGIC VÀ BỌC useCallback
  const prevSong = useCallback(() => {
    if (currentPlaylist.length > 0 && currentIndex > 0) {
      playSong(
        currentPlaylist[currentIndex - 1],
        currentPlaylist,
        currentIndex - 1
      );
    }
  }, [currentPlaylist, currentIndex, playSong]);

  const handleSeek = useCallback((e) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTo = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTo;
      setProgress(e.target.value);
      setCurrentTime(seekTo);
    }
  }, []);

  const handleVolumeChange = useCallback((e) => {
    setVolume(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  }, []);

  const updatePlaylist = (newPlaylist) => {
    // 1. Cập nhật danh sách mới
    setCurrentPlaylist(newPlaylist);
    
    // 2. (Quan trọng) Tìm lại index của bài hát đang phát trong danh sách mới
    // để tránh việc nhạc bị ngắt hoặc nhảy sai bài
    if (currentSong) {
        const newIndex = newPlaylist.findIndex(s => s.id === currentSong.id); // Giả sử so sánh bằng ID
        if (newIndex !== -1) {
            setCurrentIndex(newIndex);
        }
    }
};

  // Cập nhật useEffect 'onended'
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = nextSong; // Gán hàm nextSong đã được useCallback
    }
    return () => {
      if (audio) {
        audio.onended = null;
      }
    };
  }, [nextSong]); // Chỉ phụ thuộc vào nextSong

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        volume,
        progress,
        currentTime,
        duration,
        currentLyricsUrl,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        handleSeek,
        handleVolumeChange,
        updatePlaylist,
        currentPlaylist,
        currentIndex,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};