// // backend/middleware/upload.js (updated - add support for playlist thumbnails)
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const uploadDirs = {
//   songs: 'uploads/songs',
//   images: 'uploads/images',
//   avatars: 'uploads/avatars',
//   thumbnails: 'uploads/thumbnails' // Thêm thư mục cho thumbnail playlist
// };

// // Đảm bảo thư mục upload tồn tại
// Object.values(uploadDirs).forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === 'songFile') {
//       cb(null, uploadDirs.songs);
//     } else if (file.fieldname === 'imageFile') {
//       cb(null, uploadDirs.images);
//     } else if (file.fieldname === 'avatarFile') {
//       cb(null, uploadDirs.avatars);
//     } else if (file.fieldname === 'thumbnailFile') {
//       cb(null, uploadDirs.thumbnails);
//     } else {
//       cb(new Error('Invalid fieldname'), null);
//     }
//   },
//   filename: (req, file, cb) => {
//     // Tạo tên file duy nhất để tránh trùng lặp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const fileFilter = (req, file, cb) => {
//   let allowedTypes;
//   if (file.fieldname === 'songFile') {
//     allowedTypes = /mp3|wav|mpeg/;
//   } else if (file.fieldname === 'imageFile' || file.fieldname === 'avatarFile' || file.fieldname === 'thumbnailFile') {
//     allowedTypes = /jpeg|jpg|png|gif/;
//   }
//   const mimetype = allowedTypes.test(file.mimetype);
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

//   if (mimetype && extname) {
//     return cb(null, true);
//   }
//   cb("Lỗi: Chỉ hỗ trợ các định dạng file audio/image phù hợp!");
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1024 * 1024 * 10 } // Giới hạn 10MB
// });

// export default upload;
// backend/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirs = {
  songs: 'uploads/songs',
  images: 'uploads/images',
  avatars: 'uploads/avatars',
  thumbnails: 'uploads/thumbnails',
  lyrics: 'uploads/lyrics', // 👈 1. THÊM THƯ MỤC LYRICS
artists: 'uploads/artists' // 👈 1. THÊM THƯ MỤC MỚI

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
    } else if (file.fieldname === 'avatarFile') {
      cb(null, uploadDirs.avatars);
    } else if (file.fieldname === 'thumbnailFile') {
      cb(null, uploadDirs.thumbnails);
    } else if (file.fieldname === 'lyricFile') { // 👈 2. THÊM LOGIC CHO LYRICFILE
      cb(null, uploadDirs.lyrics);
    } else if (file.fieldname === 'artistImage') { // 👈 2. THÊM LOGIC MỚI
      cb(null, uploadDirs.artists);
    }else {
      cb(new Error('Invalid fieldname'), null);
    }
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  let allowedTypes;
  if (file.fieldname === 'songFile') {
    allowedTypes = /mp3|wav|mpeg/;
  } else if (file.fieldname === 'imageFile' || file.fieldname === 'avatarFile' || file.fieldname === 'thumbnailFile' || file.fieldname === 'artistImage') {
    allowedTypes = /jpeg|jpg|png|gif/;
  } else if (file.fieldname === 'lyricFile') { // 👈 3. THÊM LOGIC FILTER CHO LYRIC
    // Chấp nhận .lrc (text/plain)
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'text/plain' || ext === '.lrc') {
      return cb(null, true);
    }
    return cb("Lỗi: Chỉ hỗ trợ file .lrc!");
  }

  // Kiểm tra cho audio/image
  if (!allowedTypes) {
    return cb("Lỗi: fieldname không hợp lệ!");
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