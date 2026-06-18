import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import users from './users.js';
import categories from './categories.js';
import products from './products.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Coupon.deleteMany();

    const createdUsers = await User.insertMany(users);
    const createdCategories = await Category.insertMany(categories);

    const sampleProducts = products.map((p) => ({
      ...p,
      category: createdCategories[p.categoryIndex]._id,
      categoryIndex: undefined,
    }));

    await Product.insertMany(sampleProducts);

    // Create sample coupons
    await Coupon.insertMany([
      { code: 'WELCOME10', type: 'percentage', value: 10, maxDiscount: 200, minPurchase: 499, endDate: new Date('2027-12-31'), description: '10% off on your first order' },
      { code: 'FLAT200', type: 'fixed', value: 200, minPurchase: 999, endDate: new Date('2027-12-31'), description: 'Flat ₹200 off on orders above ₹999' },
      { code: 'BEAUTY20', type: 'percentage', value: 20, maxDiscount: 500, minPurchase: 1499, endDate: new Date('2027-12-31'), description: '20% off up to ₹500' },
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Coupon.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
