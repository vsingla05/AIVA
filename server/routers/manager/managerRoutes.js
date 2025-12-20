import express from "express";
import Authentication from "../../middlewares/Authentication.js";
import { getManagerOverview } from "../../controllers/manager/getManagerOverView.js";
import sendAllProjects from "../../controllers/manager/sendAllProjects.js";
import sendTaskFallbacks from "../../controllers/manager/sendTaskFallbacks.js";
import { getEmployeeAnalytics } from "../../controllers/manager/employeeAnalytics.js";

const router = express.Router();

router.get("/overview", Authentication, getManagerOverview);
router.get("/send-all-projects", Authentication, sendAllProjects)
router.get("/:taskId/fallbacks", Authentication, sendTaskFallbacks)
router.get('/employee-analytics', Authentication, getEmployeeAnalytics)

export default router;
