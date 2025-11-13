import db from "../config/db.js";

// Lấy tất cả nghệ sĩ (cho Card list)
export const getAllArtists = (req, res) => {
  // Query này sẽ:
  // 1. Lấy tất cả nghệ sĩ.
  // 2. LEFT JOIN với các bài hát của họ (để giữ cả nghệ sĩ 0 bài hát).
  // 3. SUM(listen_count) của các bài hát đó.
  // 4. COALESCE để đổi NULL (nghệ sĩ 0 bài hát) thành 0.
  const query = `
    SELECT 
      a.id, 
      a.name, 
      a.image_url, 
      a.birth_year, 
      a.field, 
      a.description, 
      a.created_at,
      COALESCE(SUM(s.listen_count), 0) AS total_listens
    FROM 
      artists a
    LEFT JOIN 
      song_artists sa ON a.id = sa.artist_id
    LEFT JOIN 
      songs s ON sa.song_id = s.id
    GROUP BY 
      a.id, a.name, a.image_url, a.birth_year, a.field, a.description, a.created_at
    ORDER BY 
      total_listens DESC;
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi khi lấy danh sách nghệ sĩ:", err);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách nghệ sĩ", details: err.message });
    }
    // Kết quả trả về sẽ là mảng artists, mỗi object có thêm 'total_listens'
    res.json(results);
  });
};

// (Admin) Thêm nghệ sĩ mới
export const createArtist = (req, res) => {
  const { name, birth_year, field, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Tên nghệ sĩ là bắt buộc" });
  }

  let image_url = null;
  if (req.files && req.files.artistImage) {
    image_url = `/uploads/artists/${req.files.artistImage[0].filename}`;
  }

  const query =
    "INSERT INTO artists (name, birth_year, field, description, image_url) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [name, birth_year, field, description, image_url],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Lỗi khi thêm nghệ sĩ", details: err.message });
      res
        .status(201)
        .json({ message: "Thêm nghệ sĩ thành công", id: result.insertId });
    }
  );
};

// (Admin) Cập nhật nghệ sĩ
export const updateArtist = (req, res) => {
  const { id } = req.params;
  const { name, birth_year, field, description } = req.body;

  db.query(
    "SELECT image_url FROM artists WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
      if (results.length === 0)
        return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });

      let image_url = results[0].image_url;
      if (req.files && req.files.artistImage) {
        image_url = `/uploads/artists/${req.files.artistImage[0].filename}`;
      }

      const query =
        "UPDATE artists SET name = ?, birth_year = ?, field = ?, description = ?, image_url = ? WHERE id = ?";
      db.query(
        query,
        [name, birth_year, field, description, image_url, id],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "Lỗi khi cập nhật nghệ sĩ" });
          res.json({ message: "Cập nhật thành công" });
        }
      );
    }
  );
};

// (Admin) Xóa nghệ sĩ
export const deleteArtist = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM artists WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi khi xóa nghệ sĩ" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ" });
    res.json({ message: "Xóa nghệ sĩ thành công" });
  });
};
