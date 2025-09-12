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

// ✅ Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ✅ Multer storage for form-data uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: (req, file) => {
    const isPDF = file.mimetype === "application/pdf";
    const baseName = file.originalname.replace(/\.[^/.]+$/, "");
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");

    return {
      folder: "AIVA",
      resource_type: isPDF ? "raw" : "auto",
      public_id: isPDF
        ? `${safeName}_${Date.now()}.pdf` // ✅ ensure PDF extension
        : `${safeName}_${Date.now()}`,
      overwrite: false,
    };
  },
});

const upload = multer({ storage });

// ✅ Function for buffer uploads (PDF or other files)
export function uploadFileFromBuffer(buffer, fileName, folder = "AIVA") {
  return new Promise((resolve, reject) => {
    if (!buffer || !buffer.length)
      return reject(new Error("❌ Buffer is empty"));

    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const isPDF = fileName.toLowerCase().endsWith(".pdf");

    console.log(
      `📤 Uploading ${fileName} → folder: ${folder}, public_id: ${safeName}`
    );

    const publicId = isPDF
      ? `${safeName}_${Date.now()}.pdf`
      : `${safeName}_${Date.now()}`;

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: isPDF ? "raw" : "auto",
        public_id: publicId,
        overwrite: false,
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

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export { cloudinary, upload };
