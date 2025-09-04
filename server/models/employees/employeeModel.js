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
    role: { type: String, default: "EMPLOYEE" },
    joinDate: { type: Date, default: Date.now },
    leaveBalance: {
      cl: { type: Number, default: 6 },
      sl: { type: Number, default: 6 },
      el: { type: Number, default: 10 },
    },
    isActive: { type: Boolean, default: true },
    isAssigned: { type: Boolean, default: false },

    // Skills for AI matching
    skills: [
      {
        name: String,
        level: { type: Number, default: 1 }, // 1–5 scale
      },
    ],

    reports: [
    {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      pdfUrl: String,
      createdAt: { type: Date, default: Date.now },
    }
  ],


    // Current task load & availability
    currentLoad: { type: Number, default: 0 }, 
    availability: {
      maxWeeklyHours: { type: Number, default: 40 },
      holidays: [Date],
    },

    // Performance metrics for AI ranking
    performance: {
      taskCompletionRate: { type: Number, default: 0.7 }, 
      avgQualityRating: { type: Number, default: 0.7 },  
    },

    refreshToken: String,
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

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

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
