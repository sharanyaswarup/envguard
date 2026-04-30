import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,255,170,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 32px rgba(0,212,255,0.3)',
          }}>
            <Shield size={26} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Env<span style={{ color: 'var(--accent)' }}>Guard</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14 }}>Create your account</p>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 20 }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="env-input" style={{ paddingLeft: 36 }} type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="env-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                className="env-input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="button" className="btn-icon" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
