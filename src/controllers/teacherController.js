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
      _id:     item.subjectId._id,
      name:    item.subjectId.name,
      code:    item.subjectId.code,
      isLab:   item.subjectId.isLab,
      sem:     item.subjectId.sem,
      program: item.subjectId.program,
      role:    item.role,
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
   2. SUBMIT WILLINGNESS FORM  (updated — new semesters structure)
   Route: POST /api/teachers/willingness

   Expected body:
   {
     semesters: [
       {
         sem: 3,
         program: "btech",
         subjects: ["subjectId1", "subjectId2"]
       },
       ...
     ],
     availability: {
       "Day Order 1": [1, 2, 3],
       "Day Order 2": [4, 5],
       ...
     }
   }
   ============================================================ */
export const submitWillingness = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    const { semesters, availability } = req.body;

    if (!teacherId) {
      return res.status(403).json({ message: "No teacher account linked" });
    }

    // Validate semesters array
    if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one semester",
      });
    }

    // Validate each semester has subjects selected
    for (const entry of semesters) {
      if (!entry.sem || !entry.program) {
        return res.status(400).json({
          success: false,
          message: "Each semester entry must have sem and program",
        });
      }
      if (!entry.subjects || entry.subjects.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Please select at least one subject for Semester ${entry.sem}`,
        });
      }
    }

    // Upsert — update existing or create new
    // Reset status to "pending" whenever faculty resubmits
    const form = await Willingness.findOneAndUpdate(
      { teacherId },
      {
        teacherId,
        semesters,
        availability: availability || {},
        status: "pending",
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Willingness submitted successfully",
      form,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit willingness",
      error: error.message,
    });
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
      .populate("batchId")
      .populate("sectionId");

    const formatted = timetable.map((item) => ({
      _id:         item._id,
      dayOrder:    item.dayOrder,
      day:         item.day,
      slot:        item.slot,
      isLab:       item.isLab,
      subjectName: item.subjectId?.name,
      subjectCode: item.subjectId?.code,
      subjectId:   item.subjectId,   // full object for frontend grid
      sem:         item.subjectId?.sem,
      program:     item.subjectId?.program,
      batch:       item.batchId?.name || "N/A",
      batchId:     item.batchId,
      sectionId:   item.sectionId,
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
export const getTeacherSubjects  = getAssignedSubjects;
export const getTeacherTimetable = getFacultyTimetable;