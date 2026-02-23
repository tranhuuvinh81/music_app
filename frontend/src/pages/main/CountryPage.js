// frontend/src/pages/main/CountryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiMoreHorizontal, FiPlay } from 'react-icons/fi'; // [SỬA] Thêm FiPlay
import SongInfoModal from "../../components/modals/SongInforModal";

// Component cho card quốc gia
// [SỬA] Thêm prop onPlayRandom
const CountryCard = ({ country, onClick, onPlayRandom }) => {
  const getCountryFlag = (countryName) => {
    const flagMap = {
      'Việt Nam': '🇻🇳', 'Hàn Quốc': '🇰🇷', 'Nhật Bản': '🇯🇵',
      'Trung Quốc': '🇨🇳', 'Mỹ': '🇺🇸', 'Anh': '🇬🇧',
      'Pháp': '🇫🇷', 'Đức': '🇩🇪', 'Ý': '🇮🇹', 'Tây Ban Nha': '🇪🇸',
    };
    return flagMap[countryName] || '🎵';
  };

  return (
    <div 
      onClick={() => onClick(country)}
      className="bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square group">
        <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
          <span className="text-6xl">{getCountryFlag(country)}</span>
        </div>
        
        {/* [SỬA] Overlay hiệu ứng khi hover (Đã thêm nút Play) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 if (onPlayRandom) onPlayRandom(country);
               }}
               className="p-3 bg-white bg-opacity-90 rounded-full text-[#4A90E2] hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
               title="Phát ngẫu nhiên"
             >
               <FiPlay className="text-xl pl-1" fill="currentColor" />
             </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate text-center">{country}</h3>
      </div>
    </div>
  );
};

function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  useEffect(() => {
    api.get('/api/songs/countries')
      .then(res => setCountries(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      api.get(`/api/songs/country/${encodeURIComponent(selectedCountry)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
      setIsListExpanded(false);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedCountry]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
  };

  const toggleMenu = (songId) => {
    setMenuOpenSongId(prevId => (prevId === songId ? null : songId));
  };

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    openAddModal(songId);
  };

  const toggleFavorite = (songId) => {
    setFavoriteSongs(prev => {
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

  // --- [MỚI] HÀM PHÁT NGẪU NHIÊN BÀI HÁT TỪ QUỐC GIA ---
  const playRandomSongFromCountry = async (countryName) => {
    try {
      const res = await api.get(`/api/songs/country/${encodeURIComponent(countryName)}`);
      const songs = res.data || [];
      
      if (songs.length > 0) {
        const shuffledSongs = [...songs];
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        playSong(shuffledSongs[0], shuffledSongs, 0);
        setSelectedCountry(countryName);
        setDisplaySongs(songs);
      } else {
        alert("Chưa có bài hát nào thuộc quốc gia này!");
      }
    } catch (error) {
      console.error("Lỗi khi phát ngẫu nhiên bài hát quốc gia:", error);
    }
  };

  return (
    <div className="p-6 flex-grow">
      {!selectedCountry ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Âm nhạc theo Quốc gia</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {countries.map((country) => (
              <CountryCard
                key={country}
                country={country}
                onClick={setSelectedCountry}
                onPlayRandom={playRandomSongFromCountry} // [SỬA] Truyền hàm
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedCountry(null)} 
              className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Bài hát: <span className="text-[#4A90E2]">{selectedCountry}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {(isListExpanded ? displaySongs.slice(0, 20) : displaySongs.slice(0, 10)).map((song, index) => {
              const isCurrentSong = currentSong && currentSong.id === song.id;
              const isFavorite = favoriteSongs.has(song.id);
              
              const songCardData = {
                id: song.id,
                title: song.title,
                artist: displayArtistNames(song.artists),
                coverImage: getImageUrl(song.image_url),
                listenCount: song.listen_count || 0
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
                  
                  {isAuthenticated && (
                    <div className="absolute top-2 right-2 z-1000">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleMenu(song.id); }} 
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
                            onClick={() => { setMenuOpenSongId(null); setShowInfoModal(true); }}
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
            })}
          </div>
          
          {displaySongs.length > 10 && (
            <button 
              onClick={toggleListExpansion} 
              className="mt-4 w-full py-2 text-center text-[#7Ab2D3] border border-[#7Ab2D3] rounded-full hover:bg-[#7Ab2D3] hover:text-white font-medium transition-colors"
            >
              {isListExpanded ? "Thu gọn" : "Xem thêm..."}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CountryPage;