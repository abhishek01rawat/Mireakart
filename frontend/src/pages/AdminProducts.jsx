import React, { useState, useRef } from 'react';
import { useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useGetAllCategoriesQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaPlus, FaSave, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const AdminProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, refetch } = useGetAdminProductsQuery({ page: currentPage });
  const { data: catData } = useGetAllCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const { token } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setImageUrl(data.image);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p._id);
    setName(p.name);
    setPrice(p.price);
    setMrp(p.mrp);
    setBrand(p.brand);
    setCategory(p.category?._id || p.category || '');
    setStock(p.stock);
    setDescription(p.description);
    setIngredients(p.ingredients || '');
    setHowToUse(p.howToUse || '');
    setIsFeatured(p.isFeatured || false);
    setImageUrl(p.images?.[0]?.url || p.thumbnail || '');
    setShowForm(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const productPayload = {
      name,
      price: Number(price),
      mrp: Number(mrp),
      brand,
      category,
      stock: Number(stock),
      description,
      ingredients,
      howToUse,
      isFeatured,
      thumbnail: imageUrl,
      images: [{ url: imageUrl }],
    };

    try {
      if (editingId) {
        await updateProduct({ id: editingId, ...productPayload }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productPayload).unwrap();
        toast.success('New product created!');
      }
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted');
      refetch();
    } catch (err) {
      toast.error('Could not delete product');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setMrp('');
    setBrand('');
    setCategory('');
    setStock('');
    setDescription('');
    setIngredients('');
    setHowToUse('');
    setIsFeatured(false);
    setImageUrl('');
    setShowForm(false);
  };

  if (isLoading) return <Loader text="Unveiling stock inventories..." />;

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '50px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--error-color)', marginBottom: '15px' }}>
          {error?.data?.message || 'Failed to load products'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Please try refreshing the page or checking your administrator privileges.
        </p>
        <button onClick={() => refetch()} className="btn btn-primary" style={{ margin: '0 auto' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--secondary-color)', margin: 0 }}>Manage Inventory Products</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            <FaPlus size={12} /> Add Product
          </button>
        )}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <form onSubmit={handleCreateOrUpdate} style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px'
        }}>
          <h3 style={{ gridColumn: '1 / -1', fontSize: '1.15rem', color: 'var(--secondary-color)', margin: '0 0 10px 0' }}>
            {editingId ? 'Edit Product Parameters' : 'Add New Beauty Product'}
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Product Title</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Brand Name</label>
            <input 
              type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white' }} required
            >
              <option value="">Select Category</option>
              {catData?.categories?.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Stock Inventory</label>
            <input 
              type="number" value={stock} onChange={(e) => setStock(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Selling Price (₹)</label>
            <input 
              type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>MRP (₹)</label>
            <input 
              type="number" value={mrp} onChange={(e) => setMrp(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Product Image</label>

            {/* Upload drop-zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${imageUrl ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: uploadingImage ? 'wait' : 'pointer',
                background: imageUrl ? '#FFF5F9' : '#FAFAFA',
                transition: 'all 0.2s ease',
                minHeight: '120px',
                position: 'relative',
              }}
            >
              {uploadingImage ? (
                <>
                  <FaCloudUploadAlt size={28} color="var(--primary-color)" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Uploading…</span>
                </>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`}
                    alt="Preview"
                    style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                    ✓ Image ready — click to replace
                  </span>
                </>
              ) : (
                <>
                  <FaImage size={28} color="#CBD5E0" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                    Click to upload a product image<br />
                    <span style={{ fontWeight: 400, fontSize: '0.78rem' }}>JPG, PNG or WebP · max 5 MB</span>
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* External URL fallback */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 600 }}>
                — or paste an external image URL —
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Product Description</label>
            <textarea 
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }} required
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Ingredients (Optional)</label>
            <textarea 
              rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)}
              placeholder="List the active ingredients..."
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>How To Use (Optional)</label>
            <textarea 
              rows={2} value={howToUse} onChange={(e) => setHowToUse(e.target.value)}
              placeholder="Instructions for application..."
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={isFeatured} 
              onChange={(e) => setIsFeatured(e.target.checked)} 
              id="featuredCheck"
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
            />
            <label htmlFor="featuredCheck" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Mark as Featured Product (Shows on Homepage Carousel)
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" disabled={isCreating || isUpdating} className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <FaSave /> {editingId ? 'Update Product' : 'Save Product'}
            </button>
            <button type="button" onClick={resetForm} className="btn btn-outline" style={{ padding: '10px 24px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products table list */}
      <div className="responsive-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#FFF3F7', borderBottom: '1.5px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>IMAGE</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>BRAND / TITLE</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>CATEGORY</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>PRICE</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>STOCK</th>
              <th style={{ padding: '16px 20px', fontWeight: 700 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 20px' }}>
                  <img 
                    src={p.thumbnail || p.images?.[0]?.url} 
                    alt={p.name}
                    style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}
                  />
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontSize: '0.72rem', fontWeight: 700, display: 'block' }}>{p.brand}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name} {p.isFeatured && <span style={{ color: 'gold', marginLeft: '5px' }}>⭐</span>}
                  </span>
                </td>
                <td style={{ padding: '12px 20px' }}>
                  {p.category?.name || 'Makeup'}
                </td>
                <td style={{ padding: '12px 20px', fontWeight: 700 }}>
                  ₹{p.price}
                </td>
                <td style={{
                  padding: '12px 20px', fontWeight: 600,
                  color: p.stock < 10 ? 'var(--error-color)' : 'var(--text-primary)'
                }}>
                  {p.stock} units
                </td>
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleEditClick(p)}
                      style={{
                        background: 'none', border: 'none', color: '#3182CE', cursor: 'pointer'
                      }}
                    >
                      <FaEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p._id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer'
                      }}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminProducts;

