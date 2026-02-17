// frontend/src/pages/main/PlaylistPage.js
import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { AudioContext } from "../../context/AudioContext";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiMusic, FiPlay, FiMoreHorizontal } from "react-icons/fi";
import PlaylistForm from "../../components/forms/PlaylistForm";
import EditPlaylistModal from "../../components/forms/EditPlaylistModal";
import SongCard from "../../components/ui/SongCard";
import SongInfoModal from "../../components/modals/SongInforModal";


// --- HELPERS ---
const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

const displayArtistNames = (artistsArray) => {
  if (!Array.isArray(artistsArray) || artistsArray.length === 0) {
    return "Nghệ sĩ không xác định";
  }
  return artistsArray.map((artist) => artist.name).join(", ");
};

// Helper để lấy tên nghệ sĩ đầu tiên (dùng cho logic đề xuất)
const getFirstArtistName = (song) => {
  if (Array.isArray(song.artists) && song.artists.length > 0) return song.artists[0].name;
  if (typeof song.artist === 'string') return song.artist;
  return "";
};

// Component cho card playlist
const PlaylistCard = ({ 
  playlist, 
  isActive, 
  onClick, 
  onEdit, 
  onDelete, 
  onPlayRandom,
  songCount 
}) => {
  return (
    <div 
      onClick={() => onClick(playlist.id)}
      className={`relative overflow-hidden rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${
        isActive ? 'ring-2 ring-[#7Ab2D3] ring-opacity-70' : ''
      }`}
    >
      <div className="aspect-square relative group">
        {playlist.thumbnail_url ? (
          <img
            src={getImageUrl(playlist.thumbnail_url)}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <FiMusic className="text-white text-4xl" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium">Xem chi tiết</p>
        </div> */}
        
        {/* Play button overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayRandom(playlist.id);
            }}
            className="p-3 bg-white bg-opacity-80 rounded-full text-[#7Ab2D3] hover:bg-opacity-100 transition-all duration-300 hover:scale-110"
            title="Phát ngẫu nhiên"
          >
            <FiPlay className="text-xl" />
          </button>
        </div>
        
        {/* Song count badge -- Đang lỗi, sẽ fix sau*/}
        {/* <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {songCount} bài
        </div> */}
      </div>
      
      <div className="p-4 bg-white">
        <h3 className="font-bold text-gray-800 truncate">{playlist.name}</h3>
        <p className="text-gray-600 text-sm truncate mt-1">{playlist.description || "Chưa có mô tả"}</p>
        
        <div className="flex justify-end mt-3 space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(playlist)}
            className="p-2 rounded-full text-gray-500 hover:text-[#7Ab2D3] hover:bg-[#7Ab2D3] hover:bg-opacity-10 transition-all duration-300"
            title="Chỉnh sửa"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onDelete(playlist.id)}
            className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
            title="Xóa"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

function PlaylistPage() {
  // State cơ bản
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [playlistSongsCount, setPlaylistSongsCount] = useState({});
  
  // State cho bộ lọc và sắp xếp playlist hiện tại
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // State quản lý Modal/Form
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);

  // State cho chức năng "Thêm bài hát"
  const [searchAddQuery, setSearchAddQuery] = useState("");
  const [searchAddResults, setSearchAddResults] = useState([]);
  const [isSearchingAdd, setIsSearchingAdd] = useState(false);

  // State cho chức năng "Đề xuất"
  const [recommendations, setRecommendations] = useState([]);

  const { user, isAuthenticated } = useContext(AuthContext);
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);

  const [showInfoModal, setShowInfoModal] = useState(false);
  

  // Fetch danh sách Playlist
  const fetchPlaylists = useCallback(() => {
    if (isAuthenticated && user?.id) {
      api.get(`/api/playlists/user/${user.id}`)
        .then((res) => {
          setPlaylists(res.data);
          // Fetch song count for each playlist
          const playlistIds = res.data.map(p => p.id);
          const countPromises = playlistIds.map(id => 
            api.get(`/api/playlists/${id}/songs/count`)
              .then(res => ({ id, count: res.data.count }))
              .catch(() => ({ id, count: 0 }))
          );
          
          Promise.all(countPromises)
            .then(results => {
              const counts = {};
              results.forEach(({ id, count }) => {
                counts[id] = count;
              });
              setPlaylistSongsCount(counts);
            });
        })
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Logic Lọc và Sắp xếp (Client-side)
  const processedSongs = useMemo(() => {
    let result = [...playlistSongs];

    // Lọc
    if (filterQuery) {
      const lowerQuery = filterQuery.toLowerCase();
      result = result.filter((song) => {
        const titleMatch = song.title?.toLowerCase().includes(lowerQuery);
        let artistMatch = false;
        if (Array.isArray(song.artists)) {
          artistMatch = song.artists.some(artist => artist.name?.toLowerCase().includes(lowerQuery));
        } else if (typeof song.artist === 'string') {
          artistMatch = song.artist.toLowerCase().includes(lowerQuery);
        }
        return titleMatch || artistMatch;
      });
    }

    // Sắp xếp
    if (sortBy === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist_asc') {
      result.sort((a, b) => {
        const artistA = getFirstArtistName(a);
        const artistB = getFirstArtistName(b);
        return artistA.localeCompare(artistB);
      });
    }

    return result;
  }, [playlistSongs, filterQuery, sortBy]);

  // Logic Đề xuất bài hát
  const fetchRecommendations = async (baseSong) => {
    if (!baseSong) return;
    
    const artistName = getFirstArtistName(baseSong);
    if (!artistName) return;

    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(artistName)}`);
      const foundSongs = res.data.songs || [];

      // Lọc bỏ những bài đã có trong playlist hiện tại
      const currentSongIds = new Set(playlistSongs.map(s => s.id));
      const newRecs = foundSongs.filter(s => !currentSongIds.has(s.id) && s.id !== baseSong.id);
      
      // Lấy tối đa 5 bài
      setRecommendations(newRecs.slice(0, 5));
    } catch (error) {
      console.error("Lỗi lấy đề xuất:", error);
    }
  };

  // Play random song from playlist (Đã sửa logic xáo trộn)
  const playRandomSongFromPlaylist = async (playlistId) => {
    try {
      const res = await api.get(`/api/playlists/${playlistId}/songs`);
      const songs = res.data || [];
      
      if (songs.length > 0) {
        // 1. Tạo một bản sao của danh sách bài hát để xáo trộn (Tránh ảnh hưởng mảng gốc)
        const shuffledSongs = [...songs];
        
        // 2. Thuật toán Fisher-Yates để xáo trộn mảng ngẫu nhiên
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        
        // 3. Phát bài đầu tiên của danh sách đã xáo trộn
        playSong(shuffledSongs[0], shuffledSongs, 0);
        
        // 4. Cập nhật UI (Vẫn hiển thị danh sách gốc ra màn hình cho đẹp mắt)
        setCurrentPlaylistId(playlistId);
        setPlaylistSongs(songs); 
      }
    } catch (error) {
      console.error("Lỗi khi phát ngẫu nhiên:", error);
    }
  };

  const viewPlaylist = (playlistId) => {
    setCurrentPlaylistId(playlistId);
    setSearchAddQuery("");
    setRecommendations([]);
    
    api.get(`/api/playlists/${playlistId}/songs`)
      .then((res) => {
        const songs = res.data;
        setPlaylistSongs(songs);
        
        // Kích hoạt đề xuất dựa trên bài hát cuối cùng (nếu có)
        if (songs.length > 0) {
          fetchRecommendations(songs[songs.length - 1]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchAddQuery.trim()) {
        setIsSearchingAdd(true);
        try {
          const res = await api.get(`/api/search?q=${encodeURIComponent(searchAddQuery)}`);
          const foundSongs = res.data.songs || [];

          // Lọc bỏ bài đã có trong playlist
          const currentIds = new Set(playlistSongs.map(s => s.id));
          setSearchAddResults(foundSongs.filter(s => !currentIds.has(s.id)));
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingAdd(false);
        }
      } else {
        setSearchAddResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchAddQuery, playlistSongs]);

  // Thêm bài hát vào Playlist
  const handleAddSongToPlaylist = async (song) => {
    try {
      await api.post("/api/playlists/add-song", {
        playlist_id: currentPlaylistId,
        song_id: song.id,
      });

      // Cập nhật UI ngay lập tức
      const newSongList = [...playlistSongs, song];
      setPlaylistSongs(newSongList);
      
      // Cập nhật lại số lượng bài hát
      setPlaylistSongsCount(prev => ({
        ...prev,
        [currentPlaylistId]: (prev[currentPlaylistId] || 0) + 1
      }));
      
      // Xóa bài vừa thêm khỏi danh sách tìm kiếm/đề xuất để tránh thêm trùng
      setSearchAddResults(prev => prev.filter(s => s.id !== song.id));
      setRecommendations(prev => prev.filter(s => s.id !== song.id));

      // Cập nhật lại đề xuất dựa trên bài vừa thêm
      fetchRecommendations(song);

    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thêm bài hát");
    }
  };

  const removeFromPlaylist = async (songId) => {
    if (window.confirm("Xóa bài hát khỏi playlist này?")) {
      try {
        await api.post("/api/playlists/remove-song", {
          playlist_id: currentPlaylistId,
          song_id: songId,
        });
        // Cập nhật state local
        setPlaylistSongs(playlistSongs.filter(s => s.id !== songId));
        
        // Cập nhật lại số lượng bài hát
        setPlaylistSongsCount(prev => ({
          ...prev,
          [currentPlaylistId]: Math.max((prev[currentPlaylistId] || 0) - 1, 0)
        }));
      } catch (err) {
        alert("Lỗi khi xóa bài hát");
      }
    }
  };

  const handlePlaySong = (song, playlist, index) => {
    playSong(song, playlist, index);
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

  const toggleMenu = (songId) => {
    setMenuOpenSongId(prevId => (prevId === songId ? null : songId));
  };

  const handleCreatePlaylist = () => setShowPlaylistForm(true);
  const handlePlaylistFormSubmit = () => { setShowPlaylistForm(false); fetchPlaylists(); };
  const handlePlaylistFormCancel = () => setShowPlaylistForm(false);
  const deletePlaylist = async (playlistId) => {
    if (window.confirm("Xóa playlist này?")) {
      try {
        await api.delete(`/api/playlists/${playlistId}`);
        setPlaylists(playlists.filter((p) => p.id !== playlistId));
        if (currentPlaylistId === playlistId) {
          setCurrentPlaylistId(null);
          setPlaylistSongs([]);
        }
      } catch (err) { alert("Lỗi xóa playlist"); }
    }
  };
  const handleOpenEditModal = (playlist) => { setEditingPlaylist(playlist); setShowEditModal(true); };
  const handleCloseEditModal = () => { setEditingPlaylist(null); setShowEditModal(false); };
  const handleEditSuccess = () => { handleCloseEditModal(); fetchPlaylists(); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Playlist của bạn</h1>
        <button
          onClick={handleCreatePlaylist}
          className="px-4 py-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
        >
          <FiPlus />
          <span>Tạo playlist mới</span>
        </button>
      </div>

      {showPlaylistForm && (
        <div className="mb-8 p-4 bg-white rounded-xl shadow-lg">
          <PlaylistForm onFormSubmit={handlePlaylistFormSubmit} onCancel={handlePlaylistFormCancel} />
        </div>
      )}

      {/* Grid danh sách các Playlist */}
      {!currentPlaylistId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              isActive={currentPlaylistId === playlist.id}
              onClick={viewPlaylist}
              onEdit={handleOpenEditModal}
              onDelete={deletePlaylist}
              onPlayRandom={playRandomSongFromPlaylist}
              songCount={playlistSongsCount[playlist.id] || 0}
            />
          ))}
        </div>
      )}

      {/* KHU VỰC CHI TIẾT PLAYLIST */}
      {currentPlaylistId && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header playlist */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCurrentPlaylistId(null)}
              className="mr-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <FiX />
              <span>Quay lại</span>
            </button>
            <div className="flex items-center space-x-4">
              {playlists.find(p => p.id === currentPlaylistId)?.thumbnail_url ? (
                <img
                  src={getImageUrl(playlists.find(p => p.id === currentPlaylistId)?.thumbnail_url)}
                  alt={playlists.find(p => p.id === currentPlaylistId)?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
                  <FiMusic className="text-white text-2xl" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {playlists.find(p => p.id === currentPlaylistId)?.name}
                </h2>
                <p className="text-gray-600">
                  {playlists.find(p => p.id === currentPlaylistId)?.description || "Chưa có mô tả"}
                </p>
              </div>
            </div>
            <div className="ml-auto flex space-x-2">
              <button
                onClick={() => handleOpenEditModal(playlists.find(p => p.id === currentPlaylistId))}
                className="p-2 rounded-lg text-gray-500 hover:text-[#7Ab2D3] hover:bg-[#7Ab2D3] hover:bg-opacity-10 transition-all duration-300"
              >
                <FiEdit2 />
              </button>
            </div>
          </div>

          {/* Thêm bài hát & Đề xuất */}
          <div className="mb-8 p-4 bg-gradient-to-b from-[#f0f9ff] to-white rounded-xl">
            <div className="flex items-center mb-3">
              <FiSearch className="text-[#7Ab2D3] mr-2" />
              <h3 className="font-bold text-gray-700">Thêm bài hát vào playlist này</h3>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên bài hát hoặc nghệ sĩ để thêm..."
                value={searchAddQuery}
                onChange={(e) => setSearchAddQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7Ab2D3] focus:border-transparent"
              />
              
              {/* Dropdown kết quả tìm kiếm */}
              {searchAddQuery && (
                <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto border border-gray-100">
                  {isSearchingAdd ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Đang tìm kiếm...</div>
                  ) : searchAddResults.length > 0 ? (
                    <ul>
                      {searchAddResults.map(song => (
                        <li key={song.id} className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover" />
                            <div>
                              <div className="font-medium text-sm text-gray-800">{song.title}</div>
                              <div className="text-xs text-gray-500">{displayArtistNames(song.artists)}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAddSongToPlaylist(song)}
                            className="px-3 py-1 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white text-xs rounded-full hover:shadow-md transition-all duration-300"
                          >
                            Thêm
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">Không tìm thấy bài hát nào (hoặc đã có trong playlist)</div>
                  )}
                </div>
              )}
            </div>

            {/* Khu vực Đề xuất bài hát */}
            {recommendations.length > 0 && !searchAddQuery && (
              <div className="mt-4">
                <p className="text-sm mb-2 font-medium flex items-center">
                  Có thể bạn sẽ thích 
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="flex items-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300">
                      <img src={getImageUrl(rec.image_url)} alt="" className="w-10 h-10 rounded object-cover mr-2" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-gray-800 truncate block">{rec.title}</span> 
                        <span className="text-gray-400 mx-1">-</span>
                        <span className="text-gray-500 text-xs truncate">{displayArtistNames(rec.artists)}</span>
                      </div>
                      <button 
                        onClick={() => handleAddSongToPlaylist(rec)}
                        className="text-[#7Ab2D3] hover:text-[#4A90E2] font-bold text-lg leading-none ml-2"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Danh sách bài hát (Toolbar: Filter + Sort) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách bài hát <span className="text-base font-normal text-gray-500">({playlistSongs.length} bài)</span>
            </h2>

            {/* Toolbar Lọc & Sắp xếp */}
            <div className="flex gap-2 w-full md:w-auto">
              {/* Ô lọc */}
              <div className="relative flex-1 md:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Lọc bài hát trong danh sách..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7Ab2D3] focus:ring-2 focus:ring-[#7Ab2D3] focus:ring-opacity-20"
                />
              </div>
              
              {/* Dropdown sắp xếp */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#7Ab2D3] focus:ring-2 focus:ring-[#7Ab2D3] focus:ring-opacity-20"
              >
                <option value="default">Ngày thêm (Mặc định)</option>
                <option value="title_asc">Tên bài (A-Z)</option>
                <option value="artist_asc">Nghệ sĩ (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Danh sách bài hát render */}
          {processedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {processedSongs.map((song, index) => {
                // Check if this song is currently playing
                const isCurrentSong = currentSong && currentSong.id === song.id;
                const isFavorite = favoriteSongs.has(song.id);
                
                // Format song data for SongCard component
                const songCardData = {
                  id: song.id,
                  title: song.title,
                  artist: displayArtistNames(song.artists || song.artist),
                  coverImage: song.image_url ? getImageUrl(song.image_url) : null,
                  listenCount: song.listen_count || 0
                };
                
                return (
                  <div key={song.id} className="relative">
                    <SongCard
                      song={songCardData}
                      isPlaying={isCurrentSong && isPlaying}
                      onPlay={() => handlePlaySong(song, processedSongs, index)}
                      onAddToFavorites={() => toggleFavorite(song.id)}
                      isFavorite={isFavorite}
                      className="bg-gradient-to-b from-white to-[#f0f9ff] shadow-md"
                    />
                    
                    {/* Custom Options Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button 
                        onClick={() => toggleMenu(song.id)} 
                        className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-200"
                      >
                        <FiMoreHorizontal />
                      </button>
                      {menuOpenSongId === song.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
                          <button 
                            onClick={() => removeFromPlaylist(song.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Xóa khỏi playlist
                          </button>
                          {/* <button 
                            onClick={() => toggleFavorite(song.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                          </button> */}
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <FiMusic className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {filterQuery
                  ? "Không tìm thấy bài hát nào khớp với bộ lọc."
                  : "Playlist này đang trống. Hãy thêm bài hát ở trên!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Edit Playlist */}
      {showEditModal && editingPlaylist && (
        <EditPlaylistModal
          playlist={editingPlaylist}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default PlaylistPage;
