import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["lecture", "lab"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
