import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
      const res = await fetch(`http://localhost:5000/api/agreements/public/${token}`);
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
      const res = await fetch('http://localhost:5000/api/agreements/send-otp', {
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
      const res = await fetch('http://localhost:5000/api/agreements/verify-otp', {
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
      const res = await fetch(`http://localhost:5000/api/agreements/accept/${token}`, {
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

  return (
    <div className="sign-page">
      <div className="sign-card">
        <div className="sign-header">
          <h1>{agreement.title}</h1>
          <p>Review and sign the agreement</p>
        </div>

        <div className="sign-details">
          <div className="detail-row">
            <span className="detail-label">Client Name</span>
            <span className="detail-value">{agreement.clientName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Project Title</span>
            <span className="detail-value">{agreement.title}</span>
          </div>
          {agreement.description && (
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{agreement.description}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Deliverables</span>
            <span className="detail-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{agreement.deliverables}</span>
          </div>
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
          <div className="detail-row">
            <span className="detail-label">Payment Amount</span>
            <span className="detail-value">₹{agreement.price}</span>
          </div>
          {(agreement.advanceAmount || agreement.beforeDeliveryAmount || agreement.afterDeliveryAmount) && (
            <div className="detail-row">
              <span className="detail-label">Payment Schedule</span>
              <span className="detail-value" style={{ maxWidth: '60%', textAlign: 'right' }}>
                Advance: ₹{agreement.advanceAmount ?? '—'}{' · '}
                Before Delivery: ₹{agreement.beforeDeliveryAmount ?? '—'}{' · '}
                After Delivery: ₹{agreement.afterDeliveryAmount ?? '—'}
              </span>
            </div>
          )}
          {agreement.additionalTerms && (
            <div className="detail-row">
              <span className="detail-label">Additional Terms</span>
              <span className="detail-value" style={{ maxWidth: '60%', textAlign: 'right' }}>{agreement.additionalTerms}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${agreement.status}`}>{agreement.status}</span>
          </div>
        </div>

        {step === 'details' && (
          <div className="sign-form">
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => window.open(`http://localhost:5000/api/agreements/public/${token}/pdf`, '_blank')}>
                View Agreement PDF
              </button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Your Information</h3>
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
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} onClick={handleSendOTP} disabled={otpLoading || !form.freelancerName}>
              {otpLoading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="sign-form" style={{ textAlign: 'center' }}>
            <div className="success-icon" style={{ margin: '0 auto 0.75rem' }}>&#x1F512;</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>Phone Verified</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              By clicking "Accept Agreement", you confirm your identity and agree to the terms above.
            </p>
            {otpError && <div className="auth-error">{otpError}</div>}
            <button className="btn btn-success" style={{ width: '100%' }} onClick={handleAccept} disabled={acceptLoading}>
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
              <button className="btn btn-primary" onClick={() => window.open(`http://localhost:5000/api/agreements/public/${token}/pdf`, '_blank')}>
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
            {devOtp && <p style={{ fontSize: '0.7rem', color: 'var(--amber)', marginBottom: '0.4rem' }}>Dev Mode: OTP shown above &amp; logged to console</p>}
            <div className="form-group" style={{ marginBottom: '0.4rem' }}>
              <input type="text" className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '4px' }} />
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
