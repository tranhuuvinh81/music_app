// src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/users/login', formData);
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className='body1'>
      <div className="auth-form ">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
        <button type="submit">Đăng nhập</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
    </div>
  );
}

export default LoginPage;