// frontend/src/pages/HomePage.js (updated - remove search results display)
import React, { useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import SongDetails from '../components/SongDetails';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import './HomePage.css';

function HomePage() {
  const [displaySongs, setDisplaySongs] = useState([]); // Danh sách bài hát hiển thị
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedTab, setSelectedTab] = useState('songs'); // 'songs', 'artists', 'genres'
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [modalSongId, setModalSongId] = useState(null);

  // Fetch danh sách bài hát mặc định khi tab 'songs' được chọn
  useEffect(() => {
    if (selectedTab === 'songs') {
      api.get('/api/songs') // Fetch tất cả bài hát từ API (không liên quan đến tìm kiếm)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    }
    api.get('/api/songs/artists')
      .then(res => setArtists(res.data))
      .catch(err => console.error(err));

    api.get('/api/songs/genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === 'artists' && selectedArtist) {
      api.get(`/api/songs/artist/${encodeURIComponent(selectedArtist)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else if (selectedTab === 'genres' && selectedGenre) {
      api.get(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else if (selectedTab === 'songs') {
      api.get('/api/songs') // Fetch lại khi quay về tab 'songs'
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
    } else {
      setDisplaySongs([]); // Khi chưa chọn sub-item trong artists hoặc genres
    }
  }, [selectedTab, selectedArtist, selectedGenre]);

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

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setSelectedArtist(null);
    setSelectedGenre(null);
  };

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
  };

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
  };

  return (
    <div className="home-layout">
      <div className="app-container">
        <div className="main-layout">
          <div className="sidebar">
            {/* <div className="logo">
              <<span>Vinhsic</span>>
            </div> */}
            <div className="nav-menu">
              <li
                className="nav-item"
                onClick={() => handleTabChange("songs")}
              >
                <span>Home</span>
              </li>
              <li
                className="nav-item"
                onClick={() => handleTabChange("artists")}
              >
                <span>Singer</span>
              </li>
              <li
                className="nav-item"
                onClick={() => handleTabChange("genres")}
              >
                <span>Genre</span>
              </li>
            </div>
            <div class="divider"></div>
          </div>
        </div>
      </div>
      <div className="main-content">
        {selectedTab === 'songs' && (
          <>
            <h1>Khám phá âm nhạc</h1>
            <ul className="song-list">
              {displaySongs.map((song, index) => (
                <li key={song.id} className="song-item">
                  <div>
                    <strong>{song.title}</strong>
                    <p>{song.artist}</p>
                  </div>
                  <button onClick={() => handlePlaySong(song, displaySongs, index)}>Nghe</button>
                  {isAuthenticated && (
                    <div className="menu-container">
                      <button onClick={() => toggleMenu(song.id)}>...</button>
                      {menuOpenSongId === song.id && (
                        <div className="menu-dropdown">
                          <button onClick={() => openAddModal(song.id)}>Thêm vào playlist</button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        {selectedTab === 'artists' && (
          <>
            {!selectedArtist ? (
              <>
                <h1>Danh sách nghệ sĩ</h1>
                <ul>
                  {artists.map(artist => (
                    <li key={artist} onClick={() => handleSelectArtist(artist)} style={{ cursor: 'pointer' }}>{artist}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h1>Bài hát của {selectedArtist}</h1>
                <button onClick={() => setSelectedArtist(null)}>Quay lại</button>
                <ul className="song-list">
                  {displaySongs.map((song, index) => (
                    <li key={song.id} className="song-item">
                      <div>
                        <strong>{song.title}</strong>
                        <p>{song.artist}</p>
                      </div>
                      <button onClick={() => handlePlaySong(song, displaySongs, index)}>Nghe</button>
                      {isAuthenticated && (
                        <div className="menu-container">
                          <button onClick={() => toggleMenu(song.id)}>...</button>
                          {menuOpenSongId === song.id && (
                            <div className="menu-dropdown">
                              <button onClick={() => openAddModal(song.id)}>Thêm vào playlist</button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {selectedTab === 'genres' && (
          <>
            {!selectedGenre ? (
              <>
                <h1>Danh sách thể loại</h1>
                <ul>
                  {genres.map(genre => (
                    <li key={genre} onClick={() => handleSelectGenre(genre)} style={{ cursor: 'pointer' }}>{genre}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h1>Bài hát thuộc thể loại {selectedGenre}</h1>
                <button onClick={() => setSelectedGenre(null)}>Quay lại</button>
                <ul className="song-list">
                  {displaySongs.map((song, index) => (
                    <li key={song.id} className="song-item">
                      <div>
                        <strong>{song.title}</strong>
                        <p>{song.artist}</p>
                      </div>
                      <button onClick={() => handlePlaySong(song, displaySongs, index)}>Nghe</button>
                      {isAuthenticated && (
                        <div className="menu-container">
                          <button onClick={() => toggleMenu(song.id)}>...</button>
                          {menuOpenSongId === song.id && (
                            <div className="menu-dropdown" >
                              <button onClick={() => openAddModal(song.id)}>Thêm vào playlist</button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
      <div className="right-column">
        <SongDetails />
      </div>
      {modalSongId && <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />}
    </div>
  );
}

export default HomePage;

