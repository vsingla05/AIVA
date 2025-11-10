import express from 'express';
import connectDB from './ConnectDB.js';
import cookieParser from 'cookie-parser';
import employeeRoutes from './routers/employees/employeeRoutes.js';
import authRoutes from './routers/auth/authRoutes.js'
import aiRoutes from './routers/ai/aiRoutes.js'
import taskRoutes from './routers/task/taskRoutes.js'
import leaveRoutes from './routers/leave/leaveRoutes.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express();
const port = 3000

connectDB();

app.use(express.json());        
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());       

app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/ai', aiRoutes)
app.use('/api/v1/task', taskRoutes)
app.use('/api/v1/leave', leaveRoutes)


app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
