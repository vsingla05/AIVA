// --- HandlePhaseTask.js ---
import { Task, Employee } from "../../models/employees/index.js";
import runPrompt from "../llmFunctions/createTask.js";
import { sendNotification } from "../mails/notificationMail.js";
import { sendAlertToHr } from "../mails/sendAlertToHr.js";

export default async function HandlePhaseTask(req, res) {
  const { id, pid } = req.params;
  const employeeId = req.user._id;

  try {
    // 1️⃣ Fetch task & phase
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const phase = task.phases.id(pid);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    const now = new Date();

    if (phase.status === "DONE")
      return res.status(400).json({ message: "Phase already completed" });

    // 2️⃣ Mark phase as completed
    phase.status = "DONE";
    phase.completedAt = now;

    // 3️⃣ Calculate delay
    const phaseStart = phase.createdAt || task.createdAt || now;
    const plannedDurationMs = phase.dueDate.getTime() - phaseStart.getTime();
    const delayMs = now.getTime() - phase.dueDate.getTime();

    let delayCategory = "NONE";
    let delayPercent = 0;

    if (delayMs > 0 && plannedDurationMs > 0) {
      delayPercent = (delayMs / plannedDurationMs) * 100;
      if (delayPercent <= 20) delayCategory = "MINOR";
      else delayCategory = "MAJOR";

      // 3a️⃣ Proportional redistribution if major delay
      if (delayCategory === "MAJOR") {
        const phaseIndex = task.phases.findIndex((p) =>
          p._id.equals(phase._id)
        );
        const remainingPhases = task.phases.slice(phaseIndex + 1);

        if (remainingPhases.length > 0) {
          let totalRemainingMs = remainingPhases.reduce((sum, p, idx) => {
            const start =
              idx === 0
                ? phase.dueDate.getTime() + 1
                : remainingPhases[idx - 1].dueDate.getTime();
            return sum + Math.max(p.dueDate.getTime() - start, 1);
          }, 0);

          remainingPhases.forEach((p, idx) => {
            const start =
              idx === 0
                ? phase.dueDate.getTime() + 1
                : remainingPhases[idx - 1].dueDate.getTime();
            const originalDur = p.dueDate.getTime() - start;
            const proportionalDelay = Math.min(
              Math.round((originalDur / totalRemainingMs) * delayMs * 0.25),
              7 * 24 * 60 * 60 * 1000
            ); // cap 7 days
            p.dueDate = new Date(p.dueDate.getTime() + proportionalDelay);
          });

          task.dueDate = new Date(
            remainingPhases[remainingPhases.length - 1].dueDate
          );
        } else {
          task.dueDate = new Date(task.dueDate.getTime() + delayMs * 0.25);
        }
      }
    }

    phase.delayCategory = delayCategory;
    phase.delayPercent = Number(delayPercent.toFixed(2));

    // 4️⃣ Update employee phase-level delays
    const employee = await Employee.findById(employeeId);
    if (employee) {
      switch (delayCategory) {
        case "MINOR":
          employee.performance.minorDelays =
            (employee.performance.minorDelays || 0) + 1;
          break;
        case "MAJOR":
          employee.performance.majorDelays =
            (employee.performance.majorDelays || 0) + 1;
          break;
      }
      await employee.save();
    }

    // 5️⃣ Update task status if all phases done
    const allDone = task.phases.every((p) => p.status === "DONE");
    if (allDone) {
      task.status = "DONE";
      task.completedAt = now;
    }

    // 6️⃣ Log task alerts
    const alertMessage = `Phase "${phase.title}" completed by ${
      employee?.name || "N/A"
    } with ${delayCategory} delay (${delayPercent.toFixed(2)}%)`;
    task.alerts.push({
      message: alertMessage,
      level: delayCategory === "MAJOR" ? "CRITICAL" : "INFO",
      createdAt: new Date(),
    });

    await task.save();

    // After calculating delayPercent and delayCategory
    if (
      employee &&
      !phase.notificationsSent.completionDelayAlert &&
      delayCategory !== "NONE"
    ) {
      const aiResponse = await runPrompt("phaseDelayAdvisor", {
        employeeName: employee.name,
        taskTitle: task.title,
        phaseTitle: phase.title,
        delayCategory,
        delayPercent: delayPercent.toFixed(2),
        dueDate: phase.dueDate.toISOString(),
      });

      await sendNotification(employee._id, aiResponse);

      if (delayCategory === "MAJOR") {
        const hr = await Employee.findById({assignedBy: task.assignedBy?._id});
        await sendAlertToHr(employee, task, phase, delayPercent, hr);
      }

      phase.notificationsSent.completionDelayAlert = true;
    }

    res.status(200).json({ message: "Phase completed successfully", task });
  } catch (err) {
    console.error("Error completing phase:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
