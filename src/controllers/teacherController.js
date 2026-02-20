import TeacherSubject from "../models/TeacherSubject.js";
import Willingness from "../models/Willingness.js";
import Timetable from "../models/Timetable.js";

/* ============================================================
   1. GET ASSIGNED SUBJECTS FOR LOGGED-IN TEACHER
   Route: GET /api/teachers/subjects
   ============================================================ */
export const getAssignedSubjects = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;

    if (!teacherId) {
      return res.status(403).json({ message: "Not linked to a teacher account" });
    }

    const assigned = await TeacherSubject.find({ teacherId })
      .populate("subjectId");

    const subjects = assigned.map((item) => ({
      _id: item.subjectId._id,
      name: item.subjectId.name,
      code: item.subjectId.code,
      role: item.role,
    }));

    res.json({ success: true, subjects });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned subjects",
      error: error.message,
    });
  }
};


/* ============================================================
   2. SUBMIT WILLINGNESS FORM
   Route: POST /api/teachers/willingness
   ============================================================ */
   export const submitWillingness = async (req, res) => {
    try {
      const teacherId = req.user.teacherId;
      const { subjects, availability, semesters, batches } = req.body;
  
      if (!teacherId) {
        return res.status(403).json({ message: "No teacher account linked" });
      }
  
      const form = await Willingness.findOneAndUpdate(
        { teacherId },
        {
          teacherId,
          subjects,
          availability,
          semesters,
          batches,
          status: "pending"
        },
        { new: true, upsert: true }
      );
  
      res.json({
        success: true,
        message: "Willingness submitted successfully",
        form
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

/* ============================================================
   3. GET TIMETABLE FOR LOGGED-IN TEACHER
   Route: GET /api/teachers/timetable
   ============================================================ */
export const getFacultyTimetable = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;

    if (!teacherId) {
      return res.status(403).json({ message: "No teacher linked to this login" });
    }

    const timetable = await Timetable.find({ teacherId })
      .populate("subjectId")
      .populate("batchId");

    const formatted = timetable.map((item) => ({
      dayOrder: item.dayOrder,
      slot: item.slot,
      subjectName: item.subjectId.name,
      subjectCode: item.subjectId.code,
      batch: item.batchId?.name || "N/A",
    }));

    res.json({ success: true, timetable: formatted });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty timetable",
      error: error.message,
    });
  }
};


/* ============================================================
   BACKWARD COMPATIBILITY EXPORTS
   ============================================================ */
export const getTeacherSubjects = getAssignedSubjects;
export const getTeacherTimetable = getFacultyTimetable;
