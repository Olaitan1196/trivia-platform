import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";
import Setting from "../models/Setting.js";

export const creditWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Wallet credited successfully",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amountRequested, bankAccountNumber, bankName } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (amountRequested <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const settings = await Setting.findOne();
    const minWithdrawalAmount = settings ? settings.minWithdrawalAmount : 1000;

    if (amountRequested < minWithdrawalAmount) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is ₦${minWithdrawalAmount.toLocaleString()}`,
      });
    }

    if (amountRequested > user.walletBalance) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const taxDeducted = amountRequested * 0.05;
    const amountPaidOut = amountRequested - taxDeducted;

    const newWithdrawal = new Withdrawal({
      user: userId,
      amountRequested,
      taxDeducted,
      amountPaidOut,
      bankAccountNumber,
      bankName,
      status: "pending",
    });

    await newWithdrawal.save();

    user.walletBalance -= amountRequested;
    await user.save();

    res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({
      requestedAt: -1,
    });

    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'fullName email')
      .sort({ requestedAt: -1 });

    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId, status } = req.body;

    const validStatuses = ['approved', 'rejected', 'paid'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'This withdrawal has already been processed' });
    }

    if (status === 'rejected') {
      await User.findByIdAndUpdate(withdrawal.user, {
        $inc: { walletBalance: withdrawal.amountRequested },
      });
    }

    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.status(200).json({
      message: `Withdrawal marked as ${status}`,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};