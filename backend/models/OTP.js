import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpCode: { type: String, required: true },
  // Document automatically deletes itself after 5 minutes (300 seconds)
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

// Create an index to ensure fast lookups
otpSchema.index({ email: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
