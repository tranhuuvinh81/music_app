// // backend/server.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connection from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import songRoutes from "./routes/songRoutes.js";
// import playlistRoutes from "./routes/playlistRoutes.js";
// import artistRoutes from "./routes/artistRoutes.js";
// import searchRoutes from "./routes/searchRoutes.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import statsRoutes from "./routes/statsRoutes.js";
// import chatbotRoutes from "./routes/chatbotRoutes.js";
// import commentRoutes from "./routes/commentRoutes.js";

// // Cần thiết cho __dirname trong ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Phục vụ file tĩnh từ thư mục uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/users", userRoutes);
// app.use("/api/songs", songRoutes);
// app.use("/api/playlists", playlistRoutes);
// app.use("/api/artists", artistRoutes);
// app.use('/api/search', searchRoutes);
// app.use("/api/stats", statsRoutes);
// app.use("/api/chatbot", chatbotRoutes);
// app.use("/api/comments", commentRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("Music App Backend đang hoạt động!");
// });

// // Khởi động server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server đang chạy tại http://localhost:${PORT}`);
// });

//====================================================================

// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import statsRoutes from "./routes/statsRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Cần thiết cho __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware CORS
// Tạm thời cho phép tất cả các nguồn (origin) để dễ deploy lần đầu
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// [QUAN TRỌNG] Tăng giới hạn kích thước Body để upload file lớn
// Mặc định Express chỉ cho 100kb, không đủ cho file nhạc/ảnh
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Phục vụ file tĩnh từ thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/artists", artistRoutes);
app.use('/api/search', searchRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/comments", commentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Music App Backend đang hoạt động!");
});

// Khởi động server
// Render sẽ tự động cung cấp PORT qua process.env.PORT
const PORT = process.env.PORT || 5000;

// [QUAN TRỌNG] Lưu instance của server vào biến để cấu hình Timeout
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});

// [QUAN TRỌNG] Tăng thời gian chờ (Timeout) lên 5 phút (300.000 ms)
// Mặc định Node.js/Render thường là 2 phút, nếu mạng chậm hoặc file to sẽ bị ngắt kết nối giữa chừng
server.timeout = 300000; 
server.keepAliveTimeout = 300000;
server.headersTimeout = 301000; // Phải lớn hơn keepAliveTimeout 1 chút