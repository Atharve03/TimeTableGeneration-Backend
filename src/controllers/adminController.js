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
// ----------------------------------------------------
export const getAllWillingness = async (req, res) => {
  try {
    const data = await Willingness.find()
      .populate("teacherId")
      .populate("subjects");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load willingness forms" });
  }
};


// ----------------------------------------------------
// 6) GET ALL SUBJECTS
// ----------------------------------------------------
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
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
