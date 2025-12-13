import Task from "../../models/employees/taskModel.js";

export const sendTaskProof = async (req, res) => {
  try {

    const tasks = await Task.find({ status: "READY_FOR_REVIEW" })
      .populate("employeeId", "name email")
      .populate("proof.reviewedBy", "name");

    if (!tasks.length) {
      return res.json({
        success: true,
        tasks: [],
        message: "No tasks pending review"
      });
    }

    const response = tasks.map(task => ({
      taskId: task._id,
      title: task.title,
      dueDate: task.dueDate,
      employeeId: task.employeeId?._id,
      employee: {
        name: task.employeeId?.name,
        email: task.employeeId?.email
      },
      proof: {
        file: task.proof?.file,
        status: task.proof?.status,
        message: task.proof?.message,
      }
    }));
    console.log(response)

    return res.json({ success: true, tasks: response });

  } catch (err) {
    console.error("Error fetching task proof:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};
