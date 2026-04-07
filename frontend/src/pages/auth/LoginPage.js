// src/pages/auth/LoginPage.jsx
import React, { useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiX, FiMail, FiCheckCircle } from "react-icons/fi"; // Thêm icons

function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State cho Modal Quên mật khẩu
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/api/users/login", formData);
      const { token, user } = response.data; 
      
      login(token);

      if (user && user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); 
      }
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  // Xử lý gửi email quên mật khẩu
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setIsSending(true);

    try {
      const res = await api.post("/api/users/forgot-password", { email: forgotEmail });
      setForgotMessage(res.data.message); // Hiển thị thông báo gửi thành công
      setForgotEmail(""); // Xóa rỗng ô input
    } catch (err) {
      setForgotError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSending(false);
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
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          
          {/* Nút Quên mật khẩu */}
          <div className="flex justify-end mb-6">
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors shadow-sm"
          >
            Đăng nhập
          </button>
          {error && (
            <p className="mt-4 text-red-500 text-center text-sm">{error}</p>
          )}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full mt-4 bg-white border border-gray-300 text-gray-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đăng ký tài khoản mới
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-4 bg-white border border-gray-300 text-gray-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </form>
      </div>

      {/* MODAL QUÊN MẬT KHẨU */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Khôi phục mật khẩu</h3>
              <button 
                onClick={() => { setShowForgotModal(false); setForgotMessage(""); setForgotError(""); }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {forgotMessage ? (
                <div className="text-center py-4">
                  <FiCheckCircle className="mx-auto text-green-500 text-5xl mb-3" />
                  <p className="text-gray-600 mb-4">{forgotMessage}</p>
                  <button 
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p className="text-sm text-gray-500 mb-4">
                    Nhập địa chỉ email mà bạn đã dùng để đăng ký. Chúng tôi sẽ gửi cho bạn một đường link để đặt lại mật khẩu.
                  </p>
                  <div className="relative mb-4">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="Nhập email của bạn..." 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  {forgotError && <p className="text-red-500 text-xs mb-4 text-center">{forgotError}</p>}
                  
                  <button 
                    type="submit" 
                    disabled={isSending || !forgotEmail}
                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isSending ? "Đang gửi..." : "Gửi link khôi phục"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;