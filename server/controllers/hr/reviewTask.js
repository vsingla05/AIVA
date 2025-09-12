import { Task } from "../../models/employees/index.js";
import HandleEmployeePerformance from "../task/handleEmployeePerformance.js";

export default async function ReviewTask(req, res) {
  const { id } = req.params;          
  const reviewerId = req.user._id;    
  const { status, message } = req.body;        

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          "proof.status": status,
          "proof.reviewedBy": reviewerId,
          "proof.reviewedAt": new Date(),
          "proof.message": message || null
        },
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (status === "APPROVED") {
      console.log('task approved by hr');
      await HandleEmployeePerformance(task._id, task.employeeId);
    }

    return res.status(200).json({ 
      message: status === "APPROVED" ? "Task approved" : "Task rejected",
      task 
    });
  } catch (err) {
    console.error("Error in reviewTask:", err.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}
