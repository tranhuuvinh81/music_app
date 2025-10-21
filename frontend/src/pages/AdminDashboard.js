// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/api";
import SongForm from "../components/SongForm";
import UserDetailsModal from "../components/UserDetailsModal";
import ArtistForm from "../components/ArtistForm";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10); // Hiển thị 10 bài hát mỗi trang


  // State cho Song Form
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // State cho User Details Modal
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // state cho Playlist Form
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

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

  const fetchArtists = useCallback(() => {
    api
      .get("/api/artists")
      .then((res) => setArtists(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchArtists();
  }, [fetchUsers, fetchSongs, fetchArtists]);

 // 👈 2. TÍNH TOÁN DỮ LIỆU CHO TRANG HIỆN TẠI
  // Dùng useMemo để chỉ tính toán lại khi songs hoặc currentPage thay đổi
  const currentSongs = useMemo(() => {
    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    return songs.slice(indexOfFirstSong, indexOfLastSong);
  }, [songs, currentPage, songsPerPage]);

  // Tính tổng số trang
  const totalPages = Math.ceil(songs.length / songsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


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

  // Logic cho Song
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
      api.delete(`/api/songs/${songId}`).then(() => {
        fetchSongs();
        // Nếu xóa hết bài hát ở trang cuối, tự động quay về trang trước
        if (currentSongs.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
      }).catch(console.error);
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

  //Logic cho artist
  const handleAddArtistClick = () => {
    setEditingArtist(null);
    setShowArtistForm(true);
  };

  const handleEditArtistClick = (artist) => {
    setEditingArtist(artist);
    setShowArtistForm(true);
  };

  const deleteArtist = (artistId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xoá nghệ sĩ này? Thao tác này có thể ảnh hưởng đến bài hát liên quan."
      )
    ) {
      api
        .delete(`/api/artists/${artistId}`)
        .then(fetchArtists)
        .catch(console.error);
    }
  };

  const handleArtistFormSubmit = () => {
    setShowArtistForm(false);
    setEditingArtist(null);
    fetchArtists();
  };

  const handleArtistFormCancel = () => {
    setShowArtistForm(false);
    setEditingArtist(null);
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
            onUpdate={handleUserUpdate} 
          />
        )}
        {showArtistForm && (
          <ArtistForm
            artistToEdit={editingArtist}
            onFormSubmit={handleArtistFormSubmit}
            onCancel={handleArtistFormCancel}
          />
        )}

        {/*  BẢNG QUẢN LÝ USER  */}
        <section className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              User Management
            </h2>
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
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

        {/*  BẢNG QUẢN LÝ BÀI HÁT   */}
        <section className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Songs Management
            </h2>
            <button
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
                {currentSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{song.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{song.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{song.artist}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-gray-600 hover:text-gray-900 mr-3" onClick={() => handleEditSongClick(song)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => deleteSong(song.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {/* Tạo các nút số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 text-sm font-medium rounded-md border ${
                    currentPage === number
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </section>

        {/*  BẢNG QUẢN LÝ NGHỆ SĨ  */}
        <section className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Artist Management
            </h2>
            <button
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={handleAddArtistClick}
            >
              + Add new artist
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Birth Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={
                          artist.image_url
                            ? `${api.defaults.baseURL}${artist.image_url}`
                            : "https://via.placeholder.com/40"
                        }
                        alt={artist.name}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {artist.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artist.birth_year || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditArtistClick(artist)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteArtist(artist.id)}
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
