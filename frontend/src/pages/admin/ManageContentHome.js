// frontend/src/pages/admin/ManageContentHome.js
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiSave, FiX, FiSearch, FiArrowUp, FiArrowDown, FiMusic, FiUsers, FiPlus, FiEdit3, FiTrash } from "react-icons/fi";

function ManageContentHome() {
  const { songs, artists } = useOutletContext(); 
  const [activeTab, setActiveTab] = useState("songs"); 

  // --- STATE BÀI HÁT (DYNAMIC BLOCKS) ---
  // Mặc định có 1 block ban đầu
  const [songBlocks, setSongBlocks] = useState([
    { id: "block_" + Date.now(), title: "Bài hát nổi bật", songIds: [] }
  ]);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [activeBlockId, setActiveBlockId] = useState(null); // Block nào đang được chọn để thêm bài hát vào

  // --- STATE NGHỆ SĨ (Giữ nguyên mảng 1 chiều) ---
  const [pinnedArtistIds, setPinnedArtistIds] = useState([]);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    Promise.all([
      api.get("/api/settings/pinned_song_ids"),
      api.get("/api/settings/pinned_artist_ids")
    ]).then(([songsRes, artistsRes]) => {
      
      // Xử lý songBlocks: Kiểm tra xem data cũ là Array ID hay Array Objects
      const rawSongData = songsRes.data;
      if (Array.isArray(rawSongData) && rawSongData.length > 0) {
        if (typeof rawSongData[0] === 'object') {
           // Đã là định dạng mới
           setSongBlocks(rawSongData);
           setActiveBlockId(rawSongData[0].id);
        } else {
           // Là định dạng cũ (Mảng số), chuyển đổi (migrate) nó sang định dạng mới
           setSongBlocks([{ id: "block_old", title: "Bài hát nổi bật", songIds: rawSongData }]);
           setActiveBlockId("block_old");
        }
      } else {
         setActiveBlockId(songBlocks[0].id);
      }

      setPinnedArtistIds(artistsRes.data || []);
    }).catch(err => console.error("Lỗi lấy cấu hình:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ==========================================
  // --- LOGIC BLOCK BÀI HÁT (DYNAMIC CMS) ---
  // ==========================================

  // Quản lý Block
  const handleAddBlock = () => {
    const newBlock = { id: "block_" + Date.now(), title: "Danh sách mới", songIds: [] };
    setSongBlocks([...songBlocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const handleRemoveBlock = (blockId) => {
    if (window.confirm("Bạn có chắc muốn xóa khối danh sách này?")) {
      const newBlocks = songBlocks.filter(b => b.id !== blockId);
      setSongBlocks(newBlocks);
      if (activeBlockId === blockId && newBlocks.length > 0) {
        setActiveBlockId(newBlocks[0].id);
      }
    }
  };

  const handleRenameBlock = (blockId, newTitle) => {
    setSongBlocks(songBlocks.map(b => b.id === blockId ? { ...b, title: newTitle } : b));
  };

  const handleMoveBlockUp = (index) => {
    if (index === 0) return;
    const newBlocks = [...songBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setSongBlocks(newBlocks);
  };

  const handleMoveBlockDown = (index) => {
    if (index === songBlocks.length - 1) return;
    const newBlocks = [...songBlocks];
    [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    setSongBlocks(newBlocks);
  };

  // Quản lý bài hát trong Block đang active
  const activeBlock = songBlocks.find(b => b.id === activeBlockId) || songBlocks[0];
  const activeSongIds = activeBlock ? activeBlock.songIds : [];

  const songSearchResults = songs.filter(song => 
    song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) && 
    !activeSongIds.includes(song.id)
  ).slice(0, 5); 

  const handleAddSongToBlock = (songId) => {
    if (!activeBlockId) return alert("Vui lòng tạo hoặc chọn một danh sách trước!");
    setSongBlocks(songBlocks.map(b => 
       b.id === activeBlockId ? { ...b, songIds: [...b.songIds, songId] } : b
    ));
  };

  const handleRemoveSongFromBlock = (blockId, songId) => {
    setSongBlocks(songBlocks.map(b => 
       b.id === blockId ? { ...b, songIds: b.songIds.filter(id => id !== songId) } : b
    ));
  };

  const handleMoveSongUp = (blockId, index) => {
    if (index === 0) return;
    setSongBlocks(songBlocks.map(b => {
        if (b.id === blockId) {
            const newIds = [...b.songIds];
            [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
            return { ...b, songIds: newIds };
        }
        return b;
    }));
  };

  const handleMoveSongDown = (blockId, index) => {
    setSongBlocks(songBlocks.map(b => {
        if (b.id === blockId) {
            if (index === b.songIds.length - 1) return b;
            const newIds = [...b.songIds];
            [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
            return { ...b, songIds: newIds };
        }
        return b;
    }));
  };

  // ==========================================
  // --- LOGIC NGHỆ SĨ (Giữ nguyên) ---
  // ==========================================
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
         // Lưu mảng Object lên Backend (Backend tự chuyển thành chuỗi JSON vào CSDL)
         api.put("/api/settings/pinned_song_ids", { value: songBlocks }),
         api.put("/api/settings/pinned_artist_ids", { value: pinnedArtistIds })
      ]);
      alert("Đã lưu cấu hình Trang chủ thành công!");
    } catch (err) {
      alert("Lỗi lưu cấu hình");
    } finally {
      setIsSaving(false);
    }
  };

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Nghệ sĩ không xác định";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/50';
    if (url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Trang chủ & Khám phá</h2>
        <button 
            onClick={handleSave} disabled={isSaving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
        >
          <FiSave className="mr-2" /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 px-6 pt-2 shrink-0">
         <button 
           onClick={() => setActiveTab("songs")}
           className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'songs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            <FiMusic /> Bố cục Trang chủ
         </button>
         <button 
           onClick={() => setActiveTab("artists")}
           className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'artists' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            <FiUsers /> Nghệ sĩ tiêu biểu
         </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
        {/* --- TAB BÀI HÁT (DYNAMIC BLOCKS) --- */}
        {activeTab === 'songs' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
             
             {/* CỘT TRÁI: QUẢN LÝ CÁC BLOCK (Khu vực ghim) */}
             <div className="lg:col-span-8 space-y-6">
                
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Các danh sách (Blocks)</h3>
                        <p className="text-sm text-gray-500">Mỗi block sẽ hiển thị thành 1 dòng trên Trang chủ</p>
                    </div>
                    <button 
                        onClick={handleAddBlock}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition"
                    >
                        <FiPlus /> Thêm Block mới
                    </button>
                </div>

                {songBlocks.map((block, bIndex) => {
                    // Map ID ra Object bài hát
                    const currentBlockSongs = block.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
                    const isActive = activeBlockId === block.id;

                    return (
                        <div 
                            key={block.id} 
                            className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-300 ${isActive ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-200 opacity-80 hover:opacity-100'}`}
                            onClick={() => setActiveBlockId(block.id)}
                        >
                            {/* Block Header */}
                            <div className={`p-4 border-b flex justify-between items-center ${isActive ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3 flex-1 mr-4">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveBlockUp(bIndex); }} disabled={bIndex === 0} className="p-0.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30"><FiArrowUp size={14}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMoveBlockDown(bIndex); }} disabled={bIndex === songBlocks.length - 1} className="p-0.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30"><FiArrowDown size={14}/></button>
                                    </div>
                                    <div className="flex-1 relative group cursor-text">
                                        <input 
                                            value={block.title}
                                            onChange={(e) => handleRenameBlock(block.id, e.target.value)}
                                            className="font-bold text-lg text-gray-800 bg-transparent border-b-2 border-transparent focus:border-blue-400 focus:outline-none w-full px-1 py-0.5"
                                        />
                                        <FiEdit3 className="absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">{currentBlockSongs.length} bài</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveBlock(block.id); }}
                                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition"
                                    >
                                        <FiTrash/>
                                    </button>
                                </div>
                            </div>

                            {/* Block Body (Danh sách bài hát) */}
                            <div className="p-4 bg-white min-h-[100px]">
                                {currentBlockSongs.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentBlockSongs.map((song, sIndex) => (
                                            <div key={song.id} className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-100 hover:border-blue-200 transition">
                                                <span className="w-6 text-center font-bold text-gray-400 text-sm">{sIndex + 1}</span>
                                                <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mx-3" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate">{song.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleMoveSongUp(block.id, sIndex); }} disabled={sIndex === 0} className="p-1.5 text-gray-400 hover:text-blue-500 bg-white rounded shadow-sm disabled:opacity-30"><FiArrowUp size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleMoveSongDown(block.id, sIndex); }} disabled={sIndex === block.songIds.length - 1} className="p-1.5 text-gray-400 hover:text-blue-500 bg-white rounded shadow-sm disabled:opacity-30"><FiArrowDown size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveSongFromBlock(block.id, song.id); }} className="p-1.5 text-red-400 hover:text-white bg-white hover:bg-red-500 rounded shadow-sm ml-2 transition"><FiX size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8 bg-gray-50/50">
                                        <p className="text-gray-400 text-sm font-medium">Click chọn khối này và tìm thêm bài hát ở cột bên phải 👉</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* CỘT PHẢI: TÌM VÀ THÊM BÀI HÁT (Fixed position) */}
             <div className="lg:col-span-4 sticky top-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-2">Thêm vào khối đang chọn</h3>
               <p className="text-xs text-blue-600 font-bold mb-4 bg-blue-50 p-2 rounded truncate border border-blue-100">
                  Đang chọn: {activeBlock?.title || "Chưa có"}
               </p>
               
               <div className="relative mb-4">
                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
                 <input 
                   type="text" placeholder="Gõ tên bài hát..." 
                   value={songSearchQuery} onChange={e => setSongSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
                 />
               </div>
               
               <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                 {songSearchResults.map(song => (
                   <div key={song.id} className="flex items-center bg-white p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-sm transition cursor-pointer" onClick={() => handleAddSongToBlock(song.id)}>
                     <img src={getImageUrl(song.image_url)} alt="" className="w-12 h-12 rounded object-cover mr-3" />
                     <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                     </div>
                     <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors shrink-0">
                       <FiPlus />
                     </button>
                   </div>
                 ))}
                 {songSearchQuery && songSearchResults.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Không tìm thấy bài hát.</p>}
               </div>
             </div>
           </div>
        )}

        {/* --- TAB NGHỆ SĨ --- */}
        {activeTab === 'artists' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
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