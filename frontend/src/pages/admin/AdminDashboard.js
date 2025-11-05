// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/api";
import SongForm from "../../components/forms/SongForm";
import UserDetailsModal from "../../components/modals/UserDetailsModal";
import ArtistForm from "../../components/forms/ArtistForm";
// 👉 THÊM MỚI: Import các component từ Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DashboardContent = ({ users, songs, artists }) => {
  // Tính toán top 5 bài hát
  const topSongs = useMemo(() => {
    // Sắp xếp songs (bản sao) giảm dần theo listen_count và lấy 5 bài đầu
    return [...songs]
      .sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0))
      .slice(0, 5);
  }, [songs]);

  // 👉 THÊM MỚI: Chuẩn bị dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    return topSongs.map((song) => ({
      name: song.title.length > 20 ? song.title.substring(0, 20) + '...' : song.title,
      listens: song.listen_count || 0,
    }));
  }, [topSongs]);

  // Màu sắc cho các cột trong biểu đồ
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng Người Dùng</h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng Bài Hát</h3>
          <p className="text-3xl font-bold text-green-600">{songs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng Nghệ Sĩ</h3>
          <p className="text-3xl font-bold text-purple-600">{artists.length}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Biểu đồ lượt nghe hàng tháng (Tháng)</h3>
          <div className="h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            [ Biểu đồ sẽ được thêm vào đây ]
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 Bài hát được nghe nhiều nhất</h3>
          {topSongs.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60, // Tăng bottom margin để tên bài hát không bị cắt
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} // Xoay nhãn trục X 45 độ
                  textAnchor="end" // Căn chỉnh vị trí nhãn
                  height={100} // Tăng chiều cao cho vùng nhãn
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString()} lượt`}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="listens" name="Lượt nghe">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
                
              </BarChart>
            </ResponsiveContainer>
            
          ) : (
            <div className="h-64 rounded flex items-center justify-center text-gray-500">
              Chưa có dữ liệu lượt nghe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... (Phần còn lại của file UserManagementContent, SongManagementContent, v.v. giữ nguyên)
const UserManagementContent = ({ users, handleViewUserClick, deleteUser }) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
    </header>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-gray-600 hover:text-gray-900 mr-3" onClick={() => handleViewUserClick(user)}>View</button>
                <button className="text-red-600 hover:text-red-900" onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const SongManagementContent = ({ 
  searchQuery, setSearchQuery, currentSongs, totalPages, paginate, currentPage, 
  handleAddSongClick, handleEditSongClick, deleteSong, displayArtistNames 
}) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Songs Management</h2>
        <input
          type="text"
          placeholder="Tìm theo tên, nghệ sĩ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <button className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700" onClick={handleAddSongClick}>
        + Add new song
      </button>
    </header>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt nghe</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentSongs.map((song) => (
            <tr key={song.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{song.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{song.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayArtistNames(song.artists)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(song.listen_count || 0).toLocaleString()}
              </td>
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
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Trước</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button key={number} onClick={() => paginate(number)} className={`px-3 py-1 text-sm font-medium rounded-md border ${currentPage === number ? "bg-gray-600 text-white border-gray-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{number}</button>
        ))}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sau</button>
      </div>
    )}
  </section>
);

