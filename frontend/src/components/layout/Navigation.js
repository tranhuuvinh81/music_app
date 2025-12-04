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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const avatarSrc =
    fullUser && fullUser.avatar_url
      ? `${api.defaults.baseURL}${fullUser.avatar_url}`
      : null;

  return (
    <nav className="font-genos bg-gradient-to-r from-white to-[#7Ab2D3] shadow-lg sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <span className="text-xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Logo" className="h-20 w-auto drop-shadow-lg" />
            </span>
          </Link>

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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-white  px-3 py-2 rounded-md text-xl font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300" //hover:text-[#4A90E2]
            >
              Home
            </Link>
            <Link
              to="/playlists"
              className="text-white hover:text-[#4A90E2] px-3 py-2 rounded-md text-xl font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
            >
              Playlist
            </Link>
            <Link
              to="/favorites"
              className="text-white hover:text-[#4A90E2] px-3 py-2 rounded-md text-xl font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
            >
              Favorite
            </Link>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-[#4A90E2] px-3 py-2 rounded-md text-xl font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-[#4A90E2] px-3 py-2 rounded-md text-xl font-medium hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white px-4 py-2 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
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
                  className="flex items-center text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7Ab2D3] hover:scale-105 transition-transform duration-300"
                  onClick={toggleUserDropdown}
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  {avatarSrc ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
                      src={avatarSrc}
                      alt="User Avatar"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center shadow-md">
                      <span className="text-white font-medium">
                        {fullUser
                          ? fullUser.full_name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-white text-xl font-medium hidden md:block">
                    {fullUser ? fullUser.full_name : "Tài khoản"}
                  </span>
                  <svg
                    className="ml-1 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {userDropdownOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transform transition-all duration-300"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="py-1" role="none">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#7Ab2D3] hover:to-white hover:text-white transition-all duration-300"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Hồ sơ cá nhân
                      </div>
                    </Link>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#7Ab2D3] hover:to-white hover:text-white transition-all duration-300"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
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
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gradient-to-r hover:from-[#7Ab2D3] hover:to-white hover:text-white transition-all duration-300"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
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
      <div className="md:hidden border-t border-gray-200 bg-white bg-opacity-80 backdrop-blur-sm">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#7Ab2D3] hover:bg-gray-50 transition-all duration-300"
          >
            Home
          </Link>
          <Link
            to="/playlists"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#7Ab2D3] hover:bg-gray-50 transition-all duration-300"
          >
            Playlist
          </Link>
          <Link
            to="/favorites"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#7Ab2D3] hover:bg-gray-50 transition-all duration-300"
          >
            Favorite
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#7Ab2D3] hover:bg-gray-50 transition-all duration-300"
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#7Ab2D3] hover:bg-gray-50 transition-all duration-300"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white hover:shadow-lg transition-all duration-300"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;