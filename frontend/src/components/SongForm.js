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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEditing ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Tiêu đề" required />
          <input name="artist" value={formData.artist} onChange={handleChange} placeholder="Nghệ sĩ" required />
          <input name="album" value={formData.album} onChange={handleChange} placeholder="Album" />
          <input name="genre" value={formData.genre} onChange={handleChange} placeholder="Thể loại" />
          <input type="number" name="release_year" value={formData.release_year} onChange={handleChange} placeholder="Năm phát hành" />
          <label>File nhạc:</label>
          <input type="file" name="songFile" onChange={handleSongFileChange} accept="audio/*" required={!isEditing} />
          <label>Hình ảnh (tùy chọn):</label>
          <input type="file" name="imageFile" onChange={handleImageFileChange} accept="image/*" />
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm bài hát'}</button>
            <button type="button" onClick={onCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongForm;