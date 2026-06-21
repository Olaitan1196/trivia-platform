import express from 'express';
import { addQuestion, getQuizQuestions, addBulkQuestions } from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/add', protect, adminOnly, addQuestion);
router.post('/add-bulk', protect, adminOnly, addBulkQuestions);
router.get('/quiz', protect, getQuizQuestions);

export default router;