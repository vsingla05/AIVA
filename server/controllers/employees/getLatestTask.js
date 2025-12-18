import Task from "../../models/employees/taskModel.js";

export async function getLatestTask(req, res) {
  try {
    const employeeId = req.user?._id;
    console.log(employeeId);
    if (!employeeId) {
      return res
        .status(400)
        .json({ success: false, message: "employeeId is required" });
    }

    const task = await Task.findOne({employeeId,})
      .populate("assignedBy", "name email")
      .populate("phases")
      .sort({ createdAt: -1 });

    console.log(task);

    if (!task) {
      return res.status(200).json({
        success: true,
        task: null,
        message: "No newly assigned tasks found",
      });
    }
    console.log(task);
    return res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    console.error("❌ getAssignedTask Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
