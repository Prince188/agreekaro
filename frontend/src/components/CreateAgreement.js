import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { API_URL } from '../config';

function CreateAgreement({ user }) {
  const [form, setForm] = useState({
    clientName: user?.name || '', clientEmail: user?.email || '', clientMobile: '',
    title: '', description: '', deliverables: '', timeline: '', revisions: '', additionalTerms: '',
    price: '', advanceAmount: '', beforeDeliveryAmount: '', afterDeliveryAmount: '',
    freelancerName: '', freelancerEmail: '', freelancerPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, price: Number(form.price) };
      ['advanceAmount', 'beforeDeliveryAmount', 'afterDeliveryAmount'].forEach((key) => {
        payload[key] = form[key] === '' ? undefined : Number(form[key]);
      });
      const res = await fetch(`${API_URL}/api/agreements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create agreement');
      setCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/agreement/sign/${created.agreementLinkToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created && created.paymentStatus === 'paid') {
    const signLink = `${window.location.origin}/agreement/sign/${created.agreementLinkToken}`;
    return (
      <div className="create-page">
        <div className="form-success">
          <div className="success-icon">&#x2714;</div>
          <h3>Payment Successful!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.82rem' }}>Your agreement link is ready. Share it with the freelancer:</p>
          <div className="link-display" onClick={copyLink}>{signLink}</div>
          <p className="copy-feedback">{copied ? 'Copied to clipboard!' : 'Click to copy'}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (created) {
    return (
      <div className="create-page">
        <div className="form-success payment-pending-card">
          <div className="payment-pending-icon">&#x1F4B3;</div>
          <h3>Complete Payment to Generate Link</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.82rem' }}>
            Your agreement "{created.title}" has been created.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
            Pay the one-time fee of ₹{created.paymentAmount ?? 100} to generate the signing link.
          </p>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setShowPayment(true)}>
            Pay ₹{created.paymentAmount ?? 100}
          </button>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
          </div>
        </div>
        {showPayment && (
          <PaymentModal
            agreement={created}
            user={user}
            onSuccess={(paidAgreement) => { setCreated(paidAgreement); setShowPayment(false); }}
            onClose={() => setShowPayment(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="create-page">
      <h1>Create Agreement</h1>
      <p className="subtitle">Fill in the details below to generate a new agreement.</p>
      {error && <div className="auth-error">{error}</div>}
      <div className="create-form">
        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Party B (Client)</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input type="text" name="clientName" className="form-input" placeholder="e.g. John Doe" value={form.clientName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Client Email</label>
              <input type="email" name="clientEmail" className="form-input" placeholder="client@email.com" value={form.clientEmail} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client Mobile</label>
              <input type="tel" name="clientMobile" className="form-input" placeholder="+1234567890" value={form.clientMobile} onChange={handleChange} />
            </div>
          </div>

          <div className="form-section-title">Project Details</div>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input type="text" name="title" className="form-input" placeholder="e.g. Website Redesign Project" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" placeholder="Brief description of the project..." value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Deliverables</label>
            <textarea name="deliverables" className="form-input" placeholder="List the deliverables for this project..." value={form.deliverables} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Timeline (Deadline)</label>
              <input type="date" name="timeline" className="form-input" min={new Date().toLocaleDateString('en-CA')} value={form.timeline} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Revisions</label>
              <input type="text" name="revisions" className="form-input" placeholder="e.g. 2 revisions included" value={form.revisions} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Additional Terms</label>
            <textarea name="additionalTerms" className="form-input" placeholder="Any additional terms or clauses..." value={form.additionalTerms} onChange={handleChange} />
          </div>

          <div className="form-section-title">Payment Terms</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Project Amount (₹)</label>
              <input type="number" name="price" className="form-input" placeholder="50000" value={form.price} onChange={handleChange} required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Advance Payment (₹)</label>
              <input type="number" name="advanceAmount" className="form-input" placeholder="20000" value={form.advanceAmount} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Before Delivery (₹)</label>
              <input type="number" name="beforeDeliveryAmount" className="form-input" placeholder="15000" value={form.beforeDeliveryAmount} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Payment After Delivery (₹)</label>
              <input type="number" name="afterDeliveryAmount" className="form-input" placeholder="15000" value={form.afterDeliveryAmount} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-section-title">Party A (Service Provider)</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Freelancer Name</label>
              <input type="text" name="freelancerName" className="form-input" placeholder="e.g. Jane Smith" value={form.freelancerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Freelancer Email</label>
              <input type="email" name="freelancerEmail" className="form-input" placeholder="freelancer@email.com" value={form.freelancerEmail} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Freelancer Phone</label>
              <input type="tel" name="freelancerPhone" className="form-input" placeholder="+1234567890" value={form.freelancerPhone} onChange={handleChange} required />
            </div>
          </div>

          <div className="create-fee-note">
            <span className="fee-note-icon">&#x1F4B3;</span>
            <span>One-time fee of ₹100 applies after creation to generate your signing link.</span>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Agreement'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAgreement;
