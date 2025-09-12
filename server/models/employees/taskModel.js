import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "DONE", "READY_FOR_REVIEW", "TODO"],
      default: "TODO",
    },
    completedAt: Date,
    delayCategory: {
      type: String,
      enum: ["NONE", "MINOR", "MAJOR"],
      default: "NONE",
    },
    delayPercent: { type: Number, default: 0 },
    notificationsSent: {
      overdueAlert: { type: Boolean, default: false }, // AI sent notification for overdue
      completionDelayAlert: { type: Boolean, default: false } // AI sent notification after late completion
    }
  },
  { _id: true, timestamps: true }
);


const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 1 },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    dueDate: Date,
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "ON_HOLD", "DONE", "READY_FOR_REVIEW"],
      default: "TODO",
    },

    phases: [phaseSchema],
    createdByAI: { type: Boolean, default: false },

    alerts: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        level: { type: String, default: "INFO"},
      },
    ],

    requiredSkills: [skillSchema],
    estimatedHours: { type: Number, default: 0 },

    fallbackEmployees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    ],
    reassigned: { type: Boolean, default: false },

    completedAt: Date,

    proof: {
      file: String,
      comments: String,
      status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "READY_FOR_REVIEW"],
        default: "PENDING",
      },
      message: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      reviewedAt: Date,
    },

  },
  { timestamps: true }
);

phaseSchema.pre("save", function (next) {
  if (this.status === "DONE" && this.completedAt && this.dueDate) {
    const delayMs = this.completedAt - this.dueDate;
    const delayPercent = delayMs > 0 ? (delayMs / (this.dueDate - this.createdAt)) * 100 : 0;

    this.delayPercent = Math.max(0, delayPercent);

    if (this.delayPercent === 0) this.delayCategory = "NONE";
    else if (this.delayPercent <= 20) this.delayCategory = "MINOR";
    else this.delayCategory = "MAJOR";
  }
  next();
});


const Task = mongoose.model("Task", taskSchema);
export default Task;
