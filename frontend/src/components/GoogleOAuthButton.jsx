import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGoogleLoginMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';

// A real Google Client ID always ends with .apps.googleusercontent.com
const isValidClientId = (id) =>
  typeof id === 'string' && id.trim().length > 0 && id.trim().endsWith('.apps.googleusercontent.com');

const GoogleOAuthButton = ({ redirect = '/' }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gsiError, setGsiError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleLogin] = useGoogleLoginMutation();

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleClientId = isValidClientId(rawClientId) ? rawClientId.trim() : null;

  // ── Load the Google Identity Services script ──────────────────────────────
  useEffect(() => {
    if (!googleClientId) return; // No valid Client ID — skip loading script

    const existing = document.getElementById('gsi-script');
    if (existing) { setGsiLoaded(true); return; }

    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      setGsiError(true);
    };
    document.head.appendChild(script);
  }, [googleClientId]);

  // ── Initialize Google Sign-In button once script is ready ─────────────────
  useEffect(() => {
    if (!gsiLoaded || !googleClientId) return;

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      setGsiError(true);
    }
  }, [gsiLoaded, googleClientId]);

  // ── Handle credential returned by Google ──────────────────────────────────
  const handleCredentialResponse = async (response) => {
    setIsLoggingIn(true);
    try {
      const res = await googleLogin({ credential: response.credential }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success(`Welcome, ${res.user.name || 'User'}! 🎉`);
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── Shared Google-branded button styles ───────────────────────────────────
  const googleBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    height: '48px',
    background: '#ffffff',
    border: '1.5px solid #dadce0',
    borderRadius: '10px',
    color: '#3c4043',
    fontWeight: 600,
    fontFamily: "'Roboto', 'Inter', sans-serif",
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    userSelect: 'none',
  };

  // ── Google SVG Logo ───────────────────────────────────────────────────────
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9577 15.8195L12.0491 13.5614C11.2418 14.1027 10.2109 14.4273 9 14.4273C6.65591 14.4273 4.67182 12.8495 3.96409 10.7264H0.957275V13.0582C2.43818 16.0009 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.7264C3.78409 10.1864 3.68182 9.60955 3.68182 9C3.68182 8.39045 3.78409 7.81364 3.96409 7.27364V4.94182H0.957275C0.347727 6.15955 0 7.54364 0 9C0 10.4564 0.347727 11.8405 0.957275 13.0582L3.96409 10.7264Z" fill="#FBBC05"/>
      <path d="M9 3.57273C10.3214 3.57273 11.5077 4.02545 12.4405 4.91727L15.0218 2.33591C13.4632 0.887727 11.4259 0 9 0C5.48182 0 2.43818 1.99909 0.957275 4.94182L3.96409 7.27364C4.67182 5.15045 6.65591 3.57273 9 3.57273Z" fill="#EA4335"/>
    </svg>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%' }}>
      {/* Real Google button (Client ID is valid) */}
      {googleClientId && !gsiError ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '48px' }}>
          {isLoggingIn && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, borderRadius: '10px',
            }}>
              <Loader size="sm" />
            </div>
          )}
          {/* Google renders its own button inside this div */}
          <div id="google-btn-container" style={{ width: '100%', minHeight: '44px' }} />
        </div>
      ) : (
        /* ── Setup required notice ── */
        <div style={{ width: '100%' }}>
          <div style={{
            background: '#FFF8E1',
            border: '1.5px solid #FFD54F',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '12px',
            fontSize: '0.8rem',
            color: '#5D4037',
            lineHeight: 1.6,
          }}>
            <strong>⚙️ Google Sign-In Setup Required</strong><br />
            To enable real Google login, add your Client ID to{' '}
            <code style={{ background: '#fff3e0', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
              frontend/.env
            </code>:
            <br /><br />
            <code style={{
              display: 'block',
              background: '#fff3e0',
              padding: '8px 10px',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.76rem',
              wordBreak: 'break-all',
            }}>
              VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
            </code>
            <br />
            Get your Client ID from{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'underline' }}
            >
              Google Cloud Console ↗
            </a>
          </div>

          <button
            type="button"
            disabled
            style={{ ...googleBtnStyle, opacity: 0.55, cursor: 'not-allowed' }}
          >
            <GoogleIcon />
            Continue with Google (Not Configured)
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleOAuthButton;
