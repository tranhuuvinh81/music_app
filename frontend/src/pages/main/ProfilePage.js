// frontend/src/pages/main/ProfilePage.js
import React, { useState, useEffect, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import ProfileForm from "../../components/forms/ProfileForm";
import {
  FiEdit3,
  FiMapPin,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMusic,
  FiUser,
  FiSettings,
} from "react-icons/fi";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("playlists"); // 'playlists' | 'about'

  // Helper lấy ảnh (Cloudinary hoặc Local)
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  // Fetch dữ liệu
  const fetchData = async () => {
    if (user) {
      try {
        const [profileRes, playlistRes] = await Promise.all([
          api.get(`/api/users/${user.id}`),
          api.get(`/api/playlists/user/${user.id}`),
        ]);
        setProfile(profileRes.data);
        setPlaylists(playlistRes.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFormSubmit = () => {
    setIsEditing(false);
    fetchData(); // Reload lại dữ liệu sau khi sửa
  };

  if (!profile)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  // Format ngày tham gia (Giả sử DB có cột created_at)
  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("vi-VN")
    : "Thành viên mới";

  return (
    <div className="flex-grow bg-gray-50 min-h-screen pb-10">
      {/* 1. HEADER & BANNER SECTION */}
      <div className="relative bg-white shadow-sm mb-6">
        {/* Banner (Gradient nền hoặc ảnh bìa nếu có) */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative -mt-16 md:-mt-20 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={getImageUrl(profile.avatar_url)}
                alt="Avatar"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
              {/* Nút sửa nhanh avatar (Optional UI) */}
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 shadow-md md:hidden"
              >
                <FiEdit3 />
              </button>
            </div>

            {/* Thông tin chính */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-[-15px]">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-gray-500 font-medium">@{profile.username}</p>

              {/* Stats nhỏ */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FiMusic /> <strong>{playlists.length}</strong> Playlists
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar /> Tham gia: {joinDate}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4 md:mb-6">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                <FiEdit3 /> Chỉnh sửa hồ sơ
              </button>
              <button className="p-2 bg-gray-100 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-200">
                <FiSettings />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-t border-gray-100">
            <button
              onClick={() => setActiveTab("playlists")}
              className={`py-4 text-sm font-bold uppercase border-b-2 transition-colors ${
                activeTab === "playlists"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 text-sm font-bold uppercase border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Thông tin chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="container mx-auto px-4 max-w-5xl">
        {/* VIEW: FORM CHỈNH SỬA (Hiện đè lên hoặc thay thế khi active) */}
        {isEditing ? (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Cập nhật thông tin
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-red-500"
              >
                Đóng
              </button>
            </div>
            <ProfileForm
              user={profile}
              onFormSubmit={handleFormSubmit}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* TAB: PLAYLISTS */}
            {activeTab === "playlists" && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Bộ sưu tập của tôi
                </h3>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer"
                      >
                        {/* Thumbnail Playlist (Giả sử dùng ảnh đầu tiên hoặc placeholder) */}
                        <div className="aspect-square bg-gray-200 rounded-md overflow-hidden mb-3 relative">
                          <img
                            src={getImageUrl(pl.thumbnail_url)}
                            alt={pl.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                        <h4 className="font-bold text-gray-800 truncate">
                          {pl.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {pl.description || "Không có mô tả"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-gray-300 mb-4">
                      <FiMusic size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      Bạn chưa tạo playlist nào.
                    </p>
                    <p className="text-sm text-gray-400">
                      Hãy bắt đầu tạo bộ sưu tập âm nhạc của riêng mình!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ABOUT (Thông tin chi tiết) */}
            {activeTab === "about" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Cột trái: Thông tin liên hệ */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-4">
                    <InfoRow
                      icon={<FiMail />}
                      label="Email"
                      value={profile.email}
                    />
                    <InfoRow
                      icon={<FiPhone />}
                      label="Số điện thoại"
                      value={profile.phone || "Chưa cập nhật"}
                    />
                    <InfoRow
                      icon={<FiMapPin />}
                      label="Địa chỉ"
                      value={profile.address || "Chưa cập nhật"}
                    />
                    <InfoRow
                      icon={<FiUser />}
                      label="Tuổi"
                      value={profile.age || "Chưa cập nhật"}
                    />
                  </div>
                </div>

                {/* Cột phải: Tóm tắt */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 h-fit">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">
                    Giới thiệu
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {profile.bio ||
                      "Người dùng này rất bí ẩn và chưa viết gì về bản thân."}
                  </p>
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <p className="text-xs text-blue-500 uppercase font-bold">
                      Trạng thái tài khoản
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-200 text-green-700 text-xs rounded font-bold">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Component con hiển thị dòng thông tin
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
