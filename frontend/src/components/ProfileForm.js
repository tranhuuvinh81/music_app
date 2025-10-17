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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='modal-body'>
            <div className="form-group">
              <label htmlFor="full_name">Họ và tên</label>
              <input
                type='text'
                id='full_name'
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required />
            </div>
            <div className="form-group">
              <label htmlFor="age">Tuổi</label>
              <input
                type='text'
                id='age'
                name="age"
                value={formData.age}
                onChange={handleChange}
                required />
            </div>
            <div className="form-group">
              <label htmlFor="album">Email</label>
              <input 
                type='text'
                id='email'
                name="email"
                value={formData.email}
                onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label htmlFor="genre">Số điện thoại</label>
              <input
                type='text'
                id='phone'
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} />
            </div>
          </div>
          <div className="error">
            {error && <p className="error">{error}</p>}
          </div>
          <div className='modal-footer'>
            <button className='btn btn-cancel' onClick={onCancel}>Hủy</button>
            <button className='btn btn-primary' type="submit">Lưu</button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;