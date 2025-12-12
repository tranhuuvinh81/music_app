// frontend/src/components/layout/AudioPlayer.js
import React, { useContext, useRef, useEffect, useState } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import { FiSkipBack, FiSkipForward, FiVolume2, FiRepeat, FiShuffle, FiHeart, FiMoreHorizontal } from "react-icons/fi";

// hàm helper để format giây sang MM:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  // Thêm '0' vào trước nếu số giây < 10 (ví dụ: 3:05 thay vì 3:5)
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
  
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  
  useEffect(() => {
    const playerHeight = 80; // Chiều cao của player
    document.body.style.paddingBottom = `${playerHeight}px`;
    
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, []);
  
  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white p-3 shadow-2xl z-50 backdrop-blur-lg bg-opacity-95">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 w-1/4">
          {imageSrc ? (
            <img 
              src={getImageUrl(currentSongObj.image_url)} 
              alt={songTitle}
              className="w-12 h-12 rounded-md object-cover shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}
          <div className="truncate">
            <div className="text-sm font-medium truncate">{songTitle}</div>
            <div className="text-xs text-white text-opacity-70 truncate">{songArtist}</div>
          </div>
        </div>

        {/* Player Controls - Đã điều chỉnh lại để căn giữa */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <button
              onClick={toggleShuffle}
              className={`p-1 rounded-full transition-all duration-300 ${
                shuffleMode
                  ? "text-white bg-white bg-opacity-20"
                  : "text-white text-opacity-70 hover:text-opacity-100"
              }`}
              title="Shuffle"
            >
              <FiShuffle className={shuffleMode ? "fill-current" : ""} />
            </button>
            
            <button
              onClick={prevSong}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentIndex <= 0
                  ? "text-white text-opacity-50 cursor-not-allowed"
                  : "text-white text-opacity-70 hover:text-opacity-100 hover:scale-110"
              }`}
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-300 hover:scale-110"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={nextSong}
              disabled={currentIndex >= currentPlaylist.length - 1}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentIndex >= currentPlaylist.length - 1
                  ? "text-white text-opacity-50 cursor-not-allowed"
                  : "text-white text-opacity-70 hover:text-opacity-100 hover:scale-110"
              }`}
            >
              <FiSkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleRepeat}
              className={`p-1 rounded-full transition-all duration-300 ${
                repeatMode
                  ? "text-white bg-white bg-opacity-20"
                  : "text-white text-opacity-70 hover:text-opacity-100"
              }`}
              title="Repeat"
            >
              <FiRepeat className={repeatMode ? "fill-current" : ""} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center space-x-2 w-full max-w-md">
            <span className="text-xs text-white text-opacity-70 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
              <input
                ref={progressBarRef}
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-white text-opacity-70 w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Options */}
        <div className="flex items-center space-x-3 w-1/4 justify-end">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-1 rounded-full transition-all duration-300 ${
              isFavorite
                ? "text-red-400"
                : "text-white text-opacity-70 hover:text-opacity-100"
            }`}
            title="Add to Favorites"
          >
            <FiHeart className={isFavorite ? "fill-current" : ""} />
          </button>
          
          <div className="relative" ref={optionsRef}>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiVolume2 className="text-white text-opacity-70" />
            <div className="relative w-20">
              <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <input
                ref={volumeBarRef}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;