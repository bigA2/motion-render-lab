// 1:1 recreation of "Smooth Camera Movement in After Effects" (Bricks): a 3D world of UI "stations" and ONE camera
// that flies station to station (position + Z + slight Y-rotation) with AE-style bezier keyframes, velocity-based
// motion blur and depth-of-field blur on everything that isn't the current station.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'FlyFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const CAM = Easing.bezier(0.7, 0, 0.2, 1); // strong ease in-out = "silky" camera
const T: React.CSSProperties = {fontFamily: FONT, whiteSpace: 'nowrap', color: '#fff'};

type Station = {x: number; y: number; z: number; ry: number; at: number; node: React.ReactNode};
const Win: React.FC<{children: React.ReactNode; w?: number; h?: number; light?: boolean}> = ({children, w = 900, h = 560, light}) => (
  <div style={{width: w, height: h, borderRadius: 22, background: light ? '#fff' : 'rgba(20,20,30,.92)', boxShadow: '0 40px 90px rgba(0,0,0,.5)', overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)'}}>
    <div style={{height: 44, display: 'flex', gap: 10, alignItems: 'center', padding: '0 18px', background: light ? '#f2f2f4' : 'rgba(255,255,255,.06)'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <i key={c} style={{width: 14, height: 14, borderRadius: 9, background: c}} />)}
    </div>
    <div style={{padding: 34}}>{children}</div>
  </div>
);
const Capsule: React.FC<{c: string; w: number; t?: string; outline?: boolean}> = ({c, w, t, outline}) => (
  <div style={{width: w, height: 120, borderRadius: 70, background: outline ? 'transparent' : c, border: `6px solid ${c}`, boxShadow: `0 0 40px ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T, fontSize: 42, letterSpacing: 2}}>{t}</div>
);

const ST: Station[] = [
  {at: 0, x: 0, y: 0, z: 0, ry: 0, node: <Win light><div style={{fontFamily: FONT, fontSize: 40, color: '#222'}}>🔍 silky smooth animations</div><div style={{marginTop: 26, height: 14, width: 520, background: '#e8e8ee', borderRadius: 8}} /><div style={{marginTop: 16, height: 14, width: 420, background: '#e8e8ee', borderRadius: 8}} /></Win>},
  {at: 45, x: 1500, y: -200, z: -600, ry: -18, node: <div style={{width: 1100, height: 620, borderRadius: 30, background: 'radial-gradient(80% 80% at 70% 20%, #4a2bd8, #120a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 120px rgba(80,60,255,.5)'}}><span style={{...T, fontSize: 110}}>just like this</span></div>},
  {at: 95, x: 2900, y: 300, z: 0, ry: 0, node: <span style={{...T, fontSize: 96, color: '#cfd2ff'}}>a little more subtle</span>},
  {at: 140, x: 4300, y: -100, z: -900, ry: 16, node: <div style={{display: 'flex', flexDirection: 'column', gap: 30}}><div style={{display: 'flex', gap: 30}}><Capsule c="#ff2bd6" w={420} /><Capsule c="#19c6ff" w={620} /></div><div style={{display: 'flex', gap: 30}}><Capsule c="#ff2bd6" w={620} t="IN THIS VIDEO" outline /><Capsule c="#19c6ff" w={420} /></div><div style={{display: 'flex', gap: 30}}><Capsule c="#19c6ff" w={500} /><Capsule c="#ff2bd6" w={540} t="I'LL SHOW YOU" outline /></div></div>},
  {at: 195, x: 5800, y: 200, z: 0, ry: 0, node: <div style={{width: 1000, height: 360, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontFamily: FONT, fontSize: 90, color: '#111'}}>{['1', '2', '3D', '4', '5'].map((n) => <span key={n} style={n === '3D' ? {background: '#d71920', color: '#111', width: 170, height: 170, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center'} : {}}>{n}</span>)}</div>},
  {at: 245, x: 7200, y: -250, z: -500, ry: -12, node: <div style={{background: '#1f8bff', borderRadius: 50, padding: '34px 70px', ...T, fontSize: 76}}>smooth movements</div>},
  {at: 295, x: 8600, y: 150, z: 0, ry: 0, node: <div style={{display: 'flex', gap: 40, padding: 30, borderRadius: 40, background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(20px)'}}>{['#2b8cff', '#ffffff', '#ffb000', '#36c4ff'].map((c, i) => <div key={i} style={{width: 170, height: 170, borderRadius: 40, background: c, boxShadow: '0 20px 40px rgba(0,0,0,.35)'}} />)}</div>},
  {at: 345, x: 10000, y: 0, z: 0, ry: 0, node: <span style={{...T, fontSize: 120}}>Let's get started</span>},
];

export const CameraFly: React.FC = () => {
  const f = useCurrentFrame();
  const cam = (key: 'x' | 'y' | 'z' | 'ry', fr: number) => {
    const at = ST.map((s) => s.at);
    const MOVE = 26; // frames of camera travel before each station's time
    const inp: number[] = [], out: number[] = [];
    ST.forEach((s, i) => { if (i) { inp.push(s.at - MOVE); out.push(ST[i - 1][key]); } inp.push(s.at); out.push(s[key]); });
    return interpolate(fr, inp, out, {easing: CAM, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };
  const cx = cam('x', f), cy = cam('y', f), cz = cam('z', f), cry = cam('ry', f);
  const speed = Math.hypot(cam('x', f + 1) - cx, cam('y', f + 1) - cy, cam('z', f + 1) - cz);
  const mBlur = Math.min(14, speed / 22); // velocity-based motion blur (AE motion blur stand-in)
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 40% 30%, #1b1640 0%, #08070f 60%, #030306 100%)', perspective: 1600, overflow: 'hidden'}}>
      <style>{css}</style>
      <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `rotateY(${-cry}deg) translate3d(${-cx}px, ${-cy}px, ${-cz}px)`, filter: `blur(${mBlur}px)`}}>
        {ST.map((s, i) => {
          const d = Math.hypot(s.x - cx, s.y - cy, (s.z - cz) * 0.6);
          return (
            <div key={i} style={{position: 'absolute', left: 960, top: 540, transform: `translate3d(-50%, -50%, 0) translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotateY(${s.ry}deg)`, filter: `blur(${Math.min(16, d / 140)}px)`, opacity: Math.max(0.25, 1 - d / 3200)}}>
              {s.node}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
