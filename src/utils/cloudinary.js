import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    console.log(`Attempting to upload file: ${filePath} to Cloudinary`);
    const result = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
    });
    console.log("Cloudinary upload result:", result);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export { uploadOnCloudinary };