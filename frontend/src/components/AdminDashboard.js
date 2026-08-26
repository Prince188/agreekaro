import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [statsRes, usersRes, agreementsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/users`, { headers }),
        fetch(`${API_URL}/api/admin/agreements`, { headers })
      ]);
      if (!statsRes.ok || !usersRes.ok || !agreementsRes.ok) {
        throw new Error('Access denied');
      }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const agreementsData = await agreementsRes.json();
      setStats(statsData);
      setUsers(usersData.users || []);
      setAgreements(agreementsData.agreements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    value != null ? `₹${Number(value).toLocaleString('en-IN')}` : '-';

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAgreements = agreements.filter(a =>
    a.agreementID?.toLowerCase().includes(search.toLowerCase()) ||
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    a.freelancerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard"><div className="loading-spinner" style={{ margin: '4rem auto' }}></div></div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="empty-state glass-card">
          <h3>Access Denied</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => { setTab('overview'); setSearch(''); }}>Overview</button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>Users ({users.length})</button>
        <button className={`admin-tab ${tab === 'agreements' ? 'active' : ''}`} onClick={() => { setTab('agreements'); setSearch(''); }}>Agreements ({agreements.length})</button>
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value total">{stats.stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Agreements</div>
              <div className="stat-value total">{stats.stats.totalAgreements}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue</div>
              <div className="stat-value accepted">{formatCurrency(stats.stats.revenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Agreement Value</div>
              <div className="stat-value total">{formatCurrency(stats.stats.agreementValue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value pending">{stats.stats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Accepted</div>
              <div className="stat-value accepted">{stats.stats.accepted}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Paid</div>
              <div className="stat-value accepted">{stats.stats.paid}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unpaid</div>
              <div className="stat-value pending">{stats.stats.unpaid}</div>
            </div>
          </div>

          <h2 className="admin-section-title">Recent Users</h2>
          <div className="glass-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`status-badge ${u.role === 'admin' ? 'accepted' : 'pending'}`}>{u.role}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="admin-section-title">Recent Agreements</h2>
          <div className="agreements-grid">
            {stats.recentAgreements.map((agreement, index) => (
              <div className="agreement-card clickable" key={agreement._id} style={{ animationDelay: `${index * 0.05}s` }} onClick={() => setSelectedAgreement(agreement)}>
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
                  <span className="meta-chip muted">{new Date(agreement.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="card-info">
                  {agreement.paymentStatus === 'pending' && (
                    <span className="status-badge pending">unpaid</span>
                  )}
                  {agreement.paymentStatus === 'paid' && (
                    <span className="status-badge accepted">paid</span>
                  )}
                </div>
                <div className="card-footer">
                  <div className="card-footer-info">
                    <div className="card-hint">Client: {agreement.clientName}</div>
                    <div className="card-hint">Freelancer: {agreement.freelancerEmail}</div>
                  </div>
                  <div className="agreement-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAgreement(agreement)}>View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'users' && (
        <>
          {filteredUsers.length > 0 && (
            <div className="dashboard-search">
              <div className="search-input-wrapper">
                <span className="search-icon">&#128269;</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}>&#10005;</button>
                )}
              </div>
            </div>
          )}
          <div className="glass-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Agreements</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`status-badge ${u.role === 'admin' ? 'accepted' : 'pending'}`}>{u.role}</span></td>
                    <td>{u.agreementsCreated ?? 0}</td>
                    <td>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="5" className="admin-empty">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'agreements' && (
        <>
          {filteredAgreements.length > 0 && (
            <div className="dashboard-search">
              <div className="search-input-wrapper">
                <span className="search-icon">&#128269;</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by agreement ID or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}>&#10005;</button>
                )}
              </div>
            </div>
          )}
          <div className="agreements-grid">
            {filteredAgreements.length === 0 ? (
              <div className="empty-state glass-card" style={{ gridColumn: '1 / -1' }}>
                <h3>No Results Found</h3>
                <p>No agreements match "{search}". Try a different search term.</p>
              </div>
            ) : (
              filteredAgreements.map((agreement, index) => (
                <div className="agreement-card clickable" key={agreement._id} style={{ animationDelay: `${index * 0.05}s` }} onClick={() => setSelectedAgreement(agreement)}>
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
                    <span className="meta-chip muted">{new Date(agreement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="card-info">
                    {agreement.paymentStatus === 'pending' && (
                      <span className="status-badge pending">unpaid</span>
                    )}
                    {agreement.paymentStatus === 'paid' && (
                      <span className="status-badge accepted">paid</span>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="card-footer-info">
                      <div className="card-hint">Client: {agreement.clientName}</div>
                      <div className="card-hint">Freelancer: {agreement.freelancerEmail}</div>
                    </div>
                    <div className="agreement-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedAgreement(agreement)}>View</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {selectedAgreement && (
        <div className="modal-overlay" onClick={() => setSelectedAgreement(null)}>
          <div className="modal admin-agreement-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agreement Details</h3>
            <p className="admin-mono" style={{ marginBottom: '0.75rem' }}>{selectedAgreement.agreementID}</p>
            
            <div className="admin-modal-section">
              <h4>Project</h4>
              <div className="admin-modal-row"><span>Title</span><span>{selectedAgreement.title}</span></div>
              <div className="admin-modal-row"><span>Price</span><span>{formatCurrency(selectedAgreement.price)}</span></div>
              <div className="admin-modal-row"><span>Status</span><span className={`status-badge ${selectedAgreement.status}`}>{selectedAgreement.status}</span></div>
              <div className="admin-modal-row"><span>Payment</span><span className={`status-badge ${selectedAgreement.paymentStatus === 'paid' ? 'accepted' : 'pending'}`}>{selectedAgreement.paymentStatus}</span></div>
            </div>

            <div className="admin-modal-section">
              <h4>Client</h4>
              <div className="admin-modal-row"><span>Name</span><span>{selectedAgreement.clientName}</span></div>
              <div className="admin-modal-row"><span>Email</span><span>{selectedAgreement.clientEmail || '-'}</span></div>
              <div className="admin-modal-row"><span>Phone</span><span>{selectedAgreement.clientMobile || '-'}</span></div>
            </div>

            <div className="admin-modal-section">
              <h4>Freelancer</h4>
              <div className="admin-modal-row"><span>Email</span><span>{selectedAgreement.freelancerEmail}</span></div>
              <div className="admin-modal-row"><span>Phone</span><span>{selectedAgreement.freelancerPhone}</span></div>
            </div>

            {selectedAgreement.acceptanceDetails && (
              <div className="admin-modal-section admin-modal-acceptance">
                <h4>Acceptance Details</h4>
                <div className="admin-modal-row"><span>Accepted By</span><span>{selectedAgreement.acceptanceDetails.freelancerName || '-'}</span></div>
                <div className="admin-modal-row"><span>Email</span><span>{selectedAgreement.acceptanceDetails.freelancerEmail || '-'}</span></div>
                <div className="admin-modal-row"><span>Phone</span><span>{selectedAgreement.acceptanceDetails.freelancerPhone || '-'}</span></div>
                <div className="admin-modal-row"><span>IP Address</span><span className="admin-mono">{selectedAgreement.acceptanceDetails.ipAddress || '-'}</span></div>
                <div className="admin-modal-row"><span>Browser</span><span>{selectedAgreement.acceptanceDetails.deviceBrowser || '-'}</span></div>
                <div className="admin-modal-row"><span>OS</span><span>{selectedAgreement.acceptanceDetails.deviceOS || '-'}</span></div>
                <div className="admin-modal-row"><span>Accepted At</span><span>{formatDateTime(selectedAgreement.acceptanceDetails.acceptedAt)}</span></div>
                <div className="admin-modal-row"><span>OTP Verified</span><span className={`status-badge ${selectedAgreement.acceptanceDetails.otpVerified ? 'accepted' : 'pending'}`}>{selectedAgreement.acceptanceDetails.otpVerified ? 'Yes' : 'No'}</span></div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedAgreement(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setSelectedAgreement(null); navigate(`/agreement/${selectedAgreement._id}`); }}>Go to Agreement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
