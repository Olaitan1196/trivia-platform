import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminWithdrawals.css';

function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/wallet/all-withdrawals', { headers });
      setWithdrawals(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (withdrawalId, status) => {
    setError('');
    setProcessingId(withdrawalId);

    try {
      await axios.put(
        'http://localhost:5000/api/wallet/update-status',
        { withdrawalId, status },
        { headers }
      );

      fetchWithdrawals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <p>Loading withdrawals...</p>;
  }

  return (
    <div className="admin-withdrawals-page">
      <h2>Withdrawal Requests</h2>

      {error && <p className="error-message">{error}</p>}

      {withdrawals.length === 0 ? (
        <p>No withdrawal requests yet.</p>
      ) : (
        <table className="admin-withdrawals-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Tax</th>
              <th>Paid Out</th>
              <th>Bank</th>
              <th>Account No.</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w._id}>
                <td>{w.user?.fullName}<br /><span className="user-email">{w.user?.email}</span></td>
                <td>₦{w.amountRequested.toLocaleString()}</td>
                <td>₦{w.taxDeducted.toLocaleString()}</td>
                <td>₦{w.amountPaidOut.toLocaleString()}</td>
                <td>{w.bankName}</td>
                <td>{w.bankAccountNumber}</td>
                <td>
                  <span className={`status-badge status-${w.status}`}>{w.status}</span>
                </td>
                <td>{new Date(w.requestedAt).toLocaleDateString()}</td>
                <td>
                  {w.status === 'pending' ? (
                    <div className="action-buttons">
                      <button
                        className="approve-button"
                        disabled={processingId === w._id}
                        onClick={() => handleUpdateStatus(w._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="paid-button"
                        disabled={processingId === w._id}
                        onClick={() => handleUpdateStatus(w._id, 'paid')}
                      >
                        Mark Paid
                      </button>
                      <button
                        className="reject-button"
                        disabled={processingId === w._id}
                        onClick={() => handleUpdateStatus(w._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="no-action">No action needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminWithdrawals;