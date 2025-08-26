import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
        type:String,
    },
    description: {
        type: String,
    },
    employeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Employee" 
    },
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "HR" 
    }, 
    dueDate: {
        typd:Date,
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

const Task = new mongoose.model("Task", taskSchema);
export default Task
