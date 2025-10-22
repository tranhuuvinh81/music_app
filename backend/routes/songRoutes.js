// // backend/routes/songRoutes.js
// import express from "express";
// import {
//   getAllSongs,
//   getSongById,
//   addSong,
//   updateSong,
//   deleteSong,
//   searchSongs,
//   getArtists,
//   getGenres,
//   getSongsByArtist,
//   getSongsByGenre,
// } from "../controllers/songController.js";
// import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
// import upload from "../middleware/upload.js";

// const router = express.Router();

// // Public
// router.get("/", getAllSongs);
// router.get("/search", searchSongs);
// router.get("/artists", getArtists);
// router.get("/genres", getGenres);
// router.get("/artist/:artist", getSongsByArtist);
// router.get("/genre/:genre", getSongsByGenre);
// router.get("/:id", getSongById);

// // Admin only
// router.post(
//   "/",
//   verifyToken,
//   isAdmin,
//   upload.fields([
//     { name: "songFile", maxCount: 1 },
//     { name: "imageFile", maxCount: 1 },
//     { name: "lyricFile", maxCount: 1 },
//   ]),
//   addSong
// );
// router.put(
//   "/:id",
//   verifyToken,
//   isAdmin,
//   upload.fields([
//     { name: "songFile", maxCount: 1 },
//     { name: "imageFile", maxCount: 1 },
//     { name: "lyricFile", maxCount: 1 },
//   ]),
//   updateSong
// );
// router.delete("/:id", verifyToken, isAdmin, deleteSong);

// export default router;

import express from "express";
import {
  getAllSongs,
  getSongById,
  addSong,
  updateSong,
  deleteSong,
  // searchSongs, // Không dùng nữa
  // getArtists, // Không dùng nữa
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
  addSong // Controller đã được cập nhật để nhận artistIds
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([
    { name: "songFile", maxCount: 1 }, // Có thể cho phép update file nhạc nếu muốn
    { name: "imageFile", maxCount: 1 },
    { name: "lyricFile", maxCount: 1 },
  ]),
  updateSong // Controller đã được cập nhật để nhận artistIds
);
router.delete("/:id", verifyToken, isAdmin, deleteSong);

// Các route bị loại bỏ:
// router.get("/search", searchSongs); // Dùng /api/search thay thế
// router.get("/artists", getArtists); // Dùng /api/artists thay thế

export default router;
