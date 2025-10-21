import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SongContext } from "../context/SongContext";
import { AuthContext } from "../context/AuthContext";
import { AudioContext } from "../context/AudioContext";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import ArtistDetailsModal from "../components/ArtistDetailModal"; // 👈 1. IMPORT MODAL NGHỆ SĨ
import api from "../api/api";

function SearchPage() {
  const { searchResults, searchQuery, setSearchQuery, performSearch, isLoading } =
    useContext(SongContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
  
  // 👇 2. THÊM STATE ĐỂ QUẢN LÝ MODAL NGHỆ SĨ
  const [artistModalData, setArtistModalData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("q");
    if (searchParam) {
      setSearchQuery(searchParam);
      performSearch(searchParam);
    } else {
      performSearch(''); // Xóa kết quả nếu không có query
    }
  }, [location.search, setSearchQuery, performSearch]);

  // Các hàm xử lý (không đổi)
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

  const { songs = [], artists = [] } = searchResults || {};

  if (isLoading) {
    return <div className="text-center p-8">Đang tìm kiếm...</div>;
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
            {/* ... (SVG và text "Không tìm thấy kết quả") ... */}
        </div>
      ) : (
        <div className="space-y-12">
          {/* --- KHỐI BÀI HÁT --- */}
          {songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Bài hát</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {songs.map((song, index) => (
                    <li key={song.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                           {song.image_url && (
                            <img
                              src={`${api.defaults.baseURL}${song.image_url}`}
                              alt={`${song.title} thumbnail`}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {song.title}
                            </h3>
                            <p className="text-gray-600 truncate">{song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handlePlaySong(song, songs, index)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {isAuthenticated && (
                            <div className="relative">
                              <button onClick={() => toggleMenu(song.id)} className="p-1 text-gray-600 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                              </button>
                              {menuOpenSongId === song.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                  <button onClick={() => openAddModal(song.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Thêm vào playlist
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* --- KHỐI NGHỆ SĨ --- */}
          {artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Nghệ sĩ</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artists.map((artist) => (
                  <li
                    key={artist.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden text-center group"
                  >
                    <img
                      src={artist.image_url ? `${api.defaults.baseURL}${artist.image_url}` : 'https://via.placeholder.com/150?text=Artist'}
                      alt={artist.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 truncate">
                        {artist.name}
                      </h3>
                      {/* 👇 3. THÊM NÚT "XEM CHI TIẾT" */}
                      <button 
                        onClick={() => setArtistModalData(artist)}
                        className="text-sm text-gray-500 hover:underline mt-2"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}

      {/* 👇 4. RENDER MODAL NGHỆ SĨ KHI CÓ DỮ LIỆU */}
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
