import mongoose from "mongoose";

const workshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    authorDesignation: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Workshop = mongoose.model("Workshop", workshopSchema);
