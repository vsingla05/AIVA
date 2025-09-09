import { Task } from "../../models/employees/index.js";

export default async function FetchAllTaskProofs(req, res) {
  const hrid = req.user._id; // you can also use this to filter tasks later if needed
  try {
    const tasks = await Task.find({ assignedBy: hrid })
      .populate("assignedBy")
      .populate("proof");

    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Internal Server Error", error: err.message });
  }
}
