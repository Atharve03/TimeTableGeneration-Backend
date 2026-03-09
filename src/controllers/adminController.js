import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import TeacherSubject from "../models/TeacherSubject.js";
import Section from "../models/Section.js";
import Willingness from "../models/Willingness.js";
import Timetable from "../models/Timetable.js";

import User from "../models/User.js";               // NEW
import bcrypt from "bcryptjs";                      // NEW

import generateTimetableService from "../services/timetable/generateTimetable.js";



// ----------------------------------------------------
// 1) ADD TEACHER + AUTO CREATE FACULTY  USER ACCOUNT
// ----------------------------------------------------
export const addTeacher = async (req, res) => {
  try {
    const { name, email, designation, priority } = req.body;

    const maxLoad =
      designation === "Professor"
        ? 7
        : designation === "Associate Professor"
        ? 14
        : 18;

    // 1. Create Teacher
    const teacher = await Teacher.create({
      name,
      email,
      designation,
      priority,
      maxLoadPerWeek: maxLoad
    });

    // 2. Create User linked to teacher
    const hashed = await bcrypt.hash(email, 10); // password = email

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "faculty",
      teacherId: teacher._id,
    });

    res.json({
      message: "Teacher + Login created",
      teacher,
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------
// 2) ADD SUBJECT
// ----------------------------------------------------
export const addSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.json({ message: "Subject added", subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 3) ASSIGN SUBJECT TO TEACHER
// ----------------------------------------------------
export const assignSubject = async (req, res) => {
  try {
    const { teacherId, subjectId, role } = req.body;

    const assignment = await TeacherSubject.create({
      teacherId,
      subjectId,
      role
    });

    res.json({ message: "Subject assigned", assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 4) SET SEMESTER
// ----------------------------------------------------
export const setSemester = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.json({ message: "Semester set", section });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 5) GET ALL WILLINGNESS FOR ADMIN VIEW
//    Updated — populates semesters.subjects (new structure)
// ----------------------------------------------------
export const getAllWillingness = async (req, res) => {
  try {
    const data = await Willingness.find()
      .populate("teacherId")
      .populate({
        path:   "semesters.subjects",
        model:  "Subject",
        select: "name code isLab sem program weeklyLectures",
      });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load willingness forms" });
  }
};


// ----------------------------------------------------
// 6) GET ALL SUBJECTS
//    Updated — supports ?program=btech&sem=3 filters
// ----------------------------------------------------
export const getAllSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.program) filter.program = req.query.program;
    if (req.query.sem)     filter.sem     = Number(req.query.sem);

    const subjects = await Subject.find(filter).sort({ program: 1, sem: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};


// ----------------------------------------------------
// 7) GET ALL TEACHERS
// ----------------------------------------------------
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
};


// ----------------------------------------------------
// 8) APPROVE WILLINGNESS
// ----------------------------------------------------
export const approveWillingness = async (req, res) => {
  try {
    const { teacherId } = req.body;

    const form = await Willingness.findOneAndUpdate(
      { teacherId },
      { status: "approved" },
      { new: true }
    );

    res.json({ message: "Willingness approved", form });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 9) GENERATE TIMETABLE
// ----------------------------------------------------
export const generateTimetable = async (req, res) => {
  try {
    const result = await generateTimetableService();
    res.json({ message: "Timetable generated", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 10) FREEZE SEMESTER
// ----------------------------------------------------
export const freezeSemester = async (req, res) => {
  try {
    const { sectionId } = req.body;

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { isFrozen: true },
      { new: true }
    );

    res.json({ message: "Semester timetable frozen", section });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 11) EDIT TIMETABLE
// ----------------------------------------------------
export const editTimetable = async (req, res) => {
  try {
    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: "Timetable updated", updated });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 12) GET ALL TIMETABLES — admin list/grid view  (NEW)
//     Supports ?search=name filter
// ----------------------------------------------------
export const getAllTimetables = async (req, res) => {
  try {
    const entries = await Timetable.find()
      .populate("teacherId",  "name email designation")
      .populate("subjectId",  "name code isLab sem program weeklyLectures")
      .populate("sectionId",  "name")
      .populate("batchId",    "name")
      .sort({ day: 1, slot: 1 });

    const { search } = req.query;
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = entries.filter(
        (e) =>
          e.teacherId?.name?.toLowerCase().includes(q) ||
          e.subjectId?.name?.toLowerCase().includes(q) ||
          e.subjectId?.code?.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ----------------------------------------------------
// 13) DELETE TIMETABLE ENTRY  (NEW)
// ----------------------------------------------------
export const deleteTimetable = async (req, res) => {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Timetable entry not found" });
    }

    res.json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};