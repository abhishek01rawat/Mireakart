import express from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public — submit feedback/bug report (auth optional)
router.post('/', submitFeedback);

// Admin only — view all submissions
router.get('/', protect, admin, getAllFeedback);

export default router;
