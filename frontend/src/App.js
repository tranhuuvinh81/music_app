// frontend/src/App.js (Đã cấu trúc lại)
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { SongProvider } from "./context/SongContext";

// Components & Pages
import Navigation from "./components/layout/Navigation";
import AudioPlayer from "./components/layout/AudioPlayer";
import HomePage from "./pages/main/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PlaylistPage from "./pages/main/PlaylistPage";
import ProfilePage from "./pages/main/ProfilePage";
import SearchPage from "./pages/main/SearchPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUserPage from "./pages/admin/AdminUserPage";
import AdminSongPage from "./pages/admin/AdminSongPage";
import AdminArtistPage from "./pages/admin/AdminArtistPage";

// 👇 2. IMPORT LAYOUT MỚI VÀ CÁC TRANG CON MỚI
import MainLayout from "./pages/main/MainLayout"; // HomePage cũ đổi tên
import HomeSongsPage from "./pages/main/HomeSongsPage";
import ArtistsPage from "./pages/main/ArtistsPage";
import GenresPage from "./pages/main/GenresPage";
import HistoryPage from "./pages/main/HistoryPage";
import CountryPage from "./pages/main/CountryPage";

import "../src/styles/App.css";

// --- CÁC COMPONENT BẢO VỆ ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// MAIN LAYOUT CHO USER
const AppMusicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet />{" "}
        {/* Nơi các trang con (HomePage, PlaylistPage...) sẽ được render */}
      </main>
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
              {/* Route cho Layout chính của người dùng */}
              <Route path="/" element={<AppMusicLayout />}>
                {/* Các trang con của MainLayout */}
                {/* <Route index element={<HomePage />} /> */}
                <Route path="/" element={<MainLayout />}> 
                  {/* Các trang con lồng bên trong MainLayout (cột giữa) */}
                  <Route index element={<HomeSongsPage />} />
                  <Route path="artists" element={<ArtistsPage />} />
                  <Route path="genres" element={<GenresPage />} />
                  <Route path="countries" element={<CountryPage />} />
                  <Route path="history" element={
                    <ProtectedRoute><HistoryPage /></ProtectedRoute>
                  } />
                  <Route path="search" element={<SearchPage />} />
                <Route
                  path="playlists"
                  element={
                    <ProtectedRoute>
                      <PlaylistPage />
                    </ProtectedRoute>
                  }
                />
                </Route>
                
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Các Route không thuộc Layout chính */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUserPage />} />
                <Route path="songs" element={<AdminSongPage />} />
                <Route path="artists" element={<AdminArtistPage />} />
              </Route>
            </Routes>
          </Router>
        </SongProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
