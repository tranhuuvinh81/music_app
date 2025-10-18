// frontend/src/components/SongForm.js (updated - add image input)
import React from 'react';
import { useState, useEffect } from 'react';
import api from '../api/api';

function SongForm({ songToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    release_year: '',
  });
  const [songFile, setSongFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const isEditing = !!songToEdit; // Kiểm tra xem đây là form sửa hay thêm mới

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: songToEdit.title || '',
        artist: songToEdit.artist || '',
        album: songToEdit.album || '',
        genre: songToEdit.genre || '',
        release_year: songToEdit.release_year || '',
      });
    }
  }, [songToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSongFileChange = (e) => {
    setSongFile(e.target.files[0]);
  };

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (songFile) {
      data.append('songFile', songFile);
    }
    if (imageFile) {
      data.append('imageFile', imageFile);
    }

    try {
      if (isEditing) {
        // Chế độ sửa
        await api.put(`/api/songs/${songToEdit.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Chế độ thêm mới
        await api.post('/api/songs', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onFormSubmit(); // Báo cho component cha biết form đã submit thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-3 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isEditing ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}</h3>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type='text'
                id='title'
                name="title"
                value={formData.title}
                onChange={handleChange}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
                Nghệ sĩ
              </label>
              <input
                type='text'
                id='artist'
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-1">
                Album
              </label>
              <input 
                type='text'
                id='album'
                name="album"
                value={formData.album}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                Thể loại
              </label>
              <input
                type='text'
                id='genre'
                name="genre" 
                value={formData.genre} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="release_year" className="block text-sm font-medium text-gray-700 mb-1">
                Năm phát hành
              </label>
              <input
                type='number'
                id='release_year'
                name="release_year" 
                value={formData.release_year} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File bài hát (MP3):
              </label>
              <input 
                type="file" 
                name="songFile" 
                onChange={handleSongFileChange} 
                accept="audio/*" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh nền (nếu có):
              </label>
              <input 
                type="file" 
                name="imageFile" 
                onChange={handleImageFileChange} 
                accept="image/*" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
            </div>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm bài hát'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongForm;