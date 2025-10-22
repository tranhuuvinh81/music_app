// frontend/src/components/AudioPlayer.js
import React, { useContext } from "react";
import { AudioContext } from "../context/AudioContext";

// hàm helper để format giây sang MM:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  // Thêm '0' vào trước nếu số giây < 10 (ví dụ: 3:05 thay vì 3:5)
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};
const displayArtistNames = (artistsArray) => {
  if (!artistsArray || artistsArray.length === 0) {
    return "Unknown Artist";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
};

function AudioPlayer() {
  const {
    currentSong,
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
    currentPlaylist,
    currentIndex,
  } = useContext(AudioContext);

  if (!currentSong) return null;

  const currentSongObj = currentPlaylist[currentIndex] || {};
  const songTitle = currentSongObj.title || "Loading...";
  // Sử dụng hàm helper để lấy tên nghệ sĩ
  const songArtist = displayArtistNames(currentSongObj.artists);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-1 shadow-lg z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSong}
            disabled={currentIndex <= 0}
            className={`p-1 rounded-full ${
              currentIndex <= 0
                ? "text-gray-500 cursor-not-allowed"
                : "text-white hover:bg-gray-800"
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 13 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="p-1 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
            className={`p-1 rounded-full ${
              currentIndex >= currentPlaylist.length - 1
                ? "text-gray-500 cursor-not-allowed"
                : "text-white hover:bg-gray-800"
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 13 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168L4.555 5.168z" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 mx-2 text-center">
          {/* Tên bài hát + ca sĩ */}
          <div className="text-base truncate mb-1 w-full">
            {songTitle} - {songArtist}
          </div>

          {/* Thanh progress + thời lượng */}
          <div className="flex items-center justify-center space-x-2 w-[300px]">
            {/* Thời gian hiện tại */}
            <span className="text-xs text-gray-400 w-8 text-right">
              {formatTime(currentTime)}
            </span>

            {/* Thanh progress bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-0.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />

            {/* Tổng thời lượng */}
            <span className="text-xs text-gray-400 w-8 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <svg
            className="w-5 h-5 text-gray-400"
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
            className="w-16 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <style jsx>{`
        /* Cấu hình chung cho thanh trượt */
        input[type="range"] {
          transition: all 0.3s ease-in-out;
        }

        /* Thumb (nút tròn) - ẩn mặc định */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 6px;
          height: 6px;
          background: #8e8e8ef7;
          cursor: pointer;
          border-radius: 50%;
          opacity: 0.5;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        input[type="range"]:hover::-webkit-slider-thumb {
          opacity: 1;
          transform: scale(1.5);
        }

        /* Firefox */
        input[type="range"]::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: #8e8e8ef7;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          opacity: 0;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        input[type="range"]:hover::-moz-range-thumb {
          opacity: 1;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}

export default AudioPlayer;
