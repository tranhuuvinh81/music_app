// backend/routes/commentRoutes.js
import express from "express";
import { getCommentsBySong, addComment } from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy comment thì ai cũng xem được (Public)
router.get("/:songId", getCommentsBySong);

// Viết comment thì cần đăng nhập (Protected)
router.post("/", verifyToken, addComment);

export default router;