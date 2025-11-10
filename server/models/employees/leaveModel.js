import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { type: String, enum: ["CL", "SL", "EL"], required: true },
  startDate: Date,
  endDate: Date,
  days: Number,
  reason: String,
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "LOW" },
  managerDecision: { type: String, enum: ["AUTO", "PENDING_MANAGER", "MANAGER_APPROVED", "MANAGER_REJECTED"], default: "AUTO" },
  leaveOutcomeType: { type: String, enum: ["PAID", "LWP", "NEGATIVE"], default: "PAID" },
  salaryDeductionDays: { type: Number, default: 0 },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  aiReply: {type: String},
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
