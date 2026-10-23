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
const S1 = 0, S2 = 160, S3 = 220, S4 = 310, S5 = 410, S6 = 540, S7 = 640, S8 = 760, END = 860;

// Opening, matched to the reference at 6 fps: words rise in with blur while the line slides left (writing head stays
// put), a black dot lands at the line end, the line blurs away as the dot glides to centre-left, a white "Motion
// Graphics" pill grows out of it, then the pill ITSELF morphs (shape + colour) into the black timer card of S2.
const WORDS = ['Is', 'it', 'possible', 'to', 'learn'];
const Typing: React.FC<{f: number}> = ({f}) => {
  const ox = k(f, [86, 120], [330, -170]);                     // origin = dot centre
  const lineOut = k(f, [84, 108], [0, 1]);
  const dot = k(f, [70, 82], [0, 1], OUT) * (1 - k(f, [138, 156], [0, 1]));
  const grow = k(f, [104, 128], [0, 1], OUT);
  const m = k(f, [136, S2], [0, 1]);                           // pill -> card morph
  const pw = 440 * grow, pcx = ox + 70 + pw / 2;
  const w = pw + (300 - pw) * m, h = 84 + (300 - 84) * m, cx = pcx * (1 - m), r = 42 + (64 - 42) * m;
  const bg = interpolateColors(m, [0, 0.5, 1], ['#ffffff', '#9a9a9e', '#0b0b0d']);
  const label = 'Motion Graphics';
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translateX(${ox}px)`}}>
        <div style={{position: 'absolute', right: 70 + lineOut * 60, top: 0, transform: 'translateY(-50%)', display: 'flex', gap: 26, opacity: 1 - lineOut, filter: `blur(${lineOut * 12}px)`}}>
          {WORDS.map((wd, i) => { const a = k(f, [6 + i * 13, 18 + i * 13], [0, 1], OUT);
            return <span key={i} style={{...T(96), opacity: a, filter: `blur(${(1 - a) * 10}px)`, transform: `translateY(${(1 - a) * 34}px)`}}>{wd}</span>; })}
        </div>
        <div style={{position: 'absolute', left: -48, top: -48, width: 96, height: 96, borderRadius: 99, background: '#111', transform: `scale(${dot})`}} />
      </div>
      {grow > 0 && (
        <div style={{position: 'absolute', left: `calc(50% + ${cx - w / 2}px)`, top: `calc(50% - ${h / 2}px)`, width: w, height: h, borderRadius: r, background: bg,
          boxShadow: `0 ${10 + 20 * m}px ${30 + 30 * m}px rgba(0,0,0,${0.08 + 0.1 * m})`, overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 34}}>
          <span style={{...T(52), opacity: 1 - k(f, [130, 146], [0, 1]), filter: `blur(${k(f, [130, 146], [0, 8])}px)`}}>
            {label.split('').map((c, i) => <span key={i} style={{opacity: k(f, [110 + i * 1.5, 118 + i * 1.5], [0, 1], OUT)}}>{c}</span>)}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// one black container that morphs: timer widget (S2) -> pill (S3) -> note card (S4)
const Morph: React.FC<{f: number}> = ({f}) => {
  const a = k(f, [S3 - 14, S3 + 4], [0, 1]), b = k(f, [S4 - 10, S4 + 14], [0, 1]);
  const w = 300 + (520 - 300) * a + (900 - 520) * b, h = 300 + (140 - 300) * a + (620 - 140) * b, r = 64 + (70 - 64) * a + (60 - 70) * b;
  const zoom = 1 + k(f, [S4, S5 - 20], [0, 0.55]);
  const enter = 1;
  const pick = k(f, [S2, S3 - 10], [0, 1]);
  const secs = Math.floor(k(f, [S3, S4 - 20], [1200, 1185], Easing.linear));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom * (0.7 + 0.3 * enter)})`, opacity: enter}}>
      <div style={{width: w, height: h, borderRadius: r, background: '#0b0b0d', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.18)'}}>
        {/* timer widget */}
        <div style={{position: 'absolute', inset: 0, opacity: (1 - a) * k(f, [S2, S2 + 14], [0, 1]), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          <div style={{height: 150, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{transform: `translateY(${-pick * 50}px)`}}>{[19, 20, 21, 22].map((n, i) => <div key={n} style={{...T(i === 1 + Math.round(pick) - 1 + 1 ? 56 : 40, i === Math.round(pick) + 1 ? '#fff' : '#555'), height: 50, textAlign: 'center'}}>{n}</div>)}</div>
          </div>
          <span style={T(34, '#fff')}>min</span>
          <div style={{position: 'absolute', right: 24, bottom: 24, width: 54, height: 54, borderRadius: 99, background: '#1f6b3a', color: '#4cff8a', ...T(26, '#4cff8a'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>▶</div>
        </div>
        {/* pill */}
        <div style={{position: 'absolute', inset: 0, opacity: a * (1 - b), display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px'}}>
          <div style={{width: 92, height: 92, borderRadius: 99, border: '6px solid #ff8a1f', ...T(22, '#ff8a1f'), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${f * 2}deg)`}}><span style={{transform: `rotate(${-f * 2}deg)`}}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span></div>
          <span style={{...T(64, '#ffb340'), position: 'relative', display: 'inline-block', width: 150, height: 80, lineHeight: '80px'}}>
            <span style={{position: 'absolute', left: 0, top: 0, opacity: 1 - k(f, [265, 275], [0, 1]), filter: `blur(${k(f, [265, 275], [0, 6])}px)`}}>Well</span>
            <span style={{position: 'absolute', left: 0, top: 0, opacity: k(f, [270, 280], [0, 1])}}>Yes</span></span>
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
  const pan = k(lf, [44, 60], [0, -900]);
  // the two results, ONE AT A TIME, centred and sharp (drawn at full size, not scaled up)
  const Word = ({t, a, b}: {t: string; a: number; b: number}) => {
    const i = k(lf, [a, a + 12], [0, 1], OUT), o = k(lf, [b - 10, b], [0, 1]);
    if (i <= 0 || o >= 1) return null;
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: i * (1 - o), filter: `blur(${(1 - i) * 10 + o * 10}px)`, transform: `translateY(${(1 - i) * 40 - o * 40}px)`}}>
        <span style={T(150, '#fff', 600)}>{t}</span>
        <div style={{height: 10, borderRadius: 5, marginTop: 18, background: '#2b5cff', width: 260 * k(lf, [a + 6, a + 22], [0, 1], OUT)}} />
      </AbsoluteFill>
    );
  };
  return (
    <AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${pan}px) scale(${z})`, opacity: 1 - k(lf, [44, 56], [0, 1])}}>
        <div style={{width: 380, height: 52, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box', ...T(24)}}>{typed('2 components', lf, 6, 30)}<span style={{marginLeft: 'auto', ...T(22, '#444')}}>⌕</span></div>
      </AbsoluteFill>
      <Word t="Expressions" a={52} b={88} />
      <Word t="Timing" a={88} b={130} />
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
  const blur = [S5, S6, S7, S8].reduce((s, a) => s + cut(a) * 8, 0);
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
