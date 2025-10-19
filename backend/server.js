// backend/server.js (updated - serve static for images)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';


// Cần thiết cho __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🎵 Music App Backend đang hoạt động!");
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});