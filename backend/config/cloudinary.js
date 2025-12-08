// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Config thông tin tài khoản
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Config nơi lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'nghe-va-khen/others';
    let resourceType = 'auto';
    
    // Kiểm tra đuôi file để xác định loại
    const isLyric = file.originalname.toLowerCase().endsWith('.lrc');

    if (file.mimetype.startsWith('audio')) {
        resourceType = 'video'; // Cloudinary xếp audio vào nhóm video
        folderName = 'nghe-va-khen/music';
    } else if (file.mimetype.startsWith('image')) {
        resourceType = 'image';
        folderName = 'nghe-va-khen/images';
    } else if (isLyric) {
        // [QUAN TRỌNG] File .lrc phải để là 'raw'
        resourceType = 'raw';
        folderName = 'nghe-va-khen/lyrics';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      // [QUAN TRỌNG] Thêm 'lrc' vào danh sách cho phép
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp3', 'wav', 'lrc'], 
      // Đặt tên file unique
      public_id: file.originalname.split('.')[0] + '-' + Date.now(), 
      // Với file raw (.lrc), giữ nguyên định dạng gốc để tránh lỗi đổi tên
      format: isLyric ? 'lrc' : undefined 
    };
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;