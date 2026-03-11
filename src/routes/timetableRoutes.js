import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSectionTimetable,
  getBatchTimetable,
  getFullDepartmentTimetable,
  getTeacherTimetable,
  getTeachersWithTimetable,
} from "../controllers/timetableController.js";

const router = express.Router();

router.use(protect);

router.get("/section/:sectionId",   getSectionTimetable);
router.get("/batch/:batchId",       getBatchTimetable);
router.get("/department",           getFullDepartmentTimetable);
router.get("/teachers",             getTeachersWithTimetable);
router.get("/teacher/:teacherId",   getTeacherTimetable);

export default router;