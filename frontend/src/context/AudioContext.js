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

// Hàm helper để xác định URL
const getResourceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

export const AudioProvider = ({ children }) => {
  // --- KHỞI TẠO STATE TỪ LOCAL STORAGE ---
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

  // --- CÁC HÀM XỬ LÝ ĐIỀU KHIỂN ---
  // (Đưa lên trước để dùng trong Media Session)

  const playSong = useCallback(async (song, playlist = [], index = 0) => {
    isFirstLoad.current = false; 
    setCurrentLyricsUrl(song.lyrics_url || null);
    const songUrl = getResourceUrl(song.file_url);
    
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true); 

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
  }, [nextSong]);


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

  // Khi currentSong thay đổi
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      
      if (audio.src !== currentSong) {
          audio.src = currentSong;
          audio.load();
      }

      const handleLoadedMetadata = () => {
         setDuration(audio.duration || 0);
         
         if (isFirstLoad.current && currentTime > 0) {
             audio.currentTime = currentTime;
             isFirstLoad.current = false; 
         }

         if (isPlaying) {
             audio.play().catch(e => console.log("Autoplay prevented:", e));
         }
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]); 

  // Xử lý Play/Pause riêng biệt
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);


  // --- [NEW] TÍCH HỢP MEDIA SESSION API CHO MÀN HÌNH KHÓA ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentPlaylist.length > 0 && currentIndex !== -1) {
      
      const activeSongData = currentPlaylist[currentIndex];
      
      // 1. Cập nhật thông tin hiển thị lên Lock Screen
      if (activeSongData) {
        
        // Trích xuất tên nghệ sĩ (nếu là dạng object thì map ra chữ)
        let artistNames = "Nghệ sĩ chưa xác định";
        if (activeSongData.artists && Array.isArray(activeSongData.artists)) {
            artistNames = activeSongData.artists.map(a => a.name).join(", ");
        } else if (typeof activeSongData.artist === 'string') {
            artistNames = activeSongData.artist;
        }

        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: activeSongData.title || 'Đang tải...',
          artist: artistNames,
          album: activeSongData.album || 'Music App',
          artwork: [
            { 
              src: activeSongData.image_url ? getResourceUrl(activeSongData.image_url) : 'https://via.placeholder.com/512', 
              sizes: '512x512', 
              type: 'image/jpeg' 
            },
            { 
              src: activeSongData.image_url ? getResourceUrl(activeSongData.image_url) : 'https://via.placeholder.com/256', 
              sizes: '256x256', 
              type: 'image/jpeg' 
            }
          ]
        });
      }

      // 2. Gắn sự kiện cho các nút điều khiển trên tai nghe/Lock Screen
      
      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
      });

      // Chỉ hiển thị nút Prev nếu không phải bài đầu tiên
      if (currentIndex > 0) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          prevSong();
        });
      } else {
        navigator.mediaSession.setActionHandler('previoustrack', null); // Disable nút lùi
      }

      // Chỉ hiển thị nút Next nếu không phải bài cuối cùng
      if (currentIndex < currentPlaylist.length - 1) {
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextSong();
        });
      } else {
        navigator.mediaSession.setActionHandler('nexttrack', null); // Disable nút tới
      }
      
      // (Tùy chọn) Seek tới một khoảng thời gian cụ thể trên Lock Screen (hỗ trợ iOS 15+)
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.seekTime) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }
  }, [currentPlaylist, currentIndex, isPlaying, nextSong, prevSong]); 
  // -----------------------------------------------------------


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