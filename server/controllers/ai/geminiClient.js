import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { taskPrompts } from "./prompts.js";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function runPrompt(promptKey, taskData = {}) {
  const promptTemplate = taskPrompts[promptKey];
  if (!promptTemplate) {
    console.log('promt not found');
    throw new Error(`Prompt ${promptKey} not found`);
  }

  const promptWithData = promptTemplate.replace(
    "{TASK_DATA}",
    JSON.stringify(taskData)
  );

  const result = await model.generateContent(promptWithData);
  return result.response.text().trim();
}
