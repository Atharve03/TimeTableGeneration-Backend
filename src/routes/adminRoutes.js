import express from "express";
import { protect }        from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  addTeacher, getAllTeachers,
  addSubject, getAllSubjects,
  assignSubject,
  setSemester, getAllSections,
  approveWillingness, getAllWillingness,
  generateTimetableHandler,
  freezeSemester, editTimetable,
  getAllTimetables, deleteTimetable,
  addBatch, getAllBatches, deleteBatch,
  addRoom, getAllRooms, deleteRoom,
} from "../controllers/adminController.js";

const router = express.Router();
router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/teachers",            addTeacher);
router.get("/teachers",             getAllTeachers);

router.post("/subjects",            addSubject);
router.get("/subjects",             getAllSubjects);

router.post("/assign-subject",      assignSubject);

router.post("/set-semester",        setSemester);
router.get("/sections",             getAllSections);

router.post("/batches",             addBatch);
router.get("/batches",              getAllBatches);
router.delete("/batches/:id",       deleteBatch);

router.post("/rooms",               addRoom);
router.get("/rooms",                getAllRooms);
router.delete("/rooms/:id",         deleteRoom);

router.get("/willingness",          getAllWillingness);
router.post("/approve-willingness", approveWillingness);

router.post("/generate-timetable",  generateTimetableHandler);
router.post("/freeze-semester",     freezeSemester);
router.put("/edit-timetable/:id",   editTimetable);
router.get("/timetables",           getAllTimetables);
router.delete("/timetables/:id",    deleteTimetable);

export default router;