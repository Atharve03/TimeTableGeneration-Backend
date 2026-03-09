const mongoose = require("mongoose");
const Timetable = require("../../models/Timetable");
const {
  hasTeacherConflict,
  hasSectionConflict,
  isWithinAvailability,
  isSafePlacement,
} = require("./conflictChecker");

// ── Designation-based weekly lecture limits ───────────────────
const LECTURE_LIMITS = {
  "Professor":           7,
  "Associate Professor": 14,
  "Assistant Professor": 18,
};

const DAYS = [
  "Day Order 1",
  "Day Order 2",
  "Day Order 3",
  "Day Order 4",
  "Day Order 5",
];

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Allocate theory lectures for all sections.
 *
 * @param {Array} sections     - Section documents
 * @param {Array} subjects     - Subject documents (theory only, with teacher assigned)
 * @param {Array} teachers     - Teacher documents (with designation + availability)
 * @param {Array} timetable    - Current in-memory timetable (labs already placed)
 * @param {Map}   roleMap      - Map<teacherId_string, { teacher, role }>
 * @returns {Array}            - New theory timetable entries to insert
 */
async function allocateLectures(sections, subjects, teachers, timetable, roleMap) {
  const entries = [];

  // Track weekly lecture count per teacher across ALL sections
  // This persists across sections so limits are global
  const weeklyCount = {};
  teachers.forEach((t) => {
    weeklyCount[t._id.toString()] = 0;
  });

  // Also count lectures already placed (labs count toward limit)
  timetable.forEach((entry) => {
    const tid = entry.teacherId?.toString();
    if (tid && weeklyCount[tid] !== undefined) {
      weeklyCount[tid]++;
    }
  });

  for (const section of sections) {
    // Get theory subjects for this section
    const theorySubjects = subjects.filter(
      (s) => !s.isLab && s.sectionId?.toString() === section._id.toString()
    );

    for (const sub of theorySubjects) {
      // Find assigned theory teacher for this subject
      const assignment = roleMap.get(sub.teacherId?.toString());
      if (!assignment) continue;

      const { teacher } = assignment;
      const teacherId   = teacher._id.toString();
      const limit       = LECTURE_LIMITS[teacher.designation] || 18;
      let placed        = 0;
      const needed      = sub.weeklyLectures || 3;

      // Try to place `needed` lectures across day orders
      outer: for (const day of DAYS) {
        if (placed >= needed) break;

        for (const slot of SLOTS) {
          if (placed >= needed) break outer;

          // Check designation weekly limit
          if (weeklyCount[teacherId] >= limit) {
            console.log(
              `[LIMIT] ${teacher.name} (${teacher.designation}) reached weekly limit of ${limit}`
            );
            break outer;
          }

          // Check all conflicts
          if (
            !isSafePlacement([...timetable, ...entries], {
              teacherId: teacher._id,
              sectionId: section._id,
              batchId:   null,
              day,
              slot,
            })
          ) {
            continue;
          }

          // Check teacher availability from willingness
          if (!isWithinAvailability(teacher, day, slot)) continue;

          // Place the lecture
          const entry = {
            teacherId:  new mongoose.Types.ObjectId(teacherId),
            subjectId:  new mongoose.Types.ObjectId(sub._id.toString()),
            sectionId:  new mongoose.Types.ObjectId(section._id.toString()),
            batchId:    null,
            day,
            slot,
            slot2:      null,
            isLab:      false,
            sem:        sub.sem,
            program:    sub.program,
          };

          entries.push(entry);
          weeklyCount[teacherId]++;
          placed++;
        }
      }

      if (placed < needed) {
        console.warn(
          `[WARN] Could only place ${placed}/${needed} lectures for subject "${sub.name}" ` +
          `(teacher: ${teacher.name}, section: ${section.name})`
        );
      }
    }
  }

  return entries;
}

module.exports = { allocateLectures, LECTURE_LIMITS };