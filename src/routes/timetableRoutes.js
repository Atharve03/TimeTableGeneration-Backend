import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSectionTimetable,
  getBatchTimetable,
  getFullDepartmentTimetable
} from "../controllers/timetableController.js";

const router = express.Router();

router.use(protect);

router.get("/section/:sectionId", getSectionTimetable);
router.get("/batch/:batchId", getBatchTimetable);
router.get("/department", getFullDepartmentTimetable);

export default router;
