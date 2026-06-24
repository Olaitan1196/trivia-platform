import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import './Ranking.css';

function Ranking() {
  const { eventId, stageId } = useParams();
  const navigate = useNavigate();

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser).id);
    }

    const fetchRanking = async () => {
      try {
        const response = await api.get(
          `/api/event-participants/ranking/${eventId}/${stageId}`
        );
        setRanking(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [eventId, stageId]);

  const formatTime = (ms) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  if (loading) {
    return <div className="ranking-loading">Loading ranking...</div>;
  }

  return (
    <div className="ranking-container">
      <h2>Stage Ranking</h2>

      {error && <p className="error-message">{error}</p>}

      {ranking.length === 0 ? (
        <p className="no-ranking">No one has completed this stage yet.</p>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry) => (
              <tr
                key={entry.userId}
                className={entry.userId === currentUserId ? 'ranking-current-user' : ''}
              >
                <td>{entry.rank}</td>
                <td>{entry.fullName}</td>
                <td>{entry.score}</td>
                <td>{formatTime(entry.totalTimeMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="back-to-dashboard-button" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default Ranking;