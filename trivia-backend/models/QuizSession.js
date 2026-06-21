import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selectedOptionIndex: {
    type: Number,
    default: null,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  answeredAt: {
    type: Date,
    default: null,
  },
  timeTakenMs: {
    type: Number,
    default: null,
  },
});

const quizSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ['sports', 'academics', 'language'],
  },
  questions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Question',
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'expired'],
    default: 'in_progress',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

export default QuizSession;