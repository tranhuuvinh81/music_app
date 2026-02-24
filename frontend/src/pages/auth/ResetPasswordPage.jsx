// src/pages/auth/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { FiLock, FiCheckCircle } from "react-icons/fi";

function ResetPasswordPage() {
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword.length < 6) {
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp.");
    }

    setIsLoading(true);
    try {
      // Gọi API gửi pass mới kèm token
      const res = await api.post(`/api/users/reset-password/${token}`, {
        newPassword: formData.newPassword
      });
      
      setSuccessMessage(res.data.message);
      
      // Chuyển hướng về trang login sau 3 giây
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <FiLock className="text-blue-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-sm mt-2">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {successMessage ? (
          <div className="text-center py-6 animate-scale-up">
            <FiCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
            <p className="text-lg font-bold text-gray-800 mb-2">Thành công!</p>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <p className="text-sm text-gray-400 animate-pulse">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Ít nhất 6 ký tự"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;