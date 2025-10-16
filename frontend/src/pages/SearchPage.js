// frontend/src/pages/SearchPage.js (updated - remove SongProvider wrapper)
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SongContext } from '../context/SongContext';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

function SearchPage() {
  const { songs, searchQuery, setSearchQuery, performSearch } = useContext(SongContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchParam = queryParams.get('q');

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam); // Cập nhật searchQuery từ URL
      performSearch(searchParam); // Thực hiện tìm kiếm với query từ URL
    } else {
      navigate('/'); // Nếu không có query, quay lại trang chủ
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
    <div className="search-page">
      <h1>Kết quả tìm kiếm cho: "{searchQuery}"</h1>
      {songs.length > 0 ? (
        <ul className="song-list">
          {songs.map((song, index) => (
            <li key={song.id} className="song-item">
              <div>
                <strong>{song.title}</strong>
                <p>{song.artist}</p>
              </div>
              <button onClick={() => handlePlaySong(song, songs, index)}>Nghe</button>
              {isAuthenticated && (
                <div className="menu-container" style={{ position: 'relative', display: 'inline-block' }}>
                  <button onClick={() => toggleMenu(song.id)}>...</button>
                  {menuOpenSongId === song.id && (
                    <div className="menu-dropdown" style={{ position: 'absolute', right: 0, backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
                      <button onClick={() => openAddModal(song.id)}>Thêm vào playlist</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Không thể tìm thấy kết quả của bạn</p>
      )}
      {modalSongId && <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />}
    </div>
  );
}

export default SearchPage;