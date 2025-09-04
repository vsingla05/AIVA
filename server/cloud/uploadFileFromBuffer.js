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

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} fileName - The public ID (name) of the file
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export default function uploadFileFromBuffer(buffer, fileName, folder = "AIVA") {
  return new Promise((resolve, reject) => {
    console.log("Uploading file:", fileName, "to folder:", folder);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: fileName,
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

    if (!buffer || !buffer.length) return reject(new Error("Buffer is empty"));

    uploadStream.end(buffer);
  });
}
