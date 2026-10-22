// 1:1 recreation of "Learn Apple Style Motion Graphics" (Bart_VFX): ONE container that morphs (size, radius, colour)
// from state to state at 60 fps with a smooth in-out curve, while its content cross-fades. That's the whole trick.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'MorphFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const MORPH = Easing.bezier(0.65, 0, 0.35, 1); // AE "easy ease" at ~75% influence: the Apple feel
type State = {at: number; w: number; h: number; r: number; bg: string; bd?: string; page: string; c: React.ReactNode};

const T: React.CSSProperties = {fontFamily: FONT, whiteSpace: 'nowrap'};
const Ring: React.FC<{c: string}> = ({c}) => <div style={{width: 64, height: 64, borderRadius: 99, border: `5px solid ${c}`, flex: '0 0 auto'}} />;
const Bubble: React.FC<{c: string; t: string; x: number; y: number; o: number}> = ({c, t, x, y, o}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 30}px) scale(${0.9 + 0.1 * o})`, background: c, color: '#fff', padding: '18px 34px', borderRadius: 40, ...T, fontSize: 34}}>{t}</div>
);

const S: State[] = [
  {at: 0, w: 760, h: 120, r: 60, bg: '#ffffff', page: '#f4f4f6', c: <span style={{...T, fontSize: 56, color: '#111'}}>Is it possible to learn</span>},
  {at: 60, w: 520, h: 120, r: 60, bg: '#ffffff', page: '#f4f4f6', c: <span style={{...T, fontSize: 52, color: '#111'}}>● Motion Graphics</span>},
  {at: 110, w: 330, h: 330, r: 70, bg: '#0b0b0d', page: '#f4f4f6', c: <span style={{...T, fontSize: 64, color: '#fff'}}>20 min</span>},
  {at: 160, w: 360, h: 130, r: 30, bg: '#0b0b0d', page: '#f4f4f6', c: <div style={{display: 'flex', gap: 26, alignItems: 'center'}}><Ring c="#ff8a1f" /><span style={{...T, fontSize: 56, color: '#ffb340'}}>Well</span></div>},
  {at: 200, w: 360, h: 130, r: 30, bg: '#0b0b0d', page: '#f4f4f6', c: <div style={{display: 'flex', gap: 26, alignItems: 'center'}}><Ring c="#ff8a1f" /><span style={{...T, fontSize: 56, color: '#ffb340'}}>Yes</span></div>},
  {at: 240, w: 1000, h: 560, r: 60, bg: '#0b0b0d', page: '#f4f4f6', c: <span style={{...T, fontSize: 62, color: '#fff', whiteSpace: 'normal', padding: 60, lineHeight: 1.2}}>Most people don't realize how simple it is</span>},
  {at: 320, w: 880, h: 120, r: 60, bg: '#ffffff', page: '#050505', c: <span style={{...T, fontSize: 56, color: '#111'}}>2 components   ⌕</span>},
  {at: 380, w: 1100, h: 140, r: 0, bg: 'rgba(0,0,0,0)', page: '#050505', c: <div style={{display: 'flex', gap: 120}}><span style={{...T, fontSize: 80, color: '#2b5cff', textDecoration: 'underline'}}>Expressions</span><span style={{...T, fontSize: 80, color: '#2b5cff', textDecoration: 'underline'}}>Timing</span></div>},
  {at: 450, w: 700, h: 120, r: 60, bg: 'rgba(0,0,0,0)', page: '#f4f4f6', c: <span style={{...T, fontSize: 70, color: '#111'}}>and if you add <b style={{color: '#ff8a1f'}}>60 FPS</b></span>},
  {at: 520, w: 1, h: 1, r: 0, bg: 'rgba(0,0,0,0)', page: '#eef1f6', c: null},
  {at: 600, w: 1200, h: 220, r: 0, bg: 'rgba(0,0,0,0)', page: '#f4f4f6', c: <span style={{...T, fontSize: 190, color: '#2b2b2b', letterSpacing: 4, fontWeight: 800}}>MORPHING</span>},
  {at: 660, w: 520, h: 560, r: 56, bg: '#ffffff', bd: '#e3e3e8', page: '#e6e6ea', c: <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}><div style={{width: 120, height: 200, borderRadius: 26, background: 'linear-gradient(160deg,#ff9a4a,#e0621d)'}} /><span style={{...T, fontSize: 40, color: '#111'}}>iPhone 17 Pro</span><div style={{width: 400, height: 76, borderRadius: 40, background: '#111', color: '#fff', ...T, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Pay</div></div>},
  {at: 730, w: 440, h: 120, r: 60, bg: '#1f6bff', page: '#e6e6ea', c: <span style={{...T, fontSize: 46, color: '#fff'}}>▮ Track Order</span>},
  {at: 790, w: 120, h: 120, r: 60, bg: '#1f6bff', page: '#e6e6ea', c: <span style={{...T, fontSize: 60, color: '#fff'}}>→</span>},
  {at: 840, w: 720, h: 120, r: 60, bg: '#ffffff', bd: '#dcdce2', page: '#e6e6ea', c: <span style={{...T, fontSize: 44, color: '#888'}}>Ask FansaChat anything…</span>},
  {at: 930, w: 720, h: 120, r: 60, bg: '#ffffff', bd: '#dcdce2', page: '#e6e6ea', c: <span style={{...T, fontSize: 44, color: '#888'}}>Ask FansaChat anything…</span>},
];

export const AppleMorph: React.FC = () => {
  const f = useCurrentFrame();
  let i = S.findIndex((s, j) => j === S.length - 1 || f < S[j + 1].at);
  i = Math.min(i, S.length - 2);
  const a = S[i], b = S[i + 1];
  const MT = 18; // morph duration (frames @60fps) right before the next state
  const t = interpolate(f, [b.at - MT, b.at], [0, 1], {easing: MORPH, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mix = (x: number, y: number) => x + (y - x) * t;
  const fadeOut = interpolate(t, [0, 0.45], [1, 0], {extrapolateRight: 'clamp'});
  const fadeIn = interpolate(t, [0.55, 1], [0, 1], {extrapolateLeft: 'clamp'});
  const iMsg = interpolate(f, [520, 545, 600, 612], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: interpolateColors(t, [0, 1], [a.page, b.page]), alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: 'scale(1.4)'}}>
      <style>{css}</style>
      <div style={{width: mix(a.w, b.w), height: mix(a.h, b.h), borderRadius: mix(a.r, b.r), background: interpolateColors(t, [0, 1], [a.bg, b.bg]),
        border: `2px solid ${interpolateColors(t, [0, 1], [a.bd ?? 'rgba(0,0,0,0)', b.bd ?? 'rgba(0,0,0,0)'])}`, boxShadow: a.bg === '#ffffff' || b.bg === '#ffffff' ? '0 18px 50px rgba(0,0,0,.10)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', filter: `blur(${Math.sin(t * Math.PI) * 3}px)`}}>
        <div style={{position: 'absolute', opacity: fadeOut, transform: `scale(${1 - 0.06 * t})`}}>{a.c}</div>
        <div style={{position: 'absolute', opacity: fadeIn, transform: `scale(${0.94 + 0.06 * t})`}}>{b.c}</div>
      </div>
      </AbsoluteFill>
      {iMsg > 0 && <>
        <Bubble c="#34c759" t="🟢 🟢 🟢  Buttery Smooth" x={1000} y={380} o={iMsg} />
        <Bubble c="#1f6bff" t="Apple Style Animations" x={620} y={520} o={interpolate(f, [530, 555, 600, 612], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      </>}
    </AbsoluteFill>
  );
};
