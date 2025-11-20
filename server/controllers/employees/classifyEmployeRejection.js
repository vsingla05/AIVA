import { model } from '../ai/geminiClient.js'
import { taskPrompts } from '../ai/prompts.js'

export async function classifyEmployeeRejection(reason) {
  const prompt = taskPrompts.classifyEmployeeRejection.replace("{reason}", reason);

  const result = await model.generateContent(prompt);
  const classification = result.response.text().trim();

  return classification;
}
