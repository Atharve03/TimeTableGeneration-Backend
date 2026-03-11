import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, unique: true }, // e.g. "ROOM-101"
    type:     { type: String, enum: ["theory", "lab", "both"], default: "theory" },
    capacity: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);