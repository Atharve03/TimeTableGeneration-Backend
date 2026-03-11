/**
 * conflictChecker.js
 * All conflict checking functions for timetable generation.
 */

function hasTeacherConflict(timetable, teacherId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.teacherId?.toString() === teacherId?.toString()
  );
}

function hasSectionConflict(timetable, sectionId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.sectionId?.toString() === sectionId?.toString()
  );
}

function hasBatchConflict(timetable, batchId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.batchId?.toString() === batchId?.toString()
  );
}

function hasRoomConflict(timetable, day, slot, room) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.room === room
  );
}

/**
 * Check teacher availability.
 * Handles Mongoose Map (type: Map), plain object, and native Map.
 * Compares loosely (==) so number 1 matches string "1".
 */
function isWithinAvailability(teacher, day, slot) {
  if (!teacher || !teacher.availability) return false;

  let slots;

  if (typeof teacher.availability.get === "function") {
    // Mongoose Map or native Map
    slots = teacher.availability.get(day);
  } else {
    // Plain object
    slots = teacher.availability[day];
  }

  if (!slots) return false;

  // Convert to array if needed
  const arr = Array.isArray(slots) ? slots : Array.from(slots);

  // Loose equality: slot number 1 matches stored "1" or 1
  return arr.some((s) => s == slot);
}

function isSafePlacement(timetable, { teacherId, sectionId, batchId, day, slot }) {
  if (hasTeacherConflict(timetable, teacherId, day, slot)) return false;
  if (sectionId && hasSectionConflict(timetable, sectionId, day, slot)) return false;
  if (batchId && hasBatchConflict(timetable, batchId, day, slot)) return false;
  return true;
}

export {
  hasTeacherConflict,
  hasSectionConflict,
  hasBatchConflict,
  hasRoomConflict,
  isWithinAvailability,
  isSafePlacement,
};