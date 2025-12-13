import mongoose from "mongoose";

/* ─────────────────────────────────────────────
   📘 Phase Schema (unchanged except minor clarity)
───────────────────────────────────────────── */
const phaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "DONE", "TODO"],
      default: "TODO",
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    phaseEstimatedHrs: { type: Number, default: 0 },
    delayNotified: { type: Boolean, default: false },
    notifications: String,
    completedAt: Date,
  },
  { _id: true, timestamps: true }
);

/* ─────────────────────────────────────────────
   📘 Skill Schema (simplified for consistency)
───────────────────────────────────────────── */
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 1 },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   📘 AI Reasoning Log Schema
───────────────────────────────────────────── */
const aiLogSchema = new mongoose.Schema(
  {
    bestEmployee: String,
    fallbackEmployees: [String],
    aiReasoning: String,
    modelUsed: { type: String, default: "Gemini-1.5-Flash" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ─────────────────────────────────────────────
   📘 Task Schema (Main)
───────────────────────────────────────────── */
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // 🧑‍💼 Assignment Details
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    fallbackEmployees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    ],

    // 📅 Scheduling and Priority
    dueDate: Date,
    acceptedAt: Date,
    estimatedHours: { type: Number, default: 0 },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: [
        "TODO", // Task created, not assigned yet
        "ASSIGNED", // Assigned, waiting for employee response
        "DECLINED_BY_EMPLOYEE", // Employee declined with reason
        "REASSIGNMENT_PENDING", // HR deciding approve/reject decline
        "REASSIGNED", // Task assigned to fallback employee
        "IN_PROGRESS", // Accepted, work started
        "ON_HOLD", // Work paused
        "READY_FOR_REVIEW", // Employee submitted work
        "DONE", // Task fully completed
      ],
      default: "TODO",
    },

    // 🧩 Task Structure
    phases: [phaseSchema],
    createdByAI: { type: Boolean, default: true },

    // 🧠 AI Assignment Metadata
    reasoning: String, // direct short reasoning summary
    aiLogs: [aiLogSchema], // detailed reasoning history

    // 📎 Task Assets
    pdfUrl: {
      view: String, // cloudinary secure_url
      download: String, // ?fl_attachment=
    },
    proof: {
      file: String,
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "READY_FOR_REVIEW"],
        default: "PENDING",
      },
      message: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      reviewedAt: Date,
    },

    taskDelay: {
      isDelayed: { type: Boolean, default: false },
      delayDays: { type: Number, default: 0 },
      delayNotified: { type: Boolean, default: false }, // to prevent duplicate alerts
    },

    employeeRejection: {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
      reason: { type: String, default: null },
      classification: {
        type: String,
        enum: [
          "VALID_OVERLOAD",
          "VALID_UNSKILLED",
          "VALID_TIME",
          "VALID_PERSONAL",
          "INVALID",
        ],
        default: null,
      },
      rejectedAt: { type: Date, default: null },
    },

    performanceTracking: {
      delays: { type: Number, default: 0 }, // how many times task delayed
    },

    resubmissionDeadline: { type: Date, default: null },
    resubmissionNotified: { type: Boolean, default: false },

    // 📊 Skills Required
    requiredSkills: [String], // ✅ simplified for semantic matching
    skillDetails: [skillSchema], // optional skill objects if needed for UI

    // 🧭 Tracking & Alerts
    alerts: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        level: { type: String, default: "INFO" },
      },
    ],
    reassigned: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────────
   🕓 Phase Delay Auto-Classifier
───────────────────────────────────────────── */
phaseSchema.pre("save", function (next) {
  if (this.status === "DONE" && this.completedAt && this.dueDate) {
    const delayMs = this.completedAt - this.dueDate;
    const delayPercent =
      delayMs > 0 ? (delayMs / (this.dueDate - this.createdAt)) * 100 : 0;

    this.delayPercent = Math.max(0, delayPercent);

    if (this.delayPercent === 0) this.delayCategory = "NONE";
    else if (this.delayPercent <= 20) this.delayCategory = "MINOR";
    else this.delayCategory = "MAJOR";
  }
  next();
});

/* ─────────────────────────────────────────────
   ✅ Model Export
───────────────────────────────────────────── */
const Task = mongoose.model("Task", taskSchema);
export default Task;
