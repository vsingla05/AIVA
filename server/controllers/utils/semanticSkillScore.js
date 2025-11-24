import { getEmbedding } from "../ai/getEmbeddings.js";
import { cosineSimilarity } from "./similarity.js";

function normalizeSkillText(skill) {
  if (typeof skill === "string") return skill.toLowerCase().trim();

  const name = skill.name?.toLowerCase()?.trim() || "";
  const level = skill.level ?? 1;

  return `${name} skill level ${level}`;
}

export async function getSemanticSkillScore(taskSkills, employeeSkills, employeeId) {
  if (!taskSkills?.length || !employeeSkills?.length) return 0;

  let total = 0;

  for (const taskSkill of taskSkills) {
    const taskText = normalizeSkillText(taskSkill);

    let bestMatch = 0;

    for (const empSkill of employeeSkills) {
      const empText = normalizeSkillText(empSkill);

      const [emb1, emb2] = await Promise.all([
        getEmbedding(taskText),                 // Task embedding (string)
        getEmbedding(empText, employeeId),      // Employee cached embedding
      ]);

      const sim = cosineSimilarity(emb1, emb2);

      if (sim > bestMatch) bestMatch = sim;
    }

    total += bestMatch;
  }

  return total / taskSkills.length;
}
