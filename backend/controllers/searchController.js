// backend/controllers/searchController.js
import db from "../config/db.js";

export const searchAll = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm" });
  }

  const searchTerm = `%${q}%`;

  try {
    // Tạo 2 promises để chạy song song
    const searchSongsPromise = new Promise((resolve, reject) => {
      const query = "SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ?";
      db.query(query, [searchTerm, searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const searchArtistsPromise = new Promise((resolve, reject) => {
      const query = "SELECT * FROM artists WHERE name LIKE ?";
      db.query(query, [searchTerm], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Chờ cả 2 promises hoàn thành
    const [songResults, artistResults] = await Promise.all([
      searchSongsPromise,
      searchArtistsPromise,
    ]);

    // Trả về kết quả dưới dạng một object
    res.json({
      songs: songResults,
      artists: artistResults,
    });

  } catch (err) {
    res.status(500).json({ error: "Lỗi khi thực hiện tìm kiếm", details: err.message });
  }
};