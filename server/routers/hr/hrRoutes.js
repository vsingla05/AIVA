import express from "express";
import Leave from "../models/Leave.js";
const router = express.Router();

router.get("/managers/pending", async (req, res) => {
  const pending = await Leave.find({ managerDecision: "PENDING_MANAGER" }).sort({ createdAt: -1 });
  res.json(pending);
});

export default router