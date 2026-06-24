import React, { useEffect, useState } from 'react';
import api from '../../../api';
import './AdminSettings.css';

function AdminSettings() {
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await api.get('/api/settings', { headers });
        setMinWithdrawalAmount(response.data.minWithdrawalAmount);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.put(
        '/api/settings/min-withdrawal',
        { minWithdrawalAmount: Number(minWithdrawalAmount) },
        { headers }
      );

      setSuccessMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <h2>Platform Settings</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>Minimum Withdrawal Amount (₦)</label>
        <input
          type="number"
          value={minWithdrawalAmount}
          onChange={(e) => setMinWithdrawalAmount(e.target.value)}
          min="1"
          required
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;