// backend/routes/chatbotRoutes.js
import express from "express";
import { getChatbotSuggestion } from "../controllers/chatbotController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạm thời public để người dùng chưa đăng nhập cũng có thể sử dụng
router.post("/suggest", getChatbotSuggestion);

export default router;