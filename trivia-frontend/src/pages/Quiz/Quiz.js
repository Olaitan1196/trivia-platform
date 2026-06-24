import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

function Quiz() {
  const { eventId, stageId } = useParams();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const blockAction = (e) => e.preventDefault();

    document.addEventListener('contextmenu', blockAction);
    document.addEventListener('copy', blockAction);
    document.addEventListener('cut', blockAction);
    document.addEventListener('paste', blockAction);
    document.addEventListener('selectstart', blockAction);

    return () => {
      document.removeEventListener('contextmenu', blockAction);
      document.removeEventListener('copy', blockAction);
      document.removeEventListener('cut', blockAction);
      document.removeEventListener('paste', blockAction);
      document.removeEventListener('selectstart', blockAction);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const startSession = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const response = await api.post(
          '/api/quizsessions/start',
          { eventId, stageId },
          { headers }
        );

        setSessionId(response.data.sessionId);
        setQuestions(response.data.questions);
        setTimeLeft(response.data.questions[0].timeLimitSeconds);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not start quiz session');
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [eventId, stageId, navigate]);

  useEffect(() => {
    if (loading || questions.length === 0 || currentIndex >= questions.length) {
      return;
    }

    setTimeLeft(questions[currentIndex].timeLimitSeconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, loading, questions]);

  useEffect(() => {
    if (loading || questions.length === 0 || currentIndex >= questions.length) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const questionText = questions[currentIndex].questionText;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '600 20px Arial';
    ctx.textBaseline = 'top';

    wrapTextOnCanvas(ctx, questionText, 10, 10, canvas.width - 20, 28);
  }, [currentIndex, loading, questions]);

  const wrapTextOnCanvas = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
  };

  const handleAnswer = async (selectedOptionIndex) => {
    if (submitting || currentIndex >= questions.length) {
      return;
    }

    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const currentQuestion = questions[currentIndex];

      await api.post(
        '/api/quizsessions/answer',
        {
          sessionId,
          questionId: currentQuestion._id,
          selectedOptionIndex,
        },
        { headers }
      );

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await finishQuiz();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const finishQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await api.post(
        '/api/quizsessions/complete',
        { sessionId },
        { headers }
      );

      navigate(`/ranking/${eventId}/${stageId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete quiz');
    }
  };

  if (loading) {
    return <div className="quiz-loading">Loading your quiz...</div>;
  }

  if (error) {
    return <div className="quiz-error">{error}</div>;
  }

  if (currentIndex >= questions.length) {
    return <div className="quiz-loading">Finishing up...</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-container">
      {tabSwitchCount > 0 && (
        <div className="quiz-warning-banner">
          Warning: Switching tabs or apps during a quiz may be flagged ({tabSwitchCount} time{tabSwitchCount > 1 ? 's' : ''} detected).
        </div>
      )}

      <div className="quiz-progress">
        Question {currentIndex + 1} of {questions.length}
      </div>

      <div className="quiz-timer">{timeLeft}s</div>

      <div className="quiz-question-card">
        <canvas ref={canvasRef} className="quiz-question-canvas" width="560" height="80"></canvas>

        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className="quiz-option-button"
              onClick={() => handleAnswer(index)}
              disabled={submitting}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;