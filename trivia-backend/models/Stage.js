import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  stageNumber: {
    type: Number,
    required: true,
  },
  stageName: {
    type: String,
    required: true,
  },
  startAt: {
    type: Date,
    required: true,
  },
  endAt: {
    type: Date,
    required: true,
  },
  qualifyingCount: {
    type: Number,
    default: null,
  },
  isFinalStage: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Stage = mongoose.model('Stage', stageSchema);

export default Stage;