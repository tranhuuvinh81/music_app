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
      SELECT c.*, u.username, u.avatar_url 
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