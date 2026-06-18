import React from 'react';
import './PolicyPage.css';

const AboutPage = () => {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <span className="policy-hero-icon">✨</span>
        <h1>About Us</h1>
        <p>Mireakart — Redefining premium beauty and skincare</p>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🌟</span> Our Story</h2>
        <p>
          Founded with a passion for genuine beauty, Mireakart is India’s premier destination for carefully curated, high-performance skincare, makeup, haircare, and personal wellness products. We believe that skincare is not just a routine, but a form of self-care and empowerment.
        </p>
        <p style={{ marginTop: '12px' }}>
          We source directly from authorized brand distributors to guarantee 100% authenticity. Our mission is to make premium global beauty accessible, while providing an educational and transparent shopping experience.
        </p>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🛡️</span> Our Core Values</h2>
        <div className="values-grid">
          <div className="value-item">
            <span className="value-icon">💯</span>
            <h4>100% Authenticity</h4>
            <p>Every single product is sourced directly and fully authenticated.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">🌿</span>
            <h4>Clean Standards</h4>
            <p>We prioritize dermatologically tested, skin-safe formulations.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">❤️</span>
            <h4>Customer First</h4>
            <p>Your satisfaction, safety, and glow are our top priorities.</p>
          </div>
        </div>
      </div>

      <div className="policy-card">
        <h2><span className="section-icon">🚀</span> Why Choose Mireakart?</h2>
        <ul>
          <li><strong>Curated Selection:</strong> We filter out the noise to bring you only the best-performing products.</li>
          <li><strong>Dermatology Focused:</strong> Product disclaimers and recommended usage tips to keep your skin safe.</li>
          <li><strong>Fast Pan-India Delivery:</strong> Reliable packaging with trusted courier partners to your doorstep.</li>
          <li><strong>Secured Shopping:</strong> Safe authentication and order processing.</li>
        </ul>
      </div>

      <div className="policy-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2><span className="section-icon" style={{ margin: '0 auto 12px' }}>✨</span> Start Your Glow Journey</h2>
        <p style={{ marginBottom: '20px' }}>Explore our handpicked collections and discover what works best for your skin type.</p>
        <a href="/products" className="btn btn-primary">Shop All Products</a>
      </div>
    </div>
  );
};

export default AboutPage;
