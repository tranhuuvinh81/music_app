// frontend/src/pages/main/AlbumsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiMoreHorizontal, FiDisc, FiClock, FiPlay } from 'react-icons/fi'; // [SỬA] Import thêm FiPlay
import SongInfoModal from "../../components/modals/SongInforModal";

// 1. Component Card hiển thị Album
// [SỬA] Thêm prop onPlayRandom
const AlbumCard = ({ album, onClick, onPlayRandom, badge }) => {
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
        
        {/* [SỬA] Overlay nút Play ngẫu nhiên khi hover */}
        <div className="absolute inset-0 bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
           <button
             onClick={(e) => {
               e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (tránh mở chi tiết album)
               if (onPlayRandom) onPlayRandom(album);
             }}
             className="p-3 bg-white bg-opacity-90 rounded-full text-[#4A90E2] hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
             title="Phát ngẫu nhiên"
           >
             <FiPlay className="text-xl pl-1" fill="currentColor" />
           </button>
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
  const [recentlyViewedAlbums, setRecentlyViewedAlbums] = useState([]); 
  
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
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

  useEffect(() => {
    api.get('/api/stats/albums')
      .then(res => {
        setTopAlbums(res.data.top_albums || []);
        setRecentAddedAlbums(res.data.recent_albums || []);
      })
      .catch(err => console.error("Lỗi lấy albums:", err));

    const viewed = JSON.parse(localStorage.getItem('viewed_albums') || '[]');
    setRecentlyViewedAlbums(viewed);
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      api.get(`/api/songs/album/${encodeURIComponent(selectedAlbum.name)}`)
        .then(res => {
          setDisplaySongs(res.data);
        })
        .catch(err => console.error("Lỗi lấy bài hát album:", err));
      
      addToViewedHistory(selectedAlbum);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedAlbum]);

  const addToViewedHistory = (album) => {
    let viewed = JSON.parse(localStorage.getItem('viewed_albums') || '[]');
    viewed = viewed.filter(a => a.name !== album.name);
    viewed.unshift(album);
    if (viewed.length > 5) viewed.pop();
    
    localStorage.setItem('viewed_albums', JSON.stringify(viewed));
    setRecentlyViewedAlbums(viewed);
  };

  // --- [MỚI] HÀM PHÁT NGẪU NHIÊN BÀI HÁT TỪ ALBUM ---
  const playRandomSongFromAlbum = async (album) => {
    try {
      const res = await api.get(`/api/songs/album/${encodeURIComponent(album.name)}`);
      const songs = res.data || [];
      
      if (songs.length > 0) {
        // 1. Copy mảng để không ảnh hưởng dữ liệu gốc
        const shuffledSongs = [...songs];
        
        // 2. Thuật toán Fisher-Yates xáo trộn mảng
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        
        // 3. Đưa danh sách đã xáo trộn vào Player (phát bài đầu tiên)
        playSong(shuffledSongs[0], shuffledSongs, 0);
        
        // 4. Mở chi tiết Album ra cho người dùng xem và lưu lịch sử
        setSelectedAlbum(album);
        setDisplaySongs(songs); // Vẫn hiển thị danh sách gốc ở UI
      }
    } catch (error) {
      console.error("Lỗi khi phát ngẫu nhiên album:", error);
    }
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
          {/* SECTION 1: TOP ALBUMS */}
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
                  onPlayRandom={playRandomSongFromAlbum} // [SỬA] Truyền hàm
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
                  onPlayRandom={playRandomSongFromAlbum} // [SỬA] Truyền hàm
                />
              ))}
            </div>
          </div>

          {/* SECTION 3: ĐÃ XEM GẦN ĐÂY */}
          {recentlyViewedAlbums.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
               <h2 className="text-xl font-bold mb-4 text-gray-600 flex items-center">
                 <FiClock className="mr-2"/> Bạn đã xem gần đây
               </h2>
               <div className="flex gap-4 overflow-x-auto pb-4">
                 {recentlyViewedAlbums.map((album) => (
                   <div key={album.name} className="w-40 flex-shrink-0">
                      <AlbumCard 
                        album={album} 
                        onClick={setSelectedAlbum} 
                        onPlayRandom={playRandomSongFromAlbum} // [SỬA] Truyền hàm
                      />
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