// frontend/src/components/layout/SongDetails.js
import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../../context/AudioContext";
import api from "../../api/api";
import LyricsViewer from "../common/LyricsViewer";
import {
  FiHeart,
  FiMoreHorizontal,
  FiRepeat,
  FiShuffle,
  FiMaximize2,
} from "react-icons/fi";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

function SongDetails({ onExpand, openAddModal, openArtistModal }) {
  const { currentPlaylist, currentIndex } = useContext(AudioContext);
  const currentSong = currentPlaylist[currentIndex];
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [lyricsHeight, setLyricsHeight] = useState(0);
  const optionsRef = useRef(null);
  const containerRef = useRef(null);

  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [showArtistSubmenu, setShowArtistSubmenu] = useState(false); // State cho submenu nghệ sĩ

  const {
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    volume,
    handleVolumeChange,
    progress,
    handleSeek,
    currentTime,
    duration,
    repeatMode,
    toggleRepeat,
    shuffleMode,
    toggleShuffle,
  } = useContext(AudioContext);

  const [showLyrics, setShowLyrics] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [albumRotation, setAlbumRotation] = useState(0);
  const animationRef = useRef(null);

  // Hàm xử lý khi click vào một nghệ sĩ cụ thể
  const handleViewArtist = async (artistName) => {
    setShowOptions(false);
    setShowArtistSubmenu(false);

    try {
      // Vì Song object chỉ có {id, name}, ta cần fetch thông tin đầy đủ của Artist để hiển thị Modal
      // Giả sử bạn có API getArtistByName hoặc getArtistById
      // Ở đây ta dùng cách tìm trong danh sách tất cả (hơi thủ công nhưng nhanh)
      // Tốt nhất là backend nên trả về full info artist trong bài hát, hoặc ta fetch lại

      // Cách đơn giản: Gọi API search hoặc get all để tìm
      // Tuy nhiên, để nhanh, ta sẽ gọi API lấy danh sách nghệ sĩ và tìm
      const res = await api.get("/api/artists");
      const fullArtistInfo = res.data.find((a) => a.name === artistName);

      if (fullArtistInfo) {
        openArtistModal(fullArtistInfo);
      } else {
        alert("Không tìm thấy thông tin chi tiết nghệ sĩ này.");
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin nghệ sĩ:", err);
    }
  };

  // Calculate lyrics height based on container width (4:3 aspect ratio)
  useEffect(() => {
    const updateLyricsHeight = () => {
      if (containerRef.current && showLyrics) {
        const width = containerRef.current.offsetWidth;
        // Calculate height for 4:3 aspect ratio (height = width * 3/4)
        const calculatedHeight = width * 0.75;
        setLyricsHeight(calculatedHeight);
      }
    };

    updateLyricsHeight();
    window.addEventListener("resize", updateLyricsHeight);

    return () => {
      window.removeEventListener("resize", updateLyricsHeight);
    };
  }, [showLyrics]);

  // Handle album rotation animation when playing
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setAlbumRotation((prev) => (prev + 0.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLyrics = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowLyrics(!showLyrics);
      setIsAnimating(false);
    }, 300);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // UPDATE SAU
  };

  const handlePlayPause = () => {
    togglePlay();
  };

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    setShowOptions(false); // Đóng menu options khi mở modal
    // Gọi hàm được truyền từ props
    if (openAddModal) {
      openAddModal(songId);
    } else {
      console.error("openAddModal function is missing!");
    }
  };
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center h-full p-6 bg-gradient-to-b from-white to-[#f0f9ff] rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Chưa có bài hát đang phát</p>
          <p className="text-gray-500 text-sm mt-2">
            Hãy chọn một bài hát để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  const imageSrc = currentSong.image_url
    ? `${api.defaults.baseURL}${currentSong.image_url}`
    : null;
  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) {
      return "Nghệ sĩ không xác định";
    }
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-gradient-to-b from-white to-[#f0f9ff] rounded-xl shadow-lg overflow-hidden h-full"
    >
      {/* PHẦN THÔNG TIN BÀI HÁT & ĐIỀU KHIỂN */}
      <div
        className={`p-6 transition-all duration-500 ${
          isAnimating
            ? "opacity-0 transform scale-95"
            : "opacity-100 transform scale-100"
        }`}
      >
        {/* Album Art */}
        <div className="flex flex-col items-center mb-6">
          {imageSrc ? (
            <div className="w-56 h-56 overflow-hidden rounded-xl shadow-lg mb-4 group relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              <button
                onClick={onExpand}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70"
                title="Toàn màn hình"
              >
                <FiMaximize2 size={16} />
              </button>
              <img
                className="w-full h-full object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                src={getImageUrl(currentSong.image_url)}
                alt={currentSong.title}
              />
            </div>
          ) : (
            <div className="w-56 h-56 bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <svg
                className="w-24 h-24 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <button
                onClick={onExpand}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black/70"
                title="Toàn màn hình"
              >
                <FiMaximize2 size={16} />
              </button>
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}

          <div className="text-center w-full">
            <h3 className="text-2xl font-bold text-gray-800 truncate w-full mb-1">
              {currentSong.title}
            </h3>
            <p className="text-gray-600 text-xl">
              {displayArtistNames(currentSong.artists)}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-base text-gray-500 mb-4 px-2">
          <p>{currentSong.country}</p>
          <span>Phát hành: {currentSong.release_year}</span>
        </div>

        {/* Audio Controls */}
        <div className="audio-controls">
          {/* Control Buttons */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-all duration-300 ${
                shuffleMode
                  ? "text-[#7Ab2D3] bg-[#7Ab2D3] bg-opacity-20"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Shuffle"
            >
              <FiShuffle className={shuffleMode ? "fill-current" : ""} />
            </button>

            <button
              onClick={prevSong}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentIndex <= 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 hover:scale-110"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="p-4  bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full hover:shadow-xl hover:scale-110 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              {isPlaying ? (
                <svg
                  className="w-6 h-6 relative z-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 relative z-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={nextSong}
              disabled={currentIndex >= currentPlaylist.length - 1}
              className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentIndex >= currentPlaylist.length - 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 hover:scale-110"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" />
              </svg>
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-all duration-300 ${
                repeatMode
                  ? "text-[#7Ab2D3] bg-[#7Ab2D3] bg-opacity-20"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Repeat"
            >
              <FiRepeat className={repeatMode ? "fill-current" : ""} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="mb-6 relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] rounded-full relative transition-all duration-100"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"></div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center mb-4">
            <svg
              className="w-5 h-5 text-gray-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 relative">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] rounded-full transition-all duration-100"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-all duration-300 ${
                isFavorite
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              }`}
              title="Add to Favorites"
            >
              <FiHeart className={isFavorite ? "fill-current" : ""} />
            </button>

            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300"
                title="More Options"
              >
                <FiMoreHorizontal />
              </button>

              {showOptions && (
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
    <button
      onClick={() => handleOpenAddModal(currentSong.id)}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Thêm vào playlist
    </button>
    {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Chia sẻ bài hát
    </button>
    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      Xem Album
    </button> */}
    <div className="relative group">
      <button
        onClick={() => setShowArtistSubmenu(!showArtistSubmenu)}
        className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span>Xem Nghệ Sĩ</span>
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Submenu hiển thị danh sách nghệ sĩ */}
      {showArtistSubmenu && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-white rounded-lg shadow-lg py-2 z-[60] border border-gray-100">
          {currentSong.artists &&
          currentSong.artists.length > 0 ? (
            currentSong.artists.map((artist, index) => (
              <button
                key={index}
                onClick={() => handleViewArtist(artist.name)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
              >
                {artist.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Không có thông tin
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Toggle Button */}
      <div className="flex justify-center items-center py-3 border-t border-gray-200 bg-white bg-opacity-50">
        <button
          onClick={toggleLyrics}
          className="flex items-center text-gray-600 hover:text-[#7Ab2D3] focus:outline-none transition-colors duration-300"
        >
          <span className="text-sm font-medium">
            {showLyrics ? "Ẩn lời bài hát" : "Hiện lời bài hát"}
          </span>
          <svg
            className={`w-5 h-5 ml-1 transition-transform duration-300 ${
              showLyrics ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>

      {/* Lyrics Viewer */}
      {showLyrics && (
        <div
          className={`rounded-b-xl bg-gradient-to-b from-gray-900 to-black transition-all duration-500 ${
            isAnimating
              ? "opacity-0 transform translate-y-4"
              : "opacity-100 transform translate-y-0"
          }`}
          style={{ height: `${lyricsHeight}px` }}
        >
          <LyricsViewer />
        </div>
      )}
    </div>
  );
}

export default SongDetails;
