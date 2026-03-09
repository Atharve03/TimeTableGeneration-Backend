import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes      from "./routes/authRoutes.js";
import adminRoutes     from "./routes/adminRoutes.js";
import teacherRoutes   from "./routes/teacherRoutes.js";
import subjectRoutes   from "./routes/subjectRoutes.js";    // ✅ ADDED
import timetableRoutes from "./routes/timetableRoutes.js";  // ✅ ADDED

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// AUTH (public)
app.use("/api/auth",      authRoutes);

// ADMIN (protected inside file)
app.use("/api/admin",     adminRoutes);

// FACULTY (protected inside file)
app.use("/api/teachers",  teacherRoutes);

// SUBJECTS (protected inside file)
app.use("/api/subjects",  subjectRoutes);   // ✅ ADDED

// TIMETABLE (protected inside file)
app.use("/api/timetable", timetableRoutes); // ✅ ADDED

app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;