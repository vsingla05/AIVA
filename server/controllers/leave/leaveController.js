import axios from "axios";
import Leave from "../../models/employees/leaveModel.js";
import Employee from "../../models/employees/employeeModel.js";
import { decideLeave } from "../utils/deciedLeave.js";
import { sendMail } from "../mails/mailer.js";
import dotenv from "dotenv";

dotenv.config();

const AGENT_URL = process.env.PY_AGENT_URL || "http://localhost:8000";

export async function applyLeave(req, res) {
  try {
    const { employeeId, message } = req.body;

    // 🧩 Step 1: Get Employee Info
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // 🧠 Step 2: Call Python AI Agent for parsing and reply
    const aiResp = await axios.post(`${AGENT_URL}/analyze`, {
      message,
      employeeId,
    });

    if (!aiResp.data?.parsed) {
      return res.status(400).json({ error: "AI parsing failed" });
    }

    const { reason, startDate, endDate, priority } = aiResp.data.parsed;
    const aiReply =
      aiResp.data.aiReply || "Your leave request has been noted by HR.";

    // 🧮 Step 3: Calculate requested days
    const requestedDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24) + 1 || 1;

    // 💡 Step 4: Business Decision Logic
    const leaveAvailable = employee.leaveBalance?.totalLeave ?? 0;
    const decision = decideLeave({
      employeePriority: priority,
      taskPriority: "LOW", // could be dynamic later
      leaveAvailable,
      requestedDays,
    });

    // 🧾 Step 5: Create Leave Record
    const leave = new Leave({
      employeeId,
      type: "CL",
      startDate,
      endDate,
      days: requestedDays,
      reason,
      priority,
      status:
        decision.action === "APPROVE"
          ? "APPROVED"
          : decision.managerReview
          ? "PENDING"
          : "REJECTED",
      managerDecision: decision.managerReview ? "PENDING_MANAGER" : "AUTO",
      leaveOutcomeType: decision.leaveOutcomeType,
      salaryDeductionDays: decision.salaryDeductionDays,
    });

    // 🏁 Step 6: Process Decision Outcome
    if (decision.action === "APPROVE") {
      const approvedDays = requestedDays || 1;

      if (decision.leaveOutcomeType === "PAID") {
        employee.leaveBalance.totalLeave = Math.max(
          0,
          leaveAvailable - approvedDays
        );
      } else if (decision.leaveOutcomeType === "NEGATIVE") {
        employee.leaveBalance.totalLeave = leaveAvailable - approvedDays;
      }

      await employee.save();
      await leave.save();

      // ✅ Notify Employee via Email
      await sendMail(
        employee.email,
        "Leave Approved ✅",
        `${aiReply} Your leave from ${startDate} to ${endDate} has been approved.`,
        `<p>${aiReply}</p><p>Your leave from <b>${startDate}</b> to <b>${endDate}</b> has been approved.</p>`
      );

      return res.json({
        leave,
        decision,
        aiReply: `${aiReply} ✅ Your leave has been approved.`,
      });
    }

    // Step 7: If Needs Manager Review
    await leave.save();

    const managers = await Employee.find({ role: "MANAGER" });
    const managerEmails = managers.map((m) => m.email).filter(Boolean);

    if (managerEmails.length > 0) {
      const subject = `Leave requires review: ${employee.name}`;
      const text = `${employee.name} requested ${requestedDays} day(s) leave.
Priority: ${priority}
Reason: ${reason}`;

      await sendMail(
        managerEmails.join(","),
        subject,
        text,
        `<p>${text.replace(/\n/g, "<br/>")}</p>`
      );
    }

    // Notify employee that their leave is pending review
    await sendMail(
      employee.email,
      "Leave Pending Review 🕐",
      `${aiReply} Your leave is under manager review.`,
      `<p>${aiReply}</p><p>Your leave request has been sent for manager approval.</p>`
    );

    return res.json({
      leave,
      decision,
      aiReply: `${aiReply} 🕐 Your leave is pending manager review.`,
    });
  } catch (err) {
    console.error("❌ Error in applyLeave:", err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Manager Action Controller
 * - Manager approves or rejects leave
 * - Handles salary deduction logic
 */
export async function managerAction(req, res) {
  try {
    const { managerId, leaveId, action, approvedDays } = req.body;

    const manager = await Employee.findById(managerId);
    if (!manager) return res.status(404).json({ error: "Manager not found" });

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    const employee = await Employee.findById(leave.employeeId);
    if (!employee)
      return res.status(404).json({ error: "Employee not found" });

    // ✅ APPROVE
    if (action === "APPROVE") {
      leave.status = "APPROVED";
      leave.managerDecision = "MANAGER_APPROVED";
      leave.approvedBy = manager._id;

      const daysToApprove = approvedDays ?? leave.days;
      const availableLeave = employee.leaveBalance?.totalLeave ?? 0;

      if (availableLeave >= daysToApprove) {
        employee.leaveBalance.totalLeave -= daysToApprove;
        leave.leaveOutcomeType = "PAID";
        leave.salaryDeductionDays = 0;
      } else {
        const unpaid = daysToApprove - availableLeave;
        leave.salaryDeductionDays = unpaid;
        employee.leaveBalance.totalLeave = 0;
        leave.leaveOutcomeType = "LWP"; // Leave Without Pay
      }

      await employee.save();
      await leave.save();

      await sendMail(
        employee.email,
        "Leave Approved ✅",
        `Your leave has been approved by ${manager.name}.`,
        `<p>Your leave has been approved by <b>${manager.name}</b>.</p>`
      );

      return res.json({ leave });
    }

    // ❌ REJECT
    leave.status = "REJECTED";
    leave.managerDecision = "MANAGER_REJECTED";
    leave.approvedBy = manager._id;

    await leave.save();

    await sendMail(
      employee.email,
      "Leave Rejected ❌",
      `Your leave was rejected by ${manager.name}.`,
      `<p>Your leave request was rejected by <b>${manager.name}</b>.</p>`
    );

    return res.json({ leave });
  } catch (err) {
    console.error("❌ Error in managerAction:", err);
    return res.status(500).json({ error: err.message });
  }
}
