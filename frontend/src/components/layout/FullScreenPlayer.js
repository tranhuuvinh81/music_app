// frontend/src/components/layout/FullScreenPlayer.js
import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import LyricsViewer from "../common/LyricsViewer";
import { FiHeart, FiMoreHorizontal, FiRepeat, FiShuffle, FiMinimize2, FiSkipBack, FiSkipForward, FiPlay, FiPause } from "react-icons/fi";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

const displayArtistNames = (artistsArray) => {
  if (!Array.isArray(artistsArray) || artistsArray.length === 0) {
    return "Nghệ sĩ không xác định";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
};

function FullScreenPlayer({ onClose }) {
  const {
    currentPlaylist, currentIndex, isPlaying, togglePlay, nextSong, prevSong,
    volume, handleVolumeChange, progress, handleSeek, currentTime, duration,
    repeatMode, toggleRepeat, shuffleMode, toggleShuffle
  } = useContext(AudioContext);

  const currentSong = currentPlaylist[currentIndex];

  // Background gradient dựa trên màu chủ đạo (tạm thời dùng màu cố định hoặc random)
  // Trong thực tế có thể dùng thư viện lấy màu từ ảnh
  const bgGradient = "bg-gradient-to-b from-gray-800 to-black";

  if (!currentSong) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${bgGradient} text-white transition-all duration-500`}>
      
      {/* HEADER: Nút đóng */}
      <div className="flex justify-between items-center p-6">
        <div className="text-sm text-gray-400 uppercase tracking-wider">Đang phát từ playlist</div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Thu nhỏ"
        >
          <FiMinimize2 size={24} />
        </button>
      </div>

      {/* MAIN BODY: Chia 2 cột */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* CỘT TRÁI: Ảnh bìa */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md aspect-square shadow-2xl rounded-xl overflow-hidden relative group">
             <img 
              src={getImageUrl(currentSong.image_url)} 
              alt={currentSong.title} 
              className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
          </div>
        </div>

        {/* CỘT PHẢI: Thông tin & Lyrics */}
        <div className="flex-1 flex flex-col p-8 md:pl-0 overflow-hidden">
          {/* Thông tin bài hát */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{currentSong.title}</h1>
            <p className="text-xl text-gray-300">{displayArtistNames(currentSong.artists)}</p>
          </div>

          {/* Khung Lyrics */}
          <div className="flex-1 bg-white/5 rounded-xl overflow-hidden relative">
             {/* Reuse LyricsViewer nhưng cần đảm bảo nó style tốt trên nền tối */}
             <div className="absolute inset-0 overflow-y-auto p-6 scrollbar-hide">
                <LyricsViewer />
             </div>
          </div>
        </div>
      </div>

      {/* FOOTER: Controls (Thanh điều khiển to) */}
      <div className="h-24 bg-black/30 backdrop-blur-md px-8 flex items-center justify-between">
        
        {/* Left: Info nhỏ (ẩn trên mobile) */}
        <div className="hidden md:flex flex-col w-1/4">
           <span className="font-bold truncate">{currentSong.title}</span>
           <span className="text-xs text-gray-400 truncate">{displayArtistNames(currentSong.artists)}</span>
        </div>

        {/* Center: Main Controls & Progress */}
        <div className="flex-1 max-w-2xl flex flex-col items-center">
           {/* Buttons */}
           <div className="flex items-center gap-6 mb-2">
              <button onClick={toggleShuffle} className={`${shuffleMode ? 'text-green-400' : 'text-gray-400'} hover:text-white`}><FiShuffle size={20}/></button>
              <button onClick={prevSong} className="text-gray-200 hover:text-white"><FiSkipBack size={28}/></button>
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <FiPause size={24} fill="black" /> : <FiPlay size={24} fill="black" className="ml-1"/>}
              </button>
              <button onClick={nextSong} className="text-gray-200 hover:text-white"><FiSkipForward size={28}/></button>
              <button onClick={toggleRepeat} className={`${repeatMode ? 'text-green-400' : 'text-gray-400'} hover:text-white`}><FiRepeat size={20}/></button>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full flex items-center gap-3 text-xs font-medium text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full relative group cursor-pointer">
                 <div 
                    className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-400" 
                    style={{ width: `${progress}%` }}
                 ></div>
                 <input 
                    type="range" min="0" max="100" value={progress} onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
              </div>
              <span>{formatTime(duration)}</span>
           </div>
        </div>

        {/* Right: Volume & Extra */}
        <div className="hidden md:flex w-1/4 justify-end items-center gap-4">
           <FiHeart className="text-gray-400 hover:text-white cursor-pointer" size={20}/>
           <div className="w-24 flex items-center gap-2 group">
              <div className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                 <div className="h-full bg-white" style={{ width: `${volume * 100}%` }}></div>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                className="w-20 h-1 opacity-0 absolute" 
              />
           </div>
        </div>

      </div>
    </div>
  );
}

export default FullScreenPlayer;