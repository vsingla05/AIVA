import runPrompt from "../llmFunctions/createTask.js";
import cleanJSON from "../utils/cleanJson.js";

export async function analyzeLeaveImpact(context) {
    console.log("inside analyzeleave")
  const raw = await runPrompt("analyzeLeaveImpact", {
    CONTEXT: JSON.stringify(context, null, 2),
  });

  let parsed;
  try {
    parsed = JSON.parse(cleanJSON(raw));
  } catch (err) {
    // SAFE FALLBACK (never block system)
    return {
      taskImpactLevel: "MEDIUM",
      workloadSeverity: "MEDIUM",
      requiresManagerAttention: true,
      summary: "Unable to fully assess impact; manual review recommended.",
    };
  }

  // ─────────────────────────────
  // HARD GUARDRAILS
  // ─────────────────────────────
  if (!["LOW", "MEDIUM", "HIGH"].includes(parsed.taskImpactLevel)) {
    parsed.taskImpactLevel = "MEDIUM";
  }

  if (!["LOW", "MEDIUM", "HIGH"].includes(parsed.workloadSeverity)) {
    parsed.workloadSeverity = "MEDIUM";
  }

  // Backend-enforced escalation rule
  parsed.requiresManagerAttention =
    ["HIGH", "MEDIUM"].includes(parsed.taskImpactLevel);

  return parsed;
}
