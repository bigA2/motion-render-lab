// Living backgrounds + animated corners/edges/borders. Everything drifts slowly, parallaxes with the camera and
// is seeded (repeatable). MIT, our own code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camera} from './camera';
import {noise1, rnd} from './curves';

export type Pal = {bg: string; bg2: string; glow: string; glow2: string; line: string; ink: string; muted: string; accent: string; hot: string; panel: string; panelLine: string; dark: boolean};
export const a = (hex: string, al: number) => hex + Math.round(Math.max(0, Math.min(1, al)) * 255).toString(16).padStart(2, '0');

/** Background stack: base gradient, drifting glow blobs (parallax 0.15), slow grid (0.35), depth particles
 *  (0.2-0.9), periodic light sweep, grain, vignette. */
export const LivingBg: React.FC<{p: Pal; cam?: Camera; grid?: boolean; particles?: number; sweepEvery?: number; seed?: number; rings?: boolean}> = ({p, cam, grid = true, particles = 34, sweepEvery = 4.2, seed = 3, rings = false}) => {
  const f = useCurrentFrame(); const {width: w, height: h, fps} = useVideoConfig(); const t = f / fps;
  const c = cam?.get(f) ?? {x: 0, y: 0, zoom: 1, roll: 0};
  const px = (k: number) => -c.x * k, py = (k: number) => -c.y * k;
  const blobs = [
    {x: 0.18, y: 0.2, r: 0.75, col: p.glow, o: p.dark ? 0.55 : 0.5},
    {x: 0.85, y: 0.7, r: 0.65, col: p.glow2, o: p.dark ? 0.45 : 0.4},
    {x: 0.5, y: 1.05, r: 0.6, col: p.accent, o: p.dark ? 0.22 : 0.16},
  ];
  const sweepT = (t % sweepEvery) / 1.6; // 1.6 s sweep, then rest
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${p.bg} 0%, ${p.bg2} 100%)`, overflow: 'hidden'}}>
      {blobs.map((b, i) => {
        const bx = (b.x + noise1(t * 0.18, seed + i) * 0.12) * w + px(0.12) % w, by = (b.y + noise1(t * 0.15, seed + i + 9) * 0.1) * h + py(0.12) % h;
        const R = b.r * Math.max(w, h);
        return <div key={i} style={{position: 'absolute', left: bx - R / 2, top: by - R / 2, width: R, height: R, borderRadius: '50%', background: `radial-gradient(circle, ${a(b.col, b.o)} 0%, ${a(b.col, 0)} 68%)`, transform: `scale(${1 + noise1(t * 0.3, i + seed) * 0.08}) rotate(${c.roll * 0.3}deg)`}} />;
      })}
      {rings && [0, 1, 2, 3].map((i) => {
        const R = (0.55 + i * 0.32) * w + Math.sin(t * 0.6 + i) * 14;
        return <div key={`r${i}`} style={{position: 'absolute', left: w * 0.5 - R / 2 + px(0.2 + i * 0.05), top: h * 0.42 - R / 2 + py(0.2 + i * 0.05), width: R, height: R, borderRadius: '50%', border: `${1.5 + (3 - i) * 0.5}px solid ${a(p.accent, 0.22 - i * 0.04)}`, boxShadow: `0 0 40px ${a(p.accent, 0.08)}`, transform: `rotate(${t * (6 + i * 3)}deg)`}}>
          <div style={{position: 'absolute', left: '50%', top: -5, width: 10, height: 10, borderRadius: 5, background: p.accent, boxShadow: `0 0 18px ${p.accent}`, opacity: 0.7}} />
        </div>;
      })}
      {grid && <AbsoluteFill style={{backgroundImage: `linear-gradient(${a(p.line, 0.5)} 1px, transparent 1px), linear-gradient(90deg, ${a(p.line, 0.5)} 1px, transparent 1px)`, backgroundSize: '90px 90px', backgroundPosition: `${px(0.35) + t * 4}px ${py(0.35) + t * 2}px`, maskImage: 'radial-gradient(ellipse 75% 60% at 50% 45%, #000 10%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 45%, #000 10%, transparent 80%)', opacity: 0.55}} />}
      {Array.from({length: particles}, (_, i) => {
        const d = 0.2 + rnd(seed * 13 + i) * 0.7; // depth factor
        const sx = rnd(i * 3.1 + seed) * w * 1.4 - w * 0.2, sy = rnd(i * 5.7 + seed) * h * 1.4 - h * 0.2;
        const x = ((sx + px(d) + noise1(t * 0.2, i) * 30 + t * 6 * d) % (w * 1.4) + w * 1.4) % (w * 1.4) - w * 0.2;
        const y = ((sy + py(d) - t * 10 * d) % (h * 1.4) + h * 1.4) % (h * 1.4) - h * 0.2;
        const s = 2 + d * 6; const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1 + d) + i));
        return <div key={`p${i}`} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: i % 5 === 0 ? p.accent : p.ink, opacity: (p.dark ? 0.35 : 0.18) * tw * d, filter: d < 0.45 ? 'blur(2px)' : undefined}} />;
      })}
      {sweepT <= 1 && <div style={{position: 'absolute', top: -h * 0.25, left: -w * 0.6 + sweepT * w * 2.2, width: w * 0.35, height: h * 1.5, transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, ${a(p.dark ? '#ffffff' : '#ffffff', p.dark ? 0.06 : 0.22)}, transparent)`, filter: 'blur(20px)'}} />}
      <Grain amount={p.dark ? 0.06 : 0.045} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, ${a(p.dark ? '#000000' : p.bg2, p.dark ? 0.5 : 0.35)} 100%)`}} />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{amount?: number}> = ({amount = 0.05}) => {
  const f = useCurrentFrame(); const seed = Math.floor(f / 2) % 30;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: amount * 5}}>
      <svg width="100%" height="100%"><filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter={`url(#gr${seed})`} opacity={0.55} /></svg>
    </AbsoluteFill>
  );
};

