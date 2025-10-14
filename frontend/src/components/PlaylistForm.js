// frontend/src/components/PlaylistForm.js (new file)
import React, { useState } from 'react';
import api from '../api/api';

function PlaylistForm({ onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/playlists', formData);
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Tạo playlist mới</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên playlist" required />
          <input name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả" />
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit">Tạo</button>
            <button type="button" onClick={onCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlaylistForm;