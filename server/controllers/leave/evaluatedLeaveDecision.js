export async function evaluateLeaveDecision(leave, employeeContext, impact) {
  const decision = {
    status: "PENDING",
    managerDecision: "AUTO",
    leaveOutcomeType: "PAID",
    salaryDeductionDays: 0,
    reason: "",
  };

  const { priority, days } = leave;
  const { leaveBalance } = employeeContext;
  const { taskImpactLevel } = impact;

  // HIGH & MEDIUM → auto approve
  if (priority === "HIGH" || priority === "MEDIUM") {
    decision.status = "APPROVED";
    decision.reason = `${priority} priority leave approved.`;
  }

  // LOW priority
  else if (priority === "LOW") {
    if (taskImpactLevel === "HIGH") {
      decision.status = "PENDING";
      decision.managerDecision = "PENDING_MANAGER";
      decision.reason =
        "Low priority leave conflicts with critical tasks and requires manager approval.";
      return decision;
    }

    decision.status = "APPROVED";
    decision.reason = "Low priority leave approved.";
  }

  // Salary deduction (after approval)
  if (decision.status === "APPROVED" && leaveBalance < days) {
    decision.leaveOutcomeType = "LWP";
    decision.salaryDeductionDays = days - leaveBalance;
    decision.reason += " Salary will be deducted.";
  }

  return decision;
}
