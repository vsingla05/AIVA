import Leave from "../../models/employees/leaveModel.js";
import Employee from "../../models/employees/employeeModel.js";
import { sendAlertEmail } from "../mails/alertMail.js";

export async function managerLeaveDecision(req, res) {
  try {
    const { leaveId } = req.params;
    const { action } = req.body; // APPROVE or REJECT
    console.log(action)

    if (!["approve", "reject"].includes(action)) {
      return res.status(401).json({ message: "Invalid action" });
    }

    /* ───────────────────────────────
       1️⃣ Fetch leave + employee
    ─────────────────────────────── */
    const leave = await Leave.findById(leaveId).populate("employeeId");
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.managerDecision !== "PENDING_MANAGER") {
      return res
        .status(400)
        .json({ message: "Leave is not pending manager approval" });
    }

    const employee = leave.employeeId;

    /* ───────────────────────────────
       2️⃣ Authorization check
    ─────────────────────────────── */
    // if (
    //   !employee.assignedBy ||
    //   employee.assignedBy.toString() !== managerId.toString()
    // ) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    /* ───────────────────────────────
       3️⃣ Apply decision
    ─────────────────────────────── */
    if (action === "REJECT") {
      leave.status = "REJECTED";
      leave.managerDecision = "MANAGER_REJECTED";
      leave.aiReply = "Leave rejected by manager.";

      await leave.save();

      // Notification → employee
      await Employee.findByIdAndUpdate(employee._id, {
        $push: {
          notifications: {
            message: "Your leave request has been rejected by your manager.",
            createdAt: new Date(),
            isRead: false,
          },
        },
      });

      // Email → employee
      await sendAlertEmail({
        to: employee.email,
        subject: "Leave Rejected",
        html: `
<h3>Leave Rejected</h3>
<p>Your leave request has been rejected by your manager.</p>
        `,
      });

      return res.json({ message: "Leave rejected successfully" });
    }

    /* ───────────────────────────────
       4️⃣ APPROVE → payroll safe logic
    ─────────────────────────────── */
    leave.status = "APPROVED";
    leave.managerDecision = "MANAGER_APPROVED";
    leave.aiReply = "Leave approved by manager.";

    const employeeDoc = await Employee.findById(employee._id);

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

    await leave.save();
    await employeeDoc.save();

    /* ───────────────────────────────
       5️⃣ Notifications & Emails
    ─────────────────────────────── */
    // Notification → employee
    employeeDoc.notifications.push({
      message: "Your leave request has been approved by your manager.",
      createdAt: new Date(),
      isRead: false,
    });

    await employeeDoc.save();

    // Email → employee
    await sendAlertEmail({
      to: employee.email,
      subject: "Leave Approved",
      html: `
<h3>Leave Approved</h3>
<p>Your leave request has been approved by your manager.</p>

<ul>
  <li><b>From:</b> ${leave.startDate.toDateString()}</li>
  <li><b>To:</b> ${leave.endDate.toDateString()}</li>
  <li><b>Total Days:</b> ${leave.days}</li>
  <li><b>Paid Days:</b> ${paidDays}</li>
  <li><b>Unpaid Days:</b> ${unpaidDays}</li>
</ul>
      `,
    });

    return res.json({ message: "Leave approved successfully" });
  } catch (error) {
    console.error("❌ Manager leave decision error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
