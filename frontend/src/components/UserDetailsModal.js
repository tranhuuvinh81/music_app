// frontend/src/components/UserDetailsModal.js (new file - for admin view)
import React from 'react';
import api from '../api/api';

function UserDetailsModal({ user, onClose }) {
  const avatarSrc = user.avatar_url ? `${api.defaults.baseURL}${user.avatar_url}` : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        {avatarSrc && <img src={avatarSrc} alt="Avatar" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />}
        <p><strong>Họ và tên:</strong> {user.full_name}</p>
        <p><strong>Tuổi:</strong> {user.age}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

export default UserDetailsModal;