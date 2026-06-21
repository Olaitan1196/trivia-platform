import mongoose from 'mongoose';

const eventParticipantSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentReference: {
    type: String,
    required: true,
  },
  currentStage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    default: null,
  },
  isEliminated: {
    type: Boolean,
    default: false,
  },
  isWinner: {
    type: Boolean,
    default: false,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const EventParticipant = mongoose.model('EventParticipant', eventParticipantSchema);

export default EventParticipant;