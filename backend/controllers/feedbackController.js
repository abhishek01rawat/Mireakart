import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';

// @desc  Submit feedback or bug report
// @route POST /api/feedback
// @access Public
export const submitFeedback = asyncHandler(async (req, res) => {
  const { type, message, page, name, email } = req.body;
  if (!message || message.trim().length < 5) {
    res.status(400);
    throw new Error('Please provide a meaningful message (at least 5 characters)');
  }

  const feedback = await Feedback.create({
    userId: req.user?._id || null,
    name: name || (req.user?.name) || 'Anonymous',
    email: email || (req.user?.email) || '',
    type: type || 'FEEDBACK',
    message: message.trim(),
    page: page || '/',
    userAgent: req.headers['user-agent'] || '',
  });

  res.status(201).json({ success: true, feedback });
});

// @desc  Get all feedback (admin)
// @route GET /api/feedback
// @access Admin
export const getAllFeedback = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const feedbacks = await Feedback.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');

  const total = await Feedback.countDocuments();
  res.json({ success: true, feedbacks, total, page, pages: Math.ceil(total / limit) });
});
