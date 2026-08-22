import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, logout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">AK</div>
        <span>AgreeKaro</span>
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
            <Link to="/create-agreement" className="nav-link primary">New Agreement</Link>
            <div className="nav-user">
              <div className="nav-user-info">
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-role">{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="nav-link danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
