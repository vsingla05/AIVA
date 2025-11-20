import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";
import {classifyEmployeeRejection}  from './classifyEmployeRejection.js'
import { sendAlertEmail } from "../mails/alertMail.js";

export async function handleEmployeeRejectAction(employeeId, taskId, reason, res) {
  try {

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const now = new Date();

    /* --------------------------------------------
       1) Fetch the Task (must be ASSIGNED)
    --------------------------------------------- */
    const task = await Task.findOne({
      _id: taskId,
      employeeId,
      status: "ASSIGNED",
    }).populate("employeeId assignedBy");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not assigned to you.",
      });
    }

    /* --------------------------------------------
       2) LLM Classification
    --------------------------------------------- */
    const classification = await classifyEmployeeRejection(reason);

    /* --------------------------------------------
       3) Fetch Employee
    --------------------------------------------- */
    const employee = await Employee.findById(employeeId);

    employee.taskStats.rejectedTasks += 1; // track attempts

    /* ---------------------------------------------------------
       4) INVALID REJECTION → Penalty + Keep Assigned
    --------------------------------------------------------- */
    if (classification === "INVALID") {
      employee.performance.performanceScore = Math.max(
        0,
        employee.performance.performanceScore - 1
      );

      employee.performance.efficiency = Math.max(
        0,
        employee.performance.efficiency - 0.05
      );

      task.alerts.push({
        message: `Invalid rejection attempt by ${employee.name}. Reason: "${reason}".`,
        level: "ERROR",
        createdAt: now,
      });

      task.status = "IN_PROGRESS"; 

      await employee.save();
      await task.save();

      return res.status(200).json({
        success: true,
        classification,
        message:
          "Invalid rejection. Small penalty applied. Task remains assigned.",
      });
    }

    /* ---------------------------------------------------------
       5) VALID REJECTION → Move to REASSIGNMENT_PENDING
    --------------------------------------------------------- */
    task.status = "REASSIGNMENT_PENDING";

    task.employeeRejection = {
      employeeId,
      reason,
      classification,
      rejectedAt: now,
    };

    task.alerts.push({
      message: `Task rejected by ${employee.name}. Reason: "${reason}" (${classification})`,
      level: "WARNING",
      createdAt: now,
    });

    /* ---------------------------------------------------------
       6) EMAIL NOTIFICATIONS
    --------------------------------------------------------- */
    await sendAlertEmail({
      to: task.assignedBy.email,
      subject: `Task Rejection: ${task.title}`,
      message: `
Employee ${employee.name} has rejected the assigned task.

📌 Reason: ${reason}
🤖 Classification: ${classification}

Manager review is required.
      `,
    });

    await sendAlertEmail({
      to: employee.email,
      subject: "Rejection Submitted",
      message: `Your rejection for task "${task.title}" has been sent to the manager for review.`,
    });

    /* ---------------------------------------------------------
       7) Save all changes
    --------------------------------------------------------- */
    await employee.save();
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Valid rejection submitted. Waiting for manager review.",
      classification,
    });

  } catch (err) {
    console.error("❌ Error in handleRejectByEmployee:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit rejection",
      error: err.message,
    });
  }
}
