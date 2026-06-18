import React from 'react';
import './PolicyPage.css';

const DisclaimerPage = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <span className="policy-hero-icon">⚠️</span>
        <h1>Disclaimer</h1>
        <p>Important information about our products and services</p>
      </div>

      <div className="policy-effective">📅 Effective Date: 19 May 2026</div>

      <div className="policy-card">
        <h2><span className="section-icon">📋</span> General Disclaimer</h2>
        <p>
          The information provided on Mireakart (<strong>www.mireakart.com</strong>) is for general
          informational and product-purchasing purposes only. While we strive to keep information
          accurate and up-to-date, we make no representations or warranties of any kind, express
          or implied, about the completeness, accuracy, or reliability of the information, products,
          or services on this website.
        </p>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">💄</span> Cosmetics &amp; Beauty Products Disclaimer</h2>
        <div className="disclaimer-alert">
          <span className="alert-icon">⚠️</span>
          <p>
            <strong>Product results may vary from person to person.</strong> Individual results depend
            on skin type, sensitivity, usage patterns, and other personal factors. A <strong>patch test
            is strongly recommended</strong> before using any new cosmetic or skincare product.
          </p>
        </div>
        <ul>
          <li>Mireakart does <strong>not provide medical advice</strong>, diagnosis, or treatment</li>
          <li>Our products are <strong>not intended to diagnose, treat, cure, or prevent</strong> any disease</li>
          <li>Always read the product label and ingredient list carefully before use</li>
          <li>If irritation or allergic reaction occurs, discontinue use immediately and consult a dermatologist</li>
          <li>Pregnant or nursing women should consult a healthcare professional before using any beauty product</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🖼️</span> Product Images &amp; Descriptions</h2>
        <ul>
          <li>Product images are for <strong>illustrative purposes</strong> only</li>
          <li>Actual product colour, shade, and packaging may vary slightly from images shown</li>
          <li>Variations may occur due to screen display settings, lighting, and photography</li>
          <li>We do not guarantee that product descriptions are error-free or complete</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🔗</span> Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. These links are provided for
          convenience only. Mireakart has no control over the content or practices of these sites
          and is <strong>not responsible</strong> for their content, privacy policies, or practices.
        </p>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">⚖️</span> Limitation of Liability</h2>
        <p>
          Mireakart, its owners, employees, and affiliates shall not be held liable for any loss,
          injury, claim, or damage arising from the use of products purchased from this website.
          By purchasing and using our products, you acknowledge that you do so <strong>at your own
          risk</strong>.
        </p>
        <div className="highlight-box">
          <strong>🛡️ Safe Usage:</strong> Always perform a patch test, follow product instructions,
          and consult a healthcare professional if you have skin conditions or allergies.
        </div>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">📧</span> Questions?</h2>
        <div className="highlight-box">
          <strong>📧 Email:</strong> support@mireakart.com<br />
          <strong>📞 Phone:</strong> +91 98765 43210
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
