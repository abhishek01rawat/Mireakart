import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';

import users from '../data/users.js';
import categories from '../data/categories.js';
import products from '../data/products.js';

const autoSeedDB = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('Database already populated. Auto-seed bypassed.');
      return;
    }

    console.log('Empty database detected! Initiating automatic beauty store seeding...');

    // 1. Clear any stale records in other collections
    await Category.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    // 2. Insert Users using .create to trigger pre-save password hashing or hooks
    const createdUsers = await User.create(users);
    console.log(`Auto-seeded ${createdUsers.length} initial user accounts (Admin included)`);

    // 3. Insert Categories using .create to trigger pre-save slugify hook
    const createdCategories = await Category.create(categories);
    console.log(`Auto-seeded ${createdCategories.length} category nodes`);

    // 4. Map Products with correct Category ObjectIds
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    const mappedProducts = products.map((prod) => {
      // Find category matching in seed
      let catId = createdCategories[0]._id; // Fallback
      if (prod.category) {
        const foundId = categoryMap[prod.category.toLowerCase()];
        if (foundId) catId = foundId;
      }
      return {
        ...prod,
        category: catId
      };
    });

    // 5. Insert Products using .create to trigger pre-save slug, discount, and thumbnail calculation hooks
    const createdProducts = await Product.create(mappedProducts);
    console.log(`Auto-seeded ${createdProducts.length} cosmetics inventory items`);

    // 6. Insert Coupons
    const initialCoupons = [
      { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 499, maxDiscount: 150, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: 'FLAT200', type: 'fixed', value: 200, minPurchase: 1499, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: 'BEAUTY20', type: 'percentage', value: 20, minPurchase: 999, maxDiscount: 300, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    ];
    const createdCoupons = await Coupon.create(initialCoupons);
    console.log(`Auto-seeded ${createdCoupons.length} promotional coupons`);

    console.log('Store auto-seeding completed successfully! 💄✨');
  } catch (err) {
    console.error(`Auto-seeding Failed: ${err.message}`);
  }
};

export default autoSeedDB;
