// Clone v3: "Typography Motion Graphics Animation in After Effects" (Motion Nations), matched to the reference at 4 fps.
// One world canvas: every phrase is placed at its own spot and stays there. The camera only moves to frame the newest
// phrase: crash in on the first word, a slow linear pan right while the line writes, then one whip (directional motion
// blur) to the next phrase. No continuous zoom, no roll; a 5-frame shake only on the "but" impact.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'KinFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const GREEN = '#2ee05a', BG = '#ececec', FPS = 60;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const k = (t: number, i: number[], o: number[], e = OUT) => interpolate(t, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// world words: text, size, x, y (left/baseline-ish anchor), appear time (s)
type W = {t: string; s: number; x: number; y: number; at: number; c?: string; bar?: boolean};
const WORDS: W[] = [
  {t: 'animating text', s: 40, x: -140, y: 0, at: 0.05},
  {t: 'like', s: 22, x: 150, y: -40, at: 0.62, c: GREEN},
  {t: 'this', s: 100, x: 140, y: 0, at: 0.7},
  {t: 'can', s: 64, x: 420, y: 30, at: 0.92},
  {t: 'be', s: 80, x: 200, y: 110, at: 1.08},
  {t: 'challenging', s: 110, x: -60, y: 260, at: 1.4},
  {t: 'but', s: 330, x: -40, y: 560, at: 1.95, c: GREEN},
  {t: 'this', s: 120, x: 1500, y: 0, at: 2.35, bar: true},
  {t: 'tutorial', s: 82, x: 1860, y: -10, at: 2.5},
  {t: 'will', s: 160, x: 1640, y: 150, at: 2.68},
  {t: 'help', s: 62, x: 2080, y: 190, at: 2.9},
  {t: 'you', s: 120, x: 1520, y: 310, at: 3.05},
  {t: 'how', s: 240, x: 1560, y: 560, at: 3.3},
  {t: 'to do that', s: 92, x: 1580, y: 810, at: 3.6},
];

// camera keys: at time t the camera has arrived at (x, y, z); `e` = ease of the move INTO this key
type K = {t: number; x: number; y: number; z: number; e?: (n: number) => number};
const LIN = Easing.linear;
const CAM: K[] = [
  {t: 0, x: 0, y: -10, z: 1.7},
  {t: 0.6, x: 20, y: -10, z: 1.75, e: LIN},          // tiny follow while "animating text" writes
  {t: 0.86, x: 300, y: 20, z: 2.6},                   // crash in on "this"
  {t: 1.25, x: 370, y: 50, z: 2.3, e: LIN},           // slow pan right as "can be" writes
  {t: 1.5, x: 260, y: 160, z: 1.45},                  // pull back: "challenging" under "this can be"
  {t: 1.95, x: 280, y: 190, z: 1.5, e: LIN},
  {t: 2.1, x: 230, y: 470, z: 1.55},                  // drop onto "but"
  {t: 2.3, x: 240, y: 480, z: 1.6, e: LIN},
  {t: 2.48, x: 1740, y: 20, z: 1.9},                  // whip right to "this tutorial"
  {t: 2.85, x: 1840, y: 100, z: 1.75, e: LIN},        // pan with the line
  {t: 3.1, x: 1800, y: 200, z: 1.6, e: LIN},
  {t: 3.42, x: 1760, y: 660, z: 1.6},                 // down to "how"
  {t: 3.95, x: 1800, y: 700, z: 1.55, e: LIN},
];
const camAt = (t: number) => {
  let i = 0;
  while (i < CAM.length - 1 && t >= CAM[i + 1].t) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  if (a === b) return a;
  const u = (b.e ?? OUT)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  return {x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z * Math.pow(b.z / a.z, u)}; // zoom in log space
};

const Word: React.FC<{w: W; t: number}> = ({w, t}) => {
  const a = k(t, [w.at, w.at + 0.16], [0, 1]);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: w.x, top: w.y, display: 'flex', alignItems: 'center', gap: w.s * 0.12, opacity: a,
      transform: `translateY(${(1 - a) * w.s * 0.35}px) scale(${0.85 + 0.15 * a})`, transformOrigin: 'left center', filter: `blur(${(1 - a) * 10}px)`}}>
      {w.bar && <div style={{width: w.s * 0.22, height: w.s * 0.8, background: GREEN, transform: `scaleY(${k(t, [w.at - 0.05, w.at + 0.1], [0, 1])})`}} />}
      <span style={{fontFamily: FONT, fontSize: w.s, color: w.c ?? '#0d0d0d', lineHeight: 0.9, letterSpacing: -w.s * 0.03, whiteSpace: 'nowrap'}}>{w.t}</span>
    </div>
  );
};

const Scramble: React.FC<{t: number; text: string; start: number}> = ({t, text, start}) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&';
  return <span>{text.split('').map((c, i) => (t >= start + 0.12 + i * 0.05 ? c : chars[Math.floor(random(`${i}-${Math.floor(t * 15)}`) * chars.length)])).join('')}</span>;
};

const END = 4.1; // end card starts
export const KINETIC_FRAMES = Math.round((END + 1.7) * 30); // in 30-fps units (index.ts doubles for 60 fps)

export const KineticType: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = camAt(t), p = camAt(t - 1 / FPS);
  // directional motion blur from the camera's screen-space velocity (px per frame)
  const vx = (c.x - p.x) * c.z, vy = (c.y - p.y) * c.z;
  const bx = Math.min(40, Math.abs(vx) * 0.35), by = Math.min(40, Math.abs(vy) * 0.35);
  // 5-frame impact shake on "but"
  const sh = t > 2.1 && t < 2.1 + 5 / FPS ? (random(`s${Math.floor(t * FPS)}`) - 0.5) * 14 * (1 - (t - 2.1) * FPS / 5) : 0;
  const end = k(t, [END, END + 0.25], [0, 1]);
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <style>{css}</style>
      <svg width="0" height="0" style={{position: 'absolute'}}><filter id="kt-mb"><feGaussianBlur stdDeviation={`${bx} ${by}`} /></filter></svg>
      <AbsoluteFill style={{filter: bx + by > 0.5 ? 'url(#kt-mb)' : undefined, opacity: 1 - end}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(${sh}px, ${sh * 0.6}px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`}}>
          {WORDS.map((w, i) => <Word key={i} w={w} t={t} />)}
        </div>
      </AbsoluteFill>
      {end > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: FONT, fontSize: 150, letterSpacing: 18, color: '#141414', textAlign: 'center', lineHeight: 1, opacity: end, filter: `blur(${(1 - end) * 8}px)`}}>
            <Scramble t={t} text="MOTION" start={END} /><br /><Scramble t={t} text="NATIONS" start={END + 0.2} /></div>
          <div style={{position: 'absolute', width: 2400 * k(t, [END + 1.2, END + 1.7], [0, 1], Easing.bezier(0.7, 0, 0.3, 1)), aspectRatio: '1', borderRadius: 9999, background: '#d4d4d4'}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
