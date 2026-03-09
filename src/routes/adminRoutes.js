const express = require("express");
const router  = express.Router();
const {
  addTeacher,
  getTeachers,
  addSubject,
  getSubjects,
  assignSubject,
  setSemester,
  freezeSemester,
  getWillingness,
  approveWillingness,
  generateTimetableHandler,
  getAllTimetables,
  editTimetable,
  deleteTimetable,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes are protected
router.use(protect, adminOnly);

// ── Teachers ──────────────────────────────────────────────────
router.post("/teachers",         addTeacher);
router.get("/teachers",          getTeachers);

// ── Subjects ──────────────────────────────────────────────────
router.post("/subjects",         addSubject);
router.get("/subjects",          getSubjects);   // supports ?program=btech&sem=3

// ── Assignments ───────────────────────────────────────────────
router.post("/assign-subject",   assignSubject);

// ── Semester / Section ────────────────────────────────────────
router.post("/set-semester",     setSemester);
router.post("/freeze-semester/:id", freezeSemester);

// ── Willingness ───────────────────────────────────────────────
router.get("/willingness",       getWillingness);
router.post("/approve-willingness", approveWillingness);

// ── Timetable ─────────────────────────────────────────────────
router.post("/generate-timetable",        generateTimetableHandler);
router.get("/timetable",                  getAllTimetables);        // NEW — list all with search
router.put("/edit-timetable/:id",         editTimetable);
router.delete("/timetable/:id",           deleteTimetable);         // NEW — delete entry

module.exports = router;