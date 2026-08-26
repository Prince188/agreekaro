import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function EditAgreement({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientMobile: '',
    title: '', description: '', deliverables: '', timeline: '', revisions: '', additionalTerms: '',
    price: '', advanceAmount: '', beforeDeliveryAmount: '', afterDeliveryAmount: '',
    freelancerName: '', freelancerEmail: '', freelancerPhone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchAgreement();
  }, []);

  const fetchAgreement = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agreements/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load agreement');
      if (data.status === 'accepted') {
        throw new Error('Cannot edit an accepted agreement');
      }
      const clientUser = data.client;
      const isCreator = clientUser && (clientUser._id === user.id || clientUser === user.id);
      if (!isCreator) {
        throw new Error('Only the creator can edit this agreement');
      }
      setForm({
        clientName: data.clientName || '',
        clientEmail: data.clientEmail || '',
        clientMobile: data.clientMobile || '',
        title: data.title || '',
        description: data.description || '',
        deliverables: data.deliverables || '',
        timeline: data.timeline || '',
        revisions: data.revisions || '',
        additionalTerms: data.additionalTerms || '',
        price: data.price || '',
        advanceAmount: data.advanceAmount ?? '',
        beforeDeliveryAmount: data.beforeDeliveryAmount ?? '',
        afterDeliveryAmount: data.afterDeliveryAmount ?? '',
        freelancerName: data.freelancerName || '',
        freelancerEmail: data.freelancerEmail || '',
        freelancerPhone: data.freelancerPhone || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

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
      const res = await fetch(`${API_URL}/api/agreements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update agreement');
      navigate(`/agreement/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="dashboard"><div className="loading-spinner" style={{ margin: '4rem auto' }}></div></div>;
  }

  if (error && !form.title) {
    return (
      <div className="dashboard">
        <div className="empty-state glass-card">
          <h3>Cannot Edit Agreement</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <h1>Edit Agreement</h1>
      <p className="subtitle">Update the details below. Changes will be reflected in the signing link.</p>
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

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditAgreement;
