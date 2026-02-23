// frontend/src/pages/main/ArtistsPage.js
import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { AudioContext } from "../../context/AudioContext";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../../components/ui";
import SongCard from "../../components/ui/SongCard";
import { FiMoreHorizontal, FiPlay } from "react-icons/fi"; // [SỬA] Thêm FiPlay
import SongInfoModal from "../../components/modals/SongInforModal";

const PINNED_ARTIST_IDS = [1, 2, 5, 8]; 

// Component cho card nghệ sĩ
// [SỬA] Thêm prop onPlayRandom
const ArtistCard = ({ artist, onClick, onViewDetails, onPlayRandom }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border border-gray-100">
      <div className="relative aspect-square overflow-hidden" onClick={() => onClick(artist.name)}>
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        )}
        
        {/* [SỬA] Overlay hiệu ứng khi hover (Đã thêm nút Play) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <button
               onClick={(e) => {
                 e.stopPropagation(); // Ngăn sự kiện click mở danh sách bài hát
                 if (onPlayRandom) onPlayRandom(artist.name);
               }}
               className="p-3 bg-white bg-opacity-90 rounded-full text-[#4A90E2] hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
               title="Phát ngẫu nhiên"
             >
               <FiPlay className="text-xl pl-1" fill="currentColor" />
             </button>
        </div>
      </div>
      
      <div className="p-4 text-center">
        <h3 className="font-bold text-lg text-gray-800 truncate mb-2">{artist.name}</h3>
        <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onViewDetails(artist); }}
            className="w-full text-xs"
        >
            Thông tin
        </Button>
      </div>
    </div>
  );
};

function ArtistsPage() {
  const [pinnedArtists, setPinnedArtists] = useState([]);
  const [otherArtists, setOtherArtists] = useState([]);
  
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  
  const [isListExpanded, setIsListExpanded] = useState(false); 
  const [isArtistListExpanded, setIsArtistListExpanded] = useState(false); 

  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const [selectedSongForInfo, setSelectedSongForInfo] = useState(null);
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal, openArtistModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  useEffect(() => {
    api
      .get("/api/artists")
      .then((res) => {
        const allArtists = res.data;
        
        const pinned = allArtists.filter(a => PINNED_ARTIST_IDS.includes(a.id));
        pinned.sort((a, b) => PINNED_ARTIST_IDS.indexOf(a.id) - PINNED_ARTIST_IDS.indexOf(b.id));

        const others = allArtists.filter(a => !PINNED_ARTIST_IDS.includes(a.id));

        setPinnedArtists(pinned);
        setOtherArtists(others);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      api
        .get(`/api/songs/artist/${encodeURIComponent(selectedArtist)}`)
        .then((res) => setDisplaySongs(res.data))
        .catch((err) => console.error(err));

      setIsListExpanded(false);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedArtist]);

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => setIsListExpanded(!isListExpanded);
  const toggleArtistListExpansion = () => setIsArtistListExpanded(!isArtistListExpanded);

  const toggleMenu = (songId) => setMenuOpenSongId(prevId => (prevId === songId ? null : songId));

  const handleOpenAddModal = (songId) => {
    setMenuOpenSongId(null);
    openAddModal(songId);
  };

  const toggleFavorite = (songId) => {
    setFavoriteSongs(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) newFavorites.delete(songId);
      else newFavorites.add(songId);
      return newFavorites;
    });
  };

  const handlePlaySong = (song, songs, index) => {
    playSong(song, songs, index);
  };

  // --- [MỚI] HÀM PHÁT NGẪU NHIÊN BÀI HÁT TỪ NGHỆ SĨ ---
  const playRandomSongFromArtist = async (artistName) => {
    try {
      const res = await api.get(`/api/songs/artist/${encodeURIComponent(artistName)}`);
      const songs = res.data || [];
      
      if (songs.length > 0) {
        // 1. Copy mảng để không ảnh hưởng dữ liệu gốc
        const shuffledSongs = [...songs];
        
        // 2. Thuật toán Fisher-Yates xáo trộn mảng
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        
        // 3. Đưa danh sách đã xáo trộn vào Player (phát bài đầu tiên)
        playSong(shuffledSongs[0], shuffledSongs, 0);
        
        // 4. Mở danh sách bài hát của nghệ sĩ ra (Giao diện vẫn giữ nguyên thứ tự gốc)
        setSelectedArtist(artistName);
        setDisplaySongs(songs);
      } else {
        alert("Nghệ sĩ này hiện chưa có bài hát nào!");
      }
    } catch (error) {
      console.error("Lỗi khi phát ngẫu nhiên bài hát của nghệ sĩ:", error);
    }
  };

  // --- RENDER HÀM CON ---
  // [SỬA] Truyền hàm playRandomSongFromArtist vào ArtistCard
  const renderArtistGrid = (artists) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        {artists.map((artist) => (
            <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={setSelectedArtist}
            onViewDetails={openArtistModal}
            onPlayRandom={playRandomSongFromArtist} 
            />
        ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 flex-grow">
      
      {/* 1. TRƯỜNG HỢP CHƯA CHỌN NGHỆ SĨ -> HIỂN THỊ DANH SÁCH NGHỆ SĨ */}
      {!selectedArtist ? (
        <div className="space-y-12">
          
          {/* Section: Nghệ sĩ nổi bật (Ghim) */}
          {pinnedArtists.length > 0 && (
            <section>
                <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-3"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Nghệ sĩ tiêu biểu
                    </h2>
                </div>
                {renderArtistGrid(pinnedArtists)}
            </section>
          )}

          {/* Section: Tất cả nghệ sĩ */}
          <section>
             <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#7Ab2D3] to-[#4A90E2] rounded-full mr-3"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Khám phá thêm
                </h2>
            </div>
            
            {renderArtistGrid(isArtistListExpanded ? otherArtists.slice(0, 20) : otherArtists.slice(0, 10))}
            
            {otherArtists.length > 10 && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={toggleArtistListExpansion}
                        className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                    >
                        {isArtistListExpanded ? "Thu gọn danh sách" : "Xem thêm nghệ sĩ"}
                    </button>
                </div>
            )}
          </section>

        </div>
      ) : (
        
        /* 2. TRƯỜNG HỢP ĐÃ CHỌN NGHỆ SĨ -> HIỂN THỊ BÀI HÁT CỦA HỌ */
        <div className="animate-fade-in-up">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setSelectedArtist(null)}
              className="mr-4 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm flex items-center text-gray-700 font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Quay lại
            </button>
            <h2 className="text-3xl font-bold text-gray-800">
              Tuyển tập: <span className="text-[#4A90E2]">{selectedArtist}</span>
            </h2>
          </div>
          
          {/* Grid of Song Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {(isListExpanded ? displaySongs : displaySongs.slice(0, 10)).map((song, index) => {
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
                <div key={song.id} className="relative group">
                  <SongCard
                    song={songCardData}
                    isPlaying={isCurrentSong && isPlaying}
                    onPlay={() => handlePlaySong(song, displaySongs, index)}
                    onAddToFavorites={() => toggleFavorite(song.id)}
                    isFavorite={isFavorite}
                    className="bg-white shadow-md hover:shadow-xl transition-all duration-300"
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
          
          {displaySongs.length > 10 && (
            <div className="flex justify-center mt-8">
                <button
                onClick={toggleListExpansion}
                className="px-8 py-2 rounded-full border border-[#7Ab2D3] text-[#7Ab2D3] font-medium hover:bg-[#7Ab2D3] hover:text-white transition-all duration-300"
                >
                {isListExpanded ? "Thu gọn" : "Xem thêm bài hát"}
                </button>
            </div>
          )}
        </div>
      )}

      {/* Global Modal Info */}
      {selectedSongForInfo && (
        <SongInfoModal
          song={selectedSongForInfo}
          onClose={() => setSelectedSongForInfo(null)}
        />
      )}
    </div>
  );
}

export default ArtistsPage;