// cloud/cloudinary.js
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import streamifier from "streamifier";

dotenv.config();

// ✅ Validate environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_KEY ||
  !process.env.CLOUDINARY_SECRET
) {
  throw new Error("❌ Missing Cloudinary environment variables.");
}

// ✅ Configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ✅ Multer storage for form-data uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "AIVA",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// ✅ Function for buffer uploads
export default function uploadFileFromBuffer(buffer, fileName, folder = "AIVA") {
  return new Promise((resolve, reject) => {
    if (!buffer || !buffer.length) {
      return reject(new Error("❌ Buffer is empty"));
    }

    // 🔑 Remove extension from fileName (avoid .pdf.pdf issue)
    const baseName = fileName.replace(/\.[^/.]+$/, ""); 
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_"); 

    console.log(`📤 Uploading ${fileName} → folder: ${folder}, public_id: ${safeName}`);

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: "auto", // auto-detects pdf/image/video
        folder,                // default "AIVA"
        public_id: safeName,   // cleaned, extension-free name
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("✅ Cloudinary upload success:", result.secure_url);
        resolve(result.secure_url);
      }
    );

    // pipe buffer into Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
export { cloudinary, upload, uploadFileFromBuffer };
