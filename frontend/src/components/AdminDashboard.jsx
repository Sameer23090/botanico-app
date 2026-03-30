import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('adminToken');

const apiFetch = async (path) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin';
    return null;
  }
  return res.json();
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const timeAgo = (d) => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const HEALTH_COLORS = {
  excellent: 'var(--jade)', good: 'var(--mist)', fair: 'var(--gold)', poor: 'var(--amber)', critical: '#ef4444'
};
const HEALTH_LABELS = { excellent: '🟢', good: '🔵', fair: '🟡', poor: '🟠', critical: '🔴' };

// ── Sub-components ────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color, trend }) => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    border: `1px solid ${color}22`,
    borderRadius: 16, padding: '20px 24px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)` }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>
      {trend !== undefined && (
        <span style={{ fontSize: 11, color: trend >= 0 ? 'var(--jade)' : '#ef4444', background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
          {trend >= 0 ? '↑' : '↓'} Today
        </span>
      )}
    </div>
    <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const HealthPill = ({ status }) => {
  const c = HEALTH_COLORS[status] || '#888';
  return status ? (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `color-mix(in srgb, ${c} 20%, transparent)`, color: c, border: `1px solid color-mix(in srgb, ${c} 40%, transparent)` }}>
      {HEALTH_LABELS[status]} {status}
    </span>
  ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>—</span>;
};

const RolePill = ({ role }) => {
  const colors = { admin: '#f97316', faculty: 'var(--mist)', student: 'var(--jade)' };
  const c = colors[role] || '#888';
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `color-mix(in srgb, ${c} 20%, transparent)`, color: c, border: `1px solid color-mix(in srgb, ${c} 40%, transparent)`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {role}
    </span>
  );
};

