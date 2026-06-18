import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price mrp thumbnail slug brand discount');
  res.json({ success: true, user });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({ success: true, user: { _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, avatar: updated.avatar } });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.body.productId);
  if (idx > -1) user.wishlist.splice(idx, 1); else user.wishlist.push(req.body.productId);
  await user.save();
  const populated = await User.findById(req.user._id).populate('wishlist', 'name price mrp thumbnail slug brand discount');
  res.json({ success: true, wishlist: populated.wishlist });
});

export const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const count = await User.countDocuments();
  const users = await User.find().select('-password').skip((page - 1) * limit).limit(limit).sort('-createdAt');
  res.json({ success: true, users, page, pages: Math.ceil(count / limit), total: count });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin'); }
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  const updated = await user.save();
  res.json({ success: true, user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role } });
});
