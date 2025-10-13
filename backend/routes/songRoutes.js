// backend/routes/songRoutes.js (updated - add new routes)
import express from "express";
import {
  getAllSongs,
  getSongById,
  addSong,
  updateSong,
  deleteSong,
  searchSongs,
  getArtists,
  getGenres,
  getSongsByArtist,
  getSongsByGenre,
} from "../controllers/songController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from '../middleware/upload.js';

const router = express.Router();

// Public
router.get("/", getAllSongs);
router.get("/search", searchSongs);
router.get("/artists", getArtists);
router.get("/genres", getGenres);
router.get("/artist/:artist", getSongsByArtist);
router.get("/genre/:genre", getSongsByGenre);
router.get("/:id", getSongById);
// Admin only
router.post("/", verifyToken, isAdmin, upload.fields([{ name: 'songFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), addSong);
router.put("/:id", verifyToken, isAdmin, upload.fields([{ name: 'songFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), updateSong);
router.delete("/:id", verifyToken, isAdmin, deleteSong);

export default router;