import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mireakart_cookie_consent');
    if (!consent) {
      // Show banner after 1.5 seconds delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mireakart_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('mireakart_cookie_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '850px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(232, 0, 113, 0.15)',
      borderRadius: '16px',
      padding: '20px 28px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(232, 0, 113, 0.05)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      flexWrap: 'wrap',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .cookie-btn-accept {
          background: var(--primary-gradient);
          color: white !important;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(232, 0, 113, 0.15);
        }
        .cookie-btn-accept:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 14px rgba(232, 0, 113, 0.25);
        }
        .cookie-btn-decline {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cookie-btn-decline:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        @media (max-width: 600px) {
          .cookie-consent-actions {
            width: 100%;
            display: flex;
            gap: 12px;
          }
          .cookie-consent-actions button {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          🍪 <strong>We value your privacy.</strong> Mireakart uses cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies in accordance with our <Link to="/privacy-policy" style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 600 }}>Privacy Policy</Link>.
        </p>
      </div>
      <div className="cookie-consent-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={handleDecline} className="cookie-btn-decline">
          Reject
        </button>
        <button onClick={handleAccept} className="cookie-btn-accept">
          Accept All
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
