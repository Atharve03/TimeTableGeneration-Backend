import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  addTeacher,
  getAllTeachers,
  addSubject,
  getAllSubjects,
  assignSubject,
  setSemester,
  approveWillingness,
  getAllWillingness,
  generateTimetable,
  freezeSemester,
  editTimetable
} from "../controllers/adminController.js";

const router = express.Router();

// ADMIN PROTECTION
router.use(protect);
router.use(authorizeRoles("admin"));

// TEACHERS
router.post("/teachers", addTeacher);
router.get("/teachers", getAllTeachers);

// SUBJECTS
router.post("/subjects", addSubject);
router.get("/subjects", getAllSubjects);

// ASSIGN SUBJECT
router.post("/assign-subject", assignSubject);

// SET SEMESTER
router.post("/set-semester", setSemester);

// WILLINGNESS
router.get("/willingness", getAllWillingness);
router.post("/approve-willingness", approveWillingness);

// TIMETABLE
router.post("/generate-timetable", generateTimetable);
router.post("/freeze-semester", freezeSemester);
router.put("/edit-timetable/:id", editTimetable);

export default router;
