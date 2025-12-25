// frontend/src/pages/main/SearchPage.js
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SongContext } from "../../context/SongContext";
import { AuthContext } from "../../context/AuthContext";
import { AudioContext } from "../../context/AudioContext";
import AddToPlaylistModal from "../../components/modals/AddToPlaylistModal";
import ArtistDetailsModal from "../../components/modals/ArtistDetailModal";
import SongCard from "../../components/ui/SongCard";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";
import api from "../../api/api";
import SongInfoModal from "../../components/modals/SongInforModal";


const displayArtistNames = (artistsArray) => {
  if (!artistsArray || artistsArray.length === 0) {
    return "Nghệ sĩ không xác định";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
};

// Component cho card nghệ sĩ trong trang tìm kiếm
const ArtistCard = ({ artist, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square group" onClick={() => onViewDetails(artist)}>
        {artist.image_url ? (
          <img
            // src={`${api.defaults.baseURL}${artist.image_url}`}
            src={artist.image_url}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium">Xem chi tiết</p>
        </div> */}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{artist.name}</h3>
      </div>
    </div>
  );
};

function SearchPage() {
  const {
    searchResults,
    searchQuery,
    setSearchQuery,
    performSearch,
    isLoading,
  } = useContext(SongContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
  const [artistModalData, setArtistModalData] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const [showInfoModal, setShowInfoModal] = useState(false);
  

  const navigate = useNavigate();
  const location = useLocation();

  const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("q");
    if (searchParam) {
      setSearchQuery(searchParam);
      performSearch(searchParam);
    } else {
      performSearch(""); // Xóa kết quả nếu không có query
    }
    // Reset modal khi search mới
    setArtistModalData(null);
    setModalSongId(null);
  }, [location.search, setSearchQuery, performSearch]); // Phụ thuộc vào location.search

  // Handlers
  const handlePlaySong = (song, playlist, index) => {
    playSong(song, playlist, index);
  };
  
  const toggleMenu = (songId) => {
    setMenuOpenSongId(menuOpenSongId === songId ? null : songId);
  };
  
  const openAddModal = (songId) => {
    setModalSongId(songId);
    setMenuOpenSongId(null);
  };
  
  const closeModal = () => {
    setModalSongId(null);
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

  const { songs = [], artists = [] } = searchResults || {};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-[#7Ab2D3] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
      </div>
    );
  }

  const noResultsFound = !isLoading && songs.length === 0 && artists.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Kết quả tìm kiếm cho: "{searchQuery}"
        </h1>
      </div>

      {noResultsFound ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy kết quả
          </h3>
          <p className="text-gray-600">Vui lòng thử với từ khóa khác.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* --- KHỐI BÀI HÁT --- */}
          {songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Bài hát
              </h2>
              
              {/* Grid of Song Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {songs.map((song, index) => {
                  // Check if this song is currently playing
                  const isCurrentSong = currentSong && currentSong.id === song.id;
                  const isFavorite = favoriteSongs.has(song.id);
                  
                  // Format song data for SongCard component
                  const songCardData = {
                    id: song.id,
                    title: song.title,
                    artist: displayArtistNames(song.artists),
                    // coverImage: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : null,
                    coverImage: getImageUrl(song.image_url),
                    listenCount: song.listen_count || 0
                  };
                  
                  return (
                    <div key={song.id} className="relative">
                      <SongCard
                        song={songCardData}
                        isPlaying={isCurrentSong && isPlaying}
                        onPlay={() => handlePlaySong(song, songs, index)}
                        onAddToFavorites={() => toggleFavorite(song.id)}
                        isFavorite={isFavorite}
                        className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md"
                      />
                      
                      {/* Custom Options Menu */}
                      {isAuthenticated && (
                        <div className="absolute top-2 right-2 z-1000">
                          <button 
                            onClick={() => toggleMenu(song.id)} 
                            className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-200"
                          >
                            <FiMoreHorizontal />
                          </button>
                          {menuOpenSongId === song.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
                              <button 
                                onClick={() => openAddModal(song.id)} 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Thêm vào playlist
                              </button>
                              {/* <button 
                                onClick={() => toggleFavorite(song.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                              </button> */}
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
            </section>
          )}

          {/* --- KHỐI NGHỆ SĨ --- */}
          {artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Nghệ sĩ
              </h2>
              
              {/* Grid of Artist Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onViewDetails={setArtistModalData}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* MODALS */}
      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}
      {artistModalData && (
        <ArtistDetailsModal
          artist={artistModalData}
          onClose={() => setArtistModalData(null)}
        />
      )}
    </div>
  );
}

export default SearchPage;