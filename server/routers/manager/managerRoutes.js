import express from "express";
import Authentication from "../../middlewares/Authentication.js";
import { getManagerOverview } from "../../controllers/manager/getManagerOverView.js";

const router = express.Router();

router.get("/overview", Authentication, getManagerOverview);

export default router;
