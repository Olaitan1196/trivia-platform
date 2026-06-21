import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['student', 'salary earner', 'pensioner', 'freelancer', 'job seeker'],
  },
  subject: {
    type: String,
    required: true,
    enum: ['sports', 'academics', 'language'],
  },
  entryFee: {
    type: Number,
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
  },
  currentParticipants: {
    type: Number,
    default: 0,
  },
  hasStages: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  platformCutPercentage: {
    type: Number,
    default: 10,
  },
  prizeDistribution: [
    {
      rank: { type: Number, required: true },
      percentage: { type: Number, required: true },
    },
  ],
  isPaidOut: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;