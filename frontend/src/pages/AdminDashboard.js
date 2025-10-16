// frontend/src/pages/AdminDashboard.js (updated - pass onUpdate to modal)
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import SongForm from "../components/SongForm";
import UserDetailsModal from "../components/UserDetailsModal";
import "./AdminDashboard.css";

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
    api
      .get("/api/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  const fetchSongs = useCallback(() => {
    api
      .get("/api/songs")
      .then((res) => setSongs(res.data))
      .catch(console.error);
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

  const handleUserUpdate = () => {
    fetchUsers(); // Refresh danh sách user sau khi update role
  };

  const deleteUser = (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      api.delete(`/api/users/${userId}`).then(fetchUsers).catch(console.error);
    }
  };

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
    if (window.confirm("Bạn có chắc muốn xóa bài hát này?")) {
      api.delete(`/api/songs/${songId}`).then(fetchSongs).catch(console.error);
    }
  };

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
    <div className="dashboard-container">
      <header>
        <h1>Admin Dashboard</h1>
      </header>

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
          onUpdate={handleUserUpdate} // Pass hàm refresh
        />
      )}

      {/* --- BẢNG QUẢN LÝ USER --- */}
      <section className="section">
        <div className="section-header">
          <h2>User Management</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="btn btn-view"
                      onClick={() => handleViewUserClick(user)}
                    >
                      {" "}
                      View
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- BẢNG QUẢN LÝ BÀI HÁT (giữ nguyên) --- */}
      <section className="section">
        <div className="section-header">
          <h2>Songs Management</h2>
          <button className="btn btn-primary" onClick={handleAddSongClick}>
            + Add new song
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Single</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td>{song.id}</td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEditSongClick(song)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => deleteSong(song.id)}
                  >
                    Delete
                  </button>
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
