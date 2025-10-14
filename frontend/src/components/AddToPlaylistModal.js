// frontend/src/components/AddToPlaylistModal.js (new file)
import React, { useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

function AddToPlaylistModal({ songId, onClose }) {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/playlists/user/${user.id}`)
      .then(res => setPlaylists(res.data))
      .catch(err => console.error(err));
  }, [user.id]);

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post('/api/playlists/add-song', { playlist_id: playlistId, song_id: songId });
      alert('Đã thêm vào playlist');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Chọn playlist để thêm</h2>
        <ul>
          {playlists.map(pl => (
            <li key={pl.id}>
              {pl.name}
              <button onClick={() => addToPlaylist(pl.id)}>Thêm</button>
            </li>
          ))}
        </ul>
        {error && <p className="error">{error}</p>}
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;