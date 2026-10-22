// Clone: "Typography Motion Graphics Animation in After Effects" (Motion Nations). Light grey stage, heavy black words
// stacked in mixed sizes (small words perched on big ones), green bars/blocks as accents and wipes, a constant slow
// push-in, hard snappy pops, then a scrambled logo that resolves and a grey circle wipe.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'KinFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const GREEN = '#2ee05a', BG = '#ececec';
const POP = Easing.bezier(0.2, 1.4, 0.4, 1); // slight overshoot, like the reference's snappy scale pops
const k = (f: number, i: number[], o: number[], e = Easing.bezier(0.16, 1, 0.3, 1)) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
type W = {t: string; s: number; x: number; y: number; at: number; c?: string; bar?: boolean};

const Stack: React.FC<{f: number; words: W[]; push?: number}> = ({f, words, push = 0.12}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + k(f, [0, 60], [0, push], Easing.linear)})`}}>
    <div style={{position: 'relative', width: 0, height: 0}}>
      {words.map((w, i) => {
        const a = k(f, [w.at, w.at + 7], [0, 1], POP);
        return (
          <div key={i} style={{position: 'absolute', left: w.x, top: w.y, transform: `translate(-50%,-50%) scale(${a})`, transformOrigin: 'left bottom', display: 'flex', alignItems: 'center', gap: w.s * 0.12}}>
            {w.bar && <div style={{width: w.s * 0.22, height: w.s * 0.8, background: GREEN, transform: `scaleY(${k(f, [w.at, w.at + 6], [0, 1])})`}} />}
            <span style={{fontFamily: FONT, fontSize: w.s, color: w.c ?? '#0d0d0d', lineHeight: 0.9, letterSpacing: -w.s * 0.03, whiteSpace: 'nowrap'}}>{w.t}</span>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

const Scramble: React.FC<{f: number; text: string; start: number}> = ({f, text, start}) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&';
  return <span>{text.split('').map((c, i) => {
    const settle = start + 4 + i * 1.5;
    return c === ' ' ? ' ' : f >= settle ? c : chars[Math.floor(random(`${i}-${Math.floor(f / 2)}`) * chars.length)];
  }).join('')}</span>;
};

const SCENES: {d: number; node: (f: number) => React.ReactNode}[] = [
  {d: 26, node: (f) => <Stack f={f} words={[{t: 'animating', s: 70, x: -170, y: 0, at: 0}, {t: 'text', s: 70, x: 200, y: 0, at: 8, bar: true}]} />},
  {d: 30, node: (f) => <Stack f={f} words={[{t: 'this', s: 210, x: -40, y: 0, at: 0}, {t: 'can', s: 120, x: 260, y: 40, at: 6}, {t: 'be', s: 120, x: 40, y: 170, at: 11}]} />},
  {d: 18, node: (f) => <Stack f={f} words={[{t: 'challenging', s: 170, x: 0, y: 0, at: 0}, {t: 'this can be', s: 54, x: 330, y: -120, at: 3}]} />},
  {d: 22, node: (f) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}><div style={{fontFamily: FONT, fontSize: 520, color: GREEN, letterSpacing: -14, transform: `scale(${k(f, [0, 8], [1.6, 1], POP)})`, filter: `blur(${k(f, [16, 22], [0, 18])}px)`}}>but</div></AbsoluteFill>},
  {d: 40, node: (f) => <Stack f={f} words={[{t: 'this', s: 190, x: -150, y: -60, at: 0, bar: true}, {t: 'tutorial', s: 140, x: 300, y: -40, at: 6}, {t: 'will', s: 220, x: 0, y: 140, at: 12}, {t: 'help', s: 90, x: 380, y: 200, at: 18}, {t: 'you', s: 150, x: -330, y: 260, at: 22}]} />},
  {d: 40, node: (f) => <Stack f={f} words={[{t: 'help', s: 70, x: -260, y: -170, at: 0}, {t: 'how', s: 330, x: 0, y: 0, at: 4}, {t: 'to do', s: 120, x: -170, y: 200, at: 12}, {t: 'that', s: 150, x: 230, y: 200, at: 17}]} push={0.18} />},
  {d: 52, node: (f) => (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontSize: 150, letterSpacing: 18, color: '#141414', textAlign: 'center', lineHeight: 1, filter: `blur(${k(f, [0, 10], [6, 0])}px)`}}>
        <Scramble f={f} text="MOTION" start={0} /><br /><Scramble f={f} text="NATIONS" start={6} /></div>
      <div style={{position: 'absolute', width: 2400 * k(f, [36, 52], [0, 1], Easing.bezier(0.7, 0, 0.3, 1)), height: 2400 * k(f, [36, 52], [0, 1], Easing.bezier(0.7, 0, 0.3, 1)), borderRadius: 9999, background: '#d4d4d4'}} />
    </AbsoluteFill>)},
];
export const KINETIC_FRAMES = SCENES.reduce((a, s) => a + s.d, 0);

export const KineticType: React.FC = () => {
  const f = useCurrentFrame();
  let acc = 0, i = 0;
  while (i < SCENES.length - 1 && f >= acc + SCENES[i].d) { acc += SCENES[i].d; i++; }
  const lf = f - acc;
  const wipe = i > 0 && i !== 4 ? k(lf, [0, 5], [1, 0], Easing.bezier(0.7, 0, 0.3, 1)) : 0; // green block wipe-in
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <style>{css}</style>
      {SCENES[i].node(lf)}
      {wipe > 0 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: '28%', background: GREEN, transform: 'skewX(-12deg)'}} />}
    </AbsoluteFill>
  );
};
