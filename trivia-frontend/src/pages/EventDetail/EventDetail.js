import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import './EventDetail.css';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [stages, setStages] = useState([]);
  const [participantStatus, setParticipantStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const eventResponse = await api.get(`/api/events/${eventId}`, { headers });
        setEvent(eventResponse.data.event);
        setStages(eventResponse.data.stages);

        const statusResponse = await api.get(
          `/api/event-participants/my-status/${eventId}`,
          { headers }
        );
        setParticipantStatus(statusResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  const handleRegister = async () => {
    setError('');
    setProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.post(
        '/api/event-participants/register',
        { eventId },
        { headers }
      );

      localStorage.setItem('pendingEventId', eventId);
      localStorage.setItem('pendingReference', response.data.reference);

      window.location.href = response.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handlePlayNow = () => {
    navigate(`/quiz/${eventId}/${participantStatus.currentStage._id}`);
  };

  const renderActionArea = () => {
    if (!participantStatus) {
      return null;
    }

    if (!participantStatus.registered) {
      return (
        <button
          className="register-button"
          onClick={handleRegister}
          disabled={processingPayment || event.status !== 'upcoming'}
        >
          {processingPayment ? 'Processing...' : 'Register & Pay'}
        </button>
      );
    }

    if (participantStatus.isEliminated) {
      return <p className="status-message">You have been eliminated from this event.</p>;
    }

    if (!participantStatus.currentStage) {
      return <p className="status-message">There is no active stage for you right now.</p>;
    }

    if (participantStatus.alreadyPlayedCurrentStage) {
      return <p className="status-message">You already played this stage. Waiting for results.</p>;
    }

    const now = new Date();
    const startAt = new Date(participantStatus.currentStage.startAt);
    const endAt = new Date(participantStatus.currentStage.endAt);

    if (now < startAt) {
      return <p className="status-message">Your stage opens at {startAt.toLocaleString()}.</p>;
    }

    if (now > endAt) {
      return <p className="status-message">Your stage has closed.</p>;
    }

    return (
      <button className="register-button" onClick={handlePlayNow}>
        Play Now — {participantStatus.currentStage.stageName}
      </button>
    );
  };

  if (loading) {
    return <div className="event-detail-loading">Loading event details...</div>;
  }

  if (!event) {
    return <div className="event-detail-loading">Event not found.</div>;
  }

  return (
    <div className="event-detail-container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="event-detail-card">
        <h2>{event.title}</h2>
        <p className="event-subject">Subject: {event.subject}</p>
        <p className="event-fee">Entry Fee: ₦{event.entryFee.toLocaleString()}</p>
        <p className="event-slots">Slots: {event.currentParticipants} / {event.maxParticipants}</p>
        <span className={`status-badge status-${event.status}`}>{event.status}</span>

        {error && <p className="error-message">{error}</p>}

        {renderActionArea()}
      </div>

      {stages.length > 0 && (
        <div className="stages-list">
          <h3>Event Stages</h3>
          {stages.map((stage) => (
            <div key={stage._id} className="stage-card">
              <h4>{stage.stageName}</h4>
              <p>Starts: {new Date(stage.startAt).toLocaleString()}</p>
              <p>Ends: {new Date(stage.endAt).toLocaleString()}</p>
              {!stage.isFinalStage && <p>Qualifying spots: {stage.qualifyingCount}</p>}
              <span className={`stage-status stage-${stage.status}`}>{stage.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventDetail;