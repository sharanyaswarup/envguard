import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Key, Users, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { timeAgoWithIST } from '../utils/time';

export default function Projects() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const getUserRole = (project) => {
    const member = (project.members || []).find((m) => {
      const uid = m.userId?._id || m.userId;
      return uid?.toString() === user?._id?.toString();
    });
    return member?.role;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true); setError('');
    try {
      const project = await createProject(newName.trim(), newDesc.trim());
      setShowModal(false); setNewName(''); setNewDesc('');
      navigate(`/project/${project._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setCreating(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its secrets?')) return;
    try { await deleteProject(id); } catch {}
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Project</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input className="env-input" style={{ paddingLeft: 36 }} placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((project) => {
            const role = getUserRole(project);
            const isOwner = role === 'owner';
            const { ago, stamp } = timeAgoWithIST(project.updatedAt);
            return (
              <div key={project._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/project/${project._id}`)}>
                <div style={{ height: 4, background: project.color || 'var(--accent)' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: project.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#000', flexShrink: 0 }}>
                        {project.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{project.name}</div>
                        <span className="badge badge-green" style={{ marginTop: 4 }}>Active</span>
                      </div>
                    </div>
                    {/* Only owner can delete */}
                    {isOwner && (
                      <button className="btn-icon danger" onClick={(e) => handleDelete(e, project._id)} style={{ marginTop: 2 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16, minHeight: 36, lineHeight: 1.5 }}>
                    {project.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                      <Key size={12} style={{ color: 'var(--accent)' }} />{project.secretCount || 0} secrets
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                      <Users size={12} style={{ color: '#a78bfa' }} />{project.members?.length || 0} members
                    </span>
                    <span title={stamp} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)', marginLeft: 'auto', cursor: 'help' }}>
                      <Clock size={11} />{ago}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="card" style={{ border: '2px dashed var(--border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 180, cursor: 'pointer', transition: 'border-color 0.2s', background: 'transparent' }}
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="var(--accent)" />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: 14 }}>Create New Project</span>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Create Project</h2>
            {error && <div className="error-box" style={{ marginBottom: 16 }}><AlertCircle size={14} />{error}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project Name</label>
                <input className="env-input" placeholder="My App" value={newName} onChange={(e) => setNewName(e.target.value)} required autoFocus />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                <textarea className="env-input" placeholder="Optional description..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ minHeight: 72 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-primary" type="submit" disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
                  {creating ? <div className="spinner" style={{ width: 14, height: 14 }} /> : 'Create Project'}
                </button>
                <button className="btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
