import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: null },
    eventType: {
      type: String,
      enum: ['PAGE_VIEW', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'PURCHASE', 'SEARCH', 'PRODUCT_VIEW', 'LOGIN', 'REGISTER', 'CLICK'],
      required: true,
    },
    path: { type: String, default: '/' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
