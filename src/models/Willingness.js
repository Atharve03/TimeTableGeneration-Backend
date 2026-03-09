const mongoose = require("mongoose");

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

    // NEW — list of semesters the faculty is willing to teach
    // each entry has sem number, program, and subjects for that sem
    semesters: [semesterEntrySchema],

    // Availability: which slots on which day orders the teacher is free
    // { "Day Order 1": [1,2,3], "Day Order 2": [4,5], ... }
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

module.exports = mongoose.model("Willingness", willingnessSchema);