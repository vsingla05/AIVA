import { model } from "../ai/geminiClient";
import { taskPrompts } from "../ai/prompts";

export async function classifyRejectionSeverity(reason) {
  try {
    const prompt = taskPrompts.classifyRejectionReason.replace("${reason}", reason);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();

    return text.includes("BIG") ? "BIG" : "SMALL";
  } 
  catch (err) {
    console.error("LLM Classification Error:", err.message);
    return "SMALL"; 
  }
}
