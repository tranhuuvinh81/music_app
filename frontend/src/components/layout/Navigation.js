// frontend/src/components/layout/Navigation.js
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SongContext } from "../../context/SongContext";
import api from "../../api/api";
import logo from "../../assets/images/logo-removebg-preview.png";

function Navigation() {
  const { user, fullUser, logout } = useContext(AuthContext);
  const { searchQuery, setSearchQuery, performSearch } = useContext(SongContext);
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const avatarSrc = fullUser && fullUser.avatar_url ? `${api.defaults.baseURL}${fullUser.avatar_url}` : null;

  return (
    // [FIX] Thêm 'hidden md:block' để ẩn trên mobile, chỉ hiện trên desktop
    <nav className="hidden md:block font-genos bg-gradient-to-r from-white to-[#7Ab2D3] shadow-lg sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <span className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Logo" className="h-20 w-auto drop-shadow-lg" />
            </span>
          </Link>

          {/* SEARCH BAR */}
          <form className="flex-1 max-w-md mx-8" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bài hát..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7Ab2D3] focus:border-transparent bg-white bg-opacity-80 backdrop-blur-sm transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 py-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full hover:shadow-lg hover:scale-105 focus:outline-none transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* NAV LINKS (DESKTOP) */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-white px-3 py-2 rounded-md text-xl font-bold hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-[#4A90E2] px-3 py-2 rounded-md text-xl font-bold hover:bg-white hover:bg-opacity-20 transition-all duration-300">Đăng nhập</Link>
                <Link to="/register" className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white px-4 py-2 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">Đăng ký</Link>
              </>
            )}
          </div>

          {/* USER DROPDOWN */}
          {user && (
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7Ab2D3] hover:scale-105 transition-transform duration-300"
                  onClick={toggleUserDropdown}
                >
                  {avatarSrc ? (
                    <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md" src={getImageUrl(fullUser.avatar_url)} alt="User Avatar" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center shadow-md">
                      <span className="text-white font-bold">{fullUser ? fullUser.full_name.charAt(0).toUpperCase() : "U"}</span>
                    </div>
                  )}
                  <span className="ml-2 text-white text-xl font-bold hidden lg:block">
                    {fullUser ? fullUser.full_name : "Tài khoản"}
                  </span>
                  <svg className="ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {userDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transform transition-all duration-300 z-50">
                  <div className="py-1">
                    <Link to="/profile" className="block px-4 py-2 text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#7Ab2D3] hover:to-white hover:text-white transition-all duration-300" onClick={() => setUserDropdownOpen(false)}>
                      Hồ sơ cá nhân
                    </Link>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#7Ab2D3] hover:to-white hover:text-white transition-all duration-300">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;