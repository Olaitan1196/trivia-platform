import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import './Wallet.css';

function Wallet() {
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    amountRequested: '',
    bankAccountNumber: '',
    bankName: '',
  });

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const balanceRes = await api.get('/api/wallet/balance', { headers });
      setWalletBalance(balanceRes.data.walletBalance);

      const settingsRes = await api.get('/api/settings', { headers });
      setMinWithdrawalAmount(settingsRes.data.minWithdrawalAmount);

      const withdrawalsRes = await api.get('/api/wallet/my-withdrawals', { headers });
      setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    fetchAllData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const amount = Number(formData.amountRequested);

    if (amount < minWithdrawalAmount) {
      setError(`Minimum withdrawal amount is ₦${minWithdrawalAmount.toLocaleString()}`);
      return;
    }

    if (amount > walletBalance) {
      setError('You cannot withdraw more than your wallet balance');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await api.post(
        '/api/wallet/withdraw',
        {
          amountRequested: amount,
          bankAccountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
        },
        { headers }
      );

      setSuccessMessage('Withdrawal request submitted successfully');
      setFormData({ amountRequested: '', bankAccountNumber: '', bankName: '' });

      await fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="wallet-loading">Loading wallet...</div>;
  }

  return (
    <div className="wallet-container">
      <button className="back-button" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="wallet-balance-card">
        <p>Wallet Balance</p>
        <h2>₦{walletBalance.toLocaleString()}</h2>
        <p className="min-withdrawal-note">Minimum withdrawal: ₦{minWithdrawalAmount.toLocaleString()}</p>
      </div>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form className="withdraw-form" onSubmit={handleSubmit}>
        <h3>Request Withdrawal</h3>

        <label>Amount (₦)</label>
        <input
          type="number"
          name="amountRequested"
          value={formData.amountRequested}
          onChange={handleChange}
          min={minWithdrawalAmount}
          required
        />

        <label>Bank Name</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          required
        />

        <label>Bank Account Number</label>
        <input
          type="text"
          name="bankAccountNumber"
          value={formData.bankAccountNumber}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Request Withdrawal'}
        </button>
      </form>

      <div className="withdrawal-history">
        <h3>Withdrawal History</h3>

        {withdrawals.length === 0 ? (
          <p className="no-withdrawals">No withdrawal requests yet.</p>
        ) : (
          <table className="withdrawal-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Tax (5%)</th>
                <th>Paid Out</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id}>
                  <td>₦{w.amountRequested.toLocaleString()}</td>
                  <td>₦{w.taxDeducted.toLocaleString()}</td>
                  <td>₦{w.amountPaidOut.toLocaleString()}</td>
                  <td>
                    <span className={`withdrawal-status status-${w.status}`}>{w.status}</span>
                  </td>
                  <td>{new Date(w.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Wallet;