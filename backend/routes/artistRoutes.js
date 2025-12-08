// // backend/routes/artistRoutes.js
// import express from "express";
// import {
//   getAllArtists,
//   createArtist,
//   updateArtist,
//   deleteArtist,
//   getArtistById
// } from "../controllers/artistController.js";
// import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
// import upload from '../middleware/upload.js';

// const router = express.Router();

// // Public
// router.get("/", getAllArtists);
// router.get("/:id", getArtistById);

// // Admin only
// router.post(
//   "/",
//   verifyToken,
//   isAdmin,
//   upload.fields([{ name: "artistImage", maxCount: 1 }]),
//   createArtist
// );
// router.put(
//   "/:id",
//   verifyToken,
//   isAdmin,
//   upload.fields([{ name: "artistImage", maxCount: 1 }]),
//   updateArtist
// );
// router.delete("/:id", verifyToken, isAdmin, deleteArtist);

// export default router;


// backend/routes/artistRoutes.js
import express from "express";
import {
  getAllArtists,
  addArtist,
  updateArtist,
  deleteArtist,
  getArtistById
} from "../controllers/artistController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from '../middleware/upload.js';
import uploadCloud from "../config/cloudinary.js";

const router = express.Router();

// Public
router.get("/", getAllArtists);
router.get("/:id", getArtistById);

// Admin only
router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadCloud.single("artistImage"),
  addArtist
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadCloud.single("artistImage"),
  updateArtist
);
router.delete("/:id", verifyToken, isAdmin, deleteArtist);

export default router;