// frontend/src/components/modals/SongInfoModal.js
import React, { useState } from 'react';
import { 
  FiX, FiDisc, FiUser, FiCalendar, FiGlobe, FiMusic, FiHeadphones
} from 'react-icons/fi';
import api from '../../api/api';
import CommentSection from '../ui/CommentSection';
// Import Modal chi tiết ca sĩ có sẵn của bạn
import ArtistDetailModal from './ArtistDetailModal'; 

const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

const SongInfoModal = ({ song, onClose }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);

  if (!song) return null;

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  const closeArtistModal = () => {
    setSelectedArtist(null);
  };

  return (
    <>
      {/* LỚP PHỦ MỜ (OVERLAY) - Tăng z-index lên cực cao */}
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-0 md:p-4">
        
        {/* CONTAINER CHÍNH */}
        {/* Mobile: Full màn hình, không bo góc. Desktop: Card nổi, bo góc */}
        <div className="bg-white w-full h-full md:w-full md:max-w-5xl md:h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-up">
          
          {/* HEADER: Nút đóng nổi bật */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md transition-all hover:scale-110 hover:text-red-500"
          >
            <FiX size={24} />
          </button>

          {/* BODY: Cuộn dọc */}
          <div className="overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
            
            {/* PHẦN 1: HEADER THÔNG TIN */}
            <div className="relative">
                {/* Background Blur */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                    style={{ backgroundImage: `url(${getImageUrl(song.image_url)})` }}
                ></div>
                
                {/* Nội dung chính */}
                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start bg-gradient-to-b from-white/60 via-white/80 to-white">
                    
                    {/* Ảnh bìa */}
                    <div className="w-48 h-48 md:w-72 md:h-72 aspect-square rounded-xl shadow-2xl overflow-hidden shrink-0 border-4 border-white transform transition-transform hover:scale-105 duration-500">
                        <img 
                            src={getImageUrl(song.image_url)} 
                            alt={song.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Thông tin Text */}
                    <div className="flex-1 w-full text-center md:text-left space-y-4">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2 drop-shadow-sm">{song.title}</h2>
                            
                            {/* Nghệ sĩ */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-base md:text-xl text-gray-700 font-medium">
                                <FiUser className="text-blue-500" />
                                {Array.isArray(song.artists) && song.artists.length > 0 ? (
                                    song.artists.map((artist, index) => (
                                        <span key={artist.id} className="flex items-center">
                                            {index > 0 && <span className="mr-2 text-gray-400">,</span>}
                                            <button 
                                                onClick={() => handleArtistClick(artist)}
                                                className="hover:text-blue-600 hover:underline transition-colors"
                                            >
                                                {artist.name}
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 italic">Chưa cập nhật nghệ sĩ</span>
                                )}
                            </div>
                        </div>

                        {/* Grid thông tin chi tiết */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 bg-white/70 p-4 rounded-xl border border-white/50 shadow-sm backdrop-blur-sm text-sm md:text-base">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0"><FiDisc /></div>
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Album</p>
                                    <p className="font-semibold text-gray-800 truncate">{song.album || "Single"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0"><FiMusic /></div>
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Thể loại</p>
                                    <p className="font-semibold text-gray-800 truncate">{song.genre || "---"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0"><FiCalendar /></div>
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Năm</p>
                                    <p className="font-semibold text-gray-800">{song.release_year || "---"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0"><FiGlobe /></div>
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Quốc gia</p>
                                    <p className="font-semibold text-gray-800 truncate">{song.country || "---"}</p>
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-100">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0"><FiHeadphones /></div>
                                <div className="text-left">
                                    <p className="text-[10px] md:text-xs text-red-400 uppercase font-bold tracking-wider">Tổng lượt nghe</p>
                                    <p className="font-bold text-lg text-red-600">
                                        {(song.listen_count || 0).toLocaleString()} 
                                        <span className="text-xs font-normal text-red-400 ml-1">lượt</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PHẦN 2: BÌNH LUẬN & ĐÁNH GIÁ */}
            <div className="p-4 md:p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-t border-white/10 min-h-[400px]">
                <div className="max-w-3xl mx-auto">
                    <CommentSection songId={song.id} />
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT CA SĨ (Lồng nhau) */}
      {selectedArtist && (
        <ArtistDetailModal 
            artist={selectedArtist} 
            onClose={closeArtistModal} 
        />
      )}
    </>
  );
};

export default SongInfoModal;
