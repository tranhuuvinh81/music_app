import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecret"; // hoặc từ .env

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ" });
    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  // giả sử token chứa role
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin được phép thao tác" });
  }
  next();
};
