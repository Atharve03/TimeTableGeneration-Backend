export function hasTeacherConflict(timetable, day, slot, teacherId) {
  const count = timetable.filter(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.teacherId.toString() === teacherId.toString()
  ).length;

  // 🔥 Teacher can take MAX 2 simultaneous lectures
  return count >= 2;
}

export function hasBatchConflict(timetable, day, slot, batchId) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.batchId?.toString() === batchId?.toString()
  );
}

export function hasSectionConflict(timetable, day, slot, sectionId) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.sectionId?.toString() === sectionId?.toString()
  );
}

export function hasRoomConflict(timetable, day, slot, room) {
  return timetable.some(
    (entry) =>
      entry.day === day &&
      entry.slot === slot &&
      entry.room === room
  );
}

export function isWithinAvailability(availabilityMatrix, teacherId, day, slot) {
  const teacher = availabilityMatrix[teacherId];
  if (!teacher) return true;

  const available = teacher.availability?.get?.(day);
  return available ? available.includes(slot) : true;
}
