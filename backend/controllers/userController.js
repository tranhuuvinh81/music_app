// backend/controllers/userController.js
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const promiseDb = db.promise();

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
  // 1. JOIN với user_history
  // 2. COUNT(uh.id) để đếm số lượt nghe
  // 3. GROUP BY theo tất cả các cột của user
  const query = `
    SELECT 
      u.id, u.username, u.full_name, u.age, u.email, u.phone, u.role, u.avatar_url,
      COUNT(uh.id) AS total_listens
    FROM 
      users u
    LEFT JOIN 
      user_history uh ON u.id = uh.user_id
    GROUP BY 
      u.id, u.username, u.full_name, u.age, u.email, u.phone, u.role, u.avatar_url
    ORDER BY 
      u.id ASC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Giờ đây 'results' sẽ chứa mảng user, mỗi user có thêm 'total_listens'
    res.json(results);
  });
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

    // Logic cập nhật role (CHỈ DÀNH CHO ADMIN)
    if (role && loggedInUser.role === "admin") {
      updateFields.push("role = ?");
      values.push(role);
    }

    // Xử lý avatar từ Cloudinary
    // [FIX] Vì route dùng uploadCloud.single('avatarFile'), file sẽ nằm trong req.file
    if (req.file) {
      const avatar_url = req.file.path; // Lấy link trực tiếp từ Cloudinary
      updateFields.push("avatar_url = ?");
      values.push(avatar_url);
    }

    // Nếu không có trường nào cần update
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật!" });
    }

    values.push(id); // Thêm id vào cuối mảng values cho điều kiện WHERE

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    // [FIX] Sử dụng await với promiseDb
    const [result] = await promiseDb.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // (Optional) Lấy lại thông tin user mới nhất để trả về cho Frontend cập nhật state ngay lập tức
    const [updatedUser] = await promiseDb.query("SELECT id, username, full_name, email, phone, age, avatar_url, role FROM users WHERE id = ?", [id]);

    res.json({ 
        message: "Cập nhật thành công!", 
        user: updatedUser[0] // Trả về user đã update
    });

  } catch (error) {
    console.error("Lỗi update user:", error);
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


// --- QUÊN MẬT KHẨU (GỬI EMAIL) ---
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

  try {
    // 1. Kiểm tra email có tồn tại không
    const [users] = await promiseDb.query("SELECT id, username FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }
    const user = users[0];

    // 2. Tạo Token ngẫu nhiên (Reset Token)
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Mã hóa token trước khi lưu vào DB (để bảo mật)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set thời hạn token (VD: 15 phút)
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); 

    // 3. Lưu token vào Database
    await promiseDb.query(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?",
      [hashedToken, resetExpires, user.id]
    );

    // 4. Gửi Email chứa link khôi phục
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    // Link này trỏ về Frontend, KHÔNG PHẢI Backend
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,              // Cổng dự phòng
      secure: false,          // false khi dùng cổng 587 (sẽ dùng STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    const mailOptions = {
      from: `"Music App Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Khôi phục mật khẩu - Music App",
      html: `
        <h3>Xin chào ${user.username},</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào đường dẫn bên dưới để thiết lập mật khẩu mới:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          Đặt lại mật khẩu
        </a>
        <p><i>Link này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</i></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư." });

  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
};

// --- ĐẶT LẠI MẬT KHẨU MỚI ---
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  try {
    // 1. Mã hóa lại token từ Params để so sánh với DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Tìm User có token này và token chưa hết hạn
    const [users] = await promiseDb.query(
      "SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()",
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }

    const userId = users[0].id;

    // 3. Hash mật khẩu mới và Cập nhật DB (đồng thời xóa luôn token cũ)
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    
    await promiseDb.query(
      "UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
      [newHashedPassword, userId]
    );

    res.status(200).json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });

  } catch (error) {
    console.error("Lỗi reset mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};