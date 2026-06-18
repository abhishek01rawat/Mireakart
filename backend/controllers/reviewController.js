import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;
  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) { res.status(400); throw new Error('Already reviewed'); }
  const ordered = await Order.findOne({ user: req.user._id, 'orderItems.product': productId, isPaid: true });
  const review = await Review.create({ user: req.user._id, product: productId, rating, title, comment, isVerifiedPurchase: !!ordered });
  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populated });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const count = await Review.countDocuments({ product: req.params.productId });
  const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort('-createdAt').skip((page - 1) * limit).limit(limit);
  res.json({ success: true, reviews, page, pages: Math.ceil(count / limit), total: count });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  await Review.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});