/** Animated frame accents: corner brackets that breathe, a glint that runs along each bracket, edge light lines. */
export const Corners: React.FC<{p: Pal; inset?: number; len?: number; label?: string[]}> = ({p, inset = 44, len = 70, label}) => {
  const f = useCurrentFrame(); const {width: w, height: h, fps} = useVideoConfig(); const t = f / fps;
  const pts = [[inset, inset, 1, 1], [w - inset, inset, -1, 1], [w - inset, h - inset, -1, -1], [inset, h - inset, 1, -1]];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {pts.map(([x, y, sx, sy], i) => {
        const L = len * (0.85 + 0.15 * Math.sin(t * 1.3 + i));
        const g = ((t * 0.5 + i * 0.25) % 1); // glint position 0..1 along the L
        return <React.Fragment key={i}>
          <div style={{position: 'absolute', left: sx > 0 ? x : x - L, top: y - 1, width: L, height: 2, background: `linear-gradient(${sx > 0 ? 90 : 270}deg, ${a(p.ink, 0.55)}, ${a(p.ink, 0)})`}} />
          <div style={{position: 'absolute', left: x - 1, top: sy > 0 ? y : y - L, width: 2, height: L, background: `linear-gradient(${sy > 0 ? 180 : 0}deg, ${a(p.ink, 0.55)}, ${a(p.ink, 0)})`}} />
          <div style={{position: 'absolute', left: x + sx * g * L - 5, top: y - 5, width: 10, height: 10, borderRadius: 5, background: p.accent, boxShadow: `0 0 16px 4px ${a(p.accent, 0.7)}`, opacity: Math.sin(g * Math.PI) * 0.9}} />
        </React.Fragment>;
      })}
      {label && <div style={{position: 'absolute', left: inset + 18, top: inset + 14, font: `600 22px 'JetBrains Mono', monospace`, letterSpacing: 2, color: a(p.ink, 0.5)}}>{label[0]}</div>}
      {label && label[1] && <div style={{position: 'absolute', right: inset + 18, bottom: inset + 12, font: `600 22px 'JetBrains Mono', monospace`, letterSpacing: 2, color: a(p.ink, 0.5)}}>{label[1].replace('{t}', `00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % fps).padStart(2, '0')}`)}</div>}
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 2, background: `linear-gradient(90deg, transparent ${((t * 18) % 140) - 40}%, ${a(p.accent, 0.8)} ${((t * 18) % 140) - 30}%, transparent ${((t * 18) % 140) - 20}%)`}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: 2, background: `linear-gradient(270deg, transparent ${((t * 15 + 50) % 140) - 40}%, ${a(p.accent, 0.8)} ${((t * 15 + 50) % 140) - 30}%, transparent ${((t * 15 + 50) % 140) - 20}%)`}} />
    </AbsoluteFill>
  );
};

/** Animated card border: a light arc runs round the card edge (conic gradient through a border mask). */
export const LiveBorder: React.FC<{color: string; r: number; speed?: number; width?: number; o?: number; phase?: number}> = ({color, r, speed = 50, width = 2, o = 1, phase = 0}) => {
  const f = useCurrentFrame(); const ang = (f / 60) * speed + phase;
  return <div style={{position: 'absolute', inset: 0, borderRadius: r, padding: width, opacity: o, pointerEvents: 'none',
    background: `conic-gradient(from ${ang}deg, transparent 0deg, ${color} 40deg, transparent 90deg, transparent 200deg, ${a(color.slice(0, 7), 0.5)} 230deg, transparent 270deg)`,
    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude'} as React.CSSProperties} />;
};
