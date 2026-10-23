// AdKit — one engine for the P02–P07 official ads. Each ad is a Spec (scenes + data); timing comes from the chosen
// VO takes (public/audio/<id>/times.json), so a scene starts on its spoken line and its beats land on sub-lines.
// Built only from the approved techniques: beat-locked keyframed camera (land → pan → one transition), shared-element
// morphs, zoom-through hand-offs, 3D land-view mockups (page on the floor, nodes lift, lines connect ABOVE the page),
// sound design on every visible event, music ~14 dB under the voice. No emojis.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import LOGOS from '../clones/app_logos.json';

const FONT = 'AdFont', DISP = 'AdDisp';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}@font-face{font-family:${DISP};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.7, 0, 0.84, 0);
const k = (t: number, i: number[], o: number[], e = OUT) => interpolate(t, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const V = '#6468D8', VL = '#B4A9FF', INK = '#111318', BG = '#f3f3f6', OK = '#2fbf71', RED = '#e3342f';
const T = (s: number, c = INK, f = FONT): React.CSSProperties => ({fontFamily: f, fontSize: s, color: c, whiteSpace: 'nowrap', lineHeight: 1});
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(k(t, [a, b], [0, s.length], Easing.linear)));

// ---- spec types --------------------------------------------------------------------------------------------------
export type App = string; // 'ap/hubspot.png' | 'si/whatsapp.svg'
export type Scene =
  | {kind: 'hook'; from: number; phrases: {text: string; hot?: string[]; chip?: string; app?: App; red?: boolean}[]; big?: string}
  | {kind: 'brand'; from: number; line?: string; hot?: string[]; sub: string; apps?: App[]; chip?: string}
  | {kind: 'composer'; from: number; lead: string; say: string; steps: [string, string, App?][]; done: string}
  | {kind: 'night'; from: number; big: string; small?: string; loop: string[]; line: string; hot?: string[]}
  | {kind: 'cycle'; from: number; prefix: string; items: string[]; line?: string; hot?: string[]}
  | {kind: 'cards'; from: number; cards: [string, string][]; flow?: string}
  | {kind: 'people'; from: number; rows: [string, App[]][]; after?: string}
  | {kind: 'land'; from: number; title: string; steps: [string, App?][]; caption?: string; hot?: string[]}
  | {kind: 'tiers'; from: number; tiers: {name: string; price: string; who: string; pains: string}[]}
  | {kind: 'team'; from: number; rows: [string, string][]; chip?: string; trust: string; button?: [string, string]}
  | {kind: 'end'; from: number};
export type Spec = {id: string; music: string; times: number[]; end: number; scenes: Scene[]};

// ---- primitives --------------------------------------------------------------------------------------------------
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number}> = ({t, at, children, d = 0.28}) => {
  const a = k(t, [at, at + d], [0, 1]);
  return <span style={{display: 'inline-block', opacity: a, filter: `blur(${(1 - a) * 10}px)`, transform: `translateY(${(1 - a) * 0.4}em)`}}>{children}</span>;
};
const Words: React.FC<{t: string; t0: number; at: number; gap?: number; hot?: string[]; hotC?: string; wrap?: boolean; style?: React.CSSProperties}> = ({t, t0, at, gap = 0.12, hot = [], hotC = V, wrap, style}) => (
  <div style={{display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap: '0 0.26em', ...style}}>
    {t.split(' ').map((w, i) => <Rise key={i} t={t0} at={at + i * gap}><span style={{color: hot.some((h) => w.replace(/[^\w$+-]/g, '').toLowerCase() === h.toLowerCase()) ? hotC : undefined}}>{w}</span></Rise>)}
  </div>
);
const Pop: React.FC<{t: number; at: number; children: React.ReactNode}> = ({t, at, children}) => {
  const a = k(t, [at, at + 0.35], [0, 1], Easing.bezier(0.2, 1.4, 0.4, 1));
  return <div style={{opacity: Math.min(1, Math.max(0, a) * 1.5), transform: `scale(${0.6 + 0.4 * a})`}}>{children}</div>;
};
const Card: React.FC<{w: number; h?: number; dark?: boolean; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, dark, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 28, background: dark ? '#17181f' : '#fff', boxShadow: dark ? '0 30px 70px rgba(0,0,0,.45)' : '0 26px 60px rgba(30,30,80,.13)', border: dark ? '1px solid #2a2b36' : '1px solid #ececf3', padding: 26, boxSizing: 'border-box', ...style}}>{children}</div>
);
const Icon: React.FC<{app: App; s?: number}> = ({app, s = 92}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.26, background: '#fff', boxShadow: '0 12px 30px rgba(40,40,90,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'}}>
    <Img src={staticFile(`logos/${app}`)} style={{width: s * 0.62, height: s * 0.62, objectFit: 'contain'}} /></div>
);
const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('logo-fansa.png')} style={{width: s, height: s, objectFit: 'contain'}} />;
type Key = [number, number, number, number];
const cam = (t: number, keys: Key[]) => {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  if (a === b) return {x: a[1], y: a[2], z: a[3]};
  const u = IO(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))));
  return {x: a[1] + (b[1] - a[1]) * u, y: a[2] + (b[2] - a[2]) * u, z: a[3] * Math.pow(b[3] / a[3], u)};
};
// keyed camera with directional motion blur from its own velocity (RSMB-style)
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
type P<S> = {s: S; t: number; d: number; m: number[]}; // m = start of each spoken line inside the scene (s, relative)

// ---- scenes ------------------------------------------------------------------------------------------------------
const Hook: React.FC<P<Extract<Scene, {kind: 'hook'}>>> = ({s, t, d}) => {
  const n = s.phrases.length, span = d * 0.86;
  const at = (i: number) => 0.05 + (i / n) * span;
  const pos = (i: number) => [i % 2 ? 620 : 40, i * 300];
  const keys: Key[] = [[0, pos(0)[0], 0, 1.45]];
  s.phrases.forEach((_, i) => { const [x, y] = pos(i); if (i) keys.push([at(i) - 0.05, keys[keys.length - 1][1], keys[keys.length - 1][2], keys[keys.length - 1][3]]); keys.push([at(i) + 0.3, x, y, 1.35], [Math.min(d, at(i + 1) - 0.06), x + 70, y + 10, 1.35]); });
  return (
    <World t={t} keys={keys} id="hk">
      {s.phrases.map((p, i) => { const [x, y] = pos(i); return (
        <At key={i} x={x} y={y}><div style={{display: 'flex', alignItems: 'center', gap: 34}}>
          {p.app && <Pop t={t} at={at(i) + 0.1}><Icon app={p.app} s={120} /></Pop>}
          <div style={T(i === n - 1 && s.big ? 130 : 96, INK, i === n - 1 && s.big ? DISP : FONT)}><Words t={p.text} t0={t} at={at(i)} hot={p.hot} hotC={p.red ? RED : V} /></div>
          {p.chip && <Pop t={t} at={at(i) + 0.2}><div style={{padding: '14px 26px', borderRadius: 16, background: '#fff', border: `2px solid ${p.red ? RED : VL}`, ...T(34, p.red ? RED : V)}}>{p.chip}</div></Pop>}
        </div></At>); })}
    </World>
  );
};

const Brand: React.FC<P<Extract<Scene, {kind: 'brand'}>>> = ({s, t, d, m}) => {
  const L = s.line ? (m[1] ?? 2.6) : 0; // pill lands when "FansaChat" is said (2nd line if there is a question line)
  const lineOut = s.line ? k(t, [L - 0.4, L], [0, 1]) : 1;
  const dot = k(t, [L - 0.6, L - 0.3], [0, 1], OUT), grow = k(t, [L - 0.1, L + 0.5], [0, 1], OUT);
  const appsAt = Math.max(L + 1.2, d * 0.55), apps = s.apps ?? [];
  const pushIn = k(t, [L, d], [1, 1.1], Easing.bezier(0.2, 0.9, 0.3, 1));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${pushIn})`}}>
      {s.line && <div style={{position: 'absolute', width: 1500, ...T(76), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15, opacity: 1 - lineOut, filter: `blur(${lineOut * 12}px)`, transform: `translateY(${-lineOut * 60}px)`}}>
        <Words t={s.line} t0={t} at={0.05} gap={Math.min(0.2, (L - 0.8) / s.line.split(' ').length)} hot={s.hot} wrap /></div>}
      <div style={{position: 'absolute', width: 40 + 560 * grow, height: 40 + 110 * grow, borderRadius: 99, background: interpolateColors(grow, [0, 1], [INK, '#fff']),
        boxShadow: `0 ${30 * grow}px ${70 * grow}px rgba(70,60,160,${0.22 * grow})`, transform: `translate(${(1 - grow) * 420}px, ${(1 - grow) * 60}px) scale(${s.line ? dot : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, overflow: 'hidden'}}>
        {grow > 0.4 && <><div style={{opacity: k(t, [L + 0.2, L + 0.6], [0, 1])}}><Logo s={96} /></div><span style={{...T(84, INK, DISP)}}><Rise t={t} at={L + 0.3}>FansaChat</Rise></span></>}
      </div>
      <div style={{position: 'absolute', top: 650, ...T(46, '#555')}}><Words t={s.sub} t0={t} at={L + 0.9} hot={['automation', 'autopilot']} /></div>
      {apps.map((f, i) => {
        const a = (i / apps.length) * Math.PI * 2, r0 = 1300 + random(`r${i}`) * 500, r1 = 330 + (i % 2) * 70;
        const e = k(t, [appsAt + (i % 6) * 0.08, appsAt + 1.2 + (i % 6) * 0.08], [0, 1], OUT), r = r0 + (r1 - r0) * e;
        return <div key={f + i} style={{position: 'absolute', transform: `translate(${Math.cos(a + t * 0.04) * r * 1.5}px, ${Math.sin(a + t * 0.04) * r * 0.75}px) scale(${0.5 + 0.5 * e})`, opacity: e}}><Icon app={f} /></div>;
      })}
      {s.chip && <div style={{position: 'absolute', top: 760, padding: '14px 34px', borderRadius: 40, background: V, ...T(44, '#fff'), opacity: k(t, [appsAt + 0.4, appsAt + 0.8], [0, 1]), transform: `scale(${k(t, [appsAt + 0.4, appsAt + 0.9], [0.7, 1], OUT)})`}}>{s.chip}</div>}
    </AbsoluteFill>
  );
};

const Composer: React.FC<P<Extract<Scene, {kind: 'composer'}>>> = ({s, t, d}) => {
  const tEnd = Math.min(d * 0.55, 0.3 + s.say.length * 0.045), n = s.steps.length, gap = 1040 / Math.max(1, n - 1);
  const stepAt = (i: number) => tEnd + 0.2 + i * 0.32, doneAt = stepAt(n - 1) + 0.45;
  const sx = (i: number) => -520 + i * gap;
  const keys: Key[] = [[0, 0, 0, 1.35], [0.3, 0, 0, 1.3], [tEnd, 0, 0, 1.2]];
  s.steps.forEach((_, i) => keys.push([stepAt(i) + 0.15, sx(i), 520, 1.25]));
  keys.push([doneAt + 0.2, 0, 380, 0.85], [d, 0, 380, 0.88]);
  return (
    <AbsoluteFill style={{background: BG}}>
      <World t={t} keys={keys} id="cp">
        <At x={0} y={-150}><div style={T(70, INK, DISP)}><Words t={s.lead} t0={t} at={0.05} hot={['plain', 'English', 'yourself', 'once']} /></div></At>
        <At x={0} y={40}><Card w={1180} dark style={{padding: '34px 40px'}}>
          <div style={{...T(38, '#e9e9f1'), whiteSpace: 'normal', lineHeight: 1.3, minHeight: 104}}>{typed(s.say, t, 0.3, tEnd)}<span style={{opacity: Math.floor(t * 3) % 2}}>|</span></div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18, ...T(26, '#8b8ca0')}}><span>FansaChat</span><span style={{padding: '8px 18px', borderRadius: 20, background: t > tEnd ? V : '#2a2b36', color: '#fff'}}>Run</span></div>
        </Card></At>
        {s.steps.map(([a, b, app], i) => { const on = k(t, [stepAt(i), stepAt(i) + 0.15], [0, 1]);
          return <At key={a} x={sx(i)} y={520}><div style={{opacity: k(t, [tEnd - 0.1, tEnd + 0.15], [0, 1])}}><Card w={Math.min(420, gap - 40)} style={{border: `3px solid ${on > 0.5 ? OK : '#ececf3'}`, transform: `scale(${1 + on * 0.04})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>{app ? <Icon app={app} s={56} /> : null}<span style={{width: 46, height: 46, borderRadius: 99, background: on > 0.5 ? OK : '#eee', ...T(28, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on > 0.5 ? '✓' : i + 1}</span><span style={T(34)}>{a}</span></div>
            <div style={{...T(24, '#777'), marginTop: 16, opacity: on}}>{b}</div></Card></div></At>; })}
        {s.steps.slice(1).map((_, i) => <div key={i} style={{position: 'absolute', left: sx(i) + 210, top: 517, height: 6, borderRadius: 3, background: OK, width: (gap - 420) * k(t, [stepAt(i) + 0.1, stepAt(i + 1)], [0, 1])}} />)}
        <At x={0} y={760}><Pop t={t} at={doneAt}><div style={{padding: '18px 44px', borderRadius: 50, background: OK, ...T(54, '#fff', DISP)}}>{s.done}</div></Pop></At>
      </World>
    </AbsoluteFill>
  );
};

const Night: React.FC<P<Extract<Scene, {kind: 'night'}>>> = ({s, t, d}) => {
  const stop = k(t, [d * 0.55, d * 0.7], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [0, d], [1.08, 1], Easing.bezier(0.2, 0.9, 0.3, 1))})`}}>
      <div style={{position: 'absolute', top: 150, ...T(150, '#e8e8f5', DISP), letterSpacing: -4, opacity: k(t, [0, 0.4], [0, 1])}}>{s.big}{s.small && <span style={{fontSize: 70, marginLeft: 16}}>{s.small}</span>}</div>
      {Array.from({length: 7}).map((_, i) => { const ph = (t * 1.6 + i / 7) % 1;
        return <div key={i} style={{position: 'absolute', top: 470 + i * 8, transform: `translateX(${(ph - 0.5) * 1400 * (1 - stop)}px) rotate(${(i - 3) * 2}deg)`, opacity: (1 - stop * 0.85) * (0.4 + 0.6 * Math.sin(ph * Math.PI))}}>
          <div style={{padding: '18px 28px', borderRadius: 16, background: '#232433', border: '1px solid #343548', ...T(32, '#c9c9e0')}}>{s.loop[i % s.loop.length]}</div></div>; })}
      <div style={{position: 'absolute', top: 690, width: 1600, ...T(70, '#fff'), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2}}><Words t={s.line} t0={t} at={0.3} hot={s.hot} hotC={VL} wrap /></div>
    </AbsoluteFill>
  );
};

const Cycle: React.FC<P<Extract<Scene, {kind: 'cycle'}>>> = ({s, t, d, m}) => {
  const lineAt = s.line ? (m[1] ?? d * 0.6) : d + 1;
  const per = (lineAt - 0.1) / s.items.length, w = Math.min(s.items.length - 1, Math.floor(t / per)), lw = t - w * per;
  const heavy = k(t, [lineAt - 0.1, lineAt + 0.3], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 300, ...T(64, '#555'), opacity: 1 - heavy}}>{s.prefix}</div>
      <div style={{position: 'absolute', top: 400, ...T(110, V, DISP), opacity: (1 - heavy) * k(lw, [0, 0.25], [0, 1]), filter: `blur(${k(lw, [0, 0.25], [10, 0])}px)`, transform: `translateY(${k(lw, [0, 0.3], [50, 0])}px)`}}>{s.items[w]}</div>
      <div style={{position: 'absolute', top: 640, display: 'flex', gap: 14, opacity: 1 - heavy}}>{s.items.map((_, i) => <div key={i} style={{width: i === w ? 54 : 16, height: 16, borderRadius: 8, background: i <= w ? V : '#d6d4f2'}} />)}</div>
      {s.line && heavy > 0 && <div style={{position: 'absolute', ...T(80), whiteSpace: 'normal', width: 1400, textAlign: 'center', lineHeight: 1.2}}><Words t={s.line} t0={t} at={lineAt} gap={0.14} hot={s.hot} wrap /></div>}
    </AbsoluteFill>
  );
};

const Cards: React.FC<P<Extract<Scene, {kind: 'cards'}>>> = ({s, t, d, m}) => {
  const n = s.cards.length, at = (i: number) => (m[i] ?? (i * d) / (n + 1)) + 0.05;
  const flowAt = s.flow ? (m[n] ?? d * 0.75) : d + 1, flow = k(t, [flowAt, flowAt + 0.75], [0, 1], IO);
  const pos = (i: number) => n > 3 ? [-560 + (i % 3) * 560, Math.floor(i / 3) ? 200 : -200] : [(-560 + (1120 * i) / Math.max(1, n - 1)), i % 2 ? 140 : -140];
  const keys: Key[] = [[0, pos(0)[0], pos(0)[1], 1.35]];
  s.cards.forEach((_, i) => { const [x, y] = pos(i); if (i) keys.push([at(i) - 0.3, ...keys[keys.length - 1].slice(1)] as Key, [at(i), x, y, 1.35]); keys.push([Math.min(flowAt, at(i + 1) - 0.3), x, y + 20, 1.35]); });
  keys.push([flowAt + 0.35, 0, 0, 0.9], [d, 0, 0, 0.95]);
  return (
    <AbsoluteFill style={{background: BG}}>
      <World t={t} keys={keys} id="cd">
        <svg width={2000} height={400} style={{position: 'absolute', left: -1000, top: -200, overflow: 'visible'}}>
          <path d="M 0 200 C 400 -40, 700 420, 1000 200 S 1600 -40, 2000 200" fill="none" stroke={V} strokeWidth={10} strokeLinecap="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - flow)} /></svg>
        {s.cards.map(([a, b], i) => { const [x, y] = pos(i);
          return <At key={a} x={x} y={y * (1 - flow)}><Pop t={t} at={at(i)}><Card w={440} style={{textAlign: 'center', border: flow > 0.5 ? `3px solid ${V}` : undefined}}>
            <div style={{...T(56, flow > 0.5 ? V : INK, DISP), whiteSpace: 'normal'}}>{a}</div><div style={{...T(30, '#777'), marginTop: 12, whiteSpace: 'normal', lineHeight: 1.2}}>{b}</div></Card></Pop></At>; })}
        {s.flow && <At x={0} y={330}><div style={{...T(84, INK, DISP), opacity: k(t, [flowAt + 0.3, flowAt + 0.7], [0, 1])}}><Words t={s.flow} t0={t} at={flowAt + 0.3} hot={['flow.', 'flow']} /></div></At>}
      </World>
    </AbsoluteFill>
  );
};

// people and their apps: each row lands on its spoken line, then the rows scatter ("different people, different apps")
const People: React.FC<P<Extract<Scene, {kind: 'people'}>>> = ({s, t, d, m}) => {
  const n = s.rows.length, at = (i: number) => (m[i] ?? (i * d) / (n + 1)) + 0.05;
  const afterAt = s.after ? (m[n] ?? d * 0.8) : d + 1, sc = k(t, [afterAt, afterAt + 0.6], [0, 1], IO);
  const ky = (i: number) => -330 + i * 140;
  const focus = Math.min(n - 1, s.rows.findIndex((_, i) => t < at(i + 1)) < 0 ? n - 1 : s.rows.findIndex((_, i) => t < at(i + 1)));
  const c = cam(t, [[0, 0, ky(0), 1.25], ...s.rows.map((_, i) => [at(i) + 0.25, 0, ky(i) * 0.6, 1.2] as Key), [afterAt, 0, 0, 1.0], [d, 0, 0, 0.95]]);
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{transform: `scale(${c.z}) translateY(${-c.y}px)`}}>
        {s.rows.map(([who, apps], i) => { const a = k(t, [at(i), at(i) + 0.35], [0, 1]), dx = (random(`x${i}`) - 0.5) * 1300 * sc, dy = (random(`y${i}`) - 0.5) * 500 * sc;
          return <div key={who} style={{position: 'absolute', left: 960 - 560 + dx, top: 540 + ky(i) - 50 + dy, width: 1120, display: 'flex', alignItems: 'center', gap: 28, opacity: a * (1 - sc * 0.3), transform: `translateX(${(1 - a) * -80}px) rotate(${sc * (random(`r${i}`) - 0.5) * 18}deg)`, filter: i === focus && sc < 0.1 ? undefined : `blur(${sc * 2}px)`}}>
            <span style={{...T(66, i === focus && sc < 0.1 ? INK : '#9a9ab0'), width: 560, textAlign: 'right'}}>{who}</span>
            {apps.map((ap, j) => <Pop key={ap} t={t} at={at(i) + 0.15 + j * 0.12}><Icon app={ap} s={112} /></Pop>)}</div>; })}
      </AbsoluteFill>
      {s.after && <div style={{position: 'absolute', top: 470, width: '100%', ...T(96, INK, DISP), opacity: k(t, [afterAt + 0.2, afterAt + 0.5], [0, 1])}}><Words t={s.after} t0={t} at={afterAt + 0.2} hot={['Different', 'different']} /></div>}
    </AbsoluteFill>
  );
};

// 3D LAND-VIEW mockup: the FansaChat workspace lies on a bright floor, the camera glides, step nodes lift and stand up,
// and the workflow lines leave the page and connect ABOVE it to the app tiles (founder's twoclipping rule)
const Land: React.FC<P<Extract<Scene, {kind: 'land'}>>> = ({s, t, d}) => {
  const n = s.steps.length, at = (i: number) => 0.6 + (i * (d * 0.62)) / Math.max(1, n);
  const tilt = k(t, [0, d], [58, 46], IO), rz = k(t, [0, d], [-10, -4], IO), z = k(t, [0, d], [1.2, 1.38], IO), cy = k(t, [0, d], [320, 250], IO);
  const per = n > 3 ? 3 : n, nx = (i: number) => (i % per - (Math.min(per, n - Math.floor(i / per) * per) - 1) / 2) * 400, ny = (i: number) => (n > 3 ? -150 + Math.floor(i / per) * 270 : -40);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 80% at 50% 30%, #ffffff, #e4e3f3)', perspective: 1700, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d', transform: `translateY(${cy}px) scale(${z}) rotateX(${tilt}deg) rotateZ(${rz}deg)`}}>
        {/* the page on the floor */}
        <div style={{position: 'absolute', left: -700, top: -450, width: 1400, height: 900, borderRadius: 34, background: '#fff', boxShadow: '0 60px 120px rgba(40,40,110,.22)', display: 'flex', overflow: 'hidden'}}>
          <div style={{width: 250, background: '#f4f4fa', padding: 30, boxSizing: 'border-box'}}><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Logo s={44} /><span style={T(28, INK, DISP)}>FansaChat</span></div>
            {['Workspace', 'Workflows', 'Approvals', 'Team'].map((x, i) => <div key={x} style={{...T(24, i === 1 ? V : '#777'), marginTop: 34}}>{x}</div>)}</div>
          <div style={{flex: 1, padding: 44}}><div style={T(40, INK, DISP)}>{s.title}</div>
            {Array.from({length: 6}).map((_, i) => <div key={i} style={{height: 26, marginTop: 30, borderRadius: 13, background: i % 3 ? '#f0f0f6' : '#e6e4ff', width: `${90 - (i % 3) * 18}%`}} />)}</div>
        </div>
        {/* connection lines ABOVE the page */}
        <svg width={1400} height={600} style={{position: 'absolute', left: -700, top: -300, overflow: 'visible', transform: 'translateZ(150px)'}}>
          {s.steps.slice(1).map((_, i) => { const x1 = nx(i) + 700, x2 = nx(i + 1) + 700, y1 = ny(i) + 300, y2 = ny(i + 1) + 300, p = k(t, [at(i) + 0.2, at(i + 1)], [0, 1], IO);
            return <path key={i} d={`M ${x1} ${y1} C ${x1} ${y1 - 190}, ${x2} ${y2 - 190}, ${x2} ${y2}`} fill="none" stroke={V} strokeWidth={6} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - p)} />; })}
        </svg>
        {/* step nodes lift off the page and stand up toward the lens */}
        {s.steps.map(([label, app], i) => { const l = k(t, [at(i), at(i) + 0.5], [0, 1], Easing.bezier(0.2, 1.2, 0.4, 1));
          return <div key={label} style={{position: 'absolute', left: nx(i) - 170, top: ny(i) - 50, width: 340, transformStyle: 'preserve-3d', transform: `translateZ(${l * 150}px) rotateX(${-tilt * l}deg)`, opacity: Math.min(1, l * 2)}}>
            <Card w={340} style={{padding: 22, display: 'flex', alignItems: 'center', gap: 14, border: `3px solid ${l > 0.9 ? OK : '#ececf3'}`}}>{app && <Icon app={app} s={70} />}<span style={{...T(32), whiteSpace: 'normal', lineHeight: 1.15}}>{label}</span></Card></div>; })}
      </div>
      {s.caption && <div style={{position: 'absolute', bottom: 120, width: '100%', ...T(64, INK, DISP)}}><Words t={s.caption} t0={t} at={Math.max(0.3, d - 2.4)} hot={s.hot} /></div>}
    </AbsoluteFill>
  );
};

// pricing: four tier cards in a row, the camera follows each as its pain line + price are spoken
const Tiers: React.FC<P<Extract<Scene, {kind: 'tiers'}>>> = ({s, t, d, m}) => {
  const n = s.tiers.length, pain = (i: number) => m[i * 2] ?? (i * d) / n, price = (i: number) => m[i * 2 + 1] ?? pain(i) + 1.5;
  const x = (i: number) => -780 + i * 520;
  const keys: Key[] = [[0, x(0), 0, 1.3]];
  s.tiers.forEach((_, i) => { if (i) keys.push([pain(i) - 0.3, x(i - 1), 0, 1.3], [pain(i) + 0.1, x(i), 0, 1.3]); });
  keys.push([price(n - 1) + 1.0, x(n - 1), 0, 1.3], [price(n - 1) + 1.6, 0, 0, 0.82], [d, 0, 0, 0.85]);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#f8f8fc,#ecebff)'}}>
      <World t={t} keys={keys} id="tr">
        {s.tiers.map((tr, i) => { const a = k(t, [pain(i), pain(i) + 0.35], [0, 1]), pr = k(t, [price(i), price(i) + 0.35], [0, 1], Easing.bezier(0.2, 1.4, 0.4, 1));
          return <At key={tr.name} x={x(i)} y={0}><div style={{opacity: Math.max(0.15, a), transform: `translateY(${(1 - a) * 60}px)`}}><Card w={460} style={{padding: 34, border: pr > 0.5 ? `3px solid ${V}` : undefined}}>
            <div style={T(30, '#777')}>{tr.who}</div>
            <div style={{...T(28, '#555'), whiteSpace: 'normal', lineHeight: 1.3, marginTop: 18, minHeight: 110}}>{tr.pains}</div>
            <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 12, opacity: Math.min(1, Math.max(0, pr) * 1.4), transform: `scale(${0.7 + 0.3 * pr})`, transformOrigin: 'left center'}}>
              <span style={T(44, V, DISP)}>{tr.name}</span><span style={T(72, INK, DISP)}>{tr.price}</span><span style={T(28, '#777')}>/ month</span></div></Card></div></At>; })}
      </World>
    </AbsoluteFill>
  );
};

const Team: React.FC<P<Extract<Scene, {kind: 'team'}>>> = ({s, t, d, m}) => {
  const short = d < 3.6; // a single trust line: show only the Approve -> Connected moment
  const trustAt = short ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55;
  const pr0 = short ? 0.5 : 0.6, press = k(t, [trustAt + pr0, trustAt + pr0 + 0.15, trustAt + pr0 + 0.3], [1, 0.92, 1], Easing.linear), conn = k(t, [trustAt + pr0 + 0.3, trustAt + pr0 + 0.7], [0, 1], IO);
  const [b0, b1] = s.button ?? ['Approve', 'Connected ✓'];
  const keys: Key[] = short ? [[0, 0, 360, 1.3], [d, 0, 360, 1.36]] : [[0, 0, 0, 1.2], [trustAt - 0.6, 0, 40, 1.12], [trustAt + 0.1, 0, 330, 1.5], [d, 0, 320, 1.45]];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#f6f6fb,#ebeaff)'}}>
      <World t={t} keys={keys} id="tm">
        {!short && <At x={0} y={-60}><Pop t={t} at={0.05}><Card w={1100} style={{padding: 36}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><span style={T(44, INK, DISP)}>Team workspace</span>
            <div style={{display: 'flex'}}>{['#f2a65a', '#6468D8', '#2fbf71', '#e05d8b'].map((c, i) => <div key={c} style={{width: 64, height: 64, borderRadius: 99, background: c, border: '4px solid #fff', marginLeft: -14, transform: `scale(${k(t, [0.4 + i * 0.15, 0.7 + i * 0.15], [0, 1], OUT)})`}} />)}</div></div>
          {s.rows.map(([r, who], i) => <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, padding: '20px 24px', borderRadius: 16, background: '#f5f5fa', opacity: k(t, [0.9 + i * 0.2, 1.2 + i * 0.2], [0, 1])}}>
            <span style={T(34)}>{r}</span><span style={{...T(26, '#888')}}>{who}</span></div>)}
        </Card></Pop></At>}
        {s.chip && !short && <At x={360} y={-330}><Pop t={t} at={1.6}><div style={{padding: '14px 28px', borderRadius: 30, background: '#fff', border: `2px dashed ${VL}`, ...T(32, V)}}>{s.chip}</div></Pop></At>}
        <At x={0} y={330}><div style={{opacity: k(t, [trustAt - 0.1, trustAt + 0.2], [0, 1]), transform: `scale(${press})`}}>
          <div style={{width: 320 + 140 * conn, height: 110, borderRadius: 60, background: interpolateColors(conn, [0, 1], [V, OK]), display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(50, '#fff', DISP), boxShadow: '0 20px 50px rgba(70,60,160,.3)'}}>{conn < 0.5 ? b0 : b1}</div></div></At>
        <At x={0} y={short ? 200 : 470}><div style={{...T(short ? 56 : 40, short ? INK : '#555'), width: short ? 1300 : undefined, whiteSpace: short ? 'normal' : 'nowrap', textAlign: 'center', lineHeight: 1.2, opacity: k(t, short ? [0.05, 0.3] : [trustAt + 1.2, trustAt + 1.5], [0, 1])}}><Words t={s.trust} t0={t} at={short ? 0.05 : trustAt + 1.2} hot={['approve', 'pay', "don't"]} wrap={short} /></div></At>
      </World>
    </AbsoluteFill>
  );
};

const End: React.FC<P<Extract<Scene, {kind: 'end'}>>> = ({t, d, m}) => {
  const bio = m[1] ?? d - 1.4;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [0, d], [1.06, 1], Easing.bezier(0.2, 0.9, 0.3, 1))})`}}>
      <div style={{position: 'absolute', top: 190, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={120} /></Pop><span style={T(96, INK, DISP)}><Rise t={t} at={0.2}>FansaChat</Rise></span></div>
      <div style={{position: 'absolute', top: 400, ...T(60)}}><Words t="Get every update first." t0={t} at={0.4} hot={['first.']} /></div>
      <div style={{position: 'absolute', top: 560, display: 'flex', gap: 34}}>
        <Pop t={t} at={1.2}><div style={{padding: '26px 50px', borderRadius: 60, background: V, ...T(48, '#fff', DISP)}}>Join the waitlist</div></Pop>
        <Pop t={t} at={1.7}><div style={{padding: '26px 50px', borderRadius: 60, background: '#fff', border: `3px solid ${V}`, ...T(48, V, DISP)}}>Telegram community</div></Pop></div>
      <div style={{position: 'absolute', top: 760, ...T(44, '#666'), opacity: k(t, [bio, bio + 0.4], [0, 1])}}>Link in bio</div>
    </AbsoluteFill>
  );
};

const VIEW: Record<Scene['kind'], React.FC<P<any>>> = {hook: Hook, brand: Brand, composer: Composer, night: Night, cycle: Cycle, cards: Cards, people: People, land: Land, tiers: Tiers, team: Team, end: End};
const BACK: Record<Scene['kind'], string> = {hook: BG, brand: BG, composer: BG, night: 'radial-gradient(80% 60% at 50% 45%, #1b1c2b, #07070c)', cycle: 'linear-gradient(180deg,#ffffff, #e9e8ff)', cards: BG,
  people: BG, land: 'radial-gradient(90% 80% at 50% 30%, #ffffff, #e4e3f3)', tiers: 'linear-gradient(180deg,#f8f8fc,#ecebff)', team: 'linear-gradient(180deg,#f6f6fb,#ebeaff)', end: 'radial-gradient(80% 60% at 50% 40%, #ffffff, #e7e6fb)'};

// ---- timeline + sound design -------------------------------------------------------------------------------------
export const adSeconds = (sp: Spec) => sp.end + 1.3;
const timeline = (sp: Spec) => sp.scenes.map((sc, i) => {
  const a = i ? Math.max(0, sp.times[sc.from] - 0.15) : 0;
  const nx = sp.scenes[i + 1], b = nx ? Math.max(0, sp.times[nx.from] - 0.15) : adSeconds(sp);
  const lines = sp.times.map((x, j) => [j, x] as const).filter(([j]) => j >= sc.from && (!nx || j < nx.from)).map(([, x]) => Math.max(0, x - a));
  return {sc, a, b, m: lines};
});
const sfxFor = (sp: Spec): [number, string, number][] => {
  const out: [number, string, number][] = [[0.05, 'hook_bass_impact_1.2s', 0.5]];
  timeline(sp).forEach(({sc, a, b, m}, i) => {
    const d = b - a;
    if (i) out.push([a - 0.12, sc.kind === 'end' ? 'transition_camera_flash_1' : `transition_whoosh_${['0.25s', '0.45s', '0.7s'][i % 3]}`, 0.48]);
    if (sc.kind === 'hook') sc.phrases.forEach((_, j) => out.push([a + 0.05 + (j / sc.phrases.length) * d * 0.86, `text_mouth_pop_${(j % 4) + 1}`, 0.45]));
    if (sc.kind === 'brand') { const L = sc.line ? (m[1] ?? 2.6) : 0; out.push([a + L, 'node_pop_4', 0.5]); if (sc.apps) out.push([a + Math.max(L + 1.2, d * 0.55), 'counter_roll_riser_1.5s', 0.38]); }
    if (sc.kind === 'composer') { const tEnd = Math.min(d * 0.55, 0.3 + sc.say.length * 0.045); out.push([a + 0.3, 'typing_keyboard_2.0s', 0.42], [a + tEnd, 'ui_click_1', 0.6]); sc.steps.forEach((_, j) => out.push([a + tEnd + 0.2 + j * 0.32, `node_pop_${(j % 5) + 1}`, 0.4])); out.push([a + tEnd + 0.2 + (sc.steps.length - 1) * 0.32 + 0.45, 'success_chime_C', 0.45]); }
    if (sc.kind === 'night') out.push([a + 0.05, 'ui_tick_2', 0.4], [a + d * 0.55, 'buildup_metallic_riser_0.8s', 0.3]);
    if (sc.kind === 'cycle') sc.items.forEach((_, j) => out.push([a + (j * ((sc.line ? (m[1] ?? d * 0.6) : d) - 0.1)) / sc.items.length, `ui_click_${(j % 3) + 1}`, 0.42]));
    if (sc.kind === 'cards' || sc.kind === 'people') m.forEach((x, j) => out.push([a + x + 0.05, `node_pop_${(j % 5) + 1}`, 0.45]));
    if (sc.kind === 'land') sc.steps.forEach((_, j) => out.push([a + 0.6 + (j * d * 0.62) / Math.max(1, sc.steps.length), `node_pop_${(j % 5) + 1}`, 0.42]));
    if (sc.kind === 'tiers') m.forEach((x, j) => out.push([a + x, j % 2 ? 'success_chime_G' : 'ui_tick_1', j % 2 ? 0.32 : 0.4]));
    if (sc.kind === 'team') { const tr = d < 3.6 ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55; out.push([a + 0.05, 'node_pop_1', 0.4], [a + tr + 0.6, 'ui_click_1', 0.65], [a + tr + 0.9, 'success_chime_C', 0.5]); }
    if (sc.kind === 'end') out.push([a + 0.05, 'hook_bass_impact_0.8s', 0.45], [a + 1.2, 'node_pop_4', 0.45], [a + 1.7, 'node_pop_5', 0.45]);
  });
  return out;
};

export const Ad: React.FC<{spec: Spec; music?: boolean}> = ({spec, music = false}) => {
  const f = useCurrentFrame(), {fps, width, height, durationInFrames} = useVideoConfig(), s = f / fps;
  const tl = React.useMemo(() => timeline(spec), [spec]), sfx = React.useMemo(() => sfxFor(spec), [spec]);
  const i = Math.max(0, tl.findIndex(({a, b}) => s >= a && s < b)), {sc, a, b, m} = tl[i];
  const t = s - a, d = b - a, C = VIEW[sc.kind];
  const inn = i ? k(t, [0, 0.2], [1, 0]) : 0, out = i < tl.length - 1 ? k(t, [d - 0.15, d], [0, 1], IN) : 0;
  const fit = height > width ? width / 1500 : Math.max(width / 1920, height / 1080);
  return (
    <AbsoluteFill style={{background: BACK[sc.kind], overflow: 'hidden'}}>
      <style>{css}</style>
      <Audio src={staticFile(`audio/${spec.id}/vo.wav`)} />
      {sfx.map(([at, file, v], j) => <Sequence key={j} from={Math.max(0, Math.round(at * fps))}><Audio src={staticFile(`sfx/proc/${file}.ogg`)} volume={v} /></Sequence>)}
      {music && <Audio src={staticFile(`audio/${spec.music}`)} volume={(fr) => 0.24 * Math.min(1, fr / 30) * Math.min(1, (durationInFrames - fr) / 90)} />}
      <AbsoluteFill style={{transform: `scale(${1 - inn * 0.06 + out * 0.18})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 8}px)` : undefined, opacity: 1 - out * 0.4}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${fit})`}}>
          <AbsoluteFill><C s={sc} t={t} d={d} m={m} /></AbsoluteFill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const ALL_LOGOS = LOGOS as string[];
