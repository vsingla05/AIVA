import Task from "../../models/employees/taskModel.js";
import Employee from "../../models/employees/employeeModel.js";

export const getManagerOverview = async (req, res) => {
  try {
    const managerId = req.user._id;

    /* ───────────────────────────────
       TASK AGGREGATIONS
    ─────────────────────────────── */
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      rejectedTasks,
    ] = await Promise.all([
      Task.countDocuments({ assignedBy: managerId }),

      Task.countDocuments({
        assignedBy: managerId,
        status: "DONE",
      }),

      Task.countDocuments({
        assignedBy: managerId,
        status: "IN_PROGRESS",
      }),

      Task.countDocuments({
        assignedBy: managerId,
        "taskDelay.isDelayed": true,
      }),

      Task.countDocuments({
        assignedBy: managerId,
        $or: [
          { status: "DECLINED_BY_EMPLOYEE" },
          { "proof.status": "REJECTED" },
        ],
      }),
    ]);

    /* ───────────────────────────────
       EMPLOYEE COUNT
    ─────────────────────────────── */
    const totalEmployees = await Employee.countDocuments({
      assignedBy: managerId,
      isActive: true,
    });

    /* ───────────────────────────────
       RECENT TASKS (for list)
    ─────────────────────────────── */
    const recentTasks = await Task.find({ assignedBy: managerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("employeeId", "name")
      .select("title status dueDate employeeId")
      .lean();

    /* ───────────────────────────────
       RESPONSE
    ─────────────────────────────── */
    return res.json({
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        delayedTasks,
        rejectedTasks,
        totalEmployees,
      },
      recentTasks: recentTasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: formatStatus(t.status),
        due: t.dueDate,
        assignee: t.employeeId?.name || "Unassigned",
      })),
    });
  } catch (error) {
    console.error("Manager overview error:", error);
    return res.status(500).json({
      message: "Failed to load dashboard overview",
    });
  }
};

/* ───────────────────────────────
   STATUS FORMATTER (UI friendly)
─────────────────────────────── */
function formatStatus(status) {
  const map = {
    DONE: "Completed",
    IN_PROGRESS: "In Progress",
    TODO: "Pending",
    ON_HOLD: "Delayed",
    READY_FOR_REVIEW: "In Progress",
    DECLINED_BY_EMPLOYEE: "Rejected",
  };

  return map[status] || status;
}
