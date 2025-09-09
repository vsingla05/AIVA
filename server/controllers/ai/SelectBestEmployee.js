import { Employee } from "../../models/employees/index.js";
import stringSimilarity from "string-similarity"; // npm install string-similarity

// Skill aliases map
const skillAliases = {
  "backend": ["backend development", "node.js", "api development", "java", "spring boot"],
  "frontend": ["frontend development", "react", "angular", "vue", "ui/ux design", "front-end testing"],
  "data analysis": ["data analytics", "excel", "python", "machine learning"],
  "sales": ["negotiation", "client communication", "crm"],
  "marketing": ["advertisement", "seo", "social media", "content creation"]
};

export default async function SelectBestEmployee(task) {
  const employees = await Employee.find({ isActive: true });

  // 1. Filter eligible employees
  const eligibleEmployees = employees.filter(emp => {
    // Holiday check
    const onHoliday = emp.availability.holidays.some(
      d => d.toDateString() === task.dueDate.toDateString()
    );
    if (onHoliday) return false;

    // Workload check
    const remainingHours = emp.availability.maxWeeklyHours - emp.currentLoad;
    if (remainingHours < (task.estimatedHours || 0)) return false;

    return true;
  });

  if (eligibleEmployees.length === 0) {
    return { bestEmployee: null, suggestions: [] };
  }

  // 2. Score employees
  const scoredEmployees = eligibleEmployees.map(emp => {
    let skillScore = 0;

    if (task.requiredSkills?.length) {
      for (const reqSkill of task.requiredSkills) {
        const reqName = reqSkill.name.toLowerCase();

        let bestMatch = null;
        let bestScore = 0;

        for (const s of emp.skills) {
          const empName = s.name.toLowerCase();

          // Exact match
          if (empName === reqName) {
            bestMatch = s;
            bestScore = 1;
            break;
          }

          // Alias match
          const aliases = skillAliases[reqName] || [];
          if (aliases.includes(empName)) {
            bestMatch = s;
            bestScore = 0.9;
            break;
          }

          // Fuzzy match
          const similarity = stringSimilarity.compareTwoStrings(reqName, empName);
          if (similarity > bestScore) {
            bestMatch = s;
            bestScore = similarity;
          }
        }

        // Score contribution
        if (bestMatch && bestScore > 0.6) { // threshold for "good enough"
          skillScore += (bestScore * 5) + Math.max(0, bestMatch.level - reqSkill.level);
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

    // Weighted sum
    const totalScore =
      normalizedSkill * 0.5 +
      normalizedPerformance * 0.3 +
      normalizedLoad * 0.2;

    return { employee: emp, score: totalScore };
  });

  if (scoredEmployees.length === 0) {
    return { bestEmployee: null, suggestions: [] };
  }

  // 3. Sort by score
  scoredEmployees.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 4. Pick top
  const highestScore = scoredEmployees[0].score;
  const topEmployees = scoredEmployees.filter(e => e.score === highestScore);

  const bestEmployee = topEmployees[0].employee;
  const suggestions = scoredEmployees.slice(0, 3).map(e => e.employee);

  return { bestEmployee, suggestions };
}
