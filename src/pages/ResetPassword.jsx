import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let res;
      try {
        res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
      } catch (_) {
        res = await fetch(`/api/reset-password/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
      }
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg(data.message || 'Password reset successful!');
        setTimeout(() => {
          navigate('/');
        }, 2500);
      } else {
        setError(data.message || 'Reset token is invalid or expired.');
      }
    } catch (err) {
      setLoading(false);
      setError('Unable to connect to server. Please try again.');
    }
  };

  return (
    <div style={{ background: '#0b0c10', minHeight: '100vh', padding: '100px 20px 60px', fontFamily: 'Outfit, sans-serif' }}>
      <HeaderNav title="Reset Password" />

      <div style={{ maxWidth: '420px', margin: '0 auto', background: '#16171b', padding: '35px', borderRadius: '20px', border: '1px solid rgba(255,195,0,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '10px' }}>Set New Password</h2>
        <p style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem', marginBottom: '25px' }}>Enter your new password below to reset your GrabASeat account password.</p>

        {error && <div style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid #E50914', color: '#E50914', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        {msg && <div style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid #4CAF50', color: '#4CAF50', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>{msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '12px 16px', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '12px 16px', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#FFC300', color: '#000', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {loading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
