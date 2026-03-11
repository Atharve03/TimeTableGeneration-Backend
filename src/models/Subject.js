import mongoose from "mongoose";

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

    // program (btech / mtech)
    program: {
      type: String,
      enum: ["btech", "mtech"],
      required: true,
      default: "btech",
    },

    // semester
    sem: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1,
    },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;