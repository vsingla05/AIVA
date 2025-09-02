export default async function uploadFileFromPath(filePath, fileName, folder = "AIVA/uploads") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", 
      public_id: fileName,
      folder,
      overwrite: true,
    });
    return result.secure_url;
  } catch (err) {
    console.error("Error uploading file to Cloudinary:", err);
    throw err;
  }
}
