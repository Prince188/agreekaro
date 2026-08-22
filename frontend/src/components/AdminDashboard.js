import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAgreements = agreements.filter(a =>
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
        <input
          type="text"
          className="form-input admin-search"
          placeholder={tab === 'users' ? 'Search users...' : 'Search agreements...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({users.length})</button>
        <button className={`admin-tab ${tab === 'agreements' ? 'active' : ''}`} onClick={() => setTab('agreements')}>Agreements ({agreements.length})</button>
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
          <div className="glass-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAgreements.map(a => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{a.clientName}</td>
                    <td>{formatCurrency(a.price)}</td>
                    <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                    <td><span className={`status-badge ${a.paymentStatus === 'paid' ? 'accepted' : 'pending'}`}>{a.paymentStatus}</span></td>
                    <td>{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'users' && (
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
      )}

      {tab === 'agreements' && (
        <div className="glass-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Price</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map(a => (
                <tr key={a._id}>
                  <td className="admin-mono">{a.agreementID || a._id.slice(-6)}</td>
                  <td>{a.title}</td>
                  <td>{a.clientName}{a.client?.email ? ` (${a.client.email})` : ''}</td>
                  <td>{a.freelancerEmail}</td>
                  <td>{formatCurrency(a.price)}</td>
                  <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                  <td><span className={`status-badge ${a.paymentStatus === 'paid' ? 'accepted' : 'pending'}`}>{a.paymentStatus}</span></td>
                  <td>{formatDate(a.createdAt)}</td>
                </tr>
              ))}
              {filteredAgreements.length === 0 && (
                <tr><td colSpan="8" className="admin-empty">No agreements found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
