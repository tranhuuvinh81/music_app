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

// [FIX] Hàm helper để xác định URL
const getResourceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

export const AudioProvider = ({ children }) => {
  // --- KHỞI TẠO STATE TỪ LOCAL STORAGE (NẾU CÓ) ---
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false); // Mặc định là false khi F5
  const [volume, setVolume] = useState(() => {
     const savedVol = localStorage.getItem('music_app_volume');
     return savedVol ? parseFloat(savedVol) : 1;
  });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricsUrl, setCurrentLyricsUrl] = useState(null);

  // Biến cờ để đánh dấu lần load đầu tiên
  const isFirstLoad = useRef(true);
  const audioRef = useRef(null);

  // --- 1. KHÔI PHỤC TRẠNG THÁI KHI APP MỞ LÊN ---
  useEffect(() => {
    const savedState = localStorage.getItem('music_app_player_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.playlist && parsed.playlist.length > 0 && parsed.index !== -1) {
                console.log("🔄 Khôi phục trạng thái Player:", parsed);
                
                setCurrentPlaylist(parsed.playlist);
                setCurrentIndex(parsed.index);
                
                // Khôi phục bài hát
                const song = parsed.playlist[parsed.index];
                if (song) {
                    const songUrl = getResourceUrl(song.file_url);
                    setCurrentSong(songUrl);
                    setCurrentLyricsUrl(song.lyrics_url || null);
                    
                    // Khôi phục thời gian (quan trọng)
                    if (parsed.currentTime) {
                        setCurrentTime(parsed.currentTime);
                        // Lưu ý: Việc set audio.currentTime sẽ được xử lý ở useEffect bên dưới khi audio src đã load
                    }
                }
            }
        } catch (e) {
            console.error("Lỗi khôi phục Player:", e);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. LƯU TRẠNG THÁI MỖI KHI CÓ THAY ĐỔI ---
  useEffect(() => {
    // Chỉ lưu khi đã có bài hát hợp lệ
    if (currentPlaylist.length > 0 && currentIndex !== -1) {
        const stateToSave = {
            playlist: currentPlaylist,
            index: currentIndex,
            currentTime: currentTime > 0 ? currentTime : 0
        };
        localStorage.setItem('music_app_player_state', JSON.stringify(stateToSave));
    }
  }, [currentPlaylist, currentIndex, currentTime]); 

  // Lưu Volume riêng
  useEffect(() => {
      localStorage.setItem('music_app_volume', volume);
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
  }, [volume]);

  // --- XỬ LÝ AUDIO ELEMENT ---
  
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
      audio.addEventListener("timeupdate", updateProgress);
      return () => audio.removeEventListener("timeupdate", updateProgress);
    }
  }, []);

  // Khi currentSong thay đổi (người dùng chọn bài mới HOẶC khôi phục từ F5)
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      
      // Nếu src khác nhau mới gán lại để tránh reload không cần thiết
      if (audio.src !== currentSong) {
          audio.src = currentSong;
          audio.load();
      }

      // [QUAN TRỌNG] Xử lý logic khôi phục thời gian (Seek)
      const handleLoadedMetadata = () => {
         setDuration(audio.duration || 0);
         
         // Nếu là lần đầu load (F5) và có currentTime đã lưu -> Tua đến đó
         if (isFirstLoad.current && currentTime > 0) {
             audio.currentTime = currentTime;
             isFirstLoad.current = false; // Đánh dấu đã xong lần đầu
         } else if (!isFirstLoad.current) {
             // Nếu không phải F5 (chuyển bài bình thường) -> Reset về 0
             // audio.currentTime = 0; // (Thường audio.load() đã tự reset về 0)
         }

         // Nếu đang play (hoặc bấm play bài mới) -> Play
         // Nếu F5 (isPlaying = false) -> Không Play
         if (isPlaying) {
             audio.play().catch(e => console.log("Autoplay prevented:", e));
         }
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
    // [FIX] Thêm dòng này để Vercel bỏ qua lỗi thiếu dependency (isPlaying, currentTime...)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]); 

  // Xử lý Play/Pause riêng biệt
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Lỗi này thường do trình duyệt chặn autoplay khi chưa có tương tác
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);


  // --- CÁC HÀM XỬ LÝ ---

  const playSong = useCallback(async (song, playlist = [], index = 0) => {
    isFirstLoad.current = false; // Khi người dùng chủ động chọn bài, không còn là "First Load" nữa
    
    // [FIX] Cập nhật URL Lyrics
    setCurrentLyricsUrl(song.lyrics_url || null);
    const songUrl = getResourceUrl(song.file_url);
    
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true); // Luôn play khi chọn bài mới

    try {
      api.post(`/api/songs/${song.id}/listen`).catch(err => console.error("Lỗi count listen:", err));
      api.post("/api/users/history", { song_id: song.id }).catch(err => console.error("Lỗi history:", err));
    } catch (err) {}
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const nextSong = useCallback(() => {
    if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
      playSong(currentPlaylist[currentIndex + 1], currentPlaylist, currentIndex + 1);
    }
  }, [currentPlaylist, currentIndex, playSong]);

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
  }, []);

  const handleVolumeChange = useCallback((e) => {
    setVolume(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  }, []);

  const updatePlaylist = useCallback((newPlaylist) => {
    setCurrentPlaylist(newPlaylist);
    if (currentSong) {
        // Tìm lại index trong playlist mới dựa trên URL file
        const currentIndexInNew = newPlaylist.findIndex(s => getResourceUrl(s.file_url) === currentSong);
        if (currentIndexInNew !== -1) {
            setCurrentIndex(currentIndexInNew);
        }
    }
  }, [currentSong]);

  // Xử lý sự kiện kết thúc bài hát
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = nextSong; 
    }
    return () => {
      if (audio) audio.onended = null;
    };
    // [FIX] Thêm dòng này để Vercel bỏ qua lỗi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSong]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        currentPlaylist,
        currentIndex,
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
      }}
    >
      {children}
      <audio ref={audioRef} />
    </AudioContext.Provider>
  );
};