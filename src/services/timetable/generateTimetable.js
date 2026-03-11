import mongoose from "mongoose";

import Section        from "../../models/Section.js";
import Batch          from "../../models/Batch.js";
import Timetable      from "../../models/Timetable.js";
import Willingness    from "../../models/Willingness.js";
import TeacherSubject from "../../models/TeacherSubject.js";
import Room           from "../../models/Room.js";

import { allocateLabs }     from "./labAllocator.js";
import { allocateLectures } from "./lectureAllocator.js";

const DAYS = ["Day Order 1","Day Order 2","Day Order 3","Day Order 4","Day Order 5"];

async function generateTimetable() {
  console.log("[TT] Starting timetable generation...");

  const willingnessList = await Willingness.find({ status: "approved" })
    .populate("teacherId")
    .populate("semesters.subjects");

  if (!willingnessList.length)
    throw new Error("No approved willingness forms found.");

  console.log(`[TT] Found ${willingnessList.length} approved willingness forms`);

  const assignments = await TeacherSubject.find()
    .populate("teacherId")
    .populate("subjectId");

  console.log(`[TT] TeacherSubject assignments: ${assignments.length}`);

  const labRoleMap     = new Map();
  const teacherRoleMap = new Map();

  for (const a of assignments) {
    if (!a.teacherId || !a.subjectId) continue;
    const sid = a.subjectId._id.toString();
    const tid = a.teacherId._id.toString();

    if (!labRoleMap.has(sid)) labRoleMap.set(sid, { main: null, cofaculty: null });
    const entry = labRoleMap.get(sid);
    if (a.role === "main")      entry.main      = a.teacherId;
    if (a.role === "cofaculty") entry.cofaculty  = a.teacherId;
    if (a.role === "theory")    entry.main       = a.teacherId;

    teacherRoleMap.set(tid, { teacher: a.teacherId, role: a.role });
  }

  const seenPairs = new Set();
  const subjectAssignments = [];

  for (const w of willingnessList) {
    const teacher = w.teacherId;
    if (!teacher) continue;
    for (const semEntry of w.semesters) {
      for (const subject of semEntry.subjects) {
        if (!subject) continue;
        const key = `${teacher._id}-${subject._id}`;
        if (seenPairs.has(key)) continue;
        seenPairs.add(key);
        subjectAssignments.push({ subject, teacher, sem: semEntry.sem, program: semEntry.program });
      }
    }
  }

  console.log(`[TT] Total subject assignments: ${subjectAssignments.length}`);

  const sections = await Section.find();
  const batches  = await Batch.find().populate("sectionId");
  if (!sections.length) throw new Error("No sections found.");
  console.log(`[TT] Sections: ${sections.length}, Batches: ${batches.length}`);

  // Load admin-defined rooms
  const allRooms   = await Room.find().sort({ name: 1 });
  const theoryRooms = allRooms.filter((r) => r.type === "theory" || r.type === "both").map((r) => r.name);
  const labRooms    = allRooms.filter((r) => r.type === "lab"    || r.type === "both").map((r) => r.name);

  // Fallback if no rooms defined
  const finalTheoryRooms = theoryRooms.length ? theoryRooms : ["ROOM-101","ROOM-102","ROOM-103"];
  const finalLabRooms    = labRooms.length    ? labRooms    : ["LAB-1","LAB-2"];

  console.log(`[TT] Theory rooms: ${finalTheoryRooms.join(", ")}`);
  console.log(`[TT] Lab rooms: ${finalLabRooms.join(", ")}`);

  const uniqueTeachers = Array.from(
    new Map(subjectAssignments.map((sa) => [sa.teacher._id.toString(), sa.teacher])).values()
  );

  // Phase 1 — Labs
  console.log("[TT] Phase 1: Allocating lab sessions...");
  const labSubjects = subjectAssignments.filter((sa) => sa.subject.isLab);
  console.log(`[TT] Lab subjects found: ${labSubjects.length}`);

  let labEntries = [];
  try {
    labEntries = await allocateLabs({
      subjects:    labSubjects.map((sa) => sa.subject),
      batches, sections, labRoleMap,
      labRooms:    finalLabRooms,
      days:        DAYS,
      slotsPerDay: 10,
    });
  } catch (err) {
    console.error("[TT] allocateLabs crashed:", err);
    throw err;
  }
  console.log(`[TT] Phase 1 complete: ${labEntries.length} lab entries placed`);

  // Phase 2 — Theory
  console.log("[TT] Phase 2: Allocating theory lectures...");
  const theorySubjects    = subjectAssignments.filter((sa) => !sa.subject.isLab);
  const theorySubjectDocs = theorySubjects.map((sa) => ({
    ...sa.subject.toObject(),
    teacherId: sa.teacher._id,
    sem:       sa.sem,
    program:   sa.program,
    sectionId: sections[0]?._id,
  }));

  let theoryEntries = [];
  try {
    theoryEntries = await allocateLectures(
      sections, theorySubjectDocs, uniqueTeachers,
      labEntries, teacherRoleMap, finalTheoryRooms
    );
  } catch (err) {
    console.error("[TT] allocateLectures crashed:", err);
    throw err;
  }
  console.log(`[TT] Phase 2 complete: ${theoryEntries.length} theory entries placed`);

  const allEntries = [...labEntries, ...theoryEntries];
  const seenKeys   = new Set();
  const clean      = [];

  for (const entry of allEntries) {
    const key = `${entry.teacherId}-${entry.day}-${entry.slot}`;
    if (seenKeys.has(key)) {
      console.error(`[CONFLICT] teacher ${entry.teacherId} at ${entry.day} slot ${entry.slot}`);
      continue;
    }
    seenKeys.add(key);
    clean.push(entry);
  }

  console.log(`[TT] After conflict check: ${clean.length} entries (removed ${allEntries.length - clean.length} conflicts)`);

  await Timetable.deleteMany({});
  const inserted = await Timetable.insertMany(clean);
  console.log(`[TT] Done! Inserted ${inserted.length} timetable entries.`);
  return inserted;
}

export default generateTimetable;