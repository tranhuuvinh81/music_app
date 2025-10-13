// // middleware/upload.js
// import multer from 'multer';
// import path from 'path';

// // Cấu hình nơi lưu file và tên file
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/songs/'); // Thư mục lưu file nhạc
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// // Kiểm tra loại file
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav') {
//     cb(null, true);
//   } else {
//     cb(new Error('Chỉ chấp nhận file nhạc (mp3, wav)!'), false);
//   }
// };

// const upload = multer({ 
//   storage: storage,
//   fileFilter: fileFilter 
// });

// export default upload;
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/songs';

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|mpeg/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Lỗi: Chỉ hỗ trợ các định dạng file audio/image!");
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Giới hạn 10MB
});

export default upload;