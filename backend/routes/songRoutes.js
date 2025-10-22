// // backend/routes/songRoutes.js
import express from "express";
import {
  getAllSongs,
  getSongById,
  addSong,
  updateSong,
  deleteSong,
  getGenres,
  getSongsByArtist,
  getSongsByGenre,
} from "../controllers/songController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public Routes
router.get("/", getAllSongs); // Lấy tất cả bài hát (đã bao gồm nghệ sĩ)
router.get("/genres", getGenres); // Lấy danh sách thể loại
router.get("/artist/:artistName", getSongsByArtist); // Lấy bài hát theo TÊN nghệ sĩ
router.get("/genre/:genre", getSongsByGenre); // Lấy bài hát theo thể loại
router.get("/:id", getSongById); // Lấy chi tiết bài hát (đã bao gồm nghệ sĩ)

// Admin only Routes
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.fields([
    { name: "songFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
    { name: "lyricFile", maxCount: 1 },
  ]),
  addSong
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([
    { name: "songFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
    { name: "lyricFile", maxCount: 1 },
  ]),
  updateSong
);
router.delete("/:id", verifyToken, isAdmin, deleteSong);

export default router;
