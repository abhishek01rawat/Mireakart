import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate({ path: 'subcategories', match: { isActive: true }, select: 'name slug image icon' }).sort('name');
  const parents = categories.filter((c) => !c.parent);
  res.json({ success: true, categories: parents });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, categories });
});

export const getCategory = asyncHandler(async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).populate('subcategories');
  if (!category) category = await Category.findById(req.params.slug).populate('subcategories');
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  const subs = await Category.countDocuments({ parent: req.params.id });
  if (subs > 0) { res.status(400); throw new Error('Cannot delete category with subcategories'); }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
