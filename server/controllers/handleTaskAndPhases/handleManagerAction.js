import { handleManagerAcceptAction } from "./handleManagerAcceptAction.js";
import {handleManagerRejectAction} from './handleManagerRejectAction.js'


export default async function handleManagerAction(req, res) {
  try {
    const { taskId, employeeId} = req.params;
    const {action, reason=""} = req.body;


    if (action === "accept") {
      return await handleManagerAcceptAction(taskId, employeeId, res);
    } else {
      return await handleManagerRejectAction(taskId, employeeId, reason, res);
    }

  } catch (err) {
    return res.status(500).json({
      error: "Error in manager action",
      message: err.message,
    });
  }
}
