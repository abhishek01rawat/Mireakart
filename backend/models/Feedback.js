import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: 'Anonymous' },
    email: { type: String, default: '' },
    type: { type: String, enum: ['BUG', 'FEEDBACK', 'FEATURE_REQUEST', 'OTHER'], default: 'FEEDBACK' },
    message: { type: String, required: [true, 'Message is required'], maxlength: 2000 },
    page: { type: String, default: '/' },
    status: { type: String, enum: ['OPEN', 'IN_REVIEW', 'RESOLVED'], default: 'OPEN' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
