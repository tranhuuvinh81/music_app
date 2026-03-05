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

function HomeSongsPage() {
  // [NEW] Thay vì pinnedSongs đơn lẻ, ta dùng mảng các Blocks
  const [songBlocks, setSongBlocks] = useState([]); 
  const [trendingSongs, setTrendingSongs] = useState([]); 
  
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [selectedSongForInfo, setSelectedSongForInfo] = useState(null);

  // useEffect(() => {
  //   Promise.all([
  //     api.get("/api/songs"),
  //     api.get("/api/settings/pinned_song_ids")
  //   ]).then(([songsRes, settingsRes]) => {
  //       const allSongs = songsRes.data;
  //       const rawSettings = settingsRes.data || []; 
        
  //       let blocks = [];
  //       let allPinnedIds = new Set(); // Dùng Set để dễ dàng lọc ra Trending Songs

  //       // Kiểm tra cấu trúc dữ liệu từ DB
  //       if (Array.isArray(rawSettings) && rawSettings.length > 0) {
  //           if (typeof rawSettings[0] === 'object') {
  //               // Đây là dữ liệu Dynamic CMS mới
  //               blocks = rawSettings.map(block => {
  //                   // Map IDs thành Object Song thực tế
  //                   const songsInBlock = block.songIds
  //                       .map(id => allSongs.find(s => s.id === id))
  //                       .filter(Boolean); // Bỏ qua nếu id đó đã bị xóa khỏi DB
                    
  //                   block.songIds.forEach(id => allPinnedIds.add(id));
                    
  //                   return { ...block, songs: songsInBlock };
  //               });
  //           } else {
  //               // Fallback nếu trong DB vẫn là mảng ID cũ
  //               const pinned = allSongs.filter(song => rawSettings.includes(song.id));
  //               pinned.sort((a, b) => rawSettings.indexOf(a.id) - rawSettings.indexOf(b.id));
  //               blocks = [{ id: 'legacy', title: 'Bài hát nổi bật', songs: pinned }];
  //               rawSettings.forEach(id => allPinnedIds.add(id));
  //           }
  //       }

  //       // Các bài hát còn lại cho vào Trending (Sắp xếp theo view giảm dần)
  //       const others = allSongs
  //           .filter(song => !allPinnedIds.has(song.id))
  //           .sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0));

  //       setSongBlocks(blocks);
  //       setTrendingSongs(others);
  //   }).catch((err) => console.error(err));
  // }, []);
  // Cập nhật useEffect: Chỉ gọi 1 API duy nhất
  useEffect(() => {
    api.get("/api/songs/home-data")
      .then((res) => {
         // Dữ liệu đã được Backend đóng gói sẵn chuẩn xác 100%
         setSongBlocks(res.data.blocks || []);
         setTrendingSongs(res.data.trending || []);
      })
      .catch((err) => console.error("Lỗi tải Home Data:", err));
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
  const handleOpenAddModal = (songId) => { setMenuOpenSongId(null); openAddModal(songId); };
  const toggleFavorite = (songId) => {
    setFavoriteSongs((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) newFavorites.delete(songId);
      else newFavorites.add(songId);
      return newFavorites;
    });
  };

  const renderSongGrid = (songs) => {
    if (!songs || songs.length === 0) return <p className="text-gray-500 italic">Chưa có bài hát nào.</p>;

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
                onPlay={() => playSong(song, songs, index)} 
                onAddToFavorites={() => toggleFavorite(song.id)}
                isFavorite={isFavorite}
                className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md hover:shadow-xl transition-all duration-300"
              />

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


  return (
    <>
      {/* BANNER */}
      <div className="relative h-48 md:h-64 lg:h-80 flex-shrink-0">
        <img src={bannerImg} alt="Music Banner" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="font-genos absolute bottom-0 left-0 p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
            "Mùa xuân đến bình yên, cho anh những giấc mơ"
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light">- Nơi này có anh -</p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 md:p-8 flex-grow space-y-12">
        
        {/* 1. DYNAMIC BLOCKS: Hiển thị các khối Admin cấu hình */}
        {songBlocks.map((block, index) => {
            // Chỉ render những block có bài hát
            if (!block.songs || block.songs.length === 0) return null;
            
            // Đổi màu Gradient cho thanh dọc theo index để đẹp hơn
            const gradientColors = [
                'from-[#7Ab2D3] to-[#4A90E2]',
                'from-pink-400 to-rose-500',
                'from-emerald-400 to-teal-500',
                'from-amber-400 to-orange-500'
            ];
            const colorClass = gradientColors[index % gradientColors.length];

            return (
                <section key={block.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                    <div className="flex items-center mb-6">
                        <div className={`w-1.5 h-8 bg-gradient-to-b ${colorClass} rounded-full mr-3`}></div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                            {block.title}
                        </h2>
                    </div>
                    {renderSongGrid(block.songs)}
                </section>
            );
        })}

        {/* 2. SECTION: TRENDING (Bài hát còn lại) */}
        {trendingSongs.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: `${songBlocks.length * 100}ms`}}>
                <div className="flex items-center mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full mr-3"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                        Có thể bạn sẽ thích
                    </h2>
                </div>
                
                {renderSongGrid(isListExpanded ? trendingSongs.slice(0, 20) : trendingSongs.slice(0, 10))}
                
                {trendingSongs.length > 10 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={toggleListExpansion}
                        className="px-8 py-3 rounded-full border-2 border-[#7Ab2D3] text-[#7Ab2D3] font-bold hover:bg-[#7Ab2D3] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        {isListExpanded ? "Thu gọn danh sách" : "Xem thêm bài hát"}
                    </button>
                </div>
                )}
            </section>
        )}

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