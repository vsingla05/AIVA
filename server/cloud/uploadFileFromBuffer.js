import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
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

export default function uploadFileFromBuffer(buffer, fileName, folder = "AIVA") {
  return new Promise((resolve, reject) => {
    if (!buffer || !buffer.length) return reject(new Error("Buffer is empty"));

    console.log("Uploading file:", fileName, "to folder:", folder, "Buffer size:", buffer.length);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Force raw for PDF
        public_id: fileName.replace(/[^a-zA-Z0-9_-]/g, "_"), // sanitize
        folder,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("Cloudinary upload success, URL:", result.secure_url);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
