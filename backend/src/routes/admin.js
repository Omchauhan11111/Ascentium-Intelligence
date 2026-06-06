const express = require('express');
const Article = require('../models/Article');
const FetchLog = require('../models/FetchLog');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const orchestrator = require('../services/orchestrator');

const router = express.Router();

// Helper to catch async route errors and pass them to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Every route here requires super_admin
router.use(protect, requireRole('super_admin'));

// ============== ARTICLE MANAGEMENT ==============

// PATCH /api/admin/articles/:id/publish
router.patch('/articles/:id/publish', asyncHandler(async (req, res) => {
  const item = await Article.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isPublished: true,
        publishedBy: req.user._id,
        publishedAtAdmin: new Date()
      }
    },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ item });
}));

// PATCH /api/admin/articles/:id/unpublish
router.patch('/articles/:id/unpublish', asyncHandler(async (req, res) => {
  const item = await Article.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isPublished: false
      }
    },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ item });
}));

// POST /api/admin/articles/bulk-publish    body: { ids: [...] }
router.post('/articles/bulk-publish', asyncHandler(async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'ids[] required' });

  const result = await Article.updateMany(
    { _id: { $in: ids } },
    { $set: { isPublished: true, publishedBy: req.user._id, publishedAtAdmin: new Date() } }
  );
  res.json({ matched: result.matchedCount, modified: result.modifiedCount });
}));

// POST /api/admin/articles/bulk-unpublish    body: { ids: [...] }
router.post('/articles/bulk-unpublish', asyncHandler(async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'ids[] required' });
  const result = await Article.updateMany(
    { _id: { $in: ids } },
    { $set: { isPublished: false } }
  );
  res.json({ matched: result.matchedCount, modified: result.modifiedCount });
}));

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', asyncHandler(async (req, res) => {
  const item = await Article.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted', id: req.params.id });
}));

// POST /api/admin/articles/bulk-delete    body: { ids: [...] }
router.post('/articles/bulk-delete', asyncHandler(async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'ids[] required' });
  const result = await Article.deleteMany({ _id: { $in: ids } });
  res.json({ deleted: result.deletedCount });
}));

// PATCH /api/admin/articles/:id  (edit title, summary, category, etc.)
router.patch('/articles/:id', asyncHandler(async (req, res) => {
  const allowed = ['title', 'summary', 'category', 'subcategory', 'tags', 'country', 'aiSummary'];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  const item = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ item });
}));

// ============== FETCH (manual trigger) ==============

let isFetching = false;

// POST /api/admin/fetch    body: { types?: ['news','govt','competitor','evergreen'] }
router.post('/fetch', asyncHandler(async (req, res) => {
  if (isFetching) {
    return res.status(409).json({ message: 'A fetch is already in progress' });
  }
  isFetching = true;
  // Respond immediately; let scrape run in background.
  res.json({ message: 'Fetch started', triggeredBy: 'manual', startedAt: new Date() });

  try {
    await orchestrator.runAll({
      triggeredBy: 'manual',
      triggeredByUser: req.user._id,
      types: req.body?.types
    });
  } catch (err) {
    console.error('[admin] manual fetch failed:', err);
  } finally {
    isFetching = false;
  }
}));

// GET /api/admin/fetch/status
router.get('/fetch/status', (_req, res) => {
  res.json({ isFetching });
});

// ============== STATS ==============

router.get('/stats', asyncHandler(async (_req, res) => {
  const [total, published, unpublished, byType, byCategory, recent] = await Promise.all([
    Article.countDocuments({}),
    Article.countDocuments({ isPublished: true }),
    Article.countDocuments({ isPublished: false }),
    Article.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Article.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
    Article.find({}).sort({ fetchedAt: -1 }).limit(5).select('title type source fetchedAt isPublished').lean()
  ]);
  res.json({
    counts: { total, published, unpublished },
    byType: Object.fromEntries(byType.map((x) => [x._id, x.count])),
    byCategory: byCategory.map((x) => ({ category: x._id, count: x.count })),
    recent
  });
}));

// ============== LOGS ==============

router.get('/logs', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    FetchLog.find({}).sort({ startedAt: -1 }).skip(skip).limit(limit).populate('triggeredByUser', 'name email').lean(),
    FetchLog.countDocuments({})
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
}));

router.get('/logs/:id', asyncHandler(async (req, res) => {
  const item = await FetchLog.findById(req.params.id).populate('triggeredByUser', 'name email').lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ item });
}));

// ============== USER MANAGEMENT ==============

router.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
  const q = {};
  if (req.query.role) q.role = req.query.role;
  if (req.query.q) q.email = { $regex: req.query.q, $options: 'i' };
  const [items, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(q)
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const allowed = ['name', 'role', 'isActive', 'company', 'designation'];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  if (update.role && !['user', 'super_admin'].includes(update.role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const u = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!u) return res.status(404).json({ message: 'Not found' });
  res.json({ user: u.toPublicJSON() });
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted', id: req.params.id });
}));

module.exports = router;
