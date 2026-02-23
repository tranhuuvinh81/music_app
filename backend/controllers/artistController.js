// backend/controllers/artistController.js
import db from "../config/db.js";

// [QUAN TRỌNG] Tạo wrapper Promise để dùng được async/await đồng bộ
const promiseDb = db.promise();

// Lấy tất cả nghệ sĩ (cho Card list)
export const getAllArtists = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.name, 
        a.image_url, 
        a.birth_year, 
        a.field, 
        a.description, 
        a.country,
        a.created_at,
        COALESCE(SUM(s.listen_count), 0) AS total_listens
      FROM 
        artists a
      LEFT JOIN 
        song_artists sa ON a.id = sa.artist_id
      LEFT JOIN 
        songs s ON sa.song_id = s.id
      GROUP BY 
        a.id, a.name, a.image_url, a.birth_year, a.field, a.description, a.country, a.created_at
      ORDER BY 
        total_listens DESC;
    `;
    
    // [FIX] Dùng promiseDb
    const [results] = await promiseDb.query(query);
    res.json(results);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách nghệ sĩ:", err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách nghệ sĩ", details: err.message });
  }
};

// Lấy chi tiết nghệ sĩ
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promiseDb.query("SELECT * FROM artists WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Artist not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (Admin) Thêm nghệ sĩ mới
export const createArtist = async (req, res) => {
  const { name, birth_year, field, description, country } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Tên nghệ sĩ là bắt buộc" });
  }

  // [FIX] Lấy URL từ Cloudinary
  // Vì dùng upload.single('artistImage') nên file nằm trong req.file
  const image_url = req.file ? req.file.path : null;

  try {
    const query = "INSERT INTO artists (name, birth_year, field, description, country, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    const [result] = await promiseDb.query(query, [name, birth_year, field, description, country, image_url]);
    
    res.status(201).json({ message: "Thêm nghệ sĩ thành công", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi thêm nghệ sĩ", details: err.message });
  }
};

// (Admin) Cập nhật nghệ sĩ
export const updateArtist = async (req, res) => {
  const { id } = req.params;
  const { name, birth_year, field, description, country } = req.body;

  try {
    // 1. Lấy thông tin cũ để giữ lại ảnh nếu không upload mới
    const [existing] = await promiseDb.query("SELECT image_url FROM artists WHERE id = ?", [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });
    }

    // 2. Logic lấy link ảnh: Ưu tiên file mới, nếu không có thì dùng file cũ
    const image_url = req.file ? req.file.path : existing[0].image_url;

    // 3. Update
    const query = "UPDATE artists SET name = ?, birth_year = ?, field = ?, description = ?, country = ?, image_url = ? WHERE id = ?";
    
    await promiseDb.query(query, [name, birth_year, field, description, country, image_url, id]);
    
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật nghệ sĩ", details: err.message });
  }
};

// (Admin) Xóa nghệ sĩ
export const deleteArtist = async (req, res) => {
  const { id } = req.params;
  try {
    // Xóa liên kết trong bảng trung gian trước (nếu DB chưa set Cascade)
    await promiseDb.query("DELETE FROM song_artists WHERE artist_id = ?", [id]);

    const [result] = await promiseDb.query("DELETE FROM artists WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });
    }
    
    res.json({ message: "Xóa nghệ sĩ thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa nghệ sĩ", details: err.message });
  }
};