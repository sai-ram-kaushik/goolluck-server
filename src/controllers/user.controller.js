import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Something went wrong while generating the tokens");
  }
};

const createUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    linkedinProfileUrl,
    phoneNumber,
  } = req.body;

  if (
    [
      firstName,
      lastName,
      username,
      email,
      password,
      linkedinProfileUrl,
      phoneNumber,
    ].some((userFields) => userFields === "")
  ) {
    throw new ApiError(400, "All fields are required to fill");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already registered");
  }

  const idCardImageLocalPath = req.file?.path;

  if (!idCardImageLocalPath) {
    throw new ApiError(400, "Id card image is required");
  }

  let idCardImage;
  try {
    idCardImage = await uploadOnCloudinary(idCardImageLocalPath);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new ApiError(500, "Failed to upload ID card image");
  }

  if (!idCardImage || !idCardImage.url) {
    throw new ApiError(500, "Invalid response from Cloudinary");
  }

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    linkedinProfileUrl,
    phoneNumber,
    idCard: idCardImage.url,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        user,
        "User has been created. The admins will approve the profile ASAP."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user.isApproved) {
    throw new ApiError(
      403,
      "Your profile has not been approved by an admin yet"
    );
  }

  try {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  return res.status(201).json(new ApiResponse(200, users, "All Users"));
});

const getUserByItsId = asyncHandler(async (req, res) => {
  const userId = req.params._id;
  const userById = await User.findById(userId);

  if (!userById) {
    throw new ApiError(404, "User not found");
  }

  return res.status(201).json(new ApiResponse(200, userById, "User by Id"));
});

export { createUser, loginUser, getAllUsers, getUserByItsId };
