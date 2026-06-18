import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { FaLock, FaEnvelope, FaKey } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [forgotPassword, { isLoading: isSendingOTP }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    try {
      await forgotPassword({ email }).unwrap();
      setOtpSent(true);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success('Reset code sent! Check your email or server console.');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not send reset code');
    }
  };

  // ── OTP input handling ──
  const handleOtpChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[idx] = value;
    setOtpDigits(next);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  // ── Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) return toast.error('Please enter the 6-digit verification code');
    if (!newPassword) return toast.error('Please enter a new password');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    try {
      const res = await resetPassword({ email, otp, newPassword }).unwrap();
      // On success, set credentials and log in the user directly
      if (res.user && res.token) {
        dispatch(setCredentials({ user: res.user, token: res.token }));
      }
      toast.success('Password reset successfully! Welcome to Mireakart.');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reset password');
    }
  };

  // ── Shared styles ──
  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid var(--border-color)', borderRadius: '10px', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', minHeight: '70vh' }} className="fade-in">
      <div style={{
        background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px',
        boxShadow: 'var(--hover-shadow)', width: '100%', maxWidth: '440px',
        padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', fontWeight: 800 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            {!otpSent ? 'Retrieve your account with password recovery' : 'Enter the code and your new password'}
          </p>
        </div>

        {/* ── Email Request Form ── */}
        {!otpSent ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="e.g. priya@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              We'll send a 6-digit recovery code to your registered email address.
            </p>
            {isSendingOTP ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '6px' }}>
                <FaEnvelope style={{ marginRight: '8px' }} /> Send Reset Code
              </button>
            )}
          </form>
        ) : (
          /* ── OTP Code & Password Update Form ── */
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
            {/* Sent confirmation */}
            <div style={{
              background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '10px',
              padding: '12px 16px', width: '100%', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.84rem', color: '#276749', margin: 0 }}>
                ✅ Reset code sent to <strong>{email}</strong>
              </p>
            </div>

            {/* 6-digit OTP Input */}
            <div style={{ width: '100%' }}>
              <label style={{ ...labelStyle, textAlign: 'center' }}>6-Digit Recovery Code</label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '8px 0' }} onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: '48px', height: '56px', textAlign: 'center',
                      fontSize: '1.4rem', fontWeight: 800, borderRadius: '10px',
                      border: d ? '2px solid var(--primary-color)' : '1.5px solid var(--border-color)',
                      outline: 'none', transition: 'border-color 0.2s',
                      color: 'var(--secondary-color)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Password input */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Min. 6 characters" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required />
            </div>

            {/* Confirm password input */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" placeholder="Confirm your new password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
            </div>

            {/* Countdown & Resend */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Resend code in <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{countdown}s</span>
                </p>
              ) : (
                <button type="button" onClick={handleSendOTP}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'underline',
                  }}
                >
                  Resend Code
                </button>
              )}
            </div>

            {isResetting ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '10px' }}>
                <FaKey style={{ marginRight: '8px' }} /> Update Password
              </button>
            )}

            <button type="button"
              onClick={() => { setOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setCountdown(0); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '0.82rem', textDecoration: 'underline',
              }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
