import { getGeminiEmbedding } from "./geminiEmbeddings.js";
import { cosineSimilarity } from "./similarity.js";

/**
 * Compute semantic skill similarity between task and employee.
 * Uses Gemini embeddings to understand related tech (e.g. React ≈ Next.js)
 */
export async function getSemanticSkillScore(taskSkills, employeeSkills) {
  if (!taskSkills?.length || !employeeSkills?.length) return 0;

  let total = 0;
  for (const taskSkill of taskSkills) {
    let bestMatch = 0;
    for (const empSkill of employeeSkills) {
      const [emb1, emb2] = await Promise.all([
        getGeminiEmbedding(taskSkill),
        getGeminiEmbedding(empSkill),
      ]);
      const sim = cosineSimilarity(emb1, emb2);
      if (sim > bestMatch) bestMatch = sim;
    }
    total += bestMatch;
  }

  // Average best matches across all required skills
  return total / taskSkills.length;
}
