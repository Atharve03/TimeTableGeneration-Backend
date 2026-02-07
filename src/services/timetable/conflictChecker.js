export function hasTeacherConflict(timetable, day, slot, teacherId) {
    return timetable.some(
      (entry) =>
        entry.day === day &&
        entry.slot === slot &&
        entry.teacherId.toString() === teacherId.toString()
    );
  }
  
  export function hasBatchConflict(timetable, day, slot, batchId) {
    return timetable.some(
      (entry) =>
        entry.day === day &&
        entry.slot === slot &&
        entry.batchId?.toString() === batchId?.toString()
    );
  }
  
  export function hasRoomConflict(timetable, day, slot, room) {
    return timetable.some(
      (entry) => entry.day === day && entry.slot === slot && entry.room === room
    );
  }
  
  export function isWithinAvailability(availabilityMatrix, teacherId, day, slot) {
    const a = availabilityMatrix[teacherId]?.availability?.get(day);
    return a ? a.includes(slot) : true;
  }
  