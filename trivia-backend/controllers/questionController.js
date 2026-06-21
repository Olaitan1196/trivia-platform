import Question from '../models/Question.js';

export const addQuestion = async (req, res) => {
  try {
    const { subject, questionText, options, correctOptionIndex, timeLimitSeconds, difficulty } = req.body;

    const newQuestion = new Question({
      subject,
      questionText,
      options,
      correctOptionIndex,
      timeLimitSeconds,
      difficulty,
    });

    await newQuestion.save();

    res.status(201).json({
      message: 'Question added successfully',
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { subject, limit } = req.query;

    const filter = subject ? { subject } : {};

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Number(limit) || 10 } },
    ]);

    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      subject: q.subject,
      questionText: q.questionText,
      options: q.options,
      timeLimitSeconds: q.timeLimitSeconds,
    }));

    res.status(200).json(safeQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const addBulkQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided' });
    }

    const insertedQuestions = await Question.insertMany(questions);

    res.status(201).json({
      message: `${insertedQuestions.length} questions added successfully`,
      data: insertedQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}