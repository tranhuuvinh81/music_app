import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';
import { AuthContext } from '../../context/AuthContext';
import SongCard from '../../components/ui/SongCard';
import { FiHeart, FiMoreHorizontal } from 'react-icons/fi';

// Component cho card thể loại
const GenreCard = ({ genre, onClick }) => {
  // Create a gradient color based on genre name
  const getGenreColor = (genreName) => {
    // This is a simplified mapping, in a real app you'd use a more comprehensive approach
    const colorMap = {
      'Pop': 'from-pink-400 to-purple-600',
      'Rock': 'from-red-500 to-orange-600',
      'Jazz': 'from-blue-400 to-indigo-600',
      'Classical': 'from-purple-400 to-pink-600',
      'Electronic': 'from-cyan-400 to-blue-600',
      'Hip Hop': 'from-yellow-400 to-orange-600',
      'Country': 'from-green-400 to-teal-600',
      'R&B': 'from-purple-500 to-pink-600',
      'Reggae': 'from-yellow-500 to-green-600',
      'Folk': 'from-green-500 to-blue-600',
    };
    
    return colorMap[genreName] || 'from-[#7Ab2D3] to-[#4A90E2]';
  };

  // Get an icon based on genre name
  const getGenreIcon = (genreName) => {
    const iconMap = {
      'Pop': '🎤',
      'Rock': '🎸',
      'Jazz': '🎷',
      'Classical': '🎻',
      'Electronic': '🎧',
      'Hip Hop': '🎵',
      'Country': '🤠',
      'R&B': '💿',
      'Reggae': '🌴',
      'Folk': '🎵',
    };
    
    return iconMap[genreName] || '🎵';
  };

  return (
    <div 
      onClick={() => onClick(genre)}
      className="bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square group">
        <div className={`w-full h-full bg-gradient-to-br ${getGenreColor(genre)} flex items-center justify-center`}>
          <span className="text-6xl">{getGenreIcon(genre)}</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium">Xem bài hát</p>
        </div> */}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{genre}</h3>
      </div>
    </div>
  );
};

function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    api.get('/api/songs/genres')
      .then(res => setGenres(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      api.get(`/api/songs/genre/${encodeURIComponent(selectedGenre)}`)
        .then(res => setDisplaySongs(res.data))
        .catch(err => console.error(err));
      setIsListExpanded(false);
    } else {
      setDisplaySongs([]);
    }
  }, [selectedGenre]);

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

  return (
    <div className="p-6 flex-grow">
      {!selectedGenre ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Thể loại âm nhạc</h2>
          
          {/* Grid of Genre Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {genres.map((genre) => (
              <GenreCard
                key={genre}
                genre={genre}
                onClick={setSelectedGenre}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedGenre(null)} 
              className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Những bài hát thuộc thể loại {selectedGenre}
            </h2>
          </div>
          
          {/* Grid of Song Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {(isListExpanded ? displaySongs : displaySongs.slice(0, 10)).map((song, index) => {
              // Check if this song is currently playing
              const isCurrentSong = currentSong && currentSong.id === song.id;
              const isFavorite = favoriteSongs.has(song.id);
              
              // Format song data for SongCard component
              const songCardData = {
                id: song.id,
                title: song.title,
                artist: displayArtistNames(song.artists),
                coverImage: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : null,
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
                  
                  {/* Custom Options Menu */}
                  {isAuthenticated && (
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
                            onClick={() => handleOpenAddModal(song.id)} 
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Thêm vào playlist
                          </button>
                          <button 
                            onClick={() => toggleFavorite(song.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                          </button>
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
              className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors"
            >
              {isListExpanded ? "Thu gọn" : "Xem thêm..."}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default GenresPage;