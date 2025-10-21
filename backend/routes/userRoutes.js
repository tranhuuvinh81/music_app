// backend/routes/userRoutes.js
import express from "express";
import {
  loginUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById,
  addListenHistory,
  getListenHistory,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Protected routes
router.post("/history", verifyToken, addListenHistory);
router.get("/history", verifyToken, getListenHistory);
router.get("/:id", verifyToken, getUserById);

// Admin only routes
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put(
  "/:id",
  verifyToken,
  upload.fields([{ name: "avatarFile", maxCount: 1 }]),
  updateUser
);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
