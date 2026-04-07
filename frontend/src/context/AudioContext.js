// frontend/src/context/AudioContext.js
import React, { createContext, useState, useRef, useEffect, useCallback } from "react";
import api from "../api/api";

export const AudioContext = createContext();

const getResourceUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

export const AudioProvider = ({ children }) => {
  // --- STATE REACT (Dùng để hiển thị giao diện) ---
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

  // --- REFS (VŨ KHÍ BÍ MẬT CHO IOS CHẠY NGẦM) ---
  // Lưu giá trị chạy ngầm mà không cần chờ React Render
  const audioRef = useRef(null);
  const isFirstLoad = useRef(true);
  const playlistRef = useRef([]);
  const indexRef = useRef(-1);

  // Đồng bộ State sang Refs liên tục
  useEffect(() => {
      playlistRef.current = currentPlaylist;
      indexRef.current = currentIndex;
  }, [currentPlaylist, currentIndex]);

  // --- 1. KHÔI PHỤC VÀ LƯU TRẠNG THÁI ---
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
                    if (parsed.currentTime) setCurrentTime(parsed.currentTime);
                }
            }
        } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (currentPlaylist.length > 0 && currentIndex !== -1) {
        localStorage.setItem('music_app_player_state', JSON.stringify({
            playlist: currentPlaylist,
            index: currentIndex,
            currentTime: currentTime > 0 ? currentTime : 0
        }));
    }
  }, [currentPlaylist, currentIndex, currentTime]); 

  useEffect(() => {
      localStorage.setItem('music_app_volume', volume);
      if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);


  // --- 2. CÁC HÀM XỬ LÝ ĐIỀU KHIỂN ---
  const playSong = useCallback((song, playlist = [], index = 0) => {
    isFirstLoad.current = false; 
    const songUrl = getResourceUrl(song.file_url);
    
    // Cập nhật Refs NGAY LẬP TỨC để tránh độ trễ
    playlistRef.current = playlist;
    indexRef.current = index;

    // THAO TÁC DOM TRỰC TIẾP (Không dùng hàm async/await ở đây)
    if (audioRef.current) {
        audioRef.current.src = songUrl;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log("Cảnh báo play:", e));
        }
    }

    // Cập nhật State cho giao diện (Bất đồng bộ)
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);
    setCurrentSong(songUrl);
    setCurrentLyricsUrl(song.lyrics_url || null);
    setIsPlaying(true); 

    try {
      api.post(`/api/songs/${song.id}/listen`).catch(()=>{});
      api.post("/api/users/history", { song_id: song.id }).catch(()=>{});
    } catch (err) {}
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  const nextSong = useCallback(() => {
    const pList = playlistRef.current;
    const idx = indexRef.current;
    if (pList.length > 0 && idx < pList.length - 1) {
      playSong(pList[idx + 1], pList, idx + 1);
    }
  }, [playSong]);

  const prevSong = useCallback(() => {
    const pList = playlistRef.current;
    const idx = indexRef.current;
    if (pList.length > 0 && idx > 0) {
      playSong(pList[idx - 1], pList, idx - 1);
    }
  }, [playSong]);

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


  // --- 3. BẮT SỰ KIỆN KẾT THÚC BÀI HÁT (CHỐNG CHẾT TRÊN IOS) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
        const pList = playlistRef.current;
        const idx = indexRef.current;

        if (pList.length > 0 && idx < pList.length - 1) {
            const nextIndex = idx + 1;
            const nextSongData = pList[nextIndex];
            const songUrl = getResourceUrl(nextSongData.file_url);

            // [QUAN TRỌNG NHẤT] Đổi src và play() NGAY LẬP TỨC trong cùng 1 tick
            audio.src = songUrl;
            audio.play().catch(e => console.log("Lỗi play auto next:", e));

            // Sau đó mới báo cho React từ từ cập nhật giao diện
            indexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            setCurrentSong(songUrl);
            setCurrentLyricsUrl(nextSongData.lyrics_url || null);

            api.post(`/api/songs/${nextSongData.id}/listen`).catch(()=>{});
            api.post("/api/users/history", { song_id: nextSongData.id }).catch(()=>{});
        } else {
            setIsPlaying(false); // Hết danh sách thì tắt
        }
    };

    // Chỉ gán sự kiện ĐÚNG 1 LẦN duy nhất khi khởi động app
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []); 


  // --- 4. XỬ LÝ TIME UPDATE & METADATA ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  // Chỉ dùng để nạp thông tin độ dài bài hát và F5 lần đầu
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      
      // Xử lý khi người dùng F5 tải lại trang Web
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]); 

  // Xử lý Play/Pause qua nút bấm vật lý
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
      <audio ref={audioRef} preload="auto" playsInline />
    </AudioContext.Provider>
  );
};