// frontend/src/pages/admin/AdminArtistPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiTrash2, FiEdit2 } from "react-icons/fi"; // [NEW] Thêm icon cho đẹp

function AdminArtistPage() {
  const { artists, handleAddArtistClick, handleEditArtistClick, fetchArtists } =
    useOutletContext();
  
  // --- STATE CŨ ---
  const [artistCurrentPage, setArtistCurrentPage] = useState(1);
  const [artistsPerPage] = useState(5);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");

  // --- [NEW] STATE CHO CHỌN NHIỀU ---
  const [selectedArtistIds, setSelectedArtistIds] = useState([]);

  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    if (!artistSearchQuery) return artists;
    const lowercasedQuery = artistSearchQuery.toLowerCase();
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(lowercasedQuery)
    );
  }, [artists, artistSearchQuery]);

  const currentArtists = useMemo(() => {
    const indexOfLastArtist = artistCurrentPage * artistsPerPage;
    const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
    return filteredArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  }, [filteredArtists, artistCurrentPage, artistsPerPage]);

  const artistTotalPages = Math.ceil(filteredArtists.length / artistsPerPage);

  useEffect(() => {
    if (artistCurrentPage > artistTotalPages && artistTotalPages > 0) {
      setArtistCurrentPage(artistTotalPages);
    } else if (artistTotalPages === 0 && artistCurrentPage !== 1) {
      setArtistCurrentPage(1);
    }
  }, [filteredArtists, artistTotalPages, artistCurrentPage]);

  // --- [NEW] LOGIC CHỌN CHECKBOX ---
  
  // 1. Chọn/Bỏ chọn một dòng
  const handleSelectOne = (id) => {
    setSelectedArtistIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 2. Chọn/Bỏ chọn tất cả (trên trang hiện tại)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Lấy tất cả ID của trang hiện tại
      const currentIds = currentArtists.map(a => a.id);
      // Gộp vào danh sách đã chọn (dùng Set để tránh trùng lặp)
      const uniqueIds = new Set([...selectedArtistIds, ...currentIds]);
      setSelectedArtistIds(Array.from(uniqueIds));
    } else {
      // Bỏ chọn những ID đang nằm ở trang hiện tại
      const currentIds = currentArtists.map(a => a.id);
      setSelectedArtistIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  // Kiểm tra xem trang hiện tại đã được chọn hết chưa
  const isAllSelected = currentArtists.length > 0 && currentArtists.every(a => selectedArtistIds.includes(a.id));

  // --- LOGIC XÓA ---

  // Xóa 1 người (Logic cũ, giữ nguyên)
  const deleteArtist = (artistId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá nghệ sĩ này?")) {
      api.delete(`/api/artists/${artistId}`)
        .then(() => {
          fetchArtists();
          // Nếu xóa xong dòng được chọn thì bỏ chọn nó
          setSelectedArtistIds(prev => prev.filter(id => id !== artistId));
        })
        .catch(console.error);
    }
  };

  // [NEW] Xóa nhiều người
  const deleteSelectedArtists = async () => {
    const count = selectedArtistIds.length;
    if (count === 0) return;

    if (window.confirm(`Bạn có chắc chắn muốn xoá ${count} nghệ sĩ đã chọn không? Hành động này không thể hoàn tác.`)) {
      try {
        // Gọi API xóa song song bằng Promise.all
        // Lưu ý: Đây là cách xử lý ở Frontend nếu Backend chưa có API bulk delete
        await Promise.all(
          selectedArtistIds.map(id => api.delete(`/api/artists/${id}`))
        );

        // Sau khi xóa xong
        await fetchArtists(); // Tải lại danh sách
        setSelectedArtistIds([]); // Reset danh sách chọn
        
        // Logic lùi trang nếu trang hiện tại bị xóa sạch
        if (currentArtists.length === count && artistCurrentPage > 1) {
             setArtistCurrentPage(artistCurrentPage - 1);
        }

        alert("Đã xoá thành công!");
      } catch (error) {
        console.error("Lỗi khi xoá hàng loạt:", error);
        alert("Có lỗi xảy ra khi xoá một số mục.");
      }
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  // --- LOGIC PHÂN TRANG (GIỮ NGUYÊN) ---
  const paginateArtists = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= artistTotalPages) {
      setArtistCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    const pages = [];
    if (artistTotalPages <= 7) {
      for (let i = 1; i <= artistTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let startPage = Math.max(2, artistCurrentPage - 1);
      let endPage = Math.min(artistTotalPages - 1, artistCurrentPage + 1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < artistTotalPages - 1) pages.push("...");
      pages.push(artistTotalPages);
    }

    return pages.map((page, index) => {
      if (page === "...") return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>;
      return (
        <button
          key={page}
          onClick={() => paginateArtists(page)}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            artistCurrentPage === page ? "bg-gray-600 text-white border-gray-600" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* HEADER: HIỂN THỊ CÔNG CỤ TÌM KIẾM HOẶC NÚT XÓA NHIỀU */}
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center transition-all duration-300">
        
        {/* [NEW] Nếu có item được chọn, đổi Header thành chế độ Hành động */}
        {selectedArtistIds.length > 0 ? (
            <div className="flex items-center w-full justify-between bg-red-50 -mx-6 -my-4 px-6 py-4">
                <div className="flex items-center text-red-700 font-medium">
                    <span className="mr-2 px-2 py-1 bg-red-200 rounded text-xs font-bold">{selectedArtistIds.length}</span>
                    đã chọn
                </div>
                <button
                    onClick={deleteSelectedArtists}
                    className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 shadow-sm transition-colors"
                >
                    <FiTrash2 className="mr-2" /> Xoá các mục đã chọn
                </button>
            </div>
        ) : (
            // Header bình thường
            <>
                <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Artist Management
                </h2>
                <input
                    type="text"
                    placeholder="Tìm theo tên nghệ sĩ..."
                    value={artistSearchQuery}
                    onChange={(e) => setArtistSearchQuery(e.target.value)}
                    className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                </div>
                <button
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                onClick={handleAddArtistClick}
                >
                + Add new artist
                </button>
            </>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* [NEW] CHECKBOX SELECT ALL */}
              <th className="px-6 py-3 text-left">
                <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Birth Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Streams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentArtists.map((artist) => {
                // Kiểm tra xem dòng này có đang được chọn không
                const isSelected = selectedArtistIds.includes(artist.id);
                
                return (
                <tr key={artist.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    {/* [NEW] CHECKBOX SELECT ROW */}
                    <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectOne(artist.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {artist.id}
                    </td>
                    <td className="px-6 py-4">
                    <img
                        src={getImageUrl(artist.image_url)}
                        alt={artist.name}
                        className="w-10 h-10 object-cover rounded-full shadow-sm"
                    />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {artist.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {artist.birth_year || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(artist.total_listens || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                            <button
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                onClick={() => handleEditArtistClick(artist)}
                                title="Sửa"
                            >
                                <FiEdit2 size={18} />
                            </button>
                            <button
                                className="text-red-600 hover:text-red-900 flex items-center"
                                onClick={() => deleteArtist(artist.id)}
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
      
      {artistTotalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2">
          <button
            onClick={() => paginateArtists(artistCurrentPage - 1)}
            disabled={artistCurrentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          
          {renderPagination()}

          <button
            onClick={() => paginateArtists(artistCurrentPage + 1)}
            disabled={artistCurrentPage === artistTotalPages}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

export default AdminArtistPage;