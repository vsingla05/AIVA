import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    employeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee",
        required: true
    },
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee",
        required: true
    }, 
    dueDate: {
        type: Date,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
