import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import LyricsViewer from "../common/LyricsViewer";
import CommentSection from "../ui/CommentSection"; 
import { 
  FiHeart, FiMoreHorizontal, FiRepeat, FiShuffle, 
  FiMinimize2, FiSkipBack, FiSkipForward, FiPlay, FiPause,
  FiMusic, FiMessageSquare, FiList, FiMenu, FiClock, FiChevronLeft
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
    repeatMode, toggleRepeat, shuffleMode, toggleShuffle,
    playSong, updatePlaylist
  } = useContext(AudioContext);

  const [activeTab, setActiveTab] = useState('lyrics');
  const [isMobileTabOpen, setIsMobileTabOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const queueScrollRef = useRef(null);

  const currentSong = currentPlaylist[currentIndex];
  // Gradient nền: Mobile dùng gradient đậm hơn chút để dễ đọc chữ
  const bgGradient = "bg-gradient-to-b from-gray-900 via-gray-800 to-black";

  // Auto scroll
  useEffect(() => {
    if (activeTab === 'queue' && queueScrollRef.current) {
        queueScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTab, currentIndex]);

  const openMobileTab = (tab) => {
    setActiveTab(tab);
    setIsMobileTabOpen(true);
  };

  // --- LOGIC KÉO THẢ ---
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    // Lưu ý: Touch devices không support HTML5 Drag API mặc định
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;
    if (dropIndex <= currentIndex || draggedItemIndex <= currentIndex) return;

    const newPlaylist = [...currentPlaylist];
    const draggedItem = newPlaylist[draggedItemIndex];
    
    newPlaylist.splice(draggedItemIndex, 1);
    newPlaylist.splice(dropIndex, 0, draggedItem);

    if (updatePlaylist) updatePlaylist(newPlaylist);
    setDraggedItemIndex(null);
  };

  if (!currentSong) return null;

  return (
    <div className={`font-genos fixed inset-0 z-[100] flex flex-col ${bgGradient} text-white transition-all duration-500`}>
      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex flex-col h-full relative">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="truncate max-w-[220px]">Dang phat</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white">
            <FiMinimize2 size={22} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-4">
            <div className="w-[78vw] max-w-[320px] aspect-square shadow-2xl rounded-3xl overflow-hidden relative border border-white/10 mx-auto">
              <img
                src={getImageUrl(currentSong.image_url)}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent pointer-events-none"></div>
            </div>

            <div className="pt-4 text-center">
              <h1 className="text-2xl font-bold leading-tight line-clamp-2">{currentSong.title}</h1>
              <p className="text-sm text-gray-400 truncate mt-1">{displayArtistNames(currentSong.artists)}</p>
            </div>

            <div className="pt-4">
              <div className="w-full flex items-center gap-3 text-[11px] font-medium text-gray-400">
                <span className="min-w-[38px] text-right">{formatTime(currentTime)}</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full relative cursor-pointer">
                  <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                  <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute -top-2 left-0 w-full h-6 opacity-0 cursor-pointer" />
                </div>
                <span className="min-w-[38px]">{formatTime(duration)}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={prevSong} className="text-gray-200 p-2"><FiSkipBack size={28} /></button>
                <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                  {isPlaying ? <FiPause size={28} fill="black" /> : <FiPlay size={28} fill="black" className="ml-1" />}
                </button>
                <button onClick={nextSong} className="text-gray-200 p-2"><FiSkipForward size={28} /></button>
              </div>

              <div className="mt-3 flex items-center justify-between text-gray-400">
                <button onClick={toggleShuffle} className={`${shuffleMode ? 'text-green-500' : 'text-gray-400'} p-2`}><FiShuffle size={18} /></button>
                <button onClick={toggleRepeat} className={`${repeatMode ? 'text-green-500' : 'text-gray-400'} p-2`}><FiRepeat size={18} /></button>
                <button className="p-2 hover:text-red-400 transition-colors"><FiHeart size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><FiMoreHorizontal size={18} /></button>
              </div>
            </div>
          </div>

          <div className="px-5 pt-3 pb-4">
            <div className="grid grid-cols-3 gap-2 bg-white/10 rounded-full p-1">
              {['lyrics', 'comments', 'queue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => openMobileTab(tab)}
                  className="py-2 text-[11px] font-bold uppercase rounded-full transition-all text-gray-200 hover:text-white"
                >
                  {tab === 'lyrics' && 'Nghe'}
                  {tab === 'comments' && 'Khen'}
                  {tab === 'queue' && 'Danh sach'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isMobileTabOpen && (
        <div className="md:hidden absolute inset-0 z-30 bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <button
              onClick={() => setIsMobileTabOpen(false)}
              className="flex items-center gap-2 text-gray-200 hover:text-white"
            >
              <FiChevronLeft size={22} />
              <span className="text-sm font-medium">Quay lai</span>
            </button>
            <span className="text-[11px] uppercase tracking-wider text-gray-400">
              {activeTab === 'lyrics' ? 'Nghe' : activeTab === 'comments' ? 'Khen' : 'Danh sach'}
            </span>
            <div className="w-6"></div>
          </div>

          <div className="px-4 pb-2">
            <div className="grid grid-cols-3 gap-2 bg-white/10 rounded-full p-1">
              {['lyrics', 'comments', 'queue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-[11px] font-bold uppercase rounded-full transition-all ${
                    activeTab === tab ? 'bg-white text-black' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {tab === 'lyrics' && 'Nghe'}
                  {tab === 'comments' && 'Khen'}
                  {tab === 'queue' && 'Danh sach'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {activeTab === 'lyrics' && (
              <div className="flex-1 min-h-0 overflow-hidden px-4 pb-6 pt-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <LyricsViewer />
              </div>
            )}

            {activeTab === 'queue' && (
              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6 pt-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <div className="space-y-1">
                  {currentPlaylist.map((song, index) => {
                    if (index >= currentIndex) return null;
                    return (
                      <div key={song.id || index} className="flex items-center p-2 rounded-lg opacity-50 grayscale" onClick={() => playSong(song, currentPlaylist, index)}>
                        <div className="mr-3 text-gray-600"><FiClock size={16} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 truncate">{song.title}</p>
                          <p className="text-[10px] text-gray-600 truncate">{displayArtistNames(song.artists)}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={queueScrollRef} className="sticky top-0 z-10 bg-black/60 backdrop-blur-md border-y border-green-500/30 my-2">
                    <div className="flex items-center p-3 rounded-lg bg-green-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-green-400 truncate">{currentSong.title}</p>
                        <p className="text-xs text-green-300/70 truncate">{displayArtistNames(currentSong.artists)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">Tiep theo</p>
                    {currentPlaylist.length > currentIndex + 1 ? (
                      currentPlaylist.map((song, index) => {
                        if (index <= currentIndex) return null;
                        return (
                          <div
                            key={song.id || index}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDrop={(e) => onDrop(e, index)}
                            className={`flex items-center p-2 rounded-lg group active:bg-white/10 transition-colors border border-transparent mb-1 cursor-pointer ${draggedItemIndex === index ? 'opacity-50 border-dashed border-gray-400' : ''}`}
                            onClick={() => playSong(song, currentPlaylist, index)}
                          >
                            <div className="hidden md:block mr-3 text-gray-600 cursor-grab hover:text-white group-hover:text-gray-400" onClick={(e) => e.stopPropagation()}>
                              <FiMenu size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-300 truncate">{song.title}</p>
                              <p className="text-[10px] text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                            </div>
                            <button className="text-gray-500 p-2 hover:text-green-400 transition">
                              <FiPlay size={16} />
                            </button>
                          </div>
                        );
                      })
                    ) : <p className="text-center text-gray-600 text-xs italic py-4">Het bai...</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex-1 min-h-0 overflow-hidden bg-white/95 scrollbar-thin scrollbar-thumb-gray-300">
                <div className="h-full min-h-0 p-4 text-gray-800">
                  <CommentSection songId={currentSong.id} fullHeight />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex md:flex-col h-full">
      
      {/* HEADER: Gọn gàng hơn trên mobile */}
      <div className="flex justify-between items-center px-4 py-3 md:p-6 h-14 md:h-16 shrink-0">
        <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
           <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
           <span className="truncate max-w-[200px]">Đang phát từ playlist</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white">
            <FiMinimize2 size={24} />
        </button>
      </div>

      {/* MAIN BODY: Flex Column trên Mobile, Row trên Desktop */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden pb-2 md:pb-0">
        
        {/* --- CỘT TRÁI: ẢNH BÌA --- */}
        {/* Mobile: Chiều cao giới hạn (35vh). Desktop: Full height, flex-1 */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-[40vh] md:min-h-auto">
          <div className="w-full max-w-sm md:max-w-md aspect-square shadow-2xl rounded-xl overflow-hidden relative group border border-white/10">
             <img 
              src={getImageUrl(currentSong.image_url)} 
              alt={currentSong.title} 
              className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN & TABS --- */}
        <div className="flex-1 min-h-0 flex flex-col px-4 md:px-6 md:pr-12 md:pl-0 overflow-hidden">
          
          {/* Thông tin bài hát (Thu nhỏ font trên mobile) */}
          <div className="mb-2 md:mb-4 shrink-0 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 truncate leading-tight">{currentSong.title}</h1>
            <p className="text-sm md:text-xl text-gray-400 truncate">{displayArtistNames(currentSong.artists)}</p>
          </div>

          {/* Tab Navigation (Dàn đều trên mobile) */}
          <div className="flex items-center justify-between md:justify-start gap-2 md:gap-6 mb-2 md:mb-4 border-b border-white/10 shrink-0">
             {['lyrics', 'comments','queue' ].map((tab) => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 md:flex-none pb-2 px-1 flex justify-center items-center gap-2 text-xs md:text-sm font-bold uppercase transition-all border-b-2 ${
                        activeTab === tab ? 'border-green-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                 >
                    {tab === 'lyrics' && <><FiMusic /> <span className="hidden sm:inline">Nghe</span></>}
                    {tab === 'comments' && <><FiMessageSquare /> <span className="hidden sm:inline">Khen</span></>}
                    {tab === 'queue' && <><FiList /> <span className="hidden sm:inline">Danh sách Phát</span></>}                    
                    {/* Mobile chỉ hiện icon nếu màn hình quá nhỏ, hoặc text ngắn gọn */}
                    <span className="sm:hidden">
                        {tab === 'lyrics' ? 'Nghe' : tab === 'queue' ? 'List' : 'Khen'}
                    </span>
                 </button>
             ))}
          </div>

          {/* Content Container */}
          <div className="flex-1 min-h-0 flex flex-col mb-3 bg-white/5 rounded-xl overflow-hidden border border-white/5 shadow-inner">
             
             {/* Tab 1: Lyrics */}
             {activeTab === 'lyrics' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <LyricsViewer />
                </div>
             )}

             {/* Tab 2: Queue */}
             {activeTab === 'queue' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="space-y-1">
                        {/* History */}
                        {currentPlaylist.map((song, index) => {
                            if (index >= currentIndex) return null;
                            return (
                                <div key={song.id || index} className="flex items-center p-2 md:p-3 rounded-lg opacity-50 grayscale" onClick={() => playSong(song, currentPlaylist, index)}>
                                    <div className="mr-3 text-gray-600"><FiClock size={16}/></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-500 truncate">{song.title}</p>
                                        <p className="text-[10px] md:text-xs text-gray-600 truncate">{displayArtistNames(song.artists)}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Current */}
                        <div ref={queueScrollRef} className="sticky top-0 z-10 bg-black/60 backdrop-blur-md border-y border-green-500/30 my-2">
                            <div className="flex items-center p-3 rounded-lg bg-green-500/10">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm md:text-base font-bold text-green-400 truncate">{currentSong.title}</p>
                                    <p className="text-xs text-green-300/70 truncate">{displayArtistNames(currentSong.artists)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Up */}
                        <div className="pb-4">
                            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase px-2 mb-2">Tiếp theo</p>
                            {currentPlaylist.length > currentIndex + 1 ? (
                                currentPlaylist.map((song, index) => {
                                    if (index <= currentIndex) return null;
                                    return (
                                        <div 
                                            key={song.id || index}
                                            // Chỉ bật draggable trên Desktop (hidden md:block cho icon drag)
                                            draggable
                                            onDragStart={(e) => onDragStart(e, index)}
                                            onDragOver={(e) => onDragOver(e, index)}
                                            onDrop={(e) => onDrop(e, index)}
                                            className={`flex items-center p-2 md:p-3 rounded-lg group active:bg-white/10 md:hover:bg-white/10 transition-colors border border-transparent mb-1 cursor-pointer ${draggedItemIndex === index ? 'opacity-50 border-dashed border-gray-400' : ''}`}
                                            onClick={() => playSong(song, currentPlaylist, index)}
                                        >
                                            {/* Drag Handle: Ẩn trên mobile vì HTML5 Drag không support touch tốt */}
                                            <div 
                                                className="hidden md:block mr-3 text-gray-600 cursor-grab hover:text-white group-hover:text-gray-400"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FiMenu size={18} />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-300 truncate">{song.title}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                                            </div>
                                            <button className="text-gray-500 md:opacity-0 md:group-hover:opacity-100 p-2 hover:text-green-400 transition">
                                                <FiPlay size={16} />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : <p className="text-center text-gray-600 text-xs italic py-4">Hết bài...</p>}
                        </div>
                    </div>
                </div>
             )}

             {/* Tab 3: Comments */}
             {activeTab === 'comments' && (
                <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300">
                    <div className="p-4 text-gray-800">
                        <CommentSection songId={currentSong.id} />
                    </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* FOOTER: Controls */}
      <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 py-2 md:py-0 h-auto md:h-24 flex flex-col md:flex-row items-center justify-between shrink-0">
        
        {/* Info (Desktop Only) */}
        <div className="hidden md:flex flex-col w-1/4">
           <span className="font-bold truncate text-gray-100">{currentSong.title}</span>
           <span className="text-xs text-gray-400 truncate">{displayArtistNames(currentSong.artists)}</span>
        </div>

        {/* Center: Main Controls + Progress */}
        <div className="flex-1 w-full md:max-w-2xl flex flex-col items-center">
           
           {/* Progress Bar (Mobile: Nằm trên buttons) */}
           <div className="w-full flex items-center gap-3 text-xs font-medium text-gray-400 mb-2 md:mb-0 md:order-2">
              <span className="min-w-[35px] text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full relative group cursor-pointer">
                 <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                 <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
              </div>
              <span className="min-w-[35px]">{formatTime(duration)}</span>
           </div>

           {/* Buttons */}
           <div className="flex items-center justify-between w-full md:w-auto md:gap-6 mb-2 md:mb-2 md:order-1">
              <button onClick={toggleShuffle} className={`${shuffleMode ? 'text-green-500' : 'text-gray-400'} p-2`}><FiShuffle size={18}/></button>
              <button onClick={prevSong} className="text-gray-300 p-2"><FiSkipBack size={24}/></button>
              
              <button onClick={togglePlay} className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                {isPlaying ? <FiPause size={24} fill="black" /> : <FiPlay size={24} fill="black" className="ml-1"/>}
              </button>
              
              <button onClick={nextSong} className="text-gray-300 p-2"><FiSkipForward size={24}/></button>
              <button onClick={toggleRepeat} className={`${repeatMode ? 'text-green-500' : 'text-gray-400'} p-2`}><FiRepeat size={18}/></button>
           </div>
        </div>

        {/* Right: Volume (Ẩn trên mobile để tiết kiệm diện tích) */}
        <div className="hidden md:flex w-1/4 justify-end items-center gap-4">
           <button className="text-gray-400 hover:text-red-500"><FiHeart size={20}/></button>
           <button className="text-gray-400 hover:text-white"><FiMoreHorizontal size={20}/></button>
           <div className="w-24 flex items-center gap-2 group ml-2">
              <div className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                 <div className="h-full bg-white group-hover:bg-green-500 transition-colors" style={{ width: `${volume * 100}%` }}></div>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-24 h-4 opacity-0 absolute cursor-pointer" />
           </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default FullScreenPlayer;
