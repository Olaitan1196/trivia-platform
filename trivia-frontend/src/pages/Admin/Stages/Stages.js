import React, { useEffect, useState } from 'react';
import api from '../../../api';
import { useParams, useNavigate } from 'react-router-dom';
import './Stages.css';

function Stages() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [stages, setStages] = useState([]);
  const [formData, setFormData] = useState({
    stageNumber: '',
    stageName: '',
    startAt: '',
    endAt: '',
    qualifyingCount: '',
    isFinalStage: false,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payoutResult, setPayoutResult] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [advanceResult, setAdvanceResult] = useState(null);
  const [advancingStageId, setAdvancingStageId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const response = await api.get(`/api/events/${eventId}`, { headers });
      setEvent(response.data.event);
      setStages(response.data.stages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        eventId,
        stageNumber: Number(formData.stageNumber),
        stageName: formData.stageName,
        startAt: formData.startAt,
        endAt: formData.endAt,
        qualifyingCount: formData.isFinalStage ? null : Number(formData.qualifyingCount),
        isFinalStage: formData.isFinalStage,
      };

      const response = await api.post('/api/stages/create', payload, { headers });

      setMessage(response.data.message);
      setFormData({
        stageNumber: '',
        stageName: '',
        startAt: '',
        endAt: '',
        qualifyingCount: '',
        isFinalStage: false,
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizePayout = async (finalStageId) => {
    setError('');
    setPayoutResult(null);
    setPayoutLoading(true);

    try {
      const response = await api.post(
        '/api/event-participants/finalize-payout',
        { eventId, finalStageId },
        { headers }
      );

      setPayoutResult(response.data);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const findNextStage = (stage) => {
    return stages.find((s) => s.stageNumber === stage.stageNumber + 1);
  };

  const handleAdvanceStage = async (currentStageId, nextStageId) => {
    setError('');
    setAdvanceResult(null);
    setAdvancingStageId(currentStageId);

    try {
      const response = await api.post(
        '/api/event-participants/advance-stage',
        { eventId, currentStageId, nextStageId },
        { headers }
      );

      setAdvanceResult(response.data);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to advance participants');
    } finally {
      setAdvancingStageId(null);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="stages-page">
      <button className="back-button" onClick={() => navigate('/admin/events')}>← Back to Events</button>

      {event && (
        <div className="event-summary">
          <h2>{event.title}</h2>
          <p>{event.category} • {event.subject} • ₦{event.entryFee.toLocaleString()}</p>
          <p>Platform Cut: {event.platformCutPercentage}% • Payout Status: {event.isPaidOut ? 'Paid Out' : 'Not Paid Out'}</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {advanceResult && (
        <div className="advance-result">
          <h3>Stage Advanced</h3>
          <p>Qualified: {advanceResult.qualifiedCount}</p>
          <p>Eliminated: {advanceResult.eliminatedCount}</p>
        </div>
      )}

      {payoutResult && (
        <div className="payout-result">
          <h3>Payout Complete</h3>
          <p>Total Pool: ₦{payoutResult.totalPool.toLocaleString()}</p>
          <p>Platform Cut: ₦{payoutResult.platformCut.toLocaleString()}</p>
          <p>Distributed: ₦{payoutResult.distributable.toLocaleString()}</p>

          <table className="payout-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Prize Amount</th>
              </tr>
            </thead>
            <tbody>
              {payoutResult.payouts.map((p) => (
                <tr key={p.userId}>
                  <td>{p.rank}</td>
                  <td>{p.fullName}</td>
                  <td>₦{p.prizeAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="stage-form" onSubmit={handleSubmit}>
        <h3>Create New Stage</h3>

        {message && <p className="success-message">{message}</p>}

        <label>Stage Number</label>
        <input type="number" name="stageNumber" value={formData.stageNumber} onChange={handleChange} required />

        <label>Stage Name</label>
        <input type="text" name="stageName" value={formData.stageName} onChange={handleChange} required />

        <label>Start Date & Time</label>
        <input type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} required />

        <label>End Date & Time</label>
        <input type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} required />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isFinalStage"
            checked={formData.isFinalStage}
            onChange={handleChange}
          />
          This is the final stage
        </label>

        {!formData.isFinalStage && (
          <>
            <label>Qualifying Count (how many move to next stage)</label>
            <input
              type="number"
              name="qualifyingCount"
              value={formData.qualifyingCount}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Stage'}
        </button>
      </form>

      <h3>Existing Stages</h3>

      <div className="stages-list">
        {stages.map((stage) => {
          const nextStage = findNextStage(stage);

          return (
            <div key={stage._id} className="stage-row">
              <div>
                <strong>{stage.stageName}</strong>
                <p>Stage {stage.stageNumber}{stage.isFinalStage ? ' (Final)' : ''}</p>
              </div>
              <div className="stage-row-right">
                <span>{new Date(stage.startAt).toLocaleString()} → {new Date(stage.endAt).toLocaleString()}</span>
                <span className={`status-badge status-${stage.status}`}>{stage.status}</span>

                {!stage.isFinalStage && stage.status !== 'completed' && (
                  nextStage ? (
                    <button
                      className="advance-button"
                      onClick={() => handleAdvanceStage(stage._id, nextStage._id)}
                      disabled={advancingStageId === stage._id}
                    >
                      {advancingStageId === stage._id ? 'Advancing...' : 'Advance Qualifiers to Next Stage'}
                    </button>
                  ) : (
                    <p className="advance-hint">Create the next stage first to enable advancing</p>
                  )
                )}

                {stage.isFinalStage && !event?.isPaidOut && (
                  <button
                    className="finalize-button"
                    onClick={() => handleFinalizePayout(stage._id)}
                    disabled={payoutLoading}
                  >
                    {payoutLoading ? 'Processing...' : 'Finalize Event & Payout'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stages;