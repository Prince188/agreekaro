import React, { useState } from 'react';

function PaymentModal({ agreement, user, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ agreementId: agreement._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create payment order');

      if (data.alreadyPaid) {
        onSuccess(data.agreement);
        return;
      }
      if (!window.Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh and try again.');
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'AgreeKaro',
        description: `Payment for "${agreement.title}"`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');
            onSuccess(verifyData.agreement);
          } catch (err) {
            setError(err.message);
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: { color: '#6366f1' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={e => e.stopPropagation()}>
        <h3>Complete Payment</h3>
        <p>Pay the one-time fee to generate your agreement signing link.</p>
        <div className="payment-summary">
          <div>
            <div className="payment-label">Agreement</div>
            <div className="payment-title">{agreement.title}</div>
          </div>
          <div className="payment-amount">
            <span className="payment-currency">{agreement.currency || 'INR'}</span>
            <span className="payment-value">{agreement.paymentAmount ?? 100}</span>
          </div>
        </div>
        <div className="payment-note">
          <span className="payment-note-icon">&#x1F512;</span>
          <span>Your signing link is generated only after the payment is confirmed.</span>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${agreement.paymentAmount ?? 100}`}
          </button>
        </div>
        <div className="payment-powered">
          <span>Pay securely via</span>
          <span className="razorpay-badge">Razorpay</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
