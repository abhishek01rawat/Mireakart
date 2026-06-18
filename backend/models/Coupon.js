import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });

couponSchema.methods.isValid = function (cartTotal) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  if (now < this.startDate) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.endDate) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (cartTotal < this.minPurchase) return { valid: false, message: `Minimum purchase of ₹${this.minPurchase} required` };
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (cartTotal) {
  let discount = this.type === 'percentage' ? (cartTotal * this.value) / 100 : this.value;
  if (this.type === 'percentage' && this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.min(discount, cartTotal);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
