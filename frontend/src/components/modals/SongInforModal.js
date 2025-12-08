// frontend/src/components/modals/SongInfoModal.js
import React, { useState } from 'react';
import { 
  FiX, FiDisc, FiUser, FiCalendar, FiGlobe, FiMusic, FiHeadphones, FiTag 
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
  // State để quản lý việc mở Modal Ca sĩ lồng bên trong
  const [selectedArtist, setSelectedArtist] = useState(null);

  if (!song) return null;

  // Xử lý khi click vào tên ca sĩ
  const handleArtistClick = (artist) => {
    // Giả sử ArtistDetailModal nhận prop 'artist' hoặc 'artistId'
    // Ở đây mình truyền nguyên object artist
    setSelectedArtist(artist);
  };

  const closeArtistModal = () => {
    setSelectedArtist(null);
  };

  return (
    <>
      {/* LỚP PHỦ MỜ (OVERLAY) */}
      <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        
        {/* CONTAINER CHÍNH */}
        <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-up">
          
          {/* HEADER: Nút đóng */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-gray-600 hover:text-red-500"
          >
            <FiX size={24} />
          </button>

          {/* BODY: Cuộn dọc */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            
            {/* PHẦN 1: HEADER THÔNG TIN (Banner mờ + Nội dung) */}
            <div className="relative">
                {/* Background mờ ảo phía sau */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
                    style={{ backgroundImage: `url(${getImageUrl(song.image_url)})` }}
                ></div>
                
                <div className="relative z-0 p-8 flex flex-col md:flex-row gap-8 items-start bg-gradient-to-b from-white/40 to-white">
                    {/* Ảnh bìa chính */}
                    <div className="w-full md:w-64 aspect-square rounded-xl shadow-lg overflow-hidden shrink-0">
                        <img 
                            src={getImageUrl(song.image_url)} 
                            alt={song.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Thông tin Text */}
                    <div className="flex-1 space-y-4 pt-2">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{song.title}</h2>
                            {/* Danh sách nghệ sĩ (Clickable) */}
                            <div className="flex flex-wrap gap-2 mt-2 items-center text-lg text-gray-600">
                                <FiUser className="shrink-0" />
                                {Array.isArray(song.artists) && song.artists.length > 0 ? (
                                    song.artists.map((artist, index) => (
                                        <span key={artist.id} className="flex items-center">
                                            {index > 0 && <span className="mr-2">,</span>}
                                            <button 
                                                onClick={() => handleArtistClick(artist)}
                                                className="hover:text-blue-600 hover:underline font-medium transition-colors cursor-pointer"
                                                title="Xem thông tin nghệ sĩ"
                                            >
                                                {artist.name}
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span>Chưa cập nhật nghệ sĩ</span>
                                )}
                            </div>
                        </div>

                        {/* Grid thông tin chi tiết */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white/60 p-4 rounded-xl border border-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiDisc /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Album</p>
                                    <p className="font-medium truncate">{song.album || "Single"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FiMusic /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Thể loại</p>
                                    <p className="font-medium truncate">{song.genre || "---"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FiCalendar /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Năm phát hành</p>
                                    <p className="font-medium">{song.release_year || "---"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FiGlobe /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Quốc gia</p>
                                    <p className="font-medium">{song.country || "---"}</p>
                                </div>
                            </div>

                            <div className="col-span-1 sm:col-span-2 flex items-center gap-3 text-gray-700 border-t border-gray-200 pt-3 mt-1">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FiHeadphones /></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Tổng lượt nghe</p>
                                    <p className="font-bold text-lg text-gray-800">
                                        {(song.listen_count || 0).toLocaleString()} <span className="text-sm font-normal text-gray-500">lượt</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PHẦN 2: BÌNH LUẬN & ĐÁNH GIÁ */}
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 min-h-[400px]">
                <CommentSection songId={song.id} />
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT CA SĨ (Lồng nhau) */}
      {/* Hiển thị đè lên trên SongInfoModal nhờ z-index cao hơn (nếu ArtistDetailModal set z-index > 50) */}
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