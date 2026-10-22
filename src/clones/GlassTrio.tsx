// Clones 11–13 (signature sequences):
// 11 LiquidGlass  — Bricks "Animate Like Apple (Liquid Glass UI)": iOS-26 glass pills on a soft grey / blue-wave
//                   wallpaper: notification pill, tab-bar pill whose highlight slides, glass search bar, lock screen
//                   9:41 + widgets, camera mode selector, "Let's get started" bubble.
// 12 ClaudeMotion — Sanji "Claude motion design": "People are making over" kinetic line, glowing particle "$500",
//                   "selling motion design", Claude composer typing a prompt, code stream with orange flare, $ counter.
// 13 Blob3D       — BeTheCut "Mastering 3D": white portrait stage, glossy black 3D blobs drifting, "truth", "NO MAGIC" pill.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'GTrioFont', SERIF = 'GTrioSerif';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}@font-face{font-family:${SERIF};src:url(${staticFile('fonts/InstrumentSerif-400i.woff2')}) format('woff2');}`;
const O = Easing.bezier(0.16, 1, 0.3, 1), M = Easing.bezier(0.65, 0, 0.35, 1);
const k = (f: number, i: number[], o: number[], e = O) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const T = (s: number, c = '#111', w = 600): React.CSSProperties => ({fontFamily: FONT, fontSize: s, color: c, fontWeight: w, whiteSpace: 'nowrap'});
const seq = (f: number, ds: number[]) => { let a = 0, i = 0; while (i < ds.length - 1 && f >= a + ds[i]) { a += ds[i]; i++; } return [i, f - a] as const; };
const typed = (t: string, f: number, a: number, b: number) => t.slice(0, Math.round(k(f, [a, b], [0, t.length], Easing.linear)));
const glass: React.CSSProperties = {background: 'linear-gradient(160deg, rgba(255,255,255,.62), rgba(255,255,255,.22))', border: '1.5px solid rgba(255,255,255,.75)', boxShadow: 'inset 0 2px 1px rgba(255,255,255,.9), inset 0 -8px 20px rgba(255,255,255,.18), 0 20px 50px rgba(0,0,0,.18)', backdropFilter: 'blur(24px) saturate(180%)'};

