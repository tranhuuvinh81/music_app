import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { FaStar, FaRegStar, FaPaperPlane, FaUserCircle } from 'react-icons/fa';

const CommentSection = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5); // Mặc định 5 sao
  const [hoverRating, setHoverRating] = useState(0); // Hiệu ứng hover sao
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, user } = useContext(AuthContext);

  // Helper xử lý URL ảnh
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  // 1. Fetch Comments
  useEffect(() => {
    if (songId) {
      api.get(`/api/comments/${songId}`)
        .then(res => setComments(res.data))
        .catch(err => console.error(err));
    }
  }, [songId]);

  // 2. Submit Comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để bình luận!");
      return;
    }

    try {
      const res = await api.post('/api/comments', {
        songId,
        content: newComment,
        rating
      });
      
      // Thêm comment mới vào đầu danh sách ngay lập tức
      setComments([res.data, ...comments]);
      setNewComment("");
      setRating(5);
    } catch (err) {
      alert("Lỗi gửi bình luận");
      console.error(err);
    }
  };

  // Render số sao (cho phần hiển thị)
  const renderStars = (score) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < score ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        💬 Bình luận & Đánh giá <span className="text-sm font-normal text-gray-500 ml-2">({comments.length})</span>
      </h3>

      {/* FORM NHẬP LIỆU */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
             {/* Avatar User hiện tại */}
             {user?.avatar_url ? (
                <img src={getImageUrl(user.avatar_url)} alt="me" className="w-10 h-10 rounded-full object-cover"/>
             ) : (
                <FaUserCircle className="w-10 h-10 text-gray-400" />
             )}
             
             <div className="flex-1">
                {/* Chọn sao */}
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-600 mr-2 font-medium">Đánh giá:</span>
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        className="text-xl focus:outline-none transition-transform hover:scale-110"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {starValue <= (hoverRating || rating) ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-300" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Ô nhập text */}
                <div className="relative">
                    <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bạn nghĩ gì về bài hát này? (Khen một câu đi nào...)"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none h-24"
                    />
                    <button 
                        type="submit"
                        className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={!newComment.trim()}
                    >
                        <FaPaperPlane />
                    </button>
                </div>
             </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center border border-yellow-200">
           Vui lòng <a href="/login" className="font-bold underline">đăng nhập</a> để để lại lời khen!
        </div>
      )}

      {/* DANH SÁCH COMMENTS */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length > 0 ? (
          comments.map((cmt) => (
            <div key={cmt.id} className="flex gap-4 animate-fade-in">
              {/* Avatar người comment */}
              <div className="flex-shrink-0">
                  {cmt.avatar_url ? (
                    <img src={getImageUrl(cmt.avatar_url)} alt={cmt.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {cmt.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
              </div>

              {/* Nội dung */}
              <div className="flex-1">
                <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800">{cmt.username}</span>
                        <div className="flex">{renderStars(cmt.rating)}</div>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{cmt.content}</p>
                </div>
                <div className="mt-1 text-xs text-gray-400 ml-1">
                    {new Date(cmt.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8 italic">
             Chưa có lời khen nào. Hãy là người đầu tiên! 🏆
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;