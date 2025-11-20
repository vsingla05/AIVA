export function filterEligibleEmployees(employees, task) {
  const eligible = [];

  for (const emp of employees) {
    if (!emp.isActive) continue;

    // 🏖️ Check if on leave today
    const today = new Date().toDateString();
    const onLeave = emp.availability?.holidays?.some(
      (h) => new Date(h).toDateString() === today
    );

    if (onLeave) {
      console.log(`🚫 ${emp.name} is on leave today`);
      continue;
    }

    // 🧱 Check workload threshold
    const maxHours = emp.availability?.maxWeeklyHours || 40;
    const projectedLoad = (emp.currentLoad || 0) + (task.estimatedHours || 0);

    if (projectedLoad > maxHours * 0.9) {
      console.log(`⚠️ ${emp.name} is overloaded (${projectedLoad}/${maxHours})`);
      continue;
    }

    eligible.push(emp);
  }

  return eligible;
}
