import Task from '../../models/employees/taskModel.js'
import Employee from "../../models/employees/employeeModel.js";
import { sendAlertEmail } from '../mails/alertMail.js';
import dotenv from "dotenv";
import connectDb from "../../ConnectDB.js";
import { calculateDynamicExtension } from "./calculateDynamicExtension.js";

dotenv.config();

export async function runMonitoring() {
  await connectDb();

  const tasks = await Task.find({
    employeeId: { $ne: null },
    status: { $ne: "DONE" },
  }).populate("employeeId assignedBy");

  const now = new Date();

  for (const task of tasks) {
    /* ============================================================
       1) RESUBMISSION DEADLINE CHECK
    ============================================================ */
    if (task.resubmissionDeadline && !task.resubmissionNotified) {
      const resubmitDue = new Date(task.resubmissionDeadline);

      if (now > resubmitDue) {
        const employee = await Employee.findById(task.employeeId);
        const manager = await Employee.findById(task.assignedBy);

        /* 1. Add alert */
        task.alerts.push({
          message: `Resubmission deadline missed (${resubmitDue.toLocaleString()}).`,
          level: "ERROR",
          createdAt: now,
        });

        /* 2. Apply heavy penalty */
        employee.taskStats.delayedTasks += 1;
        employee.performance.performanceScore = Math.max(
          0,
          employee.performance.performanceScore - 5
        );
        employee.performance.efficiency = Math.max(
          0,
          employee.performance.efficiency - 0.2
        );

        await employee.save();

        /* 3. Send emails */
        await Promise.all([
          sendAlertEmail({
            to: employee.email,
            subject: "❌ Missed Resubmission Deadline",
            message: `
You missed the resubmission deadline for task "${task.title}".
Deadline: ${resubmitDue.toLocaleString()}.
This has been recorded as a performance issue.
            `,
          }),

          sendAlertEmail({
            to: manager.email,
            subject: "⚠️ Employee Missed Resubmission Deadline",
            message: `
Employee ${employee.name} missed the resubmission deadline for "${task.title}".
            `,
          }),
        ]);

        /* 4. Prevent multiple notifications */
        task.resubmissionNotified = true;

        await task.save();
        continue; // Skip the rest
      }
    }

    /* ============================================================
       2) TASK DEADLINE CHECK
    ============================================================ */
    if (!task.dueDate) continue;

    const due = new Date(task.dueDate);
    const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

    if (diffDays >= 2) {
      const extension = calculateDynamicExtension(task);

      if (extension) {
        task.dueDate = extension.newDeadline;

        task.alerts.push({
          message: `Task deadline extended by ${extension.daysToExtend} day(s).`,
          level: "INFO",
          createdAt: now,
        });

        /* Penalty for task delay (mild) */
        const employee = await Employee.findById(task.employeeId);

        employee.taskStats.delayedTasks += 1;
        employee.performance.performanceScore = Math.max(
          0,
          employee.performance.performanceScore - 2
        );
        employee.performance.efficiency = Math.max(
          0,
          employee.performance.efficiency - 0.1
        );

        await employee.save();
      }

      task.taskDelay.isDelayed = true;
      task.taskDelay.delayDays = diffDays;

      if (!task.taskDelay.delayNotified) {
        await Promise.all([
          sendAlertEmail({
            to: task.employeeId.email,
            subject: "⚠️ Task Delayed",
            message: `Your task "${task.title}" is delayed.`,
          }),
          sendAlertEmail({
            to: task.assignedBy.email,
            subject: "⚠️ Task Delay Alert",
            message: `Task "${task.title}" is delayed.`,
          }),
        ]);

        task.taskDelay.delayNotified = true;
      }

      await task.save();
      continue;
    }

    /* ============================================================
       3) PHASE DEADLINE CHECK
    ============================================================ */
    for (const phase of task.phases) {
      // Skip phases that are already completed
      if (phase.status === "DONE") continue;

      // Check overdue
      if (now > phase.dueDate && !phase.isNotified) {
        task.alerts.push({
          message: `Phase "${phase.title}" deadline exceeded.`,
          level: "WARNING",
          createdAt: now,
        });

        phase.isNotified = true;
      }
    }

    await task.save();
  }

  console.log("Monitoring finished.");
}
