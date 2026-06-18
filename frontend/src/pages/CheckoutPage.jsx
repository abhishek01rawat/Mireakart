import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProfileQuery } from '../slices/authApiSlice';
import { useGetCartQuery } from '../slices/cartApiSlice';
import { useCreateOrderMutation, useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation, useGetRazorpayConfigQuery } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaHome, FaCreditCard, FaLock, FaChevronRight } from 'react-icons/fa';

// Function to dynamically load the Razorpay SDK
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // States
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Online QR Code');

  // Fetch info
  const { data: profileData, isLoading: loadProfile } = useGetProfileQuery();
  const { data: cartData, isLoading: loadCart } = useGetCartQuery();
  const { data: configData } = useGetRazorpayConfigQuery();

  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder, { isLoading: isCreatingRzpOrder }] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

  // Retrieve checkout states passed from Cart Page
  const [checkoutMeta, setCheckoutMeta] = useState({ couponCode: '', discountAmount: 0 });

  useEffect(() => {
    const meta = sessionStorage.getItem('checkoutState');
    if (meta) {
      try {
        setCheckoutMeta(JSON.parse(meta));
      } catch (e) {}
    }
  }, []);

  // Sync default address
  useEffect(() => {
    if (profileData?.user?.addresses?.length > 0) {
      const def = profileData.user.addresses.find(a => a.isDefault) || profileData.user.addresses[0];
      setSelectedAddress(def);
    }
  }, [profileData]);

  const itemsPrice = cartData?.cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0;
  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
  const shippingPrice = itemsPrice > 499 || itemsPrice === 0 ? 0 : 49;
  const discountAmount = checkoutMeta.discountAmount || 0;
  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - discountAmount) * 100) / 100;

  const displayRazorpay = async (createdOrderDbId) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create order on Razorpay backend
      const { data } = await createRazorpayOrder({ amount: totalPrice });
      
      if (!data || !data.order) {
        toast.error('Server error creating Razorpay order. Are API keys set?');
        return;
      }

      // 2. Open Razorpay modal
      const options = {
        key: configData?.keyId, // Public Key
        amount: data.order.amount,
        currency: 'INR',
        name: 'Mireakart Cosmetics',
        description: 'Premium Beauty Purchase',
        image: '/logo.png', // Add a logo link here if you have one
        order_id: data.order.id, // This is the order_id created by Razorpay
        handler: async function (response) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: createdOrderDbId, // Our DB order ID
            }).unwrap();

            toast.success('Payment Successful! Order Confirmed.');
            sessionStorage.removeItem('checkoutState');
            navigate(`/order/${createdOrderDbId}`);
          } catch (err) {
            toast.error(err?.data?.message || 'Payment Verification Failed!');
            navigate(`/order/${createdOrderDbId}`); // Still redirect so they see the failed/pending order
          }
        },
        prefill: {
          name: profileData?.user?.name || userInfo?.name || '',
          email: profileData?.user?.email || userInfo?.email || '',
          contact: selectedAddress?.phone || '',
        },
        theme: {
          color: '#E80071',
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        navigate(`/order/${createdOrderDbId}`);
      });

      paymentObject.open();

    } catch (err) {
      toast.error('Error launching payment gateway');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error('Please select a shipping address');
    }

    const orderItems = cartData.cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      image: item.product.thumbnail,
      price: item.product.price,
      variant: item.variant
    }));

    try {
      const orderData = {
        orderItems,
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        },
        paymentMethod,
        couponCode: checkoutMeta.couponCode || null,
        discountAmount,
      };

      // 1. Create order in our Database (isPaid defaults to false)
      const res = await createOrder(orderData).unwrap();
      const createdOrderDbId = res.order._id;
      
      toast.success('Order placed successfully! Bag cleared.');
      sessionStorage.removeItem('checkoutState');
      navigate(`/order/${createdOrderDbId}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not place order');
    }
  };

  if (loadProfile || loadCart) return <Loader text="Setting up cashiers checkout desk..." />;

  return (
    <div className="container fade-in checkout-layout-grid">
      
      {/* Left Columns: Delivery & Payment options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Shipping Address choice */}
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHome /> 1. Shipping Address
          </h3>

          {!profileData?.user?.addresses || profileData.user.addresses.length === 0 ? (
            <div style={{ padding: '10px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>You haven't saved any addresses yet.</p>
              <button onClick={() => navigate('/profile')} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                Add New Address
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {profileData.user.addresses.map((addr) => (
                <label 
                  key={addr._id}
                  style={{
                    display: 'flex', gap: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', cursor: 'pointer',
                    borderColor: selectedAddress?._id === addr._id ? 'var(--primary-color)' : 'var(--border-color)',
                    background: selectedAddress?._id === addr._id ? '#FFF9FB' : 'transparent',
                    transition: 'var(--transition)'
                  }}
                >
                  <input 
                    type="radio" name="checkoutAddress"
                    checked={selectedAddress?._id === addr._id}
                    onChange={() => setSelectedAddress(addr)}
                    style={{ accentColor: 'var(--primary-color)', marginTop: '4px' }}
                  />
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{addr.street}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Phone: {addr.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Payment options */}
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCreditCard /> 2. Payment Method
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <label style={{
              display: 'flex', gap: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', cursor: 'pointer',
              borderColor: paymentMethod === 'Online QR Code' ? 'var(--primary-color)' : 'var(--border-color)',
              background: paymentMethod === 'Online QR Code' ? '#FFF9FB' : 'transparent'
            }}>
              <input 
                type="radio" name="payment" value="Online QR Code"
                checked={paymentMethod === 'Online QR Code'}
                onChange={() => setPaymentMethod('Online QR Code')}
                style={{ accentColor: 'var(--primary-color)' }}
              />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Online UPI QR Code
                </span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Scan QR & upload payment screenshot</p>
              </div>
            </label>

            <label style={{
              display: 'flex', gap: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', cursor: 'pointer',
              borderColor: paymentMethod === 'COD' ? 'var(--primary-color)' : 'var(--border-color)',
              background: paymentMethod === 'COD' ? '#FFF9FB' : 'transparent'
            }}>
              <input 
                type="radio" name="payment" value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                style={{ accentColor: 'var(--primary-color)' }}
              />
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cash On Delivery (COD)</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Pay with cash or UPI on delivery</p>
              </div>
            </label>
            
          </div>
        </div>

      </div>

      {/* Right Column: Checkout Breakdown */}
      <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '18px'
        }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
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
                <span>Coupon Applied</span>
                <span style={{ fontWeight: 700 }}>- ₹{discountAmount}</span>
              </p>
            )}
            <div style={{ height: '1px', background: 'var(--border-color)' }} />
            <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </p>
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || isCreatingRzpOrder || !cartData?.cart?.items?.length}
            className="btn btn-primary"
            style={{ width: '100%', height: '50px', fontSize: '0.95rem', marginTop: '10px' }}
          >
            {isPlacingOrder || isCreatingRzpOrder ? 'Processing...' : 'Place Order'} <FaChevronRight size={12} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default CheckoutPage;

