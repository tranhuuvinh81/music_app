// src/pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Gọi API và nhận response
      const response = await api.post("/api/users/login", formData);

      // 2. Lấy cả 'token' và 'user' từ response.data
      const { token, user } = response.data; // 3. Gọi hàm login của Context để lưu trạng thái

      login(token);

      // 4. KIỂM TRA VAI TRÒ VÀ ĐIỀU HƯỚNG
      if (user && user.role === "admin") {
        navigate("/admin"); // Admin -> Dashboard
      } else {
        navigate("/"); // User -> Trang chủ
      }
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
          >
            Đăng nhập
          </button>
          {error && (
            <p className="mt-4 text-red-500 text-center text-sm">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
