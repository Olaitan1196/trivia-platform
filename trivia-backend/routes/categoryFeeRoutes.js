import express from 'express';
import { setCategoryFee, getAllCategoryFees } from '../controllers/categoryFeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/set', protect, adminOnly, setCategoryFee);
router.get('/all', getAllCategoryFees);

export default router;