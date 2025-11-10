export function decideLeave({ employeePriority, taskPriority, leaveAvailable, requestedDays, negativeLimit = 5 }) {
  const res = { action: "REJECT", leaveOutcomeType: "PAID", salaryDeductionDays: 0, approvedDays: 0, managerReview: false };

  if (employeePriority === "HIGH" || employeePriority === "MEDIUM") {
    if (leaveAvailable >= requestedDays) {
      if (taskPriority === "HIGH") {
        res.action = "MANAGER_REVIEW";
        res.managerReview = true;
        return res;
      } else {
        res.action = "APPROVE"; res.leaveOutcomeType = "PAID"; res.approvedDays = requestedDays; return res;
      }
    } else {
      res.action = "APPROVE";
      if (Math.abs(leaveAvailable) < negativeLimit) { res.leaveOutcomeType = "NEGATIVE"; res.approvedDays = requestedDays; }
      else { res.leaveOutcomeType = "LWP"; res.approvedDays = requestedDays; }
      res.salaryDeductionDays = Math.max(0, requestedDays - Math.max(0, leaveAvailable));
      return res;
    }
  }

  if (employeePriority === "LOW") {
    if (taskPriority === "HIGH" || taskPriority === "MEDIUM") { res.action = "REJECT"; return res; }
    else {
      if (leaveAvailable >= requestedDays) { res.action = "APPROVE"; res.leaveOutcomeType = "PAID"; res.approvedDays = requestedDays; return res; }
      else { res.action = "APPROVE"; res.leaveOutcomeType = "LWP"; res.salaryDeductionDays = Math.max(0, requestedDays - leaveAvailable); res.approvedDays = requestedDays; return res; }
    }
  }
  return res;
}
