import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Key, Users, Clock, Eye, EyeOff, Copy, Check, Pencil, Trash2,
  Plus, X, Search, Upload, Download, AlertCircle, Crown, Shield,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { timeAgoWithIST } from '../utils/time';

const ROLE_COLORS = { owner: 'badge-warn', admin: 'badge-blue', editor: 'badge-green', viewer: 'badge-gray' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('secrets');
  const [search, setSearch] = useState('');

  const [revealedValues, setRevealedValues] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [addingSecret, setAddingSecret] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [addError, setAddError] = useState('');

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('editor');
  const [memberError, setMemberError] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const fileInputRef = useRef();
  const socketRef = useRef();

  const userRole = project?.members?.find((m) => {
    const uid = m.userId?._id || m.userId;
    return uid?.toString() === user?._id?.toString();
  })?.role;

  // viewer+ can reveal values
  const canReveal = ['owner', 'admin', 'editor', 'viewer'].includes(userRole);
  const canEdit = ['owner', 'admin', 'editor'].includes(userRole);
  const canAdmin = ['owner', 'admin'].includes(userRole);
  const isOwner = userRole === 'owner';

  useEffect(() => {
    loadProject();
    loadSecrets();

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', { withCredentials: true });
    socketRef.current = socket;
    socket.emit('join:project', id);
    socket.on('secret:created', (s) => setSecrets((prev) => [s, ...prev]));
    socket.on('secret:updated', (s) => setSecrets((prev) => prev.map((x) => x._id === s._id ? s : x)));
    socket.on('secret:deleted', ({ _id }) => setSecrets((prev) => prev.filter((x) => x._id !== _id)));
    socket.on('member:added', () => loadProject());
    socket.on('member:removed', () => loadProject());

    return () => { socket.disconnect(); };
  }, [id]);

  const loadProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch { navigate('/projects'); }
  };

  const loadSecrets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${id}/secrets`);
      setSecrets(data);
    } catch {}
    finally { setLoading(false); }
  };

  const revealSecret = async (secretId) => {
    if (revealedValues[secretId]) {
      setRevealedValues((v) => { const n = { ...v }; delete n[secretId]; return n; });
      return;
    }
    try {
      const { data } = await api.get(`/projects/${id}/secrets/${secretId}/reveal`);
      setRevealedValues((v) => ({ ...v, [secretId]: data.value }));
    } catch {}
  };

  const copySecret = async (secretId) => {
    try {
      let val = revealedValues[secretId];
      if (!val) {
        const { data } = await api.get(`/projects/${id}/secrets/${secretId}/reveal`);
        val = data.value;
      }
      await navigator.clipboard.writeText(val);
      setCopiedId(secretId);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const saveEdit = async (secretId) => {
    if (!editValue) { setEditingId(null); return; }
    try {
      await api.put(`/projects/${id}/secrets/${secretId}`, { value: editValue });
      setRevealedValues((v) => { const n = { ...v }; delete n[secretId]; return n; });
      setEditingId(null);
    } catch {}
  };

  const deleteSecret = async (secretId) => {
    if (!confirm('Delete this secret?')) return;
    try { await api.delete(`/projects/${id}/secrets/${secretId}`); } catch {}
  };

  const addSecret = async () => {
    if (!newKey.trim() || newValue === '') { setAddError('Key and value are required'); return; }
    setAddError('');
    try {
      await api.post(`/projects/${id}/secrets`, { key: newKey.trim(), value: newValue });
      setNewKey(''); setNewValue(''); setAddingSecret(false);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed');
    }
  };

  const importEnv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const pairs = text.split('\n')
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => { const eq = l.indexOf('='); return eq > -1 ? { key: l.slice(0, eq).trim(), value: l.slice(eq + 1).trim() } : null; })
      .filter(Boolean);
    try {
      const { data } = await api.post(`/projects/${id}/secrets/import`, { secrets: pairs });
      alert(`Imported ${data.created} secrets, skipped ${data.skipped} duplicates`);
      loadSecrets();
    } catch {}
    e.target.value = '';
  };

  const exportEnv = async () => {
    try {
      const res = await api.get(`/projects/${id}/secrets/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `${project?.name || 'secrets'}.env`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const addMember = async () => {
    if (!memberEmail.trim()) return;
    setMemberError(''); setAddingMember(true);
    try {
      await api.post(`/projects/${id}/team`, { email: memberEmail.trim(), role: memberRole });
      setShowAddMember(false); setMemberEmail(''); setMemberRole('editor');
      loadProject();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    } finally { setAddingMember(false); }
  };

  const updateMemberRole = async (memberId, role) => {
    try { await api.put(`/projects/${id}/team/${memberId}`, { role }); loadProject(); } catch {}
  };

  const removeMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try { await api.delete(`/projects/${id}/team/${memberId}`); loadProject(); } catch {}
  };

  const filteredSecrets = secrets.filter((s) => s.key.toLowerCase().includes(search.toLowerCase()));

  if (!project) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ padding: 32 }}>
      <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13, marginBottom: 20 }} onClick={() => navigate('/projects')}>
        <ArrowLeft size={14} /> Projects
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: project.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#000' }}>
          {project.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{project.name}</h1>
            {userRole && <span className={`badge ${ROLE_COLORS[userRole] || 'badge-gray'}`}>{userRole}</span>}
          </div>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>{project.description || 'No description'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Secrets', value: secrets.length, icon: Key, color: 'var(--accent)', bg: 'rgba(0,212,255,0.1)' },
          { label: 'Team Members', value: project.members?.length || 0, icon: Users, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          { label: 'Last Updated', value: timeAgoWithIST(project.updatedAt).ago, icon: Clock, color: 'var(--accent3)', bg: 'rgba(0,255,170,0.1)', isText: true },
        ].map(({ label, value, icon: Icon, color, bg, isText }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="icon-box" style={{ background: bg }}><Icon size={18} color={color} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: isText ? 14 : 24, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${tab === 'secrets' ? 'active' : ''}`} onClick={() => setTab('secrets')}>
          <Key size={13} style={{ display: 'inline', marginRight: 6 }} />Secrets
        </button>
        <button className={`tab-btn ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>
          <Users size={13} style={{ display: 'inline', marginRight: 6 }} />Team
        </button>
      </div>

      {tab === 'secrets' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="env-input" style={{ paddingLeft: 36 }} placeholder="Search keys..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {canEdit && (
              <>
                <input ref={fileInputRef} type="file" accept=".env,text/plain" style={{ display: 'none' }} onChange={importEnv} />
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => fileInputRef.current.click()}><Upload size={14} /> Import .env</button>
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={exportEnv}><Download size={14} /> Export .env</button>
                <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => { setAddingSecret(true); setNewKey(''); setNewValue(''); setAddError(''); }}>
                  <Plus size={14} /> Add Secret
                </button>
              </>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>KEY</th>
                  <th>VALUE</th>
                  <th>UPDATED (IST)</th>
                  <th>BY</th>
                  {(canReveal) && <th style={{ width: 130 }}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {addingSecret && (
                  <tr style={{ background: 'rgba(0,212,255,0.04)' }}>
                    <td>
                      <input className="env-input mono" style={{ fontSize: 12 }} placeholder="SECRET_KEY" value={newKey} onChange={(e) => setNewKey(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && addSecret()} autoFocus />
                      {addError && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{addError}</div>}
                    </td>
                    <td>
                      <input className="env-input mono" style={{ fontSize: 12 }} placeholder="value" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSecret()} />
                    </td>
                    <td colSpan={2} />
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={addSecret}>Add</button>
                        <button className="btn-icon" onClick={() => setAddingSecret(false)}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )}

                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : filteredSecrets.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <Key size={28} style={{ opacity: 0.3 }} />
                        <p>No secrets yet</p>
                        {canEdit && <button className="btn-primary" style={{ marginTop: 8, fontSize: 13 }} onClick={() => setAddingSecret(true)}><Plus size={13} /> Add First Secret</button>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSecrets.map((secret) => {
                    const { ago, stamp } = timeAgoWithIST(secret.updatedAt);
                    return (
                      <tr key={secret._id}>
                        <td><span className="mono" style={{ color: 'var(--accent)', fontSize: 13 }}>{secret.key}</span></td>
                        <td>
                          {editingId === secret._id ? (
                            <input className="env-input mono" style={{ fontSize: 12, maxWidth: 260 }} placeholder="new value" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(secret._id); if (e.key === 'Escape') setEditingId(null); }} autoFocus />
                          ) : (
                            <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {revealedValues[secret._id] || '••••••••••••'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ago}</div>
                          <div title={stamp} style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7, cursor: 'help' }}>{stamp}</div>
                        </td>
                        <td>
                          {secret.updatedBy ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="avatar sm">{secret.updatedBy.avatar}</div>
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{secret.updatedBy.name?.split(' ')[0]}</span>
                            </div>
                          ) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
                        </td>
                        {canReveal && (
                          <td>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {/* Viewer+ can reveal */}
                              <button className="btn-icon accent" title={revealedValues[secret._id] ? 'Hide' : 'Reveal'} onClick={() => revealSecret(secret._id)}>
                                {revealedValues[secret._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              {/* Viewer+ can copy */}
                              <button className="btn-icon accent" title="Copy" onClick={() => copySecret(secret._id)}>
                                {copiedId === secret._id ? <Check size={14} style={{ color: 'var(--accent3)' }} /> : <Copy size={14} />}
                              </button>
                              {/* Editor+ can edit */}
                              {canEdit && (
                                <button className="btn-icon accent" title="Edit" onClick={() => editingId === secret._id ? setEditingId(null) : (() => { setEditingId(secret._id); setEditValue(''); })()}>
                                  <Pencil size={14} />
                                </button>
                              )}
                              {/* Admin+ can delete */}
                              {canAdmin && (
                                <button className="btn-icon danger" title="Delete" onClick={() => deleteSecret(secret._id)}>
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={12} color="var(--muted)" />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Secrets are AES-256 encrypted in MongoDB · Values only decrypted on reveal · Times in IST</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { role: 'Owner', desc: 'Full control, can delete project', cls: 'badge-warn' },
              { role: 'Admin', desc: 'Manage members & secrets', cls: 'badge-blue' },
              { role: 'Editor', desc: 'Create & update secrets', cls: 'badge-green' },
              { role: 'Viewer', desc: 'Read & reveal secret values', cls: 'badge-gray' },
            ].map(({ role, desc, cls }) => (
              <div key={role} className="card" style={{ padding: 12 }}>
                <span className={`badge ${cls}`} style={{ marginBottom: 6 }}>{role}</span>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{project.members?.length || 0} Members</span>
              {canAdmin && (
                <button className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => { setShowAddMember(true); setMemberEmail(''); setMemberError(''); }}>
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>MEMBER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  {canAdmin && <th style={{ width: 60 }}></th>}
                </tr>
              </thead>
              <tbody>
                {(project.members || []).map((member) => {
                  const mu = member.userId;
                  const memberId = mu?._id || mu;
                  const isMemberOwner = member.role === 'owner';
                  const isSelf = memberId?.toString() === user?._id?.toString();
                  return (
                    <tr key={memberId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar sm">{mu?.avatar || '?'}</div>
                          <span style={{ fontWeight: 500, fontSize: 13 }}>
                            {mu?.name || 'Unknown'}
                            {isMemberOwner && <Crown size={12} style={{ marginLeft: 6, color: 'var(--warn)', display: 'inline' }} />}
                            {isSelf && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{mu?.email}</td>
                      <td>
                        {canAdmin && !isMemberOwner && !isSelf ? (
                          <select className="env-input" style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: 12 }} value={member.role} onChange={(e) => updateMemberRole(memberId, e.target.value)}>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className={`badge ${ROLE_COLORS[member.role] || 'badge-gray'}`}>{member.role}</span>
                        )}
                      </td>
                      {canAdmin && (
                        <td>
                          {!isMemberOwner && !isSelf && (
                            <button className="btn-icon danger" onClick={() => removeMember(memberId)}><Trash2 size={14} /></button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Team Member</h2>
            {memberError && <div className="error-box" style={{ marginBottom: 14 }}><AlertCircle size={14} />{memberError}</div>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
              <input className="env-input" type="email" placeholder="colleague@company.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} autoFocus />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>User must already have an EnvGuard account</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['admin', 'editor', 'viewer'].map((r) => (
                  <button key={r} type="button" onClick={() => setMemberRole(r)} style={{
                    flex: 1, padding: '8px', borderRadius: 8,
                    border: `1px solid ${memberRole === r ? 'var(--accent)' : 'var(--border2)'}`,
                    background: memberRole === r ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: memberRole === r ? 'var(--accent)' : 'var(--muted)',
                    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
                  }}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addMember} disabled={addingMember}>
                {addingMember ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Add Member'}
              </button>
              <button className="btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
