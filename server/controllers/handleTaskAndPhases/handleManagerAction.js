import { handleManagerAcceptAction } from "./handleManagerAcceptAction.js";
import {handleManagerRejectAction} from './handleManagerRejectAction.js'


export default async function handleManagerAction(req, res) {
  try {
    const { tid, eid} = req.params;
    const {action, reason=""} = req.body;
    console.log("in manager action",req.body)


    if (action === "accept") {
      return await handleManagerAcceptAction(tid, eid, res);
    } else {
      return await handleManagerRejectAction(tid, eid, reason, res);
    }

  } catch (err) {
    return res.status(500).json({
      error: "Error in manager action",
      message: err.message,
    });
  }
}
