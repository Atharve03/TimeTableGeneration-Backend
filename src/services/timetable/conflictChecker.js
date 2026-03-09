/**
 * conflictChecker.js
 * All conflict checking functions for timetable generation.
 * A "conflict" means two entries share the same day+slot and
 * involve the same teacher OR the same section/batch.
 */

/**
 * Check if a teacher already has a class at a given day + slot.
 * @param {Array}  timetable  - current in-memory timetable entries
 * @param {string} teacherId  - teacher ObjectId as string
 * @param {string} day        - e.g. "Day Order 1"
 * @param {number} slot       - slot number 1-10
 * @returns {boolean}
 */
function hasTeacherConflict(timetable, teacherId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.teacherId?.toString() === teacherId?.toString()
  );
}

/**
 * Check if a section already has a class at a given day + slot.
 */
function hasSectionConflict(timetable, sectionId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.sectionId?.toString() === sectionId?.toString()
  );
}

/**
 * Check if a batch already has a class at a given day + slot.
 */
function hasBatchConflict(timetable, batchId, day, slot) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.batchId?.toString() === batchId?.toString()
  );
}

/**
 * Check teacher availability from willingness matrix.
 * @param {object} teacher  - teacher document (has .availability Map)
 * @param {string} day      - e.g. "Day Order 1"
 * @param {number} slot     - slot number 1-10
 * @returns {boolean} true if teacher is available
 */
function isWithinAvailability(teacher, day, slot) {
  if (!teacher.availability) return false;
  // availability is a Map or plain object
  const slots =
    typeof teacher.availability.get === "function"
      ? teacher.availability.get(day)
      : teacher.availability[day];
  if (!Array.isArray(slots)) return false;
  return slots.includes(slot);
}

/**
 * Full conflict check before placing any entry.
 * Returns true if it is SAFE to place the entry (no conflicts).
 */
function isSafePlacement(timetable, { teacherId, sectionId, batchId, day, slot }) {
  // Teacher conflict — most critical
  if (hasTeacherConflict(timetable, teacherId, day, slot)) return false;

  // Section conflict
  if (sectionId && hasSectionConflict(timetable, sectionId, day, slot)) return false;

  // Batch conflict (for labs)
  if (batchId && hasBatchConflict(timetable, batchId, day, slot)) return false;

  return true;
}

module.exports = {
  hasTeacherConflict,
  hasSectionConflict,
  hasBatchConflict,
  isWithinAvailability,
  isSafePlacement,
};