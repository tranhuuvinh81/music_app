// frontend/src/pages/main/MainLayout.js
import React, { useState, useContext } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom"; // [UPDATE] Thêm Link
import { AuthContext } from "../../context/AuthContext";
import { SongContext } from "../../context/SongContext";
import SongDetails from "../../components/layout/SongDetails";
import AddToPlaylistModal from "../../components/modals/AddToPlaylistModal";
import ArtistDetailsModal from "../../components/modals/ArtistDetailModal";
import ChatbotModal from "../../components/modals/ChatbotModal";
// [UPDATE] Thêm icon User và LogOut
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut } from "react-icons/fi"; 
import api from "../../api/api";

import FullScreenPlayer from "../../components/layout/FullScreenPlayer";

function MainLayout() {
  const { user, isAuthenticated, logout, fullUser } = useContext(AuthContext);
  const { searchQuery, setSearchQuery, performSearch } = useContext(SongContext);
  
  const [modalSongId, setModalSongId] = useState(null);
  const [artistModalData, setArtistModalData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // [NEW] State cho Dropdown Avatar Mobile
  const [isMobileUserDropdownOpen, setIsMobileUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const openAddModal = (songId) => setModalSongId(songId);
  const closeModal = () => setModalSongId(null);
  const openArtistModal = (artist) => setArtistModalData(artist);
  const closeArtistModal = () => setArtistModalData(null);
  const openChatbot = () => setShowChatbot(true);
  const closeChatbot = () => setShowChatbot(false);

  const handleLogout = () => {
    logout();
    setIsMobileUserDropdownOpen(false); // Đóng menu sau khi logout
    navigate('/login');
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    e.target.querySelector('input').blur();
  };

  const outletContext = { isAuthenticated, openAddModal, openArtistModal };

  const avatarSrc = fullUser && fullUser.avatar_url ? getImageUrl(fullUser.avatar_url) : null;

  return (
    <div className=" text-xl flex flex-col h-screen bg-gradient-to-br from-[#f0f9ff] to-white overflow-hidden">
      
      {/* =================== MOBILE HEADER =================== */}
      <div className="md:hidden h-16 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-between px-3 shadow-md z-20 shrink-0 gap-3 relative">
         
         {/* 1. Nút Menu Sidebar */}
         <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="text-white p-1 focus:outline-none">
            {isMobileNavOpen ? <FiX size={26} /> : <FiMenu size={26} />}
         </button>

         {/* 2. Thanh Tìm kiếm */}
         <form onSubmit={handleMobileSearch} className="flex-1 relative">
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát..." 
                className="w-full py-1.5 pl-3 pr-8 rounded-full bg-white/20 text-white placeholder-white/70 border border-transparent focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 text-base outline-none transition-all"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80">
                <FiSearch size={18} />
            </button>
         </form>

         {/* 3. User Avatar & Dropdown */}
         <div className="flex-shrink-0 relative">
            {user ? (
                <>
                    {/* Nút Avatar để bật/tắt Dropdown */}
                    <button 
                        onClick={() => setIsMobileUserDropdownOpen(!isMobileUserDropdownOpen)} 
                        className="relative focus:outline-none block"
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-white/50 shadow-sm" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/20">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </button>

                    {/* [NEW] OVERLAY ĐỂ ĐÓNG KHI CLICK RA NGOÀI */}
                    {isMobileUserDropdownOpen && (
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsMobileUserDropdownOpen(false)}
                        ></div>
                    )}

                    {/* [NEW] DROPDOWN MENU */}
                    {isMobileUserDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-fade-in-down origin-top-right">
                            {/* Mũi tên nhỏ trỏ lên (Optional) */}
                            <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>
                            
                            <div className="relative bg-white rounded-lg overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-800 truncate">{user.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>

                                <Link 
                                    to="/profile" 
                                    onClick={() => setIsMobileUserDropdownOpen(false)}
                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#7Ab2D3] transition-colors"
                                >
                                    <FiUser className="mr-3 text-lg" /> Hồ sơ cá nhân
                                </Link>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors border-t border-gray-50"
                                >
                                    <FiLogOut className="mr-3 text-lg" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <button onClick={() => navigate('/login')} className="text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-lg whitespace-nowrap active:bg-white/30">
                    Đăng nhập
                </button>
            )}
         </div>
      </div>

      {/* =================== MAIN CONTAINER =================== */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* =================== SIDEBAR (NAV) =================== */}
        <aside 
            className={`
                bg-gradient-to-b from-[#7Ab2D3] to-white shadow-lg flex-shrink-0 transition-transform duration-300 z-30
                fixed inset-y-0 left-0 w-64 md:relative md:translate-x-0
                ${isMobileNavOpen ? 'translate-x-0 top-16' : '-translate-x-full md:translate-x-0'}
            `}
        >
          <nav className="flex flex-col h-full pb-20 md:pb-0">
            <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              <NavLink to="/" end onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg> Trang chủ
              </NavLink>
              <NavLink to="/artists" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg> Ca sĩ
              </NavLink>
              <NavLink to="/genres" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg> Thể loại
              </NavLink>
              <NavLink to="/countries" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg> Quốc gia
              </NavLink>
              <NavLink to="/playlists" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg> Thư viện
              </NavLink>
              <NavLink to="/albums" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v3H4V5zm0 5h12v5H4v-5z"></path></svg> Album
              </NavLink>
              <NavLink to="/history" onClick={() => setIsMobileNavOpen(false)} className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-xl font-bold transition-all duration-300 ${isActive ? "bg-white bg-opacity-90 text-[#7Ab2D3] shadow-md transform scale-105" : "text-white hover:bg-white hover:bg-opacity-20"}`}>
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg> Lịch sử nghe
              </NavLink>
            </div>
            
          </nav>
        </aside>

        {/* OVERLAY CHO MOBILE NAV */}
        {isMobileNavOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                onClick={() => setIsMobileNavOpen(false)}
            ></div>
        )}

        {/* CENTER CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-2 md:p-0">
             <Outlet context={outletContext} />
             <div className="h-24 md:h-20"></div>
          </div>
          
          <button
            onClick={openChatbot}
            className="fixed bottom-[100px] right-4 md:right-6 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
            title="Hỏi Chatbot"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </button>
        </div>

        {/* RIGHT SIDEBAR (SONG DETAILS - Desktop only) */}
        <aside className="hidden md:block w-80 bg-white shadow-md p-4 overflow-y-auto flex-shrink-0 border-l border-gray-100">
          <SongDetails 
            onExpand={() => setIsFullScreen(true)} 
            openAddModal={openAddModal}
            openArtistModal={openArtistModal}
          />
        </aside>

      </div>

      {modalSongId && <AddToPlaylistModal songId={modalSongId} onClose={closeModal} />}
      {artistModalData && <ArtistDetailsModal artist={artistModalData} onClose={closeArtistModal} />}
      {showChatbot && <ChatbotModal onClose={closeChatbot} />}
      {isFullScreen && <FullScreenPlayer onClose={() => setIsFullScreen(false)} />}
    </div>
  );
}

export default MainLayout;