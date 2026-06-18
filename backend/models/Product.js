import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    richDescription: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    mrp: { type: Number, required: [true, 'MRP is required'], min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, default: '' },
    images: [{ url: { type: String, required: true }, public_id: { type: String, default: '' } }],
    thumbnail: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    ratings: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0 } },
    variants: [{ type: { type: String }, name: { type: String }, value: { type: String }, price: Number, stock: Number, image: String }],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    weight: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    howToUse: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', tags: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  if (this.mrp > 0 && this.price < this.mrp) this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  if (this.images.length > 0 && !this.thumbnail) this.thumbnail = this.images[0].url;
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
