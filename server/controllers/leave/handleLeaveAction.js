import runPrompt from '../llmFunctions/createTask.js'
import Leave from "../../models/employees/leaveModel.js";
import parseFlexibleDate from '../utils/parseDate.js'
import cleanJSON from "../utils/cleanJson.js";
import { processLeaveDecision } from './processLeaveDecisions.js';

export async function handleLeaveAction(command, employeeId) {

  console.log("in handle leave action")
  const rawExtraction = await runPrompt("extractLeaveDetails", {
    user_message: command,
  });

  let extracted;
  try {
    extracted = JSON.parse(cleanJSON(rawExtraction));
  } catch (err) {
    return (
      "I couldn’t clearly understand your leave request.\n" +
      "Please try something like:\n" +
      "“Apply sick leave from tomorrow till Friday due to fever.”"
    );
  }

  const {
    leaveType = "CL",
    reason,
    datePhrases = {},
  } = extracted;

  if (!datePhrases.start) {
    return (
      "Please mention when you want to take leave.\n" +
      "Example: “I want leave from tomorrow to Friday.”"
    );
  }

  /* ---------------------------------------------------
     2️⃣ PARSE DATES USING YOUR FUNCTION
  --------------------------------------------------- */
  const startDate = parseFlexibleDate(datePhrases.start);
  const endDate = parseFlexibleDate(
    datePhrases.end || datePhrases.start
  );

  if (!startDate || !endDate || startDate > endDate) {
    return "The leave dates seem invalid. Please recheck and try again.";
  }

  const days =
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  /* ---------------------------------------------------
     3️⃣ PRIORITY CLASSIFICATION (LLM)
  --------------------------------------------------- */
  const priorityRaw = await runPrompt("classifyLeavePriority", {
    leave_reason: reason || command,
  });

  const priority = priorityRaw
    .replace(/[^A-Z]/gi, "")
    .toUpperCase();

  if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
    return "I couldn’t determine the urgency of your leave. Please try again.";
  }

  /* ---------------------------------------------------
     4️⃣ SAVE LEAVE (SAFE STATE)
  --------------------------------------------------- */
  const leave = await Leave.create({
    employeeId,
    type: leaveType,
    startDate,
    endDate,
    days,
    reason: reason || command,
    priority,
    status: "PENDING",
    managerDecision: "AUTO",
  });


  /* ---------------------------------------------------
     5️⃣ TRIGGER ADVANCED RULE ENGINE (ASYNC HOOK)
     (you will implement this next)
  --------------------------------------------------- */
    processLeaveDecision(leave._id)


  /* ---------------------------------------------------
     6️⃣ USER-FRIENDLY CHAT RESPONSE
  --------------------------------------------------- */
  return (
    "Your leave request has been submitted successfully.\n" +
    `📅 Duration: ${days} day(s)\n` +
    `⚡ Priority: ${priority}\n` +
    "I’m checking workload, task criticality, and leave balance.\n" +
    "I’ll update you once a decision is made."
  );
}
