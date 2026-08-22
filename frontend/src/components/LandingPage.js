import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-badge">Trusted by 2,000+ professionals</div>
        <h1>
          Digital Agreements<br />
          <span className="gradient-text">Made Easy with AgreeKaro</span>
        </h1>
        <div className="landing-divider"></div>
        <p>
          Create, pay, send, and sign client agreements with confidence.
          Secure OTP verification, automated PDFs, and email delivery.
        </p>
        <div className="landing-actions">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
      </div>
      <div className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">&#x1F4DD;</div>
          <h3>Create &amp; Send</h3>
          <p>Build professional agreements with custom terms and generate unique signing links instantly.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#x1F510;</div>
          <h3>Verify Identity</h3>
          <p>OTP-based phone verification ensures authentic signatures with full audit trail.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#x1F4E7;</div>
          <h3>PDF &amp; Email</h3>
          <p>Styled PDFs generated on acceptance and emailed to both parties automatically.</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
