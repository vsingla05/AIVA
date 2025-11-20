import Task from "../../models/employees/taskModel.js"; 
import Employee from "../../models/employees/employeeModel.js";
import { sendAlertEmail } from '../mails/alertMail.js';

export async function handleManagerAcceptAction(taskId, employeeId, res) {
  try {
    const now = new Date();

    /* -----------------------------------------------------
       1) Fetch Task + Employee
    ------------------------------------------------------*/
    const task = await Task.findById(taskId).populate("employeeId assignedBy");
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    /* -----------------------------------------------------
       2) Ensure submitted timestamp exists
    ------------------------------------------------------*/
    if (!task.completedAt) task.completedAt = now;

    const submittedAt = new Date(task.completedAt);
    const dueDate = new Date(task.dueDate);

    /* -----------------------------------------------------
       3) Mark Task as Approved
    ------------------------------------------------------*/
    task.status = "DONE";
    task.approvedAt = now;

    task.proof.status = "APPROVED";
    task.proof.reviewedBy = employeeId; 
    task.proof.reviewedAt = now;
    task.proof.message = "Task Approved";

    task.alerts.push({
      message: `Task "${task.title}" has been approved by the manager.`,
      level: "SUCCESS",
      createdAt: now,
    });

    /* -----------------------------------------------------
       4) Delay Calculation
    ------------------------------------------------------*/
    const isLate = submittedAt > dueDate;
    const diffDays = isLate
      ? Math.floor((submittedAt - dueDate) / (1000 * 60 * 60 * 24))
      : 0;

    /* -----------------------------------------------------
       5) Update Employee Task Stats
    ------------------------------------------------------*/
    if (isLate) employee.taskStats.delayedTasks += 1;
    else employee.taskStats.completedTasks += 1;

    if (!employee.taskStats.totalTaskAssigned)
      employee.taskStats.totalTaskAssigned = 1;

    /* -----------------------------------------------------
       6) Task Completion Rate
    ------------------------------------------------------*/
    const { completedTasks, totalTaskAssigned } = employee.taskStats;

    employee.performance.taskCompletionRate =
      (completedTasks / totalTaskAssigned) * 100;

    /* -----------------------------------------------------
       7) Phase Efficiency
    ------------------------------------------------------*/
    const totalPhases =
      employee.taskStats.completedPhaseTasks +
      employee.taskStats.delayedPhaseTasks;

    let efficiencyPercent = 100;

    if (totalPhases > 0) {
      efficiencyPercent =
        (employee.performance.efficiency / totalPhases) * 100;

      efficiencyPercent = Math.min(100, Math.max(0, efficiencyPercent));
    }

    /* -----------------------------------------------------
       8) Task Delay Penalty
    ------------------------------------------------------*/
    let taskPenalty = 0;
    if (isLate) taskPenalty = diffDays <= 2 ? 5 : 10;

    /* -----------------------------------------------------
       9) Hybrid Performance Score (30% phase, 70% task)
    ------------------------------------------------------*/
    const phaseScore = efficiencyPercent;
    const taskScore = 100 - taskPenalty;
    const finalScore = phaseScore * 0.3 + taskScore * 0.7;

    employee.performance.performanceScore = Math.round(finalScore);

    /* -----------------------------------------------------
       10) Reset Employee Assignment & Workload
    ------------------------------------------------------*/
    employee.isAssigned = false;
    employee.currentLoad = 0;

    if (task.estimatedHours) {
      employee.taskStats.totalEstimatedHours -= task.estimatedHours;
      if (employee.taskStats.totalEstimatedHours < 0)
        employee.taskStats.totalEstimatedHours = 0;
    }

    if (task.acceptedAt && task.completedAt) {
      const actualHours =
        (new Date(task.completedAt) - new Date(task.acceptedAt)) /
        (1000 * 60 * 60);

      employee.taskStats.totalActualHours += Math.max(0, actualHours);
    }

    /* -----------------------------------------------------
       11-B) CLEAN UP FALLBACK EMPLOYEES
    ------------------------------------------------------*/
    if (task.fallbackEmployees && task.fallbackEmployees.length > 0) {

      await Employee.updateMany(
        { _id: { $in: task.fallbackEmployees } },
        {
          $pull: {
            reports: { taskId: task._id },
            notifications: { taskId: task._id }
          },
          $set: { isAssigned: false }
        }
      );

      task.fallbackEmployees = [];

      task.alerts.push({
        message: `Fallback employees cleared after manager approval.`,
        level: "INFO",
        createdAt: now,
      });
    }

    /* -----------------------------------------------------
       12) Notify Employee (App Notification + Email)
    ------------------------------------------------------*/
    employee.notifications.push({
      message: `Your task "${task.title}" has been approved.`,
      createdAt: now,
      taskId: task._id,
      isRead: false,
    });

    await sendAlertEmail({
      to: employee.email,
      subject: `Task Approved: ${task.title}`,
      message: `Your task "${task.title}" has been approved by the manager.`,
    });

    /* -----------------------------------------------------
       13) Save Changes
    ------------------------------------------------------*/
    await employee.save();
    await task.save();

    /* -----------------------------------------------------
       14) Response
    ------------------------------------------------------*/
    return res.json({
      success: true,
      message: "Task approved successfully",
      delayByDays: diffDays,
      submittedLate: isLate,
      task,
      performance: employee.performance,
    });

  } catch (err) {
    console.error("❌ Manager Accept Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
