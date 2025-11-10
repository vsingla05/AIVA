import { taskPrompts } from "../ai/prompts.js";
import { model } from "../ai/geminiClient.js";

/**
 * Dynamically replaces placeholders in prompt templates with real values.
 * Works for all prompts (extractValues, generatePhaseContent, generateReport, etc.)
 */
export default async function runPrompt(promptKey, taskData = {}) {
  const promptTemplate = taskPrompts[promptKey];
  if (!promptTemplate) {
    console.error(`❌ Prompt not found: ${promptKey}`);
    throw new Error(`Prompt "${promptKey}" not found in taskPrompts`);
  }

  let promptWithData = promptTemplate;

  // 1️⃣ Automatically replace any {placeholders} that match keys in taskData
  for (const [key, value] of Object.entries(taskData)) {
    const placeholder = new RegExp(`\\{${key}\\}`, "g");
    const replacement =
      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    promptWithData = promptWithData.replace(placeholder, replacement);
  }

  // 2️⃣ Replace {TASK_DATA} fallback with full JSON of the input
  if (promptWithData.includes("{TASK_DATA}")) {
    promptWithData = promptWithData.replace(
      /\{TASK_DATA\}/g,
      JSON.stringify(taskData, null, 2)
    );
  }

  // 3️⃣ Optional: Clean up unfilled placeholders (to avoid confusion for LLM)
  promptWithData = promptWithData.replace(/\{.*?\}/g, ""); // removes unreplaced placeholders

  // 4️⃣ Call model
  const result = await model.generateContent(promptWithData);
  const text = result.response.text().trim();

  return text;
}
