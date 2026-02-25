// frontend/src/pages/main/GenresPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiMoreHorizontal, FiPlay } from 'react-icons/fi'; // [SỬA] Thêm FiPlay
import SongInfoModal from "../../components/modals/SongInforModal";

// Component cho card thể loại
// [SỬA] Thêm prop onPlayRandom
const GenreCard = ({ genre, onClick, onPlayRandom }) => {
  const getGenreColor = (genreName) => {
    const colorMap = {
      'Pop': 'from-pink-400 to-purple-600', 'Rock': 'from-red-500 to-orange-600',
      'Jazz': 'from-blue-400 to-indigo-600', 'Classical': 'from-purple-400 to-pink-600',
      'Electronic': 'from-cyan-400 to-blue-600', 'Hip Hop': 'from-yellow-400 to-orange-600',
      'Country': 'from-green-400 to-teal-600', 'R&B': 'from-purple-500 to-pink-600',
      'Reggae': 'from-yellow-500 to-green-600', 'Folk': 'from-green-500 to-blue-600',
    };
    return colorMap[genreName] || 'from-[#7Ab2D3] to-[#4A90E2]';
  };

  const getGenreIcon = (genreName) => {
    const iconMap = {
      'Pop': '🎤', 'Rock': '🎸', 'Jazz': '🎷', 'Classical': '🎻',
      'Electronic': '🎧', 'Hip Hop': '🎵', 'Country': '🤠',
      'R&B': '💿', 'Reggae': '🌴', 'Folk': '🎵',
    };
    return iconMap[genreName] || '🎵';
  };

  return (
    <div 
      onClick={() => onClick(genre)}
      className="bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square group">
        <div className={`w-full h-full bg-gradient-to-br ${getGenreColor(genre)} flex items-center justify-center`}>
          <span className="text-6xl">{getGenreIcon(genre)}</span>
        </div>
        
        {/* [SỬA] Overlay hiệu ứng khi hover (Đã thêm nút Play) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 if (onPlayRandom) onPlayRandom(genre);
               }}
               className="p-3 bg-white bg-opacity-90 rounded-full text-[#4A90E2] hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
               title="Phát ngẫu nhiên"
             >
               <FiPlay className="text-xl pl-1" fill="currentColor" />
             </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate text-center">{genre}</h3>
      </div>
    </div>
  );
};

function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [selectedSongForInfo, setSelectedSongForInfo] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  useEffect(() => {
    api.get('/api/songs/genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      api.get(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
      setIsListExpanded(false);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedGenre]);

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

  // --- [MỚI] HÀM PHÁT NGẪU NHIÊN BÀI HÁT TỪ THỂ LOẠI ---
  const playRandomSongFromGenre = async (genreName) => {
    try {
      const res = await api.get(`/api/songs/genre/${encodeURIComponent(genreName)}`);
      const songs = res.data || [];
      
      if (songs.length > 0) {
        const shuffledSongs = [...songs];
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        playSong(shuffledSongs[0], shuffledSongs, 0);
        setSelectedGenre(genreName);
        setDisplaySongs(songs);
      } else {
        alert("Chưa có bài hát nào thuộc thể loại này!");
      }
    } catch (error) {
      console.error("Lỗi khi phát ngẫu nhiên bài hát thể loại:", error);
    }
  };

  return (
    <div className="p-6 flex-grow">
      {!selectedGenre ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Thể loại âm nhạc</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {genres.map((genre) => (
              <GenreCard
                key={genre}
                genre={genre}
                onClick={setSelectedGenre}
                onPlayRandom={playRandomSongFromGenre} // [SỬA] Truyền hàm
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedGenre(null)} 
              className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Thể loại: <span className="text-[#4A90E2]">{selectedGenre}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {(isListExpanded ? displaySongs.slice(0, 20) : displaySongs.slice(0, 10)).map((song, index) => {
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
                  
                  {isAuthenticated && (
                    <div className="absolute top-2 right-2 z-1000">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleMenu(song.id); }} 
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
                            onClick={() => { setMenuOpenSongId(null); setSelectedSongForInfo(song); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Xem thông tin
                          </button>                          
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Chia sẻ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {displaySongs.length > 10 && (
            <div className="flex justify-center mt-8">
              <button 
              onClick={toggleListExpansion} 
                className="px-8 py-2 rounded-full border border-[#7Ab2D3] text-[#7Ab2D3] font-medium hover:bg-[#7Ab2D3] hover:text-white transition-all duration-300"
            >
              {isListExpanded ? "Thu gọn" : "Xem thêm..."}
            </button>
            </div>
          )}
        </>
      )}
      {selectedSongForInfo && (
        <SongInfoModal
          song={selectedSongForInfo}
          onClose={() => setSelectedSongForInfo(null)}
        />
      )}
    </div>
  );
}

export default GenresPage;