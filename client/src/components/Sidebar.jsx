import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, FolderOpen, ScrollText, Terminal, LogOut, UserCircle, Sparkles, ShieldCheck, Cloud, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/audit', icon: ScrollText, label: 'Audit Logs' },
  ];

  const navStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 2,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? 'var(--accent)' : 'var(--muted)',
    background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all 0.15s',
  });

  return (
    <aside style={{
      width: 240, minWidth: 240, height: '100vh',
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Env<span style={{ color: 'var(--accent)' }}>Guard</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 11, color: 'var(--accent3)', fontWeight: 500 }}>Session Active</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => navStyle(isActive)}>
            <Icon size={16} />{label}
          </NavLink>
        ))}

        <NavLink to="/cli" style={({ isActive }) => ({ ...navStyle(isActive), marginTop: 8 })}>
          <Terminal size={16} />
          CLI Tool
          <span className="badge badge-warn" style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 6px' }}>Live</span>
        </NavLink>
        <div
  style={{
    position: 'relative',
    marginTop: 14,
    borderRadius: 20,
    padding: '14px 12px',
    overflow: 'hidden',
    isolation: 'isolate',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #1a1f2e 0%, #1e2438 25%, #1a1f2e 50%, #1e2438 75%, #1a1f2e 100%)',
    backgroundSize: '300% 300%',
    animation: 'auroraShift 8s ease infinite',
    border: '1px solid rgba(0,212,255,0.28)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s cubic-bezier(0.23,1,0.32,1), border-color 0.35s ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.025)';
    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.55)';
    e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,212,255,0.22), 0 0 0 1px rgba(0,212,255,0.2), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.18)';
    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.06)';
  }}
>
  {/* Halo ring */}
  <div style={{
    position: 'absolute', inset: -2, borderRadius: 22,
    background: 'conic-gradient(from 0deg, transparent 0%, rgba(0,212,255,0.4) 20%, rgba(124,58,237,0.4) 40%, rgba(0,255,163,0.3) 60%, transparent 80%, rgba(0,212,255,0.2) 100%)',
    animation: 'haloBreath 4s ease-in-out infinite',
    zIndex: -1, filter: 'blur(3px)',
  }} />

  {/* Orb 1 */}
  <div style={{
    position: 'absolute', width: 180, height: 180, borderRadius: '50%',
    top: -60, right: -60,
    background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.18) 50%, transparent 75%)',
    filter: 'blur(20px)', animation: 'orbDrift 10s ease-in-out infinite', zIndex: 0,
  }} />

  {/* Orb 2 */}
  <div style={{
    position: 'absolute', width: 120, height: 120, borderRadius: '50%',
    bottom: -30, left: -20,
    background: 'radial-gradient(circle, rgba(0,255,163,0.18) 0%, rgba(0,212,255,0.1) 50%, transparent 75%)',
    filter: 'blur(18px)', animation: 'orbDrift 14s ease-in-out infinite reverse', zIndex: 0,
  }} />

  {/* Shimmer */}
  <div style={{
    position: 'absolute', top: 0, bottom: 0, left: '-80%', width: '60%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)',
    transform: 'skewX(-15deg)',
    animation: 'shimmerSweep 4s ease-in-out infinite',
    animationDelay: '1.5s',
    pointerEvents: 'none', zIndex: 1,
  }} />

  {/* Content */}
  <div style={{ position: 'relative', zIndex: 2 }}>

    {/* Brand row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
       background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Shield size={14} color="#000" strokeWidth={2.5} />
      </div>
      <span style={{
        fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
    
        background: 'linear-gradient(135deg, #ffffff 30%, #a8d8f0 70%, #00d4ff 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>EnvGuard</span>
    </div>

    {/* Tagline */}
    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,220,240,0.9)', marginBottom: 14, lineHeight: 1.45 }}>
      Manage secrets like a pro
    </div>

    {/* Features */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
      {[
        { Icon: ShieldCheck, label: 'End-to-end encrypted storage', bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.2)', color: '#00d4ff' },
        { Icon: Cloud,       label: 'Sync across all projects',     bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.25)', color: '#a78bfa' },
        { Icon: Terminal,    label: 'Pull secrets via CLI instantly',bg: 'rgba(0,255,163,0.1)',  border: 'rgba(0,255,163,0.2)',  color: '#00ffa3' },
      ].map(({ Icon, label, bg, border, color }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bg, border: `1px solid ${border}`,
          }}>
            <Icon size={13} color={color} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'rgba(200,220,240,0.85)' }}>{label}</span>
        </div>
      ))}
    </div>

    {/* Footer pill */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 10,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {[
        { Icon: Zap,    label: 'Secure',       color: '#00d4ff' },
        { Icon: Cloud,  label: 'Fast',         color: '#a78bfa' },
        { Icon: Terminal, label: 'Dev Friendly', color: '#00ffa3' },
      ].map(({ Icon, label, color }, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon size={10} color={color} strokeWidth={2.5} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(180,200,220,0.7)' }}>{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>

  </div>
</div>
      </nav>

      <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)' }}>
        {/* Profile link */}
        <NavLink to="/profile" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 8, marginBottom: 10,
          textDecoration: 'none', fontSize: 14, fontWeight: 500,
          color: isActive ? 'var(--accent)' : 'var(--muted)',
          background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all 0.15s',
        })}>
          <div className="avatar sm">{user?.avatar || '??'}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </NavLink>

        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: 13 }} onClick={handleLogout}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