const Section = ({ title, action, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>{title}</span>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('monitor');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPlants, setUserPlants] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantUpdates, setPlantUpdates] = useState(null);
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const load = useCallback(async (t) => {
    setLoading(true);
    try {
      if (t === 'monitor' || t === 'monitor-refresh') {
        const [ov, act] = await Promise.all([apiFetch('/admin/overview'), apiFetch('/admin/activity')]);
        if (ov) setOverview(ov);
        if (act) setActivity(act);
      } else if (t === 'growers') {
        const d = await apiFetch('/admin/users');
        if (d) setUsers(d.users);
      } else if (t === 'plants') {
        const d = await apiFetch('/admin/plants');
        if (d) setPlants(d.plants);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) { navigate('/admin'); return; }
    load(tab);
  }, [tab, load, navigate]);

  const viewUserPlants = async (user) => {
    setSelectedUser(user);
    setUserPlants(null);
    setSelectedPlant(null);
    setPlantUpdates(null);
    const d = await apiFetch(`/admin/users/${user.id || user._id}/plants`);
    if (d) setUserPlants(d);
  };

  const viewPlantUpdates = async (plant) => {
    setSelectedPlant(plant);
    setPlantUpdates(null);
    const d = await apiFetch(`/admin/plants/${plant.id || plant._id}/updates`);
    if (d) setPlantUpdates(d);
  };

  const updateRole = async (userId, role) => {
    await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ role }),
    });
    load('growers');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  // ── Sidebar tabs ─────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'monitor', icon: '📡', label: 'Live Monitor' },
    { id: 'growers',  icon: '👥', label: 'Growers' },
    { id: 'plants',   icon: '🌿', label: 'Plant Registry' },
  ];

  return (
    <div className="mobile-col" style={{ display: 'flex', minHeight: '100vh', background: 'var(--night)', fontFamily: "var(--font-body)", color: 'var(--pearl)' }}>

      {/* ── Sidebar ── */}
      <aside className="mobile-sidebar" style={{ width: 220, flexShrink: 0, background: 'rgba(10,15,13,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '0 0 24px' }}>
        {/* Logo */}
        <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 24, background: 'linear-gradient(135deg, var(--pearl), var(--sage))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Botanico</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--jade)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin Control</div>
            </div>
          </div>
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.1)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade)', boxShadow: '0 0 6px var(--jade)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--jade)', fontWeight: 500 }}>System Live</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedUser(null); setUserPlants(null); setSelectedPlant(null); setPlantUpdates(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontSize: 14, transition: 'all 0.15s',
                background: tab === t.id ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))' : 'transparent',
                color: tab === t.id ? 'var(--jade)' : 'rgba(255,255,255,0.45)',
                borderLeft: tab === t.id ? '2px solid var(--jade)' : '2px solid transparent',
                fontWeight: tab === t.id ? 600 : 400,
              }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0 12px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>👑 {adminUser.name || 'Admin'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{adminUser.email || ''}</div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '9px', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* Top bar */}
        <div className="mobile-nav" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,15,13,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading && <div style={{ width: 16, height: 16, border: '2px solid rgba(34,197,94,0.2)', borderTop: '2px solid var(--jade)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {loading ? 'Fetching latest data...' : `Last refreshed: ${new Date().toLocaleTimeString()}`}
            </span>
          </div>
          <button onClick={() => load(tab === 'monitor' ? 'monitor-refresh' : tab)} style={{ padding: '6px 14px', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, background: 'rgba(34,197,94,0.06)', color: 'var(--jade)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            ↻ Refresh
          </button>
        </div>

        <div className="mobile-main" style={{ padding: '28px 32px' }}>

          {/* ══ LIVE MONITOR ══ */}
          {tab === 'monitor' && overview && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#fff', marginBottom: 4 }}>📡 Live Monitor</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Real-time overview of all growing activity across the platform</p>
              </div>

              {/* KPI Grid */}
              <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                <KpiCard icon="👥" label="Total Growers" value={overview.stats.totalUsers} color="var(--mist)"
                  sub="Registered users" />
                <KpiCard icon="🌿" label="Plants Growing" value={overview.stats.totalPlants} color="var(--jade)"
                  sub="Across all users" trend={1} />
                <KpiCard icon="📋" label="Log Entries" value={overview.stats.totalUpdates} color="var(--gold)"
                  sub="Total observations" trend={1} />
                <KpiCard icon="⚡" label="Active Now" value={overview.plantsByStatus?.find(p => p._id === 'active')?.count || 0}
                  color="var(--amber)" sub="Active plants" />
              </div>

              <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Grower breakdown */}
                <Section title="👥 Growers by Role">
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {overview.usersByRole.map(r => {
                      const colors = { admin: '#f97316', faculty: 'var(--mist)', student: 'var(--jade)' };
                      const c = colors[r._id] || '#888';
                      const pct = overview.stats.totalUsers ? Math.round((r.count / overview.stats.totalUsers) * 100) : 0;
                      return (
                        <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <RolePill role={r._id} />
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3, transition: 'width 0.8s ease' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 24, textAlign: 'right' }}>{r.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* Plant status breakdown */}
                <Section title="🌿 Plant Status">
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {overview.plantsByStatus.map(p => {
                      const colors = { active: 'var(--jade)', harvested: 'var(--gold)', dormant: 'var(--mist)', deleted: '#ef4444' };
                      const c = colors[p._id] || '#888';
                      const pct = overview.stats.totalPlants ? Math.round((p.count / overview.stats.totalPlants) * 100) : 0;
                      return (
                        <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ minWidth: 72, fontSize: 12, fontWeight: 600, color: c, textTransform: 'capitalize' }}>{p._id}</span>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3, transition: 'width 0.8s ease' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 24, textAlign: 'right' }}>{p.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </div>

              {/* Activity feeds */}
              {activity && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Recent log entries */}
                  <Section title="📋 Recent Log Entries" action={<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>last {activity.recentUpdates.length}</span>}>
                    <div>
                      {activity.recentUpdates.slice(0, 8).map((u, i) => (
                        <div key={u.id || u._id} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px',
                          borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: HEALTH_COLORS[u.healthStatus] || 'var(--mist)', marginTop: 4, flexShrink: 0, boxShadow: `0 0 6px ${HEALTH_COLORS[u.healthStatus] || 'var(--mist)'}` }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <strong style={{ color: '#fff' }}>{u.userId?.name || 'Unknown'}</strong>
                              <span style={{ color: 'rgba(255,255,255,0.35)' }}> logged on </span>
                              <strong style={{ color: 'var(--jade)' }}>{u.plantId?.commonName || 'a plant'}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                              <HealthPill status={u.healthStatus} />
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{timeAgo(u.createdAt)}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Day {u.dayNumber}</div>
                        </div>
                      ))}
                      {activity.recentUpdates.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No log entries yet</div>}
                    </div>
                  </Section>

                  {/* Recently added plants */}
                  <Section title="🌱 Recently Added Plants" action={<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>last {activity.recentPlants.length}</span>}>
                    <div>
                      {activity.recentPlants.slice(0, 8).map((p, i) => (
                        <div key={p.id || p._id} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                          borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌱</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.commonName}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>by {p.userId?.name || '—'} · {timeAgo(p.createdAt)}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>Day {p.daysSincePlanting ?? '?'}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{p.plantType || '—'}</div>
                          </div>
                        </div>
                      ))}
                      {activity.recentPlants.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No plants yet</div>}
                    </div>
                  </Section>
                </div>
              )}

              {/* Recent users table */}
              <Section title="🆕 Recently Joined Growers">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr>
                        {['Name', 'Email', 'Role', 'Joined'].map(h => (
                          <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recentUsers.map((u, i) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                          <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</td>
                          <td style={{ padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{u.email}</td>
                          <td style={{ padding: '12px 20px' }}><RolePill role={u.role} /></td>
                          <td style={{ padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{fmt(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </div>
          )}

          {/* ══ GROWERS ══ */}
          {tab === 'growers' && !selectedUser && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#fff', marginBottom: 4 }}>👥 Growers Registry</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{users.length} registered users — manage roles and view their plants</p>
              </div>
              <Section title="All Growers">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                    <thead>
                      <tr>
                        {['Grower', 'Email', 'Role', 'Plants', 'Joined', ''].map(h => (
                          <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id || u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                {u.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{u.email}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <select value={u.role} onChange={e => updateRole(u.id || u._id, e.target.value)}
                              style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--jade)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{u.plantCount}</span>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{fmt(u.createdAt)}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <button onClick={() => viewUserPlants(u)} style={{ padding: '6px 14px', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, background: 'rgba(34,197,94,0.06)', color: 'var(--jade)', fontSize: 12, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              🌱 View Plants
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </div>
          )}

          {/* User plants drill-down */}
          {tab === 'growers' && selectedUser && !selectedPlant && userPlants && (
            <div>
              <button onClick={() => { setSelectedUser(null); setUserPlants(null); }} style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
                ← Back to Growers
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--jade)' }}>
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#fff', margin: 0 }}>{selectedUser.name}'s Plants</h1>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{selectedUser.email}</span>
                    <RolePill role={selectedUser.role} />
                    <span style={{ fontSize: 12, color: 'var(--jade)', fontWeight: 600 }}>{userPlants.plants?.length || 0} plant{userPlants.plants?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              {!userPlants.plants?.length ? (
                <div style={{ padding: '60px', textAlign: 'center', fontSize: 32 }}>🌿 <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>No plants added yet</div></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                  {userPlants.plants.map(p => (
                    <div key={p.id || p._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px', cursor: 'pointer', transition: 'all 0.15s', borderTop: '2px solid rgba(34,197,94,0.2)' }}
                      onClick={() => viewPlantUpdates(p)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.commonName}</span>
                        <span style={{ background: p.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.1)', color: p.status === 'active' ? 'var(--jade)' : 'var(--gold)', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{p.status}</span>
                      </div>
                      {p.scientificName && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginBottom: 10 }}>{p.scientificName}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        <span>📅 {fmt(p.plantingDate)}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Day {p.daysSincePlanting ?? '?'}</span>
                      </div>
                      <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(34,197,94,0.06)', borderRadius: 6, textAlign: 'center', fontSize: 11, color: 'var(--jade)', fontWeight: 600 }}>
                        📋 View Log Entries →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Plant updates drill-down */}
          {selectedPlant && plantUpdates && (
            <div>
              <button onClick={() => { setSelectedPlant(null); setPlantUpdates(null); }} style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
                ← Back to Plants
              </button>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#fff', margin: 0 }}>📋 {selectedPlant.commonName} — Log</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{plantUpdates.updates?.length || 0} entries recorded</p>
                {selectedPlant.coordinates?.lat && selectedPlant.coordinates?.lng && (
                  <a href={`https://maps.google.com/?q=${selectedPlant.coordinates.lat},${selectedPlant.coordinates.lng}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: 'var(--jade)', fontSize: 12, borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer' }}>
                    📍 View Plant Exact Location on Maps
                  </a>
                )}
              </div>
              {!plantUpdates.updates?.length ? (
                <div style={{ padding: '60px', textAlign: 'center', fontSize: 32 }}>📝 <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>No log entries yet</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plantUpdates.updates.map(u => (
                    <div key={u.id || u._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', borderLeft: `3px solid ${HEALTH_COLORS[u.healthStatus] || '#333'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--jade)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Day {u.dayNumber}</span>
                          {u.title && <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{u.title}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <HealthPill status={u.healthStatus} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{fmt(u.entryDate)}</span>
                        </div>
                      </div>
                      {u.observations && <p style={{ margin: '0 0 10px', color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>{u.observations}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {u.temperatureCelsius && <span>🌡 {u.temperatureCelsius}°C</span>}
                        {u.soilMoisture && <span>💧 {u.soilMoisture}</span>}
                        {u.floweringStage && <span>🌸 {u.floweringStage}</span>}
                        {u.pestIssues && <span style={{ color: '#ef4444' }}>⚠️ {u.pestIssues}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ PLANT REGISTRY ══ */}
          {tab === 'plants' && !selectedPlant && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: '#fff', marginBottom: 4 }}>🌿 Plant Registry</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{plants.length} plants across all growers</p>
              </div>
              <Section title="All Plants">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                    <thead>
                      <tr>
                        {['Plant', 'Type', 'Owner', 'Status', 'Day', 'Planted', 'Logs'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {plants.map(p => (
                        <tr key={p.id || p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.commonName}</div>
                            {p.scientificName && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{p.scientificName}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.plantType || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{p.userId?.name || '—'}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{p.userId?.email || ''}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: p.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.1)', color: p.status === 'active' ? 'var(--jade)' : 'var(--gold)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>
                            {p.daysSincePlanting ?? '?'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{fmt(p.plantingDate)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => viewPlantUpdates(p)} style={{ padding: '5px 12px', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, background: 'rgba(34,197,94,0.06)', color: 'var(--jade)', fontSize: 12, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              📋 Logs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {plants.length === 0 && <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No plants in the registry yet</div>}
              </Section>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
