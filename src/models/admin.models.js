import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
  if (!accessTokenExpiry) {
    throw new ApiError(400, "Access token expiry is not set");
  }

  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiry,
  });
};

adminSchema.methods.generateRefreshToken = function () {
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

  if (!refreshTokenExpiry) {
    throw new ApiError(400, "refresh token expiry is not set");
  }

  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiry,
  });
};

export const Admin = mongoose.model("Admin", adminSchema);
