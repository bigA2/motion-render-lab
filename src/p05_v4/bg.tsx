// P05 v4 backgrounds — one per part, each clearly moving and tied to the camera. MIT, our own code.
//  A GridFly     hook: perspective grid floor flying toward the camera + two drifting light bands
//  B DotWorld    manual world: dot grid at 0.35x camera parallax + drifting light leaks, warms to amber (late night)
//  C MeshFlow    turn: four big blurred blobs orbiting (mesh-gradient flow) + a slow ring glow
//  D Particles   product: particle field streaming along the flow direction
//  E Leaks       Notion beat: ice/white light-leak bands sweeping diagonally across
//  F Refract     Slack beat: blurred vertical glass streaks sliding at two depths (refraction)
//  G Horizon     payoff/end: a planet horizon rising + a breathing vertical beam + rising specks
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise1, rnd} from '../p05_07/kit/curves';
import {a} from '../p05_07/kit/Living';

export const ICE = '#8BE9FF', STEEL = '#0A5AE0', NIGHT = '#060A10', NAVY = '#0B1626', PAPER = '#F4F7FA', INK = '#0B1520', MUTED = '#9FB0C3', AMBER = '#FFB547';

const Abs: React.FC<{style: React.CSSProperties}> = ({style}) => <div style={{position: 'absolute', ...style}} />;

export const GridFly: React.FC<{speed?: number}> = ({speed = 1}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const scroll = (t * 700 * speed) % 120;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 38%, #12243A 0%, ${NIGHT} 72%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -w, width: w * 3, top: h * 0.52, height: h * 1.2, transform: 'perspective(600px) rotateX(72deg)', transformOrigin: '50% 0%',
      backgroundImage: `linear-gradient(${a(ICE, 0.35)} 2px, transparent 2px), linear-gradient(90deg, ${a(ICE, 0.25)} 2px, transparent 2px)`, backgroundSize: '120px 120px', backgroundPosition: `0px ${scroll}px`,
      maskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 100%)'}} />
    <div style={{position: 'absolute', left: -w, width: w * 3, bottom: h * 0.52, height: h * 1.2, transform: 'perspective(600px) rotateX(-72deg)', transformOrigin: '50% 100%', opacity: 0.45,
      backgroundImage: `linear-gradient(${a(ICE, 0.3)} 2px, transparent 2px), linear-gradient(90deg, ${a(ICE, 0.2)} 2px, transparent 2px)`, backgroundSize: '120px 120px', backgroundPosition: `0px ${-scroll}px`,
      maskImage: 'linear-gradient(0deg, transparent 0%, #000 40%)', WebkitMaskImage: 'linear-gradient(0deg, transparent 0%, #000 40%)'}} />
    <Abs style={{left: 0, right: 0, top: h * 0.5 - 2, height: 4, background: a(ICE, 0.55), filter: 'blur(6px)'}} />
    {[0, 1].map((i) => <Abs key={i} style={{left: -w * 0.5 + ((t * (120 + i * 70) + i * 500) % (w * 2)), top: -h * 0.2, width: w * 0.22, height: h * 1.4, transform: `rotate(${18 + i * 9}deg)`,
      background: `linear-gradient(90deg, transparent, ${a(i ? STEEL : ICE, 0.16)}, transparent)`, filter: 'blur(30px)'}} />)}
  </AbsoluteFill>;
};

