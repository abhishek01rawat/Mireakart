import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrderDetailsQuery, useUploadPaymentScreenshotMutation, useVerifyManualPaymentMutation, useUploadFileMutation } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import { FaCheckCircle, FaSpinner, FaShippingFast, FaCheckDouble, FaQrcode, FaUpload, FaCheck, FaTimes, FaHourglassHalf, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';


const OrderDetailPage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useGetOrderDetailsQuery(id);

  const [copied, setCopied] = useState(false);
  // Two-step screenshot flow
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('mireakart@ybl');
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [uploadScreenshot, { isLoading: isUploadingScreenshot }] = useUploadPaymentScreenshotMutation();
  const [verifyManualPayment, { isLoading: isVerifyingPayment }] = useVerifyManualPaymentMutation();

  // Step 1 — user picks a file, show local preview only
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2 — user clicks "Send for Approval" → upload + submit
  const handleSendForApproval = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      toast.info('Uploading screenshot…');
      const uploadRes = await uploadFile(formData).unwrap();
      await uploadScreenshot({ orderId: id, url: uploadRes.image }).unwrap();
      toast.success('Screenshot sent for admin approval! 🎉');
      handleClearFile();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send screenshot');
    }
  };

  const handleAdminVerification = async (approve) => {
    try {
      await verifyManualPayment({ orderId: id, approve }).unwrap();
      toast.success(approve ? 'Payment approved and order confirmed! ✅' : 'Screenshot rejected.');
      refetch();
    } catch (err) {
      toast.error('Failed to verify payment');
    }
  };

  const order = data?.order;

  if (isLoading) return <Loader text="Retrieving delivery receipt..." />;
  if (error) return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>Order Receipt Not Found</h2>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to My Orders</Link>
    </div>
  );

  const statusSteps = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];
  const activeIndex = statusSteps.indexOf(order.status);

  return (
    <div className="container fade-in" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Details */}
      <div style={{
        background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px 30px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RECEIPT FOR ORDER:</span>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginTop: '4px' }}>#{order._id.toUpperCase()}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Placed: {new Date(order.createdAt).toLocaleString()}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Payment Method: <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span></span>
        </div>
      </div>

      {/* Horizontal Status Tracker Wizard */}
      <div className="order-tracker">
        {statusSteps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={step} className="order-tracker-step">
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: isCompleted ? 'var(--primary-gradient)' : '#E2E8F0',
                color: isCompleted ? 'white' : '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isCompleted ? '0 4px 10px rgba(232,0,113,0.2)' : 'none',
                transition: 'var(--transition)'
              }}>
                {idx === 0 && <FaSpinner className={isActive ? 'spinner' : ''} size={15} style={{ animation: isActive ? 'spin 1.5s linear infinite' : 'none' }} />}
                {idx === 1 && <FaCheckCircle size={15} />}
                {idx === 2 && <FaShippingFast size={15} />}
                {idx === 3 && <FaCheckDouble size={15} />}
              </div>
              <span style={{
                fontSize: '0.85rem', fontWeight: isCompleted ? 700 : 500,
                color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>{step}</span>
            </div>
          );
        })}
      </div>


      {/* Order Placed (Processing) Notice */}
      {order.status === 'Processing' && (
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #F59E0B',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#B45309',
          fontSize: '0.92rem',
          lineHeight: '1.5'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
          <div>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#92400E' }}>Your Order Has Been Placed!</h4>
            <p style={{ margin: '4px 0 0 0' }}>Some items in your order are currently awaiting inventory confirmation. Your order is waiting for final confirmation by the seller and will be updated shortly.</p>
          </div>
        </div>
      )}

      {/* Manual UPI QR Code Payment Box */}
      {order.paymentMethod === 'Online QR Code' && (
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaQrcode /> Online UPI Payment (QR Code)
          </h3>
          
          <div className="upi-payment-grid">
            {/* Left side: QR Code details */}
            {order.paymentVerificationStatus !== 'Verified' && order.paymentVerificationStatus !== 'Pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#FAFAFA' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=mireakart@ybl&pn=Mireakart&am=${order.totalPrice}&cu=INR&tn=Order_${order._id.slice(-6)}`)}`} 
                  alt="UPI QR Code" 
                  style={{ width: '200px', height: '200px', borderRadius: '8px', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>Scan with any UPI App</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Payable: <strong style={{ color: 'var(--secondary-color)', fontSize: '1rem' }}>₹{order.totalPrice}</strong></p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span>UPI ID: <strong>mireakart@ybl</strong></span>
                    <button 
                      onClick={handleCopyUPI}
                      style={{
                        padding: '4px 8px', fontSize: '0.72rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <a 
                    href={`upi://pay?pa=mireakart@ybl&pn=Mireakart&am=${order.totalPrice}&cu=INR&tn=Order_${order._id.slice(-6)}`}
                    style={{
                      marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', background: '#10B981', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 2px 6px rgba(16,185,129,0.2)', transition: 'all 0.2s'
                    }}
                  >
                    🚀 Pay directly via UPI App
                  </a>
                </div>
              </div>
            )}

            {/* Right/Verification status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
              {/* Payment Deadline Info */}
              {order.paymentVerificationStatus !== 'Verified' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0F9FF', color: '#0284C7', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #BAE6FD' }}>
                  <FaHourglassHalf />
                  <span>
                    Your payment screenshot will be verified and approved within 2 hours.
                  </span>
                </div>
              )}

              {/* Status label for Not Uploaded state is handled by the upload section below */}

              {order.paymentVerificationStatus === 'Pending' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '12px', padding: '20px', color: '#B45309' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
                    <FaSpinner className="spinner" style={{ animation: 'spin 1.5s linear infinite' }} /> Payment Verification Pending
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    We have received your payment screenshot. An administrator will verify the payment and confirm your order shortly.
                  </p>
                  {order.paymentScreenshot?.url && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#92400E', marginBottom: '5px' }}>Submitted Screenshot:</p>
                      <a href={order.paymentScreenshot.url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={order.paymentScreenshot.url} 
                          alt="Payment receipt screenshot" 
                          style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid #F3F4F6' }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {order.paymentVerificationStatus === 'Verified' && (
                <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '12px', padding: '20px', color: '#065F46' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '0.95rem' }}>
                    <FaCheckCircle style={{ color: '#10B981' }} /> Payment Verified & Approved
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0' }}>
                    Your payment was verified by our admin. Your order has been officially confirmed!
                  </p>
                </div>
              )}

              {/* Upload section for Not Uploaded or Rejected states */}
              {(order.paymentVerificationStatus === 'Not Uploaded' || order.paymentVerificationStatus === 'Rejected') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {order.paymentVerificationStatus === 'Rejected'
                      ? 'Your previous screenshot was rejected. Please upload a new valid payment screenshot.'
                      : 'Please pay via the QR code above, then take a screenshot and upload it below for verification.'}
                  </p>

                  {/* Step 1: Select File */}
                  {!previewUrl ? (
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', padding: '10px 20px', width: 'fit-content',
                      background: 'var(--primary-gradient)', color: 'white',
                      border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <FaUpload /> Choose Screenshot
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ) : (
                    /* Step 2: Preview + Send */
                    <div style={{
                      background: '#F0FFF4', border: '1.5px solid #10B981',
                      borderRadius: '12px', padding: '16px',
                      display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46', margin: 0 }}>
                        ✅ Screenshot selected — review before sending:
                      </p>
                      <img
                        src={previewUrl}
                        alt="Selected payment screenshot"
                        style={{
                          maxHeight: '180px', maxWidth: '100%', objectFit: 'contain',
                          borderRadius: '8px', border: '1px solid #D1FAE5'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleSendForApproval}
                          disabled={isUploadingFile || isUploadingScreenshot}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '10px 22px', background: '#10B981', color: 'white',
                            border: 'none', borderRadius: '8px', fontWeight: 700,
                            fontSize: '0.88rem', cursor: isUploadingFile || isUploadingScreenshot ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.25)', opacity: isUploadingFile || isUploadingScreenshot ? 0.7 : 1
                          }}
                        >
                          {isUploadingFile || isUploadingScreenshot
                            ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                            : <><FaPaperPlane /> Send for Approval</>}
                        </button>
                        <button
                          onClick={handleClearFile}
                          disabled={isUploadingFile || isUploadingScreenshot}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', background: 'white',
                            border: '1.5px solid var(--border-color)', borderRadius: '8px',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)'
                          }}
                        >
                          <FaTrash size={12} /> Change File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Actions Panel */}
              {userInfo?.role === 'admin' && order.paymentVerificationStatus === 'Pending' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Admin Review Panel:</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleAdminVerification(true)} 
                      disabled={isVerifyingPayment}
                      className="btn btn-success"
                      style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <FaCheck /> Approve Payment
                    </button>
                    <button 
                      onClick={() => handleAdminVerification(false)} 
                      disabled={isVerifyingPayment}
                      className="btn btn-danger"
                      style={{ background: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <FaTimes /> Reject Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Column details: Left items list, Right billing & delivery addresses */}
      <div className="order-details-grid">
        
        {/* Left: ordered items */}
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>Ordered Items</h3>
          {order.orderItems.map((item) => (
            <div key={item._id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <img 
                src={item.image} 
                alt={item.name}
                style={{ width: '54px', height: '60px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}
              />
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>{item.name}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Qty: {item.quantity} • price: ₹{item.price}
                </p>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Right: address & billing totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Address */}
          <div style={{
            background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px'
          }}>
            <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Delivery Address</h3>
            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{order.shippingAddress.street}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Pricing */}
          <div style={{
            background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Billing Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bag Subtotal</span>
                <span>₹{order.itemsPrice}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                <span>₹{order.taxPrice}</span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping Fee</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
              </p>
              {order.discountAmount > 0 && (
                <p style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                  <span>Applied Coupon Discount</span>
                  <span style={{ fontWeight: 700 }}>- ₹{order.discountAmount}</span>
                </p>
              )}
              <div style={{ height: '1.5px', background: 'var(--border-color)' }} />
              <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary-color)' }}>
                <span>Grand Total Paid</span>
                <span>₹{order.totalPrice}</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailPage;
