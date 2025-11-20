import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
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
    const folder = "AIVA/Uploads";
    const resource_type = "auto";
    const fileType = file.mimetype.split("/")[1] || "raw";

    return {
      folder,
      resource_type,
      format: fileType,
      public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage }); // ✅ Multer middleware

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
        resource_type: "raw",
        format,
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export { cloudinary, storage, upload };
