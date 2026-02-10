// frontend/src/components/modals/ArtistDetailsModal.js
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { FiX, FiCalendar, FiMapPin, FiMusic, FiUser, FiExternalLink, FiHeart } from 'react-icons/fi';

function ArtistDetailsModal({ artist, onClose }) {
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'songs'
  const [songs, setSongs] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (artist && artist.id) {
      api.get(`/api/artists/${artist.id}`)
        .then((res) => {
          setDetails(res.data);
        })
        .catch((err) => {
          console.error("Lỗi lấy chi tiết nghệ sĩ:", err);
          // If error, use basic artist info passed in
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
    // Here you would typically update the backend or context
  };

  const handlePlaySong = (song, index) => {
    // This would typically be handled by AudioContext
    console.log("Play song:", song);
  };

  if (!artist) return null;

  const displayData = details || artist;
  const imageSrc = displayData.image_url
    ? (displayData.image_url.startsWith('http') ? displayData.image_url : `${api.defaults.baseURL}${displayData.image_url}`)
    : "https://via.placeholder.com/300?text=No+Image";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex justify-center items-center z-[1050] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Thông tin nghệ sĩ</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-300"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Artist Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Artist Image - Square with object-cover and object-center */}
              <div className="w-48 h-48 md:w-64 md:h-64 aspect-square rounded-2xl overflow-hidden shadow-lg relative group flex-shrink-0">
                <img
                  src={imageSrc}
                  alt={displayData.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Favorite button overlay */}
                <button
                  onClick={toggleFavorite}
                  className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-300"
                  title="Yêu thích"
                >
                  <FiHeart className={isFavorite ? "fill-current text-red-500" : ""} size={20} />
                </button>
              </div>

              {/* Artist Details */}
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold text-gray-800">{displayData.name}</h1>
                
                {/* Artist Tags */}
                <div className="flex flex-wrap gap-2">
                  {displayData.birth_year && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <FiCalendar size={14} />
                      <span>{displayData.birth_year}</span>
                    </div>
                  )}
                  {displayData.country && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <FiMapPin size={14} />
                      <span>{displayData.country}</span>
                    </div>
                  )}
                  {displayData.field && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      <FiMusic size={14} />
                      <span>{displayData.field}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    <FiExternalLink size={18} />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                    <FiUser size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {displayData.description && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#f0f9ff] to-white rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Tiểu sử</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {displayData.description}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-4 text-center font-medium transition-colors duration-300 ${
                  activeTab === 'about'
                    ? 'text-[#7Ab2D3] border-b-2 border-[#7Ab2D3]'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                Về nghệ sĩ
              </button>
              <button
                onClick={() => setActiveTab('songs')}
                className={`flex-1 py-4 text-center font-medium transition-colors duration-300 ${
                  activeTab === 'songs'
                    ? 'text-[#7Ab2D3] border-b-2 border-[#7Ab2D3]'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                Bài hát
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'about' && (
              <div className="space-y-4">
                {displayData.bio && (
                  <div className="p-4 bg-gradient-to-r from-[#f0f9ff] to-white rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Tiểu sử</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {displayData.bio}
                    </p>
                  </div>
                )}
                
                {displayData.achievements && displayData.achievements.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-[#f0f9ff] to-white rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Thành tựu</h3>
                    <ul className="space-y-2">
                      {displayData.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
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

            {activeTab === 'songs' && (
              <div>
                {songs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {songs.map((song, index) => {
                      const songImageSrc = song.image_url
                        ? (song.image_url.startsWith('http') ? song.image_url : `${api.defaults.baseURL}${song.image_url}`)
                        : "https://via.placeholder.com/300?text=No+Image";
                      
                      return (
                        <div key={song.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="aspect-square relative group">
                            <img
                              src={songImageSrc}
                              alt={song.title}
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={() => handlePlaySong(song, index)}
                                className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-300"
                              >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 truncate">{song.title}</h3>
                            <p className="text-gray-600 text-sm truncate">{song.artist}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500">{song.release_year}</p>
                              <p className="text-xs text-gray-500">{song.listen_count || 0} lượt nghe</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <FiMusic className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500 text-lg mb-2">Không có bài hát nào của nghệ sĩ này.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtistDetailsModal;
