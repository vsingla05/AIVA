import { Task } from "../../models/employees/index.js";

export default async function HandleFinalSubmit(req, res) {
  try {
    const { id } = req.params; // use `id` to match your route
    const file = req.file; // multer already uploaded it to Cloudinary

    if (!file) {
      return res.status(400).json({ msg: "Proof file is required" });
    }

    // Save Cloudinary info in your task
    const task = await Task.findByIdAndUpdate(
      id,
      {
        proof: {
          file: file.path, // Cloudinary URL is in file.path
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
