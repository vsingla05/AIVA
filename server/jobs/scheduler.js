import Agenda from "agenda";
import dotenv from "dotenv";
import { runMonitoring } from '../controllers/monitoring/runMonitoring.js'

dotenv.config();

// 1. Connect Agenda to your MongoDB (It creates a collection 'agendaJobs')
const mongoConnectionString = process.env.MONGO_URI_ATLAS;

const agenda = new Agenda({ 
  db: { address: mongoConnectionString, collection: "agendaJobs" },
  maxConcurrency: 1, // Prevent overlapping job executions
  processEvery: "10 seconds", // Check for new jobs more frequently
});

// 2. Define the Job with enhanced error handling
agenda.define("taskDeadline-monitoring", async (job) => {
  const jobStartTime = new Date();
  console.log(`⏰ [${jobStartTime.toLocaleString()}] Starting 12-Hour Monitoring Job...`);
  
  try {
    // Execute your logic with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Monitoring timeout after 30 minutes")), 30 * 60 * 1000)
    );
    
    await Promise.race([runMonitoring(), timeoutPromise]);
    
    const jobEndTime = new Date();
    const duration = (jobEndTime - jobStartTime) / 1000;
    console.log(`✅ Monitoring Cycle Completed Successfully in ${duration}s`);
    
    // Mark job as completed
    await job.save();
    
  } catch (error) {
    console.error("❌ Error during monitoring execution:", error.message);
    console.error(error.stack);
    
    // Retry logic: Agenda will automatically retry failed jobs
    job.fail(error);
    await job.save();
  }
});

// Handle scheduler startup/stop events
agenda.on("start", () => {
  console.log("🟢 Agenda Scheduler is RUNNING");
});

agenda.on("stop", () => {
  console.log("🔴 Agenda Scheduler STOPPED");
});

agenda.on("fail", (error, job) => {
  console.error(`⚠️ Job failed: ${job.attrs.name}`, error.message);
});

// 3. Export the Start Function
export async function startScheduler() {
  try {
    await agenda.start();
    console.log("🚀 Agenda Scheduler initialized and started.");

    // Remove any existing jobs to prevent duplicates
    await agenda.cancel({ name: "taskDeadline-monitoring" });
    
    // Schedule it to run every 12 hours
    // Agenda is smart: it checks the DB to see if it already scheduled this.
    await agenda.every("12 hours", "taskDeadline-monitoring");
    
    // Also run immediately on startup to ensure monitoring starts
    await agenda.now("taskDeadline-monitoring");
    
    console.log("✅ Monitoring scheduled every 12 hours (first run executed immediately)");
    
  } catch (error) {
    console.error("❌ Failed to start scheduler:", error.message);
    console.error(error.stack);
    // Don't exit - let the server run even if scheduler fails
  }
}

// Graceful shutdown
export async function stopScheduler() {
  try {
    await agenda.stop();
    console.log("🛑 Agenda Scheduler gracefully stopped");
  } catch (error) {
    console.error("❌ Error stopping scheduler:", error);
  }
}