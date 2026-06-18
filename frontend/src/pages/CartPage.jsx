import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation, useValidateCouponMutation } from '../slices/cartApiSlice';
import { FaTrash, FaShoppingBag, FaTag, FaPlus, FaMinus, FaChevronRight } from 'react-icons/fa';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const CartPage = () => {
  const navigate = useNavigate();

  // States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Fetch Cart Details
  const { data, isLoading, refetch } = useGetCartQuery();
  const cart = data?.cart;

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();

  const handleQtyChange = async (itemId, currentQty, stock, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1 || newQty > stock) return;
    try {
      await updateCartItem({ itemId, quantity: newQty }).unwrap();
      toast.success('Quantity updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId).unwrap();
      toast.success('Item removed from Bag');
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  // Price calculations
  const itemsPrice = cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0;
  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
  const shippingPrice = itemsPrice > 499 || itemsPrice === 0 ? 0 : 49;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.type === 'percentage' 
      ? (itemsPrice * appliedCoupon.value) / 100 
      : appliedCoupon.value;
    if (appliedCoupon.type === 'percentage' && appliedCoupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscount);
    }
    discountAmount = Math.min(discountAmount, itemsPrice);
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - discountAmount) * 100) / 100;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      const res = await validateCoupon({ code: couponCode, cartTotal: itemsPrice }).unwrap();
      if (res.success) {
        setAppliedCoupon(res.coupon);
        toast.success(`Coupon ${res.coupon.code} applied successfully!`);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = () => {
    sessionStorage.setItem('checkoutState', JSON.stringify({
      couponCode: appliedCoupon?.code,
      discountAmount
    }));
    navigate('/checkout');
  };

  if (isLoading) return <Loader text="Counting bags items..." />;

  return (
    <div className="container fade-in" style={{ paddingTop: '30px' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaShoppingBag /> Shopping Bag ({cart?.items?.length || 0} items)
      </h2>

      {(!cart?.items || cart.items.length === 0) ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>Your Bag is Empty!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>Fill it with premium makeup, fragrance, haircare, and glowing skin items.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Left: Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item-card">
                <img 
                  src={item.product?.thumbnail} 
                  alt={item.product?.name}
                  className="cart-item-image"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                  <span style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 800 }}>{item.product?.brand}</span>
                  <Link to={`/product/${item.product?.slug}`}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4', paddingRight: '20px' }}>{item.product?.name}</h4>
                  </Link>
                  
                  {/* Prices */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>₹{item.product?.price}</span>
                    {item.product?.mrp > item.product?.price && (
                      <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>₹{item.product?.mrp}</span>
                    )}
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden' }}>
                      <button 
                        disabled={item.quantity <= 1}
                        onClick={() => handleQtyChange(item._id, item.quantity, item.product?.stock, false)}
                        style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', display: 'flex' }}
                      >
                        <FaMinus size={9} />
                      </button>
                      <span style={{ padding: '0 4px', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button 
                        disabled={item.quantity >= item.product?.stock}
                        onClick={() => handleQtyChange(item._id, item.quantity, item.product?.stock, true)}
                        style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', display: 'flex' }}
                      >
                        <FaPlus size={9} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button 
                  onClick={() => handleRemove(item._id)}
                  style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#B5AABF', cursor: 'pointer', transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#B5AABF'}
                >
                  <FaTrash size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
            
            {/* Coupons box */}
            <div style={{
              background: 'white', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTag /> Apply Coupon / Offers
              </h3>
              
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      padding: '10px 14px', border: '1.5px solid var(--border-color)', borderRadius: '8px', flexGrow: 1, fontSize: '0.85rem'
                    }}
                  />
                  <button type="submit" disabled={isValidating} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                    Apply
                  </button>
                </form>
              ) : (
                <div style={{
                  background: '#E6F7F3', border: '1.5px dashed var(--success-color)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--success-color)', fontSize: '0.9rem' }}>{appliedCoupon.code} APPLIED!</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>₹{discountAmount} savings unlocked</p>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: 'var(--error-color)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && <p style={{ color: 'var(--error-color)', fontSize: '0.78rem', fontWeight: 500 }}>{couponError}</p>}

              {/* Suggestions */}
              {!appliedCoupon && (
                <div style={{ marginTop: '5px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active promo codes:</span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['WELCOME10', 'FLAT200', 'BEAUTY20'].map((code) => (
                      <button 
                        key={code}
                        onClick={() => setCouponCode(code)}
                        style={{
                          background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 600
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div style={{
              background: 'white', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <h3 style={{ fontSize: '1.05rem', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>Price Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bag Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{itemsPrice}</span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18% inclusive)</span>
                  <span style={{ fontWeight: 600 }}>₹{taxPrice}</span>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping Charges</span>
                  <span style={{ fontWeight: 600 }}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                </p>
                {discountAmount > 0 && (
                  <p style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                    <span>Coupon Discount</span>
                    <span style={{ fontWeight: 700 }}>- ₹{discountAmount}</span>
                  </p>
                )}
                <div style={{ height: '1.5px', background: 'var(--border-color)', margin: '4px 0' }} />
                <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
                  <span>Total Payable</span>
                  <span>₹{totalPrice}</span>
                </p>
              </div>

              <button 
                onClick={handleCheckout}
                className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '10px' }}
              >
                Proceed to Checkout <FaChevronRight size={12} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
