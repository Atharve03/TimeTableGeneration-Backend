import mongoose from "mongoose";

const teacherSubjectSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    role: {
      type: String,
      enum: ["main", "cofaculty", "theory"],
      default: "theory"
    }
  },
  { timestamps: true }
);

export default mongoose.model("TeacherSubject", teacherSubjectSchema);
