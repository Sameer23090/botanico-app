import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 30}%;
        --dur:${4 + Math.random() * 6}s;
        --delay:${Math.random() * 8}s;
      `;
      container.appendChild(p);
    }
    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <div style={{ background: 'var(--soil)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 900,
          background: 'linear-gradient(135deg, var(--cream), var(--mint))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Botanico</div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link
            to="/login"
            id="nav-login-btn"
            style={{
              padding: '10px 24px',
              border: '1px solid rgba(82,183,136,0.35)',
              borderRadius: 50, color: 'var(--mint)',
              fontSize: 13, textDecoration: 'none',
              transition: 'all 0.3s',
            }}>
            Sign In
          </Link>
          <Link
            to="/register"
            id="nav-register-btn"
            style={{
              padding: '10px 24px',
              background: 'rgba(82,183,136,0.15)',
              border: '1px solid rgba(82,183,136,0.35)',
              borderRadius: 50, color: 'var(--mint)',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
            Register
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════
           HERO — full screen, centred
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

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 240 }}>
          <p className="anim-slide-up-1" style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: '0.4em',
            color: 'var(--mint)', textTransform: 'uppercase',
            marginBottom: 16,
          }}>🌍 Scientific Plant Intelligence</p>

          <h1 className="anim-slide-up-2" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(72px, 12vw, 140px)',
            fontWeight: 900, lineHeight: 0.9,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--cream) 0%, var(--mint) 50%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Botanico</h1>

          <p className="anim-slide-up-3" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 300,
            color: 'var(--cream)', marginTop: 20, letterSpacing: '0.05em',
          }}>Grow a plant. Track its journey. Share the science.</p>

          <div className="anim-slide-up-4" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            <Link to="/register" id="hero-register-btn" className="btn-primary" style={{ borderRadius: 50, padding: '16px 40px' }}>
              Start Growing Free
            </Link>
            <Link to="/login" id="hero-login-btn" className="btn-secondary" style={{ borderRadius: 50, padding: '15px 40px' }}>
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
      <footer style={{ background: '#1a0f06', padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, var(--cream), var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Botanico</div>
        <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.35)', fontFamily: "'DM Sans', sans-serif" }}>© 2026 Botanico. Made with 💚 for plant lovers.</div>
      </footer>
    </div>
  );
}
