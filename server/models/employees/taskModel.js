import mongoose from "mongoose";

// Phase/milestone schema
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
  },
  { _id: true, timestamps: true }
);

// Skill requirement schema
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 1 }, // 1–5 scale
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // Assigned employee, AI can fill later
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // HR / Manager assigning task
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

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

    // Optional phases/milestones
    phases: [phaseSchema],

    // Indicates if phases were AI-generated
    createdByAI: { type: Boolean, default: false },

    // Alerts for delays/issues
    alerts: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false },
      },
    ],

    // Required skills for this task
    requiredSkills: [skillSchema],

    // Estimated number of hours to complete task
    estimatedHours: { type: Number, default: 0 },

    // Fallback employees if AI cannot find a perfect match
    fallbackEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // Reassignment flag if employee falls behind
    reassigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
