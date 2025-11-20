import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";
import { sendAlertEmail } from "../mails/alertMail.js";

export async function handleFinalTaskSubmit(req, res) {
  try {
    const employeeId = req.user._id;
    const { taskId } = req.params;
    const file = req.file?.path || null; 

    const now = new Date();

    /* -----------------------------------------------------
       1) Fetch Task (must be assigned & in progress)
    ----------------------------------------------------- */
    const task = await Task.findOne({
      _id: taskId,
      employeeId,
      status: "IN_PROGRESS",
    }).populate("employeeId assignedBy");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not in IN_PROGRESS state.",
      });
    }

    /* -----------------------------------------------------
       2) Update Proof Object
    ----------------------------------------------------- */
    task.proof.file = file;
    task.proof.status = "READY_FOR_REVIEW";
    task.proof.message = "Employee submitted final proof.";
    task.proof.reviewedBy = null;
    task.proof.reviewedAt = null;

    /* -----------------------------------------------------
       3) Store Employee Submission Time (VERY IMPORTANT)
    ----------------------------------------------------- */
    task.completedAt = now;   // <—— IMPORTANT FIX

    /* -----------------------------------------------------
       4) Update Task Status
    ----------------------------------------------------- */
    task.status = "READY_FOR_REVIEW";

    task.alerts.push({
      message: `Final proof submitted by ${task.employeeId.name}. Waiting for manager review.`,
      level: "INFO",
      createdAt: now,
    });

    /* -----------------------------------------------------
       5) Notify Manager (email)
    ----------------------------------------------------- */
    await sendAlertEmail({
      to: task.assignedBy.email,
      subject: `Task Ready for Review: ${task.title}`,
      message: `
Employee ${task.employeeId.name} has submitted final proof for:

Task: "${task.title}"

Please review and approve/reject the submission in your dashboard.
      `,
    });

    /* -----------------------------------------------------
       6) Save Task Only (no employee updates)
    ----------------------------------------------------- */
    await task.save();

    return res.json({
      success: true,
      message: "Final proof submitted. Waiting for manager review.",
      status: task.status,
    });

  } catch (err) {
    console.error("❌ Final task submit error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit final proof",
      error: err.message,
    });
  }
}
