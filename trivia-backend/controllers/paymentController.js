import axios from 'axios';
import Payment from '../models/Payment.js';
import CategoryFee from '../models/CategoryFee.js';
import User from '../models/User.js';

export const initializePayment = async (req, res) => {
  try {
    const { amount, purpose } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;
    const userCategory = req.user.category;

    const feeLimit = await CategoryFee.findOne({ category: userCategory });

    if (!feeLimit) {
      return res.status(400).json({ message: 'No fee structure set for your category yet' });
    }

    if (amount < feeLimit.minFee || amount > feeLimit.maxFee) {
      return res.status(400).json({
        message: `Amount must be between ₦${feeLimit.minFee} and ₦${feeLimit.maxFee} for your category`,
      });
    }

    const reference = `TRIVIA-${Date.now()}-${userId}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: userEmail,
        amount: amount * 100,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const newPayment = new Payment({
      user: userId,
      amount,
      reference,
      purpose,
      status: 'pending',
    });

    await newPayment.save();

    res.status(200).json({
      message: 'Payment initialized',
      authorizationUrl: response.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (paymentData.status === 'success') {
      payment.status = 'success';
      await payment.save();

      await User.findByIdAndUpdate(payment.user, {
        $inc: { walletBalance: 0 },
      });

      res.status(200).json({ message: 'Payment verified successfully', payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};