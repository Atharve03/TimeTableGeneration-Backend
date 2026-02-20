import mongoose from "mongoose";

const willingnessSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    // 🔥 NEW
    semesters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
      }
    ],

    // 🔥 NEW
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
      }
    ],

    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],

    availability: {
      type: Map,
      of: [Number],
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
