import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('https://postaltrack-backend.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        setMessage(data.message);
        setSent(true);
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 40%, #dbeafe 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '900', color: '#1b4332', margin: 0 }}>
            Postal<span style={{ color: '#40916c' }}>Track</span>
          </h1>
          <div style={{ marginTop: '1.2rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🔐</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', margin: '8px 0 4px' }}>
              Forgot your password?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Enter your email and we'll send you a reset link
            </p>
          </div>
        </div>

        {/* Success state */}
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📬</div>
              <p style={{ color: '#166534', fontWeight: '600', margin: '0 0 6px' }}>Check your inbox!</p>
              <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0 }}>
                We sent a reset link to <strong>{email}</strong>.<br />
                It expires in 30 minutes.
              </p>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              Didn't get it?{' '}
              <button
                onClick={() => { setSent(false); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#2d6a4f', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#fff2f0', border: '1px solid #ffccc7',
                borderRadius: '8px', padding: '12px 16px',
                marginBottom: '1rem', color: '#cf1322',
                fontSize: '0.9rem', textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', fontSize: '0.78rem',
                fontWeight: '700', color: '#374151',
                marginBottom: '6px', letterSpacing: '0.06em'
              }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '13px 14px',
                  borderRadius: '10px', border: '1.5px solid #d1d5db',
                  fontSize: '1rem', boxSizing: 'border-box',
                  outline: 'none', transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#2d6a4f'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#95d5b2' : 'linear-gradient(135deg,#1b4332,#2d6a4f)',
                color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '1rem',
                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </button>
          </form>
        )}

        {/* Back to login */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#2d6a4f', fontWeight: '700', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;