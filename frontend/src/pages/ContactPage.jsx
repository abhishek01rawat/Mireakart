import React from 'react';
import './PolicyPage.css';

const ContactPage = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <span className="policy-hero-icon">📞</span>
        <h1>Contact Us</h1>
        <p>We are here to help you shine — get in touch with our support team</p>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">💬</span> Get In Touch</h2>
        <p>
          Have questions about your order, shipping, or need a personalized product recommendation? Reach out to us through any of the channels below. Our support team is active from <strong>Monday to Saturday, 10:00 AM to 7:00 PM IST</strong>.
        </p>

        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-item-icon">📧</div>
            <div>
              <h4>Email Support</h4>
              <p>support@mireakart.com</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Responses within 24 hours</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-item-icon">📞</div>
            <div>
              <h4>Call Support</h4>
              <p>+91 98765 43210</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mon-Sat, 10 AM - 7 PM</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-item-icon">📍</div>
            <div>
              <h4>Headquarters</h4>
              <p>101, Beauty Enclave,</p>
              <p>Bandra West, Mumbai, India</p>
            </div>
          </div>
        </div>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">📝</span> Send Us a Message</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }} onSubmit={(e) => { e.preventDefault(); alert('Thank you for reaching out! We will contact you soon.'); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Name</label>
              <input type="text" placeholder="John Doe" required style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Address</label>
              <input type="email" placeholder="john@example.com" required style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Subject</label>
            <input type="text" placeholder="Order Query / Product Recommendation" required style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Message</label>
            <textarea rows="5" placeholder="How can we help you today?" required style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
