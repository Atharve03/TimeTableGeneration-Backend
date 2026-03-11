import mongoose from "mongoose";

// Sub-schema: one semester entry in willingness
const semesterEntrySchema = new mongoose.Schema(
  {
    sem: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    program: {
      type: String,
      enum: ["btech", "mtech"],
      required: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { _id: false }
);

const willingnessSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    // list of semesters the faculty is willing to teach
    semesters: [semesterEntrySchema],

    // Availability: which slots teacher is free
    // Example: { "Day Order 1": [1,2,3], "Day Order 2": [4,5] }
    availability: {
      type: Map,
      of: [Number],
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Willingness = mongoose.model("Willingness", willingnessSchema);

export default Willingness;