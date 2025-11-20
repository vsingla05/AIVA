import { getSemanticSkillScore } from "./semanticSkillScore.js";

/**
 * Calculates a composite AI score for an employee given a task.
 * Combines semantic skill match + skill level + experience + performance + workload.
 */
export async function calculateEmployeeScore(task, employee) {
  try {
    // 1️⃣ Semantic Skill Match
    const employeeSkillNames = employee.skills?.map((s) => s.name) || [];
    const semanticSkillScore = await getSemanticSkillScore(
      task.requiredSkills,
      employeeSkillNames,
      employee._id
    );

    // 2️⃣ Average Skill Level (1–5)
    const avgSkillLevel =
      employee.skills?.length > 0
        ? employee.skills.reduce((acc, s) => acc + (s.level || 1), 0) /
          employee.skills.length
        : 1;
    const skillLevelScore = normalize(avgSkillLevel, 1, 5);

    // 3️⃣ Experience (years since joinDate)
    const years = calculateExperienceYears(employee.joinDate);
    const experienceScore = normalize(years, 0, 10);

    // 4️⃣ Performance composite
    const perf = employee.performance || {};
    const completion = perf.taskCompletionRate || 0;
    const quality = perf.avgQualityRating || 0;
    const efficiency = perf.efficiency || 0;

    const performanceScore = normalize(
      completion * 0.4 + quality * 0.4 + efficiency * 0.2,
      0,
      100
    );

    // 5️⃣ Workload (inverse)
    const currentLoad = employee.currentLoad || 0;
    const maxHours = employee.availability?.maxWeeklyHours || 40;
    const workloadScore = 1 - normalize(currentLoad, 0, maxHours);

    // 6️⃣ Availability Bonus (if on leave = penalty)
    const onLeave = checkHoliday(employee.availability?.holidays);
    const availabilityBonus = onLeave ? -0.2 : 0;

    // 7️⃣ Weighted score
    const weights = {
      semantic: 0.35,
      skillLevel: 0.1,
      experience: 0.15,
      performance: 0.25,
      workload: 0.15,
    };

    let finalScore =
      weights.semantic * semanticSkillScore +
      weights.skillLevel * skillLevelScore +
      weights.experience * experienceScore +
      weights.performance * performanceScore +
      weights.workload * workloadScore;

    finalScore = Math.max(0, Math.min(finalScore + availabilityBonus, 1));

    const breakdown = {
      semanticSkillScore: semanticSkillScore.toFixed(2),
      skillLevelScore: skillLevelScore.toFixed(2),
      experienceScore: experienceScore.toFixed(2),
      performanceScore: performanceScore.toFixed(2),
      workloadScore: workloadScore.toFixed(2),
      availabilityBonus,
    };

    return { finalScore, breakdown };
  } catch (err) {
    console.error("❌ Error in calculateEmployeeScore:", err);
    return { finalScore: 0, breakdown: { error: err.message } };
  }
}

function normalize(v, min, max) {
  if (max === min) return 0;
  return Math.min(Math.max((v - min) / (max - min), 0), 1);
}

function calculateExperienceYears(joinDate) {
  if (!joinDate) return 0;
  const now = new Date();
  return (now - new Date(joinDate)) / (1000 * 60 * 60 * 24 * 365);
}

function checkHoliday(holidays = []) {
  const today = new Date().toDateString();
  return holidays.some((h) => new Date(h).toDateString() === today);
}
