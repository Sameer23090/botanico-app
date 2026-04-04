import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
];

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = useRef(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 200 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(6,78,59,0.35)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 999,
          padding: '7px 14px',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(240,253,244,0.85)', letterSpacing: '0.01em' }}>
          {currentLang.name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', right: 0, top: '100%',
              marginTop: 6,
              minWidth: 170,
              background: 'rgba(6,20,15,0.96)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { changeLanguage(lang.code); setIsOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 16px',
                  background: language === lang.code ? 'rgba(34,197,94,0.12)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  borderLeft: language === lang.code ? '2px solid rgba(34,197,94,0.6)' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (language !== lang.code) e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                onMouseLeave={e => { if (language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span style={{
                  fontSize: 14,
                  color: language === lang.code ? 'rgba(134,239,172,1)' : 'rgba(240,253,244,0.6)',
                  fontWeight: language === lang.code ? 600 : 400,
                  letterSpacing: '0.01em',
                }}>
                  {lang.name}
                </span>
                {language === lang.code && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(134,239,172,0.7)' }}>✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
