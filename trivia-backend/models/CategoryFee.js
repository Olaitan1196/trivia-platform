import mongoose from 'mongoose';

const categoryFeeSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    enum: ['student', 'salary earner', 'pensioner', 'freelancer', 'job seeker'],
  },
  minFee: {
    type: Number,
    required: true,
  },
  maxFee: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CategoryFee = mongoose.model('CategoryFee', categoryFeeSchema);

export default CategoryFee;