import Task from '../../models/employees/taskModel.js'

export default async function generateTaskReport(taskId) {
  const task = await Task.findById(taskId).populate("employeeId assignedBy");

  if (!task) throw new Error("Task not found");

  const report = {
    taskTitle: task.title,
    description: task.description,
    assignedTo: task.employeeId ? task.employeeId.name : "Unassigned",
    assignedBy: task.assignedBy.name,
    dueDate: task.dueDate,
    status: task.status,
    estimatedHours: task.estimatedHours,
    phases: task.phases.map(phase => ({
      title: phase.title,
      dueDate: phase.dueDate,
      status: phase.status,
      completedAt: phase.completedAt,
      notes: phase.notes || "",
    })),
    alerts: task.alerts.filter(alert => !alert.seen),
  };

  return report;
}
