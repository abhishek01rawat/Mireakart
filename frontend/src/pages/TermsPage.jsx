import React from 'react';
import './PolicyPage.css';

const TermsPage = () => {
  return (
    <div className="policy-page">
      {/* Hero */}
      <div className="policy-hero">
        <span className="policy-hero-icon">📜</span>
        <h1>Terms &amp; Conditions</h1>
        <p>Please read these terms carefully before using our website</p>
      </div>

      <div className="policy-effective">📅 Effective Date: 19 May 2026</div>

      {/* Intro */}
      <div className="policy-card">
        <h2><span className="section-icon">📋</span> Introduction</h2>
        <p>
          Welcome to Mireakart! These Terms and Conditions ("Terms") govern your use of
          the Mireakart website (<strong>www.mireakart.com</strong>) and all services offered through it.
          By accessing or using our website, you agree to be bound by these Terms. If you do not
          agree with any part, please do not use our website.
        </p>
        <div className="highlight-box">
          <strong>⚖️ Purpose:</strong> These terms protect both you and Mireakart in the event of
          any disputes, misunderstandings, or issues. They set clear rules for how the website
          should be used.
        </div>
      </div>

      {/* Website Usage */}
      <div className="policy-card">
        <h2><span className="section-icon">🌐</span> Use of Website</h2>
        <ul>
          <li>This website is intended for <strong>product information and order inquiry</strong> purposes</li>
          <li>You must be at least 18 years old to use this website or place an order</li>
          <li>You agree to provide accurate and complete information during registration and checkout</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>Any misuse, unauthorized access, or fraudulent activity may result in account suspension</li>
        </ul>
      </div>

      {/* Orders & Payments */}
      <div className="policy-card">
        <h2><span className="section-icon">🛒</span> Orders &amp; Payments</h2>
        <ul>
          <li>Orders are <strong>confirmed only after successful payment</strong> (or confirmation of COD)</li>
          <li>Product prices displayed on the website are in Indian Rupees (₹) and include applicable taxes</li>
          <li>We reserve the right to <strong>change prices at any time</strong> without prior notice</li>
          <li>In case of pricing errors, we may cancel the order and issue a full refund</li>
          <li>We accept payment via Cash on Delivery (COD) and approved online payment methods</li>
        </ul>
        <div className="highlight-box">
          <strong>⚠️ Important:</strong> Placing an order does not guarantee acceptance. We reserve the
          right to cancel any order if the product is unavailable, pricing errors occur, or if
          fraudulent activity is suspected.
        </div>
      </div>

      {/* Product Information */}
      <div className="policy-card">
        <h2><span className="section-icon">💄</span> Product Information</h2>
        <ul>
          <li>We strive to display accurate product descriptions, images, and pricing</li>
          <li>However, actual product colours may vary slightly from screen display due to device settings</li>
          <li>Product availability is subject to stock and may change without notice</li>
          <li>We do not guarantee that product descriptions are error-free, complete, or current</li>
        </ul>
      </div>

      {/* Order Cancellation */}
      <div className="policy-card">
        <h2><span className="section-icon">❌</span> Order Cancellation by Mireakart</h2>
        <p>Mireakart reserves the right to cancel or refuse any order for reasons including but not limited to:</p>
        <ul>
          <li>Product is out of stock or discontinued</li>
          <li>Incorrect or incomplete delivery information provided</li>
          <li>Suspected fraudulent or unauthorized transactions</li>
          <li>Pricing or technical errors on the website</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          In such cases, a full refund will be processed to the original payment method.
        </p>
      </div>

      {/* Intellectual Property */}
      <div className="policy-card">
        <h2><span className="section-icon">©️</span> Intellectual Property</h2>
        <ul>
          <li>All content on this website — including logos, text, images, graphics, and design — is the property of Mireakart</li>
          <li>You may not reproduce, distribute, or use any content without our prior written consent</li>
          <li>Product names and brands mentioned belong to their respective owners</li>
        </ul>
      </div>

      {/* Limitation of Liability */}
      <div className="policy-card">
        <h2><span className="section-icon">⚠️</span> Limitation of Liability</h2>
        <p>
          Mireakart shall not be held liable for any direct, indirect, incidental, or consequential
          damages arising from your use of the website or any products purchased through it. Our
          total liability shall not exceed the amount paid by you for the specific product in question.
        </p>
      </div>

      {/* Governing Law */}
      <div className="policy-card">
        <h2><span className="section-icon">🏛️</span> Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the
          <strong> laws of India</strong>. Any disputes arising from the use of this website or
          these Terms shall be subject to the exclusive jurisdiction of the courts in
          <strong> Mumbai, Maharashtra, India</strong>.
        </p>
        <div className="highlight-box">
          <strong>🇮🇳 Jurisdiction:</strong> Indian law applies to all transactions and interactions
          on Mireakart. Any legal proceedings will be handled in Mumbai courts.
        </div>
      </div>

      {/* Changes */}
      <div className="policy-card">
        <h2><span className="section-icon">🔄</span> Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Updated terms will be posted on
          this page with a revised effective date. Continued use of the website after changes constitutes
          acceptance of the modified Terms.
        </p>
      </div>

      {/* Contact */}
      <div className="policy-card">
        <h2><span className="section-icon">📧</span> Contact Us</h2>
        <p>For any questions about these Terms &amp; Conditions:</p>
        <div className="highlight-box">
          <strong>📧 Email:</strong> support@mireakart.com<br />
          <strong>📞 Phone:</strong> +91 98765 43210<br />
          <strong>📍 Address:</strong> 101, Beauty Enclave, Bandra West, Mumbai, Maharashtra, India
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
