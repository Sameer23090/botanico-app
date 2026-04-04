import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register({ onRegister }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsTextKey, setGpsTextKey] = useState('register.gps_detect');
    const [gpsCoords, setGpsCoords] = useState('TAP');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const emailLower = form.email.trim().toLowerCase();
        if (!emailLower.endsWith('@gmail.com') && !emailLower.endsWith('@outlook.com') && !emailLower.endsWith('@yahoo.com')) {
            setError(t('register.error_trusted_email'));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    location: form.location || (gpsCoords !== 'TAP' ? gpsCoords : undefined),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('register.error_failed'));

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (onRegister) onRegister(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const captureGPS = () => {
        setGpsTextKey('register.gps_locating');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    setGpsTextKey('register.gps_captured');
                    setGpsCoords(`${lat}, ${lng}`);
                    setForm(f => ({ ...f, location: `${lat}, ${lng}` }));
                },
                () => {
                    setGpsTextKey('register.gps_demo');
                    setGpsCoords('11.258345, 75.780234');
                    setForm(f => ({ ...f, location: '11.258345, 75.780234' }));
                }
            );
        } else {
            setGpsTextKey('register.gps_demo');
            setGpsCoords('11.258345, 75.780234');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>

            {/* Language selection restricted to login/register only */}
            <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
                <LanguageSwitcher />
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, var(--pearl), var(--sage))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6, letterSpacing: '-0.02em' }}>{t('app_title')}</div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: '0.3em', color: 'var(--jade)', textTransform: 'uppercase', opacity: 0.7 }}>{t('register.description')}</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 6, marginBottom: 28, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Link to="/login" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', color: 'rgba(240,253,244,0.4)', fontSize: 14, textDecoration: 'none', fontFamily: "var(--font-body)" }}>{t('login.submit')}</Link>
                    <Link to="/register" style={{ flex: 1, padding: '12px', borderRadius: 12, textAlign: 'center', background: 'linear-gradient(135deg, var(--jade), var(--emerald))', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.3)', fontFamily: "var(--font-body)" }}>{t('register.subtitle')}</Link>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '44px 40px' }}>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: 'var(--pearl)', marginBottom: 4, letterSpacing: '-0.02em' }}>{t('register.title')}</h2>
                    <p style={{ fontSize: 14, color: 'rgba(240,253,244,0.45)', marginBottom: 32, fontWeight: 300 }}>{t('register.description')}</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label className="label-text">{t('register.full_name')}</label>
                            <input
                                id="register-fullname"
                                type="text"
                                className="input-field"
                                placeholder="e.g. Daniel Swamy"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>


                        <div style={{ marginBottom: 18 }}>
                            <label className="label-text">{t('register.email')}</label>
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
                                <span style={{ position: 'absolute', right: 16, bottom: 16, color: 'rgba(240,253,244,0.2)', fontSize: 14, pointerEvents: 'none' }}>✉</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="label-text">{t('register.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field"
                                    placeholder={t('register.password_placeholder')}
                                    style={{ paddingRight: 48 }}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    minLength={6}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, bottom: 14, background: 'none', border: 'none', color: 'rgba(240,253,244,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* GPS badge */}
                        <div onClick={captureGPS} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px',
                            background: 'rgba(34,197,94,0.06)',
                            border: '1px solid rgba(34,197,94,0.15)',
                            borderRadius: 12, marginBottom: 20,
                            cursor: 'pointer', transition: 'all 0.3s',
                        }}>
                            <div className="gps-dot" />
                            <span style={{ fontSize: 13, color: 'var(--jade)', fontWeight: 500 }}>{t(gpsTextKey)}</span>
                            <small style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: 10, color: 'rgba(34,197,94,0.5)' }}>{gpsCoords}</small>
                        </div>

                        {error && (
                            <div style={{
                                marginBottom: 16, padding: '12px 16px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: 12, color: '#fca5a5', fontSize: 13,
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            id="register-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14, opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? t('register.submitting') : t('register.submit')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Link to="/login" style={{ fontSize: 13, color: 'var(--jade)', textDecoration: 'none', fontWeight: 500 }}>{t('register.already_growing')}</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
