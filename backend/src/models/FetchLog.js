const mongoose = require('mongoose');

/**
 * FETCH LOG
 * ---------
 * Recorded each time the scrape orchestrator runs (manual or cron).
 * Powers the "Logs" tab in the Admin Panel so admins can see what ran,
 * what failed, and how many new items were stored.
 */
const fetchLogSchema = new mongoose.Schema(
  {
    triggeredBy: {
      type: String,
      enum: ['cron', 'manual', 'system'],
      required: true,
      index: true
    },
    triggeredByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: ['running', 'success', 'partial', 'failed'],
      default: 'running',
      index: true
    },

    startedAt:  { type: Date, default: Date.now },
    finishedAt: { type: Date },
    durationMs: { type: Number },

    // Per-source breakdown
    perSource: [{
      sourceId: String,
      sourceName: String,
      type: String,              // news/govt/competitor/evergreen
      attempted: Number,
      fetched: Number,           // items pulled from source
      inserted: Number,          // brand new items saved
      duplicates: Number,        // items that already existed (skipped)
      errors: Number,
      errorMessages: [String]
    }],

    // Aggregate totals
    totalFetched:   { type: Number, default: 0 },
    totalInserted:  { type: Number, default: 0 },
    totalDuplicates:{ type: Number, default: 0 },
    totalErrors:    { type: Number, default: 0 },

    notes: { type: String }
  },
  { timestamps: true }
);

fetchLogSchema.index({ startedAt: -1 });

module.exports = mongoose.model('FetchLog', fetchLogSchema);
