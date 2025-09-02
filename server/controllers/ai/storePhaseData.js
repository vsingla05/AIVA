import { Task } from "../../models/employees/index.js";
import { cleanJSON } from "../utils/cleanJson.js";
import { parseDate } from "../utils/parseDate.js";

export default async function storePhaseData(phases) {
  try {
    let phaseTaskData = Array.isArray(phases)
      ? phases
      : JSON.parse(cleanJSON(phases));

    const task = await Task.findOne().sort({createdAt: -1});
    if (!task) throw new Error("Task not found");

    task.phases = phaseTaskData.map((p) => ({
      title: p.title,
      description: p.description,
      dueDate: parseDate(p.dueDate),
      status: p.status,
    }));

    await task.save();
    console.log("Phases saved successfully!");
    return task;
  } catch (e) {
    console.error("Error storing phase data:", e);
    throw e; 
  }
}
