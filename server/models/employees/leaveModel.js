import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    type: {
      type: String,
      enum: ["CL", "SL", "EL"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    days: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    // ---- FINAL LEAVE STATE ----
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "ESCALATED"],
      default: "PENDING",
    },

    // ---- AI CLASSIFIED PRIORITY ----
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "LOW",
    },

    // ---- MANAGER INTERACTION ----
    managerDecision: {
      type: String,
      enum: ["AUTO", "PENDING_MANAGER", "MANAGER_APPROVED", "MANAGER_REJECTED"],
      default: "AUTO",
    },

    // ---- PAYROLL EFFECT ----
    leaveOutcomeType: {
      type: String,
      enum: ["PAID", "LWP", "NEGATIVE"],
      default: "PAID",
    },

    salaryDeductionDays: {
      type: Number,
      default: 0,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // ---- AI EXPLANATION (HUMAN READABLE) ----
    aiReply: {
      type: String,
    },

    // ---- AI METADATA (MACHINE READABLE) ----
    aiMeta: {
      priorityConfidence: {
        type: Number, // 0.0 – 1.0
      },

      workloadScore: {
        type: Number, // computed workload impact
      },

      decisionReasonCode: {
        type: String,
        enum: [
          "MEDICAL",
          "FAMILY",
          "WORKLOAD_HIGH",
          "LOW_PRIORITY",
          "NO_BALANCE",
          "TEAM_UNAVAILABLE",
          "HOLIDAY_OVERLAP",
        ],
      },
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
