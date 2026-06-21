import express from 'express';
import { registerForEvent, confirmEventRegistration, getEventRanking, advanceStageParticipants, getMyParticipantStatus, finalizeEventPayout } from '../controllers/eventParticipantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerForEvent);
router.post('/confirm', protect, confirmEventRegistration);
router.get('/my-status/:eventId', protect, getMyParticipantStatus);
router.get('/ranking/:eventId/:stageId', getEventRanking);
router.post('/advance-stage', protect, adminOnly, advanceStageParticipants);
router.post('/finalize-payout', protect, adminOnly, finalizeEventPayout);

export default router;