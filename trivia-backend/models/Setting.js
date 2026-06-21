import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  minWithdrawalAmount: {
    type: Number,
    required: true,
    default: 1000,
  },
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;