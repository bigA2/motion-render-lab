// P01 light-scene backdrop: living paper stage that matches the story (workflows = connectors with data flowing).
// Layers (back → front): drifting periwinkle/blush aurora · dot grid lit by a travelling wave · faint connector
// curves with dots flowing along them · soft ripple rings on the key beats. Pure function of frame, seeded, no randomness.
import React from 'react';
import {AbsoluteFill} from 'remotion';

const W = 1080, H = 1920;
const PERI = '139,143,232', PERI_D = '100,104,216', BLUSH = '244,184,168';

// cubic bezier point
const bz = (p: number[][], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
// connector curves sweeping across the frame (each sways slowly)
const CURVES = [
  {y0: 260, y1: 640, c: PERI_D, sp: 1.0, ph: 0},
  {y0: 1500, y1: 980, c: BLUSH, sp: 0.8, ph: 1.7},
  {y0: 820, y1: 1680, c: PERI, sp: 1.2, ph: 3.1},
  {y0: 1880, y1: 120, c: PERI_D, sp: 0.7, ph: 4.4},
];

export const Backdrop: React.FC<{f: number; beats: number[]; base: string}> = ({f, beats, base}) => {
  const t = f / 30;
  const blob = (x: number, y: number, c: string, a: number, r: number) => `radial-gradient(circle at ${x}% ${y}%, rgba(${c},${a}) 0%, rgba(${c},0) ${r}%)`;
  const aurora = [
    blob(22 + 14 * Math.sin(t * 0.42), 24 + 10 * Math.cos(t * 0.31), PERI, 0.42, 42),
    blob(80 + 12 * Math.cos(t * 0.37), 30 + 14 * Math.sin(t * 0.45), BLUSH, 0.40, 40),
    blob(62 + 16 * Math.sin(t * 0.27 + 1), 78 + 10 * Math.cos(t * 0.33), PERI, 0.30, 46),
    blob(18 + 10 * Math.cos(t * 0.49 + 2), 86 + 8 * Math.sin(t * 0.38), BLUSH, 0.30, 38),
  ].join(',');
  // dot grid lit by a diagonal wave that sweeps every ~6 s
  const wave = ((t / 6) % 1) * 160 - 30;
  return <AbsoluteFill style={{background: base, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: aurora, filter: 'blur(30px) saturate(1.1)'}} />
    <AbsoluteFill style={{backgroundImage: `radial-gradient(rgba(${PERI_D},0.55) 1.6px, transparent 2px)`, backgroundSize: '44px 44px', backgroundPosition: `${(t * 6) % 44}px ${(t * 10) % 44}px`,
      WebkitMaskImage: `linear-gradient(135deg, rgba(0,0,0,0.10) ${wave - 30}%, rgba(0,0,0,0.65) ${wave}%, rgba(0,0,0,0.10) ${wave + 30}%)`, maskImage: `linear-gradient(135deg, rgba(0,0,0,0.10) ${wave - 30}%, rgba(0,0,0,0.65) ${wave}%, rgba(0,0,0,0.10) ${wave + 30}%)`, opacity: 0.55}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs><filter id="bdglow"><feGaussianBlur stdDeviation="5" /></filter></defs>
      {CURVES.map((c, i) => {
        const sw = Math.sin(t * 0.35 * c.sp + c.ph) * 120;
        const P = [[-80, c.y0], [360, c.y0 + sw], [720, c.y1 - sw], [W + 80, c.y1]];
        const d = `M${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
        return <g key={i}>
          <path d={d} fill="none" stroke={`rgba(${c.c},0.16)`} strokeWidth={2.5} />
          <path d={d} fill="none" stroke={`rgba(${c.c},0.35)`} strokeWidth={2.5} strokeDasharray="10 26" strokeDashoffset={-f * 2.4 * c.sp} />
          {[0, 1, 2].map((j) => { const k = ((t * 0.16 * c.sp + j / 3 + i * 0.13) % 1); const [x, y] = bz(P, k);
            return <g key={j}><circle cx={x} cy={y} r={14} fill={`rgba(${c.c},0.35)`} filter="url(#bdglow)" /><circle cx={x} cy={y} r={5} fill={`rgba(${c.c},0.85)`} /></g>; })}
        </g>;
      })}
      {/* soft ripple rings on the beats */}
      {beats.map((b, i) => { const k = (f - b) / 36; if (k < 0 || k > 1) return null;
        return <circle key={i} cx={W / 2} cy={H * 0.4} r={120 + k * 900} fill="none" stroke={`rgba(${PERI_D},${0.28 * (1 - k)})`} strokeWidth={3 + 10 * (1 - k)} />; })}
    </svg>
  </AbsoluteFill>;
};
