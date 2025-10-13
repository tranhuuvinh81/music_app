// import bcrypt from "bcryptjs";
// import db from "../config/db.js";

// // Đăng ký
// export const registerUser = async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password)
//     return res.status(400).json({ message: "Thiếu username hoặc password" });

//   try {
//     // Kiểm tra username tồn tại
//     db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (result.length > 0) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

//       // Mã hóa mật khẩu
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Lưu vào database
//       db.query(
//         "INSERT INTO users (username, password) VALUES (?, ?)",
//         [username, hashedPassword],
//         (err, results) => {
//           if (err) return res.status(500).json({ error: err.message });
//           res.status(201).json({ message: "Đăng ký thành công!", userId: results.insertId });
//         }
//       );
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Lấy danh sách user (ẩn mật khẩu)
// export const getAllUsers = (req, res) => {
//   db.query("SELECT id, username FROM users", (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
//   });
// };

// // 🆕 Cập nhật user
// export const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { username, password } = req.body;

//   if (!username && !password)
//     return res.status(400).json({ message: "Cần cung cấp username hoặc password để cập nhật" });

//   try {
//     let updateFields = [];
//     let values = [];

//     if (username) {
//       updateFields.push("username = ?");
//       values.push(username);
//     }
//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       updateFields.push("password = ?");
//       values.push(hashedPassword);
//     }

//     values.push(id);

//     const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
//     db.query(sql, values, (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy user" });

//       res.json({ message: "Cập nhật thành công" });
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // 🆕 Xóa user
// export const deleteUser = (req, res) => {
//   const { id } = req.params;
//   db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy user" });
//     res.json({ message: "Đã xóa user thành công" });
//   });
// };
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
          return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại!" });

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
    "SELECT id, username, full_name, age, email, phone, role FROM users",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Cập nhật thông tin người dùng
export const updateUser = async (req, res) => {
  const { id } = req.params; // ID của user cần cập nhật
  const loggedInUser = req.user; // User đang đăng nhập (lấy từ token)

  // 👇 1. Lấy thêm "role" từ request body
  const { username, password, full_name, age, email, phone, role } = req.body;
  
  // Kiểm tra quyền: Hoặc là admin, hoặc là user tự cập nhật thông tin của chính mình
  if (loggedInUser.role !== 'admin' && loggedInUser.id.toString() !== id) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này" });
  }

  try {
    let updateFields = [];
    let values = [];

    // Các trường thông tin cá nhân
    if (username) { updateFields.push("username = ?"); values.push(username); }
    if (full_name) { updateFields.push("full_name = ?"); values.push(full_name); }
    if (age) { updateFields.push("age = ?"); values.push(age); }
    if (email) { updateFields.push("email = ?"); values.push(email); }
    if (phone) { updateFields.push("phone = ?"); values.push(phone); }

    // Cập nhật mật khẩu nếu có
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = ?");
      values.push(hashedPassword);
    }
    
    // 👇 2. Thêm logic cập nhật role (CHỈ DÀNH CHO ADMIN)
    if (role && loggedInUser.role === 'admin') {
        updateFields.push("role = ?");
        values.push(role);
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
    return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });

    // ✅ Sinh token kèm theo vai trò
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
  });
};
