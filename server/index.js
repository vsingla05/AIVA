import express from 'express';
import cors from 'cors'; // <--- IMPORT THIS
import connectDB from './ConnectDB.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Routes
import employeeRoutes from './routers/employees/employeeRoutes.js';
import authRoutes from './routers/auth/authRoutes.js';
import aiRoutes from './routers/ai/aiRoutes.js';
import taskRoutes from './routers/task/taskRoutes.js';
import leaveRoutes from './routers/leave/leaveRoutes.js';

// Jobs
import { startScheduler } from './jobs/scheduler.js';

dotenv.config();

const app = express();
// Use the port from .env or default to 3000
const port = process.env.PORT || 3000; 

// --- MIDDLEWARE ---

// 1. Enable CORS (Crucial for React)
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your React App's URL
  credentials: true, // Allows sending cookies from React to Node
}));

app.use(express.json());        
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());       

// --- ROUTES ---
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/task', taskRoutes);
app.use('/api/v1/leave', leaveRoutes);

// --- SERVER STARTUP ---
const startServer = async () => {
  try {
    // 1. Connect to DB first
    await connectDB(); 
    
    // 2. Start the Server
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      
      // 3. Start the Background Monitoring
      startScheduler(); 
      console.log("✅ Monitoring Scheduler initiated");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1); // Exit if DB fails (optional but safer)
  }
};

startServer();