import { Task } from "../../models/employees/index.js";
import parseFlexibleDate from "../utils/parseDate.js";
import cleanJSON from "../utils/cleanJson.js";
import runPrompt from "../llmFunctions/createTask.js";
import calculatePhaseDeadlines from "../utils/calculatePhasesDeadline.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import { uploadFileFromBuffer } from "../../cloud/cloudinary.js";
import { AssignTaskWithAI } from "./assignTaskWithAI.js";

export default async function HandleChatMessage(req, res) {
  const { command } = req.body;
  const hrId = req.user?._id;

  try {
    /* ─────────────────────────────
       STEP 1 — Extract task details
    ───────────────────────────── */
    let taskData;
    try {
      const extracted = await runPrompt("extractValues", command);
      const cleaned = cleanJSON(extracted);
      taskData = JSON.parse(cleaned);
      console.log("Extracted:", taskData);
    } catch (err) {
      console.error("❌ Error extracting task:", err);
      return res.json({
        reply:
          "⚠️ I couldn’t extract task details properly. Please rephrase your instructions.",
      });
    }

    /* ─────────────────────────────
       STEP 2 — Validate data
    ───────────────────────────── */
    const missing = [];
    if (!taskData.task) missing.push("task title");
    if (!taskData.description) missing.push("task description");
    if (!taskData.deadline) missing.push("deadline");

    if (missing.length) {
      return res.json({
        reply: `⚠️ Missing details: ${missing.join(", ")}`,
      });
    }

    /* ─────────────────────────────
       STEP 3 — Parse deadline
    ───────────────────────────── */
    const parsedDate = parseFlexibleDate(taskData.deadline);
    if (!parsedDate) {
      return res.json({
        reply:
          "⚠️ I couldn’t understand the deadline. Try: ‘by 12/11/2025’ or ‘next Monday’",
      });
    }

    /* ─────────────────────────────
       STEP 4 — Create task in DB
    ───────────────────────────── */
    const task = new Task({
      assignedBy: hrId,
      title: taskData.task,
      description: taskData.description,
      dueDate: parsedDate,
      priority: taskData.priority || "MEDIUM",
      requiredSkills: taskData.requiredSkills || [],
      estimatedHours: taskData.estimatedHours || 8,
    });

    await task.save();

    /* ─────────────────────────────
       STEP 5 — PHASE GENERATION
    ───────────────────────────── */
    try {
      const totalDays = Math.ceil(
        (task.dueDate - task.createdAt) / (1000 * 60 * 60 * 24)
      );

      if (totalDays <= 2) {
        task.phases = [
          {
            title: task.title,
            description: task.description,
            estimatedEffort: task.estimatedHours,
            dueDate: task.dueDate,
            status: "TODO",
          },
        ];
        await task.save();
      } else {
        const llmResponse = await runPrompt("generatePhaseContent", {
          taskTitle: task.title,
          taskDescription: task.description,
          taskEstimatedHours: task.estimatedHours,
        });

        const phaseData = JSON.parse(cleanJSON(llmResponse));

        task.phases = calculatePhaseDeadlines(
          phaseData,
          task.dueDate,
          task.createdAt
        ).map((p) => ({
          ...p,
          dueDate: new Date(p.phaseEndDate),
        }));

        await task.save();
      }
    } catch (err) {
      console.error("Phase generation error:", err);
    }

    /* ─────────────────────────────
       STEP 6 — ASSIGN EMPLOYEE (AI)
    ───────────────────────────── */
    const assignmentResult = await AssignTaskWithAI(task);

    if (!assignmentResult.success) {
      return res.json({
        reply: `⚠️ Could not assign task automatically: ${assignmentResult.message}`,
      });
    }

    const { bestEmployee, fallbacks, reasoning } = assignmentResult;

    /* ─────────────────────────────
       STEP 7 — POPULATE ASSIGNED TO / BY
    ───────────────────────────── */
    await task.populate([
      { path: "employeeId", select: "name email" },
      { path: "assignedBy", select: "name email" },
    ]);

    /* ─────────────────────────────
       STEP 8 — GENERATE PDF
    ───────────────────────────── */
    let pdfUrl = "";
    try {
      const report = await runPrompt("generateReport", { task });

      const pdfBytes = await generateTaskPdf(report);
      const pdfBuffer = Buffer.from(pdfBytes);
      const fileName = `task_${task._id}.pdf`;

      pdfUrl = await uploadFileFromBuffer(pdfBuffer, fileName, "AIVA/Reports");
      task.pdfUrl = pdfUrl;
      await task.save();
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    global.io.to(bestEmployee._id.toString()).emit("newTaskAssigned", {
      taskId: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      phases: task.phases,
      pdfUrl,
      fallbacks,
    });

    /* ─────────────────────────────
       STEP 9 — RESPONSE BACK TO HR
    ───────────────────────────── */
    return res.json({
      reply: `✅ Task "${task.title}" assigned to ${
        bestEmployee.name
      }.\nFallback employees: ${
        fallbacks?.map((f) => f.name).join(", ") || "None"
      }\nDeadline: ${task.dueDate.toISOString().split("T")[0]}\nPDF: ${
        pdfUrl || "Not generated"
      }`,
    });
  } catch (err) {
    console.error("💥 Fatal error:", err);
    return res.status(500).json({
      reply:
        "❌ Something went wrong while processing your request. Try again later.",
    });
  }
}
