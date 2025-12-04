import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiHeart, FiMoreHorizontal } from 'react-icons/fi';

function HistoryPage() {
  const [recentSongs, setRecentSongs] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/users/history')
        .then(res => setRecentSongs(res.data))
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
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
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  };

  const handlePlaySong = (song, songs, index) => {
    playSong(song, songs, index);
  };

  return (
    <div className="p-6 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nhạc nghe gần đây</h2>
      
      {isAuthenticated ? (
        recentSongs.length > 0 ? (
          <>
            {/* Grid of Song Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {(isListExpanded ? recentSongs : recentSongs.slice(0, 10)).map((song, index) => {
                // Check if this song is currently playing
                const isCurrentSong = currentSong && currentSong.id === song.id;
                const isFavorite = favoriteSongs.has(song.id);
                
                // Format song data for SongCard component
                const songCardData = {
                  id: song.id,
                  title: song.title,
                  artist: displayArtistNames(song.artists),
                  coverImage: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : null,
                  listenCount: song.listen_count || 0
                };
                
                return (
                  <div key={song.id} className="relative">
                    <SongCard
                      song={songCardData}
                      isPlaying={isCurrentSong && isPlaying}
                      onPlay={() => handlePlaySong(song, recentSongs, index)}
                      onAddToFavorites={() => toggleFavorite(song.id)}
                      isFavorite={isFavorite}
                      className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md"
                    />
                    
                    {/* Custom Options Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        onClick={() => toggleMenu(song.id)} 
                        className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-200"
                      >
                        <FiMoreHorizontal />
                      </button>
                      {menuOpenSongId === song.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
                          <button 
                            onClick={() => handleOpenAddModal(song.id)} 
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Thêm vào playlist
                          </button>
                          <button 
                            onClick={() => toggleFavorite(song.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Chia sẻ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {recentSongs.length > 10 && (
              <button 
                onClick={toggleListExpansion} 
                className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors"
              >
                {isListExpanded ? "Thu gọn" : "Xem thêm..."}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">Bạn chưa nghe bài hát nào gần đây</p>
            <p className="text-gray-400">Hãy khám phá và thưởng thức âm nhạc</p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">Vui lòng đăng nhập để xem lịch sử</p>
          <a href="/login" className="px-4 py-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-lg hover:shadow-lg transition-all duration-300">
            Đăng nhập
          </a>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;