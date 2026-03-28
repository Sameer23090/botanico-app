import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register({ onRegister }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsText, setGpsText] = useState('📍 Auto-detect my garden location');
    const [gpsCoords, setGpsCoords] = useState('TAP');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    location: form.location || gpsCoords !== 'TAP' ? gpsCoords : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            // Save token + user to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onRegister(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const captureGPS = () => {
        setGpsText('⏳ Locating...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setGpsText('✅ Location captured!');
                    setGpsCoords(`${lat}, ${lng}`);
                    setForm(f => ({ ...f, location: `${lat}, ${lng}` }));
                },
                () => {
                    setGpsText('📍 Location set (demo)');
                    setGpsCoords('11.258345, 75.780234');
                    setForm(f => ({ ...f, location: '11.258345, 75.780234' }));
                }
            );
        } else {
            setGpsText('📍 Location set (demo)');
            setGpsCoords('11.258345, 75.780234');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--soil)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>

            {/* Vine decorations */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 200, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 800'%3E%3Cpath d='M180 0 Q60 100 160 200 Q260 300 80 400 Q-60 500 140 600 Q280 700 100 800' stroke='%232D6A4F' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 200, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 800'%3E%3Cpath d='M20 0 Q140 100 40 200 Q-60 300 120 400 Q260 500 60 600 Q-80 700 100 800' stroke='%231B3A2D' stroke-width='2' fill='none' opacity='0.25'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundSize: 'contain', pointerEvents: 'none' }} />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, var(--cream), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>Botanico</div>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: 'var(--mint)', textTransform: 'uppercase', opacity: 0.7 }}>🌿 Create your grower profile</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 6, marginBottom: 28, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Link to="/login" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', color: 'rgba(245,240,232,0.4)', fontSize: 14, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Sign In</Link>
                    <Link to="/register" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, var(--leaf), var(--moss))', color: 'var(--white)', fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,106,79,0.5)', fontFamily: "'DM Sans', sans-serif" }}>New Grower</Link>
                </div>

                {/* Card */}
                <div style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 28, padding: '44px 40px',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--cream)', marginBottom: 4 }}>Join Botanico</h2>
                    <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.45)', marginBottom: 32, fontWeight: 300 }}>Create your grower profile — start tracking today</p>

                    <form onSubmit={handleSubmit}>
                        {/* Name - single full name field */}
                        <div style={{ marginBottom: 18 }}>
                            <label className="label-text">Full Name</label>
                            <input
                                id="register-fullname"
                                type="text"
                                className="input-field"
                                placeholder="e.g. Daniel Swamy P"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>


                        <div style={{ marginBottom: 18 }}>
                            <label className="label-text">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="register-email"
                                    type="email"
                                    className="input-field"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                                <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(245,240,232,0.2)', fontSize: 14, pointerEvents: 'none' }}>✉</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="label-text">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    placeholder="Min. 6 characters"
                                    style={{ paddingRight: 48 }}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    minLength={6}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, bottom: 14, background: 'none', border: 'none', color: 'rgba(245,240,232,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* GPS badge */}
                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px',
                            background: 'rgba(82,183,136,0.08)',
                            border: '1px solid rgba(82,183,136,0.2)',
                            borderRadius: 12, marginBottom: 20,
                            cursor: 'pointer', transition: 'all 0.3s',
                        }}>
                            <div className="gps-dot" />
                            <span style={{ fontSize: 13, color: 'var(--mint)', fontWeight: 300 }}>{gpsText}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(149,213,178,0.5)' }}>{gpsCoords}</small>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div style={{
                                marginBottom: 16, padding: '12px 16px',
                                background: 'rgba(255,70,70,0.1)',
                                border: '1px solid rgba(255,70,70,0.3)',
                                borderRadius: 10, color: '#ff6b6b', fontSize: 13,
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            id="register-submit-btn"
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: 18,
                                background: loading
                                    ? 'rgba(82,183,136,0.4)'
                                    : 'linear-gradient(135deg, var(--sprout) 0%, var(--leaf) 60%, var(--moss) 100%)',
                                border: 'none', borderRadius: 16, color: 'var(--white)',
                                fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                                boxShadow: '0 8px 30px rgba(82,183,136,0.35)',
                                letterSpacing: '0.05em',
                            }}>
                            {loading ? '⟳ Creating profile...' : 'Create My Garden Profile 🌿'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/login" style={{ fontSize: 13, color: 'var(--mint)', textDecoration: 'none' }}>Already growing? Sign in →</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
