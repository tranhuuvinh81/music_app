import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

export const AuthContext = createContext(null);

// 1. TẠO HÀM HELPER ĐỂ SET TOKEN CHO AXIOS
/**
 * Thêm hoặc xóa token 'Authorization' khỏi header mặc định của Axios.
 * @param {string | null} token - JWT token hoặc null để xóa.
 */
const setAuthToken = (token) => {
  if (token) {
    // Thêm token vào header mặc định cho TẤT CẢ request
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Xóa header nếu logout hoặc không có token
    delete api.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 4. CẬP NHẬT HÀM LOGOUT
  // Bọc trong useCallback để dùng trong useEffect và các hàm khác
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null); // <-- Xóa token khỏi header
    setUser(null);
    setFullUser(null);
  }, []);

  // 3. CẬP NHẬT fetchFullUser ĐỂ GỌI LOGOUT KHI THẤT BẠI
  // Bọc trong useCallback
  const fetchFullUser = useCallback(async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      setFullUser(res.data);
    } catch (err) {
      console.error('Error fetching full user (Token có thể đã hết hạn):', err);
      logout(); // <-- Tự động logout nếu không thể fetch user
      throw err; // Ném lỗi ra để các hàm gọi nó biết (vd: useEffect)
    }
  }, [logout]); // Phụ thuộc vào logout

  // 2. SỬA LẠI useEffect CHÍNH ĐỂ XỬ LÝ RACE CONDITION
  useEffect(() => {
    // Tạo hàm async bên trong để có thể dùng await
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          if (decodedUser.exp * 1000 > Date.now()) {
            // Token hợp lệ
            setAuthToken(token); // <-- SET TOKEN CHO API
            setUser(decodedUser);
            await fetchFullUser(decodedUser.id); // <-- AWAIT HÀM NÀY
          } else {
            // Token hết hạn
            logout();
          }
        } catch (error) {
          // Lỗi này xảy ra nếu token hỏng, HOẶC fetchFullUser bị lỗi
          console.error("Lỗi khi tải user từ token:", error);
          logout();
        }
      }
      // Chỉ set loading false sau khi MỌI THỨ hoàn tất
      setIsLoading(false);
    };

    loadUserFromToken();
  }, [fetchFullUser, logout]); // Thêm dependencies

  // 5. CẬP NHẬT HÀM LOGIN (theo logic file LoginPage của bạn)
  /**
   * Xử lý logic đăng nhập, nhận token từ LoginPage.
   * @param {string} token - JWT token nhận từ API.
   * @returns {object | null} Trả về decodedUser (chứa role) để LoginPage điều hướng.
   */
  const login = async (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token); // <-- SET TOKEN CHO API
    
    try {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      // Fetch thông tin đầy đủ ngay sau khi đăng nhập
      await fetchFullUser(decodedUser.id);
      
      // Trả về user đã giải mã để LoginPage có thể kiểm tra role
      return decodedUser; 
    } catch (err) {
      // Nếu có lỗi (ví dụ token hỏng, dù hiếm) thì logout
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        fullUser,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};