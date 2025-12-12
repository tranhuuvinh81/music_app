// frontend/src/components/ui/CommentSection.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CommentSection = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isAuthenticated, user } = useContext(AuthContext);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  // Fetch comments
  useEffect(() => {
    if (songId) {
      api.get(`/api/comments/${songId}`)
        .then(res => setComments(res.data || []))
        .catch(err => console.error(err));
    }
  }, [songId]);

  // Submit new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) return alert("Bạn cần đăng nhập để bình luận!");

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/comments', { songId, content: newComment, rating });
      setComments([res.data, ...comments]);
      setNewComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing
  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  // Save edit
  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/api/comments/${commentId}`, { content: editContent, rating: editRating });
      setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent, rating: editRating } : c));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Render stars
  const renderStars = (score) => [...Array(5)].map((_, i) => (
    <span key={i} className={`text-xs md:text-sm ${i < score ? "text-yellow-400" : "text-gray-300"}`}>★</span>
  ));

  const renderRatingStars = () => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <button
          key={index} type="button" onClick={() => setRating(index + 1)}
          onMouseEnter={() => setHoverRating(index + 1)} onMouseLeave={() => setHoverRating(0)}
          className="text-lg md:text-xl focus:outline-none transition-colors duration-200"
        >
          <span className={index + 1 <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );

  const renderEditStars = () => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <button
          key={index} type="button" onClick={() => setEditRating(index + 1)}
          className="text-lg md:text-xl focus:outline-none transition-colors duration-200"
        >
          <span className={index + 1 <= editRating ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#f0f9ff] to-white p-4 md:p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center shrink-0">
        Bình luận & Đánh giá
        <span className="ml-2 text-xs md:text-sm font-normal text-gray-500">({comments.length})</span>
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-4 md:mb-8 bg-white p-3 md:p-4 rounded-xl shadow-md shrink-0">
          <div className="flex items-start gap-3 md:gap-4">
            {user?.avatar_url ? (
              <img src={getImageUrl(user.avatar_url)} alt="me" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-[#7Ab2D3]" />
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-xs md:text-sm text-gray-600 mr-2 font-medium">Đánh giá:</span>
                {renderRatingStars()}
              </div>
              <div className="relative">
                <textarea
                  value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bạn nghĩ gì về bài hát này?"
                  className="w-full p-2 md:p-3 pr-10 md:pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7Ab2D3] focus:border-transparent resize-none h-20 md:h-24 text-sm md:text-base"
                />
                <button
                  type="submit" disabled={isSubmitting || !newComment.trim()}
                  className="absolute bottom-2 right-2 md:bottom-3 md:right-3 p-1.5 md:p-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiSend size={14} className="md:w-4 md:h-4" />}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 md:mb-8 p-3 md:p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center shrink-0">
          <p className="text-sm text-yellow-800">Vui lòng đăng nhập để bình luận!</p>
          <a href="/login" className="inline-block mt-2 px-3 py-1.5 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white text-sm rounded-lg hover:shadow-lg transition-all">Đăng nhập</a>
        </div>
      )}

      {/* Comments list (Responsive height) */}
      <div className="space-y-3 md:space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-1 max-h-[60vh] md:max-h-96">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-2 md:gap-3">
                {comment.avatar_url ? (
                  <img src={getImageUrl(comment.avatar_url)} alt={comment.username} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center text-white font-bold text-sm">
                    {comment.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm md:text-base text-gray-800 truncate">{comment.username}</h4>
                    <div className="flex items-center">{renderStars(comment.rating)}</div>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="bg-blue-50 p-2 md:p-3 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs md:text-sm font-medium text-gray-700">Đang sửa...</span>
                        {renderEditStars()}
                      </div>
                      <textarea
                        value={editContent} onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7Ab2D3] resize-none text-sm"
                        rows="2"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 text-xs md:text-sm text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                        <button onClick={() => handleUpdate(comment.id)} className="px-2 py-1 text-xs md:text-sm bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded hover:shadow-md">Lưu</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap break-words">{comment.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] md:text-xs text-gray-400">{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                    
                    {isAuthenticated && user && user.id === comment.user_id && (
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(comment)} className="p-1 text-gray-400 hover:text-[#7Ab2D3] hover:bg-[#7Ab2D3]/10 rounded-full" title="Sửa"><FiEdit2 size={12} className="md:w-3.5 md:h-3.5" /></button>
                        <button onClick={() => handleDelete(comment.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" title="Xóa"><FiTrash2 size={12} className="md:w-3.5 md:h-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FiUser className="text-gray-400 text-xl md:text-2xl" />
            </div>
            <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;