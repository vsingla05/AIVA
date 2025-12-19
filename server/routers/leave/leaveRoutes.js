import express from "express";
import  Authentication from '../../middlewares/Authentication.js'
import { managerLeaveDecision } from "../../controllers/leave/managerLeaveDecision.js";
import { getPendingLeavesForManager } from "../../controllers/leave/sendPendingLeaves.js";

const router = express.Router();

router.get("/send-pending-leaves", Authentication, getPendingLeavesForManager)
router.post("/:leaveId/decision", Authentication, managerLeaveDecision);


export default router;
