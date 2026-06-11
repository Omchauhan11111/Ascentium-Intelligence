const express = require('express');
const mongoose = require('mongoose');
const FetchLog = require('../models/FetchLog');

const router = express.Router();

function verifySecret(req, res, next) {
  const expected = process.env.N8N_CALLBACK_SECRET;
  if (!expected) {
    return res.status(500).json({ message: 'N8N_CALLBACK_SECRET is not configured' });
  }

  const provided = req.get('x-n8n-secret') || req.body?.secret;
  if (provided !== expected) {
    return res.status(401).json({ message: 'Invalid n8n callback secret' });
  }

  next();
}

function normalizeStatus(status) {
  if (['running', 'success', 'partial', 'failed'].includes(status)) return status;
  return 'success';
}

function cleanLogId(value) {
  const id = String(value || '').trim().replace(/^=+/, '');
  return mongoose.Types.ObjectId.isValid(id) ? id : '';
}

function normalizePerSource(perSource) {
  if (typeof perSource === 'string') {
    try {
      perSource = JSON.parse(perSource);
    } catch (_err) {
      return [];
    }
  }
  if (!Array.isArray(perSource)) return [];

  return perSource.map((row) => ({
    sourceId: row.sourceId || row.source || row.sourceName || 'n8n',
    sourceName: row.sourceName || row.source || 'n8n workflow',
    type: row.type || 'news',
    attempted: Number(row.attempted || row.fetched || 0),
    fetched: Number(row.fetched || 0),
    inserted: Number(row.inserted || 0),
    duplicates: Number(row.duplicates || 0),
    errors: Number(row.errors || 0),
    errorMessages: Array.isArray(row.errorMessages) ? row.errorMessages : []
  }));
}

function totalsFromPayload(body, perSource) {
  const summed = perSource.reduce(
    (acc, row) => ({
      fetched: acc.fetched + Number(row.fetched || 0),
      inserted: acc.inserted + Number(row.inserted || 0),
      duplicates: acc.duplicates + Number(row.duplicates || 0),
      errors: acc.errors + Number(row.errors || 0)
    }),
    { fetched: 0, inserted: 0, duplicates: 0, errors: 0 }
  );

  return {
    totalFetched: Number(body.totalFetched ?? body.fetched ?? summed.fetched ?? 0),
    totalInserted: Number(body.totalInserted ?? body.inserted ?? summed.inserted ?? 0),
    totalDuplicates: Number(body.totalDuplicates ?? body.duplicates ?? summed.duplicates ?? 0),
    totalErrors: Number(body.totalErrors ?? body.errors ?? summed.errors ?? 0)
  };
}

router.post('/log', verifySecret, async (req, res, next) => {
  try {
    const body = req.body || {};
    const now = new Date();
    const perSource = normalizePerSource(body.perSource);
    const totals = totalsFromPayload(body, perSource);
    const startedAt = body.startedAt ? new Date(body.startedAt) : now;
    const finishedAt = body.finishedAt ? new Date(body.finishedAt) : now;
    const status = normalizeStatus(body.status || (totals.totalErrors > 0 ? 'partial' : 'success'));

    const update = {
      triggeredBy: body.triggeredBy || 'n8n',
      status,
      startedAt,
      finishedAt,
      durationMs: Math.max(finishedAt.getTime() - startedAt.getTime(), 0),
      perSource,
      ...totals,
      notes: body.notes || 'n8n workflow callback'
    };

    const logId = cleanLogId(body.logId);
    const log = logId
      ? await FetchLog.findByIdAndUpdate(logId, { $set: update }, { new: true, upsert: false })
      : await FetchLog.create(update);

    if (!log) {
      return res.status(404).json({ message: 'Fetch log not found' });
    }

    res.json({ ok: true, logId: log._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
