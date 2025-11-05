// backend/controllers/userController.js
import bcrypt from "bcryptjs";
import db from "../config/db.js";

// Đăng ký tài khoản mới
export const registerUser = async (req, res) => {
  const { username, password, full_name, age, email, phone } = req.body;

  if (!username || !password || !full_name || !email || !phone)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });

  try {
    // Kiểm tra username hoặc email trùng
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email],
      async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0)
          return res
            .status(400)
            .json({ message: "Tên đăng nhập hoặc email đã tồn tại!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (username, password, full_name, age, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
          [username, hashedPassword, full_name, age, email, phone],
          (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
              message: "Đăng ký thành công!",
              userId: results.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách người dùng (ẩn mật khẩu)
export const getAllUsers = (req, res) => {
  db.query(
    "SELECT id, username, full_name, age, email, phone, role, avatar_url FROM users",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Lấy thông tin chi tiết user theo ID (cho profile hoặc admin view)
export const getUserById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, username, full_name, age, email, phone, role, avatar_url FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Không tìm thấy user" });
      res.json(results[0]);
    }
  );
};

// Cập nhật thông tin người dùng
export const updateUser = async (req, res) => {
  const { id } = req.params; // ID của user cần cập nhật
  const loggedInUser = req.user; // User đang đăng nhập (lấy từ token)

  // Lấy thêm "role" từ request body
  const { username, password, full_name, age, email, phone, role } = req.body;

  // Kiểm tra quyền: Hoặc là admin, hoặc là user tự cập nhật thông tin của chính mình
  if (loggedInUser.role !== "admin" && loggedInUser.id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền thực hiện hành động này" });
  }

  try {
    let updateFields = [];
    let values = [];

    // Các trường thông tin cá nhân
    if (username) {
      updateFields.push("username = ?");
      values.push(username);
    }
    if (full_name) {
      updateFields.push("full_name = ?");
      values.push(full_name);
    }
    if (age) {
      updateFields.push("age = ?");
      values.push(age);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (phone) {
      updateFields.push("phone = ?");
      values.push(phone);
    }

    // Cập nhật mật khẩu nếu có
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = ?");
      values.push(hashedPassword);
    }

    // 👇 2. Thêm logic cập nhật role (CHỈ DÀNH CHO ADMIN)
    if (role && loggedInUser.role === "admin") {
      updateFields.push("role = ?");
      values.push(role);
    }

    // Xử lý avatar nếu có upload
    if (req.files && req.files.avatarFile) {
      const avatar_url = `/uploads/avatars/${req.files.avatarFile[0].filename}`;
      updateFields.push("avatar_url = ?");
      values.push(avatar_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật!" });
    }

    values.push(id); // Thêm id vào cuối mảng values cho điều kiện WHERE

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Không tìm thấy user" });

      res.json({ message: "Cập nhật thành công!" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa người dùng
export const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Đã xóa user thành công" });
  });
};

import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecret"; // hoặc lấy từ .env

// Đăng nhập
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res
          .status(401)
          .json({ message: "Sai tên đăng nhập hoặc mật khẩu" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(401)
          .json({ message: "Sai tên đăng nhập hoặc mật khẩu" });

      // Sinh token kèm theo vai trò
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role || "user", // mặc định user
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Đăng nhập thành công!",
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      });
    }
  );
};

// Thêm lịch sử nghe nhạc
export const addListenHistory = (req, res) => {
  const { song_id } = req.body;
  const user_id = req.user.id;

  if (!song_id) {
    return res.status(400).json({ message: "Thiếu song_id" });
  }

  const sql = "INSERT INTO user_history (user_id, song_id) VALUES (?, ?)";
  db.query(sql, [user_id, song_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Đã thêm vào lịch sử nghe" });
  });
};

export const getListenHistory = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT
      s.id, s.title, s.album, s.genre, s.release_year, s.file_url, s.image_url, s.lyrics_url, s.created_at, s.listen_count,
      uh.last_listened,
      JSON_ARRAYAGG(
        JSON_OBJECT('id', a.id, 'name', a.name)
      ) AS artists
    FROM (
      SELECT song_id, MAX(listened_at) as last_listened
      FROM user_history
      WHERE user_id = ?
      GROUP BY song_id
      ORDER BY last_listened DESC
      LIMIT 20
    ) uh
    JOIN songs s ON uh.song_id = s.id
    LEFT JOIN song_artists sa ON s.id = sa.song_id
    LEFT JOIN artists a ON sa.artist_id = a.id
    GROUP BY s.id
    ORDER BY uh.last_listened DESC;
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy lịch sử nghe", details: err.message });

    // 👇 SỬA LẠI LOGIC PARSE Ở ĐÂY
    const historyWithParsedArtists = results.map((song) => {
      let parsedArtists = []; // Mặc định là mảng rỗng
      if (song.artists) {
        // Kiểm tra xem có phải là chuỗi không trước khi parse
        if (typeof song.artists === "string") {
          try {
            parsedArtists = JSON.parse(song.artists);
            // Đảm bảo kết quả parse là mảng (phòng trường hợp JSON_OBJECT trả về null nếu không có artist)
            if (!Array.isArray(parsedArtists)) {
              // Nếu kết quả trả về từ JSON_ARRAYAGG là object null duy nhất, vd "[null]"
              if (
                parsedArtists &&
                typeof parsedArtists === "object" &&
                parsedArtists.id === null
              ) {
                parsedArtists = [];
              } else {
                console.warn(
                  `Expected array after parsing artists JSON for song ID ${song.id}, but got:`,
                  parsedArtists
                );
                parsedArtists = []; // fallback to empty array if parse result is unexpected
              }
            }
          } catch (e) {
            console.error(`Lỗi parse JSON artists cho song ID ${song.id}:`, e);
            parsedArtists = []; // Trả về mảng rỗng nếu parse lỗi
          }
        } else if (Array.isArray(song.artists)) {
          // Nếu nó đã là một mảng (driver tự động parse)
          // Kiểm tra xem có phải là mảng chứa object null không (trường hợp bài hát không có nghệ sĩ)
          if (
            song.artists.length === 1 &&
            song.artists[0] &&
            song.artists[0].id === null
          ) {
            parsedArtists = [];
          } else {
            parsedArtists = song.artists;
          }
        }
      }
      return {
        ...song,
        artists: parsedArtists, // Gán kết quả đã xử lý
      };
    });
    res.json(historyWithParsedArtists);
  });
};
