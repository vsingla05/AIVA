import { model } from "../ai/geminiClient.js";
import { taskPrompts } from "./prompts.js";
import storePhaseData from "../ai/storePhaseData.js";
import {Employee} from '../../models/employees/index.js'
import generateTaskPdf from "../pdf/generateTaskPdf.js";
import uploadFileFromPath from "../../cloud/uploadFileFromPath.js";

export default async function generatePhasesAndReport(task, employee) {
  try {
    if (!fs.existsSync("./reports")) fs.mkdirSync("./reports");

    const promptTemplate = taskPrompts["generatePhaseWiseDeadline"];
    const promptWithData = promptTemplate
      .replace("{{employee_name}}", employee.name)
      .replace("{{employee_email}}", employee.email)
      .replace("{{task_title}}", task.title)
      .replace(
        "{{deadline}}",
        task.deadline?.toISOString().split("T")[0] || "N/A"
      )
      .replace("{{tasks_json}}", JSON.stringify(task.phases || []));

    const result = await model.generateContent(promptWithData);
    const reportText = result.response.text();

    const match = reportText.match(/\[.*\]/s);
    const phases = match ? JSON.parse(match[0]) : [];

    const outputPath = `./reports/task_${task._id}_${employee._id}.pdf`;
    await generateTaskPdf(employee.name, employee.email, phases, outputPath);

    const pdfUrl = await uploadFileFromPath(
      outputPath,
      `task_${task._id}_${employee._id}`
    );

    await Employee.findByIdAndUpdate(employee._id, {
      $push: {
        reports: {
          taskId: task._id,
          pdfUrl: pdfUrl,
        },
      },
    });

    await storePhaseData(phases);

    return { reportText, phases, pdfUrl };
  } catch (err) {
    console.error("Error running generate text report:", err);
    throw err;
  }
}