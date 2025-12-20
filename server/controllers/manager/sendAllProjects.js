import Employee from "../../models/employees/employeeModel.js";
import Task from "../../models/employees/taskModel.js";

export default async function sendAllProjects(req, res) {
  try {
    // 1️⃣ Fetch all tasks
    const tasks = await Task.find()
      .populate("employeeId", "name role imageUrl")
      .sort({ dueDate: 1 });

    // 2️⃣ Fetch all active employees
    const employees = await Employee.find({ isActive: true }).select(
      "name role imageUrl currentLoad availability"
    );

    // 3️⃣ Format tasks for frontend (same structure as mock)
    const formattedTasks = tasks.map((task) => ({
      _id: task._id,
      title: task.title,
      employeeId: task.employeeId
        ? {
            _id: task.employeeId._id,
            name: task.employeeId.name,
            role: task.employeeId.role,
            imageUrl: task.employeeId.imageUrl,
          }
        : null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      phases: task.phases || [],
    }));

    // 4️⃣ Team availability calculation
    const teamAvailability = employees.map((emp) => {
      const max = emp.availability?.maxWeeklyHours || 40;
      const percent = Math.round((emp.currentLoad / max) * 100);

      return {
        _id: emp._id,
        name: emp.name,
        role: emp.role,
        imageUrl: emp.imageUrl,
        currentLoad: emp.currentLoad,
        maxWeeklyHours: max,
        loadPercent: percent,
        isNearCapacity: percent >= 85,
        canBeFallback: percent <= 70,
      };
    });


    res.status(200).json({
      success: true,
      tasks: formattedTasks || [],
      teamAvailability: teamAvailability || [],
    });
  } catch (err) {
    console.error("Send all projects error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load projects",
    });
  }
}
