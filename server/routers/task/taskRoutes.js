import express from "express";
import { Authentication } from "../../middlewares/index.js";
import { upload } from "../../cloud/cloudinary.js"; 
import { submitPhase } from "../../controllers/handleTaskAndPhases/submitPhase.js";
import handleManagerAction from "../../controllers/handleTaskAndPhases/handleManagerAction.js";
import {handleFinalTaskSubmit} from '../../controllers/handleTaskAndPhases/handleCompleteTaskSubmit.js'
import handleEmployeeAction from "../../controllers/employees/handleEmployeeAction.js";
import { getLatestTask } from "../../controllers/employees/getLatestTask.js";
import GetEmployeeTasks from "../../controllers/employees/getEmployeeTasks.js";
import GetIdTask from "../../controllers/employees/getIdTask.js";
import {Authorization} from "../../middlewares/index.js";
import { sendTaskProof } from "../../controllers/handleTaskAndPhases/sendTaskProof.js";

const router = express.Router();

// 1️⃣ Mark Phase Complete
router.post("/:taskId/phase/:phaseId", Authentication, submitPhase);

// 2️⃣ Employee Final Submit
router.post("/:taskId/finalSubmit", Authentication, upload.single("file"), handleFinalTaskSubmit);

// 3️⃣ Employee Accept/Reject Action
router.post('/action/:taskId', Authentication, handleEmployeeAction);

// 4️⃣ Employee Tasks
router.get('/tasks', Authentication, GetEmployeeTasks)

// 5️⃣ Get task by ID
router.get('/task/:id', Authentication, GetIdTask)

// 6️⃣ Get Latest Task
router.get('/latest', Authentication, getLatestTask)

// 7️⃣ View Proof
router.get('/send-proof', Authentication, sendTaskProof)

// 8️⃣ Manager Review Action (PUT AT BOTTOM)
router.post('/:tid/employee/:eid', Authentication, handleManagerAction);

export default router;
