import express from "express";
import { getChatbotSuggestion } from "../controllers/chatbotController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chúng ta có thể bảo vệ route này nếu muốn, nhưng hiện tại hãy để public
// để người dùng chưa đăng nhập cũng có thể dùng
router.post("/suggest", getChatbotSuggestion);

export default router;