import express from "express";
import { Authentication } from "../../middlewares/index.js";
import { upload } from "../../cloud/cloudinary.js"; 
import { submitPhase } from "../../controllers/handleTaskAndPhases/submitPhase.js";
import { handleFinalTaskSubmit } from "../../controllers/handleTaskAndPhases/handleCompleteTaskSubmit.js";
import handleManagerAction from "../../controllers/handleTaskAndPhases/handleManagerAction.js";

const router = express.Router();

router.post("/:id/phase/:pid", Authentication, submitPhase);
router.post("/:id/finalSubmit", Authentication, upload.single("file"), handleFinalTaskSubmit);
router.post('/:id/task/:tid', Authentication, handleManagerAction)


export default router;
