import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    year: { type: String, required: true }, // e.g., 2025–26
    semester: { type: String, enum: ["odd", "even"], required: true },
    department: { type: String, required: true },
    isFrozen: { type: Boolean, default: false } // timetable locked for semester
  },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);
