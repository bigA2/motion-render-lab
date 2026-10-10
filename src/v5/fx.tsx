// v5 editing kit — frame-deterministic ports of free MIT text effects + AE-style finishing.
// Text effects ported from Magic UI (MIT, magicuidesign/magicui: Text 3D Flip, Word Rotate, Number Ticker) and
// Motion Primitives (MIT, ibelick/motion-primitives: TextRoll, TextScramble, TextEffect blur, TextShimmer).
// Finishing: noise camera shake (@remotion/noise), RGB-split glitch, directional whip blur (SVG), flash, punch-zoom,
// light leaks, film grain, vignette, colour grade, and a tracked corner-pin (homography -> CSS matrix3d).
import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (f: number, a: number, b: number, e = Easing.bezier(0.16, 1, 0.3, 1)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});

// ---------------- text ----------------
type TP = {text: string; at?: number; size?: number; color?: string; font?: string; weight?: number; stagger?: number; style?: React.CSSProperties; accent?: string};

// Magic UI "Text 3D Flip": each letter is a box whose front face rotates up into place.
export const Flip3D: React.FC<TP & {outAt?: number}> = ({text, at = 0, size = 120, color = '#fff', font, weight = 800, stagger = 1.2, style, accent, outAt}) => {
  const f = useCurrentFrame();
  return <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', perspective: 900, fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.04em', lineHeight: 1, ...style}}>
    {text.split(' ').map((w, wi, arr) => <span key={wi} style={{display: 'inline-flex', whiteSpace: 'nowrap', marginRight: wi < arr.length - 1 ? size * 0.25 : 0}}>
      {Array.from(w).map((ch, i) => {
        const idx = arr.slice(0, wi).join('').length + i;
        const k = ease(f, at + idx * stagger, at + idx * stagger + 14);
        const o = outAt === undefined ? 0 : ease(f, outAt + idx * stagger * 0.6, outAt + idx * stagger * 0.6 + 10);
        const rot = (1 - k) * 90 - o * 90;
        return <span key={i} style={{display: 'inline-block', transformOrigin: `50% 50% -${size * 0.3}px`, transform: `rotateX(${rot}deg)`, opacity: Math.min(k * 1.5, 1 - o), color: o > 0.5 && accent ? accent : undefined}}>{ch}</span>;
      })}
    </span>)}
  </div>;
};

// Motion Primitives "TextRoll": letters roll up out while the next word rolls up in (stagger per letter).
export const TextRoll: React.FC<Omit<TP, 'text'> & {words: string[]; every: number}> = ({words, every, at = 0, size = 110, color = '#fff', font, weight = 800, style, accent}) => {
  const f = useCurrentFrame() - at;
  const idx = Math.max(0, Math.min(words.length - 1, Math.floor(f / every)));
  const local = f - idx * every;
  const cur = words[idx], prev = idx > 0 ? words[idx - 1] : '';
  const maxLen = Math.max(cur.length, prev.length);
  return <div style={{display: 'inline-flex', perspective: 800, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.05, letterSpacing: '-0.035em', ...style}}>
    {Array.from({length: maxLen}).map((_, i) => {
      const k = idx === 0 ? ease(f, i * 1.2, i * 1.2 + 10) : ease(local, i * 1.2, i * 1.2 + 10);
      return <span key={i} style={{position: 'relative', display: 'inline-block', minWidth: (cur[i] ?? prev[i]) === ' ' ? size * 0.28 : undefined}}>
        <span style={{display: 'inline-block', transform: `rotateX(${(1 - k) * -90}deg)`, transformOrigin: '50% 100%', opacity: k, color: i === cur.length - 1 && accent ? accent : color}}>{cur[i] ?? ''}</span>
        {idx > 0 && <span style={{position: 'absolute', left: 0, top: 0, display: 'inline-block', transform: `rotateX(${k * 90}deg)`, transformOrigin: '50% 0%', opacity: 1 - k, color}}>{prev[i] ?? ''}</span>}
      </span>;
    })}
  </div>;
};

// Motion Primitives "TextScramble": random glyphs resolve left -> right.
export const Scramble: React.FC<TP & {dur?: number}> = ({text, at = 0, dur = 18, size = 64, color = '#fff', font = 'JetBrains Mono, monospace', weight = 600, style}) => {
  const f = useCurrentFrame() - at;
  const set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
  const prog = Math.max(0, f / dur);
  const s = Array.from(text).map((c, i) => c === ' ' || prog * text.length > i ? c : set[Math.floor(random(`${i}-${Math.floor(f / 2)}`) * set.length)]).join('');
  return <div style={{fontFamily: font, fontWeight: weight, fontSize: size, color, opacity: f < 0 ? 0 : 1, whiteSpace: 'pre', ...style}}>{s}</div>;
};

