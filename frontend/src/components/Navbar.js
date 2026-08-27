import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, logout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <div className="brand-icon">AK</div>
        <span>AgreeKaro</span>
      </Link>

      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}

      <button className={`navbar-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" className="nav-link" onClick={closeMenu}>Admin</Link>}
            <Link to="/create-agreement" className="nav-link primary" onClick={closeMenu}>New Agreement</Link>
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
            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="nav-link primary" onClick={closeMenu}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