const ArtistManagementContent = ({ artists, handleAddArtistClick, handleEditArtistClick, deleteArtist }) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Artist Management</h2>
      <button className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={handleAddArtistClick}>
        + Add new artist
      </button>
    </header>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birth Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {artists.map((artist) => (
            <tr key={artist.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <img src={artist.image_url ? `${api.defaults.baseURL}${artist.image_url}` : "https://via.placeholder.com/40"} alt={artist.name} className="w-10 h-10 object-cover rounded-full" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{artist.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{artist.birth_year || "N/A"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-gray-600 hover:text-gray-900 mr-3" onClick={() => handleEditArtistClick(artist)}>Edit</button>
                <button className="text-red-600 hover:text-red-900" onClick={() => deleteArtist(artist.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  const fetchUsers = useCallback(() => {
    api.get("/api/users")
      .then((res) => setUsers(res.data || []))
      .catch((err) => {
        console.error(err);
        setUsers([]);
      });
  }, []);

  const fetchSongs = useCallback(() => {
    api.get("/api/songs")
      .then((res) => setSongs(res.data || []))
      .catch((err) => {
        console.error(err);
        setSongs([]);
      });
  }, []);

  const fetchArtists = useCallback(() => {
    api.get("/api/artists")
      .then((res) => setArtists(res.data || []))
      .catch((err) => {
        console.error(err);
        setArtists([]);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchArtists();
  }, [fetchUsers, fetchSongs, fetchArtists]);

  const filteredSongs = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    if (!searchQuery) return songs;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(lowercasedQuery);
      const artistMatch =
        song.artists &&
        song.artists.some((artist) =>
          artist.name?.toLowerCase().includes(lowercasedQuery)
        );
      return titleMatch || artistMatch;
    });
  }, [songs, searchQuery]);

  const currentSongs = useMemo(() => {
    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    return filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  }, [filteredSongs, currentPage, songsPerPage]);

  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredSongs, totalPages, currentPage]);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewUserClick = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleUserDetailsClose = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  const deleteUser = (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      api.delete(`/api/users/${userId}`).then(fetchUsers).catch(console.error);
    }
  };

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
      api
        .delete(`/api/songs/${songId}`)
        .then(() => {
          fetchSongs();
          if (currentSongs.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        })
        .catch(console.error);
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

  const handleAddArtistClick = () => {
    setEditingArtist(null);
    setShowArtistForm(true);
  };

  const handleEditArtistClick = (artist) => {
    setEditingArtist(artist);
    setShowArtistForm(true);
  };

  const deleteArtist = (artistId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá nghệ sĩ này? Thao tác này có thể ảnh hưởng đến bài hát liên quan.")) {
      api.delete(`/api/artists/${artistId}`).then(fetchArtists).catch(console.error);
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
  
  const displayArtistNames = (artistsArray) => {
    if (!Array.isArray(artistsArray) || artistsArray.length === 0) {
      return "Nghệ sĩ không xác định";
    }
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent users={users} songs={songs} artists={artists} />;
      case 'users':
        return <UserManagementContent users={users} handleViewUserClick={handleViewUserClick} deleteUser={deleteUser} />;
      case 'songs':
        return <SongManagementContent 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
          currentSongs={currentSongs} totalPages={totalPages} paginate={paginate} currentPage={currentPage}
          handleAddSongClick={handleAddSongClick} handleEditSongClick={handleEditSongClick} 
          deleteSong={deleteSong} displayArtistNames={displayArtistNames}
        />;
      case 'artists':
        return <ArtistManagementContent 
          artists={artists} handleAddArtistClick={handleAddArtistClick} 
          handleEditArtistClick={handleEditArtistClick} deleteArtist={deleteArtist} 
        />;
      default:
        return <DashboardContent users={users} songs={songs} artists={artists} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
          <nav>
            <ul className="space-y-2">
              {['dashboard', 'users', 'songs', 'artists'].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => handleTabChange(tab)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab !== 'dashboard' && 'Management'}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>

      {showSongForm && <SongForm songToEdit={editingSong} onFormSubmit={handleSongFormSubmit} onCancel={handleSongFormCancel} />}
      {showUserDetails && <UserDetailsModal user={selectedUser} onClose={handleUserDetailsClose} onUpdate={handleUserUpdate} />}
      {showArtistForm && <ArtistForm artistToEdit={editingArtist} onFormSubmit={handleArtistFormSubmit} onCancel={handleArtistFormCancel} />}
    </div>
  );
}

export default AdminDashboard;