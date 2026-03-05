// frontend/src/pages/admin/ManageContentHome.js
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiSave, FiX, FiSearch, FiArrowUp, FiArrowDown, FiMusic, FiUsers, FiPlus, FiEdit3, FiTrash } from "react-icons/fi";

function ManageContentHome() {
  const { songs, artists } = useOutletContext(); 
  const [activeTab, setActiveTab] = useState("songs"); 
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE BÀI HÁT (DYNAMIC BLOCKS) ---
  const [songBlocks, setSongBlocks] = useState([
    { id: "block_" + Date.now(), title: "Bài hát nổi bật", songIds: [] }
  ]);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [activeSongBlockId, setActiveSongBlockId] = useState(null);

  // --- STATE NGHỆ SĨ (DYNAMIC BLOCKS) ---
  const [artistBlocks, setArtistBlocks] = useState([
    { id: "artist_block_" + Date.now(), title: "Nghệ sĩ tiêu biểu", artistIds: [] }
  ]);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [activeArtistBlockId, setActiveArtistBlockId] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    Promise.all([
      api.get("/api/settings/pinned_song_ids"),
      api.get("/api/settings/pinned_artist_ids")
    ]).then(([songsRes, artistsRes]) => {
      
      // 1. Xử lý Block Bài hát
      const rawSongData = songsRes.data;
      if (Array.isArray(rawSongData) && rawSongData.length > 0) {
        if (typeof rawSongData[0] === 'object') {
           setSongBlocks(rawSongData);
           setActiveSongBlockId(rawSongData[0].id);
        } else {
           setSongBlocks([{ id: "block_old", title: "Bài hát nổi bật", songIds: rawSongData }]);
           setActiveSongBlockId("block_old");
        }
      } else {
         setActiveSongBlockId(songBlocks[0].id);
      }

      // 2. Xử lý Block Nghệ sĩ
      const rawArtistData = artistsRes.data;
      if (Array.isArray(rawArtistData) && rawArtistData.length > 0) {
        if (typeof rawArtistData[0] === 'object') {
           setArtistBlocks(rawArtistData);
           setActiveArtistBlockId(rawArtistData[0].id);
        } else {
           // Tương thích với dữ liệu mảng ID cũ
           setArtistBlocks([{ id: "artist_block_old", title: "Nghệ sĩ tiêu biểu", artistIds: rawArtistData }]);
           setActiveArtistBlockId("artist_block_old");
        }
      } else {
         setActiveArtistBlockId(artistBlocks[0].id);
      }

    }).catch(err => console.error("Lỗi lấy cấu hình:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // --- HÀM TIỆN ÍCH DÙNG CHUNG CHO BLOCK ---
  // ==========================================
  const addBlock = (setBlocks, blocks, setActiveId, prefix) => {
    const newBlock = { id: `${prefix}_${Date.now()}`, title: "Danh sách mới", [prefix === 'block' ? 'songIds' : 'artistIds']: [] };
    setBlocks([...blocks, newBlock]);
    setActiveId(newBlock.id);
  };

  const removeBlock = (setBlocks, blocks, blockId, setActiveId) => {
    if (window.confirm("Bạn có chắc muốn xóa khối danh sách này?")) {
      const newBlocks = blocks.filter(b => b.id !== blockId);
      setBlocks(newBlocks);
      if (newBlocks.length > 0) setActiveId(newBlocks[0].id);
    }
  };

  const renameBlock = (setBlocks, blocks, blockId, newTitle) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, title: newTitle } : b));
  };

  const moveBlock = (setBlocks, blocks, index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[targetIndex], newBlocks[index]] = [newBlocks[index], newBlocks[targetIndex]];
    setBlocks(newBlocks);
  };

  const addItemToBlock = (setBlocks, blocks, activeId, itemId, arrayKey) => {
    if (!activeId) return alert("Vui lòng tạo hoặc chọn một danh sách trước!");
    setBlocks(blocks.map(b => b.id === activeId ? { ...b, [arrayKey]: [...b[arrayKey], itemId] } : b));
  };

  const removeItemFromBlock = (setBlocks, blocks, blockId, itemId, arrayKey) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, [arrayKey]: b[arrayKey].filter(id => id !== itemId) } : b));
  };

  const moveItemInBlock = (setBlocks, blocks, blockId, index, direction, arrayKey) => {
    setBlocks(blocks.map(b => {
        if (b.id === blockId) {
            if ((direction === 'up' && index === 0) || (direction === 'down' && index === b[arrayKey].length - 1)) return b;
            const newIds = [...b[arrayKey]];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newIds[targetIndex], newIds[index]] = [newIds[index], newIds[targetIndex]];
            return { ...b, [arrayKey]: newIds };
        }
        return b;
    }));
  };

  // --- LƯU CHUNG ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
         api.put("/api/settings/pinned_song_ids", { value: songBlocks }),
         api.put("/api/settings/pinned_artist_ids", { value: artistBlocks }) // Giờ đây lưu mảng Object
      ]);
      alert("Đã lưu cấu hình CMS thành công!");
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

  const displayArtistNames = (artistsArray) => {
    if (!artistsArray || artistsArray.length === 0) return "Unknown";
    return artistsArray.map((artist) => artist.name).join(", ");
  };

  // Dữ liệu hiển thị cột phải
  const activeSongBlock = songBlocks.find(b => b.id === activeSongBlockId) || songBlocks[0];
  const activeArtistBlock = artistBlocks.find(b => b.id === activeArtistBlockId) || artistBlocks[0];

  const songSearchResults = songs.filter(song => 
    song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) && 
    !(activeSongBlock?.songIds || []).includes(song.id)
  ).slice(0, 5); 

  const artistSearchResults = artists.filter(artist => 
    artist.name.toLowerCase().includes(artistSearchQuery.toLowerCase()) && 
    !(activeArtistBlock?.artistIds || []).includes(artist.id)
  ).slice(0, 5);

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý CMS Trang chủ & Khám phá</h2>
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
            <FiMusic /> Bố cục Trang chủ (Bài hát)
         </button>
         <button 
           onClick={() => setActiveTab("artists")}
           className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 ${activeTab === 'artists' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
            <FiUsers /> Bố cục Nghệ sĩ
         </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
        
        {/* ===================================== */}
        {/* TAB BÀI HÁT */}
        {/* ===================================== */}
        {activeTab === 'songs' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
             <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Các khối danh sách bài hát</h3>
                    </div>
                    <button onClick={() => addBlock(setSongBlocks, songBlocks, setActiveSongBlockId, 'block')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition">
                        <FiPlus /> Thêm Block
                    </button>
                </div>

                {songBlocks.map((block, bIndex) => {
                    const currentBlockSongs = block.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
                    const isActive = activeSongBlockId === block.id;

                    return (
                        <div key={block.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${isActive ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-200 hover:border-blue-200'}`} onClick={() => setActiveSongBlockId(block.id)}>
                            <div className={`p-4 border-b flex justify-between items-center ${isActive ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3 flex-1 mr-4">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(setSongBlocks, songBlocks, bIndex, 'up'); }} disabled={bIndex === 0} className="p-0.5 bg-gray-200 rounded disabled:opacity-30"><FiArrowUp size={14}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(setSongBlocks, songBlocks, bIndex, 'down'); }} disabled={bIndex === songBlocks.length - 1} className="p-0.5 bg-gray-200 rounded disabled:opacity-30"><FiArrowDown size={14}/></button>
                                    </div>
                                    <div className="flex-1 relative group cursor-text">
                                        <input value={block.title} onChange={(e) => renameBlock(setSongBlocks, songBlocks, block.id, e.target.value)} className="font-bold text-lg text-gray-800 bg-transparent border-b-2 border-transparent focus:border-blue-400 focus:outline-none w-full px-1" />
                                        <FiEdit3 className="absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">{currentBlockSongs.length} bài</span>
                                    <button onClick={(e) => { e.stopPropagation(); removeBlock(setSongBlocks, songBlocks, block.id, setActiveSongBlockId); }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition"><FiTrash/></button>
                                </div>
                            </div>

                            <div className="p-4 min-h-[100px]">
                                {currentBlockSongs.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentBlockSongs.map((song, sIndex) => (
                                            <div key={song.id} className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-100 hover:border-blue-200">
                                                <span className="w-6 text-center font-bold text-gray-400 text-sm">{sIndex + 1}</span>
                                                <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mx-3" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate">{song.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    <button onClick={(e) => { e.stopPropagation(); moveItemInBlock(setSongBlocks, songBlocks, block.id, sIndex, 'up', 'songIds'); }} disabled={sIndex === 0} className="p-1.5 text-gray-400 bg-white rounded shadow-sm"><FiArrowUp size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); moveItemInBlock(setSongBlocks, songBlocks, block.id, sIndex, 'down', 'songIds'); }} disabled={sIndex === block.songIds.length - 1} className="p-1.5 text-gray-400 bg-white rounded shadow-sm"><FiArrowDown size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); removeItemFromBlock(setSongBlocks, songBlocks, block.id, song.id, 'songIds'); }} className="p-1.5 text-red-400 bg-white hover:bg-red-500 hover:text-white rounded shadow-sm ml-2"><FiX size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8"><p className="text-gray-400 text-sm">Trống</p></div>
                                )}
                            </div>
                        </div>
                    );
                })}
             </div>

             <div className="lg:col-span-4 sticky top-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-2">Thêm vào khối Bài hát</h3>
               <p className="text-xs text-blue-600 font-bold mb-4 bg-blue-50 p-2 rounded truncate border border-blue-100">Đang chọn: {activeSongBlock?.title}</p>
               <div className="relative mb-4">
                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
                 <input type="text" placeholder="Tìm bài hát..." value={songSearchQuery} onChange={e => setSongSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white" />
               </div>
               <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                 {songSearchResults.map(song => (
                   <div key={song.id} className="flex items-center bg-white p-2 rounded-lg border border-gray-100 hover:border-blue-300 cursor-pointer" onClick={() => addItemToBlock(setSongBlocks, songBlocks, activeSongBlockId, song.id, 'songIds')}>
                     <img src={getImageUrl(song.image_url)} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                     <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{displayArtistNames(song.artists)}</p>
                     </div>
                     <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full"><FiPlus /></button>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        )}


        {/* ===================================== */}
        {/* TAB NGHỆ SĨ (MỚI) */}
        {/* ===================================== */}
        {activeTab === 'artists' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
             <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Các khối danh sách Nghệ sĩ</h3>
                    </div>
                    <button onClick={() => addBlock(setArtistBlocks, artistBlocks, setActiveArtistBlockId, 'artist_block')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition">
                        <FiPlus /> Thêm Block
                    </button>
                </div>

                {artistBlocks.map((block, bIndex) => {
                    const currentBlockArtists = block.artistIds.map(id => artists.find(a => a.id === id)).filter(Boolean);
                    const isActive = activeArtistBlockId === block.id;

                    return (
                        <div key={block.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${isActive ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-200 hover:border-blue-200'}`} onClick={() => setActiveArtistBlockId(block.id)}>
                            <div className={`p-4 border-b flex justify-between items-center ${isActive ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3 flex-1 mr-4">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(setArtistBlocks, artistBlocks, bIndex, 'up'); }} disabled={bIndex === 0} className="p-0.5 bg-gray-200 rounded disabled:opacity-30"><FiArrowUp size={14}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveBlock(setArtistBlocks, artistBlocks, bIndex, 'down'); }} disabled={bIndex === artistBlocks.length - 1} className="p-0.5 bg-gray-200 rounded disabled:opacity-30"><FiArrowDown size={14}/></button>
                                    </div>
                                    <div className="flex-1 relative group cursor-text">
                                        <input value={block.title} onChange={(e) => renameBlock(setArtistBlocks, artistBlocks, block.id, e.target.value)} className="font-bold text-lg text-gray-800 bg-transparent border-b-2 border-transparent focus:border-blue-400 focus:outline-none w-full px-1" />
                                        <FiEdit3 className="absolute right-2 top-2 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">{currentBlockArtists.length} ca sĩ</span>
                                    <button onClick={(e) => { e.stopPropagation(); removeBlock(setArtistBlocks, artistBlocks, block.id, setActiveArtistBlockId); }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition"><FiTrash/></button>
                                </div>
                            </div>

                            <div className="p-4 min-h-[100px]">
                                {currentBlockArtists.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {currentBlockArtists.map((artist, aIndex) => (
                                            <div key={artist.id} className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-100 hover:border-blue-200">
                                                <img src={getImageUrl(artist.image_url)} alt="" className="w-10 h-10 rounded-full object-cover mx-2" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate">{artist.name}</p>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button onClick={(e) => { e.stopPropagation(); moveItemInBlock(setArtistBlocks, artistBlocks, block.id, aIndex, 'up', 'artistIds'); }} disabled={aIndex === 0} className="p-1 text-gray-400 bg-white rounded shadow-sm"><FiArrowUp size={12}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); moveItemInBlock(setArtistBlocks, artistBlocks, block.id, aIndex, 'down', 'artistIds'); }} disabled={aIndex === block.artistIds.length - 1} className="p-1 text-gray-400 bg-white rounded shadow-sm"><FiArrowDown size={12}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); removeItemFromBlock(setArtistBlocks, artistBlocks, block.id, artist.id, 'artistIds'); }} className="p-1 text-red-400 bg-white hover:bg-red-500 hover:text-white rounded shadow-sm"><FiX size={12}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8"><p className="text-gray-400 text-sm">Trống</p></div>
                                )}
                            </div>
                        </div>
                    );
                })}
             </div>

             <div className="lg:col-span-4 sticky top-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-2">Thêm vào khối Nghệ sĩ</h3>
               <p className="text-xs text-blue-600 font-bold mb-4 bg-blue-50 p-2 rounded truncate border border-blue-100">Đang chọn: {activeArtistBlock?.title}</p>
               <div className="relative mb-4">
                 <FiSearch className="absolute left-3 top-3 text-gray-400" />
                 <input type="text" placeholder="Tìm nghệ sĩ..." value={artistSearchQuery} onChange={e => setArtistSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white" />
               </div>
               <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                 {artistSearchResults.map(artist => (
                   <div key={artist.id} className="flex items-center bg-white p-2 rounded-lg border border-gray-100 hover:border-blue-300 cursor-pointer" onClick={() => addItemToBlock(setArtistBlocks, artistBlocks, activeArtistBlockId, artist.id, 'artistIds')}>
                     <img src={getImageUrl(artist.image_url)} alt="" className="w-10 h-10 rounded-full object-cover mr-3" />
                     <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">{artist.name}</p>
                     </div>
                     <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full"><FiPlus /></button>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        )}
      </div>
    </section>
  );
}
export default ManageContentHome;