import Willingness from "../../models/Willingness.js";

export default async function buildAvailabilityMatrix() {
  const forms = await Willingness.find().populate("teacherId");

  const matrix = {};

  forms.forEach((form) => {
    const teacherId = form.teacherId._id.toString();

    matrix[teacherId] = {
      availability: form.availability || {},
      preferred: form.preferredSlots || {}
    };
  });

  return matrix;
}
