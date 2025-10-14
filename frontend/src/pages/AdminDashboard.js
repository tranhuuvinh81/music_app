// frontend/src/pages/AdminDashboard.js (updated - replace edit with view details)
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import SongForm from '../components/SongForm';
import UserDetailsModal from '../components/UserDetailsModal'; // Thay vì UserForm

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  
  // State cho Song Form
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // State cho User Details Modal
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(() => {
    api.get('/api/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const fetchSongs = useCallback(() => {
    api.get('/api/songs').then(res => setSongs(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
  }, [fetchUsers, fetchSongs]);

  // Logic cho User
  const handleViewUserClick = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleUserDetailsClose = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const deleteUser = (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      api.delete(`/api/users/${userId}`).then(fetchUsers).catch(console.error);
    }
  }

  // Logic cho Song (giữ nguyên)
  const handleAddSongClick = () => {
    setEditingSong(null);
    setShowSongForm(true);
  };

  const handleEditSongClick = (song) => {
    setEditingSong(song);
    setShowSongForm(true);
  };

  const deleteSong = (songId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài hát này?')) {
      api.delete(`/api/songs/${songId}`).then(fetchSongs).catch(console.error);
    }
  }

  const handleSongFormSubmit = () => {
    setShowSongForm(false);
    setEditingSong(null);
    fetchSongs();
  };

  const handleSongFormCancel = () => {
    setShowSongForm(false);
    setEditingSong(null);
  };

  return (
    <div>
      <h1>Trang quản trị</h1>
      
      {/* --- FORM MODALS --- */}
      {showSongForm && (
        <SongForm
          songToEdit={editingSong}
          onFormSubmit={handleSongFormSubmit}
          onCancel={handleSongFormCancel}
        />
      )}
      {showUserDetails && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleUserDetailsClose}
        />
      )}

      {/* --- BẢNG QUẢN LÝ USER --- */}
      <section>
        <h2>Quản lý người dùng</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="btn-view" onClick={() => handleViewUserClick(user)}>Xem chi tiết</button>
                  <button className="btn-delete" onClick={() => deleteUser(user.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* --- BẢNG QUẢN LÝ BÀI HÁT (giữ nguyên) --- */}
      <section>
        <div className="section-header">
          <h2>Quản lý bài hát</h2>
          <button onClick={handleAddSongClick}>+ Thêm bài hát mới</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Nghệ sĩ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                <td>{song.id}</td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditSongClick(song)}>Sửa</button>
                  <button className="btn-delete" onClick={() => deleteSong(song.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminDashboard;