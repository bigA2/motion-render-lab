// P01 v8 — "Make Your Work Life Hassle-Free" (official ad). Built only from the approved clone techniques:
// beat-locked keyframed camera (land on the first word, pan with the line, ONE transition), morphs instead of cuts,
// zoom-through transitions, readable copy. Storyboard: fansa-knowledge/raw/video_research/P01_STORYBOARD_v8_2026-10-23.md
// Timing table T is in seconds and is re-timed to the chosen VO takes (voices/jobs/p_v3_lines.json).
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import LOGOS from '../clones/app_logos.json';

const FONT = 'P1Font', DISP = 'P1Disp';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}@font-face{font-family:${DISP};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.7, 0, 0.84, 0);
const k = (t: number, i: number[], o: number[], e = OUT) => interpolate(t, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const V = '#6468D8', VL = '#B4A9FF', INK = '#111318', BG = '#f3f3f6', OK = '#2fbf71', RED = '#e3342f';
const T = (s: number, c = INK, f = FONT): React.CSSProperties => ({fontFamily: f, fontSize: s, color: c, whiteSpace: 'nowrap', lineHeight: 1});
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(k(t, [a, b], [0, s.length], Easing.linear)));
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number}> = ({t, at, children, d = 0.28}) => {
  const a = k(t, [at, at + d], [0, 1]);
  return <span style={{display: 'inline-block', opacity: a, filter: `blur(${(1 - a) * 10}px)`, transform: `translateY(${(1 - a) * 0.4}em)`}}>{children}</span>;
};
const Words: React.FC<{t: string; t0: number; at: number; gap?: number; style?: React.CSSProperties; hot?: string[]; hotC?: string; wrap?: boolean}> = ({t, t0, at, gap = 0.12, style, hot = [], hotC = V, wrap = false}) => (
  <div style={{display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap: '0 0.26em', ...style}}>
    {t.split(' ').map((w, i) => <Rise key={i} t={t0} at={at + i * gap}><span style={{color: hot.includes(w.replace(/[^\w+-]/g, '')) ? hotC : undefined}}>{w}</span></Rise>)}
  </div>
);

// ---- beat table (seconds) ------------------------------------------------------------------------------------------
// re-timed to the chosen VO takes (public/audio/p01v8/times.json)
export const T_P01 = {hook: 0, ask: 5.6, meet: 8.3, type: 14.95, late: 19.2, who: 22.25, pains: 29.3, flow: 34.65, team: 37.3, trust: 41.8, end: 45.1, out: 51.2};
const B = T_P01;
export const P01_SECONDS = B.out;

// ---- camera helpers ------------------------------------------------------------------------------------------------
type Key = [number, number, number, number]; // t, x, y, zoom (world coords of the frame centre)
const cam = (t: number, keys: Key[]) => {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  if (a === b) return {x: a[1], y: a[2], z: a[3]};
  const u = IO((t - a[0]) / (b[0] - a[0]));
  return {x: a[1] + (b[1] - a[1]) * u, y: a[2] + (b[2] - a[2]) * u, z: a[3] * Math.pow(b[3] / a[3], u)};
};
const World: React.FC<{t: number; keys: Key[]; id: string; children: React.ReactNode}> = ({t, keys, id, children}) => {
  const c = cam(t, keys), p = cam(t - 1 / 60, keys);
  const bx = Math.min(36, Math.abs((c.x - p.x) * c.z) * 0.35), by = Math.min(36, Math.abs((c.y - p.y) * c.z) * 0.35);
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{position: 'absolute'}}><filter id={id}><feGaussianBlur stdDeviation={`${bx} ${by}`} /></filter></svg>
      <AbsoluteFill style={{filter: bx + by > 0.4 ? `url(#${id})` : undefined}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`}}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style}}>{children}</div>
);

// ---- small UI pieces -----------------------------------------------------------------------------------------------
const Card: React.FC<{w: number; h?: number; dark?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, dark, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 28, background: dark ? '#17181f' : '#fff', boxShadow: dark ? '0 30px 70px rgba(0,0,0,.45)' : '0 26px 60px rgba(30,30,80,.13)', border: dark ? '1px solid #2a2b36' : '1px solid #ececf3', padding: 26, boxSizing: 'border-box', ...style}}>{children}</div>
);
const Pop: React.FC<{t: number; at: number; children: React.ReactNode}> = ({t, at, children}) => {
  const a = k(t, [at, at + 0.35], [0, 1], Easing.bezier(0.2, 1.4, 0.4, 1));
  return <div style={{opacity: Math.min(1, a * 1.5), transform: `scale(${0.6 + 0.4 * a})`}}>{children}</div>;
};
const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('logo-fansa.png')} style={{width: s, height: s, objectFit: 'contain'}} />;

// ---- 1. HOOK: phrases on a canvas, camera lands on each and pans with it -----------------------------------------
const Hook: React.FC<{t: number}> = ({t}) => {
  const keys: Key[] = [[0, 0, 0, 1.5], [0.7, 60, 0, 1.55], [1.0, 640, 240, 1.35], [1.9, 760, 250, 1.35], [2.2, 60, 560, 1.3], [3.0, 200, 570, 1.3], [3.3, 900, 820, 1.35], [3.9, 1000, 830, 1.35], [4.2, 620, 1120, 1.05], [5.6, 700, 1130, 1.1]];
  return (
    <World t={t} keys={keys} id="hk">
      <At x={0} y={0}><div style={T(130, INK, DISP)}><Words t="Still juggling" t0={t} at={0.05} /></div></At>
      <At x={560} y={240}><div style={{display: 'flex', alignItems: 'center', gap: 34}}>
        <Pop t={t} at={0.95}><Card w={230} h={130} style={{padding: 18}}><div style={{...T(24, '#666'), marginBottom: 12}}>Client · 3 new</div>{[0.9, 0.6].map((w, i) => <div key={i} style={{height: 18, width: `${w * 100}%`, borderRadius: 9, background: i ? '#eceaff' : VL, marginBottom: 12}} />)}</Card></Pop>
        <div style={T(96)}><Words t="client messages," t0={t} at={1.0} hot={['messages']} /></div></div></At>
      <At x={120} y={560}><div style={{display: 'flex', alignItems: 'center', gap: 34}}>
        <div style={T(96)}><Words t="messy spreadsheets" t0={t} at={2.2} hot={['spreadsheets']} /></div>
        <Pop t={t} at={2.4}><Card w={250} h={150} style={{padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6}}>{Array.from({length: 16}).map((_, i) => <div key={i} style={{height: 22, borderRadius: 4, background: [3, 6, 13].includes(i) ? '#ffd9d6' : '#f0f0f5', transform: `rotate(${(random(`g${i}`) - 0.5) * 8}deg)`}} />)}</Card></Pop></div></At>
      <At x={950} y={820}><div style={{display: 'flex', alignItems: 'center', gap: 34}}>
        <div style={T(96)}><Words t="and late invoices" t0={t} at={3.3} hot={['invoices']} hotC={RED} /></div>
        <Pop t={t} at={3.5}><div style={{padding: '14px 26px', borderRadius: 16, background: '#fff', border: `2px solid ${RED}`, ...T(34, RED)}}>Overdue · 14 days</div></Pop></div></At>
      <At x={520} y={1120}><div style={T(150, INK, DISP)}><Words t="by hand, every single day?" t0={t} at={4.2} gap={0.16} hot={['every', 'single', 'day?']} /></div></At>
    </World>
  );
};

// ---- 2+3. ASK -> MEET: words rise, a dot lands, the dot grows into the FansaChat pill, apps converge into it ----------
const Meet: React.FC<{t: number}> = ({t}) => {
  // t = 0 at B.ask
  const line = 'What if one plain-English sentence could handle all of it?';
  const lineOut = k(t, [2.9, 3.4], [0, 1]);
  const dot = k(t, [2.6, 2.9], [0, 1], OUT);
  const grow = k(t, [3.2, 3.8], [0, 1], OUT);
  const apps = k(t, [6.3, 7.9], [0, 1], IO);
  const pushIn = k(t, [3.2, 9.4], [1, 1.12], Easing.bezier(0.2, 0.9, 0.3, 1));
  const counter = Math.round(k(t, [6.7, 7.9], [0, 700], OUT));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${pushIn})`}}>
      <div style={{position: 'absolute', width: 1500, ...T(76), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15, opacity: 1 - lineOut, filter: `blur(${lineOut * 12}px)`, transform: `translateY(${-lineOut * 60}px)`}}>
        <Words t={line} t0={t} at={0.05} gap={0.2} hot={['plain-English', 'sentence']} wrap /></div>
      {/* the dot lands where the line ends, then becomes the pill */}
      <div style={{position: 'absolute', width: 40 + 560 * grow, height: 40 + 110 * grow, borderRadius: 99, background: interpolateColors(grow, [0, 1], [INK, '#fff']),
        boxShadow: `0 ${30 * grow}px ${70 * grow}px rgba(70,60,160,${0.22 * grow})`, transform: `translate(${(1 - grow) * 420}px, ${(1 - grow) * 60}px) scale(${dot})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, overflow: 'hidden'}}>
        {grow > 0.4 && <><div style={{opacity: k(t, [3.5, 3.9], [0, 1])}}><Logo s={96} /></div><span style={{...T(84, INK, DISP), opacity: k(t, [3.6, 4.0], [0, 1])}}><Rise t={t} at={3.6}>FansaChat</Rise></span></>}
      </div>
      <div style={{position: 'absolute', top: 650, ...T(46, '#555'), opacity: k(t, [4.2, 4.6], [0, 1])}}><Words t="AI workflow automation" t0={t} at={4.2} hot={['automation']} /></div>
      {/* app icons fly in from all around and dock into a ring behind the pill */}
      {(LOGOS as string[]).slice(0, 36).map((f, i) => {
        const a = (i / 36) * Math.PI * 2, r0 = 1300 + random(`r${i}`) * 500, r1 = 330 + (i % 2) * 70;
        const e = k(t, [6.3 + (i % 6) * 0.08, 7.5 + (i % 6) * 0.08], [0, 1], OUT);
        const r = r0 + (r1 - r0) * e, spin = t * 4;
        return <div key={f} style={{position: 'absolute', transform: `translate(${Math.cos(a + spin * 0.01) * r * 1.5}px, ${Math.sin(a + spin * 0.01) * r * 0.75}px) scale(${0.5 + 0.5 * e})`, opacity: apps > 0 ? e : 0}}>
          <div style={{width: 92, height: 92, borderRadius: 24, background: '#fff', boxShadow: '0 12px 30px rgba(40,40,90,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile(`logos/ap/${f}`)} style={{width: 58, height: 58, objectFit: 'contain'}} /></div></div>;
      })}
      <div style={{position: 'absolute', top: 760, padding: '14px 34px', borderRadius: 40, background: V, ...T(44, '#fff'), opacity: k(t, [6.7, 7.1], [0, 1]), transform: `scale(${k(t, [6.7, 7.2], [0.7, 1], OUT)})`}}>connected to {counter}+ apps</div>
    </AbsoluteFill>
  );
};

// ---- 4. TYPE IT: composer types the sentence, follow-cam across the 3 steps, Done ---------------------------------
const TypeIt: React.FC<{t: number}> = ({t}) => {
  // t = 0 at B.type
  const say = '"When a client pays, send the receipt and update my sheet."';
  const steps = [['Client pays', 'Payment received · $480'], ['Send receipt', 'Receipt #1042 emailed'], ['Update sheet', 'Row 38 added']];
  const keys: Key[] = [[0, 0, 0, 1.35], [0.3, 0, 0, 1.3], [2.3, 0, 0, 1.2], [2.6, -520, 520, 1.25], [2.9, 0, 520, 1.25], [3.2, 520, 520, 1.25], [3.6, 0, 380, 0.85], [4.3, 0, 380, 0.85]];
  return (
    <AbsoluteFill style={{background: BG}}>
      <World t={t} keys={keys} id="ty">
        <At x={0} y={-150}><div style={T(70, INK, DISP)}><Words t="Just type it." t0={t} at={0.05} hot={['type']} /></div></At>
        <At x={0} y={40}><Card w={1180} dark style={{padding: '34px 40px'}}>
          <div style={{...T(40, '#e9e9f1'), whiteSpace: 'normal', lineHeight: 1.3, minHeight: 104}}>{typed(say, t, 0.3, 2.3)}<span style={{opacity: Math.floor(t * 3) % 2}}>|</span></div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18, ...T(26, '#8b8ca0')}}><span>FansaChat</span><span style={{padding: '8px 18px', borderRadius: 20, background: k(t, [2.3, 2.4], [0, 1]) > 0.5 ? V : '#2a2b36', color: '#fff'}}>Run ↵</span></div>
        </Card></At>
        {steps.map(([a, b], i) => {
          const on = k(t, [2.45 + i * 0.3, 2.6 + i * 0.3], [0, 1]);
          return <At key={a} x={-520 + i * 520} y={520}><div style={{opacity: k(t, [2.2, 2.45], [0, 1])}}><Card w={420} style={{border: `3px solid ${on > 0.5 ? OK : '#ececf3'}`, transform: `scale(${1 + on * 0.04})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}><span style={{width: 46, height: 46, borderRadius: 99, background: on > 0.5 ? OK : '#eee', ...T(28, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on > 0.5 ? '✓' : i + 1}</span><span style={T(38)}>{a}</span></div>
            <div style={{...T(26, '#777'), marginTop: 16, opacity: on}}>{b}</div></Card></div></At>;
        })}
        {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: -310 + i * 520, top: 517, height: 6, borderRadius: 3, background: OK, width: 100 * k(t, [2.55 + i * 0.3, 2.75 + i * 0.3], [0, 1])}} />)}
        <At x={0} y={760}><Pop t={t} at={3.4}><div style={{padding: '18px 44px', borderRadius: 50, background: OK, ...T(54, '#fff', DISP)}}>Done in seconds</div></Pop></At>
      </World>
    </AbsoluteFill>
  );
};

// ---- 5. LATE NIGHTS: dark, 11:47 PM, copy/paste loop stops ---------------------------------------------------------
const Late: React.FC<{t: number}> = ({t}) => {
  const stop = k(t, [1.8, 2.3], [0, 1]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(80% 70% at 50% 40%, #1b1c2b, #07070c)', alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [0, 3.2], [1.08, 1], Easing.bezier(0.2, 0.9, 0.3, 1))})`}}>
      <div style={{position: 'absolute', top: 150, ...T(150, '#e8e8f5', DISP), letterSpacing: -4, opacity: k(t, [0, 0.4], [0, 1])}}>11:47<span style={{fontSize: 70, marginLeft: 16}}>PM</span></div>
      {Array.from({length: 7}).map((_, i) => {
        const ph = ((t * 1.6 + i / 7) % 1);
        return <div key={i} style={{position: 'absolute', top: 470 + i * 8, transform: `translateX(${(ph - 0.5) * 1400 * (1 - stop)}px) rotate(${(i - 3) * 2}deg)`, opacity: (1 - stop * 0.85) * (0.4 + 0.6 * Math.sin(ph * Math.PI))}}>
          <div style={{padding: '18px 28px', borderRadius: 16, background: '#232433', border: '1px solid #343548', ...T(32, '#c9c9e0')}}>{i % 2 ? 'Ctrl + V' : 'Ctrl + C'} · row {12 + i}</div></div>;
      })}
      <div style={{position: 'absolute', top: 700, ...T(78, '#fff')}}><Words t="No more late nights copying the same data." t0={t} at={0.3} hot={['No', 'more']} hotC={VL} /></div>
    </AbsoluteFill>
  );
};

// ---- 6. WHO + PAINS + FLOW ---------------------------------------------------------------------------------------
const Who: React.FC<{t: number}> = ({t}) => {
  // t = 0 at B.who
  const who = ['freelance copywriters', 'independent SEO consultants', 'small agencies', 'consulting firms'];
  const w = Math.min(3, Math.floor(t / 1.05));
  const lw = t - w * 1.05;
  const heavy = k(t, [4.2, 4.6], [0, 1]);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#ffffff, #e9e8ff)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 300, ...T(64, '#555'), opacity: 1 - heavy}}>For</div>
      <div style={{position: 'absolute', top: 400, ...T(110, V, DISP), opacity: (1 - heavy) * k(lw, [0, 0.25], [0, 1]), filter: `blur(${k(lw, [0, 0.25], [10, 0])}px)`, transform: `translateY(${k(lw, [0, 0.3], [50, 0])}px)`}}>{who[w]}</div>
      <div style={{position: 'absolute', top: 640, display: 'flex', gap: 14, opacity: 1 - heavy}}>{who.map((_, i) => <div key={i} style={{width: i === w ? 54 : 16, height: 16, borderRadius: 8, background: i <= w ? V : '#d6d4f2'}} />)}</div>
      <div style={{position: 'absolute', ...T(80), whiteSpace: 'normal', width: 1400, textAlign: 'center', lineHeight: 1.2}}>{heavy > 0 && <Words t="your work is heavier than reminders and bookings." t0={t} at={4.3} gap={0.14} hot={['heavier']} wrap />}</div>
    </AbsoluteFill>
  );
};
const Pains: React.FC<{t: number}> = ({t}) => {
  // t = 0 at B.pains; three pains, camera tracks each, then they snap onto one line ("one smooth flow")
  const pains = [['Leads', 'from five places'], ['Onboarding', 'that never ends'], ['Reports', 'nobody has time for']];
  const flow = k(t, [5.45, 6.2], [0, 1], IO);
  const keys: Key[] = [[0, -560, -140, 1.35], [1.5, -560, -120, 1.35], [1.8, 0, 140, 1.35], [3.4, 0, 160, 1.35], [3.7, 560, -140, 1.35], [5.2, 560, -120, 1.35], [5.8, 0, 0, 0.9], [8.0, 0, 0, 0.95]];
  const pos = (i: number) => [[-560, -140], [0, 140], [560, -140]][i];
  return (
    <AbsoluteFill style={{background: BG}}>
      <World t={t} keys={keys} id="pn">
        {/* the swoosh that becomes the flow line */}
        <svg width={2000} height={400} style={{position: 'absolute', left: -1000, top: -200, overflow: 'visible'}}>
          <path d="M 0 200 C 400 -40, 700 420, 1000 200 S 1600 -40, 2000 200" fill="none" stroke={V} strokeWidth={10} strokeLinecap="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - k(t, [5.45, 6.2], [0, 1], IO))} /></svg>
        {pains.map(([a, b], i) => {
          const [x, y] = pos(i), at = [0.1, 1.75, 3.7][i];
          return <At key={a} x={x * (1 - flow) + (-560 + i * 560) * flow} y={y * (1 - flow)}><Pop t={t} at={at}><Card w={440} style={{textAlign: 'center', border: flow > 0.5 ? `3px solid ${V}` : undefined}}>
            <div style={T(64, flow > 0.5 ? V : INK, DISP)}>{a}</div><div style={{...T(32, '#777'), marginTop: 12}}>{b}</div>
            {i === 0 && <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>{[0, 1, 2, 3, 4].map((j) => <div key={j} style={{width: 18, height: 18, borderRadius: 9, background: k(t, [0.3 + j * 0.12, 0.45 + j * 0.12], [0, 1]) > 0.5 ? RED : '#eee'}} />)}</div>}</Card></Pop></At>;
        })}
        <At x={0} y={330}><div style={{...T(84, INK, DISP), opacity: k(t, [5.8, 6.2], [0, 1])}}><Words t="one smooth flow." t0={t} at={5.8} hot={['flow.']} /></div></At>
      </World>
    </AbsoluteFill>
  );
};

// ---- 7. TEAM + TRUST: shared workspace, owner view coming soon, Approve -> Connected ------------------------------
const Team: React.FC<{t: number}> = ({t}) => {
  // t = 0 at B.team
  const press = k(t, [5.2, 5.35, 5.5], [1, 0.92, 1], Easing.linear);
  const conn = k(t, [5.5, 5.9], [0, 1], IO);
  const keys: Key[] = [[0, 0, 0, 1.2], [3.6, 0, 40, 1.12], [4.4, 0, 330, 1.5], [6.6, 0, 330, 1.45], [8.0, 0, 300, 1.4]];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#f6f6fb,#ebeaff)'}}>
      <World t={t} keys={keys} id="tm">
        <At x={0} y={-60}><Pop t={t} at={0.05}><Card w={1100} style={{padding: 36}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span style={T(44, INK, DISP)}>Team workspace</span>
            <div style={{display: 'flex'}}>{['#f2a65a', '#6468D8', '#2fbf71', '#e05d8b'].map((c, i) => <div key={c} style={{width: 64, height: 64, borderRadius: 99, background: c, border: '4px solid #fff', marginLeft: -14, transform: `scale(${k(t, [0.4 + i * 0.15, 0.7 + i * 0.15], [0, 1], OUT)})`}} />)}</div></div>
          {['Onboard new client', 'Weekly SEO report', 'Follow up 3 leads'].map((r, i) => <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, padding: '20px 24px', borderRadius: 16, background: '#f5f5fa', opacity: k(t, [0.9 + i * 0.2, 1.2 + i * 0.2], [0, 1])}}>
            <span style={T(34)}>{r}</span><span style={{...T(26, '#888')}}>{['Maya', 'Arif', 'Sam'][i]}</span></div>)}
        </Card></Pop></At>
        <At x={360} y={-330}><Pop t={t} at={2.2}><div style={{padding: '14px 28px', borderRadius: 30, background: '#fff', border: `2px dashed ${VL}`, ...T(32, V)}}>Owner view · coming soon</div></Pop></At>
        <At x={0} y={330}><div style={{opacity: k(t, [4.4, 4.7], [0, 1]), transform: `scale(${press})`}}>
          <div style={{width: 320 + 140 * conn, height: 110, borderRadius: 60, background: interpolateColors(conn, [0, 1], [V, OK]), display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(50, '#fff', DISP), boxShadow: '0 20px 50px rgba(70,60,160,.3)'}}>
            {conn < 0.5 ? 'Approve' : 'Connected ✓'}</div></div></At>
        <At x={0} y={470}><div style={{...T(40, '#555'), opacity: k(t, [6.0, 6.4], [0, 1])}}><Words t="and you don't pay until then." t0={t} at={6.0} hot={["don't", 'pay']} /></div></At>
      </World>
    </AbsoluteFill>
  );
};

