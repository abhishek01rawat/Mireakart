import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetProfileQuery } from '../slices/authApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FaHeart } from 'react-icons/fa';

const WishlistPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch fresh profile wishlists
  const { data, isLoading } = useGetProfileQuery(undefined, { skip: !userInfo });
  const wishlist = data?.user?.wishlist;

  if (isLoading) return <Loader text="Polishing wishlist mirrors..." />;

  return (
    <div className="container fade-in" style={{ paddingTop: '30px' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaHeart style={{ color: 'var(--primary-color)' }} /> My Wishlist ({wishlist?.length || 0} items)
      </h2>

      {!wishlist || wishlist.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>Tap heart icons on premium beauty items to save them here.</p>
          <Link to="/products" className="btn btn-primary">Find Beauty Essentials</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '30px'
        }}>
          {wishlist.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
