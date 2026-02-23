// frontend/src/pages/admin/ManageContentHome.js
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiSave, FiX, FiSearch, FiArrowUp, FiArrowDown, FiMusic, FiUsers } from "react-icons/fi";

function ManageContentHome() {
  const { songs, artists } = useOutletContext(); // Lấy list bài hát và nghệ sĩ từ Layout cha
  
  // State Tab
  const [activeTab, setActiveTab] = useState("songs"); // 'songs' hoặc 'artists'

  // State Bài hát
  const [pinnedSongIds, setPinnedSongIds] = useState([]);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  
  // State Nghệ sĩ
  const [pinnedArtistIds, setPinnedArtistIds] = useState([]);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Lấy cấu hình hiện tại từ Database
  useEffect(() => {
    Promise.all([
      api.get("/api/settings/pinned_song_ids"),
      api.get("/api/settings/pinned_artist_ids")
    ]).then(([songsRes, artistsRes]) => {
      setPinnedSongIds(songsRes.data || []);
      setPinnedArtistIds(artistsRes.data || []);
    }).catch(err => console.error("Lỗi lấy cấu hình:", err));
  }, []);

  // --- LOGIC BÀI HÁT ---
  const songSearchResults = songs.filter(song => 
    song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) && 
    !pinnedSongIds.includes(song.id)
  ).slice(0, 5); 

  const pinnedSongs = pinnedSongIds.map(id => songs.find(s => s.id === id)).filter(Boolean);

  const handleAddSong = (id) => setPinnedSongIds([...pinnedSongIds, id]);
  const handleRemoveSong = (id) => setPinnedSongIds(pinnedSongIds.filter(pid => pid !== id));
  const handleMoveSongUp = (index) => {
    if (index === 0) return;
    const newIds = [...pinnedSongIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setPinnedSongIds(newIds);
  };
  const handleMoveSongDown = (index) => {
    if (index === pinnedSongIds.length - 1) return;
    const newIds = [...pinnedSongIds];
    [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    setPinnedSongIds(newIds);
  };

  // --- LOGIC NGHỆ SĨ ---
  const artistSearchResults = artists.filter(artist => 
    artist.name.toLowerCase().includes(artistSearchQuery.toLowerCase()) && 
    !pinnedArtistIds.includes(artist.id)
  ).slice(0, 5);

  const pinnedArtistsList = pinnedArtistIds.map(id => artists.find(a => a.id === id)).filter(Boolean);

  const handleAddArtist = (id) => setPinnedArtistIds([...pinnedArtistIds, id]);
  const handleRemoveArtist = (id) => setPinnedArtistIds(pinnedArtistIds.filter(pid => pid !== id));
  const handleMoveArtistUp = (index) => {
    if (index === 0) return;
    const newIds = [...pinnedArtistIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setPinnedArtistIds(newIds);
  };
  const handleMoveArtistDown = (index) => {
    if (index === pinnedArtistIds.length - 1) return;
    const newIds = [...pinnedArtistIds];
    [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    setPinnedArtistIds(newIds);
  };

  // --- LƯU CHUNG ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
         api.put("/api/settings/pinned_song_ids", { value: pinnedSongIds }),
         api.put("/api/settings/pinned_artist_ids", { value: pinnedArtistIds })
      ]);
      alert("Đã lưu cấu hình Trang chủ thành công!");
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
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Trang chủ & Khám phá</h2>
        <button 
            onClick={handleSave} disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
        >
          <FiSave className="mr-2" /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 px-6 pt-2">
         <button 
           onClick={() => setActiveTab("songs")}
           className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'songs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            <FiMusic /> Bài hát nổi bật (Trang chủ)
         </button>
         <button 
           onClick={() => setActiveTab("artists")}
           className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'artists' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            <FiUsers /> Nghệ sĩ tiêu biểu (Khám phá)
         </button>
      </div>

      <div className="p-6">
        {/* --- TAB BÀI HÁT --- */}
        {activeTab === 'songs' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             {/* Cột Ghim Bài hát */}
             <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
               <h3 className="font-semibold text-gray-700 mb-2">Đang ghim ({pinnedSongs.length})</h3>
               <p className="text-xs text-gray-500 mb-4">Thứ tự hiển thị trên trang chủ sẽ tuân theo danh sách này.</p>
               
               <div className="space-y-2">
                 {pinnedSongs.map((song, index) => (
                   <div key={song.id} className="flex items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                     <span className="w-6 font-bold text-gray-400">{index + 1}</span>
                     <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mx-2" />
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate">{song.title}</p>
                     </div>
                     <div className="flex items-center space-x-1 ml-2">
                       <button onClick={() => handleMoveSongUp(index)} disabled={index === 0} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30"><FiArrowUp /></button>
                       <button onClick={() => handleMoveSongDown(index)} disabled={index === pinnedSongIds.length - 1} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30"><FiArrowDown /></button>
                       <button onClick={() => handleRemoveSong(song.id)} className="p-1 text-red-400 hover:text-red-600 ml-1"><FiX size={18}/></button>
                     </div>
                   </div>
                 ))}
                 {pinnedSongs.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Chưa có bài hát nào.</p>}
               </div>
             </div>

             {/* Cột Tìm bài hát */}
             <div>
               <h3 className="font-semibold text-gray-700 mb-4">Thêm bài hát</h3>
               <div className="relative mb-4">
                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
                 <input 
                   type="text" placeholder="Tìm tên bài hát..." 
                   value={songSearchQuery} onChange={e => setSongSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                 />
               </div>
               <div className="space-y-2">
                 {songSearchResults.map(song => (
                   <div key={song.id} className="flex items-center bg-white p-2 rounded border border-gray-200 hover:bg-blue-50 transition">
                     <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate">{song.title}</p>
                     </div>
                     <button onClick={() => handleAddSong(song.id)} className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded hover:bg-blue-200">
                       Thêm
                     </button>
                   </div>
                 ))}
                 {songSearchQuery && songSearchResults.length === 0 && <p className="text-gray-400 text-sm">Không tìm thấy.</p>}
               </div>
             </div>
           </div>
        )}

        {/* --- TAB NGHỆ SĨ --- */}
        {activeTab === 'artists' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             {/* Cột Ghim Nghệ sĩ */}
             <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
               <h3 className="font-semibold text-gray-700 mb-2">Đang ghim ({pinnedArtistsList.length})</h3>
               <p className="text-xs text-gray-500 mb-4">Thứ tự hiển thị trên trang Nghệ sĩ sẽ tuân theo danh sách này.</p>
               
               <div className="space-y-2">
                 {pinnedArtistsList.map((artist, index) => (
                   <div key={artist.id} className="flex items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                     <span className="w-6 font-bold text-gray-400">{index + 1}</span>
                     <img src={getImageUrl(artist.image_url)} alt="" className="w-10 h-10 rounded-full object-cover mx-2" />
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate">{artist.name}</p>
                     </div>
                     <div className="flex items-center space-x-1 ml-2">
                       <button onClick={() => handleMoveArtistUp(index)} disabled={index === 0} className="p-1 text-gray-400 hover:text-purple-500 disabled:opacity-30"><FiArrowUp /></button>
                       <button onClick={() => handleMoveArtistDown(index)} disabled={index === pinnedArtistIds.length - 1} className="p-1 text-gray-400 hover:text-purple-500 disabled:opacity-30"><FiArrowDown /></button>
                       <button onClick={() => handleRemoveArtist(artist.id)} className="p-1 text-red-400 hover:text-red-600 ml-1"><FiX size={18}/></button>
                     </div>
                   </div>
                 ))}
                 {pinnedArtistsList.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">Chưa có nghệ sĩ nào.</p>}
               </div>
             </div>

             {/* Cột Tìm Nghệ sĩ */}
             <div>
               <h3 className="font-semibold text-gray-700 mb-4">Thêm nghệ sĩ</h3>
               <div className="relative mb-4">
                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
                 <input 
                   type="text" placeholder="Tìm tên nghệ sĩ..." 
                   value={artistSearchQuery} onChange={e => setArtistSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                 />
               </div>
               <div className="space-y-2">
                 {artistSearchResults.map(artist => (
                   <div key={artist.id} className="flex items-center bg-white p-2 rounded border border-gray-200 hover:bg-purple-50 transition">
                     <img src={getImageUrl(artist.image_url)} alt="" className="w-10 h-10 rounded-full object-cover mr-3" />
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm truncate">{artist.name}</p>
                     </div>
                     <button onClick={() => handleAddArtist(artist.id)} className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded hover:bg-purple-200">
                       Thêm
                     </button>
                   </div>
                 ))}
                 {artistSearchQuery && artistSearchResults.length === 0 && <p className="text-gray-400 text-sm">Không tìm thấy.</p>}
               </div>
             </div>
           </div>
        )}

      </div>
    </section>
  );
}
export default ManageContentHome;