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
      // find main + cofaculty from teacher assignments
      const mainTeacher = teachers.find((t) => t.roleMap[lab._id] === "main");
      const coTeacher = teachers.find((t) => t.roleMap[lab._id] === "cofaculty");
  
      if (!mainTeacher || !coTeacher) continue;
  
      for (const batch of batches) {
        let placed = false;
  
        for (const day of days) {
          for (let slot = 1; slot <= slotsPerDay - 1; slot++) {
            const slot2 = slot + 1;
  
            timetable.push({
              day,
              slot,
              subjectId: lab._id,
              teacherId: mainTeacher._id,
              batchId: batch._id,
              isLab: true,
              room: "LAB-1"
            });
  
            timetable.push({
              day,
              slot: slot2,
              subjectId: lab._id,
              teacherId: coTeacher._id,
              batchId: batch._id,
              isLab: true,
              room: "LAB-1"
            });
  
            placed = true;
            break;
          }
          if (placed) break;
        }
      }
    }
  
    return timetable;
  }
  