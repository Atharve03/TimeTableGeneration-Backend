import {
  hasTeacherConflict,
  hasSectionConflict,
  isWithinAvailability
} from "./conflictChecker.js";

export default function allocateLectures({
  teachers,
  subjects,
  availabilityMatrix,
  days,
  slotsPerDay,
  timetable
}) {
  const theorySubjects = subjects.filter((s) => !s.isLab);

  for (const sub of theorySubjects) {

    const assignedTeachers = teachers.filter(
      (t) => t.roleMap[sub._id] === "theory"
    );

    if (!assignedTeachers.length) continue;

    for (const teacher of assignedTeachers) {

      let remaining = sub.weeklyLectures;

      for (const day of days) {
        for (let slot = 1; slot <= slotsPerDay; slot++) {

          if (remaining <= 0) break;

          
          if (hasSectionConflict(timetable, day, slot, sub.sectionId)) continue;

          if (hasTeacherConflict(timetable, day, slot, teacher._id)) continue;

          if (!isWithinAvailability(availabilityMatrix, teacher._id, day, slot))
            continue;

          timetable.push({
            sectionId: sub.sectionId,
            batchId: null,
            day,
            slot,
            subjectId: sub._id,
            teacherId: teacher._id,
            room: "ROOM-01",
            isLab: false
          });

          teacher.assignedLoad += 1;
          remaining--;
        }
      }
    }
  }

  return timetable;
}