import React, { useEffect, useState } from 'react';
import api from '../../../api';
import './CategoryFees.css';

const CATEGORIES = ['student', 'salary earner', 'pensioner', 'freelancer', 'job seeker'];

function CategoryFees() {
  const [fees, setFees] = useState([]);
  const [formData, setFormData] = useState({ category: 'student', minFee: '', maxFee: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchFees = async () => {
    try {
      const response = await api.get('/api/category-fee/all', { headers });
      setFees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load category fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post(
        '/api/category-fee/set',
        {
          category: formData.category,
          minFee: Number(formData.minFee),
          maxFee: Number(formData.maxFee),
        },
        { headers }
      );

      setMessage(response.data.message);
      setFormData({ category: 'student', minFee: '', maxFee: '' });
      fetchFees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category fee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="category-fees-page">
      <h2>Category Fees Management</h2>

      <form className="fee-form" onSubmit={handleSubmit}>
        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange} required>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Minimum Fee (₦)</label>
        <input
          type="number"
          name="minFee"
          value={formData.minFee}
          onChange={handleChange}
          required
        />

        <label>Maximum Fee (₦)</label>
        <input
          type="number"
          name="maxFee"
          value={formData.maxFee}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Fee Limit'}
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>

      <h3>Current Fee Limits</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="fee-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Min Fee</th>
              <th>Max Fee</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee) => (
              <tr key={fee._id}>
                <td>{fee.category}</td>
                <td>₦{fee.minFee.toLocaleString()}</td>
                <td>₦{fee.maxFee.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CategoryFees;