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
import Navigation from "./components/Navigation";
import AudioPlayer from "./components/AudioPlayer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import PlaylistPage from "./pages/PlaylistPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";

import "./App.css";

// --- CÁC COMPONENT BẢO VỆ ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// MAIN LAYOUT CHO USER
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet /> {/* Nơi các trang con (HomePage, PlaylistPage...) sẽ được render */}
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
              <Route path="/" element={<MainLayout />}>
                {/* Các trang con của MainLayout */}
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route
                  path="playlists"
                  element={
                    <ProtectedRoute>
                      <PlaylistPage />
                    </ProtectedRoute>
                  }
                />
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
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </Router>
        </SongProvider>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;

