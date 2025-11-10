import { Task } from "../../models/employees/index.js";
import parseFlexibleDate from "../utils/parseDate.js";
import cleanJSON from "../utils/cleanJson.js";
import runPrompt from "../llmFunctions/createTask.js";
import calculatePhaseDeadlines from "../utils/calculatePhasesDeadline.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import { uploadFileFromBuffer } from "../../cloud/cloudinary.js";
import sendTaskEmail from "../mails/taskMail.js";
import { AssignTaskWithAI } from './assignTaskWithAI.js'

export default async function HandleChatMessage(req, res) {
  const { command } = req.body;
  const hrId = req.user?._id;

  try {
    /* ─────────────────────────────
       STEP 1 — Extract basic details
    ───────────────────────────── */
    let taskData;
    try {
      const extracted = await runPrompt("extractValues", command);
      const cleaned = cleanJSON(extracted);
      taskData = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Error extracting task details:", err);
      return res.json({
        reply:
          "😕 I couldn’t understand all task details. Could you describe them more clearly?",
      });
    }

    /* ─────────────────────────────
       STEP 2 — Validate essentials
    ───────────────────────────── */
    const missing = [];
    if (!taskData.task) missing.push("task title");
    if (!taskData.description) missing.push("task description");
    if (!taskData.deadline) missing.push("task deadline");

    if (missing.length) {
      return res.json({
        reply: `⚠️ Missing details: ${missing.join(", ")}. Please provide them.`,
      });
    }

    /* ─────────────────────────────
       STEP 3 — Parse deadline
    ───────────────────────────── */
    const parsedDate = parseFlexibleDate(taskData.deadline);
    if (!parsedDate) {
      return res.json({
        reply:
          "🕓 I couldn’t interpret the deadline. Please say it like ‘by 21/12/2025’ or ‘next Friday evening’.",
      });
    }

    /* ─────────────────────────────
       STEP 4 — Create initial Task
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
       STEP 5 — Generate Phases
    ───────────────────────────── */
    try {
      const llmResponse = await runPrompt("generatePhaseContent", {
        taskTitle: task.title,
        taskDescription: task.description,
        taskEstimatedHours: task.estimatedHours,
      });
      const phaseData = JSON.parse(cleanJSON(llmResponse));

      const totalDays = Math.ceil(
        (task.dueDate.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (totalDays < 3) {
        task.phases = [
          {
            title: "Main Task Phase",
            description:
              "Complete this task directly — no breakdown because of the short duration.",
            estimatedEffort: task.estimatedHours || 8,
            dueDate: task.dueDate,
            status: "TODO",
          },
        ];
      } else {
        task.phases = calculatePhaseDeadlines(phaseData, task.dueDate, task.createdAt);
      }

      await task.save();
    } catch (err) {
      console.error("Phase generation error:", err);
      return res.json({
        reply:
          "🧩 I couldn’t break the task into phases right now. Let’s try again later.",
      });
    }

    /* ─────────────────────────────
       STEP 6 — AI Assignment Engine
    ───────────────────────────── */
    const assignmentResult = await AssignTaskWithAI(task);
    if (!assignmentResult.success) {
      return res.json({
        reply: `🙈 Couldn’t assign task automatically: ${assignmentResult.message}`,
      });
    }

    const { bestEmployee, fallbacks, reasoning } = assignmentResult;

    /* ─────────────────────────────
       STEP 7 — PDF Generation  
    ───────────────────────────── */
    let pdfUrl = "";
    try {
      const report = await runPrompt("generateReport", { task });
      const pdfBytes = await generateTaskPdf(report);
      const pdfBuffer = Buffer.from(pdfBytes);
      const fileName = `task_${task._id}_${bestEmployee._id}.pdf`;

      pdfUrl = await uploadFileFromBuffer(pdfBuffer, fileName, "AIVA/Reports");
      task.pdfUrl = pdfUrl;
      await task.save();
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    /* ─────────────────────────────
       STEP 8 — Email Notifications
    ───────────────────────────── */
    try {
      if (pdfUrl) {
        await sendTaskEmail(bestEmployee, task, pdfUrl);
        for (const fb of fallbacks || []) {
          await sendTaskEmail(fb, task, pdfUrl);
        }
      }
    } catch (err) {
      console.error("Email sending error:", err);
    }

    /* ─────────────────────────────
       STEP 9 — Final HR-friendly reply
    ───────────────────────────── */
    const fallbackNames = fallbacks?.map((f) => f.name).join(", ") || "None";
    const reply = `Task "${task.title}" created and assigned to ${bestEmployee.name}.
    Fallback employees: ${fallbackNames}.
    Deadline: ${task.dueDate.toISOString().split("T")[0]}.
    Reason (chosen by AI): ${reasoning}.
    PDF: ${pdfUrl || "Not generated yet."}`;    

    return res.json({ reply });
  } catch (err) {
    console.error("💥 Fatal error in HandleChatMessage:", err);
    return res.status(500).json({
      reply:
        "😞 Something unexpected happened while handling your request. Please try again shortly.",
    });
  }
}
