export default function calculatePerformanceScore(performance) {
  const {
    completedTasks = 0,
    totalTaskAssigned = 0,
    efficiency = 1,
    avgQualityRating = 5,
    minorDelays = 0,
    majorDelays = 0,
    onTimeCompletedTask = 0,
  } = performance;

  const taskCompletionRate = totalTaskAssigned > 0 ? (completedTasks / totalTaskAssigned) * 100 : 0;
  let timelinessScore = completedTasks > 0 ? (onTimeCompletedTask / completedTasks) * 100 : 0;

  timelinessScore -= minorDelays * 2;
  timelinessScore -= majorDelays * 5;
  timelinessScore = Math.max(0, timelinessScore);

  let efficiencyScore = efficiency * 100;
  efficiencyScore = Math.min(120, Math.max(60, efficiencyScore));

  const qualityScore = (avgQualityRating / 5) * 100;
  const consistencyScore = 80;

  return Math.round(
    taskCompletionRate * 0.3 +
    timelinessScore * 0.25 +
    efficiencyScore * 0.2 +
    qualityScore * 0.2 +
    consistencyScore * 0.05
  );
}