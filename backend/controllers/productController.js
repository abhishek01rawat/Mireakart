import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.brand) query.brand = { $in: req.query.brand.split(',') };
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.rating) query['ratings.average'] = { $gte: Number(req.query.rating) };
  if (req.query.discount) query.discount = { $gte: Number(req.query.discount) };
  if (req.query.search) query.$text = { $search: req.query.search };
  let sortObj = {};
  switch (req.query.sort) {
    case 'price_asc': sortObj = { price: 1 }; break;
    case 'price_desc': sortObj = { price: -1 }; break;
    case 'newest': sortObj = { createdAt: -1 }; break;
    case 'rating': sortObj = { 'ratings.average': -1 }; break;
    case 'popularity': sortObj = { sold: -1 }; break;
    case 'discount': sortObj = { discount: -1 }; break;
    default: sortObj = { createdAt: -1 };
  }
  const count = await Product.countDocuments(query);
  const products = await Product.find(query).populate('category', 'name slug').sort(sortObj).skip((page - 1) * limit).limit(limit);
  const brands = await Product.distinct('brand', { isActive: true, ...(req.query.category ? { category: req.query.category } : {}) });
  res.json({ success: true, products, page, pages: Math.ceil(count / limit), total: count, brands });
});

export const getProduct = asyncHandler(async (req, res) => {
  let product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) product = await Product.findOne({ _id: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).populate('category', 'name slug').limit(Number(req.query.limit) || 8).sort('-createdAt');
  res.json({ success: true, products });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate('category', 'name slug').sort({ 'ratings.average': -1 }).limit(Number(req.query.limit) || 8);
  res.json({ success: true, products });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const related = await Product.find({ _id: { $ne: product._id }, isActive: true, $or: [{ category: product.category }, { brand: product.brand }] }).limit(8);
  res.json({ success: true, products: related });
});

export const getDeals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, discount: { $gte: 20 } }).populate('category', 'name slug').sort({ discount: -1 }).limit(Number(req.query.limit) || 12);
  res.json({ success: true, products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, product: updated });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const query = {};
  if (req.query.search) query.$text = { $search: req.query.search };
  const count = await Product.countDocuments(query);
  const products = await Product.find(query).populate('category', 'name').skip((page - 1) * limit).limit(limit).sort('-createdAt');
  res.json({ success: true, products, page, pages: Math.ceil(count / limit), total: count });
});
