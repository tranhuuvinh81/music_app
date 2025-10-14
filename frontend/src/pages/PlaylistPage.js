// frontend/src/pages/PlaylistPage.js (new file)
import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import PlaylistForm from '../components/PlaylistForm';

function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [filteredPlaylistSongs, setFilteredPlaylistSongs] = useState([]);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/api/playlists/user/${user.id}`)
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (playlistSearchQuery) {
      const lowerQuery = playlistSearchQuery.toLowerCase();
      setFilteredPlaylistSongs(
        playlistSongs.filter(song =>
          song.title.toLowerCase().includes(lowerQuery) ||
          song.artist.toLowerCase().includes(lowerQuery)
        )
      );
    } else {
      setFilteredPlaylistSongs(playlistSongs);
    }
  }, [playlistSearchQuery, playlistSongs]);

  const handlePlaySong = (song, playlist, index) => {
    playSong(song, playlist, index);
  };

  const handleCreatePlaylist = () => {
    setShowPlaylistForm(true);
  };

  const handlePlaylistFormSubmit = () => {
    setShowPlaylistForm(false);
    api.get(`/api/playlists/user/${user.id}`)
      .then(res => setPlaylists(res.data))
      .catch(err => console.error(err));
  };

  const handlePlaylistFormCancel = () => {
    setShowPlaylistForm(false);
  };

  const viewPlaylist = (playlistId) => {
    setCurrentPlaylistId(playlistId);
    api.get(`/api/playlists/${playlistId}/songs`)
      .then(res => {
        setPlaylistSongs(res.data);
        setFilteredPlaylistSongs(res.data);
      })
      .catch(err => console.error(err));
  };

  const removeFromPlaylist = async (songId, playlistId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài hát này khỏi playlist?')) {
      try {
        await api.post('/api/playlists/remove-song', { playlist_id: playlistId, song_id: songId });
        viewPlaylist(playlistId);
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (window.confirm('Bạn có chắc muốn xóa playlist này?')) {
      try {
        await api.delete(`/api/playlists/${playlistId}`);
        setPlaylists(playlists.filter(p => p.id !== playlistId));
        if (currentPlaylistId === playlistId) {
          setCurrentPlaylistId(null);
          setPlaylistSongs([]);
          setFilteredPlaylistSongs([]);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <div className="playlist-page">
      <h1>Playlist của bạn</h1>
      <div className="section-header">
        <button onClick={handleCreatePlaylist}>+ Tạo playlist mới</button>
      </div>
      {showPlaylistForm && (
        <PlaylistForm onFormSubmit={handlePlaylistFormSubmit} onCancel={handlePlaylistFormCancel} />
      )}
      <ul className="playlist-list">
        {playlists.map(pl => (
          <li key={pl.id}>
            <span onClick={() => viewPlaylist(pl.id)} style={{ cursor: 'pointer' }}>{pl.name}</span>
            <button onClick={() => deletePlaylist(pl.id)}>Xóa</button>
          </li>
        ))}
      </ul>
      {currentPlaylistId && (
        <div>
          <h2>Danh sách bài hát trong playlist</h2>
          <input
            type="text"
            placeholder="Tìm kiếm bài hát trong playlist..."
            value={playlistSearchQuery}
            onChange={(e) => setPlaylistSearchQuery(e.target.value)}
          />
          <ul className="song-list">
            {filteredPlaylistSongs.map((song, index) => (
              <li key={song.id} className="song-item">
                <div>
                  <strong>{song.title}</strong>
                  <p>{song.artist}</p>
                </div>
                <button onClick={() => handlePlaySong(song, playlistSongs, index)}>Nghe</button>
                <button onClick={() => removeFromPlaylist(song.id, currentPlaylistId)}>Xóa khỏi playlist</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PlaylistPage;