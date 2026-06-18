import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    icon: { type: String, default: '' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual('subcategories', { ref: 'Category', localField: '_id', foreignField: 'parent' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.pre('save', function (next) { this.slug = slugify(this.name, { lower: true }); next(); });

const Category = mongoose.model('Category', categorySchema);
export default Category;
