// backend/controllers/commentController.js
import db from "../config/db.js";

// Wrapper Promise (như đã sửa ở songController)
const promiseDb = db.promise();

// 1. Lấy danh sách bình luận của một bài hát
export const getCommentsBySong = async (req, res) => {
  const { songId } = req.params;
  try {
    // Join bảng comments với bảng users để lấy tên và avatar người bình luận
    const query = `
      SELECT c.*, u.username, u.avatar_url, u.full_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.song_id = ?
      ORDER BY c.created_at DESC
    `;
    const [comments] = await promiseDb.query(query, [songId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Thêm bình luận mới
export const addComment = async (req, res) => {
  // user lấy từ middleware verifyToken (req.user)
  const { id: userId } = req.user; 
  const { songId, content, rating } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
  }

  try {
    const query = `
      INSERT INTO comments (user_id, song_id, content, rating, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    // Rating mặc định là 5 nếu không truyền
    const [result] = await promiseDb.query(query, [userId, songId, content, rating || 5]);

    // Trả về comment vừa tạo để frontend hiển thị ngay
    const newCommentId = result.insertId;
    
    // Lấy lại thông tin user để trả về cho frontend hiển thị luôn mà không cần reload
    const [userRows] = await promiseDb.query("SELECT username, avatar_url FROM users WHERE id = ?", [userId]);
    const user = userRows[0];

    res.status(201).json({
      id: newCommentId,
      user_id: userId,
      song_id: songId,
      content,
      rating: rating || 5,
      created_at: new Date(),
      username: user.username,
      avatar_url: user.avatar_url
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Xóa bình luận
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Lấy ID người đang đăng nhập

  try {
    // Kiểm tra xem comment có tồn tại và có phải của user này không
    const [existing] = await promiseDb.query("SELECT user_id FROM comments WHERE id = ?", [id]);
    
    if (existing.length === 0) return res.status(404).json({ message: "Bình luận không tồn tại" });
    
    if (existing[0].user_id !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    await promiseDb.query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ message: "Đã xóa bình luận" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Sửa bình luận
export const updateComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { content, rating } = req.body;

  try {
    // Kiểm tra quyền sở hữu
    const [existing] = await promiseDb.query("SELECT user_id FROM comments WHERE id = ?", [id]);
    
    if (existing.length === 0) return res.status(404).json({ message: "Bình luận không tồn tại" });
    
    if (existing[0].user_id !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });
    }

    // Update
    await promiseDb.query(
      "UPDATE comments SET content = ?, rating = ?, created_at = NOW() WHERE id = ?", 
      [content, rating, id]
    );

    // Trả về dữ liệu mới
    res.json({ id, content, rating, updated: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};