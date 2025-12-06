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

// // Test route
// app.get("/", (req, res) => {
//   res.send("Music App Backend đang hoạt động!");
// });

// // Khởi động server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server đang chạy tại http://localhost:${PORT}`);
// });


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

app.use(express.json());

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

// Test route
app.get("/", (req, res) => {
  res.send("Music App Backend đang hoạt động!");
});

// Khởi động server
// Render sẽ tự động cung cấp PORT qua process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});