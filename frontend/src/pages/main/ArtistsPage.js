import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { AudioContext } from "../../context/AudioContext";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../../components/ui";
import SongCard from "../../components/ui/SongCard";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";

// Component cho card nghệ sĩ
const ArtistCard = ({ artist, onClick, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square group" onClick={() => onClick(artist.name)}>
        {artist.image_url ? (
          <img
            src={`${api.defaults.baseURL}${artist.image_url}`}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{artist.name}</h3>
        <div className="mt-3 text-red-500">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(artist)}
          >
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
};

function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [isArtistListExpanded, setIsArtistListExpanded] = useState(false);
  const [menuOpenSongId, setMenuOpenSongId] = useState(null);
  const [favoriteSongs, setFavoriteSongs] = useState(new Set());
  
  const { currentSong, isPlaying, playSong } = useContext(AudioContext);
  const { openAddModal, openArtistModal } = useOutletContext();
  const { isAuthenticated } = useContext(AuthContext);

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  // Fetch danh sách nghệ sĩ
  useEffect(() => {
    api
      .get("/api/artists")
      .then((res) => setArtists(res.data))
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
    if (!artistsArray || artistsArray.length === 0)
      return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const toggleListExpansion = () => {
    setIsListExpanded(!isListExpanded);
  };

  const toggleArtistListExpansion = () => {
    setIsArtistListExpanded(!isArtistListExpanded);
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
      {!selectedArtist ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Nghệ sĩ nổi bật
          </h2>
          
          {/* Grid of Artist Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {(isArtistListExpanded ? artists : artists.slice(0, 8)).map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={setSelectedArtist}
                onViewDetails={openArtistModal}
              />
            ))}
          </div>
          
          {artists.length > 8 && (
            <button
              onClick={toggleArtistListExpansion}
              className="mt-4 w-full py-2 text-center text-gray-500 hover:text-gray-600 font-medium transition-colors"
            >
              {isArtistListExpanded ? "Thu gọn" : "Xem thêm..."}
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedArtist(null)}
              className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              Những bài hát của {selectedArtist}
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
                // coverImage: song.image_url ? `${api.defaults.baseURL}${song.image_url}` : null,
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

export default ArtistsPage;