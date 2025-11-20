import { Task } from "../../models/employees";
import Employee from "../../models/employees";

export const submitPhase = async (req, res) => {
  try {
    const { taskId, phaseId } = req.params;
    const employeeId = req.user._id;

    const task = await Task.findById(taskId).populate("employeeId");
    if (!task) return res.status(404).json({ msg: "Task not found" });

    const phase = task.phases.id(phaseId);
    if (!phase) return res.status(404).json({ msg: "Phase not found" });

    // Only assigned employee can submit phase
    if (String(task.employeeId._id) !== String(employeeId)) {
      return res.status(403).json({ msg: "You are not allowed to update this phase" });
    }

    const now = new Date();
    const due = new Date(phase.dueDate);

    /* --------------------------------------------
       UPDATE PHASE
    --------------------------------------------- */
    phase.status = "DONE";
    phase.completedAt = now;
    phase.isNotified = true; 
    phase.delayNotified = true;

    /* --------------------------------------------
       UPDATE EMPLOYEE
    --------------------------------------------- */
    const employee = await Employee.findById(employeeId);

    // Reduce workload
    employee.currentLoad = Math.max(
      0,
      employee.currentLoad - (phase.phaseEstimatedHrs || 0)
    );

    const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

    // ✔ ON TIME COMPLETION
    if (now <= due) {
      employee.taskStats.completedPhaseTasks += 1;
      employee.performance.efficiency += 1;   // Best efficiency
    } 

    // ✔ LATE COMPLETION
    else {
      employee.taskStats.delayedPhaseTasks += 1;

      if (diffDays <= 1) {
        employee.taskStats.minorDelays += 1;
        employee.performance.efficiency += 0.5;
      } else {
        employee.taskStats.majorDelays += 1;
        employee.performance.efficiency += 0.25;
      }
    }

    /* --------------------------------------------
       ADD TASK ALERT
    --------------------------------------------- */
    task.alerts.push({
      message: `Phase "${phase.title}" completed by ${task.employeeId.name}.`,
      level: "INFO",
      createdAt: new Date(),
    });

    await employee.save();
    await task.save();

    return res.json({
      msg: "Phase marked as completed successfully",
      task,
    });

  } catch (error) {
    console.error("Phase submission error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
