import express from "express";
import Leave from "../models/Leave.js";
import { Authentication, Authorization } from "../../middlewares/index.js";
import { getAllEmployees } from "../../middlewares/index.js";

const router = express.Router();

router.get("/managers/pending", async (req, res) => {
  const pending = await Leave.find({ managerDecision: "PENDING_MANAGER" }).sort(
    { createdAt: -1 }
  );
  res.json(pending);
});

router.get("/employees", Authentication, Authorization("MANAGER"), getAllEmployees);

export default router;
