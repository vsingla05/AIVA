import { getEmbedding } from '../ai/getEmbeddings.js'
import { cosineSimilarity } from "./similarity.js";


export async function getSemanticSkillScore(taskSkills, employeeSkills, employeeId) {
  if (!taskSkills?.length || !employeeSkills?.length) return 0;

  let total = 0;
  for (const taskSkill of taskSkills) {
    let bestMatch = 0;
    for (const empSkill of employeeSkills) {
      const [emb1, emb2] = await Promise.all([
        getEmbedding(taskSkill),
        getEmbedding(empSkill, employeeId),
      ]);
      const sim = cosineSimilarity(emb1, emb2);
      if (sim > bestMatch) bestMatch = sim;
    }
    total += bestMatch;
  }

  // Average best matches across all required skills
  return total / taskSkills.length;
}
