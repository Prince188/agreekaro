import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';
import { API_URL } from '../config';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [createdCount, setCreatedCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [payAgreement, setPayAgreement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAgreements = agreements.filter((agreement) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (agreement.agreementID && agreement.agreementID.toLowerCase().includes(query)) ||
      (agreement.title && agreement.title.toLowerCase().includes(query))
    );
  });

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

      {agreements.length > 0 && (
        <div className="dashboard-search">
          <div className="search-input-wrapper">
            <span className="search-icon">&#128269;</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by agreement ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>&#10005;</button>
            )}
          </div>
        </div>
      )}

      {agreements.length === 0 ? (
        <div className="empty-state glass-card">
          <h3>No Agreements Yet</h3>
          <p>Create your first agreement to get started, or ask a client to send you a signing link.</p>
          <Link to="/create-agreement" className="btn btn-primary">Create Agreement</Link>
        </div>
      ) : (
        <div className="agreements-grid">
          {filteredAgreements.length === 0 ? (
            <div className="empty-state glass-card" style={{ gridColumn: '1 / -1' }}>
              <h3>No Results Found</h3>
              <p>No agreements match "{searchQuery}". Try a different search term.</p>
            </div>
          ) : (
            filteredAgreements.map((agreement, index) => {
            const isCreator = agreement.client === user.id || agreement.client?._id === user.id;
            return (
              <div className="agreement-card clickable" key={agreement._id} style={{ animationDelay: `${index * 0.05}s` }} onClick={() => navigate(`/agreement/${agreement._id}`)}>
                <div className="card-top">
                  <h3>{agreement.title}</h3>
                  <span className={`status-badge ${agreement.status}`}>{agreement.status}</span>
                </div>
                <div className="card-id">
                  <span className="card-id-label">ID</span>
                  <span className="card-id-value">{agreement.agreementID || '-'}</span>
                </div>
                <div className="agreement-meta">
                  <span className="meta-chip price">{`₹${agreement.price}`}</span>
                  {agreement.timeline && <span className="meta-chip">{formatTimeline(agreement.timeline)}</span>}
                  <span className="meta-chip muted">{new Date(agreement.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="card-info">
                  {isCreator && agreement.paymentStatus === 'pending' && (
                    <span className="status-badge pending">unpaid</span>
                  )}
                  {isCreator && agreement.paymentStatus === 'paid' && (
                    <span className="status-badge accepted">paid</span>
                  )}
                  <span className={`ownership-tag ${isCreator ? 'creator' : 'received'}`}>
                    {isCreator ? 'You created' : 'Sent to you'}
                  </span>
                </div>
                <div className="card-footer">
                  <div className="card-footer-info">
                    {isCreator && agreement.agreementLinkToken && (
                      <div className="agreement-link" onClick={(e) => { e.stopPropagation(); copyLink(agreement); }}>
                        {copiedId === agreement._id ? 'Copied!' : `Sign link: ${window.location.origin}/agreement/sign/${agreement.agreementLinkToken.substring(0, 16)}...`}
                      </div>
                    )}
                    {isCreator && !agreement.agreementLinkToken && (
                      <div className="card-hint">Sign link will be available after payment</div>
                    )}
                    {!isCreator && (
                      <div className="card-hint">Freelancer: {agreement.freelancerEmail}</div>
                    )}
                  </div>
                  <div className="agreement-actions" onClick={(e) => e.stopPropagation()}>
                    {(agreement.status === 'accepted' || (isCreator && agreement.paymentStatus === 'paid')) && (
                      <button className="btn btn-secondary btn-sm" onClick={() => downloadPdf(agreement._id)}>
                        {agreement.status === 'accepted' ? 'Download PDF' : 'Preview PDF'}
                      </button>
                    )}
                    {isCreator && agreement.status === 'pending' && (
                      <Link to={`/agreement/edit/${agreement._id}`} className="btn btn-secondary btn-sm">Edit</Link>
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
              </div>
            );
          })
          )}
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
