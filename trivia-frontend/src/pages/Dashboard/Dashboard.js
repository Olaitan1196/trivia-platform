import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const walletRes = await axios.get('http://localhost:5000/api/wallet/balance', { headers });
        setWalletBalance(walletRes.data.walletBalance);

        const eventsRes = await axios.get('http://localhost:5000/api/events/my-category', { headers });
        setEvents(eventsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <h1 className="logo">TriviaArena</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>

      <section className="dashboard-header">
        <h2>Welcome, {user?.fullName}</h2>
        <p className="user-category">Category: {user?.category}</p>
        <p className="wallet-balance">Wallet Balance: ₦{walletBalance.toLocaleString()}</p>
        <button className="wallet-link-button" onClick={() => navigate('/wallet')}>
          Go to Wallet
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="events-section">
        <h3>Events Available For You</h3>

        {events.length === 0 ? (
          <p className="no-events">No events available for your category right now. Check back soon.</p>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event._id}
                className="event-card"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                <h4>{event.title}</h4>
                <p>Subject: {event.subject}</p>
                <p>Entry Fee: ₦{event.entryFee.toLocaleString()}</p>
                <p>Slots: {event.currentParticipants} / {event.maxParticipants}</p>
                <span className={`status-badge status-${event.status}`}>{event.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;