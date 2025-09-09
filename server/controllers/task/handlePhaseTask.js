import { Task, Employee } from '../../models/employees/index.js';

export default async function completePhase(req, res) {
  const { taskId, phaseId } = req.body;
  const employeeId = req.user._id;

  try {
    // --- 1️⃣ Fetch task & phase ---
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const phase = task.phases.id(phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    const now = new Date();

    // --- 2️⃣ Mark phase as completed ---
    phase.status = "DONE";
    phase.completedAt = now;

    // --- 3️⃣ Calculate delay ---
    const phaseStart = phase.createdAt || task.createdAt || now;
    const plannedDurationMs = phase.dueDate.getTime() - phaseStart.getTime();
    const delayMs = now.getTime() - phase.dueDate.getTime();

    let delayCategory = "NONE";
    let delayPercent = 0;

    if (delayMs > 0 && plannedDurationMs > 0) {
      delayPercent = (delayMs / plannedDurationMs) * 100;

      if (delayPercent <= 20) delayCategory = "MINOR";
      else delayCategory = "MAJOR";

      if (delayCategory === "MAJOR") {
        // --- 3a️⃣ Proportional redistribution for remaining phases ---
        const phaseIndex = task.phases.findIndex((p) => p._id.equals(phase._id));
        const remainingPhases = task.phases.slice(phaseIndex + 1);

        if (remainingPhases.length > 0) {
          // Calculate total original duration of remaining phases
          let totalRemainingMs = remainingPhases.reduce((sum, p, idx) => {
            const start = idx === 0 ? phase.dueDate.getTime() + 1 : remainingPhases[idx - 1].dueDate.getTime();
            const dur = p.dueDate.getTime() - start;
            return sum + Math.max(dur, 1);
          }, 0);

          // Proportionally extend each remaining phase
          remainingPhases.forEach((p, idx) => {
            const start = idx === 0 ? phase.dueDate.getTime() + 1 : remainingPhases[idx - 1].dueDate.getTime();
            const originalDur = p.dueDate.getTime() - start;
            const proportionalDelay = Math.round((originalDur / totalRemainingMs) * delayMs * 0.25); // 25% of delay
            p.dueDate = new Date(p.dueDate.getTime() + proportionalDelay);
          });

          // Update overall task dueDate to last phase's dueDate
          task.dueDate = new Date(remainingPhases[remainingPhases.length - 1].dueDate);
        } else {
          // No remaining phases, just extend task dueDate
          task.dueDate = new Date(task.dueDate.getTime() + delayMs * 0.25);
        }
      }
    }

    phase.delayCategory = delayCategory;
    phase.delayPercent = Number(delayPercent.toFixed(2));

    // --- 4️⃣ Update employee performance ---
    const employee = await Employee.findById(employeeId);
    if (employee) {
      employee.performance.completedTasks += 1;

      switch (delayCategory) {
        case "MINOR":
          employee.performance.minorDelays += 1;
          employee.performance.delayedTasks += 1;
          break;
        case "MAJOR":
          employee.performance.majorDelays += 1;
          employee.performance.delayedTasks += 1;
          break;
        default:
          employee.performance.onTimeCompletedTask += 1;
      }

      // Efficiency = on-time completions / total completions
      employee.performance.efficiency =
        employee.performance.completedTasks > 0
          ? Number(
              (
                employee.performance.onTimeCompletedTask /
                employee.performance.completedTasks
              ).toFixed(2)
            )
          : 0;

      // Task completion rate = completed / assigned tasks
      employee.performance.taskCompletionRate =
        employee.totalTaskAssigned > 0
          ? Number(
              (
                employee.performance.completedTasks /
                employee.totalTaskAssigned
              ).toFixed(2)
            )
          : 0;

      await employee.save();
    }

    // --- 5️⃣ Update overall task status ---
    const allDone = task.phases.every((p) => p.status === "DONE");
    if (allDone) {
      task.status = "DONE";
      task.completedAt = now;
    }

    await task.save();

    res.status(200).json({ message: "Phase completed successfully", task });
  } catch (err) {
    console.error("Error completing phase:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
