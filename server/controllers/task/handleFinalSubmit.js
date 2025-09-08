import { Task } from "../../models/employees/index.js";

export default async function HandleFinalSubmit(req, res) {
  try {
    const { tid } = req.params;
    const file = req.file?.path;

    if (!file) {
      return res.status(400).json({ msg: "Proof file is required" });
    }

    let task = await Task.findByIdAndUpdate(
      tid,
      {
        proof: {
          file: file,
          submittedAt: new Date(),
          status: "PENDING", 
        },
        status: "READY_FOR_REVIEW",
      },
      { new: true } 
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error("Error in HandleFinalSubmit:", err.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}
