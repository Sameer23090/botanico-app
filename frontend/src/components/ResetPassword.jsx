import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError(t('reset_password.error_match'));
    }
    
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(token, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('reset_password.error_token'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
        <LanguageSwitcher />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 460 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, var(--pearl), var(--sage))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>{t('app_title')}</div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: '0.3em', color: 'var(--jade)', textTransform: 'uppercase', opacity: 0.7 }}>{t('reset_password.subtitle')}</p>
        </div>

        <div className="card" style={{ padding: '44px 40px' }}>
          {!success ? (
            <>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: 'var(--pearl)', marginBottom: 8 }}>{t('reset_password.title')}</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,253,244,0.45)', marginBottom: 32, fontWeight: 300 }}>{t('reset_password.description')}</p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label className="label-text">{t('reset_password.new_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(240,253,244,0.25)' }} />
                    <input type={showPassword ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 44, paddingRight: 48 }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, bottom: 14, background: 'none', border: 'none', color: 'rgba(240,253,244,0.3)', cursor: 'pointer', padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label className="label-text">{t('reset_password.confirm_password')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(240,253,244,0.25)' }} />
                    <input type={showPassword ? 'text' : 'password'} className="input-field" style={{ paddingLeft: 44 }} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14 }}>
                  {loading ? '...' : t('reset_password.submit')}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jade)' }}>
                  <CheckCircle size={32} />
                </div>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, color: 'var(--pearl)', marginBottom: 12 }}>Success!</h2>
              <p style={{ fontSize: 15, color: 'rgba(240,253,244,0.5)', lineHeight: 1.6, marginBottom: 32 }}>{t('reset_password.success_msg')}</p>
              <div style={{ fontSize: 13, color: 'rgba(240,253,244,0.3)' }}>Redirecting you to login...</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
