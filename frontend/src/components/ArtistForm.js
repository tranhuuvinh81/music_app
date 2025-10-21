// frontend/src/components/ArtistForm.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';

function ArtistForm({ artistToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    birth_year: '',
    field: '',
    description: '',
  });
  const [artistImage, setArtistImage] = useState(null);
  const [error, setError] = useState('');
  const isEditing = !!artistToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: artistToEdit.name || '',
        birth_year: artistToEdit.birth_year || '',
        field: artistToEdit.field || '',
        description: artistToEdit.description || '',
      });
    }
  }, [artistToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setArtistImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (artistImage) {
      data.append('artistImage', artistImage);
    }

    try {
      if (isEditing) {
        await api.put(`/api/artists/${artistToEdit.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/artists', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{isEditing ? 'Chỉnh sửa nghệ sĩ' : 'Thêm nghệ sĩ mới'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tên nghệ sĩ */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên nghệ sĩ</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            {/* Năm sinh */}
            <div>
              <label htmlFor="birth_year" className="block text-sm font-medium text-gray-700">Năm sinh</label>
              <input type="number" name="birth_year" id="birth_year" value={formData.birth_year} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            {/* Lĩnh vực */}
            <div>
              <label htmlFor="field" className="block text-sm font-medium text-gray-700">Lĩnh vực (vd: Ca sĩ, Nhạc sĩ)</label>
              <input type="text" name="field" id="field" value={formData.field} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            {/* Mô tả */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            {/* Ảnh nghệ sĩ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh nghệ sĩ</label>
              <input type="file" name="artistImage" onChange={handleFileChange} accept="image/*" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">{isEditing ? 'Lưu thay đổi' : 'Thêm nghệ sĩ'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ArtistForm;
