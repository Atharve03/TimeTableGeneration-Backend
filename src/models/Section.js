import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // A1, B1, C1 etc
    year: { type: String, required: true },
    semester: { type: String, enum: ["odd", "even"], required: true },
    department: { type: String, required: true },

    totalStudents: { type: Number, default: 0 },
    strength: { type: Number, default: 60 }, // max students per section

    isFrozen: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Section", sectionSchema);
