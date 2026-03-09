const mongoose  = require("mongoose");
const Teacher   = require("../../models/Teacher");
const Subject   = require("../../models/Subject");
const Section   = require("../../models/Section");
const Batch     = require("../../models/Batch");
const Timetable = require("../../models/Timetable");
const Willingness = require("../../models/Willingness");
const TeacherSubject = require("../../models/TeacherSubject");

const { allocateLabs }     = require("./labAllocator");
const { allocateLectures } = require("./lectureAllocator");

/**
 * Main timetable generation function.
 *
 * Flow:
 * 1. Load all approved willingness forms (new semesters structure)
 * 2. Build a roleMap: teacherId → { teacher, subjects[], role }
 * 3. Load sections + batches
 * 4. Phase 1: Allocate lab sessions (labAllocator)
 * 5. Phase 2: Allocate theory lectures (lectureAllocator) with designation limits
 * 6. Conflict check entire result
 * 7. Clear old timetable → insert new entries
 */
async function generateTimetable() {
  console.log("[TT] Starting timetable generation...");

  // ── 1. Load approved willingness forms ───────────────────────
  const willingnessList = await Willingness.find({ status: "approved" })
    .populate("teacherId")
    .populate("semesters.subjects");

  if (!willingnessList.length) {
    throw new Error("No approved willingness forms found. Please approve faculty forms first.");
  }

  console.log(`[TT] Found ${willingnessList.length} approved willingness forms`);

  // ── 2. Build roleMap from TeacherSubject assignments ─────────
  // roleMap: teacherId_string → { teacher, role }
  const assignments = await TeacherSubject.find()
    .populate("teacherId")
    .populate("subjectId");

  const roleMap = new Map();
  for (const a of assignments) {
    if (!a.teacherId || !a.subjectId) continue;
    const tid = a.teacherId._id.toString();
    roleMap.set(tid, {
      teacher: a.teacherId,
      role:    a.role,   // "theory" | "main" | "cofaculty"
    });
  }

  // ── 3. Build subject list from willingness semesters ─────────
  // Each willingness entry has semesters[].subjects[]
  // We flatten these into a workable list with teacherId attached
  const subjectAssignments = []; // { subject, teacher, sem, program }

  for (const w of willingnessList) {
    const teacher = w.teacherId;
    if (!teacher) continue;

    for (const semEntry of w.semesters) {
      for (const subject of semEntry.subjects) {
        if (!subject) continue;
        subjectAssignments.push({
          subject,
          teacher,
          sem:     semEntry.sem,
          program: semEntry.program,
        });
      }
    }
  }

  console.log(`[TT] Total subject assignments from willingness: ${subjectAssignments.length}`);

  // ── 4. Load sections + batches ───────────────────────────────
  const sections = await Section.find();
  const batches  = await Batch.find().populate("sectionId");

  if (!sections.length) {
    throw new Error("No sections found. Please create sections first.");
  }

  // ── 5. Build in-memory timetable + teacher availability ──────
  // Attach availability from willingness to each teacher object
  const teacherAvailabilityMap = new Map();
  for (const w of willingnessList) {
    if (!w.teacherId) continue;
    teacherAvailabilityMap.set(w.teacherId._id.toString(), w.availability);
  }

  // Attach availability to teacher objects used in subjectAssignments
  for (const sa of subjectAssignments) {
    const tid = sa.teacher._id.toString();
    sa.teacher.availability = teacherAvailabilityMap.get(tid) || {};
  }

  // ── 6. Phase 1 — Allocate labs ───────────────────────────────
  console.log("[TT] Phase 1: Allocating lab sessions...");
  const labSubjects = subjectAssignments.filter((sa) => sa.subject.isLab);

  // Group lab subjects by section
  // For labs we need main teacher + cofaculty
  const labEntries = await allocateLabs(
    sections,
    batches,
    labSubjects,
    willingnessList,
    roleMap
  );

  console.log(`[TT] Phase 1 complete: ${labEntries.length} lab entries placed`);

  // ── 7. Phase 2 — Allocate theory lectures ────────────────────
  console.log("[TT] Phase 2: Allocating theory lectures...");
  const theorySubjects = subjectAssignments.filter((sa) => !sa.subject.isLab);

  // Build a subjects array with teacherId attached (for lectureAllocator)
  const theorySubjectDocs = theorySubjects.map((sa) => ({
    ...sa.subject.toObject(),
    teacherId:  sa.teacher._id,
    sem:        sa.sem,
    program:    sa.program,
    sectionId:  sections[0]?._id, // TODO: match section by sem/program properly
  }));

  const teachers = subjectAssignments.map((sa) => sa.teacher);
  // Deduplicate teachers
  const uniqueTeachers = Array.from(
    new Map(teachers.map((t) => [t._id.toString(), t])).values()
  );

  const theoryEntries = await allocateLectures(
    sections,
    theorySubjectDocs,
    uniqueTeachers,
    labEntries,
    roleMap
  );

  console.log(`[TT] Phase 2 complete: ${theoryEntries.length} theory entries placed`);

  // ── 8. Merge + conflict check ─────────────────────────────────
  const allEntries = [...labEntries, ...theoryEntries];

  // Final conflict check — flag any duplicates
  const seen = new Set();
  const clean = [];
  for (const entry of allEntries) {
    const key = `${entry.teacherId}-${entry.day}-${entry.slot}`;
    if (seen.has(key)) {
      console.error(`[CONFLICT] Duplicate entry detected: teacher ${entry.teacherId} at ${entry.day} slot ${entry.slot}`);
      continue; // skip conflicting entry
    }
    seen.add(key);
    clean.push(entry);
  }

  console.log(`[TT] After conflict check: ${clean.length} entries (removed ${allEntries.length - clean.length} conflicts)`);

  // ── 9. Clear old timetable + insert new ──────────────────────
  await Timetable.deleteMany({});
  const inserted = await Timetable.insertMany(clean);

  console.log(`[TT] Done! Inserted ${inserted.length} timetable entries.`);
  return inserted;
}

module.exports = generateTimetable;