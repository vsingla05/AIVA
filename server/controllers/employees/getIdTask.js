import { Task } from "../../models/employees/index.js";

export default async function GetIdTask(req, res) {
  const { id } = req.params;

  try {
    const task = await Task.findById(id).populate('assignedBy');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error("Error fetching task by ID:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
