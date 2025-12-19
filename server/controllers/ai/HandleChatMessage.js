import { Task } from "../../models/employees/index.js";
import Employee from "../../models/employees/employeeModel.js";
import parseFlexibleDate from "../utils/parseDate.js";
import cleanJSON from "../utils/cleanJson.js";
import runPrompt from "../llmFunctions/createTask.js";
import calculatePhaseDeadlines from "../utils/calculatePhasesDeadline.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import { uploadFileFromBuffer } from "../../cloud/cloudinary.js";
import { AssignTaskWithAI } from "./assignTaskWithAI.js";
import sendTaskEmail from "../mails/taskMail.js";

export default async function HandleChatMessage(req, res) {
  const { command } = req.body;
  const hrId = req.user?._id;


  try {
    /* STEP 1 — Extract task details */
    let taskData;
    try {
      const extracted = await runPrompt("extractValues", command);
      const cleaned = cleanJSON(extracted);
      taskData = JSON.parse(cleaned);
      console.log("Extracted:", taskData);
    } catch (err) {
      console.error("❌ Error extracting task:", err);
      return res.json({
        reply: "⚠️ Unable to understand the task. Please rephrase.",
      });
    }

    /* STEP 2 — Validate required fields */
    const missing = [];
    if (!taskData.task) missing.push("task title");
    if (!taskData.description) missing.push("task description");
    if (!taskData.deadline) missing.push("deadline");

    if (missing.length) {
      return res.json({ reply: `⚠️ Missing: ${missing.join(", ")}` });
    }

    /* STEP 3 — Parse deadline */
    const parsedDate = parseFlexibleDate(taskData.deadline);
    if (!parsedDate) {
      return res.json({
        reply: "⚠️ Invalid deadline. Example: 'within 5 days', 'next Friday'.",
      });
    }

    /* STEP 4 — Create task */
    const task = new Task({
      assignedBy: hrId,
      title: taskData.task,
      description: taskData.description,
      dueDate: parsedDate,
      priority: taskData.priority || "MEDIUM",
      requiredSkills: taskData.requiredSkills || [],
      estimatedHours: taskData.estimatedHours || 8,
    });

    /* STEP 5 — Phase generation */
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
      } else {
        const llmResp = await runPrompt("generatePhaseContent", {
          taskTitle: task.title,
          taskDescription: task.description,
          taskEstimatedHours: task.estimatedHours,
        });

        const phaseData = JSON.parse(cleanJSON(llmResp));

        task.phases = calculatePhaseDeadlines(
          phaseData,
          task.dueDate,
          task.createdAt
        ).map((p) => ({
          ...p,
          dueDate: new Date(p.phaseEndDate),
        }));
      }
    } catch (err) {
      console.error("Phase generation error:", err);
    }

    /* STEP 6 — AI assignment */
    const assignment = await AssignTaskWithAI(task);
    if (!assignment.success) {
      return res.json({ reply: `⚠️ Assignment failed: ${assignment.message}` });
    }

    const { bestEmployee, fallbacks } = assignment;

    /* STEP 7 — Populate */
    await task.populate([
      { path: "employeeId", select: "name email" },
      { path: "assignedBy", select: "name email" },
    ]);

    /* STEP 8 — Report markdown */
    const reportMarkdown = await runPrompt("generateReport", {
      task: {
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        assignedBy: { name: task.assignedBy?.name },
        employeeId: { name: task.employeeId?.name },
        phases: task.phases,
      },
      TASK_DATA: task,
    });

    /* STEP 9 — PDF GENERATION + CLOUDINARY UPLOAD */
    let pdfMeta = { viewUrl: "", downloadUrl: "" };
    try {
      const pdfBuffer = await generateTaskPdf(reportMarkdown);
      const fileName = `task_${task._id}`;

      pdfMeta = await uploadFileFromBuffer(pdfBuffer, fileName, "AIVA/Reports");

      // Save only strings in Task
      task.pdfUrl = {
        view: pdfMeta.viewUrl,
        download: pdfMeta.downloadUrl,
      };
      await task.save();
    } catch (err) {
      console.error("PDF generation/upload error:", err);
    }

    /* STEP 10 — Push PDF to employee profiles */
    try {
      // BEST employee
      await Employee.findByIdAndUpdate(bestEmployee._id, {
        $push: {
          notifications: {
            message: `A new task (${task.title}) is assigned to you.`,
            pdfUrl: pdfMeta.viewUrl,
            createdAt: new Date(),
            taskId: task._id,
            isRead: false,
          },
        },
      });

      // FALLBACK employees
      for (const fb of fallbacks) {
        await Employee.findByIdAndUpdate(fb._id, {
          $push: {
            reports: {
              taskId: task._id,
              pdfUrl: {
                view: pdfMeta.viewUrl,
                download: pdfMeta.downloadUrl,
              },
              createdAt: new Date(),
            },

            notifications: {
              message: `You are selected as fallback for task (${task.title}).`,
              pdfUrl: pdfMeta.viewUrl,
              createdAt: new Date(),
              taskId: task._id,
              isRead: false,
            },
          },
        });
      }
    } catch (err) {
      console.error("Report push error:", err);
    }

    /* STEP 11 — Send emails AFTER PDF exists */
    try {
      await sendTaskEmail(bestEmployee, task, {
        view: pdfMeta.viewUrl,
        download: pdfMeta.downloadUrl,
      });

      for (const fb of fallbacks) {
        await sendTaskEmail(fb, task, {
          view: pdfMeta.viewUrl,
          download: pdfMeta.downloadUrl,
        });
      }
    } catch (err) {
      console.error("Email sending error:", err);
    }

    // /* STEP 12 — Real-time notify frontend */
    // global.io.to(bestEmployee._id.toString()).emit("newTaskAssigned", {
    //   taskId: task._id,
    //   title: task.title,
    //   description: task.description,
    //   priority: task.priority,
    //   dueDate: task.dueDate,
    //   phases: task.phases,
    //   pdfUrl: pdfMeta,
    //   fallbacks,
    // });

    /* STEP 13 — Reply to HR */
    const fallbackNames = fallbacks.length
      ? fallbacks.map((x) => x.name).join(", ")
      : "None";

    return res.json({
      reply: `✅ Task Created  
- **Title:** ${task.title}  
- **Deadline:** ${task.dueDate.toISOString().split("T")[0]}  
- **Assigned To:** ${bestEmployee.name}  
- **Fallback Employees:** ${fallbackNames}`,
    });
  } catch (err) {
    console.error("💥 Fatal Error:", err);
    return res.status(500).json({
      reply: "❌ An unexpected server error occurred.",
    });
  }
}
