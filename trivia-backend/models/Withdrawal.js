import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amountRequested: {
    type: Number,
    required: true,
  },
  taxDeducted: {
    type: Number,
    required: true,
  },
  amountPaidOut: {
    type: Number,
    required: true,
  },
  bankAccountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
    default: null,
  },
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;