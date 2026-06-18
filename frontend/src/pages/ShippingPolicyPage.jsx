import React from 'react';
import './PolicyPage.css';

const ShippingPolicyPage = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <span className="policy-hero-icon">🚚</span>
        <h1>Shipping Policy</h1>
        <p>Fast, safe, and reliable delivery across India</p>
      </div>

      <div className="policy-effective">📅 Effective Date: 19 May 2026</div>

      <div className="policy-card">
        <h2><span className="section-icon">🇮🇳</span> Delivery Coverage</h2>
        <ul>
          <li>We currently deliver <strong>across India only</strong> (all states and union territories)</li>
          <li>Some remote areas may take additional time for delivery</li>
          <li>We do <strong>not</strong> ship internationally at this time</li>
          <li>PIN code serviceability can be checked at checkout</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">⏱️</span> Estimated Delivery Time</h2>
        <ul>
          <li><strong>Metro Cities</strong> (Mumbai, Delhi, Bangalore, etc.) — <strong>3–5 business days</strong></li>
          <li><strong>Tier 2 Cities</strong> (Pune, Jaipur, Lucknow, etc.) — <strong>5–7 business days</strong></li>
          <li><strong>Tier 3 / Rural Areas</strong> — <strong>7–10 business days</strong></li>
          <li>Orders placed on weekends/holidays will be processed on the next business day</li>
        </ul>
        <div className="highlight-box">
          <strong>💡 Note:</strong> Delivery times are estimates and may vary due to weather, courier delays, or high-demand sale periods.
        </div>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">💰</span> Shipping Charges</h2>
        <ul>
          <li><strong>Free Shipping</strong> on all prepaid orders above ₹499</li>
          <li>Flat shipping fee of <strong>₹49</strong> for orders below ₹499</li>
          <li>COD orders may have an additional handling charge of <strong>₹29</strong></li>
          <li>Shipping charges are non-refundable unless the return is due to our error</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🤝</span> Our Courier Partners</h2>
        <p>We work with India's most reliable logistics partners:</p>
        <ul>
          <li><strong>Delhivery</strong> — Pan-India express delivery</li>
          <li><strong>Blue Dart</strong> — Premium shipping for metro cities</li>
          <li><strong>DTDC</strong> — Coverage for semi-urban and rural areas</li>
          <li><strong>India Post</strong> — For remote areas with limited courier access</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">📍</span> Order Tracking</h2>
        <ul>
          <li>Once shipped, you will receive a <strong>tracking ID via email</strong></li>
          <li>Track your order from the <strong>"My Orders"</strong> section</li>
          <li>For tracking issues, contact our support team</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">📦</span> Packaging &amp; Safety</h2>
        <ul>
          <li>All products are <strong>securely packaged</strong> with protective materials</li>
          <li>Fragile items receive extra cushioning</li>
          <li>Packaging is discreet — no product details visible from outside</li>
          <li>We use eco-friendly packaging materials wherever possible 🌱</li>
        </ul>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">📧</span> Shipping Queries?</h2>
        <div className="highlight-box">
          <strong>📧 Email:</strong> support@mireakart.com<br />
          <strong>📞 Phone:</strong> +91 98765 43210<br />
          <strong>🕐 Support Hours:</strong> Mon–Sat, 10:00 AM – 7:00 PM IST
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
