import Teacher from "../../models/Teacher.js";
import Subject from "../../models/Subject.js";
import Batch from "../../models/Batch.js";
import Section from "../../models/Section.js";

import { DAYS, SLOTS_PER_DAY } from "../../utils/constants.js";
import buildAvailabilityMatrix from "./availabilityMatrix.js";
import allocateLabs from "./labAllocator.js";
import allocateLectures from "./lectureAllocator.js";
import Timetable from "../../models/Timetable.js";

export default async function generateTimetable() {
  const teachers = await Teacher.find();
  const subjects = await Subject.find();
  const batches = await Batch.find();
  const availabilityMatrix = await buildAvailabilityMatrix();

  // Add role mapping for each teacher
  const assignments = await (await import("../../models/TeacherSubject.js")).default.find();

  teachers.forEach((t) => {
    t.roleMap = {};
    assignments.forEach((a) => {
      if (a.teacherId.toString() === t._id.toString()) {
        t.roleMap[a.subjectId] = a.role;
      }
    });
  });

  // 🔥 Use dynamic Day Order system
  const days = DAYS;               // ["Day Order 1", ...]
  const slotsPerDay = SLOTS_PER_DAY; // 10

  let timetable = [];

  // 1) LAB ALLOCATION
  timetable = await allocateLabs({
    teachers,
    subjects,
    batches,
    availabilityMatrix,
    days,
    slotsPerDay
  });

  // 2) THEORY ALLOCATION
  timetable = allocateLectures({
    teachers,
    subjects,
    availabilityMatrix,
    days,
    slotsPerDay,
    timetable
  });

  // Save timetable to DB
  await Timetable.deleteMany({});
  await Timetable.insertMany(timetable);

  return timetable;
}
