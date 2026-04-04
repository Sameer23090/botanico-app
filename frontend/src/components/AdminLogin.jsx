import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLogin() {
  const { t } = useTranslation();
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
          <h1 style={styles.logoText}>{t('app_title')}</h1>
          <div style={styles.adminBadge}>{t('admin_login.badge')}</div>
        </div>

        <p style={styles.subtitle}>{t('admin_login.subtitle')}</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label className="label-text">{t('admin_login.email_label')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="master@botanico.live"
                required
                className="input-field"
                style={{ paddingRight: 48 }}
              />
              <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(240,253,244,0.2)', pointerEvents: 'none' }}>
                <Mail size={16} />
              </span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label className="label-text">{t('admin_login.password_label')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="input-field"
                style={{ paddingRight: 48 }}
              />
              <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(240,253,244,0.2)', pointerEvents: 'none' }}>
                <Lock size={16} />
              </span>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <button id="admin-login-btn" type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14, marginTop: 12 }}>
            {loading ? t('admin_login.authenticating') : t('admin_login.btn')}
          </button>
        </form>

        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={12} style={{ marginRight: 6 }} /> {t('admin_login.back_home')}
        </Link>
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
    background: 'var(--night)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "var(--font-body)",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgOverlay: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(26,107,69,0.08) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  particles: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent)',
    border: '1px solid rgba(34,197,94,0.08)',
    animation: 'float 6s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '440px',
    background: 'var(--surface-1)',
    backdropFilter: 'blur(24px)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 60px rgba(34,197,94,0.08), 0 40px 80px rgba(0,0,0,0.5)',
  },
  logoArea: {
    textAlign: 'center', marginBottom: '8px',
  },
  logoText: {
    margin: 0, fontSize: '32px', fontWeight: 800,
    fontFamily: 'var(--font-serif)',
    background: 'linear-gradient(135deg, var(--pearl), var(--sage))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
  },
  adminBadge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '3px 14px',
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: '20px',
    color: 'var(--jade)',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '3px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--mist)',
    fontSize: '12px',
    margin: '12px 0 28px',
    opacity: 0.7,
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  error: {
    display: 'flex', gap: '8px', alignItems: 'center',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: '13px',
    marginTop: '4px',
  },
  hint: { marginTop: '24px' },
  hintBox: {
    background: 'rgba(34,197,94,0.05)',
    border: '1px solid rgba(34,197,94,0.15)',
    borderRadius: '12px',
    padding: '16px',
  },
  hintTitle: { margin: '0 0 8px', color: 'var(--jade)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
  hintText: { margin: '4px 0', color: 'rgba(255,255,255,0.6)', fontSize: '13px' },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '28px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};
