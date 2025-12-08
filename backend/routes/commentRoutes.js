// backend/routes/commentRoutes.js
import express from "express";
import {
    getCommentsBySong, 
    addComment, 
    deleteComment, 
    updateComment 
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy comment thì ai cũng xem được (Public)
router.get("/:songId", getCommentsBySong);

// Viết comment thì cần đăng nhập (Protected)
router.post("/", verifyToken, addComment);
router.delete("/:id", verifyToken, deleteComment);
router.put("/:id", verifyToken, updateComment);

export default router;