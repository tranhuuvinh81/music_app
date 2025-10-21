// backend/routes/playlistRoutes.js
import express from "express";
import {
  createPlaylist,
  getPlaylistsByUser,
  addSongToPlaylist,
  getSongsInPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlistController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(verifyToken); // Áp dụng verifyToken cho toàn bộ routes

router.post("/", createPlaylist); // Tạo playlist mới
router.get("/user/:user_id", getPlaylistsByUser); // Lấy playlist của user
router.post("/add-song", addSongToPlaylist); // Thêm bài hát vào playlist
router.post("/remove-song", removeSongFromPlaylist); // Xóa bài hát khỏi playlist (mới)
router.get("/:playlist_id/songs", getSongsInPlaylist); // Lấy bài hát trong playlist
router.delete("/:playlist_id", deletePlaylist); // Xóa playlist

router.put(
  "/:playlist_id",
  upload.fields([{ name: "thumbnailFile", maxCount: 1 }]), // Xử lý upload file
  updatePlaylist
);

export default router;
