import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";
import { sendAlertEmail } from "../mails/alertMail.js";
import { classifyRejectionSeverity } from "./classifyRejectionReason.js";
import { getCloudinaryPublicId } from "./getCloudinaryPublicURL.js";
import { v2 as cloudinary } from "cloudinary";

export async function handleManagerRejectAction(taskId, employeeId, reason, res) {
  try {
    const now = new Date();

    /* --------------------------------------------------------
        1) Fetch task + employee
    --------------------------------------------------------- */
    const task = await Task.findById(taskId).populate("employeeId assignedBy");
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    /* --------------------------------------------------------
        2) AI classify severity
    --------------------------------------------------------- */
    const severity = await classifyRejectionSeverity(reason);
    const extensionDays = severity === "BIG" ? 3 : 1;

    /* --------------------------------------------------------
        3) New resubmission deadline
    --------------------------------------------------------- */
    const newResubmissionDeadline = new Date();
    newResubmissionDeadline.setDate(newResubmissionDeadline.getDate() + extensionDays);

    task.resubmissionDeadline = newResubmissionDeadline;
    task.resubmissionNotified = false;

    /* --------------------------------------------------------
        4) Extend main deadline
    --------------------------------------------------------- */
    if (task.dueDate) {
      const newDueDate = new Date(task.dueDate);
      newDueDate.setDate(newDueDate.getDate() + extensionDays);
      task.dueDate = newDueDate;
    }

    /* --------------------------------------------------------
        5) DELETE OLD PROOF FILE (only)
        ❗ fallback employees are NOT removed here
    --------------------------------------------------------- */
    if (task.proof.file) {
      try {
        const publicId = getCloudinaryPublicId(task.proof.file);
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

        task.alerts.push({
          message: "Old proof file deleted after rejection.",
          level: "INFO",
          createdAt: now,
        });

        task.proof.file = null; // clear only the file
      } catch (err) {
        console.error("Cloudinary deletion error:", err);
      }
    }

    /* --------------------------------------------------------
        6) Mark proof as rejected
    --------------------------------------------------------- */
    task.proof.status = "REJECTED";
    task.proof.message = reason;
    task.proof.reviewedBy = employeeId;
    task.proof.reviewedAt = now;

    /* --------------------------------------------------------
        7) Move task back to IN_PROGRESS (employee must fix)
    --------------------------------------------------------- */
    task.status = "IN_PROGRESS";

    /* --------------------------------------------------------
        8) Add structured alert
    --------------------------------------------------------- */
    task.alerts.push({
      message: `
Task rejected by manager.
• Reason: "${reason}"
• Severity: ${severity}
• Resubmission extended by ${extensionDays} day(s): ${newResubmissionDeadline.toLocaleString()}
• Main deadline extended by ${extensionDays} day(s): ${task.dueDate.toLocaleString()}
      `.trim(),
      level: "WARNING",
      createdAt: now,
    });

    /* --------------------------------------------------------
        9) Notify employee (email)
    --------------------------------------------------------- */
    await sendAlertEmail({
      to: employee.email,
      subject: `Task Rejected: ${task.title}`,
      message: `
Hello ${employee.name},

Your submission for **"${task.title}"** has been rejected.

Reason: ${reason}
Severity (AI): **${severity}**

⏳ New Resubmission Deadline:
${newResubmissionDeadline.toLocaleString()}

🗓 Updated Task Deadline:
${task.dueDate.toLocaleString()}

Please fix the issues and resubmit.
      `,
    });

    /* --------------------------------------------------------
        10) Save task
    --------------------------------------------------------- */
    await task.save();

    return res.json({
      success: true,
      message: `Task rejected. Resubmission extended ${extensionDays} days.`,
      severity,
      extensionDays,
      task,
    });

  } catch (err) {
    console.error("Manager Reject Error:", err);
    return res.status(500).json({
      success: false,
      message: "Manager reject action failed",
      error: err.message,
    });
  }
}
