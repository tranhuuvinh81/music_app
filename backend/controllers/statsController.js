// backend/controllers/statsController.js
import db from "../config/db.js";

export const getDailyListenStats = (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(DATE(listened_at), '%d/%m') AS date, 
        COUNT(*) AS count
      FROM 
        user_history
      WHERE 
        listened_at IS NOT NULL 
        AND listened_at >= (CURDATE() - INTERVAL 6 DAY)
        AND listened_at < (CURDATE() + INTERVAL 1 DAY) 
      GROUP BY 
        date  -- 1. Nhóm theo alias (chuỗi '%d/%m')
      ORDER BY 
        MIN(DATE(listened_at)) ASC; -- 2. Sắp xếp theo ngày thực tế (dùng MIN)
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Lỗi SQL khi lấy thống kê lượt nghe:", err);
        return res
          .status(500)
          .json({
            error: "Lỗi máy chủ khi truy vấn thống kê",
            details: err.message,
          });
      }

      res.json(results);
    });
  } catch (error) {
    console.error("Lỗi không xác định trong statsController:", error);
    res
      .status(500)
      .json({ error: "Lỗi máy chủ không xác định", details: error.message });
  }
};
// --- Lấy Top Nghệ Sĩ ---
export const getTopArtistStats = (req, res) => {
  try {
    // 1. JOIN 3 bảng: artists, song_artists, songs
    // 2. SUM(s.listen_count) để tính tổng lượt nghe
    // 3. GROUP BY artist.id
    // 4. ORDER BY tổng lượt nghe và LIMIT 5
    const query = `
      SELECT 
        a.name, 
        SUM(s.listen_count) AS total_listens
      FROM 
        artists a
      JOIN 
        song_artists sa ON a.id = sa.artist_id
      JOIN 
        songs s ON sa.song_id = s.id
      GROUP BY 
        a.id, a.name -- Nhóm theo cả id và tên
      ORDER BY 
        total_listens DESC
      LIMIT 10; -- Lấy top 5
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Lỗi SQL khi lấy thống kê nghệ sĩ:", err);
        return res.status(500).json({ error: "Lỗi máy chủ khi truy vấn thống kê", details: err.message });
      }
      // Trả về kết quả, vd: [{ name: 'Sơn Tùng M-TP', total_listens: 150000 }, ...]
      res.json(results);
    });

  } catch (error) {
    console.error("Lỗi không xác định trong statsController (Top Artists):", error);
    res.status(500).json({ error: "Lỗi máy chủ không xác định", details: error.message });
  }
};

// Lấy danh sách Album nổi bật (Top listened) và Album mới
export const getAlbumStats = (req, res) => {
  // Query 1: Top 5 Album có tổng lượt nghe cao nhất
  // Logic: Gom nhóm theo tên album, tính tổng listen_count, lấy ảnh của bài hát đầu tiên trong album làm ảnh bìa
  const topAlbumsQuery = `
    SELECT 
      album as name, 
      SUM(listen_count) as total_listens,
      COUNT(id) as song_count,
      (SELECT image_url FROM songs s2 WHERE s2.album = s1.album AND s2.image_url IS NOT NULL LIMIT 1) as cover_image
    FROM songs s1
    WHERE album IS NOT NULL AND album != ''
    GROUP BY album
    ORDER BY total_listens DESC
    LIMIT 5
  `;

  // Query 2: Lấy tất cả album (để hiển thị danh sách bên dưới, sắp xếp theo tên hoặc ngày thêm mới nhất)
  const allAlbumsQuery = `
     SELECT 
      album as name, 
      SUM(listen_count) as total_listens,
      COUNT(id) as song_count,
      (SELECT image_url FROM songs s2 WHERE s2.album = s1.album AND s2.image_url IS NOT NULL LIMIT 1) as cover_image,
      MAX(created_at) as last_updated
    FROM songs s1
    WHERE album IS NOT NULL AND album != ''
    GROUP BY album
    ORDER BY last_updated DESC
    LIMIT 20
  `;

  db.query(topAlbumsQuery, (err, topAlbums) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(allAlbumsQuery, (err, recentAlbums) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        top_albums: topAlbums,
        recent_albums: recentAlbums
      });
    });
  });
};