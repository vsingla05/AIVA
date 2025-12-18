import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";

export async function getAllTasks(req, res) {
  try {
    console.log('inside all tasks')
    const employeeId = req.user?._id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* 1️⃣ Fetch employee stats (SOURCE OF TRUTH) */
    const employee = await Employee.findById(employeeId)
      .select("taskStats");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    /* 2️⃣ Fetch NEW tasks */
    const tasks = await Task.find({
      employeeId,
    })
      .sort({ createdAt: -1 })
      .select("title dueDate status");

    return res.status(200).json({
      success: true,
      stats: employee.taskStats,
      tasks,
    });

  } catch (err) {
    console.error("❌ getNewTasks Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
