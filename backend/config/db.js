// // backend/config/db.js
// import dotenv from "dotenv";
// import mysql from "mysql2";

// dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("❌ Lỗi kết nối MySQL:", err);
//   } else {
//     console.log("✅ Đã kết nối MySQL thành công!");
//   }
// });

// export default connection;

//====================================================================

// backend/config/db.js
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Thêm port (Aiven thường dùng port khác 3306)
  ssl: {
    rejectUnauthorized: false // QUAN TRỌNG: Để kết nối Aiven (SSL) mà không cần file chứng chỉ phức tạp
  }
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    // Log thêm để dễ debug nếu lỗi
    console.error("Chi tiết:", err.code, err.sqlMessage);
  } else {
    console.log("✅ Đã kết nối MySQL thành công!");
  }
});

export default connection;