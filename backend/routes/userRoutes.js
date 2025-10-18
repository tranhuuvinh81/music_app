// // backend/routes/userRoutes.js (updated - add get by id, use upload for update)
// import express from "express";
// import {
//   loginUser,
//   registerUser,
//   getAllUsers,
//   updateUser,
//   deleteUser,
//   getUserById, // Thêm mới
// } from "../controllers/userController.js";
// import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
// import upload from "../middleware/upload.js"; // Thêm upload

// const router = express.Router();

// // Public routes
// router.post("/login", loginUser);
// router.post("/register", registerUser); // Đổi từ "/" thành "/register" cho rõ ràng

// // Protected routes
// router.get("/:id", verifyToken, getUserById); // Lấy chi tiết user (user tự xem hoặc admin)

// // Admin only routes
// router.get("/", verifyToken, isAdmin, getAllUsers);
// router.put("/:id", verifyToken, upload.fields([{ name: 'avatarFile', maxCount: 1 }]), updateUser); // Thêm upload cho avatar
// router.delete("/:id", verifyToken, isAdmin, deleteUser);

// export default router;
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
router.post("/history", verifyToken, addListenHistory); // Thêm lịch sử
router.get("/history", verifyToken, getListenHistory); // Lấy lịch sử
router.get("/:id", verifyToken, getUserById);


// Admin only routes
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, upload.fields([{ name: 'avatarFile', maxCount: 1 }]), updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;