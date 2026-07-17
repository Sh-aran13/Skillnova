// ════════════════════════════════════════════════════════════
//  Streak Scheduler Check
// ════════════════════════════════════════════════════════════
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { runDailyStreakScheduler } from './streak.service.js';

export function startStreakScheduler() {
  logger.info('🕒 Starting learning streak daily scheduler check');
  
  // Check immediately on startup
  checkAndRunScheduler().catch(err => logger.error({ err }, 'streak-scheduler-startup-error'));
  
  // Then check every hour
  setInterval(() => {
    checkAndRunScheduler().catch(err => logger.error({ err }, 'streak-scheduler-interval-error'));
  }, 60 * 60 * 1000); // 1 hour
}

async function checkAndRunScheduler() {
  // We use YYYY-MM-DD representation of current date in UTC as our key
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Try to find the system setting tracking the last scheduler run
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'streak_scheduler_last_run' }
  });
  
  // Under Prisma, if it doesn't exist, setting is null.
  // If it exists, let's see if the value matches todayStr.
  // Note: key-value key is mapped as key: String, value: Json.
  if (setting && (setting.value === todayStr || JSON.stringify(setting.value) === JSON.stringify(todayStr))) {
    // Already ran today
    return;
  }
  
  logger.info(`🕒 Running learning streak scheduler for date: ${todayStr}`);
  
  // Run the scheduler
  await runDailyStreakScheduler();
  
  // Update setting
  await prisma.systemSetting.upsert({
    where: { key: 'streak_scheduler_last_run' },
    update: { value: todayStr },
    create: { key: 'streak_scheduler_last_run', value: todayStr }
  });
  
  logger.info(`🕒 Learning streak scheduler completed successfully for date: ${todayStr}`);
}
