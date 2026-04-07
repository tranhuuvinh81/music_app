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

const getResourceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [volume, setVolume] = useState(() => {
     const savedVol = localStorage.getItem('music_app_volume');
     return savedVol ? parseFloat(savedVol) : 1;
  });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricsUrl, setCurrentLyricsUrl] = useState(null);

  const isFirstLoad = useRef(true);
  const audioRef = useRef(null);

  // --- 1. KHÔI PHỤC TRẠNG THÁI ---
  useEffect(() => {
    const savedState = localStorage.getItem('music_app_player_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.playlist && parsed.playlist.length > 0 && parsed.index !== -1) {
                setCurrentPlaylist(parsed.playlist);
                setCurrentIndex(parsed.index);
                
                const song = parsed.playlist[parsed.index];
                if (song) {
                    const songUrl = getResourceUrl(song.file_url);
                    setCurrentSong(songUrl);
                    setCurrentLyricsUrl(song.lyrics_url || null);
                    if (parsed.currentTime) {
                        setCurrentTime(parsed.currentTime);
                    }
                }
            }
        } catch (e) {
            console.error("Lỗi khôi phục Player:", e);
        }
    }
  }, []);

  // --- 2. LƯU TRẠNG THÁI ---
  useEffect(() => {
    if (currentPlaylist.length > 0 && currentIndex !== -1) {
        const stateToSave = {
            playlist: currentPlaylist,
            index: currentIndex,
            currentTime: currentTime > 0 ? currentTime : 0
        };
        localStorage.setItem('music_app_player_state', JSON.stringify(stateToSave));
    }
  }, [currentPlaylist, currentIndex, currentTime]); 

  useEffect(() => {
      localStorage.setItem('music_app_volume', volume);
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
  }, [volume]);

  // --- 3. CÁC HÀM XỬ LÝ ĐIỀU KHIỂN ---
  const playSong = useCallback(async (song, playlist = [], index = 0) => {
    isFirstLoad.current = false; 
    setCurrentLyricsUrl(song.lyrics_url || null);
    const songUrl = getResourceUrl(song.file_url);
    
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setIsPlaying(true); 

    // [QUAN TRỌNG NHẤT DÀNH CHO IOS]: Can thiệp DOM đồng bộ
    // Ép Audio đổi nguồn và chạy ngay lập tức mà không chờ React Render
    // Giúp giữ được phiên (session) chạy ngầm trên Safari
    if (audioRef.current) {
        audioRef.current.pause(); // Dừng bài cũ
        audioRef.current.src = songUrl; // Nạp link bài mới
        audioRef.current.load(); // Ép trình duyệt tải
        const playPromise = audioRef.current.play(); // Kích hoạt ngay
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log("Cảnh báo nền:", e));
        }
    }

    try {
      api.post(`/api/songs/${song.id}/listen`).catch(()=>{});
      api.post("/api/users/history", { song_id: song.id }).catch(()=>{});
    } catch (err) {}
  }, []);

  const togglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);

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
    if (audioRef.current) audioRef.current.volume = e.target.value;
  }, []);

  const updatePlaylist = useCallback((newPlaylist) => {
    setCurrentPlaylist(newPlaylist);
    if (currentSong) {
        const currentIndexInNew = newPlaylist.findIndex(s => getResourceUrl(s.file_url) === currentSong);
        if (currentIndexInNew !== -1) setCurrentIndex(currentIndexInNew);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.onended = nextSong; 
    return () => { if (audio) audio.onended = null; };
  }, [nextSong]);

  // --- 4. XỬ LÝ AUDIO ELEMENT ---
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

  // Chỉ lấy thông tin Meta (Đã gỡ bỏ logic play/load ở đây để nhường cho playSong)
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      
      // Xử lý riêng cho lần F5 tải lại trang
      if (isFirstLoad.current && audio.src !== currentSong) {
          audio.src = currentSong;
          audio.load();
      }

      const handleLoadedMetadata = () => {
         setDuration(audio.duration || 0);
         if (isFirstLoad.current && currentTime > 0) {
             audio.currentTime = currentTime;
             isFirstLoad.current = false; 
         }
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [currentSong]); 

  // Xử lý Play/Pause riêng biệt
  useEffect(() => {
    if (audioRef.current && currentSong && !isFirstLoad.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);


  // --- 5. TÍCH HỢP MEDIA SESSION API CHO MÀN HÌNH KHÓA ---
  useEffect(() => {
    if ('mediaSession' in navigator && currentPlaylist.length > 0 && currentIndex !== -1) {
      const activeSongData = currentPlaylist[currentIndex];
      
      if (activeSongData) {
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
            { src: activeSongData.image_url ? getResourceUrl(activeSongData.image_url) : 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      }

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));

      if (currentIndex > 0) {
        navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
      } else {
        navigator.mediaSession.setActionHandler('previoustrack', null);
      }

      if (currentIndex < currentPlaylist.length - 1) {
        navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
      } else {
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
      
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.seekTime) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }
  }, [currentPlaylist, currentIndex, isPlaying, nextSong, prevSong]); 

  return (
    <AudioContext.Provider
      value={{
        currentSong, currentPlaylist, currentIndex, isPlaying, volume, progress,
        currentTime, duration, currentLyricsUrl, playSong, togglePlay, nextSong,
        prevSong, handleSeek, handleVolumeChange, updatePlaylist,
      }}
    >
      {children}
      {/* Quan trọng: Thêm thuộc tính playsInline để iOS không bung video full màn hình (nếu có) */}
      <audio ref={audioRef} preload="auto" playsInline />
    </AudioContext.Provider>
  );
};