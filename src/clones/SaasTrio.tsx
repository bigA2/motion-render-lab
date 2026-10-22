// Clones 8–10 (lean, signature sequences only):
// 8 ToggleSaaS  — Tarık "Viral Clean SaaS Animations": blue-white glow stage, glossy toggle-stack app icon, fanned
//                 invoice docs, cycling "For Editors / Creators / …" caption, then a dark macOS dock with icons.
// 9 OrbitSaaS   — TomsProject "Master SaaS Motion Graphics": pink bubble field + "Today", floating lavender UI cards,
//                 navy orbit ring with a dot travelling while words swap (Projects / Feedback / Files / Communication).
// 10 MorphGuide — NaughtyyJuan "Apple Style UI Shape Morphing": calendar widget morph, chat bubble, red pen circle
//                 annotation, "no plugins required / just clean motion", SHAPE MORPH pill -> circle.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'TrioFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const O = Easing.bezier(0.16, 1, 0.3, 1), M = Easing.bezier(0.65, 0, 0.35, 1);
const k = (f: number, i: number[], o: number[], e = O) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const T = (s: number, c = '#111', w = 600): React.CSSProperties => ({fontFamily: FONT, fontSize: s, color: c, fontWeight: w, whiteSpace: 'nowrap'});
const seq = (f: number, ds: number[]) => { let a = 0, i = 0; while (i < ds.length - 1 && f >= a + ds[i]) { a += ds[i]; i++; } return [i, f - a] as const; };

