// frontend/src/components/modals/ArtistDetailsModal.js
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { FiX, FiCalendar, FiMapPin, FiMusic, FiUser, FiExternalLink, FiHeart } from 'react-icons/fi';

function ArtistDetailsModal({ artist, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'songs'
  const [songs, setSongs] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (artist && artist.id) {
      setLoading(true);
      api.get(`/api/artists/${artist.id}`)
        .then((res) => {
          setDetails(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Lỗi lấy chi tiết nghệ sĩ:", err);
          // If error, use the basic artist info passed in
          setDetails(artist);
          setLoading(false);
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
    // This would typically be handled by the AudioContext
    console.log("Play song:", song);
  };

  if (!artist) return null;

  const imageSrc = details?.image_url
    ? (details.image_url.startsWith('http') ? details.image_url : `${api.defaults.baseURL}${details.image_url}`)
    : "https://via.placeholder.com/300?text=No+Image";

  const displayData = details || artist;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex justify-center items-center z-[1050] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-[#7Ab2D3] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin nghệ sĩ...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Artist Info */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-lg relative group">
                  <img
                    src={imageSrc}
                    alt={displayData.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <button
                    onClick={toggleFavorite}
                    className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-opacity-100 transition-all duration-300"
                    title="Yêu thích"
                  >
                    <FiHeart className={isFavorite ? "fill-current text-red-500" : ""} size={20} />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{displayData.name}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayData.birth_year && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <FiCalendar size={14} />
                        <span>{displayData.birth_year}</span>
                      </div>
                    )}
                    {displayData.country && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <FiMapPin size={14} />
                        <span>{displayData.country}</span>
                      </div>
                    )}
                    {displayData.field && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <FiMusic size={14} />
                        <span>{displayData.field}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button className="p-3 rounded-full text-gray-500 hover:text-[#7Ab2D3] hover:bg-[#7Ab2D3] hover:bg-opacity-10 transition-all duration-300">
                      <FiExternalLink size={20} />
                    </button>
                  </div>
                  
                  {displayData.description && (
                    <div className="bg-gradient-to-r from-[#f0f9ff] to-white p-4 rounded-xl">
                      <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Tiểu sử</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{displayData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-3 px-1 font-medium transition-all duration-300 ${
                      activeTab === 'about'
                        ? 'text-[#7Ab2D3] border-b-2 border-[#7Ab2D3]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Về nghệ sĩ
                  </button>
                  <button
                    onClick={() => setActiveTab('songs')}
                    className={`pb-3 px-1 font-medium transition-all duration-300 ${
                      activeTab === 'songs'
                        ? 'text-[#7Ab2D3] border-b-2 border-[#7Ab2D3]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Bài hát
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  {displayData.bio && (
                    <div className="bg-gradient-to-r from-[#f0f9ff] to-white p-4 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Tiểu sử</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{displayData.bio}</p>
                    </div>
                  )}
                  
                  {displayData.achievements && displayData.achievements.length > 0 && (
                    <div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {songs.map((song, index) => (
                        <div key={song.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="relative aspect-square group">
                            <img
                              src={song.image_url ? (song.image_url.startsWith('http') ? song.image_url : `${api.defaults.baseURL}${song.image_url}`) : 'https://via.placeholder.com/300?text=No+Image'}
                              alt={song.title}
                              className="w-full h-full object-cover"
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
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500">{song.listen_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                        <FiMusic className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-gray-500">Không có bài hát nào của nghệ sĩ này.</p>
                    </div>
                  )}
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