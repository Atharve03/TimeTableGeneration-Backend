import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // <-- ADD THIS
    designation: {
      type: String,
      enum: ["Professor", "Associate Professor", "Assistant Professor"],
      required: true
    },
    priority: { type: Number, required: true },
    maxLoadPerWeek: { type: Number, required: true },
    assignedLoad: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
