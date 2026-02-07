import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// AUTH (public)
app.use("/api/auth", authRoutes);

// ADMIN (protected inside file)
app.use("/api/admin", adminRoutes);

// FACULTY (protected inside file)
app.use("/api/teachers", teacherRoutes);

// OPTIONAL: remove these until you fix them
// app.use("/api/subjects", subjectRoutes);
// app.use("/api/timetable", timetableRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;