// ---- 8. END ---------------------------------------------------------------------------------------------------------
const End: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'radial-gradient(80% 70% at 50% 35%, #ffffff, #e7e6fb)', alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [0, 5.4], [1.06, 1], Easing.bezier(0.2, 0.9, 0.3, 1))})`}}>
    <div style={{position: 'absolute', top: 190, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={120} /></Pop><span style={T(96, INK, DISP)}><Rise t={t} at={0.2}>FansaChat</Rise></span></div>
    <div style={{position: 'absolute', top: 400, ...T(60)}}><Words t="Get every update first." t0={t} at={0.4} hot={['first.']} /></div>
    <div style={{position: 'absolute', top: 560, display: 'flex', gap: 34}}>
      <Pop t={t} at={1.2}><div style={{padding: '26px 50px', borderRadius: 60, background: V, ...T(48, '#fff', DISP)}}>Join the waitlist</div></Pop>
      <Pop t={t} at={1.7}><div style={{padding: '26px 50px', borderRadius: 60, background: '#fff', border: `3px solid ${V}`, ...T(48, V, DISP)}}>Telegram community</div></Pop></div>
    <div style={{position: 'absolute', top: 760, ...T(44, '#666'), opacity: k(t, [3.8, 4.2], [0, 1])}}>Link in bio</div>
  </AbsoluteFill>
);

// ---- sequencer: scenes hand off with a short zoom-through (outgoing pushes in + blur, incoming settles) -------------
const SCENES: [number, number, React.FC<{t: number}>][] = [[B.hook, B.ask, Hook], [B.ask, B.type, Meet], [B.type, B.late, TypeIt], [B.late, B.who, Late], [B.who, B.pains, Who], [B.pains, B.team, Pains], [B.team, B.end, Team], [B.end, B.out, End]];
// full-frame backdrop per scene, so the 4:5 frame (taller than the 16:9 stage) is filled seamlessly
const BACK = [BG, BG, BG, 'radial-gradient(80% 60% at 50% 45%, #1b1c2b, #07070c)', 'linear-gradient(180deg,#ffffff, #e9e8ff)', BG, 'linear-gradient(180deg,#f6f6fb,#ebeaff)', 'radial-gradient(80% 60% at 50% 40%, #ffffff, #e7e6fb)'];
export const P01v8: React.FC<{music?: boolean}> = ({music = false}) => {
  const f = useCurrentFrame(), {fps, width, height} = useVideoConfig(), s = f / fps;
  const i = Math.max(0, SCENES.findIndex(([a, b]) => s >= a && s < b));
  const [a, b, C] = SCENES[i];
  const t = s - a, d = b - a;
  const inn = i ? k(t, [0, 0.2], [1, 0]) : 0, out = i < SCENES.length - 1 ? k(t, [d - 0.15, d], [0, 1], IN) : 0;
  const fit = height > width ? width / 1500 : Math.max(width / 1920, height / 1080); // 4:5: the centre 1500 px of the stage fill the width; BACK fills above/below
  return (
    <AbsoluteFill style={{background: BACK[i], overflow: 'hidden'}}>
      <style>{css}</style>
      <Audio src={staticFile('audio/p01v8/vo.wav')} />
      {music && <Audio src={staticFile('audio/01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3')} volume={(fr) => 0.17 * Math.min(1, fr / 30) * Math.min(1, (P01_SECONDS * 60 - fr) / 90)} />}
      <AbsoluteFill style={{transform: `scale(${(1 - inn * 0.06 + out * 0.18)})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 8}px)` : undefined, opacity: 1 - out * 0.4}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${fit})`}}>
          <AbsoluteFill><C t={t} /></AbsoluteFill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
