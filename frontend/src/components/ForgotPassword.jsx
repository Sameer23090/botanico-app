import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: '0.3em', color: 'var(--jade)', textTransform: 'uppercase', opacity: 0.7 }}>{t('forgot_password.subtitle')}</p>
        </div>

        <div className="card" style={{ padding: '44px 40px' }}>
          {!submitted ? (
            <>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: 'var(--pearl)', marginBottom: 8 }}>{t('forgot_password.title')}</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,253,244,0.45)', marginBottom: 32, fontWeight: 300 }}>{t('forgot_password.description')}</p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label className="label-text">{t('forgot_password.email_label')}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'rgba(240,253,244,0.25)' }} />
                    <input type="email" className="input-field" style={{ paddingLeft: 44 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 14 }}>
                  {loading ? '...' : t('forgot_password.submit')}
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
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, color: 'var(--pearl)', marginBottom: 12 }}>Link Sent!</h2>
              <p style={{ fontSize: 15, color: 'rgba(240,253,244,0.5)', lineHeight: 1.6, marginBottom: 32 }}>{t('forgot_password.success_msg')}</p>
              <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', padding: '14px', borderRadius: 12 }}>
                {t('forgot_password.back_to_login')}
              </Link>
            </div>
          )}

          {!submitted && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Link to="/login" style={{ fontSize: 14, color: 'rgba(240,253,244,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ArrowLeft size={14} /> {t('forgot_password.back_to_login')}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
