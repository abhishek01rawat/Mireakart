import asyncHandler from 'express-async-handler';
import Analytics from '../models/Analytics.js';

// @desc  Log a client-side event
// @route POST /api/analytics/log
// @access Public
export const logEvent = asyncHandler(async (req, res) => {
  const { eventType, path, metadata, sessionId } = req.body;

  if (!eventType) {
    res.status(400);
    throw new Error('eventType is required');
  }

  await Analytics.create({
    userId: req.user?._id || null,
    sessionId: sessionId || null,
    eventType,
    path: path || '/',
    metadata: metadata || {},
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
  });

  res.status(201).json({ success: true });
});

// @desc  Get analytics summary for admin dashboard
// @route GET /api/analytics/summary
// @access Admin
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Event counts by type
  const eventCounts = await Analytics.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$eventType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Daily page views for the chart
  const dailyPageViews = await Analytics.aggregate([
    { $match: { eventType: 'PAGE_VIEW', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top pages visited
  const topPages = await Analytics.aggregate([
    { $match: { eventType: 'PAGE_VIEW', createdAt: { $gte: since } } },
    { $group: { _id: '$path', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Total events in period
  const totalEvents = await Analytics.countDocuments({ createdAt: { $gte: since } });
  const uniqueSessions = await Analytics.distinct('sessionId', { createdAt: { $gte: since } });

  res.json({
    success: true,
    summary: {
      totalEvents,
      uniqueSessions: uniqueSessions.filter(Boolean).length,
      eventCounts,
      dailyPageViews,
      topPages,
    },
  });
});
