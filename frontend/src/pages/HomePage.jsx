import React from 'react';
import { Link } from 'react-router-dom';
import { useGetFeaturedProductsQuery, useGetDealsQuery, useGetCategoriesQuery } from '../slices/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import SeoHelmet from '../components/SeoHelmet';

const HomePage = () => {
  const { data: featuredData, isLoading: loadFeatured } = useGetFeaturedProductsQuery(8);
  const { data: dealsData, isLoading: loadDeals } = useGetDealsQuery(4);
  const { data: catData, isLoading: loadCats } = useGetCategoriesQuery();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
      <SeoHelmet title="Premium Beauty & Cosmetics Store" description="Welcome to Mireakart, your ultimate destination for authentic premium skincare, makeup, fragrance, and hair care products." />
      
      {/* Premium Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #FFE8F2 0%, #FFF3F7 100%)',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden',
      }} className="hero-section">
        {/* Abstract background circles */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(232, 0, 113, 0.03)', top: '-100px', right: '-100px', zIndex: 0 }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(232, 0, 113, 0.02)', bottom: '-50px', left: '-50px', zIndex: 0 }} />

        <div className="container hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
          gap: '40px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }} className="hero-subtitle">
              SUMMER GLOW FESTIVAL
            </span>
            <h2 style={{ fontSize: '3.2rem', lineHeight: '1.15', fontWeight: 800, color: 'var(--secondary-color)' }} className="hero-title">
              Reveal Your <br />
              <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Natural Radiance</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '440px' }}>
              Explore handpicked, premium beauty, skincare rituals, and makeup essentials from world-renowned luxury brands. Up to 40% Off.
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }} className="hero-cta">
              <Link to="/products" className="btn btn-primary">Shop All Products</Link>
              <Link to="/products?category=skincare" className="btn btn-secondary">Explore Skincare</Link>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800" 
              alt="Glow Products Showcase"
              className="hero-image"
              style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '20px',
                boxShadow: '0 20px 45px rgba(232, 0, 113, 0.12)',
                border: '5px solid white'
              }}
            />
          </div>
        </div>
      </section>

      {/* Categories Bubble Row */}
      <section className="container">
        <h2 style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '30px' }} className="page-title">Shop by Category</h2>
        {loadCats ? <Loader size="sm" /> : (
          <div className="category-bubbles-container">
            {catData?.categories?.map((cat) => (
              <Link 
                key={cat._id} 
                to={`/products?category=${cat.name.toLowerCase()}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
                className="category-bubble-link"
              >
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '1.5px solid var(--border-color)',
                  boxShadow: 'var(--box-shadow)',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {cat.icon || '✨'}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }} className="page-title">Trending Now</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Most loved cosmetics and skincare bestsellers</p>
          </div>
          <Link to="/products" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>
        
        {loadFeatured ? <Loader /> : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px'
          }}>
            {featuredData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Middle Promo Banners */}
      <section className="container promo-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px'
      }}>
        {/* Banner 1 */}
        <div style={{
          background: 'linear-gradient(rgba(61,12,59,0.7), rgba(61,12,59,0.7)), url(https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '16px',
          padding: '40px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '240px',
          boxShadow: 'var(--box-shadow)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', letterSpacing: '1px' }}>FLAWLESS GLOW</span>
          <h3 style={{ fontSize: '1.65rem', margin: '6px 0 12px 0', color: 'white' }}>100% Organic Skincare</h3>
          <p style={{ fontSize: '0.85rem', color: '#ECEAEF', marginBottom: '18px', maxWidth: '300px' }}>
            Nourish your skin with natural botanical secrets and vitamin cocktails.
          </p>
          <Link to="/products?category=skincare" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 20px', fontSize: '0.82rem' }}>
            Shop Organic
          </Link>
        </div>

        {/* Banner 2 */}
        <div style={{
          background: 'linear-gradient(rgba(232,0,113,0.75), rgba(232,0,113,0.75)), url(https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '16px',
          padding: '40px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '240px',
          boxShadow: 'var(--box-shadow)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', letterSpacing: '1px' }}>PREMIUM CHOICE</span>
          <h3 style={{ fontSize: '1.65rem', margin: '6px 0 12px 0', color: 'white' }}>Luxury Fragrances</h3>
          <p style={{ fontSize: '0.85rem', color: '#FFF3F7', marginBottom: '18px', maxWidth: '300px' }}>
            Sensual floral and authentic woody premium signatures.
          </p>
          <Link to="/products?category=fragrance" className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '8px 20px', fontSize: '0.82rem', borderColor: 'white', color: 'white' }}>
            Explore Luxe
          </Link>
        </div>
      </section>

      {/* Glow Deals Section */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>Glow Deals</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Stellar discounts of 20% or more on must-haves</p>
          </div>
          <Link to="/products?discount=20" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>
            See All Deals →
          </Link>
        </div>

        {loadDeals ? <Loader /> : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '30px'
          }}>
            {dealsData?.products?.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomePage;
