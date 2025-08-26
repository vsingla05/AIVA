import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    date: { type: Date, required: true },
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = new mongoose.model("Attendance", attendanceSchema);

export default Attendance;
