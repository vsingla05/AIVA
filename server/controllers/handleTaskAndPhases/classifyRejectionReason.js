import { aiModel } from "../ai/geminiClient.js";
import { taskPrompts } from "../ai/prompts.js";

export async function classifyRejectionSeverity(reason) {
  try {
    const prompt = taskPrompts.classifyRejectionReason.replace(reason);

    const result = await aiModel.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();

    return text.includes("BIG") ? "BIG" : "SMALL";
  } 
  catch (err) {
    console.error("LLM Classification Error:", err.message);
    return "SMALL"; 
  }
}
