// frontend/src/pages/admin/AdminSongPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiTrash2, FiEdit2, FiArrowUp, FiArrowDown } from "react-icons/fi"; // [NEW] Thêm icon mũi tên

function AdminSongPage() {
  const {
    songs,
    handleAddSongClick,
    handleEditSongClick,
    fetchSongs,
    displayArtistNames,
  } = useOutletContext();

  // --- STATE CŨ ---
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongIds, setSelectedSongIds] = useState([]);

  // --- [NEW] STATE SẮP XẾP ---
  // Khởi tạo mặc định sắp xếp theo ID (mới nhất lên đầu - giảm dần)
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // 1. Hàm Xử lý Lọc (Search) - Giữ nguyên
  const filteredSongs = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    if (!searchQuery) return songs;
    const lowercasedQuery = searchQuery.toLowerCase();
    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(lowercasedQuery);
      const artistMatch =
        song.artists &&
        song.artists.some((artist) =>
          artist.name?.toLowerCase().includes(lowercasedQuery)
        );
      return titleMatch || artistMatch;
    });
  }, [songs, searchQuery]);

  // 2. [NEW] Hàm Xử lý Sắp xếp (Sort)
  const sortedSongs = useMemo(() => {
    // Copy mảng đã lọc ra để không làm thay đổi mảng gốc
    let sortableSongs = [...filteredSongs];
    
    if (sortConfig !== null) {
      sortableSongs.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Xử lý các kiểu dữ liệu đặc biệt
        if (sortConfig.key === 'title') {
            // Sắp xếp chuỗi bỏ qua hoa/thường
            aValue = aValue ? aValue.toString().toLowerCase() : '';
            bValue = bValue ? bValue.toString().toLowerCase() : '';
        } else if (sortConfig.key === 'listen_count') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        } else if (sortConfig.key === 'id') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSongs;
  }, [filteredSongs, sortConfig]);

  // 3. Hàm Xử lý Phân trang (Cắt từ mảng đã sắp xếp)
  const currentSongs = useMemo(() => {
    const indexOfLastSong = currentPage * songsPerPage;
    const indexOfFirstSong = indexOfLastSong - songsPerPage;
    return sortedSongs.slice(indexOfFirstSong, indexOfLastSong);
  }, [sortedSongs, currentPage, songsPerPage]);

  const totalPages = Math.ceil(sortedSongs.length / songsPerPage);

  // [NEW] Hàm thay đổi tiêu chí sắp xếp khi click vào tiêu đề cột
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // [NEW] Component hiển thị Icon Sắp xếp
  const SortIcon = ({ columnKey }) => {
      if (sortConfig?.key !== columnKey) return null;
      return sortConfig.direction === 'asc' 
        ? <FiArrowUp className="inline ml-1 text-blue-500" /> 
        : <FiArrowDown className="inline ml-1 text-blue-500" />;
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [sortedSongs, totalPages, currentPage]);

  // --- LOGIC CHỌN CHECKBOX (Giữ nguyên) ---
  const handleSelectOne = (id) => {
    setSelectedSongIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentIds = currentSongs.map(s => s.id);
      const uniqueIds = new Set([...selectedSongIds, ...currentIds]);
      setSelectedSongIds(Array.from(uniqueIds));
    } else {
      const currentIds = currentSongs.map(s => s.id);
      setSelectedSongIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const isAllSelected = currentSongs.length > 0 && currentSongs.every(s => selectedSongIds.includes(s.id));

  // --- LOGIC XÓA (Giữ nguyên) ---
  const deleteSong = (songId) => {
    if (window.confirm("Bạn có chắc muốn xóa bài hát này?")) {
      api.delete(`/api/songs/${songId}`)
        .then(() => {
          fetchSongs();
          setSelectedSongIds(prev => prev.filter(id => id !== songId));
          if (currentSongs.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        })
        .catch(console.error);
    }
  };

  const deleteSelectedSongs = async () => {
    const count = selectedSongIds.length;
    if (count === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xoá ${count} bài hát đã chọn không?`)) {
        try {
            await Promise.all(selectedSongIds.map(id => api.delete(`/api/songs/${id}`)));
            await fetchSongs();
            setSelectedSongIds([]);
            if (currentSongs.length === count && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            alert("Đã xoá thành công!");
        } catch (error) {
            console.error("Lỗi xoá hàng loạt:", error);
            alert("Có lỗi xảy ra khi xoá.");
        }
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === "...") return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>;
      return (
        <button
          key={page}
          onClick={() => paginate(page)}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentPage === page ? "bg-gray-600 text-white border-gray-600" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* HEADER (Giữ nguyên) */}
      <header className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 transition-all duration-300">
         {selectedSongIds.length > 0 ? (
            <div className="flex items-center w-full justify-between bg-red-50 -mx-6 -my-4 px-6 py-4">
                <div className="flex items-center text-red-700 font-medium">
                    <span className="mr-2 px-2 py-1 bg-red-200 rounded text-xs font-bold">{selectedSongIds.length}</span>
                    đã chọn
                </div>
                <button
                    onClick={deleteSelectedSongs}
                    className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 shadow-sm transition-colors"
                >
                    <FiTrash2 className="mr-2" /> Xoá các mục đã chọn
                </button>
            </div>
         ) : (
            <>
                <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Songs Management</h2>
                <input
                    type="text"
                    placeholder="Tìm theo tên, nghệ sĩ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                </div>
                <button
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                onClick={handleAddSongClick}
                >
                + Add new song
                </button>
            </>
         )}
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              {/* [NEW] Thêm onClick và cursor-pointer để biến các cột thành nút sắp xếp */}
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('id')}
              >
                ID <SortIcon columnKey="id" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('title')}
              >
                Title <SortIcon columnKey="title" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artist
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('country')}
              >
                Country <SortIcon columnKey="country" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('listen_count')}
              >
                Streams <SortIcon columnKey="listen_count" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSongs.map((song) => {
               const isSelected = selectedSongIds.includes(song.id);
               
               return (
                <tr key={song.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectOne(song.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {song.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <img
                        src={getImageUrl(song.image_url)}
                        alt={song.title}
                        className="w-10 h-10 object-cover rounded shadow-sm"
                    />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {song.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayArtistNames(song.artists)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {song.country || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(song.listen_count || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                            <button
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                onClick={() => handleEditSongClick(song)}
                                title="Sửa"
                            >
                                <FiEdit2 size={18} />
                            </button>
                            <button
                                className="text-red-600 hover:text-red-900 flex items-center"
                                onClick={() => deleteSong(song.id)}
                                title="Xóa"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
            {renderPagination()}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminSongPage;