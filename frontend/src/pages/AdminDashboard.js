// frontend/src/pages/AdminDashboard.js (updated - pass onUpdate to modal)
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import SongForm from "../components/SongForm";
import UserDetailsModal from "../components/UserDetailsModal";

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
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
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
        <section className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleViewUserClick(user)}
                      >
                        View
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
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
        <section className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Songs Management</h2>
            <button 
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleAddSongClick}
            >
              + Add new song
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.artist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditSongClick(song)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteSong(song.id)}
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
      </div>
    </div>
  );
}

export default AdminDashboard;