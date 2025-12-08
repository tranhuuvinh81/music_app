// frontend/src/components/ui/CommentSection.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { FiUser, FiCalendar, FiStar, FiSend, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
      alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
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
      alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
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
      await api.put(`/api/comments/${commentId}`, {
        content: editContent,
        rating: editRating
      });
      
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, content: editContent, rating: editRating } : c
      ));
      
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  // Render stars for display
  const renderStars = (score) => [...Array(5)].map((_, i) => (
    <span key={i} className={`text-sm ${i < score ? "text-yellow-400" : "text-gray-300"}`}>★</span>
  ));

  // Render interactive stars for rating
  const renderRatingStars = () => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setRating(index + 1)}
          onMouseEnter={() => setHoverRating(index + 1)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-xl focus:outline-none transition-colors duration-200"
        >
          <span className={index + 1 <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );

  // Render stars for editing
  const renderEditStars = () => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setEditRating(index + 1)}
          className="text-xl focus:outline-none transition-colors duration-200"
        >
          <span className={index + 1 <= editRating ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#f0f9ff] to-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">💬</span>
        Bình luận & Đánh giá
        <span className="ml-2 text-sm font-normal text-gray-500">({comments.length})</span>
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-start gap-4">
            {user?.avatar_url ? (
              <img src={getImageUrl(user.avatar_url)} alt="me" className="w-10 h-10 rounded-full object-cover border-2 border-[#7Ab2D3]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-600 mr-2 font-medium">Đánh giá:</span>
                {renderRatingStars()}
              </div>
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bạn nghĩ gì về bài hát này?"
                  className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7Ab2D3] focus:border-transparent resize-none h-24"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiSend size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
          <p className="text-yellow-800">Vui lòng đăng nhập để bình luận!</p>
          <a href="/login" className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-lg hover:shadow-lg transition-all duration-300">
            Đăng nhập
          </a>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-3">
                {comment.avatar_url ? (
                  <img src={getImageUrl(comment.avatar_url)} alt={comment.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7Ab2D3] to-[#4A90E2] flex items-center justify-center text-white font-bold">
                    {comment.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{comment.username}</h4>
                    <div className="flex items-center">
                      {renderStars(comment.rating)}
                    </div>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Đang sửa bình luận...</span>
                        {renderEditStars()}
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7Ab2D3] resize-none"
                        rows="2"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="px-3 py-1 text-sm bg-gradient-to-r from-[#7Ab2D3] to-[#4A90E2] text-white rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleString('vi-VN')}
                    </span>
                    
                    {isAuthenticated && user && user.id === comment.user_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-400 hover:text-[#7Ab2D3] hover:bg-[#7Ab2D3] hover:bg-opacity-10 rounded-full transition-all duration-300"
                          title="Sửa"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                          title="Xóa"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500">Chưa có bình luận nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;