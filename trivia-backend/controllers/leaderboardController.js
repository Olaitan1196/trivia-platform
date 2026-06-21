import QuizSession from '../models/QuizSession.js';

export const getLeaderboard = async (req, res) => {
  try {
    const { subject } = req.query;

    const filter = { status: 'completed' };
    if (subject) {
      filter.subject = subject;
    }

    const sessions = await QuizSession.find(filter)
      .populate('user', 'fullName category')
      .sort({ score: -1, completedAt: 1 })
      .limit(50);

    const leaderboard = sessions.map((session, index) => {
      const totalTimeMs = session.answers.reduce((sum, a) => sum + (a.timeTakenMs || 0), 0);

      return {
        rank: index + 1,
        userId: session.user._id,
        fullName: session.user.fullName,
        category: session.user.category,
        subject: session.subject,
        score: session.score,
        totalQuestions: session.questions.length,
        totalTimeMs,
        completedAt: session.completedAt,
      };
    });

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};