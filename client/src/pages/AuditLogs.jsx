import React, { useEffect, useState } from 'react';
import { ScrollText, Download, Search } from 'lucide-react';
import api from '../api/axios';
import { timeAgoWithIST, formatISTForCSV } from '../utils/time';

const ACTION_META = {
  create:         { label: 'Created',        cls: 'badge-green' },
  update:         { label: 'Updated',        cls: 'badge-blue' },
  delete:         { label: 'Deleted',        cls: 'badge-red' },
  view:           { label: 'Viewed',         cls: 'badge-gray' },
  import:         { label: 'Imported',       cls: 'badge-warn' },
  export:         { label: 'Exported',       cls: 'badge-warn' },
  member_added:   { label: 'Member Added',   cls: 'badge-purple' },
  member_removed: { label: 'Member Removed', cls: 'badge-red' },
  member_updated: { label: 'Role Changed',   cls: 'badge-blue' },
};

const FILTERS = ['All Events', 'create', 'update', 'delete', 'view'];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Events');

  useEffect(() => { fetchLogs(); }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filter !== 'All Events') params.action = filter;
      const { data } = await api.get('/projects/audit/all', { params });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const rows = [['User', 'Email', 'Action', 'Target Key', 'Project', 'When (IST)']];
    logs.forEach((l) => rows.push([
      l.userId?.name || 'Unknown',
      l.userId?.email || '',
      l.action,
      l.targetKey || '',
      l.projectId?.name || '',
      formatISTForCSV(l.createdAt),
    ]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit-logs-IST.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = logs.filter((l) => {
    if (!search) return true;
    return (
      l.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (l.targetKey || '').toLowerCase().includes(search.toLowerCase()) ||
      l.projectId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const counts = {
    total,
    create: logs.filter((l) => l.action === 'create').length,
    delete: logs.filter((l) => l.action === 'delete').length,
    update: logs.filter((l) => l.action === 'update').length,
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Audit Logs</h1>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>All activity across your projects · Times shown in IST</p>
        </div>
        <button className="btn-ghost" onClick={exportCSV}><Download size={14} /> Export CSV (IST)</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: counts.total, color: 'var(--text)' },
          { label: 'Creations', value: counts.create, color: 'var(--accent3)' },
          { label: 'Deletions', value: counts.delete, color: 'var(--danger)' },
          { label: 'Updates', value: counts.update, color: 'var(--accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input className="env-input" style={{ paddingLeft: 36 }} placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border2)'}`,
              background: filter === f ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: filter === f ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'var(--font-ui)', cursor: 'pointer', transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>USER</th>
              <th>ACTION</th>
              <th>TARGET</th>
              <th>PROJECT</th>
              <th>WHEN (IST)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><ScrollText size={28} style={{ opacity: 0.3 }} /><p>No audit events found</p></div></td></tr>
            ) : (
              filtered.map((log) => {
                const meta = ACTION_META[log.action] || { label: log.action, cls: 'badge-gray' };
                const { ago, stamp } = timeAgoWithIST(log.createdAt);
                return (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar sm">{log.userId?.avatar || '?'}</div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{log.userId?.name?.split(' ')[0] || 'Unknown'}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                    <td>
                      {log.targetKey
                        ? <span className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{log.targetKey}</span>
                        : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{log.projectId?.name || '—'}</td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ago}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7, marginTop: 2 }}>{stamp}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
