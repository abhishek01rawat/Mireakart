import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation, useSendRegisterOTPMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { FaUserPlus, FaEnvelope } from 'react-icons/fa';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { userInfo } = useSelector((state) => state.auth);
  const [sendRegisterOTP, { isLoading: isSendingOTP }] = useSendRegisterOTPMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Step 1: Send OTP ──
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password || !phone) {
      return toast.error('Please fill in all details');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      await sendRegisterOTP({ email }).unwrap();
      setStep(2);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success('Verification code sent to your email');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not send verification code');
    }
  };

  // ── OTP Handlers ──
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

  // ── Step 2: Final Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) return toast.error('Please enter the full 6-digit OTP');

    try {
      const res = await register({ name, email, password, phone, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Account created successfully!');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

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
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            {step === 1 ? 'Join the premium beauty community' : 'Verify your email to continue'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="e.g. Priya Sharma" value={name}
                onChange={(e) => setName(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="e.g. priya@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" placeholder="e.g. 9876543210" value={phone}
                onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>
            
            {isSendingOTP ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '10px' }}>
                <FaUserPlus style={{ marginRight: '8px' }} /> Continue to Verification
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
            <div style={{
              background: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '10px',
              padding: '12px 16px', width: '100%', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.84rem', color: '#276749', margin: 0 }}>
                ✅ Code sent to <strong>{email}</strong>
              </p>
            </div>

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

            <div style={{ textAlign: 'center', width: '100%' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Resend code in <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{countdown}s</span>
                </p>
              ) : (
                <button type="button" onClick={handleSendOTP} disabled={isSendingOTP}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'underline',
                  }}
                >
                  {isSendingOTP ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            {isRegistering ? <Loader size="sm" /> : (
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}>
                Verify & Create Account
              </button>
            )}

            <button type="button" onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '0.82rem', textDecoration: 'underline',
              }}
            >
              ← Edit details
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <GoogleOAuthButton redirect={redirect} />
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
