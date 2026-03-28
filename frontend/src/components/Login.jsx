import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI, setAuthToken } from '../api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      setAuthToken(res.data.token);
      onLogin(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, var(--pearl), var(--sage))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6, letterSpacing: '-0.02em' }}>Botanico</div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: '0.3em', color: 'var(--jade)', textTransform: 'uppercase', opacity: 0.7 }}>Welcome back, Grower</p>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 6, marginBottom: 28, border: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/login" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, var(--jade), var(--emerald))', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', fontFamily: "var(--font-body)" }}>Sign In</Link>
          <Link to="/register" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', color: 'rgba(240,253,244,0.4)', fontSize: 14, textDecoration: 'none', fontFamily: "var(--font-body)", transition: 'color 0.2s' }}>New Grower</Link>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '44px 40px' }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: 'var(--pearl)', marginBottom: 4, letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'rgba(240,253,244,0.45)', marginBottom: 32, fontWeight: 300 }}>Sign in to your garden dashboard</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="label-text">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(240,253,244,0.2)', fontSize: 14, pointerEvents: 'none' }}>✉</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label-text">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" style={{ paddingRight: 48 }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, bottom: 14, background: 'none', border: 'none', color: 'rgba(240,253,244,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14 }}>
              {loading ? 'Signing in...' : 'Sign In to Botanico'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(240,253,244,0.3)' }}>Don't have an account?</span>
            <Link to="/register" style={{ fontSize: 13, color: 'var(--jade)', textDecoration: 'none', fontWeight: 500 }}>Create account →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
