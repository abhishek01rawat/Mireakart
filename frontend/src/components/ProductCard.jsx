import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa';
import { useToggleWishlistMutation } from '../slices/authApiSlice';
import { useAddToCartMutation } from '../slices/cartApiSlice';
import StarRating from './StarRating';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [toggleWishlist] = useToggleWishlistMutation();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const isWishlisted = userInfo?.wishlist?.some((id) => id === product._id || id._id === product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.info('Please login to manage your wishlist');
      return navigate('/login');
    }
    try {
      await toggleWishlist(product._id).unwrap();
      toast.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.info('Please login to shop');
      return navigate('/login');
    }
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success('Added to Bag!');
    } catch (err) {
      toast.error(err?.data?.message || 'Out of stock');
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'var(--transition)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }} className="product-card-container">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'var(--primary-gradient)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          zIndex: 2,
          boxShadow: '0 4px 10px rgba(232, 0, 113, 0.2)',
        }}>
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 2,
          transition: 'var(--transition)',
          color: isWishlisted ? 'var(--primary-color)' : 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isWishlisted ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} style={{ display: 'block', overflow: 'hidden', position: 'relative', background: '#F8F9FA' }}>
        <img 
          src={product.thumbnail || product.images?.[0]?.url} 
          alt={product.name}
          className="product-card-image"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </Link>

      {/* Card Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--primary-color)',
          letterSpacing: '1px'
        }}>{product.brand}</span>
        
        <Link to={`/product/${product.slug}`}>
          <h3 style={{
            fontSize: '0.92rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: '1.4',
            height: '40px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            margin: '2px 0 6px 0',
            fontFamily: 'Inter, sans-serif'
          }}>{product.name}</h3>
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <StarRating value={product.ratings?.average || 0} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price & MRP */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px', flexGrow: 1 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ₹{product.price}
          </span>
          {product.mrp > product.price && (
            <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
              ₹{product.mrp}
            </span>
          )}
        </div>

        {/* Add to Cart CTA */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          style={{
            width: '100%',
            background: product.stock === 0 ? '#E2E8F0' : 'var(--primary-gradient)',
            color: product.stock === 0 ? '#94A3B8' : 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '12px',
            transition: 'var(--transition)',
            boxShadow: '0 4px 12px rgba(232, 0, 113, 0.15)'
          }}
        >
          <FaShoppingBag size={14} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
