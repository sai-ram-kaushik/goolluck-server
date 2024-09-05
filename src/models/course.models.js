import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    amount: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
