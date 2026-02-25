// frontend/src/components/forms/ProfileForm.js
import React, { useState, useEffect } from "react";
import api from "../../api/api";

// Helper để hiển thị ảnh
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
};

function ProfileForm({ user, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    email: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null); // Để hiển thị ảnh xem trước
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        age: user.age || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Set ảnh hiện tại làm preview
      setPreviewAvatar(getImageUrl(user.avatar_url));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Tạo URL ảo để xem trước ảnh vừa chọn ngay lập tức
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    
    // Chỉ gửi avatar nếu có chọn file mới
    if (avatarFile) {
      data.append("avatarFile", avatarFile);
    }

    try {
      // Gọi API PUT
      await api.put(`/api/users/${user.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onFormSubmit(); // Reload lại trang cha
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa hồ sơ</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-3">
                {previewAvatar ? (
                    <img src={previewAvatar} alt="Avatar Preview" className="w-full h-full object-cover rounded-full border-2 border-gray-200 shadow-sm" />
                ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                )}
                {/* Nút nhỏ để trigger input file */}
                <label htmlFor="avatarFile" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </label>
                <input 
                    type="file" id="avatarFile" name="avatarFile" 
                    onChange={handleAvatarChange} accept="image/*" 
                    className="hidden" 
                />
            </div>
            <p className="text-xs text-gray-500">Nhấn vào icon máy ảnh để đổi ảnh</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi</label>
                    <input
                        type="number" name="age" value={formData.age} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                    <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 cursor-not-allowed"
                disabled // Thường email không cho sửa tùy tiện
              />
            </div>
          </div>

          {error && <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button" onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-70"
            >
              {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              )}
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;