import TeacherSubject from "../models/TeacherSubject.js";
import Willingness   from "../models/Willingness.js";
import Timetable     from "../models/Timetable.js";
import Subject       from "../models/Subject.js";

/* ============================================================
   1. GET ASSIGNED SUBJECTS
   ============================================================ */
export const getAssignedSubjects = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    if (!teacherId)
      return res.status(403).json({ message: "Not linked to a teacher account" });

    const assigned = await TeacherSubject.find({ teacherId }).populate("subjectId");

    const subjects = assigned.map((item) => ({
      _id:     item.subjectId._id,
      name:    item.subjectId.name,
      code:    item.subjectId.code,
      isLab:   item.subjectId.isLab,
      sem:     item.subjectId.sem,
      program: item.subjectId.program,
      weeklyLectures: item.subjectId.weeklyLectures,
      role:    item.role,
    }));

    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch assigned subjects", error: error.message });
  }
};

/* ============================================================
   2. SUBMIT WILLINGNESS FORM
   Accepts EITHER:
     A) New format: { semesters: [{sem, program, subjects:[id,...]}, ...], availability }
     B) Old format: { subjects: [id,...], availability }  (auto-builds semesters)
   ============================================================ */
export const submitWillingness = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    if (!teacherId)
      return res.status(403).json({ message: "No teacher account linked" });

    const { semesters: incomingSemesters, subjects: flatSubjects, availability } = req.body;

    let semesters = [];

    if (incomingSemesters && incomingSemesters.length > 0) {
      // New format — validate each semester has at least 1 subject
      semesters = incomingSemesters.filter((s) => s.subjects && s.subjects.length > 0);
    } else if (flatSubjects && flatSubjects.length > 0) {
      // Old format — build semesters from subject docs
      const subjectDocs = await Subject.find({ _id: { $in: flatSubjects } });
      const semMap = new Map();
      for (const sub of subjectDocs) {
        const key = `${sub.sem}-${sub.program}`;
        if (!semMap.has(key)) semMap.set(key, { sem: sub.sem, program: sub.program, subjects: [] });
        semMap.get(key).subjects.push(sub._id);
      }
      semesters = Array.from(semMap.values());
    }

    if (!semesters.length) {
      return res.status(400).json({ message: "Please select at least one subject before submitting." });
    }

    const form = await Willingness.findOneAndUpdate(
      { teacherId },
      { teacherId, semesters, availability: availability || {}, status: "pending" },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Willingness submitted successfully", form });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   3. GET TIMETABLE FOR LOGGED-IN TEACHER
   ============================================================ */
export const getFacultyTimetable = async (req, res) => {
  try {
    const teacherId = req.user.teacherId;
    if (!teacherId)
      return res.status(403).json({ message: "No teacher linked to this login" });

    const timetable = await Timetable.find({ teacherId })
      .populate("subjectId")
      .populate("batchId")
      .populate("sectionId");

    const formatted = timetable.map((item) => ({
      day:         item.day,
      slot:        item.slot,
      subjectName: item.subjectId?.name,
      subjectCode: item.subjectId?.code,
      section:     item.sectionId?.name || "N/A",
      batch:       item.batchId?.name   || "N/A",
      isLab:       item.isLab,
    }));

    res.json({ success: true, timetable: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch faculty timetable", error: error.message });
  }
};

export const getTeacherSubjects  = getAssignedSubjects;
export const getTeacherTimetable = getFacultyTimetable;