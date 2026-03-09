import mongoose from "mongoose";
import {
  hasTeacherConflict,
  hasBatchConflict,
  hasSectionConflict,
  hasRoomConflict,
  isWithinAvailability
} from "./conflictChecker.js";

export default async function allocateLabs({
  teachers,
  subjects,
  batches,
  availabilityMatrix,
  days,
  slotsPerDay
}) {
  const timetable = [];
  const labSubjects = subjects.filter((s) => s.isLab);

  for (const lab of labSubjects) {

    const mainTeacher = teachers.find((t) => t.roleMap[lab._id.toString()] === "main");
    const coTeacher   = teachers.find((t) => t.roleMap[lab._id.toString()] === "cofaculty");

    if (!mainTeacher || !coTeacher) {
      console.warn(`Lab "${lab.name}" skipped — missing main or cofaculty teacher.`);
      continue;
    }

    for (const batch of batches) {

      if (!batch.sectionId) {
        console.warn(`Batch has no sectionId — skipping.`);
        continue;
      }

      // ✅ FIX: always convert sectionId to a proper ObjectId
      const sectionId = new mongoose.Types.ObjectId(batch.sectionId.toString());
      const batchId   = new mongoose.Types.ObjectId(batch._id.toString());

      let placed = false;

      for (const day of days) {
        if (placed) break;

        for (let slot = 1; slot <= slotsPerDay - 1; slot++) {
          const slot2 = slot + 1;

          if (!isWithinAvailability(availabilityMatrix, mainTeacher._id.toString(), day, slot))  continue;
          if (!isWithinAvailability(availabilityMatrix, mainTeacher._id.toString(), day, slot2)) continue;
          if (!isWithinAvailability(availabilityMatrix, coTeacher._id.toString(),   day, slot))  continue;
          if (!isWithinAvailability(availabilityMatrix, coTeacher._id.toString(),   day, slot2)) continue;

          if (hasTeacherConflict(timetable, day, slot,  mainTeacher._id)) continue;
          if (hasTeacherConflict(timetable, day, slot2, mainTeacher._id)) continue;
          if (hasTeacherConflict(timetable, day, slot,  coTeacher._id))   continue;
          if (hasTeacherConflict(timetable, day, slot2, coTeacher._id))   continue;

          if (hasBatchConflict(timetable, day, slot,  batchId)) continue;
          if (hasBatchConflict(timetable, day, slot2, batchId)) continue;

          if (hasSectionConflict(timetable, day, slot,  sectionId)) continue;
          if (hasSectionConflict(timetable, day, slot2, sectionId)) continue;

          if (hasRoomConflict(timetable, day, slot,  "LAB-1")) continue;
          if (hasRoomConflict(timetable, day, slot2, "LAB-1")) continue;

          timetable.push({
            sectionId,
            batchId,
            day,
            slot,
            subjectId: new mongoose.Types.ObjectId(lab._id.toString()),
            teacherId: new mongoose.Types.ObjectId(mainTeacher._id.toString()),
            room:      "LAB-1",
            isLab:     true
          });

          timetable.push({
            sectionId,
            batchId,
            day,
            slot:      slot2,
            subjectId: new mongoose.Types.ObjectId(lab._id.toString()),
            teacherId: new mongoose.Types.ObjectId(coTeacher._id.toString()),
            room:      "LAB-1",
            isLab:     true
          });

          placed = true;
          break;
        }
      }

      if (!placed) {
        console.warn(`Lab "${lab.name}" could NOT be placed for batch — no free slots found.`);
      }
    }
  }

  console.log("LAB ALLOCATOR — total entries placed:", timetable.length);
  return timetable;
}