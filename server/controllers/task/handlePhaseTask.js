import {Task, Employee} from '../../models/employees/index.js'
import calculatePerformanceScore from './calculatePerformanceScore.js';

export async function completePhase(req, res) {
  const { taskId, phaseId} = req.body;
  const employeeId = req.user._id

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const phase = task.phases.id(phaseId);
    if (!phase) return res.status(404).json({ message: "Phase not found" });

    // Mark as completed
    phase.status = "DONE";
    phase.completedAt = new Date();

    // --- Calculate Delay ---
    const due = phase.dueDate.getTime();
    const completed = phase.completedAt.getTime();
    const plannedDuration = due - phase.createdAt.getTime();
    const delayMs = completed - due;

    let delayCategory = "NONE";
    let delayPercent = 0;

    if (delayMs > 0) {
      delayPercent = (delayMs / plannedDuration) * 100;
      if (delayPercent <= 20) delayCategory = "MINOR";
      else delayCategory = "MAJOR";

      // Extend deadline if major
      if (delayCategory === "MAJOR") {
        const extendMs = delayMs * 0.25; // extend 25% of delay
        task.dueDate = new Date(task.dueDate.getTime() + extendMs);
      }
    }

    phase.delayCategory = delayCategory;
    phase.delayPercent = delayPercent;

    // --- Update Employee Performance ---
    const employee = await Employee.findById(employeeId);
    if (employee) {
      employee.performance.completedTasks += 1;

      if (delayCategory === "MINOR") {
        employee.performance.minorDelays += 1;
        employee.performance.delayedTasks += 1;
      } else if (delayCategory === "MAJOR") {
        employee.performance.majorDelays += 1;
        employee.performance.delayedTasks += 1;
      } else {
        // ✅ Completed on time
        employee.performance.onTimeCompletedTask += 1;
      }

      // ✅ Efficiency = on-time completions / total completions
      employee.performance.efficiency =
        employee.performance.completedTasks > 0
          ? employee.performance.onTimeCompletedTask /
            employee.performance.completedTasks
          : 0;

      // ✅ Task completion rate = completed tasks / assigned tasks
      employee.performance.taskCompletionRate =
        employee.totalTaskAssigned > 0
          ? employee.performance.completedTasks / employee.totalTaskAssigned
          : 0;
          await employee.save();
        }
        
    const allDone = task.phases.every((p) => p.status === "DONE");
    if (allDone) {
      task.status = "DONE";
      task.completedAt = new Date();
    }
    await task.save();

    res.status(200).json({ message: "Phase completed", task });
  } catch (err) {
    console.error("Error completing phase:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
