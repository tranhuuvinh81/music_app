// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/users/register', formData);
      setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    <div className='body1'>
      <div className="auth-form">
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
        <input type="text" name="full_name" placeholder="Họ và tên" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Số điện thoại" onChange={handleChange} required />
        <button type="submit">Đăng ký</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
    </div>
  );
}

export default RegisterPage;