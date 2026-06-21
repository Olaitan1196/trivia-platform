import Stage from '../models/Stage.js';
import Event from '../models/Event.js';

export const createStage = async (req, res) => {
  try {
    const { eventId, stageNumber, stageName, startAt, endAt, qualifyingCount, isFinalStage } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const newStage = new Stage({
      event: eventId,
      stageNumber,
      stageName,
      startAt,
      endAt,
      qualifyingCount: isFinalStage ? null : qualifyingCount,
      isFinalStage,
    });

    await newStage.save();

    res.status(201).json({
      message: 'Stage created successfully',
      stage: newStage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStagesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stages = await Stage.find({ event: eventId }).sort({ stageNumber: 1 });

    res.status(200).json(stages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStageStatus = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { status } = req.body;

    const stage = await Stage.findByIdAndUpdate(stageId, { status }, { new: true });

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    res.status(200).json({ message: 'Stage status updated', stage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};