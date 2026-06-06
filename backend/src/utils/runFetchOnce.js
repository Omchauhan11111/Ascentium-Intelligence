/**
 * Run all scrapers once from the command line.
 * Usage: cd backend && npm run fetch:once
 *
 * Useful for testing or for a "fetch on demand" cron from outside the app.
 */
require('dotenv').config();
const { connectDB, mongoose } = require('../config/db');
const orchestrator = require('../services/orchestrator');

(async () => {
  try {
    await connectDB();
    console.log('[fetch:once] starting orchestrator...');
    const result = await orchestrator.runAll({ triggeredBy: 'manual' });
    console.log('[fetch:once] done', {
      inserted: result.totalInserted,
      duplicates: result.totalDuplicates,
      errors: result.totalErrors
    });
  } catch (err) {
    console.error('[fetch:once] FAILED', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
