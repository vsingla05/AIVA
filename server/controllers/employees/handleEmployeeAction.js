import { handleEmployeeAcceptAction } from "./handleAcceptAction";
import { handleEmployeeRejectAction } from "./handleRejectAction";

export default async function handleEmployeeAction(req, res) {
  const userId = req.user?._id;
  try {
    const {taskId} = req.params;
    const { action, reason } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!taskId) return res.status(400).json({ success: false, message: "taskId required" });

    if (action === 'accept') {
      return await handleEmployeeAcceptAction(userId, taskId, res);
    } else {
      return await handleEmployeeRejectAction(userId, taskId, reason, res); 
    }
  } catch (err) {
    console.error('error in handleEmployeeAction', err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}