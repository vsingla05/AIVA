import Leave from "../../models/employees/leaveModel.js";

export async function getPendingLeavesForManager(req, res) {
  try {
    console.log("inside sendpendingleaves")
    const leaves = await Leave.find({
      status: "PENDING",
    })
      .populate({
        path: "employeeId",
        select: "name email department assignedBy",
      })
      .sort({ createdAt: -1 });

      console.log("leaves", leaves)

    // // Only send leaves belonging to this manager
    // const filteredLeaves = leaves.filter(
    //   (leave) =>
    //     leave.employeeId?.assignedBy?.toString() === leave.employeeId.toString()
    // );

    return res.json({
      leaves: leaves.map((leave) => ({
        _id: leave._id,
        type: "LEAVE",
        status: leave.status,
        priority: leave.priority,
        days: leave.days,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        createdAt: leave.createdAt,
        employee: {
          _id: leave.employeeId._id,
          name: leave.employeeId.name,
          email: leave.employeeId.email,
          department: leave.employeeId.department,
        },
      })),
    });
  } catch (error) {
    console.error("❌ Fetch pending leaves error:", error);
    return res.status(500).json({
      message: "Failed to fetch leave requests",
    });
  }
}
