// frontend/src/components/SongDetails.js
import React, { useContext, useState } from "react";
import { AudioContext } from "../context/AudioContext";
import api from "../api/api";
import LyricsViewer from "./LyricsViewer";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

function SongDetails() {
  const { currentPlaylist, currentIndex } = useContext(AudioContext);
  const currentSong = currentPlaylist[currentIndex];

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
  } = useContext(AudioContext);

  const [showLyrics, setShowLyrics] = useState(false);

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-gray-500 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          <p>Chưa có bài hát đang phát</p>
        </div>
      </div>
    );
  }

  const imageSrc = currentSong.image_url
    ? `${api.defaults.baseURL}${currentSong.image_url}`
    : null;
const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) {
      return 'Nghệ sĩ không xác định';
    }
    return artistsArray.map(artist => artist.name).join(', '); // Nối tên bằng dấu phẩy
  };
  return (
    <div className="flex flex-col h-full bg-white rounded-lg p-2 overflow-hidden">
      {/* PHẦN THÔNG TIN BÀI HÁT & ĐIỀU KHIỂN */}
      <div className="p-6 flex-shrink-0">
        {/* ... (Phần ảnh) ... */}
        <div className="flex flex-col items-center mb-6">
          {imageSrc ? (
            <div className="w-56 h-56 overflow-hidden rounded-lg shadow-md mb-4 group">
              <img
                className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                src={imageSrc}
                alt={currentSong.title}
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-24 h-24 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 truncate w-full">
              {currentSong.title}
            </h3>
            <p className="text-gray-600">{displayArtistNames(currentSong.artists)}</p>
            
          </div>
          
        </div>
        <div className="text-right text-xs text-gray-500 mb-2">
              <p>{currentSong.genre}</p>
            <span>Phát hành: {currentSong.release_year}</span>
            </div>

        {/* ... (Phần audio-controls) ... */}
        <div className="audio-controls">
          {/* ... (Nút prev, play, next) ... */}
          <div className="flex justify-center items-center mb-4">
            <button
              onClick={prevSong}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full ${
                currentIndex <= 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 13 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="p-3 mx-4 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors shadow-md"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
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
                  className="w-6 h-6"
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
              className={`p-2 rounded-full ${
                currentIndex >= currentPlaylist.length - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 15 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" />
              </svg>
            </button>
          </div>
          {/* ... (Thanh progress bar) ... */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          {/* ... (Phần volume) ... */}
          <div className="flex items-center">
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
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ml-2"
            />
          </div>
        </div>
      </div>
      


      {/* NÚT BẤM HIỂN THỊ LYRICS */}
      <div className="flex justify-center items-center py-2 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={toggleLyrics}
          className="flex items-center text-gray-500 hover:text-gray-800 focus:outline-none"
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

      {/* PHẦN HIỂN THỊ LYRICS (Conditional) */}
      {showLyrics && (
        <div className="overflow-hidden rounded-xl bg-gray-900">
          {/* LyricsViewer đã có overflow-y-auto bên trong nó */}
          <LyricsViewer />
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default SongDetails;
