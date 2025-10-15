// frontend/src/components/UserDetailsModal.js (updated - add role edit for admin)
import React, { useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

function UserDetailsModal({ user, onClose, onUpdate }) {
  const { user: currentUser } = useContext(AuthContext); // Lấy user hiện tại để kiểm tra admin
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [error, setError] = useState('');

  const avatarSrc = user.avatar_url ? `${api.defaults.baseURL}${user.avatar_url}` : null;

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleSaveRole = async () => {
    try {
      await api.put(`/api/users/${user.id}`, { role: newRole });
      onUpdate(); // Gọi để refresh danh sách user
      setEditingRole(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thông tin người dùng</h2>
        {avatarSrc && <img src={avatarSrc} alt="Avatar" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />}
        <p><strong>Họ và tên:</strong> {user.full_name}</p>
        <p><strong>Tuổi:</strong> {user.age}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <div>
          <strong>Role:</strong> {editingRole ? (
            <select value={newRole} onChange={handleRoleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            user.role
          )}
          {currentUser.role === 'admin' && !editingRole && (
            <button onClick={() => setEditingRole(true)}>Chỉnh sửa role</button>
          )}
          {editingRole && (
            <>
              <button onClick={handleSaveRole}>Lưu</button>
              <button onClick={() => setEditingRole(false)}>Hủy</button>
            </>
          )}
        </div>
        {error && <p className="error">{error}</p>}
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

export default UserDetailsModal;