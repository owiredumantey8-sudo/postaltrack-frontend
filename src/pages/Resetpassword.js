import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: '#e5e7eb', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f97316', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: '#eab308', width: '75%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  };
  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://postaltrack-backend.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
      } else {
        setMessage(data.message);
        setDone(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  // No token in URL
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#d8f3dc,#dbeafe)', padding: '20px' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>Invalid Reset Link</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>This link is missing or invalid. Please request a new one.</p>
          <Link to="/forgot-password" style={{ display: 'inline-block', background: '#2d6a4f', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700' }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
            <span style={{ fontSize: '2.5rem' }}>🔑</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', margin: '8px 0 4px' }}>
              Set New Password
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Choose a strong password for your account
            </p>
          </div>
        </div>

        {/* Success */}
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '24px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
              <p style={{ color: '#166534', fontWeight: '700', fontSize: '1.1rem', margin: '0 0 6px' }}>Password Updated!</p>
              <p style={{ color: '#374151', fontSize: '0.9rem', margin: 0 }}>
                {message}<br />
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Redirecting to login in 3 seconds...</span>
              </p>
            </div>
            <Link to="/login" style={{ color: '#2d6a4f', fontWeight: '700', fontSize: '0.9rem' }}>
              Go to Login now →
            </Link>
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

            {/* New Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '6px', letterSpacing: '0.06em' }}>
                NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  style={{ width: '100%', padding: '13px 44px 13px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#2d6a4f'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength bar */}
              {newPassword && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '4px', transition: 'all 0.3s' }} />
                  </div>
                  <p style={{ color: strength.color, fontSize: '0.75rem', margin: '3px 0 0', fontWeight: '600' }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#374151', marginBottom: '6px', letterSpacing: '0.06em' }}>
                CONFIRM PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  style={{
                    width: '100%', padding: '13px 44px 13px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${confirm && confirm !== newPassword ? '#ef4444' : confirm && confirm === newPassword ? '#22c55e' : '#d1d5db'}`,
                    fontSize: '1rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {confirm && confirm !== newPassword && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>Passwords don't match</p>
              )}
              {confirm && confirm === newPassword && (
                <p style={{ color: '#22c55e', fontSize: '0.75rem', margin: '3px 0 0' }}>✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#95d5b2' : 'linear-gradient(135deg,#1b4332,#2d6a4f)',
                color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '1rem',
                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Updating...' : '🔐 Update Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
          <Link to="/forgot-password" style={{ color: '#2d6a4f', fontWeight: '600', textDecoration: 'none' }}>
            ← Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;