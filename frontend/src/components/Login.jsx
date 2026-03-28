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
    <div style={{ minHeight: '100vh', background: 'var(--soil)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>

      {/* Vine decoration */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 200, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 800'%3E%3Cpath d='M180 0 Q60 100 160 200 Q260 300 80 400 Q-60 500 140 600 Q280 700 100 800' stroke='%232D6A4F' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 200, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 800'%3E%3Cpath d='M20 0 Q140 100 40 200 Q-60 300 120 400 Q260 500 60 600 Q-80 700 100 800' stroke='%231B3A2D' stroke-width='2' fill='none' opacity='0.25'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, var(--cream), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>Botanico</div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: 'var(--mint)', textTransform: 'uppercase', opacity: 0.7 }}>🌱 Welcome back, Grower</p>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 6, marginBottom: 28, border: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/login" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, var(--leaf), var(--moss))', color: 'var(--white)', fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,106,79,0.5)', fontFamily: "'DM Sans', sans-serif" }}>Sign In</Link>
          <Link to="/register" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', color: 'rgba(245,240,232,0.4)', fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}>New Grower</Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 28, padding: '44px 40px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--cream)', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.45)', marginBottom: 32, fontWeight: 300 }}>Sign in to your garden dashboard</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="label-text">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(245,240,232,0.2)', fontSize: 14, pointerEvents: 'none' }}>✉</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label-text">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" style={{ paddingRight: 48 }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, bottom: 14, background: 'none', border: 'none', color: 'rgba(245,240,232,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 18,
              background: 'linear-gradient(135deg, var(--sprout) 0%, var(--leaf) 60%, var(--moss) 100%)',
              border: 'none', borderRadius: 16, color: 'var(--white)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: '0 8px 30px rgba(82,183,136,0.35)',
              letterSpacing: '0.05em', position: 'relative', overflow: 'hidden',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Signing in...' : 'Sign In to Botanico 🌱'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.3)', fontFamily: "'DM Sans', sans-serif" }}>Don't have an account?</span>
            <Link to="/register" style={{ fontSize: 13, color: 'var(--mint)', textDecoration: 'none' }}>Create account →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
