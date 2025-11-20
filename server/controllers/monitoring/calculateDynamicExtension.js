export function calculateDynamicExtension(task) {
  // pending phases = phases not completed
  const pendingPhases = task.phases.filter(
    (p) => p.status !== "DONE"
  ).length;

  if (pendingPhases === 0) return null; // No extension needed

  // You can modify the multiplier if needed
  const daysToExtend = pendingPhases * 1; // 1 day per pending phase

  // Extend from today
  const now = new Date();
  const newDeadline = addDays(now, daysToExtend);

  return { newDeadline, daysToExtend, pendingPhases };
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

