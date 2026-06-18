import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// ─── Password Login ──────────────────────────────────────────────────────────

export const sendRegisterOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) { res.status(400); throw new Error('An account with this email already exists'); }

  const otp = crypto.randomInt(100000, 999999).toString();

  // Upsert OTP document (replaces if exists)
  await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    { otpCode: otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#E80071,#FF6B9D);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">Mireakart 💄</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a202c;margin:0 0 8px;">Verify Your Email</h2>
        <p style="color:#718096;margin:0 0 24px;">Use the code below to complete your registration. It expires in <strong>5 minutes</strong>.</p>
        <div style="background:#FFF5F9;border:2px dashed #E80071;border-radius:10px;padding:24px;text-align:center;">
          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#E80071;">${otp}</span>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: normalizedEmail,
    subject: `${otp} is your Mireakart registration OTP`,
    text: `Your Mireakart registration OTP is: ${otp}. It expires in 5 minutes.`,
    html,
  });

  res.json({ success: true, message: `OTP sent to ${normalizedEmail}` });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, otp } = req.body;
  if (!otp) { res.status(400); throw new Error('OTP is required for registration'); }

  const normalizedEmail = email.toLowerCase().trim();
  
  const otpRecord = await OTP.findOne({ email: normalizedEmail });
  if (!otpRecord) { res.status(400); throw new Error('No OTP requested or OTP has expired. Please request a new one.'); }
  if (otpRecord.otpCode !== otp.toString().trim()) { res.status(401); throw new Error('Invalid OTP. Please try again.'); }

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const user = await User.create({ name, email: normalizedEmail, password, phone });
  
  // Clean up OTP
  await OTP.deleteOne({ _id: otpRecord._id });

  if (user) {
    const token = generateToken(res, user._id);
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }, token });
  } else { res.status(400); throw new Error('Invalid user data'); }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid email or password'); }
  const token = generateToken(res, user._id);
  res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }, token });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price thumbnail slug');
  res.json({ success: true, user });
});

// ─── OTP Login ───────────────────────────────────────────────────────────────

/**
 * @desc  Generate & send a 6-digit OTP to the user's registered email
 * @route POST /api/auth/otp/send
 * @access Public
 */
export const sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) { res.status(404); throw new Error('No account found with this email address'); }

  // Generate cryptographically random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  // Persist on user document (direct update to avoid triggering password re-hash)
  await User.findByIdAndUpdate(user._id, {
    otpCode: otp,
    otpExpire,
  });

  // Send email
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#E80071,#FF6B9D);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">Mireakart 💄</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a202c;margin:0 0 8px;">Your Login OTP</h2>
        <p style="color:#718096;margin:0 0 24px;">Use the code below to sign in. It expires in <strong>5 minutes</strong>.</p>
        <div style="background:#FFF5F9;border:2px dashed #E80071;border-radius:10px;padding:24px;text-align:center;">
          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#E80071;">${otp}</span>
        </div>
        <p style="color:#a0aec0;margin-top:24px;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: `${otp} is your Mireakart login OTP`,
    text: `Your Mireakart login OTP is: ${otp}. It expires in 5 minutes.`,
    html,
  });

  res.json({ success: true, message: `OTP sent to ${user.email}` });
});

/**
 * @desc  Verify the 6-digit OTP and log the user in
 * @route POST /api/auth/otp/verify
 * @access Public
 */
export const loginWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) { res.status(400); throw new Error('Email and OTP are required'); }

  // Explicitly select OTP fields (they are hidden by default via select:false)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otpCode +otpExpire');

  if (!user) { res.status(404); throw new Error('No account found with this email address'); }
  if (!user.otpCode || !user.otpExpire) { res.status(400); throw new Error('No OTP was requested. Please request a new one.'); }
  if (new Date() > user.otpExpire) { res.status(400); throw new Error('OTP has expired. Please request a new one.'); }
  if (user.otpCode !== otp.toString().trim()) { res.status(401); throw new Error('Invalid OTP. Please try again.'); }

  // OTP is valid — clear it to prevent replay attacks
  await User.findByIdAndUpdate(user._id, { otpCode: null, otpExpire: null });

  const token = generateToken(res, user._id);
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
    token,
  });
});

// ─── Forgot / Reset Password ──────────────────────────────────────────────────

/**
 * @desc  Generate a password-reset token and email it
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) { res.status(404); throw new Error('No account found with this email address'); }

  // Generate a random 6-digit OTP as the reset token
  const resetOtp = crypto.randomInt(100000, 999999).toString();
  const resetExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Hash before saving (keep plaintext OTP for email, store hash in DB)
  const hashedToken = crypto.createHash('sha256').update(resetOtp).digest('hex');

  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken: hashedToken,
    resetPasswordExpire: resetExpire,
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#E80071,#FF6B9D);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">Mireakart 💄</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1a202c;margin:0 0 8px;">Reset Your Password</h2>
        <p style="color:#718096;margin:0 0 24px;">Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
        <div style="background:#FFF5F9;border:2px dashed #E80071;border-radius:10px;padding:24px;text-align:center;">
          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#E80071;">${resetOtp}</span>
        </div>
        <p style="color:#a0aec0;margin-top:24px;font-size:13px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: `${resetOtp} is your Mireakart password reset code`,
    text: `Your Mireakart password reset code is: ${resetOtp}. It expires in 15 minutes.`,
    html,
  });

  res.json({ success: true, message: `Password reset code sent to ${user.email}` });
});

/**
 * @desc  Verify reset OTP and set new password
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error('Email, OTP, and new password are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset code. Please request a new one.');
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(res, user._id);
  res.json({
    success: true,
    message: 'Password reset successfully',
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

/**
 * @desc  Authenticate Google OAuth credential token
 * @route POST /api/auth/google
 * @access Public
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error('Google credential token is required');
  }

  // Verify token using Google's tokeninfo endpoint
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const payload = await response.json();

  if (!response.ok || payload.error) {
    res.status(400);
    throw new Error(payload.error_description || 'Invalid Google credential token');
  }

  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    res.status(400);
    throw new Error('Google email is not verified');
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Generate a secure random password for social login users
    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      password: randomPassword,
      avatar: picture || '',
      role: 'user',
    });
  }

  const token = generateToken(res, user._id);
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar,
    },
    token,
  });
});