// ---------- 8 ----------
const Toggles: React.FC<{f: number; s?: number}> = ({f, s = 1}) => (
  <div style={{width: 300 * s, height: 300 * s, borderRadius: 70 * s, background: 'linear-gradient(160deg,#ffffff,#dfe5ff)', boxShadow: `0 ${40 * s}px ${80 * s}px rgba(60,80,220,.35), inset 0 2px 0 #fff`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 * s, padding: `0 ${50 * s}px`, boxSizing: 'border-box'}}>
    {[0, 1, 2].map((i) => { const on = (Math.floor(f / 12) + i) % 2 === 0; const x = k(f % 12, [0, 8], on ? [0, 1] : [1, 0]);
      return <div key={i} style={{height: 50 * s, borderRadius: 30 * s, background: i === 1 ? '#c9cff5' : '#3b3fe0', position: 'relative'}}><div style={{position: 'absolute', top: 6 * s, left: 6 * s + x * 140 * s, width: 38 * s, height: 38 * s, borderRadius: 99, background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,.25)'}} /></div>; })}
  </div>
);
const Doc: React.FC<{r: number; x: number}> = ({r, x}) => (
  <div style={{position: 'absolute', left: x, top: -150, width: 220, height: 300, borderRadius: 16, background: '#fff', boxShadow: '0 20px 40px rgba(40,60,200,.18)', transform: `rotate(${r}deg)`, padding: 18, boxSizing: 'border-box'}}>
    <div style={T(26, '#1b1d6b', 700)}>Invoice</div>{[0, 1, 2, 3, 4].map((j) => <div key={j} style={{height: 10, margin: '14px 0', borderRadius: 5, background: j === 0 ? '#3b3fe0' : '#e5e8fb', width: `${90 - j * 12}%`}} />)}
  </div>
);
export const ToggleSaaS: React.FC = () => {
  const f = useCurrentFrame();
  const [i, lf] = seq(f, [150, 90, 60]);
  const words = ['Editors', 'Creators', 'Freelancers', 'Client Projects', 'Viral Videos', 'SaaS Animations', 'Everything'];
  const bg = 'radial-gradient(120% 90% at 50% 110%, #5b63ff 0%, #c9d0ff 45%, #ffffff 75%)';
  return (
    <AbsoluteFill style={{background: i === 1 ? 'radial-gradient(90% 80% at 50% 40%, #16205a, #05061a)' : bg, overflow: 'hidden'}}>
      <style>{css}</style>
      {i === 0 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(lf, [0, 150], [1.15, 1], Easing.linear)})`}}>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 120}}>
          <Toggles f={lf} />
          <div style={{position: 'relative', width: 620, height: 300}}>{[-12, -4, 4, 12].map((r, j) => <div key={j} style={{opacity: k(lf, [6 + j * 4, 16 + j * 4], [0, 1])}}><Doc r={r} x={j * 120} /></div>)}</div>
        </div>
        <div style={{position: 'absolute', bottom: 150, ...T(44, '#1b1d6b', 500)}}>For <b>{words[Math.min(words.length - 1, Math.floor(lf / 20))]}</b></div>
      </AbsoluteFill>}
      {i === 1 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', gap: 22, padding: '22px 30px', borderRadius: 40, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(20px)', transform: `translateY(${k(lf, [0, 16], [200, 0])}px)`}}>
          {['#ffffff', '#f2f2f2', '#9999ff', '#00005b', '#31a8ff', '#ff9a00', '#ea77ff', '#cfcfcf'].map((c, j) => {
            const hop = j === 3 ? -k(lf, [30, 40, 50], [0, 40, 0], M) : 0;
            return <div key={j} style={{width: 110, height: 110, borderRadius: 26, background: c, transform: `translateY(${hop}px) scale(${k(lf, [4 + j * 2, 14 + j * 2], [0, 1])})`, boxShadow: '0 10px 25px rgba(0,0,0,.4)'}} />; })}
        </div></AbsoluteFill>}
      {i === 2 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(lf, [0, 30], [2.4, 1.1])}) rotate(${k(lf, [0, 30], [-14, 0])}deg)`}}><Toggles f={lf} s={1.6} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};

// ---------- 9 ----------
export const OrbitSaaS: React.FC = () => {
  const f = useCurrentFrame();
  const [i, lf] = seq(f, [70, 90, 130]);
  return (
    <AbsoluteFill style={{background: i === 2 ? 'radial-gradient(90% 90% at 40% 50%, #2a2a55, #0b0b1c)' : '#faf7f5', overflow: 'hidden'}}>
      <style>{css}</style>
      {i === 0 && <AbsoluteFill>
        {Array.from({length: 48}).map((_, j) => { const x = (j % 8) * 260 + (Math.floor(j / 8) % 2) * 130, y = Math.floor(j / 8) * 200; const s = k(lf, [j % 12, j % 12 + 20], [0, 1]) * (1 + 0.4 * random(`b${j}`));
          return <div key={j} style={{position: 'absolute', left: x, top: y, width: 170 * s, height: 170 * s, borderRadius: 99, background: 'radial-gradient(circle at 35% 30%, #ffb1e6, #ff3fa4 60%, #c7148a)', opacity: k(lf, [46, 64], [1, 0.15]), transform: `scale(${k(lf, [40, 64], [1, 0.4])})`}} />; })}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{...T(72, '#fff'), padding: '10px 40px', borderRadius: 50, background: '#ff3fa4', transform: `scale(${k(lf, [18, 30], [0, 1])})`}}>Today</div></AbsoluteFill>
      </AbsoluteFill>}
      {i === 1 && <AbsoluteFill style={{background: 'radial-gradient(90% 80% at 50% 50%, #f1efff, #d9d4f5)'}}>
        {[[260, 200, 'Gmail'], [1120, 160, 'Slack'], [300, 640, 'Message'], [1150, 600, 'Project']].map(([x, y, t], j) => (
          <div key={j} style={{position: 'absolute', left: x as number, top: (y as number) + k(lf, [0, 90], [30, -30], Easing.linear) * (j % 2 ? 1 : -1), width: 520, padding: 30, borderRadius: 26, background: '#fff', boxShadow: '0 25px 60px rgba(80,60,180,.18)', opacity: k(lf, [j * 6, j * 6 + 14], [0, 1]), transform: `scale(${k(lf, [j * 6, j * 6 + 14], [0.85, 1])})`}}>
            <div style={T(32, '#333')}>{t}</div>{[0, 1, 2].map((r) => <div key={r} style={{height: 12, marginTop: 16, borderRadius: 6, background: '#ecebf7', width: `${90 - r * 15}%`}} />)}</div>))}
      </AbsoluteFill>}
      {i === 2 && <AbsoluteFill>
        <div style={{position: 'absolute', left: -700, top: -360, width: 1800, height: 1800, borderRadius: 9999, border: '3px solid rgba(140,140,255,.35)'}} />
        {(() => { const words = ['Projects', 'Feedback', 'Files', 'Communication']; const p = lf / 130; const w = Math.min(3, Math.floor(p * 4)); const ang = (-40 + p * 80) * Math.PI / 180;
          const cx = -700 + 900 + Math.cos(ang) * 900, cy = -360 + 900 + Math.sin(ang) * 900;
          return <><div style={{position: 'absolute', left: cx - 22, top: cy - 22, width: 44, height: 44, borderRadius: 99, background: '#8fb2ff', boxShadow: '0 0 30px #8fb2ff'}} />
            <div style={{position: 'absolute', left: cx + 50, top: cy - 40, ...T(72, '#e6e6ff', 500), opacity: k((lf % 32.5), [0, 8], [0, 1]), filter: `blur(${k((lf % 32.5), [0, 8], [8, 0])}px)`}}>{words[w]}</div></>; })()}
      </AbsoluteFill>}
    </AbsoluteFill>
  );
};

// ---------- 10 ----------
export const MorphGuide: React.FC = () => {
  const f = useCurrentFrame();
  const [i, lf] = seq(f, [80, 60, 80, 70, 80]);
  return (
    <AbsoluteFill style={{background: i === 0 ? '#050505' : i === 3 ? '#0b0b0b' : '#f2f2f4', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <style>{css}</style>
      {i === 0 && (() => { const m = k(lf, [30, 55], [0, 1], M);
        return <div style={{width: 640 + 260 * m, height: 300 + 260 * m, borderRadius: 60, background: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 60, padding: 50, boxSizing: 'border-box', transform: `scale(${k(lf, [0, 14], [0.8, 1])})`}}>
          <div style={{width: 200, height: 200, borderRadius: 40, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}><span style={T(28, '#ff3b30')}>Wed</span><span style={T(100, '#111', 300)}>10</span></div>
          <div style={{flex: 1, height: 120 + 200 * m, borderRadius: 30, background: '#2c2c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(40, '#0a84ff')}}>{m > 0.6 ? 'Cutie Studio  ▶' : 'Enter'}</div></div>; })()}
      {i === 1 && <div style={{position: 'relative', background: '#0a84ff', borderRadius: 46, padding: '26px 46px', ...T(52, '#fff', 500), transform: `scale(${k(lf, [0, 12], [0.3, 1])})`, transformOrigin: 'right bottom'}}>{'how is this even made? 😭'.slice(0, Math.round(k(lf, [6, 40], [0, 26], Easing.linear)))}</div>}
      {i === 2 && <div style={{position: 'relative'}}><span style={T(110, '#222', 600)}>simplest way possible</span>
        <svg width={1500} height={420} style={{position: 'absolute', left: -150, top: -150}}><ellipse cx={750} cy={210} rx={720} ry={150} fill="none" stroke="#e01b1b" strokeWidth={9} strokeDasharray={2900} strokeDashoffset={2900 * (1 - k(lf, [8, 40], [0, 1], M))} transform="rotate(-3 750 210)" /></svg></div>}
      {i === 3 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div style={T(90, '#fff', 500)}>no <span style={{color: '#d23cff'}}>plugins</span> required</div>
        <div style={{...T(70, '#bbb', 400), opacity: k(lf, [30, 42], [0, 1])}}>just clean <b style={{color: '#fff'}}>motion</b></div></div>}
      {i === 4 && (() => { const m = k(lf, [24, 50], [0, 1], M);
        return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
          <div style={T(100, '#111', 700)}>SHAPE <span style={{color: '#999'}}>MORPH</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 60}}><div style={{width: 520 - 380 * m, height: 70 + 70 * m, borderRadius: 99, background: '#2f8bff'}} /><div style={{width: 140 * (1 - m), height: 140 * (1 - m), borderRadius: 99, background: '#2f8bff'}} /></div></div>; })()}
    </AbsoluteFill>
  );
};
export const TRIO_FRAMES = {toggle: 300, orbit: 290, morph: 370};
