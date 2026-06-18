import React from 'react';
import './PolicyPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="policy-page">
      {/* Hero */}
      <div className="policy-hero">
        <span className="policy-hero-icon">🔒</span>
        <h1>Privacy Policy</h1>
        <p>Your trust means everything to us — here's how we protect your data</p>
      </div>

      <div className="policy-effective">📅 Effective Date: 19 May 2026</div>

      {/* Intro */}
      <div className="policy-card">
        <h2><span className="section-icon">📋</span> Introduction</h2>
        <p>
          Mireakart ("we", "us", or "our") operates the website <strong>www.mireakart.com</strong>.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your personal
          information when you visit our website or place an order. This policy is published in
          compliance with the <strong>Information Technology Act, 2000</strong> and the
          <strong> Information Technology (Reasonable Security Practices and Procedures and
          Sensitive Personal Data or Information) Rules, 2011</strong> of India.
        </p>
        <div className="highlight-box">
          <strong>⚖️ Legal Requirement:</strong> This privacy policy is mandatory under the Indian IT Act,
          2000 — even if we do not accept online payments. By using our website, you consent to
          the data practices described in this policy.
        </div>
      </div>

      {/* Data We Collect */}
      <div className="policy-card">
        <h2><span className="section-icon">📦</span> Information We Collect</h2>
        <p>We may collect the following personal information when you use our website or place an order:</p>
        <ul>
          <li><strong>Full Name</strong> — to process and address your order</li>
          <li><strong>Phone Number</strong> — to coordinate delivery and order updates via SMS/call</li>
          <li><strong>Email Address</strong> — to send order confirmations, OTP verification, and important updates</li>
          <li><strong>Shipping Address</strong> — to deliver your order to the correct location</li>
          <li><strong>Order History</strong> — to provide you with order tracking and support</li>
          <li><strong>Device & Browser Information</strong> — automatically collected for website optimization</li>
        </ul>
      </div>

      {/* How We Use Data */}
      <div className="policy-card">
        <h2><span className="section-icon">🎯</span> How We Use Your Information</h2>
        <p>Your personal information is used solely for legitimate business purposes:</p>
        <ul>
          <li>Processing and fulfilling your product orders</li>
          <li>Sending order confirmation emails and shipping updates</li>
          <li>OTP-based account verification and authentication</li>
          <li>Responding to your queries and providing customer support</li>
          <li>Improving our website experience and product offerings</li>
          <li>Complying with legal and regulatory obligations</li>
        </ul>
      </div>

      {/* Data Protection */}
      <div className="policy-card">
        <h2><span className="section-icon">🛡️</span> Data Protection & Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal data against
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <ul>
          <li>All sensitive data is encrypted in transit and at rest</li>
          <li>Access to personal information is restricted to authorized personnel only</li>
          <li>We use secure, hashed password storage and OTP-based authentication</li>
          <li>Regular security audits are conducted to maintain data integrity</li>
        </ul>
        <div className="highlight-box">
          <strong>🔐 Our Promise:</strong> We do <strong>NOT</strong> sell, trade, or rent your personal
          information to any third party. Your data is never misused for purposes other than what
          is described in this policy.
        </div>
      </div>

      {/* Third Party Sharing */}
      <div className="policy-card">
        <h2><span className="section-icon">🤝</span> Third-Party Sharing</h2>
        <p>We may share limited information with trusted third-party service providers only when necessary:</p>
        <ul>
          <li><strong>Delivery/Courier Partners</strong> — name, phone, and address to fulfill shipping</li>
          <li><strong>Payment Gateways</strong> — encrypted transaction data for payment processing (if applicable)</li>
          <li><strong>Legal Authorities</strong> — if required by law or to protect our legal rights</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          We do not share your data with advertisers, data brokers, or any unauthorized entities.
        </p>
      </div>

      {/* Your Rights */}
      <div className="policy-card">
        <h2><span className="section-icon">✅</span> Your Rights</h2>
        <p>As a user, you have the following rights regarding your personal data:</p>
        <ul>
          <li>Request access to the personal data we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>Request deletion of your personal data (subject to legal obligations)</li>
          <li>Withdraw consent for data processing at any time</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          To exercise any of these rights, please contact us at <strong>support@mireakart.com</strong>.
        </p>
      </div>

      {/* Changes */}
      <div className="policy-card">
        <h2><span className="section-icon">🔄</span> Changes to This Policy</h2>
        <p>
          We reserve the right to update or modify this Privacy Policy at any time. Any changes will
          be posted on this page with an updated effective date. We encourage you to review this
          policy periodically.
        </p>
      </div>

      {/* Contact */}
      <div className="policy-card">
        <h2><span className="section-icon">📧</span> Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please reach out to us:
        </p>
        <div className="highlight-box">
          <strong>📧 Email:</strong> support@mireakart.com<br />
          <strong>📞 Phone:</strong> +91 98765 43210<br />
          <strong>📍 Address:</strong> 101, Beauty Enclave, Bandra West, Mumbai, Maharashtra, India
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
