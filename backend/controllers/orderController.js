import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, discountAmount = 0 } = req.body;
  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }

  let itemsPrice = 0;
  let allInStock = true;

  // Validate products and check stock availability
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) { res.status(404); throw new Error(`Product not found`); }
    if (product.stock < item.quantity) {
      allInStock = false;
    }
    itemsPrice += product.price * item.quantity;
  }

  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
  const shippingPrice = itemsPrice > 499 ? 0 : 49;
  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - discountAmount) * 100) / 100;

  // Online QR Code orders are Processing until admin confirms payment
  const isOnlineQRCode = paymentMethod === 'Online QR Code';
  const paymentDeadline = isOnlineQRCode ? new Date(Date.now() + 2 * 60 * 60 * 1000) : undefined;
  const orderStatus = isOnlineQRCode ? 'Processing' : (allInStock ? 'Confirmed' : 'Processing');

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    couponCode,
    status: orderStatus,
    stockDecremented: allInStock, // reserve stock if all items are in stock
    paymentDeadline,
  });

  // Only decrement stock if all items are in stock
  if (allInStock) {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
    }
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // --- Send Order Confirmation Email ---
  const emailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#E80071,#FF6B9D);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">Order Placed! 🎉</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#718096;margin:0 0 16px;">Hi there,</p>
        <p style="color:#718096;margin:0 0 24px;">Thank you for shopping with Mireakart! Your order <strong>#${order._id.toString().toUpperCase().slice(-6)}</strong> has been successfully placed.</p>
        
        <div style="background:#F8FAFC;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h3 style="margin:0 0 12px;color:#1a202c;font-size:16px;">Order Summary</h3>
          ${orderItems.map(item => `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;color:#4a5568;">
              <span>${item.quantity}x ${item.name}</span>
              <span style="font-weight:600;">₹${item.price * item.quantity}</span>
            </div>
          `).join('')}
          <div style="border-top:1px solid #cbd5e0;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#1a202c;">
            <span>Total Paid</span>
            <span>₹${order.totalPrice}</span>
          </div>
        </div>
        <p style="color:#a0aec0;font-size:13px;margin:0;text-align:center;">We'll notify you when your order ships.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: req.user.email,
    subject: `Order Confirmation - #${order._id.toString().toUpperCase().slice(-6)}`,
    text: `Your Mireakart order for ₹${order.totalPrice} has been successfully placed.`,
    html: emailHtml
  }).catch(err => console.log('Silently ignoring email failure:', err));
  // -------------------------------------

  res.status(201).json({ success: true, order });
});

// Helper to cancel expired unpaid orders (disabled by user request)
const checkAndCancelExpiredOrders = async () => {
  // Bypassed: user does not want automatic cancellation windows
};

export const getMyOrders = asyncHandler(async (req, res) => {
  await checkAndCancelExpiredOrders();
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  await checkAndCancelExpiredOrders();
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  res.json({ success: true, order });
});

export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.isPaid = true; order.paidAt = Date.now(); order.status = 'Confirmed';
  order.paymentResult = { id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.email_address };
  const updated = await order.save();
  res.json({ success: true, order: updated });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const previousStatus = order.status;
  order.status = req.body.status;

  if (req.body.status === 'Delivered') order.deliveredAt = Date.now();
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;

  // Decrement stock when seller confirms a previously-pending order
  if (previousStatus === 'Processing' && req.body.status === 'Confirmed' && !order.stockDecremented) {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
    }
    order.stockDecremented = true;
  }

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

export const getOrders = asyncHandler(async (req, res) => {
  await checkAndCancelExpiredOrders();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const count = await Order.countDocuments(query);
  const orders = await Order.find(query).populate('user', 'name email').skip((page - 1) * limit).limit(limit).sort('-createdAt');
  res.json({ success: true, orders, page, pages: Math.ceil(count / limit), total: count });
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
  const pendingOrders = await Order.countDocuments({ status: 'Processing' });
  const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
  res.json({ success: true, stats: { totalOrders, pendingOrders, deliveredOrders, totalRevenue: totalRevenue[0]?.total || 0 } });
});

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay/create
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (!amount) {
    res.status(400);
    throw new Error('No amount provided');
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
    res.status(500);
    throw new Error('Some error occurred while creating Razorpay order');
  }

  res.json({ success: true, order });
});

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/razorpay/verify
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    // Payment verified successfully
    const order = await Order.findById(order_id);
    
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing'; // Move status forward if needed
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        update_time: Date.now().toString(),
        email_address: req.user.email,
      };

      const updatedOrder = await order.save();
      return res.status(200).json({ success: true, message: 'Payment verified successfully', order: updatedOrder });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } else {
    res.status(400);
    throw new Error('Invalid signature sent!');
  }
});

// @desc    Upload Payment Screenshot for Manual QR Code Order
// @route   PUT /api/orders/:id/screenshot
// @access  Private
export const uploadPaymentScreenshot = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  
  if (order.paymentVerificationStatus === 'Verified') {
    res.status(400);
    throw new Error('Payment already verified');
  }

  if (order.paymentDeadline && new Date() > order.paymentDeadline) {
    res.status(400);
    throw new Error('Payment deadline has expired. Cannot upload screenshot.');
  }

  order.paymentScreenshot = { url: req.body.url };
  order.paymentVerificationStatus = 'Pending';
  
  const updatedOrder = await order.save();
  res.json({ success: true, order: updatedOrder });
});

export const verifyManualPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const { approve } = req.body;

  if (approve) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Confirmed';
    order.paymentVerificationStatus = 'Verified';
    
    // Decrement stock if not already decremented
    if (!order.stockDecremented) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } });
      }
      order.stockDecremented = true;
    }

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; max-width: 600px; border: 1px solid #f0f0f0; border-radius: 12px; background: #ffffff; color: #333333;">
        <h2 style="color: #10B981; margin-top: 0;">🎉 Payment Confirmed!</h2>
        <p>Dear <strong>${order.user?.name || 'Customer'}</strong>,</p>
        <p>We are happy to inform you that your manual payment screenshot for order <strong>#${order._id.toString().toUpperCase().slice(-6)}</strong> has been successfully verified and approved by our team.</p>
        <p>Your order status has been updated to <strong>Confirmed</strong> and is now being prepared for shipping.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 0.9rem; color: #666666;">Thank you for shopping with Mireakart!</p>
      </div>
    `;
    await sendEmail({
      to: order.user?.email,
      subject: `Payment Approved - Order #${order._id.toString().toUpperCase().slice(-6)} Confirmed`,
      html: emailHtml,
      text: `Your payment for order #${order._id.toString().toUpperCase().slice(-6)} has been approved. Your order status is Confirmed.`
    }).catch(err => console.log('Silently ignoring email failure:', err));

  } else {
    order.paymentVerificationStatus = 'Rejected';

    // Send rejection email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; line-height: 1.6; max-width: 600px; border: 1px solid #f0f0f0; border-radius: 12px; background: #ffffff; color: #333333;">
        <h2 style="color: #EF4444; margin-top: 0;">⚠️ Payment Screenshot Rejected</h2>
        <p>Dear <strong>${order.user?.name || 'Customer'}</strong>,</p>
        <p>We were unable to verify the payment screenshot you uploaded for order <strong>#${order._id.toString().toUpperCase().slice(-6)}</strong>. As a result, the payment verification status has been marked as <strong>Rejected</strong>.</p>
        <p>Please log in to your account, visit your order details page, and upload a valid payment confirmation screenshot to complete your order confirmation.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 0.9rem; color: #666666;">If you have any questions, please contact our customer support team.</p>
      </div>
    `;
    await sendEmail({
      to: order.user?.email,
      subject: `Payment Verification Action Required - Order #${order._id.toString().toUpperCase().slice(-6)}`,
      html: emailHtml,
      text: `Your payment screenshot for order #${order._id.toString().toUpperCase().slice(-6)} was rejected. Please upload a valid screenshot.`
    }).catch(err => console.log('Silently ignoring email failure:', err));
  }

  const updated = await order.save();
  res.json({ success: true, order: updated });
});
