import { Employee } from "../../models/employees/index.js";

export default async function SelectBestEmployee(task) {
  const employees = await Employee.find({ isActive: true });

  const eligibleEmployees = employees.filter(emp => {
    // 1. Filter out employees on holiday
    const onHoliday = emp.availability.holidays.some(
      d => d.toDateString() === task.dueDate.toDateString()
    );
    if (onHoliday) return false;

    // 2. Filter out employees over max weekly hours
    const remainingHours = emp.availability.maxWeeklyHours - emp.currentLoad;
    if (remainingHours < (task.estimatedHours || 0)) return false;

    return true;
  });

  if (eligibleEmployees.length === 0) {
    return { selected: null, suggestions: [] };
  }

  // 3. Score each eligible employee
  const scoredEmployees = eligibleEmployees.map(emp => {
    // Skill match score
    let skillScore = 0;
    if (task.requiredSkills) {
      for (const reqSkill of task.requiredSkills) {
        const empSkill = emp.skills.find(
          s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
        );
        if (empSkill) {
          skillScore += 1 + Math.max(0, empSkill.level - reqSkill.level);
        }
      }
    }
    // Normalize skill score
    const maxSkillScore = task.requiredSkills ? task.requiredSkills.length * 5 : 1;
    const normalizedSkill = skillScore / maxSkillScore;

    // Workload score (more free hours -> higher score)
    const workLoadScore = emp.availability.maxWeeklyHours - emp.currentLoad;
    const normalizedLoad = workLoadScore / emp.availability.maxWeeklyHours;

    // Performance score
    const normalizedPerformance =
      (emp.performance.taskCompletionRate + emp.performance.avgQualityRating) / 2;

    // Weighted sum: skills 50%, performance 30%, workload 20%
    const totalScore =
      normalizedSkill * 0.5 + normalizedPerformance * 0.3 + normalizedLoad * 0.2;

    return { employee: emp, score: totalScore };
  });

  // 4. Sort descending by score
  scoredEmployees.sort((a, b) => b.score - a.score);

  // 5. Select top employee and fallback suggestions
  const highestScore = scoredEmployees[0].score;
  const topEmployees = scoredEmployees.filter(e => e.score === highestScore);

  const selected = topEmployees[0].employee; 
  const suggestions = scoredEmployees
    .slice(0, 3)
    .map(e => e.employee);

  return { selected, suggestions };
}
