import { useEffect, useRef } from 'react';

// ─── Static ambient positions (rendered once, animated by CSS) ───
const LEAVES = [
    { left: '8%', bottom: '15%', delay: '0s', dur: '14s', dx: '80px', dx2: '-30px', emoji: '🍃' },
    { left: '18%', bottom: '5%', delay: '2.5s', dur: '11s', dx: '-50px', dx2: '40px', emoji: '🌿' },
    { left: '72%', bottom: '10%', delay: '4s', dur: '16s', dx: '60px', dx2: '-80px', emoji: '🍃' },
    { left: '88%', bottom: '20%', delay: '1s', dur: '13s', dx: '-70px', dx2: '20px', emoji: '🌿' },
    { left: '35%', bottom: '8%', delay: '6s', dur: '15s', dx: '40px', dx2: '-60px', emoji: '🍃' },
    { left: '55%', bottom: '3%', delay: '3s', dur: '12s', dx: '-30px', dx2: '50px', emoji: '🌱' },
    { left: '92%', bottom: '35%', delay: '7s', dur: '18s', dx: '-90px', dx2: '30px', emoji: '🍃' },
    { left: '3%', bottom: '40%', delay: '5s', dur: '17s', dx: '70px', dx2: '-40px', emoji: '🌿' },
];

const PETALS = [
    { left: '12%', bottom: '20%', delay: '0s', dur: '10s', ps: '7px', pc: 'rgba(82,183,136,0.35)', pr: '30deg', px: '25px', px2: '-15px' },
    { left: '28%', bottom: '10%', delay: '1.8s', dur: '13s', ps: '5px', pc: 'rgba(212,168,83,0.3)', pr: '60deg', px: '-30px', px2: '20px' },
    { left: '65%', bottom: '25%', delay: '3.2s', dur: '9s', ps: '9px', pc: 'rgba(149,213,178,0.3)', pr: '15deg', px: '40px', px2: '-25px' },
    { left: '82%', bottom: '5%', delay: '0.5s', dur: '15s', ps: '6px', pc: 'rgba(242,204,96,0.25)', pr: '80deg', px: '-20px', px2: '35px' },
    { left: '45%', bottom: '12%', delay: '4.5s', dur: '11s', ps: '8px', pc: 'rgba(82,183,136,0.3)', pr: '45deg', px: '30px', px2: '-40px' },
    { left: '95%', bottom: '30%', delay: '2s', dur: '14s', ps: '5px', pc: 'rgba(212,168,83,0.25)', pr: '20deg', px: '-40px', px2: '15px' },
];

const SPORES = [
    { left: '20%', bottom: '30%', delay: '0s', dur: '7s', size: '6px' },
    { left: '50%', bottom: '20%', delay: '2s', dur: '9s', size: '4px' },
    { left: '75%', bottom: '15%', delay: '1s', dur: '11s', size: '8px' },
    { left: '10%', bottom: '60%', delay: '3.5s', dur: '8s', size: '5px' },
    { left: '88%', bottom: '55%', delay: '1.5s', dur: '10s', size: '7px' },
    { left: '38%', bottom: '45%', delay: '4s', dur: '6s', size: '4px' },
    { left: '62%', bottom: '70%', delay: '0.5s', dur: '13s', size: '5px' },
    { left: '5%', bottom: '80%', delay: '2.8s', dur: '9s', size: '6px' },
];

export default function AmbientAnimations() {
    return (
        <>
            {/* Floating leaves */}
            {LEAVES.map((l, i) => (
                <div
                    key={`leaf-${i}`}
                    className="ambient-leaf"
                    style={{
                        left: l.left,
                        bottom: l.bottom,
                        '--delay': l.delay,
                        '--ld': l.dur,
                        '--dx': l.dx,
                        '--dx2': l.dx2,
                    }}
                >
                    {l.emoji}
                </div>
            ))}

            {/* Floating petals */}
            {PETALS.map((p, i) => (
                <div
                    key={`petal-${i}`}
                    className="ambient-petal"
                    style={{
                        left: p.left,
                        bottom: p.bottom,
                        '--delay': p.delay,
                        '--pf': p.dur,
                        '--ps': p.ps,
                        '--pc': p.pc,
                        '--pr': p.pr,
                        '--px': p.px,
                        '--px2': p.px2,
                    }}
                />
            ))}

            {/* Rising spores */}
            {SPORES.map((s, i) => (
                <div
                    key={`spore-${i}`}
                    className="ambient-spore"
                    style={{
                        left: s.left,
                        bottom: s.bottom,
                        width: s.size,
                        height: s.size,
                        '--delay': s.delay,
                        '--sr': s.dur,
                    }}
                />
            ))}
        </>
    );
}
