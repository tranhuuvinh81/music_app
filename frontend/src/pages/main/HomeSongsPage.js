import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import Footer from '../../components/layout/Footer';
import bannerImg from '../../assets/images/116d710d1e61b0cc8debc32470695fff.jpg';
import listenIcon from '../../assets/icon/listen-1.png';

// Hàm helper để render danh sách bài hát (tái sử dụng)
export const SongList = ({ songs, onPlay, onOpenModal, displayArtistNames }) => {
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const { isAuthenticated } = useContext(AuthContext); // Lấy AuthContext

  const toggleMenu = (songId) => {
    setMenuOpenSongId(prevId => (prevId === songId ? null : songId));
  };

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    onOpenModal(songId); // Gọi hàm từ context
  };

  return (
    <ul className="space-y-4">
      {songs.map((song, index) => (
        <li key={song.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 min-w-0">
            {song.image_url && (
              <img src={`${api.defaults.baseURL}${song.image_url}`} alt={song.title} className="w-12 h-12 object-cover rounded flex-shrink-0" />
            )}
            <div className="min-w-0">
              <strong className="block text-gray-900 truncate">{song.title}</strong>
              <p className="text-gray-600 truncate">{displayArtistNames(song.artists)}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <img src={listenIcon} alt="Lượt nghe" className="w-4 h-4" />
                <span className="ml-1">{song.listen_count ? song.listen_count.toLocaleString() : 0}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button onClick={() => onPlay(song, songs, index)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            </button>
            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => toggleMenu(song.id)} className="p-2 text-gray-600 hover:text-gray-800">...</button>
                {menuOpenSongId === song.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button onClick={() => handleOpenAddModal(song.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Thêm vào playlist
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

// Component trang chủ chính
function HomeSongsPage() {
  const [displaySongs, setDisplaySongs] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const { playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext(); // Lấy hàm từ MainLayout

  useEffect(() => {
    // Chỉ fetch các bài hát nổi bật
    api.get("/api/songs")
      .then((res) => setDisplaySongs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
  };

  return (
    <>
      {/* BANNER */}
      <div className="relative h-64 md:h-80 lg:h-76 flex-shrink-0">
        <img src={bannerImg} alt="Music Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Khám phá âm nhạc</h1>
          <p className="text-white/80 text-lg">Tìm kiếm và thưởng thức</p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Bài hát nổi bật</h2>
        <SongList
          songs={isListExpanded ? displaySongs : displaySongs.slice(0, 10)}
          onPlay={playSong}
          onOpenModal={openAddModal}
          displayArtistNames={displayArtistNames}
        />
        {displaySongs.length > 10 && (
          <button onClick={toggleListExpansion} className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors">
            {isListExpanded ? "Thu gọn" : "Xem thêm..."}
          </button>
        )}
      </div>
      
      <Footer />
    </>
  );
}

export default HomeSongsPage;