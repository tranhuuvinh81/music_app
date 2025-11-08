import React, { useState, useContext,  } from "react";
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      

      {/* =================== MAIN CONTENT =================== */}
      <main className="flex flex-1 overflow-hidden">
        {/* =================== SIDEBAR =================== */}
        <aside className="w-64 bg-white shadow-md flex-shrink-0">
          <nav className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/artists"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Ca sĩ
              </NavLink>
              <NavLink
                to="/genres"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Thể loại
              </NavLink>
              <NavLink
                to="/countries"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Quốc gia
              </NavLink>
              <NavLink
                to="/playlists"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Playlist của tôi
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                Lịch sử nghe
              </NavLink>
            </div>
            {/* Có thể thêm phần footer cho sidebar ở đây nếu cần */}
          </nav>
        </aside>

        {/* =================== PAGE CONTENT =================== */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Outlet sẽ render các trang con (Home, Artists, etc.) */}
          <Outlet context={outletContext} />
          
          {/* NÚT CHATBOT */}
          <button
            onClick={openChatbot}
            className="fixed bottom-14 right-6 bg-gray-600 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-50"
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
        <aside className="w-80 bg-white shadow-md p-4 overflow-y-auto flex-shrink-0">
          <SongDetails />
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