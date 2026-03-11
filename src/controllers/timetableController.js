import Timetable from "../models/Timetable.js";
import Teacher   from "../models/Teacher.js";

export const getSectionTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ sectionId: req.params.sectionId })
      .populate("subjectId teacherId sectionId batchId");
    res.json(timetable);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getBatchTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ batchId: req.params.batchId })
      .populate("subjectId teacherId sectionId batchId");
    res.json(timetable);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getFullDepartmentTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find()
      .populate("subjectId teacherId sectionId batchId");
    res.json(timetable);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Get timetable for a specific teacher
// For labs: also include the co-teacher's slot (same subject+day+batch)
// so the full 2-slot lab block shows on the main teacher's timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get all entries where this teacher is assigned
    const myEntries = await Timetable.find({ teacherId })
      .populate("subjectId", "name code isLab weeklyLectures sem program")
      .populate("teacherId", "name designation")
      .populate("sectionId", "name")
      .populate("batchId",   "name")
      .sort({ day: 1, slot: 1 });

    // For each lab entry, also fetch the paired consecutive slot
    // (the other slot belongs to co-teacher but should show on this teacher's view)
    const labEntries = myEntries.filter((e) => e.isLab);
    const pairedSlots = [];

    for (const entry of labEntries) {
      // Find the adjacent slot (slot-1 or slot+1) for the same subject+day+batch
      const paired = await Timetable.findOne({
        subjectId: entry.subjectId._id,
        day:       entry.day,
        batchId:   entry.batchId?._id,
        slot:      { $in: [entry.slot - 1, entry.slot + 1] },
        teacherId: { $ne: teacherId }, // the other teacher's slot
      })
        .populate("subjectId", "name code isLab weeklyLectures sem program")
        .populate("teacherId", "name designation")
        .populate("sectionId", "name")
        .populate("batchId",   "name");

      if (paired) pairedSlots.push(paired);
    }

    // Merge, deduplicate, sort
    const all = [...myEntries, ...pairedSlots];
    const seen = new Set();
    const merged = all
      .filter((e) => { const k = e._id.toString(); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.day.localeCompare(b.day) || a.slot - b.slot);

    res.json(merged);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Get all teachers who have timetable entries with slot counts
export const getTeachersWithTimetable = async (req, res) => {
  try {
    const teacherIds = await Timetable.distinct("teacherId");
    const teachers   = await Teacher.find({ _id: { $in: teacherIds } })
      .select("name designation email")
      .sort({ designation: 1, name: 1 });

    const counts = await Timetable.aggregate([
      { $group: { _id: "$teacherId", total: { $sum: 1 }, labs: { $sum: { $cond: ["$isLab", 1, 0] } } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));

    const result = teachers.map((t) => ({
      ...t.toObject(),
      totalSlots: countMap[t._id.toString()]?.total || 0,
      labSlots:   countMap[t._id.toString()]?.labs  || 0,
    }));

    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
};