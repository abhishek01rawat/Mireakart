import express from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderToPaid, updateOrderStatus, getOrders, getOrderStats, createRazorpayOrder, verifyRazorpayPayment, uploadPaymentScreenshot, verifyManualPayment } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

router.get('/mine', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/screenshot', protect, uploadPaymentScreenshot);
router.put('/:id/verify-payment', protect, admin, verifyManualPayment);
router.get('/', protect, admin, getOrders);

export default router;
