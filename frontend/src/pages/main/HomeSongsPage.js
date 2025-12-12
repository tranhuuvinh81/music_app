import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { AudioContext } from "../../context/AudioContext";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/layout/Footer";
import SongCard from "../../components/ui/SongCard";
import bannerImg from "../../assets/images/116d710d1e61b0cc8debc32470695fff.jpg";
import listenIcon from "../../assets/icon/listen-1.png";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";
import SongInfoModal from "../../components/modals/SongInforModal";

// Component trang chủ chính
function HomeSongsPage() {
  const [displaySongs, setDisplaySongs] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext(); // Lấy hàm từ MainLayout
  const { isAuthenticated } = useContext(AuthContext);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // Chỉ fetch các bài hát nổi bật
    api
      .get("/api/songs")
      .then((res) => setDisplaySongs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0)
      return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
  };

  const toggleMenu = (songId) => {
    setMenuOpenSongId((prevId) => (prevId === songId ? null : songId));
  };

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    openAddModal(songId);
  };

  const toggleFavorite = (songId) => {
    setFavoriteSongs((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  };

  const handlePlaySong = (song, songs, index) => {
    playSong(song, songs, index);
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-6 lg:p-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Khám phá âm nhạc
          </h1>
          <p className="text-white/80 text-sm md:text-lg lg:text-lg">Tìm kiếm và thưởng thức</p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 md:p-6 flex-grow">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">
          Bài hát nổi bật
        </h2>

        {/* Grid of Song Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {(isListExpanded ? displaySongs : displaySongs.slice(0, 10)).map(
            (song, index) => {
              // Check if this song is currently playing
              const isCurrentSong = currentSong && currentSong.id === song.id;
              const isFavorite = favoriteSongs.has(song.id);

              // Format song data for SongCard component
              const songCardData = {
                id: song.id,
                title: song.title,
                artist: displayArtistNames(song.artists),
                // coverImage: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : null,
                coverImage: getImageUrl(song.image_url),
                listenCount: song.listen_count || 0,
              };

              return (
                <div key={song.id} className="relative">
                  <SongCard
                    song={songCardData}
                    isPlaying={isCurrentSong && isPlaying}
                    onPlay={() => handlePlaySong(song, displaySongs, index)}
                    onAddToFavorites={() => toggleFavorite(song.id)}
                    isFavorite={isFavorite}
                    className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md"
                  />

                  {/* Custom Options Menu */}
                  {isAuthenticated && (
                    <div className="absolute top-2 right-2 z-1000">
                      <button
                        onClick={() => toggleMenu(song.id)}
                        className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-200"
                      >
                        <FiMoreHorizontal />
                      </button>
                      {menuOpenSongId === song.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
                          <button
                            onClick={() => handleOpenAddModal(song.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Thêm vào playlist
                          </button>
                          <button
                            onClick={() => setShowInfoModal(true)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Xem thông tin
                          </button>
                          {showInfoModal && (
                            <SongInfoModal
                              song={song}
                              onClose={() => setShowInfoModal(false)}
                            />
                          )}
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Chia sẻ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        {displaySongs.length > 10 && (
          <button
            onClick={toggleListExpansion}
            className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors"
          >
            {isListExpanded ? "Thu gọn" : "Xem thêm..."}
          </button>
        )}
      </div>

      <Footer />
    </>
  );
}

export default HomeSongsPage;