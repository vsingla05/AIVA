import { Employee } from "../../models/employees/index.js";

// Define skill aliases
const skillAliases = {
  "backend": ["backend development", "node.js", "api development", "java", "spring boot"],
  "frontend": ["frontend development", "react", "angular", "vue", "ui/ux design", "front-end testing"],
  "data analysis": ["data analytics", "excel", "python", "machine learning"],
  "sales": ["negotiation", "client communication", "crm"],
  "marketing": ["advertisement", "seo", "social media", "content creation"]
};

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
    console.log('length is 0');
    return { bestEmployee: null, suggestions: [] };
  }

  // 3. Score each eligible employee
  const scoredEmployees = eligibleEmployees
    .map(emp => {
      let skillScore = 0;
      let matchedSkills = 0;

      if (task.requiredSkills?.length) {
        for (const reqSkill of task.requiredSkills) {
          const reqName = reqSkill.name.toLowerCase();

          const empSkill = emp.skills.find(s => {
            const empName = s.name.toLowerCase();

            // Exact match
            if (empName === reqName) return true;

            // Check aliases
            const aliases = skillAliases[reqName] || [];
            return aliases.includes(empName);
          });

          if (empSkill) {
            matchedSkills++;
            skillScore += 1 + Math.max(0, empSkill.level - reqSkill.level);
          }
        }
      }

      // Normalize skill score
      const maxSkillScore = task.requiredSkills
        ? task.requiredSkills.length * 5
        : 1;
      const normalizedSkill = skillScore / maxSkillScore;

      // Workload score
      const workLoadScore = emp.availability.maxWeeklyHours - emp.currentLoad;
      const normalizedLoad = workLoadScore / emp.availability.maxWeeklyHours;

      // Performance score
      const normalizedPerformance =
        (emp.performance.taskCompletionRate + emp.performance.avgQualityRating) / 2;

      // Weighted sum: skills 50%, performance 30%, workload 20%
      const totalScore =
        normalizedSkill * 0.5 +
        normalizedPerformance * 0.3 +
        normalizedLoad * 0.2;

      return { employee: emp, score: totalScore };
    })
    .filter(e => e !== null);

  if (scoredEmployees.length === 0) {
    console.log('scoredemployee is 0');
    return { bestEmployee: null, suggestions: [] };
  }

  // 4. Sort descending by score
  scoredEmployees.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 5. Select top employee and fallback suggestions
  const highestScore = scoredEmployees[0].score;
  const topEmployees = scoredEmployees.filter(e => e.score === highestScore);

  const bestEmployee = topEmployees[0].employee;
  console.log("selected in bestemployee", bestEmployee);
  const suggestions = scoredEmployees
    .slice(0, 3)
    .map(e => e.employee);

  return { bestEmployee, suggestions };
}
