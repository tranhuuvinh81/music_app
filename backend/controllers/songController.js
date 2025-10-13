// backend/controllers/songController.js (updated - add image_url handling)
import db from "../config/db.js";

// 🔹 Lấy tất cả bài hát
export const getAllSongs = (req, res) => {
  const query = "SELECT * FROM songs ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi khi truy vấn bài hát" });
    res.json(results);
  });
};

// 🔹 Lấy bài hát theo ID
export const getSongById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM songs WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi khi truy vấn bài hát" });
    if (results.length === 0)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });
    res.json(results[0]);
  });
};

export const addSong = (req, res) => {
  const { title, artist, album, genre, release_year } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ error: "Thiếu tiêu đề hoặc nghệ sĩ" });
  }
  if (!req.files || !req.files.songFile) {
    return res.status(400).json({ error: "Vui lòng upload file nhạc" });
  }

  const file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
  let image_url = null;
  if (req.files.imageFile) {
    image_url = `/uploads/images/${req.files.imageFile[0].filename}`;
  }

  const query = `INSERT INTO songs (title, artist, album, genre, release_year, file_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [title, artist, album, genre, release_year, file_url, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi khi thêm bài hát", details: err.message });
    res.status(201).json({ message: "Thêm bài hát thành công", id: result.insertId });
  });
};

export const updateSong = (req, res) => {
  const { id } = req.params;
  const { title, artist, album, genre, release_year } = req.body;
  let file_url;
  let image_url;

  // Lấy file_url và image_url cũ
  db.query("SELECT file_url, image_url FROM songs WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy bài hát" });

    file_url = results[0].file_url;
    image_url = results[0].image_url;

    // Nếu có file mới được upload thì cập nhật
    if (req.files) {
      if (req.files.songFile) {
        file_url = `/uploads/songs/${req.files.songFile[0].filename}`;
      }
      if (req.files.imageFile) {
        image_url = `/uploads/images/${req.files.imageFile[0].filename}`;
      }
    }

    const query = `UPDATE songs SET title=?, artist=?, album=?, genre=?, release_year=?, file_url=?, image_url=? WHERE id=?`;
    db.query(query, [title, artist, album, genre, release_year, file_url, image_url, id], (err, result) => {
      if (err) return res.status(500).json({ error: "Lỗi khi cập nhật bài hát" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy bài hát" });
      res.json({ message: "Cập nhật thành công" });
    });
  });
};
// 🔹 Xóa bài hát (chỉ admin)
export const deleteSong = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM songs WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xóa bài hát" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy bài hát" });
    res.json({ message: "Xóa bài hát thành công" });
  });
};


// 🔹 Tìm kiếm bài hát
export const searchSongs = (req, res) => {
  const { q } = req.query; // Lấy từ khóa tìm kiếm từ query param ?q=...

  if (!q) {
    return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm" });
  }

  const searchTerm = `%${q}%`;
  const query = "SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ?";
  
  db.query(query, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi khi tìm kiếm bài hát" });
    res.json(results);
  });
};