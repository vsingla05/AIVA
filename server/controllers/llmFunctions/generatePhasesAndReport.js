import { model } from "../ai/geminiClient.js";
import { taskPrompts } from "../ai/prompts.js";
import storePhaseData from "../ai/storePhaseData.js";
import { Employee } from "../../models/employees/index.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import uploadFileFromBuffer from "../../cloud/uploadFileFromBuffer.js";

export default async function generatePhasesAndReport(task, employee) {
  try {
    // Prepare the prompt for AI
    const tasksJsonInput =
      task.phases && task.phases.length > 0
        ? JSON.stringify(task.phases)
        : JSON.stringify([{ title: "", description: "", tasks: [] }]);

    const promptWithData = taskPrompts["generatePhaseWiseDeadline"]
      .replace("{{employee_name}}", employee.name)
      .replace("{{employee_email}}", employee.email)
      .replace("{{task_title}}", task.title)
      .replace(
        "{{deadline}}",
        task.deadline?.toISOString().split("T")[0] || "N/A"
      )
      .replace("{{tasks_json}}", tasksJsonInput)
      .replace(
        "{{prompt_extra}}",
        "If no phases are provided, suggest reasonable phases and tasks automatically."
      );

    // Generate the AI content
    const result = await model.generateContent(promptWithData);
    const reportText = result.response.text();
    console.log("report text", reportText);

    // Extract phases from AI response
    const match = reportText.match(/\[.*\]/s);
    const phases = match ? JSON.parse(match[0]) : [];

    const taskPhase = await storePhaseData(phases);

    const pdfBuffer = await generateTaskPdf(reportText);

    // Always include .pdf in filename
    const pdfFileName = `task_${task._id}_${employee._id}.pdf`;
    const pdfUrl = await uploadFileFromBuffer(
      pdfBuffer,
      pdfFileName,
      "Reports"
    );

    console.log("PDF successfully uploaded:", pdfUrl);
    // Save PDF URL in employee document
    await Employee.findByIdAndUpdate(employee._id, {
      $push: {
        reports: {
          taskId: task._id,
          pdfUrl: pdfUrl,
        },
      },
      $inc: { currentLoad: task.estimatedHours || 0 },
    });

    return { taskPhase, phases, pdfUrl };
  } catch (err) {
    console.error("Error running generate text report:", err);
    throw err;
  }
}
