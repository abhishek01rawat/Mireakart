import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, image: { type: String, required: true },
  brand: { type: String }, price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }, variant: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'Stripe' },
    paymentResult: { id: String, status: String, update_time: String, email_address: String },
    paymentScreenshot: { url: String },
    paymentVerificationStatus: { type: String, enum: ['Not Uploaded', 'Pending', 'Verified', 'Rejected'], default: 'Not Uploaded' },
    paymentDeadline: Date,
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: { type: String, enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'], default: 'Processing' },
    stockDecremented: { type: Boolean, default: false },
    deliveredAt: Date, trackingNumber: String, notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
