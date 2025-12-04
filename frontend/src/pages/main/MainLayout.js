// frontend/src/components/layout/MainLayout.js
import React, { useState, useContext } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SongDetails from "../../components/layout/SongDetails";
import AddToPlaylistModal from "../../components/modals/AddToPlaylistModal";
import ArtistDetailsModal from "../../components/modals/ArtistDetailModal";
import ChatbotModal from "../../components/modals/ChatbotModal";
import { useNavigate } from "react-router-dom";

function MainLayout() {
  // Logic Modal và Chatbot được giữ lại ở layout cha
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [modalSongId, setModalSongId] = useState(null);
  const [artistModalData, setArtistModalData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  // State cho AddToPlaylistModal
  const openAddModal = (songId) => setModalSongId(songId);
  const closeModal = () => setModalSongId(null);

  // State cho ArtistDetailsModal
  const openArtistModal = (artist) => setArtistModalData(artist);
  const closeArtistModal = () => setArtistModalData(null);

  // State cho ChatbotModal
  const openChatbot = () => setShowChatbot(true);
  const closeChatbot = () => setShowChatbot(false);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 👇 Truyền các hàm này xuống các trang con qua context của Outlet
  const outletContext = {
    isAuthenticated,
    openAddModal,
    openArtistModal,
  };

  return (
    <div className="font-genos flex flex-col min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* =================== MAIN CONTENT =================== */}
      <main className="flex flex-1 overflow-hidden">
        {/* =================== SIDEBAR =================== */}
        <aside className="w-64 bg-gradient-to-b from-[#7Ab2D3] to-white shadow-lg flex-shrink-0">
          <nav className="flex flex-col h-full">
            <div className="flex-1 px-4 pb-4 space-y-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center mt-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Trang chủ
              </NavLink>
              <NavLink
                to="/artists"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                Ca sĩ
              </NavLink>
              <NavLink
                to="/genres"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                Thể loại
              </NavLink>
              <NavLink
                to="/countries"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                Quốc gia
              </NavLink>
              <NavLink
                to="/playlists"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                Thư viện
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105"
                      : "text-white hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
                Lịch sử nghe
              </NavLink>
            </div>
            
            {/* Footer của sidebar */}
            <div className="p-4 border-t border-white border-opacity-20">
              {user ? (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-white font-semibold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{user.full_name || 'User'}</p>
                    <button
                      onClick={handleLogout}
                      className="text-white text-opacity-70 text-sm hover:text-opacity-100 transition-opacity"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="block w-full py-2 px-4 text-center bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300"
                >
                  Đăng nhập
                </NavLink>
              )}
            </div>
          </nav>
        </aside>

        {/* =================== PAGE CONTENT =================== */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Outlet sẽ render các trang con (Home, Artists, etc.) */}
          <Outlet context={outletContext} />
          
          {/* NÚT CHATBOT */}
          <button
            onClick={openChatbot}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7Ab2D3] focus:ring-offset-2 z-50"
            title="Hỏi Chatbot"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
          </button>
        </div>

        {/* =================== RIGHT SIDEBAR =================== */}
        <aside className="w-96 bg-gradient-to-b from-white to-[#f0f9ff] shadow-lg flex-shrink-0">
          <div className="h-full p-4 overflow-y-auto">
            <SongDetails />
          </div>
        </aside>
      </main>

      {/* =================== MODALS =================== */}
      {modalSongId && (
        <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />
      )}
      {artistModalData && (
        <ArtistDetailsModal
          artist={artistModalData}
          onClose={closeArtistModal}
        />
      )}
      {showChatbot && <ChatbotModal onClose={closeChatbot} />}
    </div>
  );
}

export default MainLayout;