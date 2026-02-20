import {
  hasTeacherConflict,
  hasBatchConflict,
  hasSectionConflict,
  hasRoomConflict
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

    const mainTeacher = teachers.find((t) => t.roleMap[lab._id] === "main");
    const coTeacher = teachers.find((t) => t.roleMap[lab._id] === "cofaculty");

    if (!mainTeacher || !coTeacher) continue;

    for (const batch of batches) {

      for (const day of days) {
        for (let slot = 1; slot <= slotsPerDay - 1; slot++) {

          const slot2 = slot + 1;

          if (
            hasTeacherConflict(timetable, day, slot, mainTeacher._id) ||
            hasTeacherConflict(timetable, day, slot2, coTeacher._id) ||
            hasBatchConflict(timetable, day, slot, batch._id) ||
            hasRoomConflict(timetable, day, slot, "LAB-1")
          ) continue;

          timetable.push({
            sectionId: batch.sectionId,
            batchId: batch._id,
            day,
            slot,
            subjectId: lab._id,
            teacherId: mainTeacher._id,
            room: "LAB-1",
            isLab: true
          });

          timetable.push({
            sectionId: batch.sectionId,
            batchId: batch._id,
            day,
            slot: slot2,
            subjectId: lab._id,
            teacherId: coTeacher._id,
            room: "LAB-1",
            isLab: true
          });

          break;
        }
      }
    }
  }

  return timetable;
}
