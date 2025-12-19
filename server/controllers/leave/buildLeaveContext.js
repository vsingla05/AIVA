import Employee from "../../models/employees/employeeModel.js";
import Task from '../../models/employees/taskModel.js'

export async function buildLeaveContext(employeeId, leave) {
    console.log("inside context")
  const employee = await Employee.findById(employeeId).lean();

  if (!employee) {
    throw new Error("Employee not found");
  }

  /* ---------------------------------------------------
     2️⃣ EMPLOYEE CONTEXT (COMPRESSED)
  --------------------------------------------------- */    
  const employeeContext = {
    role: employee.role,
    department: employee.department,
    leaveBalance: employee.leaveBalance?.totalLeave ?? 0,
    currentWeeklyLoad: employee.currentLoad,
    performanceScore: employee.performance?.performanceScore ?? 0,
    availabilityRisk:
      employee.currentLoad > employee.availability?.maxWeeklyHours
        ? "HIGH"
        : "NORMAL",
  };

  /* ---------------------------------------------------
     3️⃣ FETCH ACTIVE TASKS DURING LEAVE WINDOW
  --------------------------------------------------- */
  const activeTasks = await Task.find({
    employeeId,
    status: { $in: ["ASSIGNED", "IN_PROGRESS", "ON_HOLD"] },
  }).lean();

  /* ---------------------------------------------------
     4️⃣ TASK CONTEXT AGGREGATION
  --------------------------------------------------- */
  let criticalTasks = 0;
  let tasksDueDuringLeave = 0;
  const blockingTasks = [];

  for (const task of activeTasks) {
    if (["HIGH", "CRITICAL", "MEDIUM"].includes(task.priority)) {
      criticalTasks++;
    }

    if (
      task.dueDate &&
      task.dueDate >= leave.startDate &&
      task.dueDate <= leave.endDate
    ) {
      tasksDueDuringLeave++;
      blockingTasks.push(task.title);
    }
  }

  const taskContext = {
    totalAssignedTasks: activeTasks.length,
    criticalTasks,
    tasksDueDuringLeave,
    blockingTasks: blockingTasks.slice(0, 3), 
    canReassign: employee.role !== "SOLE_CONTRIBUTOR",
  };

  /* ---------------------------------------------------
     5️⃣ LEAVE CONTEXT
  --------------------------------------------------- */
  const leaveContext = {
    days: leave.days,
    priority: leave.priority,
    leaveType: leave.type,
    overlapsWithCriticalDates: tasksDueDuringLeave > 0,
  };

  return {
    employeeContext,
    taskContext,
    leaveContext,
  };
}
