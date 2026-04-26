import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary - ensure env vars are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
  console.warn('WARNING: Cloudinary credentials not fully configured');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary storage instead of disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'secondhand-marketplace',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  } as any,
});

export const upload = multer({ storage });

// Helper to get the Cloudinary URL from the uploaded file
export const getImageUrl = (file: Express.Multer.File): string => {
  return (file as any).path; // multer-storage-cloudinary stores the URL in file.path
};
