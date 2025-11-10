import express from "express";
import { applyLeave, managerAction } from '../../controllers/leave/leaveController.js'
const router = express.Router();

router.post("/apply", applyLeave);
router.post("/manager-action", managerAction);

export default router;
