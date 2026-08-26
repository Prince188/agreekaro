import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateAgreement from './components/CreateAgreement';
import AgreementSign from './components/AgreementSign';
import AgreementDetails from './components/AgreementDetails';
import EditAgreement from './components/EditAgreement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register onLogin={login} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/agreement/edit/:id" element={user ? <EditAgreement user={user} /> : <Navigate to="/login" />} />
            <Route path="/agreement/:id" element={user ? <AgreementDetails user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/create-agreement" element={user ? <CreateAgreement user={user} /> : <Navigate to="/login" />} />
            <Route path="/agreement/sign/:token" element={<AgreementSign />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
