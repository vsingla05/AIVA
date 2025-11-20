import Employee from '../../models/employees/employeeModel.js'
import { filterEligibleEmployees } from '../utils/filterEligibleEmployee.js'
import { calculateEmployeeScore } from "../utils/calculateEmployeeScore.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Main AI-powered employee selection logic
 */
export async function SelectBestEmployee(task) {
  try {
    console.log("🔍 Fetching employees...");
    const all = await Employee.find({ isActive: true });
    if (!all.length) return { bestEmployee: null, suggestions: [], reasoning: "No employees found." };

    // 1️⃣ Filter unavailable/overloaded employees
    const eligible = filterEligibleEmployees(all, task);
    if (!eligible.length)
      return { bestEmployee: null, suggestions: [], reasoning: "All employees unavailable or overloaded." };

    // 2️⃣ Calculate scores for eligible employees
    const scored = [];
    for (const emp of eligible) {
      const { finalScore, breakdown } = await calculateEmployeeScore(task, emp);
      scored.push({ emp, finalScore, breakdown });
    }

    // 3️⃣ Sort top 5
    scored.sort((a, b) => b.finalScore - a.finalScore);
    const top5 = scored.slice(0, 5);

    // 4️⃣ Ask Gemini to reason on top 5
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an HR AI. Choose the most suitable employee for this task.

Task:
- Title: ${task.title}
- Description: ${task.description}
- Required Skills: ${task.requiredSkills.join(", ")}
- Estimated Hours: ${task.estimatedHours}
- Deadline: ${task.dueDate?.toISOString().split("T")[0]}

Top Candidates:
${top5
  .map(
    (c, i) =>
      `${i + 1}. ${c.emp.name} 
   Skills: ${c.emp.skills.map((s) => `${s.name} (lvl ${s.level})`).join(", ")}
   Final Score: ${c.finalScore.toFixed(2)}
   Performance: ${c.emp.performance?.performanceScore || 0}
   Load: ${c.emp.currentLoad}/${c.emp.availability?.maxWeeklyHours || 40}
`
  )
  .join("\n")}

Return JSON only:
{
  "bestEmployee": "<name>",
  "fallbackEmployees": ["<name1>", "<name2>"],
  "reasoning": "<why you chose them>"
}`;

    const res = await model.generateContent(prompt);
    const text = res.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        bestEmployee: top5[0]?.emp.name,
        fallbackEmployees: top5.slice(1, 3).map((s) => s.emp.name),
        reasoning: "Fallback to top numeric scores due to JSON parsing error.",
      };
    }

    // 5️⃣ Match names
    const best = scored.find(
      (s) => s.emp.name.toLowerCase() === parsed.bestEmployee?.toLowerCase()
    )?.emp;
    const fallbacks =
      parsed.fallbackEmployees
        ?.map(
          (n) =>
            scored.find(
              (s) => s.emp.name.toLowerCase() === n.toLowerCase()
            )?.emp
        )
        .filter(Boolean) || [];

    // 6️⃣ Return result
    return {
      bestEmployee: best || top5[0]?.emp,
      suggestions: fallbacks.length ? fallbacks : top5.slice(1, 3).map((s) => s.emp),
      reasoning: parsed.reasoning || "Selected based on score and Gemini reasoning.",
    };
  } catch (err) {
    console.error("❌ Error in SelectBestEmployee:", err);
    return { bestEmployee: null, suggestions: [], reasoning: "Internal error during selection." };
  }
}
