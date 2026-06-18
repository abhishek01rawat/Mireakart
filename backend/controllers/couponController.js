import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  const validation = coupon.isValid(cartTotal);
  if (!validation.valid) { res.status(400); throw new Error(validation.message); }
  const discount = coupon.calculateDiscount(cartTotal);
  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount, description: coupon.description } });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});
