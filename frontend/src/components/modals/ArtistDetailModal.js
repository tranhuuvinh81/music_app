// frontend/src/components/modals/ArtistDetailsModal.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { FiX, FiMapPin, FiMusic, FiUser, FiHeart, FiPlay, FiClock } from 'react-icons/fi';
import { AudioContext } from '../../context/AudioContext';

function ArtistDetailsModal({ artist, onClose }) {
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [songs, setSongs] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Lấy AudioContext để phát nhạc
  const { playSong, currentSong, isPlaying } = useContext(AudioContext);

  useEffect(() => {
    if (artist && artist.id) {
      api.get(`/api/artists/${artist.id}`)
        .then((res) => {
          setDetails(res.data);
        })
        .catch((err) => {
          console.error("Lỗi lấy chi tiết nghệ sĩ:", err);
          setDetails(artist);
        });
    }
  }, [artist]);

  useEffect(() => {
    if (artist && artist.id) {
      api.get(`/api/songs/artist/${encodeURIComponent(artist.name)}`)
        .then((res) => {
          setSongs(res.data || []);
        })
        .catch((err) => {
          console.error("Lỗi lấy bài hát của nghệ sĩ:", err);
          setSongs([]);
        });
    }
  }, [artist]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update backend/context
  };

  // Hàm phát 1 bài hát
  const handlePlaySong = (song, index) => {
    playSong(song, songs, index);
  };

  // [MỚI] Hàm phát tất cả bài hát của nghệ sĩ
  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  if (!artist) return null;

  const displayData = details || artist;
  const imageSrc = displayData.image_url
    ? (displayData.image_url.startsWith('http') ? displayData.image_url : `${api.defaults.baseURL}${displayData.image_url}`)
    : "https://via.placeholder.com/300?text=No+Image";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[1050] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-up">
        
        {/* Header (Giữ nguyên nhưng sửa màu cho giống AlbumModal) */}
        <div className="relative h-48 md:h-64 flex-shrink-0 bg-gray-900 overflow-hidden">
          {/* Nền Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-md"
            style={{ backgroundImage: `url(${imageSrc})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all z-10"
          >
            <FiX size={24} />
          </button>

          {/* Thông tin chính */}
          <div className="absolute bottom-0 left-0 p-6 flex items-end gap-6 w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 shrink-0 group relative">
              <img
                src={imageSrc}
                alt={displayData.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <button
                onClick={toggleFavorite}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <FiHeart className={isFavorite ? "fill-current text-red-500" : "text-white"} size={32} />
              </button>
            </div>
            
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2 mb-2">
                 {displayData.country && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <FiMapPin size={10} /> {displayData.country}
                    </span>
                 )}
                 {displayData.field && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <FiMusic size={10} /> {displayData.field}
                    </span>
                 )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{displayData.name}</h1>
              <p className="text-white/80 text-sm flex items-center gap-2">
                 <FiUser /> {songs.length} Bài hát
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
                activeTab === 'about'
                  ? 'text-[#4A90E2] border-b-2 border-[#4A90E2] bg-white'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Về nghệ sĩ
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${
                activeTab === 'songs'
                  ? 'text-[#4A90E2] border-b-2 border-[#4A90E2] bg-white'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Danh sách bài hát
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="p-6 max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              {/* Box Thông tin cơ bản */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-8 items-center justify-between">
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Năm sinh</p>
                    <p className="font-bold text-lg text-gray-800">{displayData.birth_year || "Đang cập nhật"}</p>
                 </div>
                 <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Quốc gia</p>
                    <p className="font-bold text-lg text-gray-800">{displayData.country || "Đang cập nhật"}</p>
                 </div>
                 <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Lĩnh vực</p>
                    <p className="font-bold text-lg text-gray-800">{displayData.field || "Đang cập nhật"}</p>
                 </div>
              </div>

              {/* Tiểu sử */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUser className="text-[#4A90E2]" /> Tiểu sử
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {displayData.description || displayData.bio || "Nghệ sĩ này chưa có thông tin tiểu sử."}
                </p>
              </div>
              
              {/* Thành tựu (Nếu có) */}
              {displayData.achievements && displayData.achievements.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    Thành tựu nổi bật
                  </h3>
                  <ul className="space-y-3">
                    {displayData.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3 bg-yellow-50/50 p-3 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{achievement}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SONGS */}
          {activeTab === 'songs' && (
            <div className="p-4 md:p-6 animate-fade-in-up">
              {/* [MỚI] Nút Phát tất cả */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Các bài hát phổ biến</h3>
                {songs.length > 0 && (
                   <button 
                     onClick={handlePlayAll}
                     className="flex items-center gap-2 px-6 py-2.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                   >
                     <FiPlay fill="currentColor" /> Phát tất cả
                   </button>
                )}
              </div>

              {songs.length > 0 ? (
                <div className="space-y-2">
                  {songs.map((song, index) => {
                    const songImageUrl = song.image_url
                      ? (song.image_url.startsWith('http') ? song.image_url : `${api.defaults.baseURL}${song.image_url}`)
                      : "https://via.placeholder.com/100?text=No+Image";
                    
                    const isThisPlaying = currentSong === (song.file_url?.startsWith('http') ? song.file_url : `${api.defaults.baseURL}${song.file_url}`);

                    return (
                      <div 
                        key={song.id} 
                        onClick={() => handlePlaySong(song, index)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                            isThisPlaying ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'bg-white border border-gray-100 hover:shadow-md hover:border-blue-100'
                        }`}
                      >
                        <div className="w-8 text-center font-bold text-gray-400">
                           {isThisPlaying && isPlaying ? (
                              <FiMusic className="text-[#4A90E2] animate-bounce mx-auto" />
                           ) : (
                              index + 1
                           )}
                        </div>
                        <img src={songImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shadow-sm"/>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold truncate ${isThisPlaying ? 'text-[#4A90E2]' : 'text-gray-800'}`}>
                             {song.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{song.release_year || 'Unknown year'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-xs text-gray-500 flex items-center gap-1 hidden md:flex">
                              <FiClock /> {(song.listen_count || 0).toLocaleString()}
                           </div>
                           <button className="p-2 text-gray-400 hover:text-[#4A90E2] transition-colors rounded-full hover:bg-blue-50">
                              <FiPlay />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FiMusic className="text-gray-300 text-4xl" />
                  </div>
                  <p className="text-gray-500 font-medium">Nghệ sĩ này chưa có bài hát nào trên hệ thống.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistDetailsModal;