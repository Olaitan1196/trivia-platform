import express from 'express';
import { createStage, getStagesByEvent, updateStageStatus } from '../controllers/stageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/create', protect, adminOnly, createStage);
router.get('/event/:eventId', protect, getStagesByEvent);
router.patch('/:stageId/status', protect, adminOnly, updateStageStatus);

export default router;