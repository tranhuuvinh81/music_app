// frontend/src/components/UserDetailsModal.js (updated - add role edit for admin)
import React, { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

function UserDetailsModal({ user, onClose, onUpdate }) {
  const { user: currentUser } = useContext(AuthContext); // Lấy user hiện tại để kiểm tra admin
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [error, setError] = useState("");

  const avatarSrc = user.avatar_url
    ? `${api.defaults.baseURL}${user.avatar_url}`
    : null;

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleSaveRole = async () => {
    try {
      await api.put(`/api/users/${user.id}`, { role: newRole });
      onUpdate(); // Gọi để refresh danh sách user
      setEditingRole(false);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Thông tin người dùng</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="user-details">
            <div className="detail-item">
              <div>
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">ID:</div>
              <div className="detail-value">{user.id}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Họ và tên:</div>
              <div className="detail-value">{user.full_name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Tuổi:</div>
              <div className="detail-value">{user.age}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email:</div>
              <div className="detail-value">{user.email}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Số điện thoại:</div>
              <div className="detail-value">{user.phone}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Role:</div>
              <div className="detail-value">
                {editingRole ? (
                  <select value={newRole} onChange={handleRoleChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
                {currentUser.role === "admin" && !editingRole && (
                  <button className="btn btn-primary" onClick={() => setEditingRole(true)}>
                    Chỉnh sửa role
                  </button>
                )}
                {editingRole && (
                  <>
                    <button className="btn btn-primary" onClick={handleSaveRole}>Lưu</button>
                    <button className="btn btn-cancel" onClick={() => setEditingRole(false)}>Hủy</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>Đóng</button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default UserDetailsModal;
