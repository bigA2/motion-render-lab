// v2 — Apple-style morph, matched to the reference at 3 fps (E:\reel_study\wl\cpQzSKuEAkM\ref16.jpg).
// What v1 missed: there are NO static holds. A camera is always moving (follows the typing caret, zooms into the card,
// zooms 3x into the tiny search pill then pans across the words), every state has live content (typing, picker
// scrolling, timer counting, bubbles growing), and one black container morphs between widget -> pill -> note card.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'MorphFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const M = Easing.bezier(0.65, 0, 0.35, 1), OUT = Easing.bezier(0.16, 1, 0.3, 1);
const k = (f: number, i: number[], o: number[], e = M) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const T = (s: number, c = '#111', w = 600): React.CSSProperties => ({fontFamily: FONT, fontSize: s, color: c, fontWeight: w, whiteSpace: 'nowrap'});
const typed = (t: string, f: number, a: number, b: number) => t.slice(0, Math.round(k(f, [a, b], [0, t.length], Easing.linear)));

// 60 fps timeline (frames)
const S1 = 0, S2 = 100, S3 = 160, S4 = 250, S5 = 350, S6 = 480, S7 = 580, S8 = 700, END = 800;

const Typing: React.FC<{f: number}> = ({f}) => {
  const line = typed('Is it possible to learn', f, 0, 70);
  const logo = k(f, [72, 84], [0, 1], OUT);
  const swap = k(f, [84, 96], [0, 1]);
  const camX = k(f, [0, 70], [260, -260], Easing.linear) * (1 - swap) + swap * 0; // follow caret
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${camX}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <span style={{...T(110), opacity: 1 - swap, filter: `blur(${swap * 8}px)`, position: swap > 0.5 ? 'absolute' : 'relative'}}>{line}</span>
        <div style={{width: 120 * logo, height: 120 * logo, borderRadius: 99, background: '#111', flex: '0 0 auto'}} />
        <span style={{...T(80), opacity: swap, transform: `translateX(${(1 - swap) * 40}px)`}}>Motion Graphics</span>
      </div>
    </AbsoluteFill>
  );
};

