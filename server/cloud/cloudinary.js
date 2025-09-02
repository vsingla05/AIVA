import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_KEY ||
    !process.env.CLOUDINARY_SECRET) {
  throw new Error("Missing Cloudinary environment variables.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'AIVA',
    resource_type: 'auto', 
  })
});

export { cloudinary, storage };
