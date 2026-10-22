// 1:1 recreation of "How To Master Text Animation in After Effects" (Marketing Demons) + a reusable WordRamp that copies
// AE's Text Animator exactly: Opacity 0 + Position +100, Range Selector (Advanced) units=Words, shape=Ramp Up,
// Ease High -50, Ease Low 100, Offset animated -100% -> +100%.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

const BLUE = '#2a2fd6';
const FONT = 'TextAnimFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const k = (f: number, i: number[], o: number[], e = Easing.bezier(0.33, 0, 0.67, 1)) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// AE range selector "Ramp Up" with Ease High/Low: amount per word given offset (0..1 progress of -100%..+100%).
const RAMP = Easing.bezier(0.7, 0, 0.15, 1); // Ease Low 100 (slow start) + Ease High -50 (snappy finish)
const rampUp = (wordIndex: number, n: number, progress: number, spread = 0.45) => {
  // offset -100% -> +100% sweeps a ramp across the words; each word animates over `spread` of the sweep
  const local = Math.min(1, Math.max(0, (progress * (1 + spread) - wordIndex / Math.max(1, n)) / spread));
  return 1 - RAMP(local); // 1 = still offset (hidden, +100 y), 0 = at rest
};

export const WordRamp: React.FC<{text: string; start: number; dur: number; size: number; color?: string; weight?: number; dy?: number; style?: React.CSSProperties}> = ({text, start, dur, size, color = BLUE, dy = 100, style}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const p = k(f, [start, start + dur], [0, 1], Easing.linear);
  return (
    <div style={{fontFamily: FONT, fontSize: size, color, lineHeight: 1.05, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.28}px`, letterSpacing: -size * 0.02, ...style}}>
      {words.map((w, i) => {
        const a = rampUp(i, words.length, p);
        return <span key={i} style={{display: 'inline-block', opacity: 1 - a, transform: `translateY(${a * dy}px)`}}>{w}</span>;
      })}
    </div>
  );
};

// words travelling around an ellipse (the circular "this" intro)
const Orbit: React.FC<{f: number}> = ({f}) => {
  const ring = k(f, [0, 12], [0, 1], Easing.bezier(0.16, 1, 0.3, 1));
  const zoom = k(f, [20, 70], [1.9, 1], Easing.bezier(0.65, 0, 0.35, 1));
  const spin = k(f, [10, 80], [-80, 0], Easing.bezier(0.16, 1, 0.3, 1));
  const arc = ["you've", 'been', 'seeing'];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, #ffffff 0%, #ececec 70%, #dcdcdc 100%)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${zoom})`, position: 'relative', width: 900, height: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', width: 520 * ring, height: 420 * ring, borderRadius: '50%', border: `4px solid ${BLUE}`, opacity: k(f, [55, 70], [0.9, 0]), transform: 'rotate(-18deg)'}} />
        {arc.map((w, i) => {
          const ang = (-150 + i * 42 + spin) * Math.PI / 180;
          return <div key={w} style={{position: 'absolute', left: 450 + Math.cos(ang) * 300, top: 450 + Math.sin(ang) * 260, transform: `translate(-50%,-50%) rotate(${(ang * 180 / Math.PI) + 90}deg)`,
            fontFamily: FONT, color: BLUE, fontSize: 84, opacity: k(f, [12 + i * 5, 22 + i * 5], [0, 1])}}>{w}</div>;
        })}
        <div style={{fontFamily: FONT, color: BLUE, fontSize: 210, letterSpacing: -6}}>this</div>
        <div style={{position: 'absolute', top: 560, fontFamily: FONT, color: BLUE, fontSize: 110, opacity: k(f, [30, 42], [0, 1]), transform: `translateY(${k(f, [30, 42], [60, 0])}px)`}}>animation</div>
      </div>
    </AbsoluteFill>
  );
};

const Card: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{background: bg, alignItems: 'center', justifyContent: 'center', padding: 80}}>{children}</AbsoluteFill>
);

export const TextAnim: React.FC = () => {
  const f = useCurrentFrame();
  const S = [0, 80, 102, 140, 200, 240, 300]; // scene starts (30 fps)
  const at = (i: number) => f >= S[i] && (i === S.length - 1 || f < S[i + 1]);
  const blur = S.slice(1).reduce((b, s) => b + k(f, [s - 3, s, s + 3], [0, 10, 0]), 0);
  return (
    <AbsoluteFill style={{filter: `blur(${blur}px)`}}>
      <style>{css}</style>
      {at(0) && <Orbit f={f} />}
      {at(1) && <Card bg="radial-gradient(80% 70% at 50% 40%, #2a2a2a, #000)"><div style={{fontFamily: FONT, color: '#fff', fontSize: 170, letterSpacing: -4, transform: `scale(${k(f, [80, 102], [1.25, 1])})`}}>EVERYWHERE</div></Card>}
      {at(2) && <Card bg="linear-gradient(180deg,#3a3a3a,#1c1c1c)"><WordRamp text="and the best part?" start={104} dur={26} size={120} color="#fff" /></Card>}
      {at(3) && <Card bg="radial-gradient(90% 80% at 50% 50%, #fff, #e6e6e6)">
        <WordRamp text={f < 160 ? 'it only takes' : f < 180 ? '15' : 'seconds to make'} start={f < 160 ? 140 : f < 180 ? 160 : 180} dur={14} size={f >= 160 && f < 180 ? 360 : 130} /></Card>}
      {at(4) && <Card bg="radial-gradient(90% 80% at 50% 50%, #fff, #e9e9e9)">
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <div style={{width: 210, height: 210, borderRadius: 34, background: '#f4f4f4', boxShadow: '0 20px 50px rgba(0,0,0,.15)', border: '2px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${k(f, [200, 214], [0.6, 1], Easing.bezier(0.16, 1, 0.3, 1))})`, fontFamily: FONT, color: '#666', fontSize: 34}}>
            <div style={{width: 96, height: 70, background: '#555', borderRadius: 10, marginBottom: 16}} />PLUG-IN</div>
          <WordRamp text="and you don't even need plugins" start={206} dur={22} size={78} style={{width: 560, justifyContent: 'flex-start'}} />
        </div></Card>}
      {at(5) && <Card bg="radial-gradient(70% 60% at 50% 50%, #1a1a1a, #000)"><WordRamp text="this is how you can make it:" start={242} dur={30} size={96} color="#fff" /></Card>}
      {at(6) && <Card bg="radial-gradient(70% 60% at 50% 50%, #1a1a1a, #000)"><WordRamp text="FansaChat" start={300} dur={14} size={180} color="#fff" /></Card>}
    </AbsoluteFill>
  );
};
