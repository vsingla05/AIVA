import Leave from "../../models/employees/leaveModel.js";
import Employee from "../../models/employees/employeeModel.js";
import { buildLeaveContext } from "./buildLeaveContext.js";
import { analyzeLeaveImpact } from "./analyzeLeaveImpact.js";
import { evaluateLeaveDecision } from "./evaluatedLeaveDecision.js";
import { sendAlertEmail } from "../mails/alertMail.js";

/**
 * Full leave decision + payroll-safe pipeline
 */
export async function processLeaveDecision(leaveId) {
  try {
    /* ───────────────────────────────
       1️⃣ Fetch leave + employee
    ─────────────────────────────── */
    const leave = await Leave.findById(leaveId).populate("employeeId");
    if (!leave) return;

    const employee = leave.employeeId;

    /* ───────────────────────────────
       2️⃣ Build context
    ─────────────────────────────── */
    const context = await buildLeaveContext(employee._id, leave);

    /* ───────────────────────────────
       3️⃣ AI impact analysis
    ─────────────────────────────── */
    const impact = await analyzeLeaveImpact(context);

    /* ───────────────────────────────
       4️⃣ Rule engine
    ─────────────────────────────── */
    const decision = await evaluateLeaveDecision(
      leave,
      context.employeeContext,
      impact
    );

    /* ───────────────────────────────
       5️⃣ Save leave decision
    ─────────────────────────────── */
    leave.status = decision.status;
    leave.managerDecision = decision.managerDecision;
    leave.leaveOutcomeType = decision.leaveOutcomeType;
    leave.salaryDeductionDays = decision.salaryDeductionDays;
    leave.aiReply = decision.reason;
    await leave.save();

    /* ───────────────────────────────
       6️⃣ Fetch manager
    ─────────────────────────────── */
    const employeeDoc = await Employee.findById(employee._id);
    if (!employeeDoc) return;

    const manager = employee.assignedBy
      ? await Employee.findById(employee.assignedBy)
      : null;

    /* ───────────────────────────────
       7️⃣ NOTIFICATIONS (EMPLOYEE)
    ─────────────────────────────── */
    employeeDoc.notifications.push({
      message: decision.reason,
      createdAt: new Date(),
      isRead: false,
    });

    /* ───────────────────────────────
       8️⃣ NOTIFICATIONS (MANAGER)
    ─────────────────────────────── */
    if (manager) {
      manager.notifications.push({
        message: `Leave request from ${employee.name} (${leave.priority}, ${leave.days} day(s)).`,
        createdAt: new Date(),
        isRead: false,
      });
      await manager.save();
    }

    /* ───────────────────────────────
       9️⃣ EMAIL → MANAGER
    ─────────────────────────────── */
    const shouldEmailManager =
      leave.priority === "HIGH" ||
      leave.priority === "MEDIUM" ||
      decision.managerDecision === "PENDING_MANAGER";

    if (shouldEmailManager && manager?.email) {
      await sendAlertEmail({
        to: manager.email,
        subject:
          decision.managerDecision === "PENDING_MANAGER"
            ? "Leave Approval Required"
            : `Leave Approved (${leave.priority})`,
        html: `
<h3>Leave Request</h3>

<p><b>Employee:</b> ${employee.name}</p>
<p><b>Priority:</b> ${leave.priority}</p>

<ul>
  <li><b>From:</b> ${leave.startDate.toDateString()}</li>
  <li><b>To:</b> ${leave.endDate.toDateString()}</li>
  <li><b>Days:</b> ${leave.days}</li>
</ul>

<p><b>Reason:</b> ${leave.reason}</p>

<p>
${
  decision.managerDecision === "PENDING_MANAGER"
    ? "⚠️ Manager approval is required."
    : "ℹ️ Informational notification."
}
</p>
        `,
      });
    }

    /* ───────────────────────────────
       🔟 EMAIL → EMPLOYEE
    ─────────────────────────────── */
    if (employee.email) {
      await sendAlertEmail({
        to: employee.email,
        subject: "Leave Status Update",
        html: `
<h3>Leave Update</h3>
<p>${decision.reason}</p>

<ul>
  <li><b>From:</b> ${leave.startDate.toDateString()}</li>
  <li><b>To:</b> ${leave.endDate.toDateString()}</li>
  <li><b>Total Days:</b> ${leave.days}</li>
</ul>
        `,
      });
    }

    /* ───────────────────────────────
       1️⃣1️⃣ PAYROLL LOGIC (APPROVED)
    ─────────────────────────────── */
    if (decision.status === "APPROVED") {
      const availableLeave = employeeDoc.leaveBalance.totalLeave;
      const requestedDays = leave.days;

      const paidDays = Math.min(availableLeave, requestedDays);
      const unpaidDays = requestedDays - paidDays;

      if (paidDays > 0) {
        employeeDoc.leaveBalance.totalLeave -= paidDays;
      }

      if (unpaidDays > 0 && employeeDoc.salary) {
        const perDaySalary = employeeDoc.salary / 30;
        const deductionAmount =
          Math.round(perDaySalary * unpaidDays * 100) / 100;

        employeeDoc.salaryDeductions.push({
          amount: deductionAmount,
          reason: `Unpaid leave (${unpaidDays} day(s))`,
          leaveId: leave._id,
          createdAt: new Date(),
        });
      }

      await employeeDoc.save();
    }
  } catch (error) {
    console.error("❌ Leave decision error:", error);
  }
}
