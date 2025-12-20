import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";

export const employeeOverview = async (req, res) => {
  try {
    const employeeId = req.user._id;

    /* ---------------- EMPLOYEE ---------------- */
    const employee = await Employee.findById(employeeId)
      .select("name notifications currentLoad");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    /* ---------------- TASKS ---------------- */
    const tasks = await Task.find({ employeeId })
      .select("title status priority dueDate estimatedHours")
      .sort({ dueDate: 1 });

    /* ---------------- DATES ---------------- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ---------------- TASK FILTERING ---------------- */
    const completedTasks = tasks.filter(t => t.status === "DONE");

    const todayTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === "DONE") return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const upcomingTasks = tasks
      .filter(t => {
        if (!t.dueDate || t.status === "DONE") return false;
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        return d > today;
      })
      .slice(0, 5);

    /* ---------------- PERFORMANCE LOGIC ---------------- */
    const totalTasks = tasks.length || 1;

    const efficiency = Math.round(
      (completedTasks.length / totalTasks) * 100
    );

    // simple weighted score (you can evolve this later)
    const performanceScore = Math.min(
      100,
      Math.round((completedTasks.length * 10) + efficiency / 2)
    );

    /* ---------------- CURRENT LOAD ---------------- */
    const currentLoad =
      tasks
        .filter(t => t.status !== "DONE")
        .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    /* ---------------- RESPONSE ---------------- */
    res.status(200).json({
      success: true,

      name: employee.name,

      currentLoad,

      stats: {
        performanceScore
      },

      performance: {
        efficiency,
        completed: completedTasks.length
      },

      todayTasks,
      upcomingTasks,

      notifications: (employee.notifications || [])
        .slice(-5)
        .reverse()
    });

  } catch (error) {
    console.error("Employee overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load employee overview"
    });
  }
};
