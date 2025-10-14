// frontend/src/components/ProfileForm.js (new file - for user edit)
import React, { useState, useEffect } from 'react';
import api from '../api/api';

function ProfileForm({ user, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    email: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        age: user.age || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (avatarFile) {
      data.append('avatarFile', avatarFile);
    }
    try {
      await api.put(`/api/users/${user.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="profile-form">
      <h2>Chỉnh sửa thông tin</h2>
      <form onSubmit={handleSubmit}>
        <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Họ và tên" />
        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Tuổi" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" />
        <label>Ảnh đại diện:</label>
        <input type="file" name="avatarFile" onChange={handleAvatarChange} accept="image/*" />
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit">Lưu thay đổi</button>
          <button type="button" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;