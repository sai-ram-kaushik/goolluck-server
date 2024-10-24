import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Course } from "../models/course.models.js";

const createCourse = asyncHandler(async (req, res) => {
  const { name, amount, desc, author } = req.body;

  if ([name, amount, desc, author].some((fields) => fields === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const courseImageLocalPath = req.file?.path;

  if (!courseImageLocalPath) {
    throw new ApiError(400, "Course image is required");
  }

  let courseImage;

  try {
    courseImage = await uploadOnCloudinary(courseImageLocalPath);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new ApiError(500, "Failed to upload ID card image");
  }

  if (!courseImage || !courseImage.url) {
    throw new ApiError(500, "Invalid response from Cloudinary");
  }

  const course = await Course.create({
    name,
    amount,
    desc,
    author,
    imageUrl: courseImage.url,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, course, "Course has been created"));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();

  return res.status(201).json(new ApiResponse(200, courses, "All courses"));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Course has been deleted successfully"));
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course found successfully"));
});

export { createCourse, getAllCourses, deleteCourse, getCourseById };
