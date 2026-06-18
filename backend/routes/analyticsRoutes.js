import express from 'express';
import { logEvent, getAnalyticsSummary } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public — log any client event (auth optional)
router.post('/log', logEvent);

// Admin only — view aggregated summary
router.get('/summary', protect, admin, getAnalyticsSummary);

export default router;
