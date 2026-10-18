// Motion kit for I28 — closed-form springs, liquid glass, cursor, morph shape, arc flood, 3D land-view floor.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {FONT, Glyph} from '../intro27/ui';

export const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const ez = (f: number, a: number, b: number, e = EXPO) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// critically damped spring step response (pure function of frame, ~0 overshoot)
export const spr = (f: number, at: number, w = 14) => { const t = Math.max(0, (f - at) / FPS); return 1 - (1 + w * t) * Math.exp(-w * t); };
// a value that retargets many times = sum of one spring per change
export const springTo = (f: number, keys: [number, number][], w = 14) => { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spr(f, keys[i][0], w); return v; };

export const INK = '#221E30', LO = '#6A6580', PERI = '#8B8FE8', PERI_D = '#6468D8', BLUSH = '#F4B8A8', BLUSH_D = '#E68C74', PAPER = '#F7F6F9';

// liquid glass: frosted body, bright rim, top sheen, soft lift shadow; tint optional
export const glass = (tint = 'rgba(255,255,255,0.55)', dark = false): React.CSSProperties => ({
  background: `linear-gradient(160deg, ${tint}, ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.28)'})`,
  border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)'}`,
  boxShadow: `inset 0 1.5px 0 ${dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.95)'}, inset 0 -10px 24px ${dark ? 'rgba(139,143,232,0.10)' : 'rgba(139,143,232,0.12)'}, 0 30px 60px -28px ${dark ? 'rgba(0,0,0,0.75)' : 'rgba(40,30,80,0.35)'}`,
  backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
});

// soft liquid background: three slow blobs in the scene palette
export const Liquid: React.FC<{f: number; a: string; b: string; c: string; base: string}> = ({f, a, b, c, base}) => (
  <div style={{position: 'absolute', inset: 0, background: base, overflow: 'hidden'}}>
    {[[a, 0.2, 0.25, 0.55], [b, 0.78, 0.7, 0.6], [c, 0.55, 0.15, 0.4]].map(([col, x, y, s], i) => (
      <div key={i} style={{position: 'absolute', left: `${(x as number) * 100 + Math.sin(f / (210 + i * 40) + i) * 6}%`, top: `${(y as number) * 100 + Math.cos(f / (240 + i * 30) + i * 2) * 6}%`, width: `${(s as number) * 100}%`, aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `radial-gradient(circle, ${col}, transparent 68%)`, filter: 'blur(40px)'}} />
    ))}
  </div>
);

// macOS-style cursor: rotates toward travel, grows on hover, shrinks on press
export const Cursor: React.FC<{x: number; y: number; rot?: number; hover?: number; press?: number; s?: number}> = ({x, y, rot = -12, hover = 0, press = 0, s = 1}) => (
  <svg width={34 * s} height={42 * s} viewBox="0 0 17 21" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${(1 + 0.55 * hover) * (1 - 0.15 * press)})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))', zIndex: 50}}>
    <path d="M1.5 1.5 L1.5 17 L5.5 13 L8.4 19.4 L11 18.2 L8.2 12 L14 12 Z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

// arc flood: a curved-edge colour plate that sweeps across (cover then reveal)
export const ArcFlood: React.FC<{f: number; at: number; W: number; H: number; color: string; dir?: 1 | -1; dur?: number}> = ({f, at, W, H, color, dir = 1, dur = 46}) => {
  if (f < at || f > at + dur) return null;
  const kin = ez(f, at, at + dur * 0.5, Easing.inOut(Easing.cubic)), kout = ez(f, at + dur * 0.5, at + dur, Easing.inOut(Easing.cubic));
  const R = H * 1.6; // big circle = curved leading edge
  const lead = lerp(-R * 2, W + R * 0.2, kin), trail = lerp(-R * 2, W + R * 2.2, kout);
  const x0 = dir === 1 ? lead : W - lead, x1 = dir === 1 ? trail : W - trail;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, zIndex: 80}}>
    <defs><mask id={`af${at}`}><rect width={W} height={H} fill="#fff" /><circle cx={dir === 1 ? x1 - R : x1 + R} cy={H / 2} r={R} fill="#000" /></mask></defs>
    <circle cx={dir === 1 ? x0 - R : x0 + R} cy={H / 2} r={R} fill={color} mask={`url(#af${at})`} />
  </svg>;
};

// whole-line masked reveal (headline stack, ref 3)
export const LineIn: React.FC<{text: React.ReactNode; f: number; at: number; size: number; color: string; weight?: number; out?: number; font?: string}> = ({text, f, at, size, color, weight = 600, out, font = FONT.clash}) => {
  const k = ez(f, at, at + 28); const ko = out !== undefined ? ez(f, out, out + 22, Easing.in(Easing.cubic)) : 0;
  return <div style={{overflow: 'hidden', padding: `${size * 0.06}px 0 ${size * 0.1}px`}}><div style={{transform: `translateY(${(1 - k) * 110 - ko * 110}%)`, fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.025em', lineHeight: 1.02, whiteSpace: 'nowrap'}}>{text}</div></div>;
};

// a glass app tile with a monochrome glyph
export const AppTile: React.FC<{k: string; size: number; dark?: boolean; tint?: string}> = ({k, size, dark, tint}) => (
  <div style={{...glass(tint ?? (dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)'), dark), width: size, height: size, borderRadius: size * 0.28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Glyph k={k} size={size * 0.5} color={dark ? '#EDEBF5' : INK} />
  </div>
);
