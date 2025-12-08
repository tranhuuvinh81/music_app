// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Xác định loại file
    const isLyric = file.originalname.toLowerCase().endsWith('.lrc');
    const isAudio = file.mimetype.startsWith('audio');

    // 2. Cấu hình cơ bản
    let folderName = 'nghe-va-khen/others';
    let resourceType = 'auto';
    
    if (isAudio) {
        resourceType = 'video'; 
        folderName = 'nghe-va-khen/music';
    } else if (file.mimetype.startsWith('image')) {
        resourceType = 'image';
        folderName = 'nghe-va-khen/images';
    } else if (isLyric) {
        resourceType = 'raw';
        folderName = 'nghe-va-khen/lyrics';
    }

    // 3. Tạo public_id (Tên file trên cloud)
    // Loại bỏ đuôi file cũ để tránh bị double (vd: song.mp3.mp3)
    const nameWithoutExt = file.originalname.split('.')[0];
    const uniqueName = `${nameWithoutExt}-${Date.now()}`;

    // 4. TRẢ VỀ CONFIG (Tách biệt cho RAW và AUTO)
    if (resourceType === 'raw') {
        return {
            folder: folderName,
            resource_type: 'raw',
            // [QUAN TRỌNG] Với file raw, phải tự thêm đuôi file vào public_id
            public_id: uniqueName + '.lrc',
            // [QUAN TRỌNG] KHÔNG được dùng allowed_formats hay format cho file raw
            use_filename: true 
        };
    }

    // Cấu hình cho Ảnh và Nhạc
    return {
      folder: folderName,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp3', 'wav'],
      public_id: uniqueName,
    };
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;