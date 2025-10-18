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
import api from './api/api';
import "./App.css";

// Component bảo vệ route, yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component bảo vệ route cho Admin
const AdminRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// frontend/src/App.js (Navigation updated)
function Navigation() {
  const { user, fullUser, logout } = useContext(AuthContext);
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

  // Tính toán avatar URL đầy đủ
  const avatarSrc = fullUser && fullUser.avatar_url 
    ? `${api.defaults.baseURL}${fullUser.avatar_url}` 
    : null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-gray-600">Nghe & Khen</span>
          </Link>
          
          <form className="flex-1 max-w-md mx-8" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài hát..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button type="submit" className="absolute inset-y-0 right-0 px-3 py-2 bg-gray-400 text-white rounded-r-lg hover:bg-gray-500 focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </form>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/playlists" className="text-gray-700 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Playlist
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="text-gray-700 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-g-600 px-3 py-2 rounded-md text-sm font-medium">
                  Đăng nhập
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
          
          {user && (
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={toggleUserDropdown}
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  {avatarSrc ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={avatarSrc}
                      alt="User Avatar"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {fullUser ? fullUser.full_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-gray-700 text-sm font-medium hidden md:block">
                    {fullUser ? fullUser.full_name : 'Tài khoản'}
                  </span>
                  <svg className="ml-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {userDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                  <div className="py-1" role="none">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Hồ sơ cá nhân
                      </div>
                    </Link>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Cài đặt
                      </div>
                    </a>
                  </div>
                  <div className="py-1" role="none">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Đăng xuất
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link to="/playlists" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Playlist
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Đăng nhập
              </Link>
              <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Đăng ký
              </Link>
            </>
          )}
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
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navigation />
              <main className="flex-grow container mx-auto px-4 py-6">
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
            </div>
          </Router>
        </SongProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;