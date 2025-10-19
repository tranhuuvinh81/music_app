// frontend/src/pages/PlaylistPage.js 
import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import PlaylistForm from '../components/PlaylistForm';
import EditPlaylistModal from '../components/EditPlaylistModal'; // 👈 1. Import component mới
const BACKEND_URL = 'http://localhost:5000'; // 👈 THÊM DÒNG NÀY
function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [filteredPlaylistSongs, setFilteredPlaylistSongs] = useState([]);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  // 👇 2. Thêm state mới để quản lý modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);
  const { playSong } = useContext(AudioContext);

// Hàm tải lại danh sách playlists
  const fetchPlaylists = () => {
    if (isAuthenticated) {
      api.get(`/api/playlists/user/${user.id}`)
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchPlaylists(); // 👈 3. Sử dụng hàm fetch
  }, [isAuthenticated, user]);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     api.get(`/api/playlists/user/${user.id}`)
  //       .then(res => setPlaylists(res.data))
  //       .catch(err => console.error(err));
  //   }
  // }, [isAuthenticated, user]);

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
    // api.get(`/api/playlists/user/${user.id}`)
    //   .then(res => setPlaylists(res.data))
    //   .catch(err => console.error(err));
    fetchPlaylists(); // 👈 4. Gọi hàm fetch để tải lại danh sách playlists
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
// 👇 5. Thêm các hàm xử lý cho Edit Modal
  const handleOpenEditModal = (playlist) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingPlaylist(null);
    setShowEditModal(false);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
    fetchPlaylists(); // Tải lại danh sách sau khi sửa thành công
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Playlist của bạn</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          {playlists.length > 0 && `Bạn có ${playlists.length} playlist`}
        </div>
        <button 
          onClick={handleCreatePlaylist}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          + Tạo playlist mới
        </button>
      </div>
      
      {showPlaylistForm && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <PlaylistForm onFormSubmit={handlePlaylistFormSubmit} onCancel={handlePlaylistFormCancel} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {playlists.map(pl => (
          // 👇 6. Cập nhật JSX để hiển thị thumbnail (nếu có)
          <div key={pl.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-4">
            
            {/* Thumbnail */}
            <img 
  // 👇 SỬA LẠI DÒNG NÀY
  src={pl.thumbnail_url ? `${BACKEND_URL}${pl.thumbnail_url}` : 'https://via.placeholder.com/60'}
  alt={pl.name}
  className="w-16 h-16 rounded object-cover cursor-pointer"
  onClick={() => viewPlaylist(pl.id)}
/>

            {/* Tên và các nút */}
            <div className="flex-1 min-w-0">
              <span 
                onClick={() => viewPlaylist(pl.id)} 
                className="text-lg text-gray-500 font-medium cursor-pointer hover:text-black transition-colors block truncate"
              >
                {pl.name}
              </span>
              <p className="text-sm text-gray-500 truncate">{pl.description || '...'}</p>
            </div>
            
            {/* Nút Sửa và Xóa */}
            <div className="flex flex-col space-y-2">
              {/* 👇 7. Thêm nút Sửa */}
              <button 
                onClick={() => handleOpenEditModal(pl)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                Sửa
              </button>
              <button 
                onClick={() => deletePlaylist(pl.id)}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {currentPlaylistId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Danh sách bài hát trong playlist</h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát trong playlist..."
              value={playlistSearchQuery}
              onChange={(e) => setPlaylistSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          
          {filteredPlaylistSongs.length > 0 ? (
            <ul className="space-y-3">
              {filteredPlaylistSongs.map((song, index) => (
                <li key={song.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <strong className="block text-gray-800">{song.title}</strong>
                    <p className="text-gray-600">{song.artist}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handlePlaySong(song, playlistSongs, index)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Nghe
                    </button>
                    <button 
                      onClick={() => removeFromPlaylist(song.id, currentPlaylistId)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Xóa khỏi playlist
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {playlistSearchQuery ? 'Không tìm thấy bài hát nào' : 'Playlist này trống'}
            </div>
          )}
        </div>
      )}
      
      {playlists.length === 0 && !showPlaylistForm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Bạn chưa có playlist nào</p>
          <button 
            onClick={handleCreatePlaylist}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tạo playlist mới
          </button>
        </div>
      )}
      {/* 👇 8. Render Edit Modal */}
      {showEditModal && editingPlaylist && (
        <EditPlaylistModal 
          playlist={editingPlaylist}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default PlaylistPage;