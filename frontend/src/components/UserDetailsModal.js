// frontend/src/components/UserDetailsModal.js
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Thông tin người dùng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">ID:</div>
            <div className="w-2/3 text-gray-900">{user.id}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Họ và tên:</div>
            <div className="w-2/3 text-gray-900">{user.full_name}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Tuổi:</div>
            <div className="w-2/3 text-gray-900">{user.age}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">Email:</div>
            <div className="w-2/3 text-gray-900">{user.email}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 font-medium text-gray-700">
              Số điện thoại:
            </div>
            <div className="w-2/3 text-gray-900">{user.phone}</div>
          </div>
          <div className="flex items-start">
            <div className="w-1/3 font-medium text-gray-700 pt-1">Role:</div>
            <div className="w-2/3">
              {editingRole ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={newRole}
                    onChange={handleRoleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  {currentUser.role === "admin" && (
                    <button
                      className="ml-2 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      onClick={() => setEditingRole(true)}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              )}
              {editingRole && (
                <div className="flex space-x-2 mt-2">
                  <button
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                    onClick={handleSaveRole}
                  >
                    Lưu
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-300"
                    onClick={() => setEditingRole(false)}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
