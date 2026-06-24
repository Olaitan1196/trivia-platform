import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentConfirmation.css';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Confirming your payment, please wait...');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        const reference = searchParams.get('reference') || localStorage.getItem('pendingReference');
        const eventId = localStorage.getItem('pendingEventId');

        if (!reference || !eventId || !token) {
          setStatus('error');
          setMessage('Missing payment information. Please contact support.');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const response = await api.post(
          '/api/event-participants/confirm',
          { reference, eventId },
          { headers }
        );

        localStorage.removeItem('pendingReference');
        localStorage.removeItem('pendingEventId');

        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Payment confirmation failed.');
      }
    };

    confirmPayment();
  }, [searchParams]);

  return (
    <div className="confirmation-container">
      <div className={`confirmation-card status-${status}`}>
        <h2>
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Registration Successful!'}
          {status === 'error' && 'Something Went Wrong'}
        </h2>
        <p>{message}</p>

        {status !== 'processing' && (
          <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default PaymentConfirmation;