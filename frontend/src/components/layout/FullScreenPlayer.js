// frontend/src/components/layout/FullScreenPlayer.js
import React, { useContext, useState } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import LyricsViewer from "../common/LyricsViewer";
// [NEW] Import CommentSection
import CommentSection from "../ui/CommentSection"; 
import { 
  FiHeart, FiMoreHorizontal, FiRepeat, FiShuffle, 
  FiMinimize2, FiSkipBack, FiSkipForward, FiPlay, FiPause,
  FiMusic, FiMessageSquare // [NEW] Icon cho tabs
} from "react-icons/fi";

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

  // [NEW] State quản lý Tab: 'lyrics' hoặc 'comments'
  const [activeTab, setActiveTab] = useState('lyrics');

  const currentSong = currentPlaylist[currentIndex];
  const bgGradient = "bg-gradient-to-b from-gray-900 via-gray-800 to-black"; // [MODIFIED] Làm tối hơn chút để nổi bật nội dung

  if (!currentSong) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${bgGradient} text-white transition-all duration-500`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 h-16 shrink-0">
        <div className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
           <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
           Đang phát từ playlist
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          title="Thu nhỏ"
        >
          <FiMinimize2 size={24} />
        </button>
      </div>

      {/* MAIN BODY */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-4 md:pb-0">
        
        {/* CỘT TRÁI: Ảnh bìa (Giữ nguyên) */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-[40vh] md:min-h-auto">
          <div className="w-full max-w-sm md:max-w-md aspect-square shadow-2xl rounded-xl overflow-hidden relative group border border-white/10">
             <img 
              src={getImageUrl(currentSong.image_url)} 
              alt={currentSong.title} 
              className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
            {/* Hiệu ứng bóng mờ đĩa nhạc */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* CỘT PHẢI: Thông tin & Tabs (Lyrics/Comments) */}
        <div className="flex-1 flex flex-col px-6 md:pr-12 md:pl-0 overflow-hidden">
          
          {/* Thông tin bài hát */}
          <div className="mb-4 shrink-0 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 truncate leading-tight">{currentSong.title}</h1>
            <p className="text-lg md:text-xl text-gray-400 truncate">{displayArtistNames(currentSong.artists)}</p>
          </div>

          {/* [NEW] Tab Navigation */}
          <div className="flex items-center justify-center md:justify-start gap-6 mb-4 border-b border-white/10 shrink-0">
             <button 
                onClick={() => setActiveTab('lyrics')}
                className={`pb-2 px-2 flex items-center gap-2 text-sm font-bold uppercase transition-all border-b-2 ${
                    activeTab === 'lyrics' 
                    ? 'border-green-500 text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
             >
                <FiMusic /> Nghe
             </button>
             <button 
                onClick={() => setActiveTab('comments')}
                className={`pb-2 px-2 flex items-center gap-2 text-sm font-bold uppercase transition-all border-b-2 ${
                    activeTab === 'comments' 
                    ? 'border-green-500 text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
             >
                <FiMessageSquare /> Khen
             </button>
          </div>

          {/* [NEW] Content Container (Lyrics hoặc Comments) */}
          <div className="flex-1 relative bg-white/5 rounded-xl overflow-hidden border border-white/5 shadow-inner">
             
             {/* Tab 1: Lyrics */}
             {activeTab === 'lyrics' && (
                <div className="absolute inset-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <LyricsViewer />
                </div>
             )}

             {/* Tab 2: Comments */}
             {activeTab === 'comments' && (
                <div className="absolute inset-0 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300">
                    {/* Lưu ý: Component CommentSection của chúng ta có background trắng (bg-white).
                       Nên ở đây mình đặt nền container là bg-gray-50 để nó trông như một trang giấy/ứng dụng tách biệt.
                       Đồng thời truyền prop songId để nó fetch đúng comment.
                    */}
                    <div className="p-4 md:p-6 text-gray-800">
                        <CommentSection songId={currentSong.id} />
                    </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* FOOTER: Controls (Giữ nguyên logic) */}
      <div className="h-24 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 flex items-center justify-between shrink-0">
        
        {/* Left: Info nhỏ (ẩn trên mobile) */}
        <div className="hidden md:flex flex-col w-1/4">
           <span className="font-bold truncate text-gray-100">{currentSong.title}</span>
           <span className="text-xs text-gray-400 truncate">{displayArtistNames(currentSong.artists)}</span>
        </div>

        {/* Center: Main Controls */}
        <div className="flex-1 max-w-2xl flex flex-col items-center">
           <div className="flex items-center gap-6 mb-2">
              <button onClick={toggleShuffle} className={`${shuffleMode ? 'text-green-500' : 'text-gray-400'} hover:text-white transition`}><FiShuffle size={20}/></button>
              <button onClick={prevSong} className="text-gray-300 hover:text-white transition"><FiSkipBack size={26}/></button>
              
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all"
              >
                {isPlaying ? <FiPause size={24} fill="black" /> : <FiPlay size={24} fill="black" className="ml-1"/>}
              </button>
              
              <button onClick={nextSong} className="text-gray-300 hover:text-white transition"><FiSkipForward size={26}/></button>
              <button onClick={toggleRepeat} className={`${repeatMode ? 'text-green-500' : 'text-gray-400'} hover:text-white transition`}><FiRepeat size={20}/></button>
           </div>
           
           <div className="w-full flex items-center gap-3 text-xs font-medium text-gray-400">
              <span className="min-w-[40px] text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full relative group cursor-pointer">
                 <div 
                    className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500 transition-colors" 
                    style={{ width: `${progress}%` }}
                 ></div>
                 <input 
                    type="range" min="0" max="100" value={progress} onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
              </div>
              <span className="min-w-[40px]">{formatTime(duration)}</span>
           </div>
        </div>

        {/* Right: Volume */}
        <div className="hidden md:flex w-1/4 justify-end items-center gap-4">
           <button className="text-gray-400 hover:text-red-500 transition"><FiHeart size={20}/></button>
           <button className="text-gray-400 hover:text-white transition"><FiMoreHorizontal size={20}/></button>
           
           <div className="w-24 flex items-center gap-2 group ml-2">
              <div className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                 <div className="h-full bg-white group-hover:bg-green-500 transition-colors" style={{ width: `${volume * 100}%` }}></div>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                className="w-24 h-4 opacity-0 absolute cursor-pointer" 
              />
           </div>
        </div>
      </div>
    </div>
  );
}

export default FullScreenPlayer;