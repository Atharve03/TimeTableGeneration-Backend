import {
    hasTeacherConflict,
    hasBatchConflict,
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
  
      if (assignedTeachers.length === 0) continue;
  
      let remaining = sub.weeklyLectures;
  
      for (const teacher of assignedTeachers) {
        for (const day of days) {
          for (let slot = 1; slot <= slotsPerDay; slot++) {
            if (remaining <= 0) break;
  
            if (hasTeacherConflict(timetable, day, slot, teacher._id)) continue;
            if (!isWithinAvailability(availabilityMatrix, teacher._id, day, slot))
              continue;
  
            timetable.push({
              day,
              slot,
              subjectId: sub._id,
              teacherId: teacher._id,
              isLab: false,
              batchId: null,
              room: "ROOM-01"
            });
  
            teacher.assignedLoad += 1;
            remaining -= 1;
          }
        }
      }
    }
  
    return timetable;
  }
  