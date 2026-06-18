import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaHeart, FaShoppingBag, FaUser, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useGetCartQuery } from '../slices/cartApiSlice';
import { useLogoutApiMutation } from '../slices/authApiSlice';
import { logout } from '../slices/authSlice';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { userInfo } = useSelector((state) => state.auth);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !userInfo });
  const [logoutApiCall] = useLogoutApiMutation();

  const cartItemsCount = cartData?.cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      setIsMenuOpen(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    }}>
      {/* Top Banner */}
      <div style={{
        background: 'var(--primary-gradient)',
        color: 'white',
        textAlign: 'center',
        padding: '6px 10px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '1px',
      }} className="header-top-banner">
        FREE SHIPPING ON ORDERS ABOVE ₹499 • 100% GENUINE PRODUCTS ONLY
      </div>

      {/* Main Bar */}
      <div className="container header-main-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
        gap: '20px'
      }}>
        {/* Mobile menu toggle (Left aligned) */}
        <button 
          className="mobile-nav-toggle" 
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{
            fontSize: '1.8rem',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            margin: 0
          }} className="header-logo">Mireakart</h1>
        </Link>

        {/* Search Bar - Hidden on Mobile */}
        <form onSubmit={handleSearchSubmit} className="header-search-form" style={{
          flexGrow: 1,
          maxWidth: '500px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search for makeup, skincare, hair brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 46px',
              borderRadius: '30px',
              border: '1.5px solid var(--border-color)',
              background: '#FFF9FB',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              transition: 'var(--transition)',
            }}
          />
          <FaSearch style={{
            position: 'absolute',
            left: '18px',
            color: 'var(--primary-color)',
            fontSize: '16px'
          }} />
        </form>

        {/* User Actions */}
        <div className="header-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          {/* Wishlist */}
          <Link to="/wishlist" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <FaHeart size={21} style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }} className="header-user-name">Wishlist</span>
            {userInfo?.wishlist?.length > 0 && (
              <span className="badge" style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
                {userInfo.wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Bag */}
          <Link to="/cart" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <FaShoppingBag size={21} style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }} className="header-user-name">Bag</span>
            {cartItemsCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* User Account Menu - Hidden on Mobile, handled via side drawer */}
          {userInfo ? (
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              className="header-user-name"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}>
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hello,</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{userInfo.name.split(' ')[0]}</span>
              </div>

              {/* Dropdown Menu */}
              <div style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                background: 'white',
                boxShadow: 'var(--hover-shadow)',
                borderRadius: '10px',
                width: '180px',
                padding: '8px',
                display: isDropdownOpen ? 'flex' : 'none',
                flexDirection: 'column',
                gap: '4px',
                border: '1px solid var(--border-color)',
                zIndex: 101,
              }} className="dropdown-menu">
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', fontSize: '0.88rem', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FaUser size={13} style={{ color: 'var(--primary-color)' }} /> Profile
                </Link>
                <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', fontSize: '0.88rem', borderRadius: '6px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FaShoppingBag size={13} style={{ color: 'var(--primary-color)' }} /> My Orders
                </Link>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', fontSize: '0.88rem', borderRadius: '6px', fontWeight: 600 }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <FaTachometerAlt size={13} style={{ color: 'var(--primary-color)' }} /> Admin Board
                  </Link>
                )}
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', fontSize: '0.88rem', borderRadius: '6px', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <FaSignOutAlt size={13} style={{ color: 'var(--error-color)' }} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary header-user-name" style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Categories Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', background: 'white' }}>
        <div className="container header-categories-bar" style={{ display: 'flex', gap: '30px', height: '44px', alignItems: 'center' }}>
          {['Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Bath & Body', 'Wellness', 'Luxury'].map((cat) => (
            <Link 
              key={cat} 
              to={`/products?category=${cat.toLowerCase()}`}
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.3px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-primary)';
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          MOBILE NAVIGATION DRAWER OVERLAY
          ─────────────────────────────────────────────────────────────── */}
      <div 
        className={`mobile-nav-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <div className={`mobile-nav-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-drawer-header">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <h2 style={{
              fontSize: '1.4rem',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              margin: 0
            }}>Mireakart</h2>
          </Link>
          <button 
            onClick={() => setIsMenuOpen(false)}
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--text-secondary)', 
              fontSize: '1.2rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              transition: 'var(--transition)'
            }}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search box inside drawer */}
        <form onSubmit={handleSearchSubmit} className="mobile-search-form">
          <input 
            type="text" 
            placeholder="Search makeup, skincare..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
        </form>

        <div className="mobile-nav-drawer-body">
          {/* User Section */}
          {userInfo ? (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome back,</p>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '2px' }}>{userInfo.name}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{userInfo.email}</p>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="btn btn-primary" 
              style={{ margin: '10px 12px', height: '44px' }}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In / Register
            </Link>
          )}

          {/* Links */}
          <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            All Products
          </Link>
          <Link to="/wishlist" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            <FaHeart style={{ color: 'var(--primary-color)' }} /> Wishlist
          </Link>
          <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            <FaShoppingBag style={{ color: 'var(--primary-color)' }} /> Shopping Bag
          </Link>

          {userInfo && (
            <>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }} />
              <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaUser /> My Profile
              </Link>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                <FaShoppingBag /> My Orders
              </Link>
              {userInfo.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--primary-color)' }}>
                  <FaTachometerAlt /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="mobile-nav-link" style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center' }}>
                <FaSignOutAlt /> Sign Out
              </button>
            </>
          )}

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '15px 0' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, paddingLeft: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop Categories</span>
          {['Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Bath & Body', 'Wellness', 'Luxury'].map((cat) => (
            <Link 
              key={cat} 
              to={`/products?category=${cat.toLowerCase()}`}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              style={{ paddingLeft: '20px', fontWeight: 500 }}
            >
              • {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Inline styles no longer needed - dropdown is state-driven */}
    </header>
  );
};

export default Header;
