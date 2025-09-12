// --- HandleEmployeePerformance.js ---
import { Task, Employee } from "../../models/employees/index.js";
import calculatePerformanceScore from "./calculatePerformanceScore.js";


export default async function HandleEmployeePerformance(taskId, employeeId) {
  try {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    if (task.proof?.status === "APPROVED") {
      employee.performance.totalTaskAssigned = (employee.performance.totalTaskAssigned || 0) + 1;
      employee.performance.completedTasks = (employee.performance.completedTasks || 0) + 1;

      // On-time vs delayed tasks
      if (task.completedAt && task.dueDate && task.completedAt <= task.dueDate) {
        employee.performance.onTimeCompletedTask = (employee.performance.onTimeCompletedTask || 0) + 1;
      } else {
        employee.performance.delayedTasks = (employee.performance.delayedTasks || 0) + 1;
        // Phase-level minor/major delays already counted
      }

      // Efficiency: estimated vs actual
      if (task.estimatedHours > 0 && task.completedAt) {
        const actualHours = (task.completedAt - task.createdAt) / (1000 * 60 * 60);
        employee.performance.efficiency = task.estimatedHours / Math.max(1, actualHours);
      }

      // Recalculate score
      employee.performance.performanceScore = calculatePerformanceScore(employee.performance);
      await employee.save();
    }

    return true;
  } catch (err) {
    console.error("Error in HandleEmployeePerformance:", err);
    throw err;
  }
}
