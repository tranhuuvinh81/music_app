// frontend/src/App.js 
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { SongProvider } from "./context/SongContext";

import Navigation from "./components/layout/Navigation";
import AudioPlayer from "./components/layout/AudioPlayer";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// ... Import các trang khác giữ nguyên ...
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminSongPage from "./pages/admin/AdminSongPage";
import AdminArtistPage from "./pages/admin/AdminArtistPage";
import AdminGenrePage from "./pages/admin/AdminGenrePage";
import ManageContentHome from "./pages/admin/ManageContentHome";

import MainLayout from "./pages/main/MainLayout"; 
import HomeSongsPage from "./pages/main/HomeSongsPage";
import ArtistsPage from "./pages/main/ArtistsPage";
import GenresPage from "./pages/main/GenresPage";
import HistoryPage from "./pages/main/HistoryPage";
import CountryPage from "./pages/main/CountryPage";
import AlbumsPage from "./pages/main/AlbumPage";
import PlaylistPage from "./pages/main/PlaylistPage";
import ProfilePage from "./pages/main/ProfilePage";
import SearchPage from "./pages/main/SearchPage";

import "../src/styles/App.css";

// --- CÁC COMPONENT BẢO VỆ ROUTE (Giữ nguyên) ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// MAIN LAYOUT CHO USER
const AppMusicLayout = () => {
  return (
    // [FIX] Sử dụng h-screen và flex-col để layout chiếm toàn màn hình
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* Navigation (Sẽ ẩn trên mobile nhờ class bên trong nó) */}
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet /> 
      </main>
      
      {/* Audio Player (Luôn hiện ở dưới cùng) */}
      <AudioPlayer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <SongProvider>
          <Router>
            <Routes>
              {/* Route cho Layout chính */}
              <Route path="/" element={<AppMusicLayout />}>
                
                {/* Lồng MainLayout vào bên trong */}
                <Route path="/" element={<MainLayout />}> 
                  <Route index element={<HomeSongsPage />} />
                  <Route path="artists" element={<ArtistsPage />} />
                  <Route path="genres" element={<GenresPage />} />
                  <Route path="countries" element={<CountryPage />} />
                  <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="albums" element={<AlbumsPage />} />
                  <Route path="playlists" element={<ProtectedRoute><PlaylistPage /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Route>
              </Route>

              {/* Route Auth & Admin */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUserPage />} />
                <Route path="songs" element={<AdminSongPage />} />
                <Route path="artists" element={<AdminArtistPage />} />
                <Route path="genres" element={<AdminGenrePage />} />
                <Route path="home-content" element={<ManageContentHome />} />
              </Route>
            </Routes>
          </Router>
        </SongProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;