import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function () {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
  if (!accessTokenExpiry) {
    throw new ApiError(400, "Access token expiry is not set");
  }

  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: accessTokenExpiry,
  });
};

userSchema.methods.generateRefreshToken = function () {
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

  if (!refreshTokenExpiry) {
    throw new ApiError(400, "refresh token expiry is not set");
  }

  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshTokenExpiry,
  });
};

export const User = mongoose.model("User", userSchema);
