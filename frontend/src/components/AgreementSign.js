import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

function AgreementSign() {
  const { token } = useParams();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({ freelancerName: '', freelancerEmail: '', freelancerPhone: '', freelancerAddress: '' });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  const formatTimeline = (value) => {
    if (!value) return '';
    const str = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str + 'T00:00:00');
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => { fetchAgreement(); }, [token]);

  const fetchAgreement = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agreements/public/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Agreement not found');
      setAgreement(data);
      if (data.status === 'accepted') setStep('success');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!form.freelancerPhone) { setOtpError('Please enter your phone number first'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      const res = await fetch(`${API_URL}/api/agreements/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.freelancerPhone, agreementId: agreement._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setDevOtp(data.devOtp); setShowOtpModal(true);
    } catch (err) { setOtpError(err.message); } finally { setOtpLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setOtpLoading(true); setOtpError('');
    try {
      const res = await fetch(`${API_URL}/api/agreements/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.freelancerPhone, otp, agreementId: agreement._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      setShowOtpModal(false); setStep('confirm');
    } catch (err) { setOtpError(err.message); } finally { setOtpLoading(false); }
  };

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agreements/accept/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerName: form.freelancerName,
          freelancerEmail: form.freelancerEmail || agreement.freelancerEmail,
          freelancerPhone: form.freelancerPhone || agreement.freelancerPhone,
          freelancerAddress: form.freelancerAddress
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to accept');
      setAgreement(data.agreement); setStep('success');
    } catch (err) { setOtpError(err.message); } finally { setAcceptLoading(false); }
  };

  if (loading) return <div className="sign-page"><div className="loading-spinner" style={{ margin: '3rem auto' }}></div></div>;

  if (error) return (
    <div className="sign-page">
      <div className="sign-card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--red)', marginBottom: '0.5rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    </div>
  );

  const steps = ['Review', 'Verify', 'Accept', 'Signed'];
  const stepIndex = step === 'details' ? 0 : step === 'confirm' ? 2 : 3;

  return (
    <div className="sign-page">
      <div className="sign-card">
        <div className="sign-steps">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className={`step-line ${i <= stepIndex ? 'done' : ''}`}></span>}
              <span className={`sign-step ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`}>
                <span className="step-dot">{i < stepIndex ? '✓' : i + 1}</span>
                <span className="step-label">{label}</span>
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="sign-header">
          <h1>{agreement.title}</h1>
          <p>Review and sign the agreement</p>
        </div>

        <div className="sign-price-banner">
          <span className="price-label">Total Project Value</span>
          <span className="price-value">{`₹${Number(agreement.price).toLocaleString('en-IN')}`}</span>
        </div>

        <div className="sign-details">
          <div className="sign-section">
            <h4>Project Scope</h4>
            <div className="detail-row">
              <span className="detail-label">Client Name</span>
              <span className="detail-value">{agreement.clientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Deliverables</span>
              <span className="detail-value pre-wrap">{agreement.deliverables}</span>
            </div>
            {agreement.description && (
              <div className="detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value pre-wrap">{agreement.description}</span>
              </div>
            )}
            {agreement.timeline && (
              <div className="detail-row">
                <span className="detail-label">Deadline</span>
                <span className="detail-value">{formatTimeline(agreement.timeline)}</span>
              </div>
            )}
            {agreement.revisions && (
              <div className="detail-row">
                <span className="detail-label">Revisions</span>
                <span className="detail-value">{agreement.revisions}</span>
              </div>
            )}
          </div>

          {(agreement.advanceAmount || agreement.beforeDeliveryAmount || agreement.afterDeliveryAmount) && (
            <div className="sign-section">
              <h4>Payment Schedule</h4>
              <div className="schedule-grid">
                <div className="schedule-item">
                  <span className="schedule-label">Advance</span>
                  <span className="schedule-value">{agreement.advanceAmount ? `₹${agreement.advanceAmount}` : '—'}</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-label">Before Delivery</span>
                  <span className="schedule-value">{agreement.beforeDeliveryAmount ? `₹${agreement.beforeDeliveryAmount}` : '—'}</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-label">After Delivery</span>
                  <span className="schedule-value">{agreement.afterDeliveryAmount ? `₹${agreement.afterDeliveryAmount}` : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {agreement.additionalTerms && (
            <div className="sign-section">
              <h4>Additional Terms</h4>
              <p className="terms-text">{agreement.additionalTerms}</p>
            </div>
          )}
        </div>

        {step === 'details' && (
          <div className="sign-form">
            <div className="pdf-view-row">
              <button className="btn btn-secondary btn-sm" onClick={() => window.open(`${API_URL}/api/agreements/public/${token}/pdf`, '_blank')}>
                View Agreement PDF
              </button>
            </div>
            <h3 className="sign-form-title">Your Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your full legal name" value={form.freelancerName} onChange={e => setForm({ ...form, freelancerName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder={agreement.freelancerEmail} value={form.freelancerEmail} onChange={e => setForm({ ...form, freelancerEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" placeholder={agreement.freelancerPhone} value={form.freelancerPhone} onChange={e => setForm({ ...form, freelancerPhone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address (optional)</label>
              <input type="text" className="form-input" placeholder="Your full address" value={form.freelancerAddress} onChange={e => setForm({ ...form, freelancerAddress: e.target.value })} />
            </div>
            {otpError && <div className="auth-error">{otpError}</div>}
            <button className="btn btn-primary btn-block" onClick={handleSendOTP} disabled={otpLoading || !form.freelancerName}>
              {otpLoading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="sign-form confirm-box">
            <div className="success-icon">&#x1F512;</div>
            <h3 className="sign-form-title center">Phone Verified</h3>
            <p className="confirm-text">
              By clicking "Accept Agreement", you confirm your identity and agree to all the terms above.
            </p>
            {otpError && <div className="auth-error">{otpError}</div>}
            <button className="btn btn-success btn-block" onClick={handleAccept} disabled={acceptLoading}>
              {acceptLoading ? 'Processing...' : 'Accept Agreement'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="success-state">
            <div className="success-icon">&#x2714;</div>
            <h2>Agreement Signed!</h2>
            <p>A copy of the PDF has been sent to your email.</p>
            {agreement.pdfPath && (
              <button className="btn btn-primary" onClick={() => window.open(`${API_URL}/api/agreements/public/${token}/pdf`, '_blank')}>
                Download PDF
              </button>
            )}
          </div>
        )}
      </div>

      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Enter OTP</h3>
            <p>Verification code sent to your phone.</p>
            {devOtp && <div className="otp-display">{devOtp}</div>}
            {devOtp && <p className="dev-note">Dev Mode: OTP shown above &amp; logged to console</p>}
            <div className="form-group otp-input-group">
              <input type="text" className="form-input otp-input" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
            </div>
            {otpError && <div className="auth-error">{otpError}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowOtpModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleVerifyOTP} disabled={otpLoading || otp.length !== 6}>
                {otpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgreementSign;
