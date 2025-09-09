import express from "express";
import { Authentication } from "../../middlewares/index.js";
import completePhase from "../../controllers/task/handlePhaseTask.js";
import HandleFinalSubmit from "../../controllers/task/handleFinalSubmit.js";
import { upload } from "../../cloud/cloudinary.js"; 
import HandleSubmitProof from "../../controllers/hr/handleSubmitProof.js";
import FetchAllTaskProofs from "../../controllers/hr/fetchAllTaskProofs.js";

const router = express.Router();

router.post("/:id/phase/:pid", Authentication, completePhase);
router.post("/:tid/finalSubmit", Authentication, upload.single("file"), HandleFinalSubmit);
router.get("/fetchProofs", Authentication, FetchAllTaskProofs);
router.post("/:id/review", Authentication, HandleSubmitProof);

export default router;
