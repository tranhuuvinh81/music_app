// // import express from "express";
// // import { getAllSongs, addSong } from "../controllers/songController.js";

// // const router = express.Router();

// // // Lấy tất cả bài hát
// // router.get("/", getAllSongs);

// // // Thêm bài hát mới
// // router.post("/", addSong);

// // export default router;
// import express from "express";
// import {
//   getAllSongs,
//   getSongById,
//   addSong,
//   updateSong,
//   deleteSong,
// } from "../controllers/songController.js";
// import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
// import upload from '../middleware/upload.js'; //

// const router = express.Router();

// // Public
// router.get("/", getAllSongs);
// router.get("/:id", getSongById);

// // Admin only
// router.post("/", verifyToken, isAdmin, addSong);
// router.put("/:id", verifyToken, isAdmin, updateSong);
// router.delete("/:id", verifyToken, isAdmin, deleteSong);
// router.post("/", verifyToken, isAdmin, upload.single('songFile'), addSong); // 👈 Sử dụng upload middleware

// export default router;

// backend/routes/songRoutes.js (updated - reorder routes to put /search before /:id)
import express from "express";
import {
  getAllSongs,
  getSongById,
  addSong,
  updateSong,
  deleteSong,
  searchSongs,
} from "../controllers/songController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from '../middleware/upload.js';

const router = express.Router();

// Public
router.get("/", getAllSongs);
router.get("/search", searchSongs); // Moved before /:id
router.get("/:id", getSongById);
// Admin only
// 'songFile' là tên của field trong form-data khi upload
router.post("/", verifyToken, isAdmin, upload.single('songFile'), addSong);
router.put("/:id", verifyToken, isAdmin, upload.single('songFile'), updateSong);
router.delete("/:id", verifyToken, isAdmin, deleteSong);

export default router;