import Agenda from "agenda";
import dotenv from "dotenv";
import { runMonitoring } from '../controllers/monitoring/runMonitoring.js'

dotenv.config();

// 1. Connect Agenda to your MongoDB (It creates a collection 'agendaJobs')
const mongoConnectionString = process.env.MONGO_URI_ATLAS;

const agenda = new Agenda({ 
  db: { address: mongoConnectionString, collection: "agendaJobs" } 
});

// 2. Define the Job
// We give it a name ('office-monitoring') and tell it what function to run
agenda.define("taskDeadline-monitoring", async (job) => {
  console.log(`⏰ [${new Date().toLocaleTimeString()}] Starting 12-Hour Monitoring...`);
  
  try {
    // Execute your logic
    await runMonitoring();
    console.log("✅ Monitoring Cycle Completed Successfully.");
  } catch (error) {
    console.error("❌ Error during monitoring execution:", error);
    // Optional: Notify admin if the monitoring script itself crashes
  }
});

// 3. Export the Start Function
export async function startScheduler() {
  try {
    await agenda.start();
    console.log("🚀 Agenda Scheduler initialized.");

    // Schedule it to run every 12 hours
    // Agenda is smart: it checks the DB to see if it already scheduled this.
    await agenda.every("12 hours", "taskDeadline-monitoring");
    
  } catch (error) {
    console.error("❌ Failed to start scheduler:", error);
  }
}