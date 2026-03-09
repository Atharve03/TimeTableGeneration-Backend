const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    weeklyLectures: {
      type: Number,
      required: true,
      default: 3,
    },
    // NEW — which program this subject belongs to
    program: {
      type: String,
      enum: ["btech", "mtech"],
      required: true,
      default: "btech",
    },
    // NEW — which semester this subject belongs to
    sem: {
      type: Number,
      required: true,
      min: 1,
      max: 8,   // 1-8 for btech, 1-4 for mtech
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);