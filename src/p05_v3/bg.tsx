// P05 v3 animated backgrounds, one per part. MIT, our own code.
//  A frostGrain  (hook / problem): steel night, two drifting frost-noise layers, ice specks, grain, vignette
//  B ringHorizon (turn / CTA): a glowing ring with rim duplicates at 96 % / 95 % and a horizon light that breathes
//  C steelScan + slow light sweep (proof): presets-lab iceSteel light side via the kit LivingBg (scanlines + band + sweep)
//  bloom: the white bloom that opens the payoff, then a pale ice field that keeps drifting
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise1} from '../p05_07/kit/curves';
import {Grain, LivingBg, Pal, a} from '../p05_07/kit/Living';

export const ICE = '#8BE9FF', STEEL = '#0A5AE0', INK = '#0B1520', NIGHT = '#060A10', SUB = '#56657A', PAPER = '#F4F7FA';
export const DARK: Pal = {bg: '#060A10', bg2: '#0E1A28', glow: '#8BE9FF', glow2: '#3D6E9E', line: '#22344A', ink: '#F4F7FA', muted: '#9FB0C3', accent: '#8BE9FF', hot: '#E2491A', panel: '#0F1A26', panelLine: '#22344A', dark: true};
export const LIGHT: Pal = {bg: '#DCE3EA', bg2: '#C3CFDB', glow: '#FFFFFF', glow2: '#8BE9FF', line: '#C9D3DD', ink: '#0B1520', muted: '#56657A', accent: '#0A5AE0', hot: '#E2491A', panel: '#F4F7FA', panelLine: '#C9D3DD', dark: false};

export const FrostGrain: React.FC<{push?: number}> = ({push = 0}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 70% at 30% 20%, #13263A 0%, ${NIGHT} 70%)`, overflow: 'hidden'}}>
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      <defs>
        <filter id="frostA" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0026 0.0052" numOctaves={3} seed={7} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.62  0 0 0 0 0.85  0 0 0 1.2 -0.5" /></filter>
        <filter id="frostB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.006" numOctaves={2} seed={19} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.91  0 0 0 0 1  0 0 0 2.2 -1.15" /></filter>
        <filter id="frostC" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={1} seed={3} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.95  0 0 0 0 1  0 0 0 9 -7.6" /></filter>
      </defs>
      <g transform={`translate(${-300 + t * 26} ${-200 - t * 9}) scale(${1 + push * 0.04})`} opacity={0.5}><rect width={w + 700} height={h + 500} filter="url(#frostA)" /></g>
      <g transform={`translate(${-200 - t * 40} ${-150 + t * 14}) rotate(-8)`} opacity={0.28}><rect width={w + 600} height={h + 500} filter="url(#frostB)" /></g>
      <g transform={`translate(${-80 + t * 12} ${-60 - t * 22})`} opacity={0.22 + 0.1 * Math.sin(t * 2.2)}><rect width={w + 200} height={h + 200} filter="url(#frostC)" /></g>
    </svg>
    {/* a cold light that slides along the top edge */}
    <div style={{position: 'absolute', left: -w * 0.3 + ((t * 90) % (w * 1.6)), top: -h * 0.2, width: w * 0.5, height: h * 0.6, background: `radial-gradient(ellipse at 50% 30%, ${a(ICE, 0.10)}, transparent 70%)`, filter: 'blur(30px)'}} />
    <Grain amount={0.06} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 50%, ${a('#000000', 0.55)} 100%)`}} />
  </AbsoluteFill>;
};

/** Glowing ring (+ rim duplicates at 96 % / 95 %) and a horizon light. ring = 0..1 visibility, cy = ring centre (px). */
export const RingHorizon: React.FC<{ring?: number; horizon?: number; cy?: number; r?: number; charge?: number}> = ({ring = 1, horizon = 1, cy, r, charge = 0}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const R = (r ?? Math.min(w, h) * 0.42) * (1 + 0.012 * Math.sin(t * 1.7)); const Y = cy ?? h * 0.47;
  const hy = h * 0.83 - 18 * Math.sin(t * 0.9) - charge * 40;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 80% at 50% 100%, #0B2038 0%, ${NIGHT} 60%)`, overflow: 'hidden'}}>
    {ring > 0 && <div style={{position: 'absolute', left: w / 2 - R, top: Y - R, width: R * 2, height: R * 2, opacity: ring}}>
      <div style={{position: 'absolute', inset: -30, borderRadius: '50%', background: `conic-gradient(from ${f * 1.6}deg, ${a(STEEL, 0)}, ${a(STEEL, 0.65)}, ${a(ICE, 0.75)}, ${a(STEEL, 0)} 55%, ${a(STEEL, 0.35)} 80%, ${a(STEEL, 0)})`, filter: 'blur(26px)', WebkitMask: 'radial-gradient(circle, transparent 62%, #000 66%, #000 72%, transparent 76%)'}} />
      {[1, 0.96, 0.95].map((k, i) => <div key={i} style={{position: 'absolute', left: R * (1 - k), top: R * (1 - k), width: R * 2 * k, height: R * 2 * k, borderRadius: '50%', border: `${i ? 1.5 : 2.5}px solid ${a(ICE, i ? 0.22 : 0.55 + charge * 0.3)}`, boxShadow: i ? undefined : `0 0 ${30 + charge * 50}px ${a(STEEL, 0.6)}, inset 0 0 40px ${a(STEEL, 0.3)}`}} />)}
      <div style={{position: 'absolute', left: R + Math.cos(t * 1.3) * R - 7, top: R + Math.sin(t * 1.3) * R - 7, width: 14, height: 14, borderRadius: 7, background: '#E8FBFF', boxShadow: `0 0 24px 6px ${a(ICE, 0.9)}`}} />
    </div>}
    {horizon > 0 && <>
      <div style={{position: 'absolute', left: -w * 0.5, width: w * 2, top: hy, height: w * 2, borderRadius: '50%', background: `radial-gradient(ellipse 50% 20% at 50% 0%, ${a(STEEL, 0.65 * horizon)} 0%, ${a('#123A6B', 0.45 * horizon)} 35%, ${a(NIGHT, 0)} 70%)`}} />
      <div style={{position: 'absolute', left: -w * 0.5, width: w * 2, top: hy, height: w * 2, borderRadius: '50%', borderTop: `3px solid ${a('#E8FBFF', 0.9 * horizon)}`, boxShadow: `0 -10px 60px ${a(STEEL, 0.8 * horizon)}, 0 -2px 18px ${a(ICE, 0.9 * horizon)}`}} />
    </>}
    <Grain amount={0.05} />
  </AbsoluteFill>;
};

