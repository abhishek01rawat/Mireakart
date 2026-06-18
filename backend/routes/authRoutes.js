import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  sendLoginOTP,
  loginWithOTP,
  sendRegisterOTP,
  forgotPassword,
  resetPassword,
  googleLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidator, loginValidator } from '../middleware/validator.js';

const router = express.Router();

// Password auth
router.post('/register', registerValidator, register);
router.post('/register-otp/send', sendRegisterOTP);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Google auth
router.post('/google', googleLogin);

// OTP auth
router.post('/otp/send', sendLoginOTP);
router.post('/otp/verify', loginWithOTP);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
