import cron from 'node-cron';
import { checkOverduePhases } from './overduePhaseChecker.js';

// Run every hour
cron.schedule("0 8 * * *", () => {
  console.log('Running overdue phase checker...');
  checkOverduePhases();
});
