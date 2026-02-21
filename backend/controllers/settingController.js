//backend/controllers/settingController.js
import db from "../config/db.js";
const promiseDb = db.promise();

export const getSetting = async (req, res) => {
  const { key } = req.params;
  try {
    const [rows] = await promiseDb.query("SELECT setting_value FROM settings WHERE setting_key = ?", [key]);
    if (rows.length > 0) {
        return res.json(rows[0].setting_value);
    }
    res.json(null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body; // value sẽ là mảng [1, 2, 3]
  try {
    // Upsert: Cập nhật nếu đã có, Thêm mới nếu chưa có
    const query = `
      INSERT INTO settings (setting_key, setting_value) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE setting_value = ?
    `;
    const jsonValue = JSON.stringify(value);
    await promiseDb.query(query, [key, jsonValue, jsonValue]);
    res.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};