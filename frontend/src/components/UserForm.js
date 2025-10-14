import React, { useState, useEffect } from 'react';
import api from '../api/api';

function UserForm({ userToEdit, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'user', // Mặc định là 'user'
  });
  const [error, setError] = useState('');

  // Khi prop userToEdit thay đổi, cập nhật state của form
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        username: userToEdit.username || '',
        full_name: userToEdit.full_name || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        role: userToEdit.role || 'user',
      });
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API để cập nhật thông tin user
      await api.put(`/api/users/${userToEdit.id}`, formData);
      onFormSubmit(); // Thông báo cho component cha đã submit thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Chỉnh sửa người dùng</h2>
        <form onSubmit={handleSubmit}>
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Tên đăng nhập" required />
          <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Họ và tên" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" />
          
          {/* Dropdown để chọn Role */}
          <label htmlFor="role">Quyền:</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit">Lưu thay đổi</button>
            <button type="button" onClick={onCancel}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;