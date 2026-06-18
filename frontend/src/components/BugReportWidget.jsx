import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaBug, FaPaperPlane, FaTimes, FaLightbulb, FaCommentAlt, FaQuestionCircle } from 'react-icons/fa';
import Loader from './Loader';

const BugReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('FEEDBACK');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || message.trim().length < 5) {
      return toast.error('Please enter a message containing at least 5 characters.');
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

   const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          message: message.trim(),
          page: window.location.pathname,
          name: name || undefined,
          email: email || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setMessage('');
        setType('FEEDBACK');
        setName('');
        setEmail('');
        setIsOpen(false);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      toast.error(err.message || 'Could not submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary-gradient)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(232, 0, 113, 0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(232, 0, 113, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(232, 0, 113, 0.35)';
        }}
        title="Send feedback or report a bug"
      >
        <FaBug size={22} />
      </button>

      {/* Glassmorphic Modal Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
          onClick={() => setIsOpen(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .feedback-type-btn {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              padding: 12px 8px;
              border-radius: 12px;
              border: 1.5px solid var(--border-color);
              background: #f8fafc;
              cursor: pointer;
              transition: all 0.2s ease;
              color: var(--text-secondary);
              font-weight: 700;
              font-size: 0.78rem;
            }
            .feedback-type-btn:hover {
              background: #f1f5f9;
              border-color: #cbd5e1;
            }
            .feedback-type-btn.active {
              border-color: var(--primary-color);
              background: #fff5f9;
              color: var(--primary-color);
            }
          `}</style>
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
              width: '90%',
              maxWidth: '460px',
              padding: '32px',
              position: 'relative',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <FaTimes size={14} />
            </button>

            {/* Header */}
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', fontWeight: 800, margin: 0 }}>Feedback & Help</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
                Tell us about your experience or report an issue.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type Pills */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'FEEDBACK', label: 'Feedback', icon: <FaCommentAlt size={16} /> },
                  { key: 'BUG', label: 'Bug Report', icon: <FaBug size={16} /> },
                  { key: 'FEATURE_REQUEST', label: 'Feature Request', icon: <FaLightbulb size={16} /> },
                  { key: 'OTHER', label: 'Other', icon: <FaQuestionCircle size={16} /> },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`feedback-type-btn ${type === item.key ? 'active' : ''}`}
                    onClick={() => setType(item.key)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Message <span style={{ color: 'var(--primary-color)' }}>*</span>
                </label>
                <textarea
                  placeholder={
                    type === 'BUG'
                      ? 'What happened? How can we reproduce it? (Min. 5 chars)'
                      : type === 'FEATURE_REQUEST'
                      ? 'What feature would you like to see? (Min. 5 chars)'
                      : 'Share your suggestions or compliments... (Min. 5 chars)'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Optional Name/Email (if not logged in) */}
              {!userInfo && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {userInfo && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  Submitting as: <strong>{userInfo.name}</strong> ({userInfo.email})
                </p>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    flex: 1,
                    height: '44px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                {isSubmitting ? (
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Loader size="sm" />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                    }}
                  >
                    <FaPaperPlane size={13} /> Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportWidget;
