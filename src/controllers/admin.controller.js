import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Admin } from "../models/admin.models.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const genearteAccessAndRefreshTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error generating tokens:", error); // Log the error for debugging
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registeredAdmin = asyncHandler(async (req, res) => {
  // get admin user from the frontend
  const { username, email, password } = req.body;

  //   validation
  if ([username, email, password].some((field) => field.trim() == "")) {
    throw new ApiError(400, "All fields are required");
  }

  //   check whether the admin is already registered or not
  const existedAdmin = await Admin.findOne({
    $or: [{ username }, { email }],
  });

  if (existedAdmin) {
    throw new ApiError(409, "Admin already exists");
  }

  //   creating a model in db
  const admin = await Admin.create({ username, email, password });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(400, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin Registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const admin = await Admin.findOne({
    $or: [{ username }, { email }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  try {
    const { accessToken, refreshToken } = await genearteAccessAndRefreshTokens(
      admin._id
    );

    const loggedInAdmin = await Admin.findById(admin._id).select(
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
          { admin: loggedInAdmin, accessToken, refreshToken },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
});

const logOutAdmin = asyncHandler(async (req, res) => {
  // Clearing refreshToken from the user document
  await Admin.findByIdAndUpdate(
    req.admin._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Clearing cookies from the response
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(0), // Set expiration date in the past
  };

  // Clear access token from localStorage
  localStorage.removeItem("accessToken");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin Logged Out"));
});

const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(`Approving user with ID: ${userId}`); // Log user ID

  const user = await User.findById(userId);
  if (!user) {
    console.log(`User with ID: ${userId} not found`); // Log if user is not found
    throw new ApiError(404, "User not found");
  }

  user.isApproved = true;
  await user.save();

  console.log(`User with ID: ${userId} approved successfully`); // Log successful approval

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User approved successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?._id);

    if (!admin) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== admin?.refreshToken) {
      throw new ApiError(401, "Refresh Token Expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await genearteAccessAndRefreshTokens(admin._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Refresh  Token Updated"
        )
      );
  } catch (error) {
    throw new ApiError(401);
  }
});

export {
  registeredAdmin,
  loginAdmin,
  logOutAdmin,
  refreshAccessToken,
  approveUser,
};