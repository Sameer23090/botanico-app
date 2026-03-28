import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 5 + 2;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 30}%;
        --dur:${5 + Math.random() * 7}s;
        --delay:${Math.random() * 9}s;
      `;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <div style={{ background: 'var(--night)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Text-only wordmark */}
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22, fontWeight: 700,
          background: 'linear-gradient(135deg, var(--pearl) 0%, var(--sage) 60%, var(--gold) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Botanico</div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            to="/login"
            id="nav-login-btn"
            style={{
              padding: '9px 22px',
              border: '1px solid rgba(134,239,172,0.2)',
              borderRadius: 100, color: 'var(--mist)',
              fontSize: 13, textDecoration: 'none',
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              transition: 'all 0.25s',
              backdropFilter: 'blur(8px)',
            }}>
            Sign In
          </Link>
          <Link
            to="/register"
            id="nav-register-btn"
            className="btn-primary"
            style={{ padding: '9px 22px', fontSize: 13 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════
           HERO
      ═══════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '40px 20px',
      }}>
        {/* Particles */}
        <div ref={particlesRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 260 }}>
          <p className="anim-slide-up-1" style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10, letterSpacing: '0.42em',
            color: 'var(--mist)', textTransform: 'uppercase',
            marginBottom: 20, opacity: 0.7,
          }}>Scientific Plant Intelligence</p>

          <h1 className="anim-slide-up-2" style={{
            fontFamily: "var(--font-serif)",
            fontSize: 'clamp(72px, 13vw, 148px)',
            fontWeight: 700, lineHeight: 0.88,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--pearl) 0%, var(--sage) 45%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Botanico</h1>

          <p className="anim-slide-up-3" style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(14px, 1.8vw, 17px)', fontWeight: 300,
            color: 'rgba(240,253,244,0.55)', marginTop: 22, letterSpacing: '0.02em',
            maxWidth: 420, margin: '20px auto 0',
          }}>Grow a plant. Track its journey. Share the science.</p>

          <div className="anim-slide-up-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            <Link to="/register" id="hero-register-btn" className="btn-primary" style={{ padding: '15px 36px', fontSize: 15 }}>
              Start Growing Free
            </Link>
            <Link to="/login" id="hero-login-btn" className="btn-secondary" style={{ padding: '14px 36px', fontSize: 15 }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* ── ANIMATED PLANT ── */}
        <div className="plant-hero">
          <div className="plant-roots">
            <div className="plant-root" />
            <div className="plant-root" />
            <div className="plant-root" />
          </div>
          <div className="plant-stem">
            <div className="plant-leaf-l" />
            <div className="plant-leaf-r" />
            <div className="plant-leaf-l2" />
            <div className="plant-leaf-r2" />
            <div className="plant-bud" />
          </div>
        </div>

        <div className="ground-line" />
        <div className="ground-fill" />
      </section>

      {/* Footer */}
      <footer style={{
        background: 'rgba(10,15,13,0.9)',
        padding: '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17, fontWeight: 700,
          background: 'linear-gradient(135deg, var(--pearl), var(--sage))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Botanico</div>
        <div style={{ fontSize: 12, color: 'rgba(240,253,244,0.25)', fontFamily: "var(--font-body)" }}>
          © 2026 Botanico. Made with 💚 for plant lovers.
        </div>
      </footer>
    </div>
  );
}
