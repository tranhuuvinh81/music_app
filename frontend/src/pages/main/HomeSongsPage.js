// frontend/src/pages/main/HomeSongsPage.js
import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { AudioContext } from "../../context/AudioContext";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/layout/Footer";
import SongCard from "../../components/ui/SongCard";
import bannerImg from "../../assets/images/116d710d1e61b0cc8debc32470695fff.jpg";
import { FiMoreHorizontal } from "react-icons/fi";
import SongInfoModal from "../../components/modals/SongInforModal";

// --- CẤU HÌNH DANH SÁCH BÀI HÁT MUỐN GHIM (ID) ---
// Bạn hãy thay các số này bằng ID bài hát thực tế trong Database của bạn
const PINNED_SONG_IDS = [214, 268, 251, 244, , 496]; 

function HomeSongsPage() {
  const [pinnedSongs, setPinnedSongs] = useState([]); // Danh sách ghim
  const [trendingSongs, setTrendingSongs] = useState([]); // Danh sách top views còn lại
  
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);
  
  // State quản lý Modal Info
  const [selectedSongForInfo, setSelectedSongForInfo] = useState(null);

  useEffect(() => {
    api
      .get("/api/songs")
      .then((res) => {
        const allSongs = res.data;

        // 1. Lọc ra các bài được GHIM
        const pinned = allSongs.filter(song => PINNED_SONG_IDS.includes(song.id));
        // Sắp xếp lại theo đúng thứ tự trong mảng config PINNED_SONG_IDS
        pinned.sort((a, b) => PINNED_SONG_IDS.indexOf(a.id) - PINNED_SONG_IDS.indexOf(b.id));

        // 2. Các bài còn lại (Trending) - Loại bỏ bài đã ghim để tránh trùng
        const others = allSongs.filter(song => !PINNED_SONG_IDS.includes(song.id));

        setPinnedSongs(pinned);
        setTrendingSongs(others);
      })
      .catch((err) => console.error(err));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => setIsListExpanded(!isListExpanded);

  const toggleMenu = (songId) => setMenuOpenSongId((prevId) => (prevId === songId ? null : songId));

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    openAddModal(songId);
  };

  const toggleFavorite = (songId) => {
    setFavoriteSongs((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) newFavorites.delete(songId);
      else newFavorites.add(songId);
      return newFavorites;
    });
  };

  // Hàm render chung cho danh sách bài hát để code gọn hơn
  const renderSongGrid = (songs) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {songs.map((song, index) => {
          const isCurrentSong = currentSong && currentSong.id === song.id;
          const isFavorite = favoriteSongs.has(song.id);
          
          const songCardData = {
            id: song.id,
            title: song.title,
            artist: displayArtistNames(song.artists),
            coverImage: getImageUrl(song.image_url),
            listenCount: song.listen_count || 0,
          };

          return (
            <div key={song.id} className="relative group">
              <SongCard
                song={songCardData}
                isPlaying={isCurrentSong && isPlaying}
                onPlay={() => handlePlaySong(song, songs, index)} // Phát trong context danh sách hiện tại
                onAddToFavorites={() => toggleFavorite(song.id)}
                isFavorite={isFavorite}
                className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md hover:shadow-xl transition-all duration-300"
              />

              {/* Menu Option */}
              {isAuthenticated && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMenu(song.id); }}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white shadow-sm"
                  >
                    <FiMoreHorizontal />
                  </button>
                  {menuOpenSongId === song.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden animate-fade-in-down">
                      <button
                        onClick={() => handleOpenAddModal(song.id)}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#7Ab2D3] transition-colors"
                      >
                        Thêm vào playlist
                      </button>
                      <button
                        onClick={() => { setMenuOpenSongId(null); setSelectedSongForInfo(song); }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#7Ab2D3] transition-colors"
                      >
                        Xem thông tin
                      </button>
                      <button className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#7Ab2D3] transition-colors">
                        Chia sẻ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handlePlaySong = (song, playlist, index) => {
    playSong(song, playlist, index);
  };

  return (
    <>
      {/* BANNER */}
      <div className="relative h-48 md:h-64 lg:h-80 flex-shrink-0">
        <img
          src={bannerImg}
          alt="Music Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="font-genos absolute bottom-0 left-0 p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            "Mùa xuân đến bình yên, cho anh những giấc mơ"
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light">- Nơi này có anh -</p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 md:p-8 flex-grow space-y-10">
        
        {/* 1. SECTION: GHIM (PINNED / RECOMMENDED) */}
        {pinnedSongs.length > 0 && (
            <section>
                <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#7Ab2D3] to-[#4A90E2] rounded-full mr-3"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Bài hát nổi bật
                    </h2>
                </div>
                {renderSongGrid(pinnedSongs)}
            </section>
        )}

        {/* 2. SECTION: TRENDING (TOP VIEWS) */}
        <section>
             <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full mr-3"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Có thể bạn sẽ thích
                </h2>
            </div>
            
            {/* Chỉ hiển thị 10 bài đầu tiên nếu chưa mở rộng */}
            {renderSongGrid(isListExpanded ? trendingSongs : trendingSongs.slice(0, 10))}
            
            {trendingSongs.length > 10 && (
            <div className="flex justify-center mt-8">
                <button
                    onClick={toggleListExpansion}
                    className="px-8 py-3 rounded-full border-2 border-[#7Ab2D3] text-[#7Ab2D3] font-bold hover:bg-[#7Ab2D3] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    {isListExpanded ? "Thu gọn danh sách" : "Xem tất cả bài hát"}
                </button>
            </div>
            )}
        </section>

      </div>

      {/* GLOBAL MODAL INFO */}
      {selectedSongForInfo && (
        <SongInfoModal
          song={selectedSongForInfo}
          onClose={() => setSelectedSongForInfo(null)}
        />
      )}

      <Footer />
    </>
  );
}

export default HomeSongsPage;