import express from "express";
import { Authentication } from "../../middlewares/index.js";
import HandlePhaseTask from "../../controllers/task/handlePhaseTask.js";
import HandleFinalSubmit from "../../controllers/task/handleFinalSubmit.js";
import { upload } from "../../cloud/cloudinary.js"; 
import ReviewTask from "../../controllers/hr/reviewTask.js";
import FetchAllTaskProofs from "../../controllers/hr/fetchAllTaskProofs.js";

const router = express.Router();

router.post("/:id/phase/:pid", Authentication, HandlePhaseTask);
router.post("/:id/finalSubmit", Authentication, upload.single("file"), HandleFinalSubmit);
router.get("/fetchProofs", Authentication, FetchAllTaskProofs);
router.post("/:id/review", Authentication, ReviewTask);


export default router;
