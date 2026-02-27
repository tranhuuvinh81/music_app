// frontend/src/components/layout/AudioPlayer.js
import React, { useContext, useRef, useEffect, useState } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import { 
  FiSkipBack, FiSkipForward, FiVolume2, FiRepeat, 
  FiShuffle, FiHeart, FiList, FiMaximize2 // [NEW] Import Icons
} from "react-icons/fi";
// [NEW] Import Modal FullScreen
import FullScreenPlayer from "./FullScreenPlayer"; 

// hàm helper để format giây sang MM:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

const displayArtistNames = (artistsArray) => {
  if (!artistsArray || artistsArray.length === 0) {
    return "Unknown Artist";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
};

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    volume,
    handleVolumeChange,
    progress,
    handleSeek,
    currentTime,
    duration,
    currentPlaylist,
    currentIndex,
    repeatMode,
    toggleRepeat,
    shuffleMode,
    toggleShuffle,
  } = useContext(AudioContext);
   
  const volumeBarRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // State để bật/tắt FullScreen Modal
  const [isFullScreen, setIsFullScreen] = useState(false);

   
  useEffect(() => {
    const playerHeight = 80; 
    document.body.style.paddingBottom = `${playerHeight}px`;
    
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, []);
   
  if (!currentSong) return null;

  const currentSongObj = currentPlaylist[currentIndex] || {};
  const songTitle = currentSongObj.title || "Loading...";
  const songArtist = displayArtistNames(currentSongObj.artists);
  const imageSrc = currentSongObj.image_url
    ? `${api.defaults.baseURL}${currentSongObj.image_url}`
    : null;

  return (
    <>
      {/* THANH PHÁT NHẠC MINI (BOTTOM BAR) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white p-2 md:p-3 shadow-2xl z-50 backdrop-blur-lg bg-opacity-95 transition-all duration-300">
        
        {/* Thanh Progress chạy sát mép trên (Optional Design - giúp nhìn rõ tiến độ hơn) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 cursor-pointer group" onClick={(e) => {
             // Logic click seek trên thanh nhỏ này (nếu muốn)
             const rect = e.currentTarget.getBoundingClientRect();
             const percent = ((e.clientX - rect.left) / rect.width) * 100;
             handleSeek({ target: { value: percent } });
        }}>
            <div className="h-full bg-yellow-400" style={{ width: `${progress}%` }}></div>
            {/* Hover preview area could go here */}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto pt-1">
          
          {/* 1. Song Info (Left) */}
          <div className="hidden md:flex items-center space-x-3 w-1/4 cursor-pointer hover:opacity-80 transition" onClick={() => setIsFullScreen(true)}>
            {imageSrc ? (
              <img 
                src={getImageUrl(currentSongObj.image_url)} 
                alt={songTitle}
                className="w-12 h-12 rounded-md object-cover shadow-md border border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center shadow-md">
                <FiMaximize2 className="text-white" />
              </div>
            )}
            <div className="truncate min-w-0">
              <div className="text-sm font-bold truncate">{songTitle}</div>
              <div className="text-xs text-white text-opacity-80 truncate">{songArtist}</div>
            </div>
          </div>
  
          {/* 2. Player Controls (Center) */}
          <div className="flex flex-col items-center justify-center flex-1 w-full md:w-auto">
            <div className="flex items-center justify-center space-x-4 md:space-x-6 mb-1">
              <button
                onClick={toggleShuffle}
                className={`transition-all duration-300 ${shuffleMode ? "text-yellow-300" : "text-white/70 hover:text-white"}`}
                title="Trộn bài"
              >
                <FiShuffle size={18} />
              </button>
              
              <button
                onClick={prevSong}
                disabled={currentIndex <= 0}
                className={`transition-all duration-300 ${currentIndex <= 0 ? "text-white/30 cursor-not-allowed" : "text-white hover:scale-110"}`}
              >
                <FiSkipBack size={24} />
              </button>
  
              <button
                onClick={togglePlay}
                className="p-2 bg-white text-[#4A90E2] rounded-full hover:scale-110 shadow-lg transition-all duration-300"
              >
                {isPlaying ? (
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                ) : (
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                )}
              </button>
  
              <button
                onClick={nextSong}
                disabled={currentIndex >= currentPlaylist.length - 1}
                className={`transition-all duration-300 ${currentIndex >= currentPlaylist.length - 1 ? "text-white/30 cursor-not-allowed" : "text-white hover:scale-110"}`}
              >
                <FiSkipForward size={24} />
              </button>
              
              <button
                onClick={toggleRepeat}
                className={`transition-all duration-300 ${repeatMode ? "text-yellow-300" : "text-white/70 hover:text-white"}`}
                title="Lặp lại"
              >
                <FiRepeat size={18} />
              </button>

              {/* [NEW] Nút mở FullScreen trên Mobile (Chỉ hiện ở mobile) */}
              <button 
                onClick={() => setIsFullScreen(true)}
                className="md:hidden text-white/70 hover:text-white ml-2"
              >
                <FiMaximize2 size={18}/>
              </button>
            </div>
            
            {/* Progress Bar (Desktop view text) */}
            <div className="hidden md:flex items-center justify-center space-x-3 w-full max-w-md text-xs text-white/80">
               <span>{formatTime(currentTime)}</span>
               <div className="flex-1 h-1 bg-white/30 rounded-full relative group">
                  <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                  <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
               </div>
               <span>{formatTime(duration)}</span>
            </div>
          </div>
  
          {/* 3. Volume & Options (Right) */}
          <div className="hidden md:flex items-center space-x-4 w-1/4 justify-end">
            
            {/* [NEW] Nút mở Hàng đợi / Fullscreen */}
            <button 
                onClick={() => setIsFullScreen(true)} 
                className="text-white/70 hover:text-white transition"
                title="Danh sách phát & Lời bài hát"
            >
                <FiList size={20} />
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`${isFavorite ? "text-red-400" : "text-white/70 hover:text-white"}`}
            >
              <FiHeart size={20} className={isFavorite ? "fill-current" : ""} />
            </button>
            
            {/* Nút Mở rộng */}
            <button 
                onClick={() => setIsFullScreen(true)} 
                className="text-white/70 hover:text-white transition"
                title="Toàn màn hình"
            >
                <FiMaximize2 size={20} />
            </button>
            
            {/* Volume */}
            <div className="flex items-center space-x-2 group">
              <FiVolume2 className="text-white/70" />
              <div className="relative w-20 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${volume * 100}%` }}></div>
                <input 
                  ref={volumeBarRef} type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FULL SCREEN */}
      {/* Hiển thị đè lên tất cả khi isFullScreen = true */}
      {isFullScreen && (
        <FullScreenPlayer 
            onClose={() => setIsFullScreen(false)} 
        />
      )}
    </>
  );
}

export default AudioPlayer;
