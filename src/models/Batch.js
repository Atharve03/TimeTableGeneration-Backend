import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true
    },
    batchNumber: { type: Number, enum: [1, 2], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);
