import Timetable from "../models/Timetable.js";

export const getSectionTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({
      sectionId: req.params.sectionId
    }).populate("subjectId teacherId");
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBatchTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({
      batchId: req.params.batchId
    }).populate("subjectId teacherId");
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFullDepartmentTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find().populate("subjectId teacherId");
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
