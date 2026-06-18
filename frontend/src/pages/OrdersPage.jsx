import React from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import { FaShoppingBag } from 'react-icons/fa';

const OrdersPage = () => {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.orders;

  if (isLoading) return <Loader text="Unwrapping order packages..." />;

  return (
    <div className="container fade-in" style={{ paddingTop: '30px' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaShoppingBag /> My Orders
      </h2>

      {!orders || orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>You haven't placed any orders yet on Mireakart.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div 
              key={order._id}
              style={{
                background: 'white', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ORDER ID: #{order._id.substring(0, 12).toUpperCase()}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total Amount: ₹{order.totalPrice}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Status Badge */}
                <span style={{
                  background: order.status === 'Delivered' ? '#E6F7F3' : order.status === 'Cancelled' ? '#FDEBEB' : '#FFF3EB',
                  color: order.status === 'Delivered' ? 'var(--success-color)' : order.status === 'Cancelled' ? 'var(--error-color)' : 'var(--warning-color)',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
                }}>
                  {order.status}
                </span>

                <Link to={`/order/${order._id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
