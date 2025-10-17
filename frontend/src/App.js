// frontend/src/App.js (updated Navigation)
import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { SongContext, SongProvider } from "./context/SongContext";
import AudioPlayer from "./components/AudioPlayer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import PlaylistPage from "./pages/PlaylistPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import "./App.css";

// Component bảo vệ route, yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div>Đang tải...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component bảo vệ route cho Admin
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div>Đang tải...</div>;
  }
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// frontend/src/App.js (Navigation updated)
function Navigation() {
  const { user, logout } = useContext(AuthContext);
  const { searchQuery, setSearchQuery, performSearch } =
    useContext(SongContext);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery); // Gọi performSearch với query hiện tại
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`); // Điều hướng đến trang search
  };
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        MusicApp
      </Link>
      <form className="nav-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Tìm kiếm bài hát..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit">Tìm kiếm</button>
      </form>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/playlists">Playlist</Link>
            {user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
            {/* <span>Chào, {user.username}!</span>
            <button onClick={logout} className="btn-logout">
              Đăng xuất
            </button> */}
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
      <div className={`dropdown ${userDropdownOpen ? "active" : ""}`}>
        <div className="dropdown-toggle" onClick={toggleUserDropdown}>
          <i className="fas fa-user-circle"></i>
            <img
              src={user && user.avatar_url ? user.avatar_url : "/default-user-icon.png"}
              className="user-icon"
            />
            <span>{user ? user.username : 'Tài khoản'}</span>
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="dropdown-menu">
          <a href="/profile">
            <i className="fas fa-user"></i>  Hồ sơ cá nhân
          </a>
          <a href="/settings">
            <i className="fas fa-cog"></i> Cài đặt
          </a>
          <div className="divider"></div>
          <button onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <SongProvider>
          <Router>
            <Navigation />
            <main className="container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/playlists"
                  element={
                    <ProtectedRoute>
                      <PlaylistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </main>
            <AudioPlayer />
          </Router>
        </SongProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
