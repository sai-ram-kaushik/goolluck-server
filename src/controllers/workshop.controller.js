import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Workshop } from "../models/workshop.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createWorkshop = asyncHandler(async (req, res) => {
  const { name, author, authorDesignation, duration, date, time } = req.body;

  // Validate that none of the fields are empty
  if (
    [name, author, authorDesignation, duration, date, time].some(
      (field) => field === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const workshopImageLocalFilePath = req.file?.path;

  if (!workshopImageLocalFilePath) {
    throw new ApiError(400, "Workshop image is required");
  }

  let workshopImage;

  try {
    workshopImage = await uploadOnCloudinary(workshopImageLocalFilePath);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new ApiError(500, "Failed to upload ID card image");
  }

  if (!workshopImage || !workshopImage.url) {
    throw new ApiError(500, "Invalid response from Cloudinary");
  }

  // Create the workshop in the database
  const workshop = await Workshop.create({
    name,
    author,
    authorDesignation,
    duration,
    date,
    time,
    imageUrl: workshopImage.url,
  });

  // Send success response
  return res
    .status(201)
    .json(new ApiResponse(200, workshop, "Workshop has been created"));
});

const getAllWorkshops = asyncHandler(async (req, res) => {
  const workshop = await Workshop.find();

  return res.status(201).json(new ApiResponse(200, workshop, "All Workshops"));
});

const deleteWorkshop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workshop = await Workshop.findByIdAndDelete(id);

  if (!workshop) {
    throw new ApiError(404, "Workshop not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Workshop has been deleted successfully"));
});

const getWorkshopByItsId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workshop = await Workshop.findById(id);

  if (!workshop) {
    throw new ApiError(404, "Workshop not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, workshop, "Workshop found successfully"));
});

export { createWorkshop, getAllWorkshops, deleteWorkshop, getWorkshopByItsId };
