import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Events.css';

const CATEGORIES = ['student', 'salary earner', 'pensioner', 'freelancer', 'job seeker'];
const SUBJECTS = ['sports', 'academics', 'language'];

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'student',
    subject: 'sports',
    entryFee: '',
    maxParticipants: '',
    hasStages: false,
    platformCutPercentage: 10,
  });

  const [prizeDistribution, setPrizeDistribution] = useState([
    { rank: 1, percentage: '' },
  ]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events/all', { headers });
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePrizeRowChange = (index, field, value) => {
    const updated = [...prizeDistribution];
    updated[index][field] = value;
    setPrizeDistribution(updated);
  };

  const addPrizeRow = () => {
    const nextRank = prizeDistribution.length + 1;
    setPrizeDistribution([...prizeDistribution, { rank: nextRank, percentage: '' }]);
  };

  const removePrizeRow = (index) => {
    const updated = prizeDistribution.filter((_, i) => i !== index);
    setPrizeDistribution(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const cleanedDistribution = prizeDistribution.map((row) => ({
        rank: Number(row.rank),
        percentage: Number(row.percentage),
      }));

      const payload = {
        title: formData.title,
        category: formData.category,
        subject: formData.subject,
        entryFee: Number(formData.entryFee),
        maxParticipants: Number(formData.maxParticipants),
        hasStages: formData.hasStages,
        platformCutPercentage: Number(formData.platformCutPercentage),
        prizeDistribution: cleanedDistribution,
      };

      const response = await axios.post('http://localhost:5000/api/events/create', payload, { headers });

      setMessage(response.data.message);
      setFormData({
        title: '',
        category: 'student',
        subject: 'sports',
        entryFee: '',
        maxParticipants: '',
        hasStages: false,
        platformCutPercentage: 10,
      });
      setPrizeDistribution([{ rank: 1, percentage: '' }]);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="events-page">
      <h2>Events Management</h2>

      <form className="event-form" onSubmit={handleSubmit}>
        <h3>Create New Event</h3>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <label>Event Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange} required>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Subject</label>
        <select name="subject" value={formData.subject} onChange={handleChange} required>
          {SUBJECTS.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <label>Entry Fee (₦)</label>
        <input type="number" name="entryFee" value={formData.entryFee} onChange={handleChange} required />

        <label>Max Participants</label>
        <input
          type="number"
          name="maxParticipants"
          value={formData.maxParticipants}
          onChange={handleChange}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="hasStages"
            checked={formData.hasStages}
            onChange={handleChange}
          />
          This event has multiple stages
        </label>

        <label>Platform Cut (%)</label>
        <input
          type="number"
          name="platformCutPercentage"
          value={formData.platformCutPercentage}
          onChange={handleChange}
          min="0"
          max="100"
          required
        />

        <div className="prize-distribution-section">
          <label>Prize Distribution (by final rank)</label>
          <p className="prize-hint">Set what percentage of the remaining pool each rank receives.</p>

          {prizeDistribution.map((row, index) => (
            <div key={index} className="prize-row">
              <span className="prize-rank-label">Rank</span>
              <input
                type="number"
                value={row.rank}
                onChange={(e) => handlePrizeRowChange(index, 'rank', e.target.value)}
                min="1"
                required
              />
              <span className="prize-rank-label">Percentage</span>
              <input
                type="number"
                value={row.percentage}
                onChange={(e) => handlePrizeRowChange(index, 'percentage', e.target.value)}
                min="0"
                max="100"
                required
              />
              {prizeDistribution.length > 1 && (
                <button type="button" className="remove-row-button" onClick={() => removePrizeRow(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-row-button" onClick={addPrizeRow}>
            + Add Another Rank
          </button>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>

      <h3>All Events</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div
              key={event._id}
              className="event-row"
              onClick={() => navigate(`/admin/events/${event._id}/stages`)}
            >
              <div>
                <strong>{event.title}</strong>
                <p>{event.category} • {event.subject}</p>
              </div>
              <div className="event-row-right">
                <span>₦{event.entryFee.toLocaleString()}</span>
                <span>{event.currentParticipants}/{event.maxParticipants}</span>
                <span className={`status-badge status-${event.status}`}>{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;