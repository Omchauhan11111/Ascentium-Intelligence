/**
 * Cron job runner.
 *
 * Default schedule: 7:00 AM India Standard Time, every day.
 * Configurable via CRON_SCHEDULE and CRON_TIMEZONE in .env.
 *
 * Set ENABLE_CRON=false to disable (useful in dev).
 */
const cron = require('node-cron');
const orchestrator = require('../services/orchestrator');

let task = null;

function start() {
  if (process.env.ENABLE_CRON === 'false') {
    console.log('[cron] disabled by ENABLE_CRON=false');
    return;
  }
  const schedule = process.env.CRON_SCHEDULE || '0 7 * * *';
  const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

  if (!cron.validate(schedule)) {
    console.error(`[cron] invalid CRON_SCHEDULE: ${schedule}`);
    return;
  }

  task = cron.schedule(
    schedule,
    async () => {
      console.log(`[cron] tick @ ${new Date().toISOString()} — running orchestrator`);
      try {
        const r = await orchestrator.runAll({ triggeredBy: 'cron' });
        console.log('[cron] done', r);
      } catch (err) {
        console.error('[cron] FAILED', err);
      }
    },
    { timezone, scheduled: true }
  );

  console.log(`[cron] scheduled "${schedule}" (${timezone})`);
}

function stop() {
  if (task) {
    task.stop();
    task = null;
  }
}

module.exports = { start, stop };
