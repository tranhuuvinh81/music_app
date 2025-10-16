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
      <div className="modal">
        <div className="modal-header">
          <h3>{isEditing ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}</h3>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='modal-body'>
            <div className="form-group">
              <label htmlFor="title">Tiêu đề</label>
              <input
                type='text'
                id='title'
                name="title"
                value={formData.title}
                onChange={handleChange}
                required />
            </div>
            <div className="form-group">
              <label htmlFor="artist">Nghệ sĩ</label>
              <input
                type='text'
                id='artist'
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                required />
            </div>
            <div className="form-group">
              <label htmlFor="album">Album</label>
              <input 
                type='text'
                id='album'
                name="album"
                value={formData.album}
                onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label htmlFor="genre">Thể loại</label>
              <input
                type='text'
                id='genre'
                name="genre" 
                value={formData.genre} 
                onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="release_year">Năm phát hành</label>
              <input
                type='number'
                id='release_year'
                name="release_year" 
                value={formData.release_year} 
                onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>File bài hát (MP3):</label>
              <input type="file" name="songFile" onChange={handleSongFileChange} accept="audio/*" />
            </div>
            <div className="form-group">
              <label>Ảnh nền (nếu có):</label>
              <input type="file" name="imageFile" onChange={handleImageFileChange} accept="image/*" />
            </div>
          </div>
          <div className="error">
            {error && <p className="error">{error}</p>}
          </div>
          <div className='modal-footer'>
            <button className='btn btn-cancel' type="button" onClick={onCancel}>Hủy</button>
            <button className='btn btn-primary' type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm bài hát'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SongForm;