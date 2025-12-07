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
    // Tự động phân loại: Ảnh hoặc Âm thanh
    // Cloudinary coi Audio là 'video' hoặc 'raw'
    let resourceType = 'auto'; 
    let folderName = 'nghe-va-khen';

    if (file.mimetype.startsWith('audio')) {
        resourceType = 'video'; // Lưu ý: Cloudinary xếp audio vào nhóm video
        folderName = 'nghe-va-khen/music';
    } else if (file.mimetype.startsWith('image')) {
        folderName = 'nghe-va-khen/images';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp3', 'wav'], // Các đuôi file cho phép
      public_id: file.originalname.split('.')[0] + '-' + Date.now(), // Đặt tên file unique
    };
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;