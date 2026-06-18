import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: [true, 'Please write a review'], maxlength: 1000 },
    images: [{ url: String, public_id: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  const update = stats.length > 0
    ? { 'ratings.average': Math.round(stats[0].avgRating * 10) / 10, 'ratings.count': stats[0].numReviews }
    : { 'ratings.average': 0, 'ratings.count': 0 };
  await mongoose.model('Product').findByIdAndUpdate(productId, update);
};

reviewSchema.post('save', function () { this.constructor.calcAverageRatings(this.product); });
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcAverageRatings(doc.product); });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
