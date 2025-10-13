// import express from "express";
// import { registerUser, getAllUsers,updateUser, deleteUser } from "../controllers/userController.js";

// const router = express.Router();

// router.post("/", registerUser); // POST /api/users → đăng ký
// router.get("/", getAllUsers);   // GET /api/users → lấy danh sách
// router.put("/:id", updateUser);       // 🆕 Cập nhật user
// router.delete("/:id", deleteUser);    // 🆕 Xóa user

// // export default router;
// import express from "express";
// import {
//   loginUser,
//   registerUser,
//   getAllUsers,
//   updateUser,
//   deleteUser,
// } from "../controllers/userController.js";

// const router = express.Router();

// router.post("/login", loginUser);
// router.post("/", registerUser);
// router.get("/", getAllUsers);
// router.put("/:id", updateUser);
// router.delete("/:id", deleteUser);

// export default router;
// routes/userRoutes.js
import express from "express";
import {
  loginUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"; // 👈 Thêm vào

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser); // Đổi từ "/" thành "/register" cho rõ ràng

// Admin only routes
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id", verifyToken, isAdmin, updateUser); // Có thể thêm logic để user tự sửa thông tin của mình
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
