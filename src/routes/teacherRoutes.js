import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getAssignedSubjects,
  submitWillingness,
  getFacultyTimetable
} from "../controllers/teacherController.js";

const router = express.Router();

// FACULTY PROTECTION
router.use(protect);
router.use(authorizeRoles("faculty"));

// GET assigned subjects
router.get("/subjects", getAssignedSubjects);

// submit willingness
router.post("/willingness", submitWillingness);

// timetable
router.get("/timetable", getFacultyTimetable);

export default router;