// ---------- 11 ----------
export const LiquidGlass: React.FC = () => {
  const f = useCurrentFrame();
  const [i, lf] = seq(f, [60, 70, 80, 80, 60]);
  const wave = 'radial-gradient(70% 60% at 30% 70%, #1e4fd8 0%, rgba(30,79,216,0) 60%), radial-gradient(60% 50% at 80% 30%, #7aa7ff 0%, rgba(122,167,255,0) 60%), linear-gradient(160deg, #eef1f8, #c8d3ee)';
  return (
    <AbsoluteFill style={{background: i === 3 ? 'linear-gradient(180deg,#2b3446,#0d1018)' : i === 2 ? wave : 'linear-gradient(180deg,#e9eaee,#cfd2d9)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <style>{css}</style>
      {i === 0 && <div style={{...glass, width: k(lf, [0, 20], [120, 900]), height: 120, borderRadius: 60, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', boxSizing: 'border-box', overflow: 'hidden', transform: `translateY(${k(lf, [0, 20], [-300, 0])}px)`}}>
        <div style={{width: 64, height: 64, borderRadius: 16, background: '#34c759', flex: '0 0 auto'}} /><div style={{opacity: k(lf, [16, 26], [0, 1])}}><div style={T(34)}>Apple</div><div style={T(26, '#555', 500)}>{typed('Liquid Glass is here', lf, 22, 44)}</div></div></div>}
      {i === 1 && (() => { const tabs = ['Home', 'Library', 'Playlists', 'Search']; const sel = Math.min(3, Math.floor(lf / 16)); const x = k(lf % 16, [0, 10], [0, 1], M);
        return <div style={{...glass, borderRadius: 70, padding: 16, display: 'flex', gap: 10, position: 'relative', transform: `scale(${k(lf, [0, 14], [0.8, 1])})`}}>
          <div style={{position: 'absolute', top: 16, left: 16 + (sel - 1 + x) * 230, width: 220, height: 100, borderRadius: 52, background: 'rgba(255,255,255,.85)', boxShadow: '0 6px 18px rgba(0,0,0,.12)', opacity: sel ? 1 : x}} />
          {tabs.map((t, j) => <div key={t} style={{width: 220, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', ...T(26, j === sel ? '#ff2d55' : '#333')}}><span style={{fontSize: 40}}>{['⌂', '▤', '♫', '⌕'][j]}</span>{t}</div>)}</div>; })()}
      {i === 2 && <div style={{display: 'flex', gap: 20, alignItems: 'center', transform: `translateX(${k(lf, [0, 80], [80, -80], Easing.linear)}px)`}}>
        <div style={{...glass, width: 760, height: 110, borderRadius: 55, display: 'flex', alignItems: 'center', padding: '0 40px', ...T(36, '#333', 500)}}>⌕  {typed('Liquid Glass Animation', lf, 8, 40)}</div>
        {['✎', '◐', '⊕', '⋯'].map((c, j) => <div key={c} style={{...glass, width: 110, height: 110, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(40, '#333'), transform: `scale(${k(lf, [10 + j * 4, 22 + j * 4], [0, 1])})`}}>{c}</div>)}</div>}
      {i === 3 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, transform: `scale(${k(lf, [0, 80], [1.1, 0.95], Easing.linear)})`}}>
        <div style={T(30, '#dfe6ff', 500)}>TUE  APR 9</div><div style={{...T(220, '#eef2ff', 300), letterSpacing: -6}}>9:41</div>
        <div style={{display: 'flex', gap: 24}}>{[['San Francisco', '53°'], ['MAKE SURE', '19/30 min'], ['To watch till', 'The end']].map(([a, b], j) => (
          <div key={a} style={{...glass, background: 'linear-gradient(160deg, rgba(255,255,255,.28), rgba(255,255,255,.08))', borderRadius: 34, padding: '24px 30px', width: 280, opacity: k(lf, [10 + j * 6, 22 + j * 6], [0, 1]), transform: `translateY(${k(lf, [10 + j * 6, 22 + j * 6], [40, 0])}px)`}}>
            <div style={T(24, '#cfe0ff', 500)}>{a}</div><div style={T(48, '#fff')}>{b}</div></div>))}</div></div>}
      {i === 4 && <div style={{background: '#0a84ff', borderRadius: 50, padding: '28px 60px', ...T(52, '#fff'), transform: `scale(${k(lf, [0, 14], [0.3, 1])})`}}>Let's get started</div>}
    </AbsoluteFill>
  );
};

// ---------- 12 ----------
export const ClaudeMotion: React.FC = () => {
  const f = useCurrentFrame();
  const [i, lf] = seq(f, [40, 50, 30, 110, 70]);
  const CO = '#d97757';
  return (
    <AbsoluteFill style={{background: i === 0 ? '#fff' : 'radial-gradient(70% 60% at 85% 10%, rgba(217,119,87,.45), rgba(0,0,0,0) 60%), #050505', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <style>{css}</style>
      {i === 0 && <div style={{display: 'flex', gap: 20}}>{['People', 'are', 'making', 'over'].map((w, j) => { const a = k(lf, [j * 6, j * 6 + 10], [0, 1]); return <span key={w} style={{...T(90, '#111', 500), opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>{w}</span>; })}</div>}
      {i === 1 && <div style={{position: 'relative'}}>
        {Array.from({length: 260}).map((_, j) => { const x = random(`x${j}`) * 900 - 450, y = random(`y${j}`) * 300 - 150; const c = k(lf, [0, 26], [1, 0]);
          return <div key={j} style={{position: 'absolute', left: x * (1 + c * 2), top: y * (1 + c * 2), width: 6, height: 6, borderRadius: 9, background: '#9fd0ff', boxShadow: '0 0 10px #4aa8ff', opacity: 0.25 + 0.75 * (1 - c) * random(`o${j}`)}} />; })}
        <div style={{...T(260, 'transparent', 900), WebkitTextStroke: '3px #8fc8ff', textShadow: '0 0 40px #3a9bff', opacity: k(lf, [16, 30], [0, 1])}}>$500</div></div>}
      {i === 2 && <div style={T(80, '#fff', 500)}>selling <span style={{color: '#7fb3ff'}}>motion design</span></div>}
      {i === 3 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, ...T(90, '#f5e6dc', 400), fontFamily: SERIF, opacity: k(lf, [0, 12], [0, 1])}}><span style={{color: CO, fontSize: 100}}>✺</span>Claude</div>
        <div style={{width: 1100, borderRadius: 30, background: '#1b1b1d', border: '1px solid #333', padding: '34px 40px', boxShadow: `0 0 80px rgba(217,119,87,${k(lf, [60, 100], [0, 0.45])})`, opacity: k(lf, [14, 26], [0, 1]), transform: `translateY(${k(lf, [14, 26], [40, 0])}px)`}}>
          <div style={T(40, '#ddd', 500)}>{typed('Make a SaaS launch video', lf, 26, 60)}<span style={{opacity: Math.floor(lf / 8) % 2}}>|</span></div>
          <div style={{marginTop: 40, display: 'flex', justifyContent: 'space-between', ...T(28, '#888', 500)}}><span>+</span><span>Opus ⌄  <b style={{color: CO}}>↑</b></span></div></div>
        <div style={{width: 1100, fontFamily: 'monospace', fontSize: 26, color: CO, lineHeight: 1.4, opacity: k(lf, [64, 74], [0, 1]), height: 140, overflow: 'hidden'}}>
          {['<div class="hud-console-over">', '  <div class="console-row">Scene 1 · glass card</div>', '  <div class="console-row">Scene 2 · camera push</div>', '</div>', 'Claude wrote.'].slice(0, Math.max(0, Math.floor((lf - 64) / 8))).map((l) => <div key={l}>{l}</div>)}</div></div>}
      {i === 4 && <div style={{...T(240, '#fff', 800), textShadow: '0 0 40px rgba(255,255,255,.4)'}}>${Math.round(k(lf, [0, 50], [144, 988], Easing.bezier(0.3, 0, 0.2, 1)))}</div>}
    </AbsoluteFill>
  );
};

// ---------- 13 ----------
export const Blob3D: React.FC = () => {
  const f = useCurrentFrame();
  const blobs = Array.from({length: 9}).map((_, j) => ({x: random(`bx${j}`) * 1080, y: random(`by${j}`) * 1920, s: 60 + random(`bs${j}`) * 160, sp: 0.4 + random(`bp${j}`), r: random(`br${j}`) * 360}));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 40%, #ffffff, #e9e9e9)', overflow: 'hidden'}}>
      <style>{css}</style>
      {blobs.map((b, j) => (
        <div key={j} style={{position: 'absolute', left: b.x + Math.sin(f / 40 + j) * 60, top: b.y - f * b.sp * 2, width: b.s, height: b.s * 0.6, borderRadius: '60% 40% 55% 45%', transform: `rotate(${b.r + f * b.sp}deg)`,
          background: 'radial-gradient(circle at 30% 30%, #6a6a6a, #111 45%, #000)', boxShadow: '0 20px 40px rgba(0,0,0,.25)', filter: `blur(${b.s < 100 ? 3 : 0}px)`}} />))}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 60}}>
        <div style={{fontFamily: SERIF, fontSize: 200, color: '#111', opacity: k(f, [10, 30], [0, 1]), transform: `scale(${k(f, [10, 40], [1.2, 1])})`}}>truth</div>
        <div style={{position: 'relative', width: 200, height: 460, borderRadius: 120, background: 'linear-gradient(90deg,#1a1a1a,#6b6b6b 45%,#202020)', boxShadow: '0 40px 70px rgba(0,0,0,.35)', transform: `rotateZ(${Math.sin(f / 30) * 8}deg) scale(${k(f, [40, 60], [0, 1])})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{...T(34, '#fff', 800), transform: 'rotate(-90deg)', letterSpacing: 4}}>NO MAGIC</span></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const GTRIO_FRAMES = {glass: 350, claude: 300, blob: 180};
