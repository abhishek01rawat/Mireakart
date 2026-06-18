import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--secondary-color)',
      color: '#ECEAEF',
      padding: '60px 0 30px 0',
      marginTop: '60px',
      borderTop: '5px solid var(--primary-color)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* About column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ color: 'white', fontSize: '1.6rem', letterSpacing: '-0.5px' }}>Mireakart</h2>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#B5AABF' }}>
            Your ultimate destination for curated premium beauty, skincare, haircare, and personal wellness products. Shine with genuine brands.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            {[FaFacebook, FaInstagram, FaTwitter, FaYoutube].map((Icon, idx) => (
              <a key={idx} href="#" style={{
                width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)', color: 'white'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              >
                <div style={{ margin: 'auto', display: 'flex' }}><Icon size={16} /></div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li><a href="/about" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>About Us</a></li>
            <li><a href="/contact" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Contact Us</a></li>
            <li><a href="/products" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>All Products</a></li>
            <li><a href="/wishlist" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Your Wishlist</a></li>
          </ul>
        </div>

        {/* Legal Policies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>Legal Policies</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <li><a href="/privacy-policy" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Privacy Policy</a></li>
            <li><a href="/terms" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Terms &amp; Conditions</a></li>
            <li><a href="/shipping-policy" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Shipping Policy</a></li>
            <li><a href="/refund-policy" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Refund &amp; Cancellation</a></li>
            <li><a href="/disclaimer" onMouseEnter={(e) => e.target.style.color = 'var(--accent-color)'} onMouseLeave={(e) => e.target.style.color = '#ECEAEF'}>Disclaimer</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>Contact Info</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#B5AABF' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaPhone size={14} style={{ color: 'var(--accent-color)' }} /> +91 98765 43210
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaEnvelope size={14} style={{ color: 'var(--accent-color)' }} /> support@mireakart.com
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.4' }}>
              <FaMapMarkerAlt size={14} style={{ color: 'var(--accent-color)', marginTop: '3px' }} /> 
              101, Beauty Enclave, Bandra West, Mumbai, India
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>Newsletter</h3>
          <p style={{ fontSize: '0.88rem', color: '#B5AABF', lineHeight: '1.4' }}>
            Subscribe to get updates on new arrivals, flash deals, and beauty tutorials!
          </p>
          <div style={{ display: 'flex', marginTop: '5px' }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              style={{
                padding: '10px 14px', borderRadius: '8px 0 0 8px', border: 'none', flexGrow: 1, fontSize: '0.85rem'
              }}
            />
            <button className="btn btn-primary" style={{
              borderRadius: '0 8px 8px 0', padding: '10px 20px', fontSize: '0.85rem'
            }}>
              Join
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '25px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#B5AABF' }}>
          © {new Date().getFullYear()} Mireakart E-Commerce. All Rights Reserved. Inspired by premium beauty standards.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
