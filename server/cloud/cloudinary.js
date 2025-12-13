import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

/* ----------------------------------------
   CLOUDINARY CONFIG
---------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ----------------------------------------
   MULTER STORAGE (FOR FILE UPLOADS)
---------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = "AIVA/Uploads";
    const resource_type = "auto";
    const fileType = file.mimetype?.split("/")?.[1] || "raw";

    return {
      folder,
      resource_type,
      format: fileType,
      public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage });

/* ----------------------------------------
   UPLOAD PDF / FILE FROM BUFFER
---------------------------------------- */
export async function uploadFileFromBuffer(
  buffer,
  fileName,
  folder = "AIVA/Reports"
) {
  if (!buffer) throw new Error("No file buffer");

  const cleanName = fileName.replace(/\.[^/.]+$/, "");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: cleanName,
        resource_type: "auto",  // IMPORTANT
        format: "pdf",
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);

        const viewUrl = result.secure_url;  // already ends with .pdf

        // 🔥 FORCE download
        const downloadUrl = `${result.secure_url}?fl_attachment=${cleanName}.pdf&fl_force_download=true`;

        resolve({ viewUrl, downloadUrl });
      }
    );

    uploadStream.end(buffer);
  });
}





export { cloudinary, storage, upload };