/** steelScan (light) + a slow extra light sweep on top of the kit LivingBg. */
export const SteelScan: React.FC = () => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const s = ((t - 7) % 3.2) / 3.2;
  return <AbsoluteFill>
    <LivingBg p={LIGHT} grid scan particles={22} sweepEvery={3.2} seed={5} />
    <div style={{position: 'absolute', top: -h * 0.3, left: -w * 0.8 + s * w * 2.4, width: w * 0.5, height: h * 1.6, transform: 'rotate(-14deg)', background: `linear-gradient(90deg, transparent, ${a('#FFFFFF', 0.35)}, transparent)`, filter: 'blur(30px)'}} />
  </AbsoluteFill>;
};

/** White bloom out of the proof, then a pale ice field that keeps drifting. k = bloom progress 0..1 */
export const Bloom: React.FC<{k: number}> = ({k}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const R = Math.hypot(w, h) * (0.1 + k * 0.9);
  return <AbsoluteFill style={{background: '#EEF3F8', overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => { const x = (0.25 + i * 0.28 + noise1(t * 0.3, i + 2) * 0.08) * w, y = (0.3 + (i % 2) * 0.4 + noise1(t * 0.25, i + 9) * 0.08) * h, r = Math.max(w, h) * 0.55;
      return <div key={i} style={{position: 'absolute', left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: '50%', background: `radial-gradient(circle, ${a(i === 1 ? STEEL : ICE, i === 1 ? 0.16 : 0.32)} 0%, ${a(ICE, 0)} 68%)`}} />; })}
    <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(0deg, ${a(INK, 0.03)} 0 1px, transparent 1px 4px)`}} />
    <div style={{position: 'absolute', left: w / 2 - R, top: h / 2 - R, width: R * 2, height: R * 2, borderRadius: '50%', background: `radial-gradient(circle, #FFFFFF 0%, #FFFFFF 55%, ${a('#FFFFFF', 0)} 72%)`, opacity: 1 - Math.max(0, (k - 0.7) / 0.3) * 0.75}} />
    <Grain amount={0.035} />
  </AbsoluteFill>;
};
