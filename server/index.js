import express from 'express';
import connectDB from './ConnectDB.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";

// Routes
import employeeRoutes from './routers/employees/employeeRoutes.js';
import authRoutes from './routers/auth/authRoutes.js';
import aiRoutes from './routers/ai/aiRoutes.js';
import taskRoutes from './routers/task/taskRoutes.js';
import leaveRoutes from './routers/leave/leaveRoutes.js';
import managerRoutes from './routers/manager/managerRoutes.js'

// Jobs
import { startScheduler, stopScheduler } from './jobs/scheduler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server first
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make IO globally available
global.io = io;

// Handle socket connections
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Manager/Employee will join their personal room using ID
  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());   // THIS is what you need
    console.log(`📌 User joined personal room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/task', taskRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/manager', managerRoutes)

// --- SERVER STARTUP ---
const startServer = async () => {
  try {
    await connectDB();

    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log("⚡ Socket.IO server running");

      startScheduler();
      console.log("⏳ Monitoring Scheduler initiated");
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();



