// frontend/src/pages/admin/AdminLayout.js
import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Outlet, NavLink } from "react-router-dom"; // Dùng Outlet và NavLink
import api from "../../api/api";
import SongForm from "../../components/forms/SongForm";
import UserDetailsModal from "../../components/modals/UserDetailsModal";
import ArtistForm from "../../components/forms/ArtistForm";

// Tạo Context để truyền dữ liệu và hàm xuống các trang con
const AdminContext = createContext();

// Component Layout chính
function AdminLayout() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [dailyListens, setDailyListens] = useState([]);
  const [artistListens, setArtistListens] = useState([]);

  // State cho Modals (vẫn giữ ở Layout cha)
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

  // --- HÀM FETCH DỮ LIỆU ---
const fetchUsers = useCallback(() => {
    api
      .get("/api/users")
      .then((res) => setUsers(res.data || []))
      .catch((err) => {
        console.error(err);
        setUsers([]);
      });
  }, []);

  const fetchSongs = useCallback(() => {
    api
      .get("/api/songs")
      .then((res) => setSongs(res.data || []))
      .catch((err) => {
        console.error(err);
        setSongs([]);
      });
  }, []);

  const fetchArtists = useCallback(() => {
    api
      .get("/api/artists")
      .then((res) => setArtists(res.data || []))
      .catch((err) => {
        console.error(err);
        setArtists([]);
      });
  }, []);
const processChartData = (apiData = []) => {
  const dataMap = new Map(apiData.map((item) => [item.date, item.count]));
  const finalData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const formattedDate = `${day}/${month}`;
    finalData.push({
      date: formattedDate,
      count: dataMap.get(formattedDate) || 0,
    });
  }
  return finalData;
};
  const fetchDailyListens = useCallback(() => {
    api
      .get("/api/stats/daily-listens")
      .then((res) => {
        const formattedData = processChartData(res.data || []);
        setDailyListens(formattedData);
      })
      .catch((err) => {
        console.error("Lỗi khi tải thống kê lượt nghe:", err);
        setDailyListens(processChartData([]));
      });
  }, []);

  const fetchArtistListens = useCallback(() => {
    api
      .get("/api/stats/top-artists")
      .then((res) => {
        const chartData = (res.data || []).map((artist) => ({
          name: artist.name,
          listens: artist.total_listens || 0,
        }));
        setArtistListens(chartData);
      })
      .catch((err) => {
        console.error("Lỗi khi tải top nghệ sĩ:", err);
        setArtistListens([]); // Đặt mảng rỗng nếu có lỗi
      });
  }, []);


  useEffect(() => {
    fetchUsers();
    fetchSongs();
    fetchArtists();
    fetchDailyListens();
    fetchArtistListens();
  }, [fetchUsers, fetchSongs, fetchArtists, fetchDailyListens, fetchArtistListens]);

  // --- CÁC HÀM HANDLER CHO MODALS  ---
  const handleViewUserClick = (user) => { setSelectedUser(user); setShowUserDetails(true); };
  const handleUserDetailsClose = () => { setShowUserDetails(false); setSelectedUser(null); };
  const handleUserUpdate = () => { fetchUsers(); };

  const handleAddSongClick = () => { setEditingSong(null); setShowSongForm(true); };
  const handleEditSongClick = (song) => { setEditingSong(song); setShowSongForm(true); };
  const handleSongFormSubmit = () => { setShowSongForm(false); setEditingSong(null); fetchSongs(); };
  const handleSongFormCancel = () => { setShowSongForm(false); setEditingSong(null); };
  
  const handleAddArtistClick = () => { setEditingArtist(null); setShowArtistForm(true); };
  const handleEditArtistClick = (artist) => { setEditingArtist(artist); setShowArtistForm(true); };
  const handleArtistFormSubmit = () => { setShowArtistForm(false); setEditingArtist(null); fetchArtists(); };
  const handleArtistFormCancel = () => { setShowArtistForm(false); setEditingArtist(null); };

  // Hàm helper
  const displayArtistNames = (artistsArray) => {
    if (!Array.isArray(artistsArray) || artistsArray.length === 0) {
      return "Nghệ sĩ không xác định";
    }
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <AdminContext.Provider value={{
      // Dữ liệu
      users, songs, artists, dailyListens, artistListens,
      // Hàm fetch (để các trang con có thể tự gọi refresh)
      fetchUsers, fetchSongs, fetchArtists,
      // Handlers cho Modals
      handleViewUserClick, handleAddSongClick, handleEditSongClick,
      handleAddArtistClick, handleEditArtistClick,
      // Helpers
      displayArtistNames
    }}>
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md flex-shrink-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/admin"
                    end 
                    className={({ isActive }) =>
                      `w-full text-left px-4 py-3 rounded-lg font-medium transition-colors block ${
                        isActive
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `w-full text-left px-4 py-3 rounded-lg font-medium transition-colors block ${
                        isActive
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    User Management
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/songs"
                    className={({ isActive }) =>
                      `w-full text-left px-4 py-3 rounded-lg font-medium transition-colors block ${
                        isActive
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    Song Management
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/artists"
                    className={({ isActive }) =>
                      `w-full text-left px-4 py-3 rounded-lg font-medium transition-colors block ${
                        isActive
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    Artist Management
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Outlet sẽ render trang con (Overview, Users, Songs, Artists) */}
          <Outlet context={{ 
            // Truyền context cho các trang con
            users, songs, artists, dailyListens, artistListens,
            fetchUsers, fetchSongs, fetchArtists,
            handleViewUserClick, deleteUser: api.delete, // Truyền hàm delete
            handleAddSongClick, handleEditSongClick, deleteSong: api.delete,
            handleAddArtistClick, handleEditArtistClick, deleteArtist: api.delete,
            displayArtistNames
          }} />
        </main>

        {/* Các Modals vẫn được render ở đây */}
        {showSongForm && <SongForm songToEdit={editingSong} onFormSubmit={handleSongFormSubmit} onCancel={handleSongFormCancel} />}
        {showUserDetails && <UserDetailsModal user={selectedUser} onClose={handleUserDetailsClose} onUpdate={handleUserUpdate} />}
        {showArtistForm && <ArtistForm artistToEdit={editingArtist} onFormSubmit={handleArtistFormSubmit} onCancel={handleArtistFormCancel} />}
      </div>
    </AdminContext.Provider>
  );
}

// Hook tùy chỉnh để các trang con dễ dàng lấy dữ liệu
export const useAdminContext = () => useContext(AdminContext);

export default AdminLayout;