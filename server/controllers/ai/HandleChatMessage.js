import { Task } from "../../models/employees/index.js";
import { Employee } from "../../models/employees/index.js";
import parseDate from "../utils/parseDate.js";
import cleanJSON from "../utils/cleanJson.js";
import SelectBestEmployee from "../ai/SelectBestEmployee.js";
import runPrompt from "../llmFunctions/createTask.js";
import calculatePhaseDeadlines from "../utils/calculatePhasesDeadline.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import { uploadFileFromBuffer } from "../../cloud/cloudinary.js";
import sendTaskEmail from '../mails/taskMail.js'

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
    } catch {
      return res.json({
        reply:
          "Sorry, I couldn't extract the task details properly. Could you rephrase?",
      });
    }

    // STEP 2: Find latest incomplete task OR create new
    let task = await Task.findOne({
      assignedBy: hrId,
      status: { $ne: "DONE" },
    }).sort({ createdAt: -1 });

    if (!task) task = new Task({ assignedBy: hrId });

    // STEP 3: Merge AI fields
    if (taskData.task) task.title = taskData.task;
    if (taskData.deadline) {
      const parsedDate = parseDate(taskData.deadline);
      if (!parsedDate) {
        return res.status(400).json({
          reply:
            "Sorry, I couldn't understand the deadline. Please provide a clearer date/time.",
        });
      }
      task.dueDate = parsedDate;
    }
    if (taskData.priority) task.priority = taskData.priority;
    if (taskData.description) task.description = taskData.description;
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
    if (missingCheck !== "All fields are complete.") {
      return res.json({ reply: missingCheck });
    }

    // STEP 5: Generate phase content
    const phaseContentJSON = await runPrompt("generatePhaseContent", { task });
    const phaseContent = JSON.parse(cleanJSON(phaseContentJSON));

    // STEP 6: Calculate deadlines
    try {
      const phasesWithDeadlines = calculatePhaseDeadlines(
        phaseContent,
        task.dueDate,
        task.createdAt
      );
      task.phases = phasesWithDeadlines;
      await task.save();
    } catch (err) {
      console.error("Error calculating deadlines:", err.message);
    }

    // STEP 7: Select best employee
    let bestEmployee, suggestions;
    try {
      ({ bestEmployee, suggestions } = await SelectBestEmployee(task));
    } catch (err) {
      console.error("Error selecting best employee:", err.message);
      return res.status(500).json({ reply: "Failed to select employee." });
    }

    if (!bestEmployee) {
      return res.status(500).json({ reply: "No suitable employee found." });
    }
    task.employeeId = bestEmployee._id;
   
    await task.save();

    // STEP 8: Generate PDF report and upload
    let pdfUrl = "";
    try {
      const textReport = await runPrompt("generateReport", { task });
      const pdfUint8Array = await generateTaskPdf(textReport);
      const pdfBuffer = Buffer.from(pdfUint8Array);
      const pdfFileName = `task_${task._id}_${bestEmployee._id}.pdf`;
      pdfUrl = await uploadFileFromBuffer(pdfBuffer, pdfFileName, "Reports");
      console.log("PDF uploaded:", pdfUrl);

      // Save PDF in employee's reports array
      bestEmployee.reports.push({
        taskId: task._id,
        pdfUrl,
        createdAt: new Date(),
      });
      bestEmployee.currentLoad += task.estimatedHours || 0;
      bestEmployee.assignedBy = hrId
      await bestEmployee.save();

      // Save PDF URL in task
      task.pdfUrl = pdfUrl;
      await task.save();
    } catch (err) {
      console.error("Error generating/uploading PDF:", err);
    }

    // STEP 9: Save fallback employees
    if (suggestions?.length > 0) {
      task.fallbackEmployees = suggestions
        .filter((e) => e._id.toString() !== bestEmployee._id.toString())
        .map((e) => e._id);
      await task.save();
    }

    // STEP 10: Update employee assignment status
    try {
      bestEmployee.isAssigned = true;
      await bestEmployee.save();
    } catch (err) {
      console.error("Error updating employee assignment:", err);
    }

    // STEP 11: Send email with PDF
    try {
      if (pdfUrl) await sendTaskEmail(bestEmployee, task, pdfUrl);
      console.log("Email sent to:", bestEmployee.email);
    } catch (err) {
      console.error("Error sending email:", err);
    }

    // STEP 12: Construct reply
    const fallbackNames = suggestions
      ?.filter((e) => e._id.toString() !== bestEmployee._id.toString())
      .map((e) => e.name);

    const reply = `✅ Task saved successfully: "${task.title}" assigned to ${
      bestEmployee.name
    }.
Fallback employees: ${
      fallbackNames?.length > 0 ? fallbackNames.join(", ") : "None"
    }.
Deadline: ${task.dueDate ? task.dueDate.toISOString().split("T")[0] : "N/A"}, 
Priority: ${task.priority || "N/A"}, Estimated Hours: ${
      task.estimatedHours || "N/A"
    }.
PDF report: ${pdfUrl ? pdfUrl : "Not generated"}`;

    return res.json({ reply });
  } catch (err) {
    console.error("Error in HandleChatMessage:", err);
    return res
      .status(500)
      .json({ reply: "Something went wrong while processing your task." });
  }
}
