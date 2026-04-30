import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Key, Users, ScrollText, Plus, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectsContext';
import api from '../api/axios';
import { timeAgoWithIST } from '../utils/time';

const ACTION_COLORS = {
  create: 'var(--accent3)',
  update: 'var(--accent)',
  delete: 'var(--danger)',
  view: 'var(--muted)',
  import: 'var(--warn)',
  export: 'var(--warn)',
  member_added: '#a78bfa',
  member_removed: 'var(--danger)',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, fetchProjects } = useProjects();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ secrets: 0, members: 0, auditEvents: 0 });
  const [auditLogs, setAuditLogs] = useState([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    if (projects.length === 0) return;
    const totalSecrets = projects.reduce((a, p) => a + (p.secretCount || 0), 0);
    const memberSet = new Set();
    projects.forEach((p) => (p.members || []).forEach((m) => memberSet.add(m.userId?._id || m.userId)));
    setStats((s) => ({ ...s, secrets: totalSecrets, members: memberSet.size }));

    const fetchAudit = async () => {
      try {
        const { data } = await api.get('/projects/audit/all', { params: { limit: 10 } });
        setAuditLogs(data.logs || []);
        setStats((s) => ({ ...s, auditEvents: data.total || 0 }));
      } catch {}
    };
    fetchAudit();
  }, [projects]);

  const statCards = [
    { label: 'Projects', value: projects.length, icon: FolderOpen, color: 'var(--accent)', bg: 'rgba(0,212,255,0.1)' },
    { label: 'Total Secrets', value: stats.secrets, icon: Key, color: 'var(--accent3)', bg: 'rgba(0,255,170,0.1)' },
    { label: 'Team Members', value: stats.members, icon: Users, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { label: 'Audit Events', value: stats.auditEvents, icon: ScrollText, color: 'var(--warn)', bg: 'rgba(255,179,71,0.1)' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {greeting}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>Here's what's happening across your projects</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/projects')}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color }}>{value}</p>
              </div>
              <div className="icon-box" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Projects</h2>
            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate('/projects')}>View all</button>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={32} style={{ opacity: 0.3 }} />
              <p>No projects yet</p>
              <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/projects')}>
                <Plus size={14} /> Create Project
              </button>
            </div>
          ) : (
            projects.slice(0, 6).map((project) => {
              const { ago, stamp } = timeAgoWithIST(project.updatedAt);
              return (
                <div key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: project.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#000' }}>
                    {project.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{project.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.description || 'No description'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Key size={11} /> {project.secretCount || 0}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {project.members?.length || 0}</span>
                    </div>
                    <span title={stamp} style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
                      <Clock size={9} /> {ago}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse-dot" />
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Activity</h2>
          </div>
          {auditLogs.length === 0 ? (
            <div className="empty-state"><ScrollText size={28} style={{ opacity: 0.3 }} /><p style={{ fontSize: 13 }}>No activity yet</p></div>
          ) : (
            <div style={{ overflow: 'auto', maxHeight: 480 }}>
              {auditLogs.map((log) => {
                const { ago, stamp } = timeAgoWithIST(log.createdAt);
                return (
                  <div key={log._id} style={{ display: 'flex', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div className="avatar sm" style={{ flexShrink: 0, marginTop: 2 }}>{log.userId?.avatar || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600 }}>{log.userId?.name?.split(' ')[0] || 'Unknown'}</span>{' '}
                        <span style={{ color: ACTION_COLORS[log.action] || 'var(--muted)' }}>{log.action}</span>
                        {log.targetKey && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}> {log.targetKey}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{log.projectId?.name || 'Unknown project'}</div>
                      <div title={stamp} style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1, cursor: 'help' }}>{ago} · {stamp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
