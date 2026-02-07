import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: false // null for theory classes
    },
    day: { type: String, required: true },
    slot: { type: Number, required: true },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    room: { type: String, default: null },

    isLab: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
