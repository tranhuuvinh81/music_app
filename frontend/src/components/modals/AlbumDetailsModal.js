// frontend/src/components/modals/AlbumDetailsModal.js
import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiMusic, FiPlay, FiClock } from 'react-icons/fi';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

const displayArtistNames = (artistsArray) => {
  if (!Array.isArray(artistsArray) || artistsArray.length === 0) {
    return "Nghệ sĩ không xác định";
  }
  return artistsArray.map(a => a.name).join(", ");
};

function AlbumDetailsModal({ album, onClose }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong, currentSong, isPlaying } = useContext(AudioContext);

  useEffect(() => {
    if (album?.name) {
      setIsLoading(true);
      api.get(`/api/songs/album/${encodeURIComponent(album.name)}`)
        .then(res => {
          setSongs(res.data || []);
        })
        .catch(err => console.error("Lỗi lấy bài hát album:", err))
        .finally(() => setIsLoading(false));
    }
  }, [album]);

  const handlePlayAlbum = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  if (!album) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 md:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* HEADER: Kéo dãn chiều cao một chút để hiển thị đẹp hơn */}
        <div className="relative h-48 md:h-64 flex-shrink-0 bg-gray-900 overflow-hidden">
          {/* Ảnh nền làm mờ */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-md"
            style={{ backgroundImage: `url(${getImageUrl(album.image_url)})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition z-10"
          >
            <FiX size={24} />
          </button>

          <div className="absolute bottom-0 left-0 p-6 flex items-end gap-6 w-full">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 shrink-0">
               {album.image_url ? (
                  <img src={getImageUrl(album.image_url)} alt={album.name} className="w-full h-full object-cover"/>
               ) : (
                  <div className="w-full h-full bg-purple-500 flex items-center justify-center"><FiMusic className="text-white text-3xl"/></div>
               )}
             </div>
             <div className="flex-1 min-w-0 pb-2">
                <span className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1 block">Album</span>
                <h2 className="text-2xl md:text-4xl font-bold text-white truncate mb-4">{album.name}</h2>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePlayAlbum}
                    disabled={songs.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                  >
                    <FiPlay fill="currentColor" /> Phát tất cả
                  </button>
                  <span className="text-white/80 text-sm">{songs.length} bài hát</span>
                </div>
             </div>
          </div>
        </div>

        {/* LIST SONGS */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-10">
               <div className="w-8 h-8 border-4 border-[#7Ab2D3] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : songs.length > 0 ? (
            <div className="space-y-1">
              {songs.map((song, index) => {
                const isThisPlaying = currentSong === getImageUrl(song.file_url);
                return (
                  <div 
                    key={song.id} 
                    onClick={() => playSong(song, songs, index)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                        isThisPlaying ? 'bg-blue-50 border border-blue-100' : 'hover:bg-white border border-transparent hover:shadow-sm'
                    }`}
                  >
                    <div className="w-6 text-center text-gray-400 font-medium text-sm flex-shrink-0">
                        {isThisPlaying && isPlaying ? (
                            <FiMusic className="text-[#4A90E2] animate-bounce mx-auto" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    <img src={getImageUrl(song.image_url)} alt="" className="w-12 h-12 rounded object-cover shadow-sm flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm md:text-base truncate ${isThisPlaying ? 'text-[#4A90E2]' : 'text-gray-800'}`}>
                          {song.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{displayArtistNames(song.artists)}</p>
                    </div>
                    <div className="flex items-center text-gray-400 text-xs gap-1 hidden md:flex">
                        <FiClock /> {(song.listen_count || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
               <FiMusic size={40} className="mx-auto text-gray-300 mb-3" />
               <p>Không có bài hát nào trong album này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlbumDetailsModal;