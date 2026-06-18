import React from 'react';
import './PolicyPage.css';

const RefundPolicyPage = () => {
  return (
    <div className="policy-page">
      {/* Hero */}
      <div className="policy-hero">
        <span className="policy-hero-icon">🔄</span>
        <h1>Return, Refund &amp; Cancellation Policy</h1>
        <p>We want you to love every purchase — here's how we handle returns</p>
      </div>

      <div className="policy-effective">📅 Effective Date: 19 May 2026</div>

      {/* Intro */}
      <div className="policy-card">
        <h2><span className="section-icon">📋</span> Overview</h2>
        <p>
          At Mireakart, customer satisfaction is our top priority. If you are not satisfied with
          your purchase, we offer a clear and fair return, refund, and cancellation process.
          Please read this policy carefully before placing your order.
        </p>
      </div>

      {/* Cancellation */}
      <div className="policy-card">
        <h2><span className="section-icon">❌</span> Order Cancellation</h2>
        <h3>By Customer</h3>
        <ul>
          <li>You may cancel your order <strong>within 24 hours</strong> of placing it, provided it has not been shipped</li>
          <li>To cancel, contact us at <strong>support@mireakart.com</strong> with your Order ID</li>
          <li>If prepaid, a full refund will be initiated within <strong>5–7 business days</strong></li>
          <li>COD orders can be cancelled without any charges before shipment</li>
        </ul>

        <h3>By Mireakart</h3>
        <ul>
          <li>We may cancel orders due to stock unavailability, pricing errors, or suspected fraud</li>
          <li>You will be notified via email and a full refund will be processed if applicable</li>
        </ul>
      </div>

      {/* Returns */}
      <div className="policy-card">
        <h2><span className="section-icon">📦</span> Return Policy</h2>
        <ul>
          <li>Returns are accepted within <strong>7 days</strong> of delivery</li>
          <li>The product must be <strong>unused, unopened, and in its original packaging</strong></li>
          <li>Beauty and cosmetic products that have been opened or used <strong>cannot be returned</strong> for hygiene and safety reasons</li>
          <li>Products must include all original tags, labels, and accessories</li>
          <li>Return shipping costs may be borne by the customer unless the product is defective</li>
        </ul>

        <div className="highlight-box">
          <strong>⚠️ Non-Returnable Items:</strong> For hygiene reasons, the following are
          <strong> non-returnable</strong> — opened beauty products, personal care items, lip products,
          skin serums (opened), hair tools (used), and any items marked "non-returnable" on the product page.
        </div>
      </div>

      {/* Return Process */}
      <div className="policy-card">
        <h2><span className="section-icon">🔧</span> How to Initiate a Return</h2>
        <ul>
          <li><strong>Step 1:</strong> Email us at <strong>support@mireakart.com</strong> within 7 days of delivery with your Order ID and reason for return</li>
          <li><strong>Step 2:</strong> Our team will review your request and respond within <strong>24–48 hours</strong></li>
          <li><strong>Step 3:</strong> If approved, pack the product securely in original packaging and ship it back to the address provided</li>
          <li><strong>Step 4:</strong> Upon receiving and inspecting the product, your refund/replacement will be processed</li>
        </ul>
      </div>

      {/* Refund */}
      <div className="policy-card">
        <h2><span className="section-icon">💰</span> Refund Policy</h2>
        <ul>
          <li>Refunds will be processed within <strong>7–10 business days</strong> after the returned product is received and inspected</li>
          <li>Refunds will be credited to the <strong>original payment method</strong> used during purchase</li>
          <li>For COD orders, refunds will be made via bank transfer (NEFT/UPI)</li>
          <li>Shipping charges are <strong>non-refundable</strong> unless the return is due to a defective or wrong product</li>
        </ul>

        <div className="highlight-box">
          <strong>💡 Note:</strong> The refund amount may take an additional <strong>3–5 business days</strong> to
          reflect in your bank account or card statement, depending on your bank.
        </div>
      </div>

      {/* Damaged / Defective */}
      <div className="policy-card">
        <h2><span className="section-icon">💔</span> Damaged or Defective Products</h2>
        <p>If you receive a damaged, defective, or incorrect product:</p>
        <ul>
          <li>Contact us <strong>within 48 hours</strong> of delivery with photographs of the damage</li>
          <li>We will arrange a <strong>free return pickup</strong> and send a replacement or full refund</li>
          <li>No return shipping cost will be charged for genuinely defective products</li>
        </ul>
      </div>

      {/* Exchange */}
      <div className="policy-card">
        <h2><span className="section-icon">🔁</span> Exchange Policy</h2>
        <ul>
          <li>We offer exchanges for products of <strong>equal or higher value</strong> (difference payable by customer)</li>
          <li>Exchange requests must be raised within <strong>7 days</strong> of delivery</li>
          <li>Exchange availability depends on product stock</li>
          <li>Products eligible for exchange must meet the same conditions as returns (unused, original packaging)</li>
        </ul>
      </div>

      {/* Contact */}
      <div className="policy-card">
        <h2><span className="section-icon">📧</span> Need Help?</h2>
        <p>For any return, refund, or cancellation queries, reach out to us:</p>
        <div className="highlight-box">
          <strong>📧 Email:</strong> support@mireakart.com<br />
          <strong>📞 Phone:</strong> +91 98765 43210<br />
          <strong>🕐 Support Hours:</strong> Mon–Sat, 10:00 AM – 7:00 PM IST
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
