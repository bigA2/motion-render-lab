// v2 — "Smooth Camera Movement" (Bricks) matched to the reference at 3 fps (E:\reel_study\wl\PdHYC0gqIPA\ref16.jpg).
// What v1 missed: the camera is CLOSE (UI fills the frame), it never stops (slow push + drift + roll inside every
// scene), and scenes are joined by fast whip pans with heavy directional motion blur. Each scene = one keyframed camera.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'FlyFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const E = Easing.bezier(0.45, 0, 0.2, 1), WHIP = Easing.bezier(0.7, 0, 0.3, 1);
const k = (f: number, i: number[], o: number[], e = E) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const T = (s: number, c = '#fff', w = 600): React.CSSProperties => ({fontFamily: FONT, fontSize: s, color: c, fontWeight: w, whiteSpace: 'nowrap'});
const typed = (t: string, f: number, a: number, b: number) => t.slice(0, Math.round(k(f, [a, b], [0, t.length], Easing.linear)));

// camera inside a scene: from/to zoom, x, y, rotate (+ optional 3D tilt)
type Cam = {z: [number, number]; x: [number, number]; y: [number, number]; r: [number, number]; rx?: [number, number]; ry?: [number, number]};
const camStyle = (f: number, d: number, c: Cam): React.CSSProperties => {
  const p = (v: [number, number]) => k(f, [0, d], v, Easing.bezier(0.33, 0, 0.67, 1));
  return {transform: `perspective(1600px) rotateX(${c.rx ? p(c.rx) : 0}deg) rotateY(${c.ry ? p(c.ry) : 0}deg) translate(${p(c.x)}px, ${p(c.y)}px) rotate(${p(c.r)}deg) scale(${p(c.z)})`};
};

