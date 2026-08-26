import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function AgreementDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
      setAgreement(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeline = (value) => {
    if (!value) return '-';
    const str = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str + 'T00:00:00');
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const formatCurrency = (value) =>
    value != null && value !== '' ? `₹${Number(value).toLocaleString('en-IN')}` : '-';

  const copyLink = () => {
    if (!agreement.agreementLinkToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/agreement/sign/${agreement.agreementLinkToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agreements/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to download PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="loading-spinner" style={{ margin: '4rem auto' }}></div></div>;
  }

  if (error || !agreement) {
    return (
      <div className="dashboard">
        <div className="empty-state glass-card">
          <h3>Agreement Not Found</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const isCreator = agreement.client && (agreement.client._id === user.id || agreement.client === user.id);
  const acceptance = agreement.acceptanceDetails;

  return (
    <div className="dashboard agreement-details-page">
      <div className="dashboard-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Back</button>
          <h1>{agreement.title}</h1>
        </div>
        <div className="details-actions">
          <button className="btn btn-secondary" onClick={downloadPdf}>Download PDF</button>
          {isCreator && agreement.status === 'pending' && (
            <Link to={`/agreement/edit/${agreement._id}`} className="btn btn-secondary">Edit</Link>
          )}
          {isCreator && agreement.agreementLinkToken && (
            <button className="btn btn-primary" onClick={copyLink}>{copied ? 'Copied!' : 'Copy Sign Link'}</button>
          )}
        </div>
      </div>

      <div className="details-meta glass-card">
        <div className="detail-meta-item">
          <span className="detail-label">Agreement ID</span>
          <span className="detail-value mono">{agreement.agreementID || '-'}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-label">Status</span>
          <span className={`status-badge ${agreement.status}`}>{agreement.status}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-label">Payment</span>
          <span className={`status-badge ${agreement.paymentStatus === 'paid' ? 'accepted' : 'pending'}`}>{agreement.paymentStatus}</span>
        </div>
        <div className="detail-meta-item">
          <span className="detail-label">Created</span>
          <span className="detail-value">{formatDate(agreement.createdAt)}</span>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card glass-card">
          <h2>Project Details</h2>
          <div className="detail-row full">
            <span className="detail-label">Title</span>
            <span className="detail-value">{agreement.title}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Description</span>
            <span className="detail-value">{agreement.description || '-'}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Deliverables</span>
            <span className="detail-value">{agreement.deliverables}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Timeline</span>
            <span className="detail-value">{formatTimeline(agreement.timeline)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Revisions</span>
            <span className="detail-value">{agreement.revisions || '-'}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Additional Terms</span>
            <span className="detail-value">{agreement.additionalTerms || '-'}</span>
          </div>
        </div>

        <div className="detail-card glass-card">
          <h2>Payment Details</h2>
          <div className="detail-row">
            <span className="detail-label">Total Price</span>
            <span className="detail-value strong">{formatCurrency(agreement.price)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Advance Amount</span>
            <span className="detail-value">{formatCurrency(agreement.advanceAmount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Before Delivery</span>
            <span className="detail-value">{formatCurrency(agreement.beforeDeliveryAmount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">After Delivery</span>
            <span className="detail-value">{formatCurrency(agreement.afterDeliveryAmount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Platform Fee</span>
            <span className="detail-value">{formatCurrency(agreement.paymentAmount)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Paid At</span>
            <span className="detail-value">{formatDate(agreement.paidAt)}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Razorpay Payment ID</span>
            <span className="detail-value mono">{agreement.razorpayPaymentId || '-'}</span>
          </div>
        </div>

        <div className="detail-card glass-card">
          <h2>Client Details</h2>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{agreement.clientName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{agreement.clientEmail || agreement.client?.email || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value">{agreement.clientMobile || '-'}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Address</span>
            <span className="detail-value">{agreement.clientAddress || '-'}</span>
          </div>
        </div>

        <div className="detail-card glass-card">
          <h2>Freelancer Details</h2>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{agreement.freelancerName || '-'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{agreement.freelancerEmail}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{agreement.freelancerPhone}</span>
          </div>
          <div className="detail-row full">
            <span className="detail-label">Address</span>
            <span className="detail-value">{agreement.freelancerAddress || '-'}</span>
          </div>
        </div>

        <div className="detail-card glass-card wide">
          <h2>Acceptance Details</h2>
          {acceptance ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Accepted Name</span>
                <span className="detail-value">{acceptance.freelancerName || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Accepted Email</span>
                <span className="detail-value">{acceptance.freelancerEmail || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Accepted Phone</span>
                <span className="detail-value">{acceptance.freelancerPhone || '-'}</span>
              </div>
              {user.role === 'admin' && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">IP Address</span>
                    <span className="detail-value mono">{acceptance.ipAddress || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Device Browser</span>
                    <span className="detail-value">{acceptance.deviceBrowser || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Device OS</span>
                    <span className="detail-value">{acceptance.deviceOS || '-'}</span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span className="detail-label">Accepted At</span>
                <span className="detail-value">{formatDate(acceptance.acceptedAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">OTP Verified</span>
                <span className={`status-badge ${acceptance.otpVerified ? 'accepted' : 'pending'}`}>
                  {acceptance.otpVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </>
          ) : (
            <p className="detail-empty">This agreement has not been accepted yet.</p>
          )}
        </div>
      </div>

      {!isCreator && (
        <p className="details-note">You are viewing this agreement as the freelancer.</p>
      )}
    </div>
  );
}

export default AgreementDetails;
