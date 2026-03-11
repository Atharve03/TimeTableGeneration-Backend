import mongoose from "mongoose";
import {
  hasTeacherConflict,
  hasBatchConflict,
  hasSectionConflict,
  hasRoomConflict,
} from "./conflictChecker.js";

export async function allocateLabs({
  subjects, batches, sections, labRoleMap,
  labRooms = ["LAB-1","LAB-2"],
  days, slotsPerDay,
}) {
  const timetable   = [];
  const labSubjects = subjects.filter((s) => s.isLab);

  console.log(`[LAB] Processing ${labSubjects.length} lab subjects, ${batches.length} batches`);

  for (const lab of labSubjects) {
    const sid   = lab._id.toString();
    const roles = labRoleMap.get(sid);

    if (!roles || (!roles.main && !roles.cofaculty)) {
      console.warn(`[LAB] "${lab.name}" skipped — no teacher assigned`);
      continue;
    }

    const mainTeacher = roles.main      || roles.cofaculty;
    const coTeacher   = roles.cofaculty || roles.main;

    console.log(`[LAB] "${lab.name}" — main: ${mainTeacher.name}, co: ${coTeacher.name}`);

    let sectionId, batchId;
    if (batches.length > 0) {
      const batch = batches[0];
      if (!batch.sectionId) { console.warn(`[LAB] Batch has no sectionId`); continue; }
      sectionId = new mongoose.Types.ObjectId(batch.sectionId._id?.toString() || batch.sectionId.toString());
      batchId   = new mongoose.Types.ObjectId(batch._id.toString());
    } else if (sections.length > 0) {
      sectionId = new mongoose.Types.ObjectId(sections[0]._id.toString());
      batchId   = null;
    } else {
      console.warn(`[LAB] No batch or section`); continue;
    }

    let placed = false;

    outer: for (const day of days) {
      for (let slot = 1; slot <= slotsPerDay - 1; slot++) {
        const slot2 = slot + 1;

        if (hasTeacherConflict(timetable, mainTeacher._id, day, slot))  continue;
        if (hasTeacherConflict(timetable, mainTeacher._id, day, slot2)) continue;
        if (hasTeacherConflict(timetable, coTeacher._id,   day, slot))  continue;
        if (hasTeacherConflict(timetable, coTeacher._id,   day, slot2)) continue;
        if (hasSectionConflict(timetable, sectionId, day, slot))  continue;
        if (hasSectionConflict(timetable, sectionId, day, slot2)) continue;
        if (batchId && hasBatchConflict(timetable, batchId, day, slot))  continue;
        if (batchId && hasBatchConflict(timetable, batchId, day, slot2)) continue;

        const room = labRooms.find(
          (r) => !hasRoomConflict(timetable, day, slot, r) && !hasRoomConflict(timetable, day, slot2, r)
        );
        if (!room) continue;

        timetable.push({ sectionId, batchId, day, slot,       subjectId: new mongoose.Types.ObjectId(sid), teacherId: new mongoose.Types.ObjectId(mainTeacher._id.toString()), room, isLab: true });
        timetable.push({ sectionId, batchId, day, slot: slot2, subjectId: new mongoose.Types.ObjectId(sid), teacherId: new mongoose.Types.ObjectId(coTeacher._id.toString()),   room, isLab: true });

        console.log(`[LAB] "${lab.name}" placed at ${day} slots ${slot} & ${slot2} in ${room}`);
        placed = true;
        break outer;
      }
    }

    if (!placed) console.warn(`[LAB] "${lab.name}" could NOT be placed.`);
  }

  console.log("LAB ALLOCATOR — total entries placed:", timetable.length);
  return timetable;
}