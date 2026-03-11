import mongoose from "mongoose";

const LECTURE_LIMITS = {
  "Professor":           7,
  "Associate Professor": 14,
  "Assistant Professor": 18,
};

const LAB_LECTURE_COST = 2;
const DAYS  = ["Day Order 1","Day Order 2","Day Order 3","Day Order 4","Day Order 5"];
const SLOTS = [1,2,3,4,5,6,7,8,9,10];

async function allocateLectures(sections, subjects, teachers, existingTimetable, roleMap, rooms = []) {
  const entries     = [];
  const weeklyCount = {};

  const teacherById = new Map();
  teachers.forEach((t) => {
    teacherById.set(t._id.toString(), t);
    weeklyCount[t._id.toString()] = 0;
  });

  // Lab = 2 toward weekly limit
  existingTimetable.forEach((entry) => {
    const tid = entry.teacherId?.toString();
    if (tid && weeklyCount[tid] !== undefined) {
      weeklyCount[tid] += entry.isLab ? LAB_LECTURE_COST : 1;
    }
  });

  // Use admin-defined rooms, fallback to generic if none set
  const theoryRooms = rooms.length ? rooms.map((r) => r.name || r) : ["ROOM-101","ROOM-102","ROOM-103","ROOM-104","ROOM-105"];

  for (const section of sections) {
    const theorySubjects = subjects.filter(
      (s) => !s.isLab && s.sectionId?.toString() === section._id.toString()
    );

    console.log(`[LECTURE] Section: ${section.name}, theory subjects: ${theorySubjects.length}`);

    for (const sub of theorySubjects) {
      const teacherId = sub.teacherId?.toString();
      const teacher   = teacherById.get(teacherId);

      if (!teacher) {
        console.warn(`[LECTURE] No teacher for subject "${sub.name}"`);
        continue;
      }

      const limit  = LECTURE_LIMITS[teacher.designation] || 18;
      const needed = sub.weeklyLectures || 3;
      let placed   = 0;

      console.log(`[LECTURE] Placing ${needed} lectures for "${sub.name}" (teacher: ${teacher.name}, ${teacher.designation}, limit: ${limit})`);

      // Try all day+slot combinations, no per-day restriction
      outer: for (const day of DAYS) {
        for (const slot of SLOTS) {
          if (placed >= needed) break outer;

          if (weeklyCount[teacherId] >= limit) {
            console.log(`[LIMIT] ${teacher.name} hit limit of ${limit}`);
            break outer;
          }

          const allSoFar = [...existingTimetable, ...entries];

          // Teacher conflict
          const teacherBusy = allSoFar.some(
            (e) => e.day === day && e.slot === slot && e.teacherId?.toString() === teacherId
          );
          if (teacherBusy) continue;

          // Section conflict — no 2 subjects in same section at same time
          const sectionBusy = allSoFar.some(
            (e) => e.day === day && e.slot === slot &&
                   e.sectionId?.toString() === section._id.toString()
          );
          if (sectionBusy) continue;

          // Find a free room
          const room = theoryRooms.find(
            (r) => !allSoFar.some((e) => e.day === day && e.slot === slot && e.room === r)
          );
          if (!room) continue;

          entries.push({
            teacherId: new mongoose.Types.ObjectId(teacherId),
            subjectId: new mongoose.Types.ObjectId(sub._id.toString()),
            sectionId: new mongoose.Types.ObjectId(section._id.toString()),
            batchId:   null,
            day, slot, room,
            isLab:   false,
            sem:     sub.sem,
            program: sub.program,
          });

          weeklyCount[teacherId]++;
          placed++;
        }
      }

      if (placed < needed) {
        console.warn(`[WARN] Placed ${placed}/${needed} for "${sub.name}" (${teacher.name})`);
      }
    }
  }

  return entries;
}

export { allocateLectures };