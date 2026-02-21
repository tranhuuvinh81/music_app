//backend/routes/settingRoutes.js
import express from "express";
import { getSetting, updateSetting } from "../controllers/settingController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:key", getSetting); // Public (để trang chủ lấy data)
router.put("/:key", verifyToken, isAdmin, updateSetting); // Admin (để lưu)

export default router;