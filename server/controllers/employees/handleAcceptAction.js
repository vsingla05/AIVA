import mongoose from "mongoose";
import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";

export async function handleEmployeeAcceptAction(userId, taskId, res) {
  try {
    const now = new Date();

    /* --------------------------------------------
       1) Find Task (must be ASSIGNED & belongs to employee)
    --------------------------------------------- */
    const task = await Task.findOne({
      _id: taskId,
      employeeId: userId,
      status: "ASSIGNED",
    });

    if (!task) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot accept task. Task may not exist, may not be assigned to you, or is not in ASSIGNED state.",
      });
    }

    /* --------------------------------------------
       2) Find Employee
    --------------------------------------------- */
    const employee = await Employee.findById(userId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    /* --------------------------------------------
       3) CHECK: Did employee accept late?
    --------------------------------------------- */
    const assignedAt = new Date(task.createdAt);
    const diffHours =
      (now.getTime() - assignedAt.getTime()) / (1000 * 60 * 60); // ms → hours

    const ALLOWED_WINDOW_HOURS = 24; // 1-day acceptance window

    if (diffHours > ALLOWED_WINDOW_HOURS) {
      const lateHours = Math.floor(diffHours - ALLOWED_WINDOW_HOURS);

      // Apply small penalty
      employee.performance.performanceScore = Math.max(
        0,
        employee.performance.performanceScore - 1
      );

      employee.performance.efficiency = Math.max(
        0,
        employee.performance.efficiency - 0.05
      );

      // Add task alert
      task.alerts.push({
        message: `Task accepted late by ${lateHours} hour(s).`,
        level: "WARNING",
        createdAt: now,
      });
    }

    /* --------------------------------------------
       4) Update Employee Workload & Stats
    --------------------------------------------- */
    const estimatedHours =
      typeof task.estimatedHours === "number" ? task.estimatedHours : 0;

    // Increase workload
    employee.currentLoad += estimatedHours;

    // Count assigned task
    employee.taskStats.totalTaskAssigned += 1;

    // Mark employee as assigned
    employee.isAssigned = true;

    // Add report log entry
    employee.reports.push({
      taskId: task._id,
      pdfUrl: task.pdfUrl || null,
      createdAt: now,
    });

    await employee.save();

    /* --------------------------------------------
       5) Update Task: status + acceptedAt + alert
    --------------------------------------------- */
    task.status = "IN_PROGRESS";
    task.acceptedAt = now;

    task.alerts.push({
      message: `Task accepted by ${employee.name} (${employee._id}).`,
      level: "INFO",
      createdAt: now,
    });

    task.reassigned = false;

    await task.save();

    /* --------------------------------------------
       6) Response
    --------------------------------------------- */
    return res.status(200).json({
      success: true,
      message: "Task accepted and moved to IN_PROGRESS",
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        pdfUrl: task.pdfUrl,
        phases: task.phases,
        acceptedAt: task.acceptedAt,
      },
      employee: {
        id: employee._id,
        name: employee.name,
      },
    });

  } catch (err) {
    console.error("❌ Error in handleAcceptAction:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to accept task",
      error: err.message,
    });
  }
}
