// frontend/src/pages/admin/AdminGenrePage.js
import React, { useState, useMemo, useEffect } from "react";
import api from "../../api/api";

// Component con: Modal hiển thị danh sách bài hát trong 1 thể loại
const SongsInGenreModal = ({ genre, songs, onClose }) => {
  if (!genre) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            Chi tiết thể loại: <span className="text-blue-600">{genre}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 font-bold text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <p className="mb-4 text-sm text-gray-500">
            Danh sách dưới đây bao gồm các bài hát có chứa thẻ{" "}
            <strong>"{genre}"</strong> (độc lập hoặc kết hợp).
          </p>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên bài hát
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nghệ sĩ
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tags gốc
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {song.title}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {Array.isArray(song.artists)
                      ? song.artists.map((a) => a.name).join(", ")
                      : song.artist || "Unknown"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 italic">
                    {song.genre}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

function AdminGenrePage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // State phân trang & tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal
  const [selectedGenreData, setSelectedGenreData] = useState(null);

  // Fetch dữ liệu
  const fetchSongs = () => {
    setLoading(true);
    api
      .get("/api/songs")
      .then((res) => {
        setSongs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Logic tách chuỗi và gom nhóm
  const genreList = useMemo(() => {
    const groups = {};

    songs.forEach((song) => {
      if (!song.genre) return; // Bỏ qua nếu không có genre

      // Tách chuỗi bằng dấu phẩy và xóa khoảng trắng thừa
      // Ví dụ: "Pop, Ballad " -> ["Pop", "Ballad"]
      const individualGenres = song.genre.split(",").map((g) => g.trim());

      individualGenres.forEach((gName) => {
        if (!gName) return; // Bỏ qua chuỗi rỗng

        // Chuẩn hóa key để group (ví dụ chữ hoa/thường)
        // Nhưng hiển thị thì nên giữ nguyên định dạng đẹp nhất tìm thấy
        if (!groups[gName]) {
          groups[gName] = { name: gName, count: 0, songs: [] };
        }

        groups[gName].count += 1;
        groups[gName].songs.push(song);
      });
    });

    // Chuyển object thành array và sắp xếp A-Z
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  // Filter
  const filteredGenres = useMemo(() => {
    if (!searchQuery) return genreList;
    const lowerQuery = searchQuery.toLowerCase();
    return genreList.filter((g) => g.name.toLowerCase().includes(lowerQuery));
  }, [genreList, searchQuery]);

  // Pagination
  const currentGenres = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return filteredGenres.slice(indexOfFirst, indexOfLast);
  }, [filteredGenres, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  // --- ACTIONS ---

  // Lưu ý: Chức năng Đổi tên (Rename) với dữ liệu dạng chuỗi "A,B,C" sẽ phức tạp hơn.
  // Nếu bạn đổi tên "Pop" thành "K-Pop", bạn cần tìm tất cả bài hát có chứa chữ "Pop"
  // và dùng hàm REPLACE của SQL để thay thế riêng chữ đó.
  // Code dưới đây chỉ cảnh báo, chưa thực hiện logic phức tạp đó để tránh lỗi dữ liệu.
  const handleRenameGenre = async (oldName) => {
    alert(
      `Chức năng đổi tên cho thể loại gộp (VD: "${oldName}") cần xử lý chuỗi phức tạp ở Backend. Tạm thời tính năng này bị vô hiệu hóa để đảm bảo an toàn dữ liệu.`
    );

    // Logic gợi ý nếu bạn muốn phát triển Backend sau này:
    // UPDATE songs SET genre = REPLACE(genre, 'oldName', 'newName') WHERE genre LIKE '%oldName%'
  };

  const handleViewSongs = (genreData) => {
    setSelectedGenreData(genreData);
  };

  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden">
      <header className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Genres Management
          </h2>
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </header>

      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                STT
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tên Thể loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Số lượng bài hát
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentGenres.length > 0 ? (
              currentGenres.map((g, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 group-hover:bg-blue-100 transition">
                      {g.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {g.count} bài
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewSongs(g)}
                      className="text-blue-600 hover:text-blue-900 mr-4 font-semibold hover:underline"
                    >
                      Xem danh sách
                    </button>
                    {/* Nút đổi tên tạm ẩn vì lý do logic backend */}
                    <button
                      onClick={() => handleRenameGenre(g.name)}
                      className="text-gray-400 cursor-not-allowed"
                      title="Tính năng đang bảo trì"
                    >
                      Đổi tên
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  Không tìm thấy thể loại nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center space-x-2 bg-gray-50">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600 px-4 font-medium">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Sau
          </button>
        </div>
      )}

      {selectedGenreData && (
        <SongsInGenreModal
          genre={selectedGenreData.name}
          songs={selectedGenreData.songs}
          onClose={() => setSelectedGenreData(null)}
        />
      )}
    </section>
  );
}

export default AdminGenrePage;
