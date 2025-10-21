// // controllers/playlistController.js
import connection from "../config/db.js";

// Tạo playlist mới (sử dụng req.user.id)
export const createPlaylist = (req, res) => {
  const { name, description } = req.body;
  const user_id = req.user.id; // Lấy từ token, không từ body

  if (!name) {
    return res.status(400).json({ message: "Thiếu thông tin name" });
  }

  const sql = "INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)";
  connection.query(sql, [user_id, name, description || null], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi khi tạo playlist", error: err });
    res.status(201).json({ message: "Tạo playlist thành công", playlist_id: result.insertId });
  });
};

// Lấy tất cả playlist của 1 user (kiểm tra quyền)
export const getPlaylistsByUser = (req, res) => {
  const user_id = req.params.user_id;

  // Chỉ cho phép user xem playlist của chính mình hoặc admin
  if (req.user.id.toString() !== user_id && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền xem playlist này" });
  }

  const sql = "SELECT * FROM playlists WHERE user_id = ?";
  connection.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi khi lấy playlist", error: err });
    res.json(results);
  });
};

// Thêm bài hát vào playlist (kiểm tra duplicate và quyền sở hữu)
export const addSongToPlaylist = (req, res) => {
  const { playlist_id, song_id } = req.body;

  if (!playlist_id || !song_id) {
    return res.status(400).json({ message: "Thiếu thông tin playlist_id hoặc song_id" });
  }

  // Kiểm tra playlist có thuộc user không
  connection.query("SELECT user_id FROM playlists WHERE id = ?", [playlist_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra playlist", error: err });
    if (results.length === 0 || results[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Bạn không sở hữu playlist này" });
    }

    // Kiểm tra duplicate
    const checkSql = "SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?";
    connection.query(checkSql, [playlist_id, song_id], (err, checkResults) => {
      if (err) return res.status(500).json({ message: "Lỗi kiểm tra duplicate", error: err });
      if (checkResults.length > 0) {
        return res.status(400).json({ message: "Bài hát đã tồn tại trong playlist" });
      }

      const sql = "INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)";
      connection.query(sql, [playlist_id, song_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi khi thêm bài hát vào playlist", error: err });
        res.status(201).json({ message: "Đã thêm bài hát vào playlist" });
      });
    });
  });
};

// Lấy danh sách bài hát trong 1 playlist (kiểm tra quyền)
export const getSongsInPlaylist = (req, res) => {
  const playlist_id = req.params.playlist_id;

  // Kiểm tra quyền sở hữu
  connection.query("SELECT user_id FROM playlists WHERE id = ?", [playlist_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra playlist", error: err });
    if (results.length === 0 || results[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Bạn không sở hữu playlist này" });
    }

    const sql = `
      SELECT s.*
      FROM songs s
      JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ?
    `;

    connection.query(sql, [playlist_id], (err, results) => {
      if (err) return res.status(500).json({ message: "Lỗi khi lấy danh sách bài hát", error: err });
      res.json(results);
    });
  });
};

// ... other functions remain the same ...
// 🟢 Xóa bài hát khỏi playlist (mới thêm)
export const removeSongFromPlaylist = (req, res) => {
  const { playlist_id, song_id } = req.body;

  if (!playlist_id || !song_id) {
    return res.status(400).json({ message: "Thiếu thông tin playlist_id hoặc song_id" });
  }

  // Kiểm tra quyền sở hữu
  connection.query("SELECT user_id FROM playlists WHERE id = ?", [playlist_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra playlist", error: err });
    if (results.length === 0 || results[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Bạn không sở hữu playlist này" });
    }

    const sql = "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?";
    connection.query(sql, [playlist_id, song_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi khi xóa bài hát khỏi playlist", error: err });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bài hát trong playlist" });
      }
      res.json({ message: "Đã xóa bài hát khỏi playlist" });
    });
  });
};

// Xóa playlist (kiểm tra quyền)
export const deletePlaylist = (req, res) => {
  const { playlist_id } = req.params;

  // Kiểm tra quyền sở hữu
  connection.query("SELECT user_id FROM playlists WHERE id = ?", [playlist_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra playlist", error: err });
    if (results.length === 0 || results[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Bạn không sở hữu playlist này" });
    }

    const sql = "DELETE FROM playlists WHERE id = ?";
    connection.query(sql, [playlist_id], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi khi xóa playlist", error: err });
      res.json({ message: "Đã xóa playlist" });
    });
  });
};

// Cập nhật playlist
export const updatePlaylist = (req, res) => {
  const { playlist_id } = req.params;
  const { name, description } = req.body;
  const user_id = req.user.id;

  // 1. Kiểm tra quyền sở hữu
  connection.query(
    "SELECT user_id FROM playlists WHERE id = ?",
    [playlist_id],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Lỗi kiểm tra playlist", error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "Không tìm thấy playlist" });
      if (results[0].user_id !== user_id)
        return res.status(403).json({ message: "Bạn không sở hữu playlist này" });

      // 2. Chuẩn bị câu lệnh UPDATE
      let updateFields = [];
      let values = [];

      if (name) {
        updateFields.push("name = ?");
        values.push(name);
      }
      
      // Cho phép cập nhật description thành rỗng
      if (description !== undefined) {
          updateFields.push("description = ?");
          values.push(description || null);
      }

      // 3. Xử lý file thumbnail nếu có
      if (req.files && req.files.thumbnailFile) {
        // Giả sử bạn lưu thumbnail trong /uploads/thumbnails/
        const thumbnail_url = `/uploads/thumbnails/${req.files.thumbnailFile[0].filename}`;
        updateFields.push("thumbnail_url = ?");
        values.push(thumbnail_url);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ message: "Không có dữ liệu để cập nhật!" });
      }

      // 4. Thực thi query
      values.push(playlist_id); // Thêm playlist_id vào cuối cho điều kiện WHERE
      const sql = `UPDATE playlists SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      connection.query(sql, values, (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Lỗi khi cập nhật playlist", error: err });
        res.json({ message: "Cập nhật playlist thành công!" });
      });
    }
  );
};