// Motion Primitives "TextEffect" preset blur, per word, with slide-up.
export const BlurWords: React.FC<TP & {em?: string[]; align?: 'center' | 'left'}> = ({text, at = 0, size = 96, color = '#fff', accent = '#7CE7FF', font, weight = 800, stagger = 3, style, em = [], align = 'center'}) => {
  const f = useCurrentFrame();
  return <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.035em', color, ...style}}>
    {text.split(' ').map((w, i) => { const k = ease(f, at + i * stagger, at + i * stagger + 12); const isEm = em.includes(w.replace(/[.,!?]/g, '')); return <span key={i} style={{display: 'inline-block', opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * size * 0.45}px)`, color: isEm ? accent : undefined, fontStyle: isEm ? 'italic' : undefined}}>{w}</span>; })}
  </div>;
};

// Motion Primitives "TextShimmer": a light band sweeps across the text.
export const Shimmer: React.FC<TP & {period?: number}> = ({text, size = 48, color = '#9AA3C7', accent = '#FFFFFF', font, weight = 600, period = 40, style}) => {
  const f = useCurrentFrame();
  const x = ((f % period) / period) * 300 - 100;
  return <div style={{fontFamily: font, fontWeight: weight, fontSize: size, backgroundImage: `linear-gradient(100deg, ${color} ${x - 18}%, ${accent} ${x}%, ${color} ${x + 18}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', ...style}}>{text}</div>;
};

// Typewriter with blinking caret (realistic chat input typing, variable speed).
export const typed = (text: string, f: number, cps = 22, fps = 30) => { const n = Math.max(0, Math.floor((f / fps) * cps + Math.sin(f * 0.7) * 0.6)); return text.slice(0, Math.min(text.length, n)); };
export const Caret: React.FC<{color?: string; h?: number}> = ({color = '#5B6CFF', h = 34}) => { const f = useCurrentFrame(); return <span style={{display: 'inline-block', width: 3, height: h, background: color, marginLeft: 2, verticalAlign: 'middle', opacity: Math.floor(f / 8) % 2 ? 0.15 : 1}} />; };

// Magic UI "Number Ticker": spring count-up with per-digit roll.
export const Ticker: React.FC<{to: number; at?: number; size?: number; color?: string; font?: string; suffix?: string; prefix?: string}> = ({to, at = 0, size = 120, color = '#fff', font, suffix = '', prefix = ''}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const v = spring({frame: f - at, fps, config: {damping: 30, stiffness: 60}}) * to;
  return <span style={{fontFamily: font, fontWeight: 800, fontSize: size, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em'}}>{prefix}{Math.round(v).toLocaleString('en-US')}{suffix}</span>;
};

// IG-native caption box (white text on black rounded box), like "POV: Nobody watches your demo".
export const IGCaption: React.FC<{text: string; top?: number; size?: number; at?: number}> = ({text, top = 210, size = 44, at = 0}) => {
  const f = useCurrentFrame(); const k = ease(f, at, at + 6);
  return <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.92 + 0.08 * k})`}}>
    <div style={{background: 'rgba(0,0,0,0.82)', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: size, padding: '12px 22px', borderRadius: 14, maxWidth: 900, textAlign: 'center', lineHeight: 1.25}}>{text}</div>
  </div>;
};

// ---------------- camera / finishing ----------------
export const useShake = (amp: number, freq = 0.06, seed = 's') => { const f = useCurrentFrame(); return {x: noise2D(seed + 'x', f * freq, 0) * amp, y: noise2D(seed + 'y', 0, f * freq) * amp, r: noise2D(seed + 'r', f * freq, 5) * amp * 0.04}; };
// handheld camera wrapper (always-on micro drift) + optional impact shakes at given frames
export const Handheld: React.FC<{children: React.ReactNode; amp?: number; zoom?: number; hits?: number[]; hitAmp?: number}> = ({children, amp = 6, zoom = 1.04, hits = [], hitAmp = 28}) => {
  const f = useCurrentFrame(); const s = useShake(amp, 0.035, 'hh');
  let hx = 0, hy = 0; for (const h of hits) { const d = f - h; if (d >= 0 && d < 10) { const e = Math.exp(-d / 3); hx += noise2D('hit' + h, d * 0.9, 0) * hitAmp * e; hy += noise2D('hit' + h, 0, d * 0.9) * hitAmp * e; } }
  return <AbsoluteFill style={{transform: `translate(${s.x + hx}px, ${s.y + hy}px) rotate(${s.r}deg) scale(${zoom})`}}>{children}</AbsoluteFill>;
};
// punch zoom on beat
export const punch = (f: number, at: number, amt = 0.08) => { const d = f - at; return d < 0 ? 1 : 1 + amt * Math.exp(-d / 4) * Math.cos(d * 0.5); };

// RGB-split glitch — renders children ONCE (safe with 3D canvases): chromatic drop-shadows + x-jitter + noise bars
export const Glitch: React.FC<{children: React.ReactNode; at: number[]; len?: number; strength?: number}> = ({children, at, len = 6, strength = 1}) => {
  const f = useCurrentFrame();
  const on = at.some((a) => f >= a && f < a + len);
  const r = (k: string) => random(`${k}-${f}`);
  const off = on ? (6 + r('o') * 16) * strength : 0;
  const bars = on ? Array.from({length: 7}, (_, i) => ({y: r('y' + i) * 100, h: 0.6 + r('h' + i) * 4, c: r('c' + i) > 0.5 ? 'rgba(61,224,255,0.35)' : 'rgba(255,40,90,0.3)', dx: (r('d' + i) - 0.5) * 60})) : [];
  return <AbsoluteFill>
    <AbsoluteFill style={on ? {transform: `translateX(${(r('j') - 0.5) * 30 * strength}px) skewX(${(r('k') - 0.5) * 4}deg)`, filter: `drop-shadow(${-off}px 0 0 rgba(255,30,80,0.75)) drop-shadow(${off}px 0 0 rgba(30,230,255,0.75))`} : undefined}>{children}</AbsoluteFill>
    {bars.map((b, i) => <div key={i} style={{position: 'absolute', left: b.dx, right: -b.dx, top: `${b.y}%`, height: `${b.h}%`, background: b.c, mixBlendMode: 'screen'}} />)}
  </AbsoluteFill>;
};

// directional motion blur (whip) — SVG gaussian with x-only deviation
export const Whip: React.FC<{children: React.ReactNode; at: number; dir?: 1 | -1; len?: number; out?: boolean; id: string}> = ({children, at, dir = 1, len = 7, out = false, id}) => {
  const f = useCurrentFrame();
  const k = out ? ease(f, at, at + len, Easing.in(Easing.cubic)) : 1 - ease(f, at, at + len, Easing.out(Easing.cubic));
  const blur = k * 60;
  return <AbsoluteFill style={{transform: `translateX(${dir * (out ? 1 : -1) * k * 900}px) scale(${1 + k * 0.08})`, filter: blur > 0.5 ? `url(#wb-${id})` : undefined}}>
    {children}
    <svg width="0" height="0" style={{position: 'absolute'}}><filter id={`wb-${id}`} x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter></svg>
  </AbsoluteFill>;
};

export const Flash: React.FC<{at: number; len?: number; color?: string; peak?: number}> = ({at, len = 8, color = '#fff', peak = 0.85}) => { const f = useCurrentFrame(); const d = f - at; if (d < 0 || d > len) return null; return <AbsoluteFill style={{background: color, opacity: peak * Math.exp(-d / (len / 3)), mixBlendMode: 'screen', pointerEvents: 'none'}} />; };

export const LightLeak: React.FC<{color?: string; color2?: string; strength?: number; seed?: string}> = ({color = '#FF9A3C', color2 = '#FF3C8A', strength = 0.5, seed = 'lk'}) => {
  const f = useCurrentFrame(); const x = 50 + noise2D(seed, f * 0.01, 0) * 60, y = 30 + noise2D(seed, 0, f * 0.01) * 40;
  return <AbsoluteFill style={{background: `radial-gradient(45% 35% at ${x}% ${y}%, ${color}, transparent 70%), radial-gradient(35% 30% at ${100 - x}% ${100 - y}%, ${color2}, transparent 70%)`, mixBlendMode: 'screen', opacity: strength, pointerEvents: 'none'}} />;
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
    <svg width="100%" height="100%"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#grain)" /></svg>
  </AbsoluteFill>;
};
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(120% 85% at 50% 45%, transparent 55%, rgba(0,0,0,${strength}) 100%)`}} />;

// colour grade presets (lift/gamma/gain-ish via CSS filters + tint overlays) — one per video palette
export const GRADES = {
  nightCyan: {filter: 'contrast(1.08) saturate(1.12) brightness(1.02)', shadow: 'rgba(20,24,80,0.28)', high: 'rgba(255,190,120,0.10)'},
  tealOrange: {filter: 'contrast(1.1) saturate(1.15)', shadow: 'rgba(0,70,90,0.25)', high: 'rgba(255,150,60,0.12)'},
  pastel: {filter: 'contrast(0.96) saturate(1.05) brightness(1.04)', shadow: 'rgba(120,80,160,0.12)', high: 'rgba(255,200,220,0.12)'},
} as const;
export const Grade: React.FC<{children: React.ReactNode; g: keyof typeof GRADES}> = ({children, g}) => {
  const G = GRADES[g];
  return <AbsoluteFill style={{filter: G.filter}}>{children}
    <AbsoluteFill style={{background: G.shadow, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: G.high, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />
  </AbsoluteFill>;
};

// ---------------- tracked corner pin ----------------
// homography mapping the unit rect (0,0)-(w,h) onto 4 points -> CSS matrix3d
export const cornerPin = (w: number, h: number, q: number[][]) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q; // TL TR BR BL
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, ff = y0;
  // scale for w,h
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, ff, 0, 1];
  return `matrix3d(${m.join(',')})`;
};
export const Pinned: React.FC<{w: number; h: number; corners: number[][]; children: React.ReactNode; glow?: string}> = ({w, h, corners, children, glow}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: cornerPin(w, h, corners), boxShadow: glow ? `0 0 120px 30px ${glow}` : undefined}}>{children}</div>
);

// spring helper
export const sp = (f: number, at: number, fps = 30, damping = 14, stiffness = 160) => spring({frame: f - at, fps, config: {damping, stiffness}});
