export default function calculatePerformanceScore(performance) {
  const {
    completedTasks,
    totalTaskAssigned,
    efficiency,
    avgQualityRating,
    minorDelays,
    majorDelays,
  } = performance;

  // 1. Task Completion Rate
  const taskCompletionRate =
    totalTaskAssigned > 0 ? (completedTasks / totalTaskAssigned) * 100 : 0;

  // 2. Base Timeliness Score
  let timelinessScore = 100;

  // ✅ Penalize delays
  timelinessScore -= minorDelays * 2;  
  timelinessScore -= majorDelays * 5;  
  timelinessScore = Math.max(0, timelinessScore); 
  
  // 3. Efficiency Score
  let efficiencyScore = efficiency * 100;
  efficiencyScore = Math.min(120, Math.max(60, efficiencyScore)); // cap 60–120

  // 4. Quality Score (1–5 scale → 0–100)
  const qualityScore = (avgQualityRating / 5) * 100;

  const consistencyScore = 80;

  const performanceScore =
    taskCompletionRate * 0.3 +
    timelinessScore * 0.25 +
    efficiencyScore * 0.2 +
    qualityScore * 0.2 +
    consistencyScore * 0.05;

  return Math.round(performanceScore);
}
