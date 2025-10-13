// backend/middleware/upload.js (updated - add thumbnails support)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirs = {
  songs: 'uploads/songs',
  images: 'uploads/images',
  thumbnails: 'uploads/thumbnails' // Thêm thư mục cho thumbnails
};

// Đảm bảo thư mục upload tồn tại
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'songFile') {
      cb(null, uploadDirs.songs);
    } else if (file.fieldname === 'imageFile') {
      cb(null, uploadDirs.images);
    } else if (file.fieldname === 'thumbnailFile') {
      cb(null, uploadDirs.thumbnails);
    } else {
      cb(new Error('Invalid fieldname'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  let allowedTypes;
  if (file.fieldname === 'songFile') {
    allowedTypes = /mp3|wav|mpeg/;
  } else if (file.fieldname === 'imageFile' || file.fieldname === 'thumbnailFile') {
    allowedTypes = /jpeg|jpg|png|gif/;
  }
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Lỗi: Chỉ hỗ trợ các định dạng file audio/image phù hợp!");
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // Giới hạn 10MB
});

export default upload;