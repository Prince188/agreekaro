import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { API_URL } from '../config';

function Dashboard({ user }) {
  const [agreements, setAgreements] = useState([]);
  const [createdCount, setCreatedCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [payAgreement, setPayAgreement] = useState(null);

  const formatTimeline = (value) => {
    if (!value) return '';
    const str = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str + 'T00:00:00');
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agreements/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAgreements(data.agreements || []);
      setCreatedCount(data.createdCount || 0);
      setReceivedCount(data.receivedCount || 0);
    } catch (err) {
      console.error('Failed to fetch agreements');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (agreement) => {
    if (!agreement.agreementLinkToken) return;
    const link = `${window.location.origin}/agreement/sign/${agreement.agreementLinkToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(agreement._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadPdf = async (agreementId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agreements/${agreementId}/pdf`, {
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
      a.download = `agreement_${agreementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err.message);
    }
  };

  const pending = agreements.filter(a => a.status === 'pending').length;
  const accepted = agreements.filter(a => a.status === 'accepted').length;
  const unpaid = agreements.filter(a => a.client === user.id || a.client?._id === user.id).filter(a => a.paymentStatus === 'pending').length;

  if (loading) {
    return <div className="dashboard"><div className="loading-spinner" style={{ margin: '4rem auto' }}></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Agreements</h1>
        <Link to="/create-agreement" className="btn btn-primary">+ New Agreement</Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value total">{agreements.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value pending">{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accepted</div>
          <div className="stat-value accepted">{accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Created by you</div>
          <div className="stat-value total">{createdCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sent to you</div>
          <div className="stat-value accepted">{receivedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Awaiting payment</div>
          <div className="stat-value pending">{unpaid}</div>
        </div>
      </div>

      {agreements.length === 0 ? (
        <div className="empty-state glass-card">
          <h3>No Agreements Yet</h3>
          <p>Create your first agreement to get started, or ask a client to send you a signing link.</p>
          <Link to="/create-agreement" className="btn btn-primary">Create Agreement</Link>
        </div>
      ) : (
        <div className="agreements-grid">
          {agreements.map((agreement, index) => {
            const isCreator = agreement.client === user.id || agreement.client?._id === user.id;
            return (
              <div className="agreement-card" key={agreement._id} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="agreement-info">
                  <h3>{agreement.title}</h3>
                  <div className="agreement-meta">
                    <span>₹{agreement.price}</span>
                    <span>{formatTimeline(agreement.timeline)}</span>
                    <span>{new Date(agreement.createdAt).toLocaleDateString()}</span>
                    <span className={`status-badge ${agreement.status}`}>{agreement.status}</span>
                    {isCreator && agreement.paymentStatus === 'pending' && (
                      <span className="status-badge pending">unpaid</span>
                    )}
                    {isCreator && agreement.paymentStatus === 'paid' && (
                      <span className="status-badge accepted">paid</span>
                    )}
                    {isCreator ? (
                      <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.7rem' }}>You created</span>
                    ) : (
                      <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.7rem' }}>Sent to you</span>
                    )}
                  </div>
                  {isCreator && agreement.agreementLinkToken && (
                    <div className="agreement-link" onClick={() => copyLink(agreement)}>
                      {copiedId === agreement._id ? 'Copied!' : `Sign link: ${window.location.origin}/agreement/sign/${agreement.agreementLinkToken.substring(0, 16)}...`}
                    </div>
                  )}
                  {isCreator && !agreement.agreementLinkToken && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sign link will be available after payment</div>
                  )}
                  {!isCreator && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Freelancer: {agreement.freelancerEmail}</div>
                  )}
                </div>
                <div className="agreement-actions">
                  {(agreement.status === 'accepted' || (isCreator && agreement.paymentStatus === 'paid')) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => downloadPdf(agreement._id)}>
                      {agreement.status === 'accepted' ? 'Download PDF' : 'Preview PDF'}
                    </button>
                  )}
                  {isCreator && agreement.status === 'pending' && agreement.paymentStatus === 'paid' && agreement.agreementLinkToken && (
                    <button className="btn btn-secondary btn-sm" onClick={() => copyLink(agreement)}>
                      {copiedId === agreement._id ? 'Copied!' : 'Copy Link'}
                    </button>
                  )}
                  {isCreator && agreement.status === 'pending' && agreement.paymentStatus === 'pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setPayAgreement(agreement)}>
                      Pay ₹{agreement.paymentAmount ?? 100}
                    </button>
                  )}
                  {!isCreator && agreement.status === 'pending' && agreement.agreementLinkToken && (
                    <Link to={`/agreement/sign/${agreement.agreementLinkToken}`} className="btn btn-primary btn-sm">Sign</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {payAgreement && (
        <PaymentModal
          agreement={payAgreement}
          user={user}
          onSuccess={(paidAgreement) => {
            setAgreements(prev => prev.map(a => a._id === paidAgreement._id ? paidAgreement : a));
            setPayAgreement(null);
          }}
          onClose={() => setPayAgreement(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
