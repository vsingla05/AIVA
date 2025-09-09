import { model } from "../ai/geminiClient.js";
import { taskPrompts } from "../ai/prompts.js";
import storePhaseData from "../ai/storePhaseData.js";
import { Employee } from "../../models/employees/index.js";
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import {uploadFileFromBuffer} from "../../cloud/cloudinary.js";

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
    const aiText = result.response.text();

    // Extract SECTION B: JSON
    const jsonMatch = aiText.match(/SECTION B: JSON\s*([\s\S]*)/);
    const phases = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : [];

    // Extract SECTION A: REPORT (for PDF)
    const reportMatch = aiText.match(/SECTION A: REPORT([\s\S]*?)SECTION B:/);
    const reportOnly = reportMatch ? reportMatch[1].trim() : aiText;

    console.log('report', reportOnly);

    // Save phases
    const taskPhase = await storePhaseData(phases);

    // Generate PDF from report only
    const pdfUint8Array = await generateTaskPdf(reportOnly);
    const pdfBuffer = Buffer.from(pdfUint8Array); 
    const pdfFileName = `task_${task._id}_${employee._id}.pdf`;
    const pdfUrl = await uploadFileFromBuffer(
      pdfBuffer,
      pdfFileName,
      "Reports"
    );

    console.log("PDF successfully uploaded:", pdfUrl);

    // Update Employee record
    await Employee.findByIdAndUpdate(employee._id, {
      $push: {
        reports: {
          taskId: task._id,
          pdfUrl,
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
