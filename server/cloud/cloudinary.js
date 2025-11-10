import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = "AIVA/Uploads"; // 💼 store all manual uploads here
    const resource_type = "auto";  // auto-detects images/docs

    // Example: "profile_photo" or "cv_upload"
    const fileType = file.mimetype.split("/")[1] || "raw";

    return {
      folder,
      resource_type,
      format: fileType, // 'jpeg', 'png', 'pdf', etc.
      public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
    };
  },
});


export async function uploadFileFromBuffer(
  buffer,
  fileName,
  folder = "AIVA/Reports",
  format = "pdf"
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: "raw", // ⚠️ Must use 'raw' for non-images (PDF, DOCX, etc.)
        format,
        overwrite: false, // Prevents overwriting existing file
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}



export { cloudinary, storage };
