import Employee from "../../models/employees/employeeModel.js";
import Task from "../../models/employees/taskModel.js";

export default async function sendTaskFallbacks(req, res) {
  try {
    const { taskId } = req.params;
    console.log("inside")

    const task = await Task.findById(taskId)
      .populate(
        "fallbackEmployees",
        "name role imageUrl currentLoad availability"
      );
      console.log(task)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const formattedFallbacks = (task.fallbackEmployees || []).map(emp => ({
      _id: emp._id,
      name: emp.name,
      role: emp.role,
      imageUrl: emp.imageUrl,
      currentLoad: emp.currentLoad,
      maxWeeklyHours: emp.availability?.maxWeeklyHours || 40
    }));
    console.log(formattedFallbacks)

    res.status(200).json({
      success: true,
      fallbackEmployees: formattedFallbacks
    });
  } catch (err) {
    console.error("Fallback employee error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fallback employees"
    });
  }
}