const MacWin: React.FC<{children: React.ReactNode; w: number; h: number; light?: boolean}> = ({children, w, h, light = true}) => (
  <div style={{width: w, height: h, borderRadius: 26, background: light ? '#fff' : '#121218', boxShadow: '0 60px 120px rgba(0,0,0,.55)', overflow: 'hidden'}}>
    <div style={{height: 58, display: 'flex', gap: 14, alignItems: 'center', padding: '0 24px', background: light ? '#f1f1f3' : '#1b1b22'}}>{['#ff5f57', '#febc2e', '#28c840'].map((c) => <i key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}</div>
    <div style={{padding: 44}}>{children}</div>
  </div>
);
const Capsule: React.FC<{c: string; w: number; t?: string; o?: boolean}> = ({c, w, t, o}) => (
  <div style={{width: w, height: 190, borderRadius: 120, flex: '0 0 auto', background: o ? '#08080c' : c, border: `10px solid ${c}`, boxShadow: `0 0 60px ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(64, '#fff', 800), letterSpacing: 4}}>{t}</div>
);

type Scene = {d: number; bg: string; cam: Cam; node: (f: number) => React.ReactNode};
const SC: Scene[] = [
  {d: 84, bg: 'linear-gradient(180deg,#6d7690,#1e2232)', cam: {z: [1, 2.1], x: [0, 220], y: [120, 260], r: [0, -2]}, node: (f) => (
    <div style={{transform: `translateY(${k(f, [0, 20], [500, 0])}px)`}}><MacWin w={1300} h={760}>
      <div style={{...T(56, '#222')}}>{typed('So, you want to create', f, 10, 40)}</div>
      <div style={{marginTop: 40, width: 760, padding: 30, borderRadius: 22, background: '#f6f6f8', boxShadow: '0 30px 60px rgba(0,0,0,.18)', opacity: k(f, [44, 54], [0, 1]), transform: `scale(${k(f, [44, 56], [0.9, 1])})`}}>
        <div style={{...T(46, '#333')}}>🔍 {typed('silky smooth animations', f, 50, 76)}</div>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 18, marginTop: 22, width: `${80 - i * 10}%`, borderRadius: 9, background: '#dfe6f5'}} />)}</div>
    </MacWin></div>)},
  {d: 66, bg: 'radial-gradient(90% 90% at 70% 30%, #3b2bd9, #0c0a33)', cam: {z: [1.9, 1], x: [0, -80], y: [0, 40], r: [0, -6], ry: [0, -14]}, node: (f) => (
    <div style={{position: 'relative'}}>
      <div style={{position: 'absolute', left: 820, top: -420, width: 520, height: 340, borderRadius: 20, background: 'linear-gradient(135deg,#ff5e3a,#a3142a)', opacity: k(f, [10, 30], [0, 1])}} />
      <div style={{position: 'absolute', left: -1200, top: -200, width: 420, height: 640, borderRadius: 20, background: 'linear-gradient(135deg,#7a2bff,#2a0e88)', opacity: k(f, [10, 30], [0, 1])}} />
      <div style={{width: 1400, height: 820, borderRadius: 30, background: 'linear-gradient(135deg,#2c1fb8,#0d0960)', boxShadow: '0 0 160px rgba(90,70,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={T(130)}>just like this</span></div>
    </div>)},
  {d: 54, bg: '#050507', cam: {z: [1.6, 1.25], x: [0, 0], y: [-120, 60], r: [-4, 0]}, node: (f) => (
    <div style={{width: 1500}}>
      <div style={{...T(52, '#eee'), textAlign: 'center', borderBottom: '4px solid #1f8bff', width: 220, margin: '0 auto 60px'}}>For you</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 30}}><span style={T(70)}>⌂</span><span style={T(78, '#f2f2f2', 500)}>{typed('Or maybe something…', f, 4, 34)}</span></div>
      <div style={{marginTop: 60, height: 360, borderRadius: 26, background: '#16161c', border: '1px solid #26262e'}} />
    </div>)},
  {d: 42, bg: 'radial-gradient(80% 80% at 50% 30%, #1d1838, #050508)', cam: {z: [1.15, 1.35], x: [60, -60], y: [0, 0], r: [0, 0]}, node: (f) => (
    <div style={{display: 'flex', gap: 30}}>{'a little more subtle'.split(' ').map((w, i) => { const a = k(f, [i * 5, i * 5 + 14], [0, 1]); return <span key={i} style={{...T(110, '#e8e8ff', 500), opacity: a, filter: `blur(${(1 - a) * 14}px)`, transform: `translateX(${(1 - a) * 60}px)`, borderBottom: w === 'subtle' ? `6px solid rgba(124,131,255,${k(f, [26, 36], [0, 1])})` : undefined}}>{w}</span>; })}</div>)},
  {d: 78, bg: '#06060a', cam: {z: [1.45, 1.15], x: [380, -380], y: [-160, 140], r: [-8, -8]}, node: (f) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 46}}>
      {[[['#ff2bd6', 560], ['#19c6ff', 980], ['#ff2bd6', 520, 1]], [['#19c6ff', 600, 1, 'IN THIS VIDEO'], ['#ff2bd6', 760], ['#19c6ff', 600]], [['#ff2bd6', 820], ['#19c6ff', 560, 1, "I'LL SHOW YOU"], ['#ff2bd6', 640]]].map((row, r) => (
        <div key={r} style={{display: 'flex', gap: 46, transform: `translateX(${(r % 2 ? -1 : 1) * k(f, [0, 78], [0, 160], Easing.linear)}px)`}}>
          {row.map((c, j) => <Capsule key={j} c={c[0] as string} w={c[1] as number} o={!!c[2]} t={c[3] ? typed(c[3] as string, f, 14 + r * 14, 34 + r * 14) : undefined} />)}</div>))}
    </div>)},
  {d: 48, bg: '#050507', cam: {z: [1.3, 1.6], x: [0, 0], y: [0, 0], r: [0, 0]}, node: (f) => (
    <div style={{position: 'relative'}}>
      <span style={{...T(150), borderBottom: `8px solid #6a6dff`}}>{typed('Master the', f, 0, 22)}</span>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 60, height: 60, borderRadius: 99, background: '#fff', boxShadow: '0 0 120px 60px #fff', transform: `translate(-50%,-50%) scale(${k(f, [28, 48], [0, 40], Easing.bezier(0.7, 0, 1, 1))})`}} />
    </div>)},
  {d: 60, bg: '#ffffff', cam: {z: [1.25, 1.05], x: [700, -60], y: [0, 0], r: [0, 0]}, node: (f) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 110}}>
      {['31', '1', '2', '3D', '4', '5', '6'].map((n) => n === '3D'
        ? <div key={n} style={{position: 'relative', width: 230, height: 230, borderRadius: 999, background: '#d71920', display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(110, '#111', 800)}}>3D
            <div style={{position: 'absolute', top: 250, padding: '8px 30px', borderRadius: 30, background: '#7fd3d8', ...T(48, '#fff'), opacity: k(f, [30, 40], [0, 1])}}>camera</div></div>
        : <span key={n} style={T(130, '#111', 700)}>{n}</span>)}
    </div>)},
  {d: 66, bg: '#050507', cam: {z: [1.5, 0.75], x: [0, 0], y: [0, 120], r: [0, 0], rx: [0, 18]}, node: (f) => (
    <div style={{position: 'relative', width: 1700, height: 960, borderRadius: 30, background: k(f, [20, 40], [0, 1]) > 0.5 ? '#0f0f14' : 'transparent', border: `1px solid rgba(255,255,255,${k(f, [20, 40], [0, 0.15])})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#1f8bff', borderRadius: 60, padding: '34px 70px', ...T(84), transform: `scale(${k(f, [0, 12], [0.6, 1], Easing.bezier(0.16, 1, 0.3, 1))})`}}>{typed('in After Effects', f, 2, 22)}</div>
      <div style={{position: 'absolute', top: 'calc(50% + 100px)', right: 520, ...T(34, '#888', 500)}}>Delivered</div>
      <div style={{position: 'absolute', bottom: 40, left: 60, right: 60, height: 8, background: '#333', opacity: k(f, [30, 44], [0, 1])}}><div style={{height: '100%', width: '38%', background: '#ff2020'}} /></div>
    </div>)},
];
export const CAMERA_FRAMES = SC.reduce((a, s) => a + s.d, 0);

export const CameraFly: React.FC = () => {
  const f = useCurrentFrame() / 2; // authored at 30 fps, rendered at 60 fps
  let acc = 0, i = 0;
  while (i < SC.length - 1 && f >= acc + SC[i].d) { acc += SC[i].d; i++; }
  const s = SC[i], lf = f - acc;
  // whip: last 6 frames of a scene shoot out, first 6 of the next arrive from the opposite side, with motion blur
  const dir = i % 2 ? -1 : 1;
  const out = k(lf, [s.d - 6, s.d], [0, 1], WHIP), inn = i ? k(lf, [0, 6], [1, 0], WHIP) : 0;
  const shift = (out - inn) * 900 * dir;
  const blur = (out + inn) * 40;
  return (
    <AbsoluteFill style={{background: s.bg, overflow: 'hidden'}}>
      <style>{css}</style>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${-shift}px)`, filter: `blur(${blur}px)`}}>
        <div style={camStyle(lf, s.d, s.cam)}>{s.node(lf)}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
