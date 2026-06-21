import Event from '../models/Event.js';
import Stage from '../models/Stage.js';

export const createEvent = async (req, res) => {
  try {
    const { title, category, subject, entryFee, maxParticipants, hasStages, platformCutPercentage, prizeDistribution } = req.body;
    const adminId = req.user._id;

    const newEvent = new Event({
      title,
      category,
      subject,
      entryFee,
      maxParticipants,
      hasStages,
      platformCutPercentage,
      prizeDistribution,
      createdBy: adminId,
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEventsForUser = async (req, res) => {
  try {
    const userCategory = req.user.category;

    const events = await Event.find({
      category: userCategory,
      status: { $in: ['upcoming', 'ongoing'] },
    }).sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const stages = await Stage.find({ event: eventId }).sort({ stageNumber: 1 });

    res.status(200).json({ event, stages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findByIdAndUpdate(eventId, { status }, { new: true });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event status updated', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};