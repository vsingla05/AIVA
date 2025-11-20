import Task from './../../models/employees/taskModel.js'

export async function getAssignedTask(req, res) {
  try {
    const employeeId = req.user?._id
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "employeeId is required" });
    }

    const task = await Task.findOne({
      employeeId,
      status: "ASSIGNED"
    })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    if (!task) {
      return res.status(200).json({
        success: true,
        task: null,
        message: "No newly assigned tasks found",
      });
    }

    return res.status(200).json({
      success: true,
      task: {
        taskId: task._id,
        title: task.title,
        description: task.description,
        assignedBy: task.assignedBy?.name || "AI System",
        priority: task.priority,
        dueDate: task.dueDate,
        pdfUrl: task.pdfUrl
      },
    });
  } catch (err) {
    console.error("❌ getAssignedTask Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
