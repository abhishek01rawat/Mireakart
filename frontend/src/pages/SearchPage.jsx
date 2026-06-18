import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FaSearch } from 'react-icons/fa';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useGetProductsQuery({ search: query });

  if (isLoading) return <Loader text={`Searching for matches for "${query}"...`} />;

  return (
    <div className="container fade-in" style={{ paddingTop: '30px' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaSearch style={{ color: 'var(--primary-color)' }} /> Search Results for "{query}"
      </h2>

      {!data?.products || data.products.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>No matches found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>Double check the spelling or try searching for another beauty category.</p>
          <Link to="/products" className="btn btn-primary">Browse All Catalog</Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '30px'
        }}>
          {data.products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
