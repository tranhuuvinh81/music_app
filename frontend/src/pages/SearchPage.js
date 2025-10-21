// frontend/src/pages/SearchPage.js
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SongContext } from "../context/SongContext";
import { AuthContext } from "../context/AuthContext";
import { AudioContext } from "../context/AudioContext";
import AddToPlaylistModal from "../components/AddToPlaylistModal";

function SearchPage() {
  const { songs, searchQuery, setSearchQuery, performSearch } =
    useContext(SongContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get("q");

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam); // Cập nhật searchQuery từ URL
      performSearch(searchParam); // Thực hiện tìm kiếm với query từ URL
    } else {
      navigate("/"); // Nếu không có query, quay lại trang chủ
    }
  }, [searchParam, setSearchQuery, performSearch, navigate]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Kết quả tìm kiếm cho: "{searchQuery}"
        </h1>
      </div>

      {songs.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {songs.map((song, index) => (
              <li
                key={song.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {song.title}
                    </h3>
                    <p className="text-gray-600">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlaySong(song, songs, index)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                          className="p-1 text-gray-600 hover:text-gray-800"
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
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
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
      ) : (
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
          <p className="text-gray-600">Không thể tìm thấy kết quả của bạn</p>
        </div>
      )}

      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}
    </div>
  );
}

export default SearchPage;
