// frontend/src/pages/admin/AdminArtistPage.js
import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/api";
import { FiTrash2, FiEdit2, FiArrowUp, FiArrowDown } from "react-icons/fi";

function AdminArtistPage() {
  const { artists, handleAddArtistClick, handleEditArtistClick, fetchArtists } = useOutletContext();
  
  const [artistCurrentPage, setArtistCurrentPage] = useState(1);
  const [artistsPerPage] = useState(5);
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const [selectedArtistIds, setSelectedArtistIds] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // 1. Lọc (Search)
  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    if (!artistSearchQuery) return artists;
    const lowercasedQuery = artistSearchQuery.toLowerCase();
    return artists.filter((artist) =>
      artist.name?.toLowerCase().includes(lowercasedQuery)
    );
  }, [artists, artistSearchQuery]);

  // 2. Sắp xếp (Sort)
  const sortedArtists = useMemo(() => {
    let sortableArtists = [...filteredArtists];
    
    if (sortConfig !== null) {
      sortableArtists.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Xử lý các kiểu dữ liệu đặc biệt
        if (sortConfig.key === 'name' || sortConfig.key === 'country') {
            aValue = aValue ? aValue.toString().toLowerCase() : '';
            bValue = bValue ? bValue.toString().toLowerCase() : '';
        } else if (sortConfig.key === 'total_listens' || sortConfig.key === 'id') {
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
    return sortableArtists;
  }, [filteredArtists, sortConfig]);

  // 3. Phân trang
  const currentArtists = useMemo(() => {
    const indexOfLastArtist = artistCurrentPage * artistsPerPage;
    const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
    return sortedArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  }, [sortedArtists, artistCurrentPage, artistsPerPage]);

  const artistTotalPages = Math.ceil(sortedArtists.length / artistsPerPage);

  // Hàm thay đổi tiêu chí
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Component Icon
  const SortIcon = ({ columnKey }) => {
      if (sortConfig?.key !== columnKey) return null;
      return sortConfig.direction === 'asc' 
        ? <FiArrowUp className="inline ml-1 text-blue-500" /> 
        : <FiArrowDown className="inline ml-1 text-blue-500" />;
  };

  useEffect(() => {
    if (artistCurrentPage > artistTotalPages && artistTotalPages > 0) {
      setArtistCurrentPage(artistTotalPages);
    } else if (artistTotalPages === 0 && artistCurrentPage !== 1) {
      setArtistCurrentPage(1);
    }
  }, [sortedArtists, artistTotalPages, artistCurrentPage]);

  // --- LOGIC CHỌN CHECKBOX ---
  const handleSelectOne = (id) => {
    setSelectedArtistIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentIds = currentArtists.map(a => a.id);
      const uniqueIds = new Set([...selectedArtistIds, ...currentIds]);
      setSelectedArtistIds(Array.from(uniqueIds));
    } else {
      const currentIds = currentArtists.map(a => a.id);
      setSelectedArtistIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const isAllSelected = currentArtists.length > 0 && currentArtists.every(a => selectedArtistIds.includes(a.id));

  // --- LOGIC XÓA ---
  const deleteArtist = (artistId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá nghệ sĩ này?")) {
      api.delete(`/api/artists/${artistId}`)
        .then(() => {
          fetchArtists();
          setSelectedArtistIds(prev => prev.filter(id => id !== artistId));
        })
        .catch(console.error);
    }
  };

  const deleteSelectedArtists = async () => {
    const count = selectedArtistIds.length;
    if (count === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xoá ${count} nghệ sĩ đã chọn không?`)) {
      try {
        await Promise.all(selectedArtistIds.map(id => api.delete(`/api/artists/${id}`)));
        await fetchArtists(); 
        setSelectedArtistIds([]); 
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

  const paginateArtists = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= artistTotalPages) setArtistCurrentPage(pageNumber);
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
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center transition-all duration-300">
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
            <>
                <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Artist Management</h2>
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
              <th className="px-6 py-3 text-left">
                <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </th>
              {/* Thêm class cursor-pointer và onClick vào các cột muốn sort */}
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('id')}
              >
                ID <SortIcon columnKey="id" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon columnKey="name" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('birth_year')}
              >
                Birth Year <SortIcon columnKey="birth_year" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('country')}
              >
                Country <SortIcon columnKey="country" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 select-none"
                onClick={() => handleSort('total_listens')}
              >
                Streams <SortIcon columnKey="total_listens" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentArtists.map((artist) => {
                const isSelected = selectedArtistIds.includes(artist.id);              
                return (
                <tr key={artist.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
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
                    {artist.country || "N/A"}
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