// frontend/src/components/layout/SongDetails.js
import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import LyricsViewer from "../common/LyricsViewer";
import {
  FiHeart,
  FiMoreHorizontal,
  FiRepeat,
  FiShuffle,
  FiMaximize2,
  FiList, // Icon cho danh sách phát
  FiMusic, // Icon cho lời bài hát
  FiMenu, // Icon để nắm kéo (drag handle)
} from "react-icons/fi";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

function SongDetails({ onExpand, openAddModal, openArtistModal }) {
  const { 
    currentPlaylist, 
    currentIndex,
    isPlaying,
    togglePlay,
    playSong,
    nextSong,
    prevSong,
    volume,
    handleVolumeChange,
    progress,
    handleSeek,
    currentTime,
    duration,
    repeatMode,
    toggleRepeat,
    shuffleMode,
    toggleShuffle,
    // Cần thêm hàm này từ AudioContext để lưu thứ tự mới
    // Nếu chưa có, bạn cần thêm vào AudioContext: setCurrentPlaylist(newOrder)
    updatePlaylist 
  } = useContext(AudioContext);

  const currentSong = currentPlaylist[currentIndex];
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const containerRef = useRef(null);

  const [showArtistSubmenu, setShowArtistSubmenu] = useState(false);

  // --- STATE MỚI CHO TÍNH NĂNG QUEUE ---
  const [viewMode, setViewMode] = useState('none'); // 'none', 'lyrics', 'queue'
  const [contentHeight, setContentHeight] = useState(0);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  // --------------------------------------

  const [isAnimating, setIsAnimating] = useState(false);

  const handleViewArtist = async (artistName) => {
    setShowOptions(false);
    setShowArtistSubmenu(false);
    try {
      const res = await api.get("/api/artists");
      const fullArtistInfo = res.data.find((a) => a.name === artistName);
      if (fullArtistInfo) {
        openArtistModal(fullArtistInfo);
      } else {
        alert("Không tìm thấy thông tin chi tiết nghệ sĩ này.");
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin nghệ sĩ:", err);
    }
  };

  // Tính toán chiều cao cho khu vực mở rộng (Lyrics hoặc Queue)
  useEffect(() => {
    const updateContentHeight = () => {
      if (containerRef.current && viewMode !== 'none') {
        const width = containerRef.current.offsetWidth;
        const calculatedHeight = width * 0.85; // Tăng chiều cao một chút để hiển thị danh sách tốt hơn
        setContentHeight(calculatedHeight);
      }
    };

    updateContentHeight();
    window.addEventListener("resize", updateContentHeight);
    return () => window.removeEventListener("resize", updateContentHeight);
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HÀM CHUYỂN ĐỔI CHẾ ĐỘ XEM ---
  const toggleView = (mode) => {
    if (viewMode === mode) {
      // Nếu đang mở mode này thì đóng lại
      setIsAnimating(true);
      setTimeout(() => {
        setViewMode('none');
        setIsAnimating(false);
      }, 300);
    } else {
      // Nếu đang đóng hoặc ở mode khác
      if (viewMode === 'none') {
        setViewMode(mode);
      } else {
        setViewMode(mode);
      }
    }
  };

  // --- LOGIC KÉO THẢ (DRAG & DROP) ---
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Thêm class ghost nếu cần thiết kế riêng
  };

  const onDragOver = (e, index) => {
    e.preventDefault(); // Cho phép drop
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

    // Tạo bản sao playlist
    const newPlaylist = [...currentPlaylist];
    // Lấy item đang kéo
    const draggedItem = newPlaylist[draggedItemIndex];
    
    // Xóa item ở vị trí cũ
    newPlaylist.splice(draggedItemIndex, 1);
    // Chèn vào vị trí mới
    newPlaylist.splice(dropIndex, 0, draggedItem);

    // CẬP NHẬT CONTEXT
    // Lưu ý: Nếu thay đổi vị trí bài đang phát, cần cẩn trọng với currentIndex
    // Logic đơn giản: Cập nhật playlist mới, AudioContext tự xử lý lại bài đang phát nếu nó bị đổi index
    if (updatePlaylist) {
        updatePlaylist(newPlaylist);
    } else {
        console.warn("Cần thêm hàm updatePlaylist vào AudioContext để lưu thay đổi!");
    }
    
    setDraggedItemIndex(null);
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  const handlePlayPause = () => togglePlay();

  const handleOpenAddModal = (songId) => {
    setShowOptions(false);
    if (openAddModal) openAddModal(songId);
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  if (!currentSong) {
    return (
        // ... (Giữ nguyên phần render khi không có bài hát) ...
        <div className="flex flex-col items-center h-full p-6 bg-gradient-to-b from-white to-[#f0f9ff] rounded-xl shadow-lg">
            <p className="text-gray-600 font-medium mt-10">Chưa có bài hát đang phát</p>
        </div>
    );
  }

  const imageSrc = currentSong.image_url ? `${api.defaults.baseURL}${currentSong.image_url}` : null;
  
  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div ref={containerRef} className="font-genos flex flex-col bg-gradient-to-b from-white to-[#f0f9ff] rounded-xl shadow-lg overflow-hidden h-full">
      
      {/* PHẦN THÔNG TIN & CONTROL (Sẽ ẩn khi mở Queue/Lyrics trên màn hình nhỏ nếu cần, ở đây giữ nguyên hiệu ứng scale) */}
      <div className={`p-6 transition-all duration-500 ${isAnimating ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"}`}>
        
        {/* Album Art & Title (Giữ nguyên) */}
        <div className="flex flex-col items-center mb-6">
          {imageSrc ? (
            <div className="w-56 h-56 overflow-hidden rounded-xl shadow-lg mb-4 group relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              <button onClick={onExpand} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70" title="Toàn màn hình">
                <FiMaximize2 size={16} />
              </button>
              <img className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110" src={getImageUrl(currentSong.image_url)} alt={currentSong.title} />
            </div>
          ) : (
             <div className="w-56 h-56 bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] rounded-2xl flex items-center justify-center mb-4 shadow-xl relative group">
                <button onClick={onExpand} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70"><FiMaximize2 size={16} /></button>
                <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" /></svg>
             </div>
          )}

          <div className="text-center w-full">
            <h3 className="text-2xl font-bold text-gray-800 truncate w-full mb-1">{currentSong.title}</h3>
            <p className="text-gray-600 text-2xl">{displayArtistNames(currentSong.artists)}</p>
          </div>
        </div>

        <div className="flex justify-between text-base text-gray-500 mb-4 px-2">
          <p>{currentSong.country}</p>
          <span>{currentSong.release_year}</span>
        </div>

        {/* Audio Controls & Progress (Giữ nguyên logic cũ) */}
        <div className="audio-controls">
          {/* ... Control Buttons (Shuffle, Prev, Play, Next, Repeat) ... */}
          <div className="flex justify-between items-center mb-6">
             <button onClick={toggleShuffle} className={`p-2 rounded-full transition-all ${shuffleMode ? "text-[#7Ab2D3] bg-[#7Ab2D3]/20" : "text-gray-500"}`}><FiShuffle /></button>
             <button onClick={prevSong} disabled={currentIndex <= 0} className={`p-2 rounded-full ${currentIndex <= 0 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" /></svg></button>
             <button onClick={handlePlayPause} className="p-4 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full hover:shadow-xl hover:scale-110 transition-all duration-300">
                {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> 
                : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
             </button>
             <button onClick={nextSong} disabled={currentIndex >= currentPlaylist.length - 1} className={`p-2 rounded-full ${currentIndex >= currentPlaylist.length - 1 ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" /></svg></button>
             <button onClick={toggleRepeat} className={`p-2 rounded-full transition-all ${repeatMode ? "text-[#7Ab2D3] bg-[#7Ab2D3]/20" : "text-gray-500"}`}><FiRepeat /></button>
          </div>

          {/* Progress & Volume (Giữ nguyên) */}
          <div className="flex justify-between text-xl text-gray-600 mb-2"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
          <div className="mb-6 relative"><div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] rounded-full" style={{ width: `${progress}%` }}></div></div><input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer" /></div>
          
          <div className="flex items-center mb-4">
             <div className="flex-1 relative"><div className="h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2]" style={{ width: `${volume * 100}%` }}></div></div><input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer" /></div>
          </div>

          {/* Action Buttons (Tim, More Options) */}
          <div className="flex justify-center space-x-4">
            <button onClick={toggleFavorite} className={`p-2 rounded-full ${isFavorite ? "text-red-500 bg-red-50" : "text-gray-500 hover:text-red-500"}`}><FiHeart className={isFavorite ? "fill-current" : ""} /></button>
            <div className="relative" ref={optionsRef}>
              <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><FiMoreHorizontal /></button>
              {showOptions && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button onClick={() => handleOpenAddModal(currentSong.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thêm vào playlist</button>
                  <div className="relative group">
                    <button onClick={() => setShowArtistSubmenu(!showArtistSubmenu)} className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span>Xem Nghệ Sĩ</span><svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    {showArtistSubmenu && (
                      <div className="absolute bottom-full left-0 mb-1 w-56 bg-white rounded-lg shadow-lg py-2 z-[60] border border-gray-100">
                        {currentSong.artists && currentSong.artists.length > 0 ? (
                          currentSong.artists.map((artist, index) => (
                            <button key={index} onClick={() => handleViewArtist(artist.name)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate">{artist.name}</button>
                          ))
                        ) : <div className="px-4 py-2 text-sm text-gray-500">Không có thông tin</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BUTTONS CHUYỂN ĐỔI CHẾ ĐỘ XEM (LYRICS / QUEUE) --- */}
      <div className="grid grid-cols-3 border-t border-gray-200 bg-white bg-opacity-50">
        <button
          onClick={() => toggleView('lyrics')}
          className={`py-3 flex items-center justify-center text-xs md:text-sm font-medium transition-colors duration-300 border-r border-gray-100 ${viewMode === 'lyrics' ? 'text-[#7Ab2D3] bg-gray-50' : 'text-gray-600 hover:text-[#7Ab2D3]'}`}
        >
          <FiMusic className="mr-1 md:mr-2" />
          {viewMode === 'lyrics' ? "Ẩn lời" : "Lời"}
        </button>
        
        <button
          onClick={() => toggleView('queue')}
          className={`py-3 flex items-center justify-center text-xs md:text-sm font-medium transition-colors duration-300 border-r border-gray-100 ${viewMode === 'queue' ? 'text-[#7Ab2D3] bg-gray-50' : 'text-gray-600 hover:text-[#7Ab2D3]'}`}
        >
          <FiList className="mr-1 md:mr-2" />
          {viewMode === 'queue' ? "Ẩn List" : "DS Phát"}
        </button>

        {/* Nếu bạn muốn thêm Tab Comments vào SongDetails luôn cho đồng bộ (Optional) */}
        {/* Hiện tại SongDetails của bạn chưa có Comments, nếu muốn thêm thì mở comment dưới */}
        {/* <button
          onClick={() => toggleView('comments')}
          className={`py-3 flex items-center justify-center text-xs md:text-sm font-medium transition-colors duration-300 ${viewMode === 'comments' ? 'text-[#7Ab2D3] bg-gray-50' : 'text-gray-600 hover:text-[#7Ab2D3]'}`}
        >
          <FiMessageSquare className="mr-1 md:mr-2" />
          Khen
        </button> 
        */}
        
        {/* Nếu chỉ có 2 nút thì dùng grid-cols-2 */}
      </div>

      {/* --- KHU VỰC HIỂN THỊ MỞ RỘNG --- */}
      {viewMode !== 'none' && (
        <div
          className={`bg-gray-50 border-t border-gray-200 transition-all duration-500 overflow-hidden ${
            isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
          }`}
          style={{ height: `${contentHeight}px` }}
        >
          
          {/* 1. HIỂN THỊ LYRICS */}
          {viewMode === 'lyrics' && (
            <div className="h-full w-full bg-gradient-to-b from-gray-900 to-black text-white">
               <LyricsViewer />
            </div>
          )}

          {/* 2. HIỂN THỊ QUEUE (NEXT UP) */}
          {viewMode === 'queue' && (
            <div className="h-full w-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Tiếp theo</div>
                <div className="space-y-1">
                    {currentPlaylist.map((song, index) => {
                        // Chỉ cho phép kéo thả nếu không phải bài đang phát (tùy chọn)
                        // Ở đây cho phép kéo thả hết
                        const isActive = index === currentIndex;
                        
                        return (
                            <div 
                                key={song.id || index}
                                draggable // Bật tính năng kéo
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDrop={(e) => onDrop(e, index)}
                                className={`flex items-center p-2 rounded-lg group transition-colors ${
                                    isActive ? 'bg-[#7Ab2D3] bg-opacity-10 border border-[#7Ab2D3] border-opacity-30' : 'hover:bg-white bg-white/50 border border-transparent'
                                } ${draggedItemIndex === index ? 'opacity-50 dashed border-2 border-gray-400' : ''}`}
                            >
                                {/* Drag Handle Icon */}
                                <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                                    <FiMenu size={16} />
                                </div>

                                {/* Playing Indicator */}
                                {isActive && (
                                    <div className="mr-2">
                                        <div className="w-2 h-2 bg-[#7Ab2D3] rounded-full animate-pulse"></div>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 pointer-events-none"> {/* pointer-events-none để không ảnh hưởng drag text */}
                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-[#7Ab2D3]' : 'text-gray-800'}`}>
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {displayArtistNames(song.artists)}
                                    </p>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        // Ngăn chặn sự kiện click lan ra ngoài (nếu có)
                                        e.stopPropagation(); 
                                        // Gọi hàm playSong với bài hát tại vị trí index đó
                                        playSong(song, currentPlaylist, index);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#7Ab2D3] transition-opacity p-2"
                                    title="Phát ngay"
                                >
                                    {isActive && isPlaying ? (
                                        // Nếu đang phát bài này thì hiện icon Pause hoặc sóng nhạc
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    ) : (
                                        // Nếu không thì hiện icon Play
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </div>
                {currentPlaylist.length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">Danh sách trống</p>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SongDetails;
