export const taskPrompts = {
  missingField: `You are an intelligent assistant for an HR system. 
You receive task data in JSON format with the following fields: 
- "task": description of the task
- "deadline": date by which it must be completed
- "priority": priority level (HIGH, MEDIUM, LOW)

Your job:
1. Check if any field is missing or empty.
2. If a field is missing, generate a polite, human-like message to HR asking them to provide it.
3. If all fields are present, reply with "All fields are complete."

Output only the message, do not add extra explanations.
Here is the actual task data to check:  
{TASK_DATA}
`,

  extractValues: `You are an intelligent assistant for an HR system. 
You will be given a task description in free text format.  

Your job:
1. Extract the following fields clearly:
   - "task": description of the task
   - "deadline": extract the intended deadline in natural language (like "end of day tomorrow", "next Monday afternoon"). 
  Do not worry about ISO format. We will convert it programmatically.
   - "priority": priority level (HIGH, MEDIUM, LOW)
   - "requiredSkills": list of skills needed, each with:
       - "name": skill name (e.g., "Node.js")
       - "level": skill proficiency required (1–5 scale)
       - If the task description does not explicitly mention skills, infer reasonable skills based on the task text.
   - "estimatedHours": estimated number of hours to complete the task
       - If the task description does not mention hours, make a reasonable guess.

2. Always output valid JSON with exactly these keys.

Here is the task data to process:  
{TASK_DATA}`,
};
