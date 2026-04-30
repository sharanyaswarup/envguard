import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Change password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Delete account
  const [deleteConfirmPw, setDeleteConfirmPw] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess('Password changed! You will be logged out.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(async () => {
        await logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPw) { setDeleteError('Password required'); return; }
    setDeleteLoading(true); setDeleteError('');
    try {
      await api.delete('/auth/account', { data: { password: deleteConfirmPw } });
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Profile</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Manage your account settings</p>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#000',
            boxShadow: '0 0 24px rgba(0,212,255,0.25)',
          }}>
            {user?.avatar}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Full Name</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.name}</div>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={16} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Change Password</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>You'll be logged out after changing</p>
          </div>
        </div>

        {pwError && <div className="error-box" style={{ marginBottom: 14 }}><AlertCircle size={14} />{pwError}</div>}
        {pwSuccess && (
          <div style={{ padding: '12px 16px', background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.2)', borderRadius: 8, color: 'var(--accent3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle size={14} />{pwSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="env-input"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Your current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                style={{ paddingRight: 40 }}
                required
              />
              <button type="button" className="btn-icon" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="env-input"
                type={showNew ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                style={{ paddingRight: 40 }}
                required
                minLength={8}
              />
              <button type="button" className="btn-icon" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm New Password</label>
            <input
              className="env-input"
              type="password"
              placeholder="Repeat new password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={pwLoading}>
            {pwLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><Lock size={14} /> Change Password</>}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(255,77,109,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,77,109,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={16} color="var(--danger)" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)' }}>Delete Account</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Permanently deletes your account and all owned projects</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--danger)' }}>Warning:</strong> This action is irreversible. All projects you own, along with their secrets and audit logs will be permanently deleted. Projects you are a member of (but not owner) will simply remove you.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} /> Delete My Account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {deleteError && <div className="error-box"><AlertCircle size={14} />{deleteError}</div>}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Confirm with your password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="env-input"
                  type={showDeletePw ? 'text' : 'password'}
                  placeholder="Enter your password to confirm"
                  value={deleteConfirmPw}
                  onChange={(e) => setDeleteConfirmPw(e.target.value)}
                  style={{ paddingRight: 40, borderColor: 'rgba(255,77,109,0.4)' }}
                  autoFocus
                />
                <button type="button" className="btn-icon" style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowDeletePw(!showDeletePw)}>
                  {showDeletePw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{ opacity: deleteLoading ? 0.6 : 1 }}
              >
                {deleteLoading ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: 'var(--danger)' }} /> : <><Trash2 size={14} /> Permanently Delete</>}
              </button>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); setDeleteConfirmPw(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
