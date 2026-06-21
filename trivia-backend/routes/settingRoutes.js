import express from 'express';
import { getSettings, updateMinWithdrawal } from '../controllers/settingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/min-withdrawal', protect, adminOnly, updateMinWithdrawal);

export default router;