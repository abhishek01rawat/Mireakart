import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp thumbnail slug brand stock discount');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant = '' } = req.body;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.stock < quantity) { res.status(400); throw new Error('Not enough stock'); }
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const existing = cart.items.find((i) => i.product.toString() === productId && i.variant === variant);
  if (existing) { existing.quantity = Math.min(existing.quantity + quantity, product.stock); }
  else { cart.items.push({ product: productId, quantity, variant }); }
  await cart.save();
  cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp thumbnail slug brand stock discount');
  res.json({ success: true, cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const item = cart.items.id(req.params.itemId);
  if (!item) { res.status(404); throw new Error('Item not found'); }
  const product = await Product.findById(item.product);
  if (req.body.quantity > product.stock) { res.status(400); throw new Error('Not enough stock'); }
  item.quantity = req.body.quantity;
  await cart.save();
  cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp thumbnail slug brand stock discount');
  res.json({ success: true, cart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price mrp thumbnail slug brand stock discount');
  res.json({ success: true, cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = []; await cart.save(); }
  res.json({ success: true, message: 'Cart cleared' });
});
