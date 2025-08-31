import { runPrompt } from "./geminiClient.js";
import { Task } from "../../models/employees/index.js";
import * as chrono from "chrono-node";
import SelectBestEmployee from "./SelectBestEmployee.js";
import sendTaskEmail from '../auth/MailLayout.js'

// Clean AI output to ensure valid JSON
function cleanJSON(aiOutput) {
  return aiOutput
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// Normalize ambiguous deadlines manually
function parseDeadline(deadlineText) {
  if (!deadlineText) return null;

  const now = new Date();

  if (/end of day/i.test(deadlineText)) {
    now.setHours(17, 0, 0, 0);
    return now;
  }

  if (/today afternoon/i.test(deadlineText)) {
    now.setHours(15, 0, 0, 0);
    return now;
  }

  if (/tomorrow/i.test(deadlineText)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (/morning/i.test(deadlineText)) tomorrow.setHours(9, 0, 0, 0);
    else if (/afternoon/i.test(deadlineText)) tomorrow.setHours(15, 0, 0, 0);
    else if (/evening/i.test(deadlineText)) tomorrow.setHours(19, 0, 0, 0);
    else tomorrow.setHours(17, 0, 0, 0);
    return tomorrow;
  }

  const parsed = chrono.parseDate(deadlineText, now, { forwardDate: true });
  if (parsed) return parsed;

  now.setHours(17, 0, 0, 0);
  return now;
}

export default async function HandleChatMessage(req, res) {
  const { command } = req.body;
  const hrId = req.user?._id;

  try {
    // STEP 1: Extract task fields from AI
    const extracted = await runPrompt("extractValues", command);
    const cleaned = cleanJSON(extracted);

    let taskData;
    try {
      taskData = JSON.parse(cleaned);
    } catch (e) {
      return res.json({
        reply:
          "Sorry, I couldn't extract the task details properly. Could you rephrase?",
      });
    }

    console.log("AI extracted task:", taskData);

    // STEP 2: Find latest incomplete task OR create new
    let task = await Task.findOne({
      assignedBy: hrId,
      status: { $ne: "DONE" },
    }).sort({ createdAt: -1 });

    if (!task) task = new Task({ assignedBy: hrId });

    // STEP 3: Merge AI fields
    if (taskData.task) task.title = taskData.task;

    if (taskData.deadline) {
      const parsedDate = parseDeadline(taskData.deadline);
      if (!parsedDate)
        return res.status(400).json({
          reply:
            "Sorry, I couldn't understand the deadline. Please provide a clearer date/time.",
        });
      task.dueDate = parsedDate;
    }

    if (taskData.priority) task.priority = taskData.priority;
    if (taskData.requiredSkills) task.requiredSkills = taskData.requiredSkills;
    if (taskData.estimatedHours) task.estimatedHours = taskData.estimatedHours;

    await task.save();

    // STEP 4: Check missing fields
    const mergedData = {
      task: task.title || "",
      deadline: task.dueDate ? task.dueDate.toISOString() : "",
      priority: task.priority || "",
    };

    const missingCheck = await runPrompt("missingField", mergedData);

    let reply;

    if (missingCheck === "All fields are complete.") {
      // STEP 5: Select best employee
      const { selected: bestEmployee, suggestions } = await SelectBestEmployee(
        task
      );

      // Assign best employee
      task.employeeId = bestEmployee._id;


      // Store fallback employees (excluding best)
      task.fallbackEmployees = suggestions
        .filter((e) => e._id.toString() !== bestEmployee._id.toString())
        .map((e) => e._id);

      await task.save();
      await sendTaskEmail(bestEmployee, task);

      reply = `✅ Task saved successfully: "${task.title}" assigned to ${
        bestEmployee.name
      }.
Fallback employees: ${
        task.fallbackEmployees.length > 0
          ? suggestions
              .filter((e) => e._id.toString() !== bestEmployee._id.toString())
              .map((e) => e.name)
              .join(", ")
          : "None"
      }.
Deadline: ${task.dueDate.toISOString()}, priority: ${
        task.priority
      }, estimated hours: ${task.estimatedHours}.`;
    } else {
      reply = missingCheck;
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Error in HandleChatMessage:", err);
    return res
      .status(500)
      .json({ reply: "Something went wrong while processing your task." });
  }
}
