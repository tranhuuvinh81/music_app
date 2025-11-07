// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect, useCallback, useMemo, use } from "react";
import api from "../../api/api";
import SongForm from "../../components/forms/SongForm";
import UserDetailsModal from "../../components/modals/UserDetailsModal";
import ArtistForm from "../../components/forms/ArtistForm";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

const DashboardContent = ({
  users,
  songs,
  artists,
  dailyListens,
  artistListens,
}) => {
  const topSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0))
      .slice(0, 5);
  }, [songs]);

  const chartData = useMemo(() => {
    return topSongs.map((song) => ({
      name:
        song.title.length > 20
          ? song.title.substring(0, 20) + "..."
          : song.title,
      listens: song.listen_count || 0,
    }));
  }, [topSongs]);

  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Người Dùng
          </h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Bài Hát
          </h3>
          <p className="text-3xl font-bold text-green-600">{songs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Nghệ Sĩ
          </h3>
          <p className="text-3xl font-bold text-purple-600">{artists.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Biểu đồ lượt nghe hàng ngày (7 ngày qua)
            </h3>
            {dailyListens.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyListens}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} lượt`}
                    contentStyle={{
                      backgroundColor: "#353f4cff",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#a07ef0ff"
                    strokeWidth={2}
                    dot={{ fill: "#a07ef0ff", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 rounded flex items-center justify-center text-gray-500">
                Đang tải dữ liệu...
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Top 5 Bài hát được nghe nhiều nhất
            </h3>
            {topSongs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} lượt`}
                    contentStyle={{
                      backgroundColor: "#6d86a7ff",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                  />
                  <Bar dataKey="listens" name="Lượt nghe">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Top nghệ sĩ được nghe nhiều nhất
          </h3>
          {artistListens.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={artistListens}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0} // Đảm bảo tất cả nhãn đều được hiển thị
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} lượt`}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Bar dataKey="listens" name="Lượt nghe" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 rounded flex items-center justify-center text-gray-500">
              Đang tải dữ liệu nghệ sĩ...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserManagementContent = ({ users, handleViewUserClick, deleteUser }) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
    </header>
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
);

const SongManagementContent = ({
  searchQuery,
  setSearchQuery,
  currentSongs,
  totalPages,
  paginate,
  currentPage,
  handleAddSongClick,
  handleEditSongClick,
  deleteSong,
  displayArtistNames,
}) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Songs Management
        </h2>
        <input
          type="text"
          placeholder="Tìm theo tên bài hát, nghệ sĩ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <button
        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
        onClick={handleAddSongClick}
      >
        + Add new song
      </button>
    </header>
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
              Lượt nghe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentSongs.map((song) => (
            <tr key={song.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {song.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {song.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {displayArtistNames(song.artists)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(song.listen_count || 0).toLocaleString()}
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
    {totalPages > 1 && (
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 text-sm font-medium rounded-md border ${
              currentPage === number
                ? "bg-gray-600 text-white border-gray-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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
);
const ArtistManagementContent = ({
  artists,
  handleAddArtistClick,
  handleEditArtistClick,
  deleteArtist,

  artistSearchQuery,
  setArtistSearchQuery,
  currentArtists,
  artistTotalPages,
  paginateArtists,
  artistCurrentPage,
}) => (
  <section className="bg-white rounded-lg shadow-md overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Artist Management
        </h2>
        <input
          type="text"
          placeholder="Tìm theo tên nghệ sĩ..."
          value={artistSearchQuery}
          onChange={(e) => setArtistSearchQuery(e.target.value)}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <button
        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        onClick={handleAddArtistClick}
      >
        + Add new artist
      </button>
    </header>
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
              Stream
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {currentArtists.map((artist) => (
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

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(artist.total_listens || 0).toLocaleString()}
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
    {artistTotalPages > 1 && (
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
        <button
          onClick={() => paginateArtists(artistCurrentPage - 1)}
          disabled={artistCurrentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        {Array.from({ length: artistTotalPages }, (_, i) => i + 1).map(
          (number) => (
            <button
              key={number}
              onClick={() => paginateArtists(number)}
              className={`px-3 py-1 text-sm font-medium rounded-md border ${
                artistCurrentPage === number
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          )
        )}
        <button
          onClick={() => paginateArtists(artistCurrentPage + 1)}
          disabled={artistCurrentPage === artistTotalPages}
          className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    )}
     {" "}
  </section>
);

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dailyListens, setDailyListens] = useState([]);
  const [artistListens, setArtistListens] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [artistCurrentPage, setArtistCurrentPage] = useState(1);
  const [artistsPerPage] = useState(5); // Có thể đặt số lượng khác nếu muốn
  const [artistSearchQuery, setArtistSearchQuery] = useState("");

  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);

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
  }, [fetchUsers, fetchSongs, fetchArtists, fetchDailyListens]);

  useEffect(() => {
    fetchArtistListens();
  }, [fetchArtistListens]);

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

  // --- Logic Lọc và Phân trang cho Artists (Giữ nguyên) ---
  // filteredArtists sử dụng 'artistSearchQuery'
  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    if (!artistSearchQuery) return artists;
    const lowercasedQuery = artistSearchQuery.toLowerCase();
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(lowercasedQuery)
    );
  }, [artists, artistSearchQuery]);

  // currentArtists sử dụng 'artistCurrentPage'
  const currentArtists = useMemo(() => {
    const indexOfLastArtist = artistCurrentPage * artistsPerPage;
    const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
    return filteredArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  }, [filteredArtists, artistCurrentPage, artistsPerPage]);

  // Tên biến cho Artists là 'artistTotalPages'
  const artistTotalPages = Math.ceil(filteredArtists.length / artistsPerPage);
  useEffect(() => {
    if (artistCurrentPage > artistTotalPages && artistTotalPages > 0) {
      setArtistCurrentPage(artistTotalPages);
    } else if (artistTotalPages === 0) {
      setArtistCurrentPage(1);
    }
  }, [filteredArtists, artistTotalPages, artistCurrentPage]);

  // --- 👇 THÊM HÀM paginateArtists ---
  const paginateArtists = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= artistTotalPages) {
      setArtistCurrentPage(pageNumber);
    }
  };

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
    if (window.confirm("Bạn có chắc chắn muốn xoá nghệ sĩ này?")) {
      api
        .delete(`/api/artists/${artistId}`)
        .then(() => {
          fetchArtists(); // Tải lại danh sách nghệ sĩ
          // 👇 Cập nhật logic phân trang
          if (currentArtists.length === 1 && artistCurrentPage > 1) {
            setArtistCurrentPage(artistCurrentPage - 1);
          }
        })
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
      case "dashboard":
        return (
          <DashboardContent
            users={users}
            songs={songs}
            artists={artists}
            dailyListens={dailyListens}
            artistListens={artistListens}
          />
        );
      case "users":
        return (
          <UserManagementContent
            users={users}
            handleViewUserClick={handleViewUserClick}
            deleteUser={deleteUser}
          />
        );
      case "songs":
        return (
          <SongManagementContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentSongs={currentSongs}
            // Sửa 'totalPages={songTotalPages}' thành 'totalPages={totalPages}'
            totalPages={totalPages}
            // Sửa 'paginate={songPaginate}' thành 'paginate={paginate}'
            paginate={paginate}
            currentPage={currentPage}
            handleAddSongClick={handleAddSongClick}
            handleEditSongClick={handleEditSongClick}
            deleteSong={deleteSong}
            displayArtistNames={displayArtistNames}
          />
        );
      case "artists":
        return (
          <ArtistManagementContent
            artistSearchQuery={artistSearchQuery}
            setArtistSearchQuery={setArtistSearchQuery}
            currentArtists={currentArtists}
            artistTotalPages={artistTotalPages}
            paginateArtists={paginateArtists}
            artistCurrentPage={artistCurrentPage}
            artists={artists} // Prop này có thể không cần nữa nếu currentArtists thay thế
            handleAddArtistClick={handleAddArtistClick}
            handleEditArtistClick={handleEditArtistClick}
            deleteArtist={deleteArtist}
          />
        );
      default:
        return (
          <DashboardContent
            users={users}
            songs={songs}
            artists={artists}
            dailyListens={dailyListens}
            artistListens={artistListens}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
          <nav>
            <ul className="space-y-2">
              {["dashboard", "users", "songs", "artists"].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => handleTabChange(tab)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-gray-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                    {tab !== "dashboard" && "Management"}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>

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
    </div>
  );
}

export default AdminDashboard;
