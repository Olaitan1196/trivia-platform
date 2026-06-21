import express from 'express';
import { creditWallet, getWalletBalance, requestWithdrawal, getMyWithdrawals, getAllWithdrawals, updateWithdrawalStatus } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/credit', protect, adminOnly, creditWallet);
router.get('/balance', protect, getWalletBalance);
router.post('/withdraw', protect, requestWithdrawal);
router.get('/my-withdrawals', protect, getMyWithdrawals);
router.get('/all-withdrawals', protect, adminOnly, getAllWithdrawals);
router.put('/update-status', protect, adminOnly, updateWithdrawalStatus);

export default router;