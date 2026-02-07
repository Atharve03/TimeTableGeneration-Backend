import mongoose from "mongoose";

const willingnessSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],
    availability: {
      type: Map,
      of: [Number], // Day → Array of available slots (e.g., Monday: [1,2,3])
      default: {}
    },
    preferredSlots: {
      type: Map,
      of: [Number],
      default: {}
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Willingness", willingnessSchema);
