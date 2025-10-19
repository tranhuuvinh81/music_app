// // routes/playlistRoutes.js
// import express from "express";
// import {
//   createPlaylist,
//   getPlaylistsByUser,
//   addSongToPlaylist,
//   getSongsInPlaylist,
//   deletePlaylist
// } from "../controllers/playlistController.js";

// const router = express.Router();

// router.post("/", createPlaylist); // Tạo playlist mới
// router.get("/user/:user_id", getPlaylistsByUser); // Lấy playlist của user
// router.post("/add-song", addSongToPlaylist); // Thêm bài hát vào playlist
// router.get("/:playlist_id/songs", getSongsInPlaylist); // Lấy bài hát trong playlist
// router.delete("/:playlist_id", deletePlaylist); // Xóa playlist

// export default router;
// backend/routes/playlistRoutes.js (updated)
import express from "express";
import {
  createPlaylist,
  getPlaylistsByUser,
  addSongToPlaylist,
  getSongsInPlaylist,
  removeSongFromPlaylist, // Thêm mới
  deletePlaylist,
  updatePlaylist, // 👈 1. Import hàm mới
} from "../controllers/playlistController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Thêm verifyToken cho tất cả routes
import upload from "../middleware/upload.js"; // 👈 2. Import middleware upload

const router = express.Router();

router.use(verifyToken); // Áp dụng verifyToken cho toàn bộ routes

router.post("/", createPlaylist); // Tạo playlist mới
router.get("/user/:user_id", getPlaylistsByUser); // Lấy playlist của user
router.post("/add-song", addSongToPlaylist); // Thêm bài hát vào playlist
router.post("/remove-song", removeSongFromPlaylist); // Xóa bài hát khỏi playlist (mới)
router.get("/:playlist_id/songs", getSongsInPlaylist); // Lấy bài hát trong playlist
router.delete("/:playlist_id", deletePlaylist); // Xóa playlist

// 👈 3. Thêm route PUT để cập nhật
router.put(
  "/:playlist_id",
  upload.fields([{ name: "thumbnailFile", maxCount: 1 }]), // Xử lý upload file
  updatePlaylist
);

export default router;