// one black container that morphs: timer widget (S2) -> pill (S3) -> note card (S4)
const Morph: React.FC<{f: number}> = ({f}) => {
  const a = k(f, [S3 - 14, S3 + 4], [0, 1]), b = k(f, [S4 - 10, S4 + 14], [0, 1]);
  const w = 300 + (520 - 300) * a + (900 - 520) * b, h = 300 + (140 - 300) * a + (620 - 140) * b, r = 64 + (70 - 64) * a + (60 - 70) * b;
  const zoom = 1 + k(f, [S4, S5 - 20], [0, 0.55]);
  const enter = k(f, [S2, S2 + 16], [0, 1], OUT);
  const pick = k(f, [S2, S3 - 10], [0, 1]);
  const secs = Math.floor(k(f, [S3, S4 - 20], [1200, 1185], Easing.linear));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom * (0.7 + 0.3 * enter)})`, opacity: enter}}>
      <div style={{width: w, height: h, borderRadius: r, background: '#0b0b0d', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.18)'}}>
        {/* timer widget */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - a, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <div style={{height: 150, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{transform: `translateY(${-pick * 50}px)`}}>{[19, 20, 21, 22].map((n, i) => <div key={n} style={{...T(i === 1 + Math.round(pick) - 1 + 1 ? 56 : 40, i === Math.round(pick) + 1 ? '#fff' : '#555'), height: 50, textAlign: 'center'}}>{n}</div>)}</div>
          </div>
          <span style={T(34, '#fff')}>min</span>
          <div style={{position: 'absolute', right: 24, bottom: 24, width: 54, height: 54, borderRadius: 99, background: '#1f6b3a', color: '#4cff8a', ...T(26, '#4cff8a'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>▶</div>
        </div>
        {/* pill */}
        <div style={{position: 'absolute', inset: 0, opacity: a * (1 - b), display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px'}}>
          <div style={{width: 92, height: 92, borderRadius: 99, border: '6px solid #ff8a1f', ...T(22, '#ff8a1f'), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${f * 2}deg)`}}><span style={{transform: `rotate(${-f * 2}deg)`}}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span></div>
          <span style={{...T(64, '#ffb340'), position: 'relative', width: 140}}>
            <span style={{position: 'absolute', opacity: 1 - k(f, [205, 215], [0, 1]), filter: `blur(${k(f, [205, 215], [0, 6])}px)`}}>Well</span>
            <span style={{position: 'absolute', opacity: k(f, [210, 220], [0, 1])}}>Yes</span></span>
          <div style={{marginLeft: 'auto', width: 60, height: 60, borderRadius: 99, background: '#ff8a1f33', ...T(40, '#ff8a1f'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>−</div>
        </div>
        {/* note card */}
        <div style={{position: 'absolute', inset: 0, opacity: b, padding: 46}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}><span style={T(46, '#fff')}>‹</span><span style={{marginLeft: 'auto', ...T(34, '#aaa')}}>⇪ ⋯</span>
            <span style={{width: 56, height: 56, borderRadius: 99, background: '#f5c400', ...T(30, '#111'), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${k(f, [S4 + 70, S4 + 80], [0, 1], OUT)})`}}>✓</span></div>
          <div style={{...T(64, '#fff', 500), whiteSpace: 'normal', marginTop: 40, lineHeight: 1.25}}>{typed("Most people don't realize how simple it is", f, S4 + 10, S4 + 75)}<span style={{opacity: Math.floor(f / 15) % 2}}>|</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Search: React.FC<{f: number}> = ({f}) => {
  const lf = f - S5;
  const z = k(lf, [0, 40], [1, 3.2]);
  const pan = k(lf, [50, 120], [0, -1500]);
  return (
    <AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${pan}px) scale(${z})`}}>
        <div style={{width: 380, height: 52, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box', ...T(24)}}>{typed('2 components', lf, 6, 30)}<span style={{marginLeft: 'auto', ...T(22, '#444')}}>⌕</span></div>
        <div style={{position: 'absolute', left: 'calc(50% + 330px)', top: 'calc(50% + 50px)', display: 'flex', gap: 120}}>
          <span style={{...T(40, '#2b5cff'), textDecoration: 'underline', opacity: k(lf, [56, 66], [0, 1])}}>Expressions</span>
          <span style={{...T(40, '#2b5cff'), textDecoration: 'underline', opacity: k(lf, [84, 94], [0, 1])}}>Timing</span></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fps: React.FC<{f: number}> = ({f}) => {
  const lf = f - S6;
  const words = ['and', 'if', 'you', 'add'];
  const solo = k(lf, [55, 70], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${k(lf, [0, 100], [120, -120], Easing.linear)}px)`}}>
      <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
        {words.map((w, i) => { const a = k(lf, [i * 6, i * 6 + 12], [0, 1], OUT); return <span key={w} style={{...T(72), opacity: a * (1 - solo), transform: `translateY(${(1 - a) * 30}px)`}}>{w}</span>; })}
        <span style={{...T(72 + 40 * solo, '#ff8a1f', 800), opacity: k(lf, [26, 36], [0, 1]), transform: `translateX(${-solo * 250}px)`}}>60 FPS</span>
      </div>
    </AbsoluteFill>
  );
};

const Bubbles: React.FC<{f: number}> = ({f}) => {
  const lf = f - S7;
  const g = k(lf, [0, 30], [0, 1], OUT), gt = typed('Buttery Smooth', lf, 14, 40), bl = k(lf, [40, 60], [0, 1], OUT);
  const bub = (bg: string, w: number, tail: 'l' | 'r', node: React.ReactNode, s: number): React.ReactNode => (
    <div style={{position: 'relative', background: bg, borderRadius: 50, padding: '22px 40px', width: w, ...T(40, '#fff'), transform: `scale(${s})`, transformOrigin: tail === 'r' ? 'right bottom' : 'left bottom'}}>
      {node}<div style={{position: 'absolute', bottom: -6, [tail === 'r' ? 'right' : 'left']: -6, width: 30, height: 30, background: bg, borderRadius: tail === 'r' ? '0 0 0 30px' : '0 0 30px 0'}} /></div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateY(${k(lf, [0, 120], [40, -40], Easing.linear)}px)`}}>
      <div style={{position: 'relative', width: 1000, height: 400}}>
        <div style={{position: 'absolute', right: 40, top: 60}}>{bub('#34c759', undefined as unknown as number, 'r', <span>● ● ●  {gt}</span>, g)}</div>
        <div style={{position: 'absolute', left: 60, top: 210}}>{bub('#1f6bff', undefined as unknown as number, 'l', <span>Apple Style Animations</span>, bl)}</div>
      </div>
    </AbsoluteFill>
  );
};

const Ask: React.FC<{f: number}> = ({f}) => {
  const lf = f - S8;
  const w = k(lf, [0, 24], [120, 900]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(lf, [0, 100], [1.15, 1])})`}}>
      <div style={{width: w, height: 120, borderRadius: 60, background: interpolateColors(lf, [0, 24], ['#1f6bff', '#ffffff']), border: '2px solid #dcdce2', boxShadow: '0 20px 50px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', padding: '0 44px', boxSizing: 'border-box', overflow: 'hidden'}}>
        <span style={{...T(46, '#888', 500)}}>{typed('Ask FansaChat anything…', lf, 20, 70)}</span>
        <div style={{marginLeft: 'auto', width: 76, height: 76, borderRadius: 99, background: '#1f6bff', ...T(40, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'}}>↑</div>
      </div>
    </AbsoluteFill>
  );
};

export const APPLE_FRAMES = END;
export const AppleMorph: React.FC = () => {
  const f = useCurrentFrame();
  const page = f < S5 ? '#f4f4f6' : f < S6 ? '#050505' : '#f4f4f6';
  const cut = (at: number) => k(f, [at - 6, at, at + 6], [0, 1, 0], Easing.linear); // tiny blur on scene changes
  const blur = [S2, S5, S6, S7, S8].reduce((s, a) => s + cut(a) * 8, 0);
  return (
    <AbsoluteFill style={{background: page, filter: `blur(${blur}px)`}}>
      <style>{css}</style>
      {f < S2 && <Typing f={f} />}
      {f >= S2 && f < S5 && <Morph f={f} />}
      {f >= S5 && f < S6 && <Search f={f} />}
      {f >= S6 && f < S7 && <Fps f={f} />}
      {f >= S7 && f < S8 && <Bubbles f={f} />}
      {f >= S8 && <Ask f={f} />}
    </AbsoluteFill>
  );
};
