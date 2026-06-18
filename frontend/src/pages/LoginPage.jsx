import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useSendOTPMutation, useLoginWithOTPMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { userInfo } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
  const [loginWithOTP, { isLoading: isVerifying }] = useLoginWithOTPMutation();

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Password login ──
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Welcome back to Mireakart!');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid email or password');
    }
  };

  // ── Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!otpEmail) return toast.error('Please enter your email');
    try {
      await sendOTP({ email: otpEmail }).unwrap();
      setOtpSent(true);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success('OTP sent! Check your email or server console.');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not send OTP');
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

  // ── Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) return toast.error('Please enter the full 6-digit OTP');
    try {
      const res = await loginWithOTP({ email: otpEmail, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Welcome back to Mireakart!');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid OTP');
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
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>Sign in to enjoy premium beauty collections</p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', borderRadius: '12px', overflow: 'hidden',
          border: '1.5px solid var(--border-color)', background: '#F8FAFC',
        }}>
          {[
            { key: 'password', label: 'Password', icon: <FaLock size={13} /> },
            { key: 'otp', label: 'Email OTP', icon: <FaEnvelope size={13} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); }}
              style={{
                flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '7px', transition: 'all 0.25s ease',
                background: activeTab === tab.key ? 'var(--primary-gradient)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Password Tab ── */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="e.g. priya@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>
            {isLoading ? <Loader size="sm" /> : (
              <>
                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '10px' }}>
                  Sign In
                </button>
                <div style={{ textAlign: 'right' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                    Forgot Password?
                  </Link>
                </div>
              </>
            )}
          </form>
        )}

        {/* ── OTP Tab ── */}
        {activeTab === 'otp' && !otpSent && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="Enter your registered email" value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)} style={inputStyle} required />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              We'll send a 6-digit verification code to your registered email address.
            </p>
            {isSendingOTP ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '6px' }}>
                <FaEnvelope style={{ marginRight: '8px' }} /> Send OTP
              </button>
            )}
          </form>
        )}

        {activeTab === 'otp' && otpSent && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
            {/* Sent confirmation */}
            <div style={{
              background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '10px',
              padding: '12px 16px', width: '100%', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.84rem', color: '#276749', margin: 0 }}>
                ✅ OTP sent to <strong>{otpEmail}</strong>
              </p>
            </div>

            {/* 6-digit OTP Input */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
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

            {/* Countdown & Resend */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Resend OTP in <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{countdown}s</span>
                </p>
              ) : (
                <button type="button" onClick={handleSendOTP}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'underline',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            {isVerifying ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}>
                Verify & Sign In
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <GoogleOAuthButton redirect={redirect} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          New to Mireakart?{' '}
          <Link to={`/register?redirect=${redirect}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
