import { Task, Employee } from "../../models/employees/index.js";
import runPrompt from "../llmFunctions/createTask.js";
import { sendNotification } from '../mails/notificationMail.js'
import { sendAlertToHr } from '../mails/sendAlertToHr.js'

export async function checkOverduePhases() {
  const now = new Date();

  // 1️⃣ Find all incomplete phases
  const tasks = await Task.find({ "phases.status": { $ne: "DONE" } });

  for (const task of tasks) {
    for (const phase of task.phases) {
      if (phase.status === "DONE") continue;

      if (phase.status !== "DONE" && phase.dueDate < new Date() && !phase.notificationsSent.overdueAlert) {
        // --- Calculate delay ---
        const plannedDurationMs = phase.dueDate.getTime() - (phase.createdAt || task.createdAt).getTime();
        const delayMs = now.getTime() - phase.dueDate.getTime();
        let delayCategory = "MINOR";
        const delayPercent = (delayMs / plannedDurationMs) * 100;
        if (delayPercent > 20) delayCategory = "MAJOR";

        // --- Get employee ---
        const employee = await Employee.findById(task.employeeId);
        if (!employee) continue;

        // --- Call agentic AI ---
        const aiResponse = await runPrompt("phaseDelayAdvisor", {
          employeeName: employee.name,
          taskTitle: task.title,
          phaseTitle: phase.title,
          delayCategory,
          delayPercent: delayPercent.toFixed(2),
          dueDate: phase.dueDate.toISOString(),
        });

        await sendNotification(employee._id, aiResponse.employeeMessage);

        // --- Major delay escalation ---
        if (delayCategory === "MAJOR") {
          const hr = await Employee.findOne({assignedBy: task.assignedBy?._id});
          if (hr) await sendAlertToHr(employee, task, phase, delayPercent, hr);
        }
      }
    }
  }
}
