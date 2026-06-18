import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetProductDetailsQuery, 
  useGetRelatedProductsQuery, 
  useCreateReviewMutation,
  useGetProductReviewsQuery
} from '../slices/productsApiSlice';
import { useAddToCartMutation } from '../slices/cartApiSlice';
import { useToggleWishlistMutation } from '../slices/authApiSlice';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaShoppingBag, FaPlus, FaMinus, FaChevronRight } from 'react-icons/fa';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // States
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Fetch API details
  const { data, isLoading, error } = useGetProductDetailsQuery(slug);
  const product = data?.product;

  const { data: relatedData } = useGetRelatedProductsQuery(product?._id, { skip: !product });
  const { data: reviewData, refetch: refetchReviews } = useGetProductReviewsQuery({ productId: product?._id }, { skip: !product });

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const isWishlisted = userInfo?.wishlist?.some((id) => id === product?._id || id._id === product?._id);

  const handleQtyChange = (val) => {
    if (val < 1 || val > (product?.stock || 1)) return;
    setQty(val);
  };

  const handleAddToCart = async () => {
    if (!userInfo) {
      toast.info('Please sign in to add items to your bag');
      return navigate('/login');
    }
    try {
      await addToCart({ productId: product._id, quantity: qty }).unwrap();
      toast.success('Added to Bag!');
    } catch (err) {
      toast.error(err?.data?.message || 'Out of stock');
    }
  };

  const handleWishlist = async () => {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.info('Please sign in to submit reviews');
      return navigate('/login');
    }
    try {
      await createReview({
        productId: product._id,
        rating,
        title: reviewTitle,
        comment: reviewComment
      }).unwrap();
      toast.success('Review published successfully!');
      setReviewTitle('');
      setReviewComment('');
      refetchReviews();
    } catch (err) {
      toast.error(err?.data?.message || 'You have already reviewed this product');
    }
  };

  if (isLoading) return <Loader text="Unveiling product secrets..." />;
  if (error) return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2>Product Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px 0' }}>It seems the product you are looking for has expired or moved.</p>
      <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
    </div>
  );

  return (
    <div className="container fade-in" style={{ paddingTop: '20px' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        <Link to="/" style={{ hover: { color: 'var(--primary-color)' } }}>Home</Link>
        <FaChevronRight size={10} />
        <Link to="/products">Products</Link>
        <FaChevronRight size={10} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product?.name}</span>
      </div>

      {/* Main product info */}
      <div className="product-detail-grid">
        
        {/* Left Side: Product Image Showcase */}
        <div className="product-detail-image-box" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{
            background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', padding: '20px'
          }}>
            <img 
              src={product?.images?.[0]?.url || product?.thumbnail} 
              alt={product?.name}
              style={{ width: '100%', height: '400px', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Right Side: Product Details & Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{
              textTransform: 'uppercase', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1.5px'
            }}>{product?.brand}</span>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', marginTop: '4px', lineHeight: '1.3' }}>{product?.name}</h2>
          </div>

          {/* Rating aggregate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FFF0F5', padding: '10px 16px', borderRadius: '10px', width: 'fit-content' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>{product?.ratings?.average || 0} ★</span>
            <div style={{ width: '1.5px', height: '16px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {product?.ratings?.count || 0} Ratings & Verified Reviews
            </span>
          </div>

          {/* Pricing & MRP details */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{product?.price}</span>
            {product?.mrp > product?.price && (
              <>
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>₹{product?.mrp}</span>
                <span style={{
                  background: 'var(--primary-gradient)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
                }}>
                  {product?.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Specs / Stock */}
          <div style={{ fontSize: '0.9rem' }}>
            <p style={{ display: 'flex', gap: '10px' }}>
              <span style={{ color: 'var(--text-secondary)', width: '100px' }}>Availability:</span>
              <span style={{ fontWeight: 600, color: product?.stock > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                {product?.stock > 0 ? `In Stock (Only ${product.stock} left)` : 'Out of Stock'}
              </span>
            </p>
            {product?.weight && (
              <p style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', width: '100px' }}>Net Volume:</span>
                <span style={{ fontWeight: 600 }}>{product.weight}</span>
              </p>
            )}
          </div>

          {/* Quantity selector & CTAs */}
          {product?.stock > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity:</span>
                <div style={{
                  display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-color)', borderRadius: '30px', overflow: 'hidden', background: '#FFF9FB'
                }}>
                  <button 
                    onClick={() => handleQtyChange(qty - 1)}
                    style={{ background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex' }}
                  >
                    <FaMinus size={11} />
                  </button>
                  <span style={{ padding: '0 8px', minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                  <button 
                    onClick={() => handleQtyChange(qty + 1)}
                    style={{ background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex' }}
                  >
                    <FaPlus size={11} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  style={{
                    flexGrow: 1, height: '52px', fontSize: '1rem'
                  }}
                  className="btn btn-primary"
                >
                  <FaShoppingBag size={16} /> Add to Bag
                </button>
                <button 
                  onClick={handleWishlist}
                  style={{
                    width: '52px', height: '52px', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)', background: 'white'
                  }}
                >
                  {isWishlisted ? <FaHeart size={20} style={{ color: 'var(--primary-color)' }} /> : <FaRegHeart size={20} style={{ color: 'var(--text-secondary)' }} />}
                </button>
              </div>
            </div>
          )}

          {/* Accordion / Tab Details */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
              {['description', 'ingredients', 'how to use'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    textTransform: 'uppercase', padding: '12px 24px', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : 'none',
                    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ padding: '20px 0', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {activeTab === 'description' && <p>{product?.richDescription || product?.description}</p>}
              {activeTab === 'ingredients' && <p>{product?.ingredients || 'Water, Dimethicone, Natural Botanical Essences, Preservatives.'}</p>}
              {activeTab === 'how to use' && <p>{product?.howToUse || 'Take a generous portion, apply smoothly over targeted zones, and rinse if recommended.'}</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Reviews & Submit Review Form */}
      <section style={{ marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', marginBottom: '30px' }}>Customer Reviews & Verified Feedback</h3>
        <div className="reviews-grid">
          
          {/* Reviews list */}
          <div>
            {reviewData?.reviews?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No reviews yet for this product. Be the first to share your thoughts!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviewData?.reviews?.map((rev) => (
                  <div key={rev._id} style={{
                    background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                          {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{rev.user?.name}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <StarRating value={rev.rating} />
                      {rev.isVerifiedPurchase && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--success-color)', background: '#E6F7F3', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    {rev.title && <h5 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rev.title}</h5>}
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to submit review */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', height: 'fit-content'
          }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Write a Product Review</h4>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Rating</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white' }}
                >
                  <option value={5}>5 ★ - Excellent</option>
                  <option value={4}>4 ★ - Good</option>
                  <option value={3}>3 ★ - Average</option>
                  <option value={2}>2 ★ - Fair</option>
                  <option value={1}>1 ★ - Poor</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Review Title</label>
                <input 
                  type="text" 
                  placeholder="Summarize your experience..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Comments / Detailed review</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us what you liked or disliked about this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingReview}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Related products */}
      {relatedData?.products?.length > 0 && (
        <section style={{ marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary-color)', marginBottom: '30px' }}>People Also Viewed</h3>
          <div className="related-products-grid">
            {relatedData.products.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
