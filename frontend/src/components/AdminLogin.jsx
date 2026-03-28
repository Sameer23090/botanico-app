import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin accounts only.');
      }
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background particles */}
      <div style={styles.bgOverlay} />
      <div style={styles.particles}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ ...styles.particle, ...particlePos[i] }} />
        ))}
      </div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🌿</div>
          <h1 style={styles.logoText}>Botanico</h1>
          <div style={styles.adminBadge}>ADMIN PORTAL</div>
        </div>

        <p style={styles.subtitle}>Restricted access — Authorized personnel only</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉️</span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@botanico.app"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button id="admin-login-btn" type="submit" disabled={loading} style={styles.btn}>
            {loading ? (
              <span style={styles.spinner}>⟳ Authenticating...</span>
            ) : (
              '🔐 Access Admin Panel'
            )}
          </button>
        </form>

        <div style={styles.hint}>
          <div style={styles.hintBox}>
            <p style={styles.hintTitle}>📋 Default Credentials</p>
            <p style={styles.hintText}>Email: <strong>admin@botanico.app</strong></p>
            <p style={styles.hintText}>Password: <strong>Admin@Botanico2024</strong></p>
          </div>
        </div>

        <a href="/login" style={styles.backLink}>← Back to Student Login</a>
      </div>
    </div>
  );
}

const particlePos = [
  { top: '10%', left: '5%', width: '80px', height: '80px', animationDelay: '0s' },
  { top: '20%', right: '8%', width: '50px', height: '50px', animationDelay: '1s' },
  { top: '60%', left: '3%', width: '60px', height: '60px', animationDelay: '2s' },
  { top: '80%', right: '5%', width: '90px', height: '90px', animationDelay: '0.5s' },
  { top: '40%', left: '90%', width: '40px', height: '40px', animationDelay: '1.5s' },
  { top: '5%', left: '50%', width: '30px', height: '30px', animationDelay: '3s' },
  { top: '70%', left: '40%', width: '20px', height: '20px', animationDelay: '2.5s' },
  { top: '30%', left: '15%', width: '15px', height: '15px', animationDelay: '0.8s' },
  { top: '90%', left: '20%', width: '50px', height: '50px', animationDelay: '1.2s' },
  { top: '15%', left: '70%', width: '35px', height: '35px', animationDelay: '2.2s' },
  { top: '50%', left: '80%', width: '25px', height: '25px', animationDelay: '3.5s' },
  { top: '85%', left: '65%', width: '45px', height: '45px', animationDelay: '0.3s' },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f0a 0%, #0d1f12 40%, #0a1a2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(0,200,80,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(0,100,255,0.05) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  particles: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,200,80,0.12), transparent)',
    border: '1px solid rgba(0,200,80,0.08)',
    animation: 'float 6s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '440px',
    background: 'rgba(10,20,12,0.85)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,200,80,0.2)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 60px rgba(0,200,80,0.08), 0 40px 80px rgba(0,0,0,0.5)',
  },
  logoArea: {
    textAlign: 'center', marginBottom: '8px',
  },
  logoIcon: {
    fontSize: '42px', marginBottom: '8px',
    filter: 'drop-shadow(0 0 12px rgba(0,200,80,0.5))',
  },
  logoText: {
    margin: 0, fontSize: '28px', fontWeight: 800,
    background: 'linear-gradient(135deg, #00c850, #00ff88)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
  },
  adminBadge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '3px 14px',
    background: 'rgba(0,200,80,0.15)',
    border: '1px solid rgba(0,200,80,0.4)',
    borderRadius: '20px',
    color: '#00c850',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '3px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
    margin: '12px 0 28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', fontSize: '14px', zIndex: 1 },
  input: {
    width: '100%',
    padding: '13px 16px 13px 42px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,200,80,0.2)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  error: {
    display: 'flex', gap: '8px', alignItems: 'center',
    background: 'rgba(255,50,50,0.1)',
    border: '1px solid rgba(255,50,50,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ff6b6b',
    fontSize: '13px',
  },
  btn: {
    marginTop: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, #00c850, #00a040)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(0,200,80,0.3)',
  },
  spinner: { display: 'inline-block', animation: 'spin 1s linear infinite' },
  hint: { marginTop: '24px' },
  hintBox: {
    background: 'rgba(0,200,80,0.05)',
    border: '1px solid rgba(0,200,80,0.15)',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  hintTitle: { margin: '0 0 8px', color: '#00c850', fontSize: '12px', fontWeight: 700 },
  hintText: { margin: '2px 0', color: 'rgba(255,255,255,0.5)', fontSize: '12px' },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};
