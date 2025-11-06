// backend/routes/statsRoutes.js
import express from "express";
import { getDailyListenStats } from "../controllers/statsController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chỉ Admin mới có quyền xem thống kê
router.get("/daily-listens", verifyToken, isAdmin, getDailyListenStats);

export default router;