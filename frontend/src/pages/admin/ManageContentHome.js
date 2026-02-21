//frontend/src/pages/admin/ManageContentHome.js
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiSave, FiX, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

function ManageContentHome() {
  const { songs } = useOutletContext(); // Lấy list bài hát từ Layout cha
  const [pinnedIds, setPinnedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Lấy cấu hình hiện tại từ Database
  useEffect(() => {
    api.get("/api/settings/pinned_song_ids")
      .then(res => setPinnedIds(res.data || []))
      .catch(err => console.error("Lỗi lấy cấu hình:", err));
  }, []);

  // Lọc bài hát theo tìm kiếm
  const searchResults = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !pinnedIds.includes(song.id) // Ẩn những bài đã được ghim
  ).slice(0, 5); // Hiển thị 5 kết quả cho gọn

  // Các bài hát đang được ghim (Map ID ra Object để render)
  const pinnedSongs = pinnedIds.map(id => songs.find(s => s.id === id)).filter(Boolean);

  const handleAdd = (id) => setPinnedIds([...pinnedIds, id]);
  const handleRemove = (id) => setPinnedIds(pinnedIds.filter(pid => pid !== id));

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newIds = [...pinnedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setPinnedIds(newIds);
  };

  const handleMoveDown = (index) => {
    if (index === pinnedIds.length - 1) return;
    const newIds = [...pinnedIds];
    [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    setPinnedIds(newIds);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/api/settings/pinned_song_ids", { value: pinnedIds });
      alert("Đã lưu cấu hình Trang chủ!");
    } catch (err) {
      alert("Lỗi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/50';
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý "Bài hát nổi bật"</h2>
        <button 
            onClick={handleSave} disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <FiSave className="mr-2" /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT 1: Danh sách đang ghim */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4">Các bài hát đang ghim ({pinnedSongs.length})</h3>
          <p className="text-sm text-gray-500 mb-4">Thứ tự hiển thị trên trang chủ sẽ tuân theo danh sách này.</p>
          
          <div className="space-y-2">
            {pinnedSongs.map((song, index) => (
              <div key={song.id} className="flex items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                <span className="w-6 font-bold text-gray-400">{index + 1}</span>
                <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mx-3" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{song.title}</p>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30"><FiArrowUp /></button>
                  <button onClick={() => handleMoveDown(index)} disabled={index === pinnedIds.length - 1} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30"><FiArrowDown /></button>
                  <button onClick={() => handleRemove(song.id)} className="p-1 text-red-400 hover:text-red-600 ml-2"><FiX size={18}/></button>
                </div>
              </div>
            ))}
            {pinnedSongs.length === 0 && <p className="text-gray-400 text-sm italic">Chưa có bài hát nào được ghim.</p>}
          </div>
        </div>

        {/* CỘT 2: Tìm kiếm & Thêm mới */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">Thêm bài hát</h3>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" placeholder="Tìm tên bài hát..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-2">
            {searchResults.map(song => (
              <div key={song.id} className="flex items-center bg-white p-2 rounded border border-gray-200 hover:bg-blue-50 transition">
                <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{song.title}</p>
                </div>
                <button onClick={() => handleAdd(song.id)} className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded hover:bg-blue-200">
                  Thêm
                </button>
              </div>
            ))}
            {searchQuery && searchResults.length === 0 && <p className="text-gray-400 text-sm">Không tìm thấy bài hát phù hợp.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
export default ManageContentHome;