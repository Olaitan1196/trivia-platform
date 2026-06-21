import express from 'express';
import { startQuizSession, submitAnswer, completeQuizSession } from '../controllers/quizSessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startQuizSession);
router.post('/answer', protect, submitAnswer);
router.post('/complete', protect, completeQuizSession);

export default router;