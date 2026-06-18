import React, { useState } from 'react';
import { useGetOrdersQuery, useUpdateOrderStatusMutation, useVerifyManualPaymentMutation } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaTruck, FaEye, FaShoppingBag, FaCheck, FaTimes, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const { data, isLoading, refetch } = useGetOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [verifyManualPayment, { isLoading: isVerifying }] = useVerifyManualPaymentMutation();
  const [filter, setFilter] = useState('All');
  const [expandedScreenshot, setExpandedScreenshot] = useState(null);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus({ orderId, status: nextStatus }).unwrap();
      toast.success(`Order updated to ${nextStatus}`);
      refetch();
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handleVerify = async (orderId, approve) => {
    try {
      await verifyManualPayment({ orderId, approve }).unwrap();
      toast.success(approve ? '✅ Payment approved! Order confirmed.' : '❌ Screenshot rejected.');
      refetch();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const pendingVerificationCount = data?.orders?.filter(
    (o) => o.paymentMethod === 'Online QR Code' && o.paymentVerificationStatus === 'Pending'
  ).length || 0;

  const filteredOrders = data?.orders?.filter((order) => {
    if (filter === 'All') return true;
    if (filter === 'Pending Verification') {
      return order.paymentMethod === 'Online QR Code' && order.paymentVerificationStatus === 'Pending';
    }
    if (filter === 'Unpaid') return !order.isPaid;
    if (filter === 'Delivered') return order.status === 'Delivered';
    return true;
  });

  if (isLoading) return <Loader text="Unrolling store sales ledger..." />;

  return (
    <div className="container fade-in" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaShoppingBag /> Sales Order Registry
        </h2>
        {pendingVerificationCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#FEF3C7', border: '1.5px solid #F59E0B',
            borderRadius: '10px', padding: '10px 18px',
            color: '#92400E', fontSize: '0.88rem', fontWeight: 700
          }}>
            ⚠️ {pendingVerificationCount} screenshot{pendingVerificationCount > 1 ? 's' : ''} awaiting your verification!
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['All', 'Pending Verification', 'Unpaid', 'Delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1.5px solid',
              borderColor: filter === tab ? 'var(--primary-color)' : 'var(--border-color)',
              background: filter === tab ? 'var(--primary-gradient)' : 'white',
              color: filter === tab ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {tab}
            {tab === 'Pending Verification' && pendingVerificationCount > 0 && (
              <span style={{
                background: 'var(--error-color)', color: 'white',
                fontSize: '0.68rem', padding: '2px 6px', borderRadius: '50%',
                minWidth: '18px', textAlign: 'center'
              }}>
                {pendingVerificationCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="responsive-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#FFF3F7', borderBottom: '1.5px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>ORDER ID</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>BUYER</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>DATE</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>TOTAL</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>PAYMENT</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((order) => {
              const isPendingVerification =
                order.paymentMethod === 'Online QR Code' &&
                order.paymentVerificationStatus === 'Pending';

              return (
                <React.Fragment key={order._id}>
                  {/* Main Row */}
                  <tr style={{
                    borderBottom: isPendingVerification ? 'none' : '1px solid var(--border-color)',
                    background: isPendingVerification ? '#FFFBEB' : 'white'
                  }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                      #{order._id.substring(0, 10).toUpperCase()}
                      {isPendingVerification && (
                        <span style={{
                          display: 'block', fontSize: '0.7rem', color: '#B45309',
                          fontWeight: 700, marginTop: '2px'
                        }}>
                          ⏳ Screenshot Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 600, display: 'block' }}>{order.user?.name || 'Customer'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.user?.email || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{order.totalPrice}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: order.isPaid ? '#E6F7F3' : '#FDEBEB',
                        color: order.isPaid ? 'var(--success-color)' : 'var(--error-color)',
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700
                      }}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      {order.paymentMethod === 'Online QR Code' && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          QR Code
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: order.status === 'Delivered' ? '#E6F7F3' : order.status === 'Cancelled' ? '#FDEBEB' : '#FFF3EB',
                        color: order.status === 'Delivered' ? 'var(--success-color)' : order.status === 'Cancelled' ? 'var(--error-color)' : 'var(--warning-color)',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link
                          to={`/order/${order._id}`}
                          style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                          title="View order details"
                        >
                          <FaEye size={15} /> View
                        </Link>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && !isPendingVerification && (
                          <select
                            disabled={isUpdatingStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            defaultValue={order.status}
                            style={{
                              padding: '6px', border: '1px solid var(--border-color)',
                              borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', background: 'white'
                            }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}

                        {/* Quick screenshot toggle for pending rows */}
                        {isPendingVerification && order.paymentScreenshot?.url && (
                          <button
                            onClick={() => setExpandedScreenshot(expandedScreenshot === order._id ? null : order._id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', fontWeight: 600,
                              background: '#EFF6FF', border: '1px solid #BFDBFE',
                              color: '#1D4ED8', borderRadius: '6px',
                              padding: '5px 10px', cursor: 'pointer'
                            }}
                          >
                            <FaImage size={12} /> {expandedScreenshot === order._id ? 'Hide' : 'Screenshot'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Verification Panel for pending screenshot rows */}
                  {isPendingVerification && (
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: '#FFFBEB' }}>
                      <td colSpan={7} style={{ padding: '0 20px 20px 20px' }}>
                        <div style={{
                          background: 'white', border: '1.5px solid #F59E0B',
                          borderRadius: '12px', padding: '20px',
                          display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap'
                        }}>
                          {/* Screenshot preview */}
                          {order.paymentScreenshot?.url && (
                            <div style={{ flexShrink: 0 }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E', margin: '0 0 8px 0' }}>
                                Payment Screenshot:
                              </p>
                              <a href={order.paymentScreenshot.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={order.paymentScreenshot.url}
                                  alt="Payment screenshot"
                                  style={{
                                    maxHeight: '160px', maxWidth: '200px',
                                    objectFit: 'contain', borderRadius: '8px',
                                    border: '1px solid #FDE68A',
                                    cursor: 'zoom-in'
                                  }}
                                />
                              </a>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Click to open full size</p>
                            </div>
                          )}

                          {/* Order info + action buttons */}
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', margin: '0 0 4px 0' }}>
                                ⏳ Awaiting Payment Verification
                              </p>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Customer submitted a payment screenshot for order{' '}
                                <strong>#{order._id.substring(0, 10).toUpperCase()}</strong> (₹{order.totalPrice}).
                                Verify the screenshot and approve or reject below.
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                              <button
                                onClick={() => handleVerify(order._id, true)}
                                disabled={isVerifying}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '10px 20px', background: '#10B981', color: 'white',
                                  border: 'none', borderRadius: '8px', fontWeight: 700,
                                  fontSize: '0.85rem', cursor: isVerifying ? 'wait' : 'pointer',
                                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                                  opacity: isVerifying ? 0.7 : 1
                                }}
                              >
                                <FaCheck /> Approve & Confirm Order
                              </button>
                              <button
                                onClick={() => handleVerify(order._id, false)}
                                disabled={isVerifying}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '10px 20px', background: '#EF4444', color: 'white',
                                  border: 'none', borderRadius: '8px', fontWeight: 700,
                                  fontSize: '0.85rem', cursor: isVerifying ? 'wait' : 'pointer',
                                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                                  opacity: isVerifying ? 0.7 : 1
                                }}
                              >
                                <FaTimes /> Reject Screenshot
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredOrders?.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No orders found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
