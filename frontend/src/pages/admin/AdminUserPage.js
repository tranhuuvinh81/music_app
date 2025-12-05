// frontend/src/pages/admin/AdminUserPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api"; 

function AdminUserPage() {
  const { users, handleViewUserClick, fetchUsers } = useOutletContext();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [usersPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!searchQuery) return users;

    const lowercasedQuery = searchQuery.toLowerCase();

    return users.filter((user) => {
      const usernameMatch = user.username
        .toLowerCase()
        .includes(lowercasedQuery);
      // Kiểm tra full_name (nếu có)
      const nameMatch =
        user.full_name &&
        user.full_name.toLowerCase().includes(lowercasedQuery);
      const emailMatch = user.email.toLowerCase().includes(lowercasedQuery);
      // Kiểm tra SĐT (nếu có)
      const phoneMatch = user.phone && user.phone.includes(searchQuery); // SĐT không cần toLowerCase

      return usernameMatch || nameMatch || emailMatch || phoneMatch;
    });
  }, [users, searchQuery]);

  // LOGIC PHÂN TRANG (Dùng danh sách đã lọc)
  const currentUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage, usersPerPage]);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Effect để reset về trang 1 khi tìm kiếm
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1); // Reset về 1 nếu không có kết quả
    }
  }, [filteredUsers, totalPages, currentPage]);

  // Hàm chuyển trang
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // HÀM XÓA
  const deleteUser = (userId) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      api
        .delete(`/api/users/${userId}`)
        .then(() => {
          fetchUsers(); // Tải lại danh sách user
          // Xử lý phân trang khi xóa mục cuối
          if (currentUsers.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        })
        .catch(console.error);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        <input
          type="text"
          placeholder="Nhập ID, tên hoặc số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng lượt nghe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(user.total_listens || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-gray-600 hover:text-gray-900 mr-3"
                    onClick={() => handleViewUserClick(user)}
                  >
                    View
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 text-sm font-medium rounded-md border ${
                currentPage === number
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminUserPage;
