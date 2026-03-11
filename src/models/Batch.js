import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    strength: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;