export const DotWorld: React.FC<{cx: number; cy: number; z: number; warm: number}> = ({cx, cy, z, warm}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const g = 70 * Math.max(0.35, Math.min(1.4, z));
  return <AbsoluteFill style={{background: `linear-gradient(160deg, #0D1B2B 0%, ${NIGHT} 100%)`, overflow: 'hidden'}}>
    {[{x: 0.2, y: 0.25, c: STEEL}, {x: 0.8, y: 0.7, c: ICE}, {x: 0.5, y: 0.95, c: AMBER}].map((b, i) => {
      const R = Math.max(w, h) * (0.8 + 0.1 * i); const bx = (b.x + noise1(t * 0.35, i) * 0.18) * w - (cx * 0.08) % w, by = (b.y + noise1(t * 0.3, i + 5) * 0.14) * h - (cy * 0.08) % h;
      const o = i === 2 ? 0.05 + warm * 0.4 : (0.32 - warm * 0.12);
      return <Abs key={i} style={{left: bx - R / 2, top: by - R / 2, width: R, height: R, borderRadius: '50%', background: `radial-gradient(circle, ${a(b.c, o)} 0%, ${a(b.c, 0)} 66%)`}} />;
    })}
    <AbsoluteFill style={{backgroundImage: `radial-gradient(${a(ICE, 0.45)} 2px, transparent 2.6px)`, backgroundSize: `${g}px ${g}px`, backgroundPosition: `${-cx * z * 0.35}px ${-cy * z * 0.35}px`, opacity: 0.55,
      maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 85%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 85%)'}} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 40%, ${a(AMBER, warm * 0.18)} 100%)`}} />
  </AbsoluteFill>;
};

export const MeshFlow: React.FC<{ring?: number}> = ({ring = 0}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const R = Math.max(w, h) * 0.75;
  return <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
    {[STEEL, ICE, '#1B3C8F', '#3EE6C1'].map((c, i) => {
      const ang = t * 0.45 + i * Math.PI / 2; const x = w / 2 + Math.cos(ang) * w * 0.32, y = h / 2 + Math.sin(ang * 1.2) * h * 0.26;
      return <Abs key={i} style={{left: x - R / 2, top: y - R / 2, width: R, height: R, borderRadius: '50%', background: `radial-gradient(circle, ${a(c, i === 3 ? 0.18 : 0.42)} 0%, ${a(c, 0)} 65%)`}} />;
    })}
    <Abs style={{left: w / 2 - h * 0.45, top: h / 2 - h * 0.45, width: h * 0.9, height: h * 0.9, borderRadius: '50%', border: `2px solid ${a(ICE, 0.18 * ring)}`, boxShadow: `0 0 80px ${a(ICE, 0.12 * ring)}, inset 0 0 80px ${a(ICE, 0.08 * ring)}`, transform: `rotate(${t * 20}deg) scale(${1 + 0.02 * Math.sin(t * 2)})`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(3,6,12,.7) 100%)'}} />
  </AbsoluteFill>;
};

export const Particles: React.FC<{dir?: [number, number]; n?: number; cx?: number; cy?: number}> = ({dir = [1, 0], n = 70, cx = 0, cy = 0}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 70% at 50% 45%, #0F2238 0%, ${NIGHT} 75%)`, overflow: 'hidden'}}>
    {Array.from({length: n}, (_, i) => {
      const d = 0.3 + rnd(i * 7.7) * 0.7; const sp = 300 * d;
      const W2 = w + 200, H2 = h + 200;
      const x = (((rnd(i * 3.3) * W2 + dir[0] * sp * t - cx * d * 0.3) % W2) + W2) % W2 - 100;
      const y = (((rnd(i * 5.1) * H2 + dir[1] * sp * t - cy * d * 0.3) % H2) + H2) % H2 - 100;
      const L = 30 * d + 8, ang = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
      return <Abs key={i} style={{left: x, top: y, width: L, height: 2 + d * 2, borderRadius: 4, transform: `rotate(${ang}deg)`, background: `linear-gradient(90deg, transparent, ${a(i % 5 ? ICE : STEEL, 0.25 + d * 0.5)})`}} />;
    })}
  </AbsoluteFill>;
};

export const Leaks: React.FC = () => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  return <AbsoluteFill style={{background: `linear-gradient(150deg, #10233A 0%, ${NIGHT} 80%)`, overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => { const p = ((t + i * 0.27) / 0.8) % 1.6; const x = -w * 0.6 + p * w * 1.6;
      return <Abs key={i} style={{left: x, top: -h * 0.3, width: w * (0.18 + i * 0.07), height: h * 1.6, transform: 'rotate(24deg)', background: `linear-gradient(90deg, transparent, ${a(i === 1 ? '#FFFFFF' : ICE, 0.22)}, transparent)`, filter: 'blur(24px)'}} />; })}
    <Abs style={{left: -w * 0.2, top: -h * 0.2, width: w * 0.9, height: w * 0.9, borderRadius: '50%', background: `radial-gradient(circle, ${a(STEEL, 0.35)}, transparent 65%)`, transform: `translate(${Math.sin(t) * 60}px, ${Math.cos(t * 0.8) * 40}px)`}} />
  </AbsoluteFill>;
};

export const Refract: React.FC = () => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  return <AbsoluteFill style={{background: `linear-gradient(170deg, #12213A 0%, #070B14 100%)`, overflow: 'hidden'}}>
    {[0, 1].map((L) => <AbsoluteFill key={L} style={{backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, ${a(L ? STEEL : ICE, L ? 0.2 : 0.12)} ${30 + L * 30}px, transparent ${90 + L * 70}px)`,
      backgroundPosition: `${(L ? -1 : 1) * t * (120 + L * 80)}px 0px`, filter: `blur(${10 + L * 14}px)`, transform: `skewX(${-8 + L * 4}deg) scale(1.3)`}} />)}
    <Abs style={{left: w * 0.15 + Math.sin(t * 0.9) * w * 0.25, top: h * 0.1, width: w * 0.7, height: w * 0.7, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${a('#FFFFFF', 0.12)}, transparent 60%)`, filter: 'blur(10px)'}} />
  </AbsoluteFill>;
};

export const Horizon: React.FC<{rise: number; beam?: number}> = ({rise, beam = 1}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig(); const t = f / 60;
  const R = w * 2.2; const top = h * (1.02 - 0.24 * rise) + Math.sin(t * 1.4) * 6;
  const br = 0.55 + 0.25 * Math.sin(t * 3);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 70%, #0E2238 0%, ${NIGHT} 70%)`, overflow: 'hidden'}}>
    <Abs style={{left: w / 2 - w * 0.17, top: -h * 0.1, width: w * 0.34, height: top + h * 0.1, background: `linear-gradient(180deg, transparent, ${a(ICE, 0.22 * beam * br)} 80%, ${a('#FFFFFF', 0.35 * beam * br)})`, filter: 'blur(28px)'}} />
    <Abs style={{left: w / 2 - R / 2, top, width: R, height: R, borderRadius: '50%', background: `radial-gradient(circle at 50% 0%, #10304E 0%, ${NIGHT} 30%)`, boxShadow: `0 -6px 30px ${a(ICE, 0.9)}, 0 -30px 120px ${a(ICE, 0.45)}, inset 0 8px 30px ${a(ICE, 0.5)}`}} />
    {Array.from({length: 30}, (_, i) => { const x = rnd(i * 2.3) * w, y = (top - ((t * 60 * (0.4 + rnd(i) * 0.6) + rnd(i * 9) * h) % h)); return <Abs key={i} style={{left: x, top: y, width: 3, height: 3, borderRadius: 2, background: ICE, opacity: 0.5 * rnd(i * 4.4)}} />; })}
  </AbsoluteFill>;
};
