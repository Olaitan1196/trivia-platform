import express from 'express';
import { createEvent, getEventsForUser, getAllEvents, getEventById, updateEventStatus } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/create', protect, adminOnly, createEvent);
router.get('/my-category', protect, getEventsForUser);
router.get('/all', protect, adminOnly, getAllEvents);
router.get('/:eventId', protect, getEventById);
router.patch('/:eventId/status', protect, adminOnly, updateEventStatus);

export default router;