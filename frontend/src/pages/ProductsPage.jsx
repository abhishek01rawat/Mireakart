import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetAllCategoriesQuery } from '../slices/productsApiSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FaSlidersH } from 'react-icons/fa';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read categories flat list
  const { data: catData } = useGetAllCategoriesQuery();

  // Query Params for RTK
  const queryParams = {
    page: currentPage,
    sort: selectedSort,
  };
  if (selectedCategory) {
    // Find category ID matching name or ID
    const catObj = catData?.categories?.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase() || c._id === selectedCategory);
    if (catObj) queryParams.category = catObj._id;
  }
  if (minPrice) queryParams.minPrice = minPrice;
  if (maxPrice) queryParams.maxPrice = maxPrice;
  if (selectedRating) queryParams.rating = selectedRating;

  const { data, isLoading, error } = useGetProductsQuery(queryParams);

  // Sync state to URL params
  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (selectedRating) params.rating = selectedRating;
    if (selectedSort) params.sort = selectedSort;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params);
  }, [selectedCategory, minPrice, maxPrice, selectedRating, selectedSort, currentPage]);

  // Handle URL change directly
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSelectedRating(searchParams.get('rating') || '');
    setSelectedSort(searchParams.get('sort') || 'newest');
    setCurrentPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating('');
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  return (
    <div className="container fade-in products-layout-grid">
      
      {/* Sidebar Filters */}
      <aside 
        className={showMobileFilters ? 'show-mobile' : ''}
        style={{
          width: '260px',
          flexShrink: 0,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '24px',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary-color)' }}>Filters</h3>
          <button 
            onClick={clearFilters}
            style={{
              background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>

        {/* Categories Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="category"
                checked={selectedCategory === ''}
                onChange={() => { setSelectedCategory(''); setCurrentPage(1); }}
                style={{ accentColor: 'var(--primary-color)' }}
              />
              All Categories
            </label>
            {catData?.categories?.filter(c => !c.parent).map((cat) => (
              <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="category"
                  checked={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                  onChange={() => { setSelectedCategory(cat.name.toLowerCase()); setCurrentPage(1); }}
                  style={{ accentColor: 'var(--primary-color)' }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Price Range</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              placeholder="Min"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem'
              }}
            />
            <input 
              type="number" 
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Customer Rating Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Ratings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[4, 3, 2].map((stars) => (
              <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="rating"
                  checked={Number(selectedRating) === stars}
                  onChange={() => { setSelectedRating(stars.toString()); setCurrentPage(1); }}
                  style={{ accentColor: 'var(--primary-color)' }}
                />
                {stars}★ & above
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Products Display Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Control Bar */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {data?.total ? `Showing ${data.products.length} of ${data.total} products` : 'Bestselling beauty catalog'}
            </span>
            <button 
              className="mobile-filter-btn"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <FaSlidersH /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Sort Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Sort By:</span>
            <select 
              value={selectedSort}
              onChange={(e) => { setSelectedSort(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', background: 'white'
              }}
            >
              <option value="newest">Bestselling & New</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? <Loader text="Refreshing products catalogue..." /> : (
          <>
            {data?.products?.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary-color)', marginBottom: '8px' }}>No Products Found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>We couldn't find any products matching your active filters.</p>
                <button onClick={clearFilters} className="btn btn-primary">Reset Filters</button>
              </div>
            ) : (
              <div className="related-products-grid">
                {data?.products?.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {data?.pages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px'
              }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Previous
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      background: currentPage === p ? 'var(--primary-gradient)' : 'white',
                      color: currentPage === p ? 'white' : 'var(--text-primary)',
                      border: currentPage === p ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  disabled={currentPage === data.pages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;
