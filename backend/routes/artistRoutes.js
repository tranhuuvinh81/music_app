import express from "express";
import {
  getAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from '../middleware/upload.js';

const router = express.Router();

// Public
router.get("/", getAllArtists);

// Admin only
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "artistImage", maxCount: 1 }]),
  createArtist
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "artistImage", maxCount: 1 }]),
  updateArtist
);
router.delete("/:id", verifyToken, isAdmin, deleteArtist);

export default router;