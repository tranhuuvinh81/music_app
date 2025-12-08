import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiMoreHorizontal, FiDisc, FiClock } from 'react-icons/fi';
import SongInfoModal from "../../components/modals/SongInforModal";


// 1. Component Card hiển thị Album
const AlbumCard = ({ album, onClick, badge }) => {
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Cover";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  return (
    <div 
      onClick={() => onClick(album)}
      className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 relative"
    >
      {/* Badge (Top 1, Top 2...) */}
      {badge && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          {badge}
        </div>
      )}

      <div className="relative aspect-square overflow-hidden">
        <img 
          src={getImageUrl(album.cover_image)} 
          alt={album.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay hiệu ứng đĩa than xoay nhẹ khi hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
           <FiDisc className="text-white text-4xl animate-spin-slow" />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-bold text-gray-800 truncate" title={album.name}>{album.name}</h3>
        <p className="text-xs text-gray-500 flex justify-between mt-1">
           <span>{album.song_count} bài hát</span>
           <span>{(album.total_listens || 0).toLocaleString()} lượt nghe</span>
        </p>
      </div>
    </div>
  );
};

function AlbumsPage() {
  const [topAlbums, setTopAlbums] = useState([]);
  const [recentAddedAlbums, setRecentAddedAlbums] = useState([]);
  const [recentlyViewedAlbums, setRecentlyViewedAlbums] = useState([]); // Album user đã click xem
  
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // State UI
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  const [showInfoModal, setShowInfoModal] = useState(false);
  

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  // --- FETCH DATA ---
  useEffect(() => {
    // 1. Lấy dữ liệu thống kê từ Backend
    api.get('/api/stats/albums')
      .then(res => {
        setTopAlbums(res.data.top_albums || []);
        setRecentAddedAlbums(res.data.recent_albums || []);
      })
      .catch(err => console.error("Lỗi lấy albums:", err));

    // 2. Lấy lịch sử xem từ LocalStorage
    const viewed = JSON.parse(localStorage.getItem('viewed_albums') || '[]');
    setRecentlyViewedAlbums(viewed);
  }, []);

  // --- LOGIC KHI CHỌN ALBUM ---
  useEffect(() => {
    if (selectedAlbum) {
      // Gọi API tìm kiếm bài hát theo tên Album
      // Lưu ý: Backend cần hỗ trợ search hoặc filter theo album. 
      // Ở đây ta tái sử dụng API search vì search thường quét cả cột album.
      api.get(`/api/songs/album/${encodeURIComponent(selectedAlbum.name)}`)
  .then(res => {
      // API mới trả về trực tiếp mảng songs đúng chuẩn
      setDisplaySongs(res.data);
  })
  .catch(err => console.error("Lỗi lấy bài hát album:", err));
      
      // Lưu vào lịch sử "Đã xem gần đây" (Client-side)
      addToViewedHistory(selectedAlbum);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedAlbum]);

  const addToViewedHistory = (album) => {
    let viewed = JSON.parse(localStorage.getItem('viewed_albums') || '[]');
    // Xóa trùng lặp cũ
    viewed = viewed.filter(a => a.name !== album.name);
    // Thêm vào đầu danh sách
    viewed.unshift(album);
    // Giữ tối đa 5 item
    if (viewed.length > 5) viewed.pop();
    
    localStorage.setItem('viewed_albums', JSON.stringify(viewed));
    setRecentlyViewedAlbums(viewed);
  };

  // --- HANDLERS ---
  const handlePlaySong = (song, songs, index) => {
    playSong(song, songs, index);
  };

  const toggleMenu = (songId) => {
    setMenuOpenSongId(prevId => (prevId === songId ? null : songId));
  };

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    openAddModal(songId);
  };

  const toggleFavorite = (songId) => {
    setFavoriteSongs(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) newFavorites.delete(songId);
      else newFavorites.add(songId);
      return newFavorites;
    });
  };

  // --- RENDER ---
  return (
    <div className="p-6 flex-grow animate-fade-in">
      {!selectedAlbum ? (
        <>
          {/* SECTION 1: TOP ALBUMS (Dựa trên listen_count) */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
               Album Nổi Bật 
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {topAlbums.map((album, index) => (
                <AlbumCard 
                  key={album.name} 
                  album={album} 
                  onClick={setSelectedAlbum} 
                  badge={`Top ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* SECTION 2: ALBUM MỚI CẬP NHẬT */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Album Mới & Phổ biến</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentAddedAlbums.map((album) => (
                <AlbumCard 
                  key={album.name} 
                  album={album} 
                  onClick={setSelectedAlbum} 
                />
              ))}
            </div>
          </div>

          {/* SECTION 3: ĐÃ XEM GẦN ĐÂY (Client Side History) */}
          {recentlyViewedAlbums.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
               <h2 className="text-xl font-bold mb-4 text-gray-600 flex items-center">
                 <FiClock className="mr-2"/> Bạn đã xem gần đây
               </h2>
               <div className="flex gap-4 overflow-x-auto pb-4">
                 {recentlyViewedAlbums.map((album) => (
                   <div key={album.name} className="w-40 flex-shrink-0">
                      <AlbumCard album={album} onClick={setSelectedAlbum} />
                   </div>
                 ))}
               </div>
            </div>
          )}
        </>
      ) : (
        // --- CHI TIẾT ALBUM ---
        <div className="animate-slide-up">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedAlbum(null)} 
              className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-medium"
            >
              ← Quay lại
            </button>
            <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedAlbum.name}</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Tổng lượt nghe: {selectedAlbum.total_listens?.toLocaleString()} • {displaySongs.length} bài hát
                </p>
            </div>
          </div>
          
          {/* List bài hát trong Album */}
          {displaySongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {displaySongs.map((song, index) => {
                const isCurrentSong = currentSong && currentSong.id === song.id;
                const isFavorite = favoriteSongs.has(song.id);
                
                const songCardData = {
                    id: song.id,
                    title: song.title,
                    artist: displayArtistNames(song.artists),
                    coverImage: getImageUrl(song.image_url),
                    listenCount: song.listen_count || 0
                };
                
                return (
                    <div key={song.id} className="relative">
                    <SongCard
                        song={songCardData}
                        isPlaying={isCurrentSong && isPlaying}
                        onPlay={() => handlePlaySong(song, displaySongs, index)}
                        onAddToFavorites={() => toggleFavorite(song.id)}
                        isFavorite={isFavorite}
                        className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md"
                    />
                    
                    {/* Menu Option */}
                    {isAuthenticated && (
                        <div className="absolute top-2 right-2 z-1000">
                        <button 
                            onClick={() => toggleMenu(song.id)} 
                            className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 shadow-sm"
                        >
                            <FiMoreHorizontal />
                        </button>
                        {menuOpenSongId === song.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100">
                            <button 
                                onClick={() => handleOpenAddModal(song.id)} 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Thêm vào playlist
                            </button>
                            <button
                            onClick={() => setShowInfoModal(true)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Xem thông tin
                          </button>
                          {showInfoModal && (
                            <SongInfoModal
                              song={song}
                              onClose={() => setShowInfoModal(false)}
                            />
                          )}
                            </div>
                        )}
                        </div>
                    )}
                    </div>
                );
                })}
            </div>
          ) : (
             <div className="text-center py-12 text-gray-500">
                Đang tải bài hát hoặc album này chưa có bài nào...
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AlbumsPage;