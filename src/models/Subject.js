import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ["theory", "lab"], required: true },
    weeklyLectures: { type: Number, required: true },
    isLab: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
