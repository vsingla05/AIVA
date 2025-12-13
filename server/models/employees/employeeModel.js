import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },

    phone: String,
    address: String,
    imageUrl: String,

    /* ───────────────────────────────
       ⚙️ Department
    ─────────────────────────────── */
    department: String,

    role: { type: String, default: "EMPLOYEE" },
    joinDate: { type: Date, default: Date.now },

    /* ───────────────────────────────
       🧳 Leave Balance
    ─────────────────────────────── */
    leaveBalance: {
      totalLeave: { type: Number, default: 20 },
    },

    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    isActive: { type: Boolean, default: true },
    isAssigned: { type: Boolean, default: false },

    /* ───────────────────────────────
       🧠 Skills
    ─────────────────────────────── */
    skills: [
      {
        name: String,
        level: { type: Number, default: 1 }, // 1–5 recommended
      },
    ],

    skillEmbeddings: [
      {
        skill: String, // "react skill level 3"
        embedding: [Number], // 1536-d embedding vector
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    /* ───────────────────────────────
       🔔 Notifications
    ─────────────────────────────── */
    notifications: [
      {
        message: String,
        createdAt: Date,
        taskId: mongoose.Schema.Types.ObjectId,
        isRead: Boolean,
      },
    ],

    /* ───────────────────────────────
       📄 Reports
    ─────────────────────────────── */
    reports: [
      {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
        pdfUrl: {
          view: String,
          download: String,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    /* ───────────────────────────────
       🕒 Availability
    ─────────────────────────────── */
    availability: {
      maxWeeklyHours: { type: Number, default: 40 }, // Realistic default
      holidays: [Date], // Dates when employee is unavailable
    },

    /* Current weekly load in hours */
    currentLoad: { type: Number, default: 0 },

    /* ───────────────────────────────
       📊 Performance Metrics
    ─────────────────────────────── */
    performance: {
      taskCompletionRate: { type: Number, default: 0 },
      avgQualityRating: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 }, // Should start at 0
      performanceScore: { type: Number, default: 100 }, // Global score (AI updated)
    },

    /* ───────────────────────────────
       📈 Task Statistics
    ─────────────────────────────── */
    taskStats: {
      completedPhaseTasks: { type: Number, default: 0 },
      delayedPhaseTasks: { type: Number, default: 0 },

      minorDelays: { type: Number, default: 0 },
      majorDelays: { type: Number, default: 0 },

      completedTasks: { type: Number, default: 0 },
      delayedTasks: { type: Number, default: 0 },

      totalEstimatedHours: { type: Number, default: 0 },
      totalActualHours: { type: Number, default: 0 },

      totalTaskAssigned: { type: Number, default: 0 },
      rejectedTasks: { type: Number, default: 0 },
    },

    refreshToken: String,
  },
  { timestamps: true }
);

/* ───────────────────────────────
   🔐 Password Hashing
─────────────────────────────── */
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ───────────────────────────────
   🔑 JWT Tokens
─────────────────────────────── */
employeeSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

employeeSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/* ───────────────────────────────
   📦 Export Model
─────────────────────────────── */
const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
