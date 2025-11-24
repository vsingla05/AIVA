import Task from '../../models/employees/taskModel.js'
import Employee from '../../models/employees/employeeModel.js'

export const sendTaskProof = async (taskId, employeeId) => {
  try {
    const task = await Task.findById(taskId)
      .populate("proof.reviewedBy", "name")  
      .populate("assignedTo", "name");       

    if (!task) {
      return { success: false, msg: "Task not found" };
    }

    // Fetch Employee
    const employee = await Employee.findById(employeeId).select("name email");
    if (!employee) {
      return { success: false, msg: "Employee not found" };
    }

    // Build response
    const response = {
      taskTitle: task.title,
      dueDate: task.dueDate,
      employeeName: employee.name,
      proof: {
        file: task.proof?.file,
        status: task.proof?.status,
        message: task.proof?.message,
        reviewedBy: task.proof?.reviewedBy?.name || null,
        reviewedAt: task.proof?.reviewedAt || null,
      },
    };

    return { success: true, data: response };

  } catch (err) {
    console.error("Error fetching task proof:", err);
    return { success: false, msg: err.message };
  }
};
