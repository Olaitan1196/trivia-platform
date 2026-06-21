import QuizSession from '../models/QuizSession.js';
import Question from '../models/Question.js';
import EventParticipant from '../models/EventParticipant.js';
import Stage from '../models/Stage.js';
import Event from '../models/Event.js';

export const startQuizSession = async (req, res) => {
  try {
    const { eventId, stageId } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const stage = await Stage.findById(stageId);

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    const now = new Date();

    if (now < stage.startAt || now > stage.endAt) {
      return res.status(400).json({ message: 'This stage is not currently open for play' });
    }

    const participant = await EventParticipant.findOne({ event: eventId, user: userId });

    if (!participant) {
      return res.status(403).json({ message: 'You are not registered for this event' });
    }

    if (participant.isEliminated) {
      return res.status(403).json({ message: 'You have been eliminated from this event' });
    }

    if (participant.currentStage.toString() !== stageId.toString()) {
      return res.status(403).json({ message: 'You are not eligible for this stage' });
    }

    const existingSession = await QuizSession.findOne({
      event: eventId,
      stage: stageId,
      user: userId,
    });

    if (existingSession) {
      return res.status(400).json({ message: 'You have already attempted this stage' });
    }

    const questions = await Question.aggregate([
      { $match: { subject: event.subject } },
      { $sample: { size: 10 } },
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions available for this subject' });
    }

    const questionIds = questions.map((q) => q._id);

    const newSession = new QuizSession({
      user: userId,
      event: eventId,
      stage: stageId,
      subject: event.subject,
      questions: questionIds,
      answers: [],
      status: 'in_progress',
    });

    await newSession.save();

    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      timeLimitSeconds: q.timeLimitSeconds,
    }));

    res.status(201).json({
      message: 'Quiz session started',
      sessionId: newSession._id,
      questions: safeQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, selectedOptionIndex } = req.body;
    const userId = req.user._id;

    const session = await QuizSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'This session does not belong to you' });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: 'This quiz session is no longer active' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const alreadyAnswered = session.answers.find(
      (a) => a.question.toString() === questionId.toString()
    );

    if (alreadyAnswered) {
      return res.status(400).json({ message: 'This question has already been answered' });
    }

    const answeredAt = Date.now();
    const timeTakenMs = answeredAt - new Date(session.startedAt).getTime();

    const timeLimitMs = question.timeLimitSeconds * 1000;

    let isCorrect = false;
    let finalSelectedIndex = selectedOptionIndex;

    if (timeTakenMs > timeLimitMs) {
      finalSelectedIndex = null;
      isCorrect = false;
    } else {
      isCorrect = selectedOptionIndex === question.correctOptionIndex;
    }

    session.answers.push({
      question: questionId,
      selectedOptionIndex: finalSelectedIndex,
      isCorrect,
      answeredAt: new Date(answeredAt),
      timeTakenMs,
    });

    await session.save();

    res.status(200).json({
      message: timeTakenMs > timeLimitMs ? 'Time expired for this question' : 'Answer submitted',
      isCorrect,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const completeQuizSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    const session = await QuizSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    if (session.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'This session does not belong to you' });
    }

    const score = session.answers.filter((a) => a.isCorrect).length;

    session.score = score;
    session.status = 'completed';
    session.completedAt = new Date();

    await session.save();

    res.status(200).json({
      message: 'Quiz completed',
      score,
      totalQuestions: session.questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};