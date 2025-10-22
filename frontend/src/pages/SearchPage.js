import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SongContext } from "../context/SongContext";
import { AuthContext } from "../context/AuthContext";
import { AudioContext } from "../context/AudioContext";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import ArtistDetailsModal from "../components/ArtistDetailModal";
import api from "../api/api";

const displayArtistNames = (artistsArray) => {
  if (!artistsArray || artistsArray.length === 0) {
    return "Nghệ sĩ không xác định";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
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
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
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
    setMenuOpenSongId(null); // Đóng menu khi mở modal
  };
  const closeModal = () => {
    setModalSongId(null);
  };

  const { songs = [], artists = [] } = searchResults || {};

  if (isLoading) {
    return <div className="text-center p-8">Đang tìm kiếm...</div>;
  }

  const noResultsFound =
    !isLoading && songs.length === 0 && artists.length === 0;

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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {songs.map((song, index) => (
                    <li
                      key={song.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {/* Phần thông tin bài hát */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0 mr-4">
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
                            {/* Sử dụng hàm helper */}
                            <p className="text-gray-600 truncate">
                              {displayArtistNames(song.artists)}
                            </p>
                          </div>
                        </div>
                        {/* Phần nút điều khiển */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handlePlaySong(song, songs, index)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            aria-label={`Play ${song.title}`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {isAuthenticated && (
                            <div className="relative">
                              <button
                                onClick={() => toggleMenu(song.id)}
                                className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="More options"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                              {menuOpenSongId === song.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-100">
                                  <button
                                    onClick={() => openAddModal(song.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Nghệ sĩ
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artists.map((artist) => (
                  <li
                    key={artist.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden text-center group transform transition-transform duration-300 hover:scale-105"
                  >
                    <img
                      src={
                        artist.image_url
                          ? `${api.defaults.baseURL}${artist.image_url}`
                          : "https://via.placeholder.com/150?text=Artist"
                      }
                      alt={artist.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 truncate mb-2">
                        {artist.name}
                      </h3>
                      <button
                        onClick={() => setArtistModalData(artist)}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:underline focus:outline-none"
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
