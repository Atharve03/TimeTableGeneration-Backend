import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import TeacherSubject from "../models/TeacherSubject.js";
import { DESIGNATION_LOAD } from "../utils/constants.js";

/**
 * Auto-calculate max workload based on designation
 */
export function getMaxLoad(designation) {
  return DESIGNATION_LOAD[designation] || 0;
}

/**
 * Attach subject-role mapping to each teacher
 */
export async function attachTeacherSubjectRoles(teachers) {
  const assignments = await TeacherSubject.find();

  teachers.forEach((t) => {
    t.roleMap = {};
    assignments.forEach((a) => {
      if (a.teacherId.toString() === t._id.toString()) {
        t.roleMap[a.subjectId] = a.role;
      }
    });
  });

  return teachers;
}

/**
 * Build weekly load structure for each teacher
 */
export function initializeTeacherWorkload(teachers) {
  teachers.forEach((teacher) => {
    teacher.assignedLoad = 0;
  });
  return teachers;
}

/**
 * Check if teacher can take another lecture
 */
export function canTeachMore(teacher) {
  return teacher.assignedLoad < teacher.maxLoadPerWeek;
}

/**
 * Helper to get continuous slot pairs
 */
export function findContinuousSlots(slotsPerDay) {
  const pairs = [];
  for (let slot = 1; slot <= slotsPerDay - 1; slot++) {
    pairs.push([slot, slot + 1]);
  }
  return pairs;
}

/**
 * Find teachers assigned to a lab (main + cofaculty)
 */
export function getLabFacultyForSubject(teacherList, subjectId) {
  const main = teacherList.find(
    (t) => t.roleMap[subjectId] === "main"
  );
  const cofaculty = teacherList.find(
    (t) => t.roleMap[subjectId] === "cofaculty"
  );

  return { main, cofaculty };
}

/**
 * Build subject → teacher map for quick lookup
 */
export async function buildSubjectMapping() {
  const subjects = await Subject.find();
  const assignments = await TeacherSubject.find();

  const map = {};
  assignments.forEach((a) => {
    if (!map[a.subjectId]) map[a.subjectId] = [];
    map[a.subjectId].push(a.teacherId);
  });

  return { subjects, map };
}
