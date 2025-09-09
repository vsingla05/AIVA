import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    completedAt: Date,
    delayCategory: {
      type: String,
      enum: ["NONE", "MINOR", "MAJOR"],
      default: "NONE",
    },
    delayPercent: { type: Number, default: 0 },
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
      enum: ["TODO", "IN_PROGRESS", "ON_HOLD", "DONE"],
      default: "TODO",
    },

    phases: [phaseSchema],
    createdByAI: { type: Boolean, default: false },

    alerts: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false },
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
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
      },
      message: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      reviewedAt: Date,
    },

  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
