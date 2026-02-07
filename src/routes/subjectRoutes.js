import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllSubjects } from "../controllers/subjectController.js";

const router = express.Router();

router.use(protect);
router.get("/", getAllSubjects);

export default router;
