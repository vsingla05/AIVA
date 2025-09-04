import { taskPrompts } from '../ai/prompts.js'
import {model} from '../ai/geminiClient.js'

export default async function runPrompt(promptKey, taskData = {}) {
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