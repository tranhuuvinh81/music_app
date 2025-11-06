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
