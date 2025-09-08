import { Task, Employee } from "../../models/employees/index.js";
import calculatePerformanceScore from "./calculatePerformanceScore.js";

export default async function CheckTaskStatus(taskId, employeeId) {
  try {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    // --- Update only if approved ---
    if (task.proof?.status === "APPROVED") {
      let scoreChange = 0;

      // Phase scores
      scoreChange += task.phases.filter((p) => p.delayCategory === "NONE").length * 3;
      scoreChange -= task.phases.filter((p) => p.delayCategory === "MINOR").length * 2;
      scoreChange -= task.phases.filter((p) => p.delayCategory === "MAJOR").length * 5;

      // Completion bonus/penalty
      if (task.completedAt <= task.dueDate) scoreChange += 10;
      else scoreChange -= 5;

      employee.performance.performanceScore = Math.max(
        0,
        employee.performance.performanceScore + scoreChange
      );

      // Recalculate other performance stats
      employee.performance = calculatePerformanceScore(employee.performance);

      await employee.save();
    }

    return true;
  } catch (err) {
    console.error("Error in CheckTaskStatus:", err);
    throw err;
  }
}
