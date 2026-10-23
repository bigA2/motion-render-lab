// AdKit v9 — engine for the P01–P07 official ads. Each ad = Spec (theme + scenes); timing comes from the chosen VO
// (public/audio/<id>/times.json = line starts, words.json = word starts), so reveals and camera landings hit WORDS.
// Founder rules (memory feedback_ad_visual_rules_bright): bright only, each video its own gradient + animated background,
// floating topic assets, every hot word its own colour, AppleMorph shared-element handoffs, GlassUI 3D glass stacks,
// the REAL FansaChat workflow tree (fansa-landing/public/workflow.html) staged in 3D with a node-tracking camera.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const FONT = 'AdFont', DISP = 'AdDisp';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}@font-face{font-family:${DISP};src:url(${staticFile('fonts/BricolageGrotesque-800.woff2')}) format('woff2');}`;
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.7, 0, 0.84, 0);
const k = (t: number, i: number[], o: number[], e = OUT) => interpolate(t, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const INK = '#141018', OK = '#12A150', PERI = '#8B8FE8', BLUSH = '#F2A8CE';
// hot-word palette: every colour >= 3:1 on our bright backgrounds (no yellow/amber)
const HOT = ['#5B5FE0', '#E8336D', '#0E8FD8', '#12A150', '#D9480F', '#9333EA', '#0F8F8F', '#C2185B'];
const T = (s: number, c = INK, f = FONT): React.CSSProperties => ({fontFamily: f, fontSize: s, color: c, whiteSpace: 'nowrap', lineHeight: 1});
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(k(t, [a, b], [0, s.length], Easing.linear)));
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$]/g, '');

// ---- spec types --------------------------------------------------------------------------------------------------
export type App = string; // 'ap/hubspot.png' | 'si/whatsapp.svg'
export type Theme = {bg: [string, string, string]; blob: [string, string, string]; assets: string[]};
export type Scene =
  | {kind: 'hook'; from: number; phrases: {text: string; hot?: string[]; chip?: string; app?: App}[]; big?: boolean}
  | {kind: 'brand'; from: number; line?: string; hot?: string[]; sub: string; apps?: App[]; chip?: string}
  | {kind: 'flow'; from: number; say: string; root: string; leaves: [string, App?][]; caption?: string; hot?: string[]; button?: string}
  | {kind: 'glass'; from: number; title?: string; bars: string[]; strike?: boolean; line?: string; hot?: string[]}
  | {kind: 'cycle'; from: number; prefix: string; items: string[]; line?: string; hot?: string[]}
  | {kind: 'cards'; from: number; cards: [string, string][]; flow?: string}
  | {kind: 'people'; from: number; rows: [string, App[]][]; after?: string}
  | {kind: 'tiers'; from: number; tiers: {name: string; price: string; who: string; pains: string}[]}
  | {kind: 'team'; from: number; rows: [string, string][]; chip?: string; trust: string; button?: [string, string]}
  | {kind: 'end'; from: number};
export type Spec = {id: string; music: string; times: number[]; end: number; words: [number, number, string][]; theme: Theme; scenes: Scene[]};

// ---- context: scene index (hot colours rotate per scene) + word times ---------------------------------------------
type Ctx = {si: number; words: [number, number, string][]; a: number};
const C = React.createContext<Ctx>({si: 0, words: [], a: 0});
const hotColor = (si: number, i: number) => HOT[(si * 3 + i) % HOT.length];
// first spoken time (scene-relative) of `text`'s first word at/after `after`; fallback when the word isn't found
const useWordAt = () => {
  const {words, a} = React.useContext(C);
  return (text: string, after: number, fallback: number) => {
    const w0 = norm(text.split(' ')[0]);
    const hit = words.find(([s, , w]) => s - a >= after - 0.05 && norm(w) === w0);
    return hit ? Math.max(0, hit[0] - a - 0.08) : fallback;
  };
};

// ---- primitives --------------------------------------------------------------------------------------------------
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number}> = ({t, at, children, d = 0.34}) => {
  const a = k(t, [at, at + d], [0, 1]);
  return <span style={{display: 'inline-block', opacity: a, filter: `blur(${(1 - a) * 12}px)`, transform: `translateY(${(1 - a) * 16}px)`}}>{children}</span>;
};
const Words: React.FC<{t: string; t0: number; at: number; gap?: number; hot?: string[]; wrap?: boolean; style?: React.CSSProperties; off?: number}> = ({t, t0, at, gap = 0.06, hot = [], wrap, style, off = 0}) => {
  const {si} = React.useContext(C);
  let h = 0;
  return (
    <div style={{display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap: '0 0.26em', ...style}}>
      {t.split(' ').map((w, i) => { const isHot = hot.some((x) => norm(x) === norm(w)); const c = isHot ? hotColor(si, off + h++) : undefined;
        return <Rise key={i} t={t0} at={at + i * gap}><span style={{color: c}}>{w}</span></Rise>; })}
    </div>
  );
};
const Pop: React.FC<{t: number; at: number; children: React.ReactNode}> = ({t, at, children}) => {
  const a = k(t, [at, at + 0.35], [0, 1], Easing.bezier(0.2, 1.25, 0.4, 1));
  return <div style={{opacity: Math.min(1, Math.max(0, a) * 1.5), transform: `scale(${0.7 + 0.3 * a})`}}>{children}</div>;
};
const Card: React.FC<{w: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 28, background: 'rgba(255,255,255,.92)', boxShadow: '0 26px 60px rgba(40,30,90,.14), inset 0 1px 0 #fff', border: '1px solid rgba(255,255,255,.9)', padding: 26, boxSizing: 'border-box', ...style}}>{children}</div>
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
const World: React.FC<{t: number; keys: Key[]; id: string; children: React.ReactNode}> = ({t, keys, id, children}) => {
  const c = cam(t, keys), p = cam(t - 1 / 60, keys);
  const bx = Math.min(30, Math.abs((c.x - p.x) * c.z) * 0.35), by = Math.min(30, Math.abs((c.y - p.y) * c.z) * 0.35);
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
type P<S> = {s: S; t: number; d: number; m: number[]};

// ---- animated backdrop: the video's gradient + drifting colour blobs + floating topic assets (parallax, bob) ----------
const Backdrop: React.FC<{theme: Theme; s: number; si: number; apps: App[]}> = ({theme, s, si, apps}) => {
  const {bg, blob, assets} = theme;
  const slots: [number, number, number, number][] = [[-90, 120, 1.0, 0.95], [1830, 160, 0.85, 0.9], [-60, 760, 0.8, 0.85], [1800, 820, 1.05, 0.95], [260, -40, 0.55, 0.6], [1540, -20, 0.6, 0.6], [180, 980, 0.6, 0.6], [1600, 1010, 0.55, 0.6]];
  const items = slots.map((sl, i) => (i < 6 || !apps.length ? {img: `heroes/${assets[(si * 3 + i) % assets.length]}`, app: false} : {img: `logos/${apps[i % apps.length]}`, app: true}));
  return (
    <AbsoluteFill style={{background: `linear-gradient(${125 + 10 * Math.sin(s * 0.2)}deg, ${bg[0]}, ${bg[1]} 55%, ${bg[2]})`}}>
      {blob.map((c, i) => { const x = 50 + 38 * Math.sin(s * (0.21 + i * 0.07) + i * 2), y = 50 + 34 * Math.cos(s * (0.17 + i * 0.05) + i);
        return <AbsoluteFill key={i} style={{background: `radial-gradient(38% 42% at ${x}% ${y}%, ${c}, rgba(255,255,255,0) 70%)`}} />; })}
      {items.map((it, i) => { const [x, y, sc, op] = slots[i], bob = Math.sin(s * (0.9 + i * 0.13) + i) * 18, rot = Math.sin(s * 0.5 + i) * 8;
        const enter = k(s, [0.2 + i * 0.12, 0.9 + i * 0.12], [0, 1]);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 230 * sc, height: 230 * sc, opacity: op * enter, transform: `translateY(${bob + (1 - enter) * 60}px) rotate(${rot}deg)`}}>
          {it.app ? <div style={{transform: `scale(${sc * 1.4})`}}><Icon app={it.img.replace('logos/', '')} s={110} /></div> : <Img src={staticFile(it.img)} style={{width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 24px 30px rgba(60,40,120,.18))'}} />}</div>; })}
    </AbsoluteFill>
  );
};

// ---- scenes ------------------------------------------------------------------------------------------------------
const Hook: React.FC<P<Extract<Scene, {kind: 'hook'}>>> = ({s, t, d}) => {
  const wordAt = useWordAt(), n = s.phrases.length;
  const ats: number[] = [];
  s.phrases.forEach((p, i) => ats.push(wordAt(p.text, i ? ats[i - 1] + 0.2 : 0, 0.05 + (i / n) * d * 0.86)));
  const pos = (i: number) => [i % 2 ? 620 : 40, i * 300];
  const keys: Key[] = [[0, pos(0)[0], 0, 1.45]];
  s.phrases.forEach((_, i) => { const [x, y] = pos(i); if (i) keys.push([ats[i] - 0.22, ...keys[keys.length - 1].slice(1)] as Key); keys.push([ats[i] + 0.12, x, y, 1.35], [Math.min(d, (ats[i + 1] ?? d) - 0.22), x + 70, y + 10, 1.35]); });
  return (
    <World t={t} keys={keys} id="hk">
      {s.phrases.map((p, i) => { const [x, y] = pos(i), last = i === n - 1 && s.big; return (
        <At key={i} x={x} y={y}><div style={{display: 'flex', alignItems: 'center', gap: 34}}>
          {p.app && <Pop t={t} at={ats[i] + 0.1}><Icon app={p.app} s={120} /></Pop>}
          <div style={T(last ? 130 : 100, INK, last ? DISP : FONT)}><Words t={p.text} t0={t} at={ats[i]} hot={p.hot} off={i * 2} /></div>
          {p.chip && <Pop t={t} at={ats[i] + 0.2}><div style={{padding: '14px 26px', borderRadius: 16, background: '#fff', border: `3px solid ${HOT[(i * 3 + 1) % HOT.length]}`, ...T(34, HOT[(i * 3 + 1) % HOT.length])}}>{p.chip}</div></Pop>}
        </div></At>); })}
    </World>
  );
};

// AppleMorph opening: words rise, a dot lands at the line end, the dot grows into the white FansaChat pill
const Brand: React.FC<P<Extract<Scene, {kind: 'brand'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt();
  const L = s.line ? (m[1] ?? 2.6) : 0, apps = s.apps ?? [];
  const lineOut = s.line ? k(t, [L - 0.4, L], [0, 1]) : 1;
  const dot = k(t, [L - 0.6, L - 0.3], [0, 1], OUT), grow = k(t, [L - 0.1, L + 0.5], [0, 1], OUT);
  const appsAt = apps.length ? wordAt('connected', L, Math.max(L + 1.2, d * 0.55)) : d;
  const pushIn = k(t, [L, d], [1, 1.08], Easing.bezier(0.2, 0.9, 0.3, 1));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${pushIn})`}}>
      {s.line && <div style={{position: 'absolute', width: 1500, ...T(84), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15, opacity: 1 - lineOut, filter: `blur(${lineOut * 12}px)`, transform: `translateY(${-lineOut * 60}px)`}}>
        <Words t={s.line} t0={t} at={0.05} gap={Math.min(0.2, (L - 0.8) / s.line.split(' ').length)} hot={s.hot} wrap /></div>}
      <div style={{position: 'absolute', width: 40 + 560 * grow, height: 40 + 110 * grow, borderRadius: 99, background: interpolateColors(grow, [0, 1], [INK, '#fff']),
        boxShadow: `0 ${30 * grow}px ${70 * grow}px rgba(70,60,160,${0.22 * grow})`, transform: `translate(${(1 - grow) * 420}px, ${(1 - grow) * 60}px) scale(${s.line ? dot : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, overflow: 'hidden'}}>
        {grow > 0.4 && <><div style={{opacity: k(t, [L + 0.2, L + 0.6], [0, 1])}}><Logo s={96} /></div><span style={{...T(84, INK, DISP)}}><Rise t={t} at={L + 0.3}>FansaChat</Rise></span></>}
      </div>
      <div style={{position: 'absolute', top: 650, ...T(50, '#3b3650')}}><Words t={s.sub} t0={t} at={L + 0.9} hot={['automation', 'autopilot', 'busywork', 'sentence', 'plain-English']} /></div>
      {apps.map((f, i) => { const a = (i / apps.length) * Math.PI * 2, r0 = 1300 + random(`r${i}`) * 500, r1 = 330 + (i % 2) * 70;
        const e = k(t, [appsAt + (i % 6) * 0.08, appsAt + 1.2 + (i % 6) * 0.08], [0, 1], OUT), r = r0 + (r1 - r0) * e;
        return <div key={f + i} style={{position: 'absolute', transform: `translate(${Math.cos(a + t * 0.04) * r * 1.5}px, ${Math.sin(a + t * 0.04) * r * 0.75}px) scale(${0.5 + 0.5 * e})`, opacity: e}}><Icon app={f} /></div>; })}
      {s.chip && <div style={{position: 'absolute', top: 760, padding: '14px 34px', borderRadius: 40, background: HOT[0], ...T(44, '#fff'), opacity: k(t, [appsAt + 0.3, appsAt + 0.7], [0, 1]), transform: `scale(${k(t, [appsAt + 0.3, appsAt + 0.8], [0.7, 1], OUT)})`}}>{s.chip}</div>}
    </AbsoluteFill>
  );
};

// THE REAL FansaChat builder (workflow.html): chat input on the left types the sentence, the preview grows the tree —
// root (you) -> split dots -> app leaves with labels, ink wires, then the pink flow runs every root->leaf path and
// "Approve & Run" turns into Running. Staged in 3D land view; the camera tracks the tree leaf by leaf.
const Flow: React.FC<P<Extract<Scene, {kind: 'flow'}>>> = ({s, t, d}) => {
  const n = s.leaves.length, morph = k(t, [0, 0.5], [0, 1], IO); // the white pill (AppleMorph) becomes the chat input
  const tEnd = Math.min(d * 0.32, 0.5 + s.say.length * 0.03), grow = (i: number) => tEnd + 0.25 + i * Math.min(0.45, (d * 0.38) / n);
  const runAt = grow(n - 1) + 0.6, flow = k(t, [runAt - 0.4, runAt + 0.6], [0, 1]), press = k(t, [runAt, runAt + 0.12, runAt + 0.25], [1, 0.92, 1], Easing.linear);
  const gap = Math.min(150, 620 / Math.max(1, n - 1)), ly = (i: number) => (i - (n - 1) / 2) * gap;
  const splits = [[230, (ly(0) + ly(Math.ceil(n / 2) - 1)) / 2], [230, (ly(Math.ceil(n / 2)) + ly(n - 1)) / 2]] as const;
  const sp = (i: number) => (n > 2 ? splits[i < Math.ceil(n / 2) ? 0 : 1] : [230, ly(i)]);
  const keys: Key[] = [[0, -480, 290, 1.4], [tEnd, -460, 270, 1.3], [grow(0) + 0.1, 380, ly(0), 1.35]];
  s.leaves.forEach((_, i) => i && keys.push([grow(i) + 0.15, 380, ly(i), 1.35]));
  keys.push([runAt - 0.3, 100, 0, 0.92], [runAt + 0.4, 160, 60, 0.95], [d, 180, 60, 1.0]);
  const tilt = k(t, [0, d], [26, 14], IO), rz = k(t, [0, d], [-6, -2], IO);
  const wire = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
  return (
    <AbsoluteFill style={{perspective: 2000}}>
      <World t={t} keys={keys} id="fl">
        <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateZ(${rz}deg)`}}>
          <div style={{position: 'absolute', left: -820, top: -440, width: 1640, height: 880, borderRadius: 36, background: 'rgba(255,255,255,.94)', boxShadow: '0 70px 140px rgba(40,30,110,.20)', border: '1px solid #fff'}} />
          <div style={{position: 'absolute', left: -780, top: -400, width: 600, height: 800, borderRadius: 26, background: '#f6f5fc', padding: 28, boxSizing: 'border-box'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Logo s={44} /><span style={T(28, INK, DISP)}>FansaChat</span></div>
            <div style={{marginTop: 30, padding: '18px 22px', borderRadius: 18, background: '#fff', ...T(26, '#444'), whiteSpace: 'normal', lineHeight: 1.35, opacity: k(t, [tEnd, tEnd + 0.3], [0, 1])}}>Got it. Here's your workflow — approve it to run.</div>
          </div>
          <div style={{position: 'absolute', left: -780 + (1 - morph) * 180, top: 250 - (1 - morph) * 350, width: 600 * morph + 240 * (1 - morph), minHeight: 120, borderRadius: 26 + (1 - morph) * 40, background: '#fff', boxShadow: '0 20px 50px rgba(60,40,140,.16)', border: `2px solid ${PERI}`, padding: '20px 24px', boxSizing: 'border-box', transform: 'translateZ(40px)'}}>
            <div style={{...T(28, INK), whiteSpace: 'normal', lineHeight: 1.3}}>{typed(s.say, t, 0.5, tEnd)}<span style={{opacity: Math.floor(t * 3) % 2, color: PERI}}>|</span></div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10}}><span style={{width: 48, height: 48, borderRadius: 99, background: t > tEnd ? PERI : '#ddd', ...T(26, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</span></div>
          </div>
          <svg width={1000} height={900} style={{position: 'absolute', left: -100, top: -450, overflow: 'visible'}}>
            {s.leaves.map((_, i) => { const [sx, sy] = sp(i), g = k(t, [grow(i) - 0.1, grow(i) + 0.3], [0, 1], IO);
              return <g key={i} transform="translate(100 450)">
                <path d={wire(0, 0, sx, sy)} fill="none" stroke={INK} strokeWidth={2.4} strokeDasharray={400} strokeDashoffset={400 * (1 - k(t, [tEnd + 0.1, tEnd + 0.4], [0, 1]))} />
                <path d={wire(sx, sy, 470, ly(i))} fill="none" stroke={INK} strokeWidth={2.4} strokeDasharray={500} strokeDashoffset={500 * (1 - g)} />
                <path d={wire(0, 0, sx, sy) + ' ' + wire(sx, sy, 470, ly(i)).replace('M', 'L')} fill="none" stroke={BLUSH} strokeWidth={7} strokeLinecap="round" strokeDasharray="22 260" strokeDashoffset={-((t * 160 + i * 40) % 282)} opacity={flow} style={{filter: 'drop-shadow(0 0 6px rgba(242,168,206,.95))'}} />
              </g>; })}
          </svg>
          <div style={{position: 'absolute', left: -38, top: -38, width: 76, height: 76, borderRadius: 99, background: '#fff', border: `2.5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(22, INK), transform: `translateZ(30px) scale(${k(t, [tEnd, tEnd + 0.3], [0, 1], OUT)})`}}>{s.root}</div>
          {(n > 2 ? splits : []).map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: 99, background: '#f3f2fc', border: '2px solid #8b87c9', transform: `scale(${k(t, [tEnd + 0.2, tEnd + 0.45], [0, 1], OUT)})`}} />)}
          {s.leaves.map(([label, app], i) => { const l = k(t, [grow(i), grow(i) + 0.4], [0, 1], Easing.bezier(0.2, 1.2, 0.4, 1));
            return <div key={label} style={{position: 'absolute', left: 470 - 46, top: ly(i) - 46, display: 'flex', alignItems: 'center', gap: 18, transform: `translateZ(${l * 60}px) scale(${Math.max(0, l)})`, transformOrigin: '46px 46px'}}>
              <div style={{width: 92, height: 92, borderRadius: 99, background: '#fff', border: `2.5px solid ${flow > 0.5 ? BLUSH : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(20,16,24,.18)'}}>{app ? <Img src={staticFile(`logos/${app}`)} style={{width: 52, height: 52, objectFit: 'contain'}} /> : <span style={T(30, INK)}>{i + 1}</span>}</div>
              <span style={{...T(32, INK), fontWeight: 600, background: 'rgba(255,255,255,.85)', padding: '6px 14px', borderRadius: 12}}>{label}</span></div>; })}
          <div style={{position: 'absolute', left: 140, top: 330, transform: `translateZ(50px) scale(${press})`, opacity: k(t, [runAt - 0.6, runAt - 0.3], [0, 1])}}>
            <div style={{padding: '22px 46px', borderRadius: 50, background: interpolateColors(k(t, [runAt + 0.2, runAt + 0.5], [0, 1]), [0, 1], [PERI, OK]), ...T(40, '#fff', DISP), boxShadow: '0 20px 50px rgba(70,60,160,.3)'}}>{t < runAt + 0.35 ? (s.button ?? 'Approve & Run') : 'Running ✓'}</div></div>
        </div>
      </World>
      {s.caption && <div style={{position: 'absolute', bottom: 90, width: '100%', ...T(66, INK, DISP)}}><Words t={s.caption} t0={t} at={Math.max(runAt + 0.3, d - 2.2)} hot={s.hot} /></div>}
    </AbsoluteFill>
  );
};

// GlassUI: 3D tilted stack of bright glass bars; each bar flies in on its spoken word; optional strike-through
const Glass: React.FC<P<Extract<Scene, {kind: 'glass'}>>> = ({s, t, d}) => {
  const wordAt = useWordAt(), n = s.bars.length;
  const ats: number[] = []; s.bars.forEach((b, i) => ats.push(wordAt(b, i ? ats[i - 1] + 0.15 : 0, 0.2 + (i * d * 0.6) / n)));
  const lineAt = s.line ? Math.max(ats[n - 1] + 0.6, d * 0.62) : d + 1, out = k(t, [lineAt - 0.2, lineAt + 0.4], [0, 1], IO);
  return (
    <AbsoluteFill style={{perspective: 1800}}>
      {s.title && <div style={{position: 'absolute', top: 110, width: '100%', ...T(64, INK, DISP), opacity: 1 - out}}><Words t={s.title} t0={t} at={0.05} hot={s.hot} /></div>}
      <div style={{position: 'absolute', left: '50%', top: '54%', transformStyle: 'preserve-3d', transform: `rotateX(${50 - 8 * k(t, [0, d], [0, 1])}deg) rotateZ(${-26 + 8 * k(t, [0, d], [0, 1])}deg) scale(${(1.6 + 0.2 * k(t, [0, d], [0, 1], IO)) * (1 - 0.5 * out)})`}}>
        {s.bars.map((b, i) => { const e = k(t, [ats[i], ats[i] + 0.4], [1, 0], OUT), y = (i - (n - 1) / 2) * 118, c = HOT[(i * 3) % HOT.length], st = s.strike ? k(t, [lineAt - 0.3 + i * 0.05, lineAt + i * 0.05], [0, 1]) : 0;
          return <div key={b + i} style={{position: 'absolute', left: -390, top: y - 46, width: 780, height: 92, borderRadius: 22, transform: `translateZ(${-e * 300}px)`, opacity: (1 - e) * (1 - out * 0.6),
            background: 'linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.7))', border: `2px solid ${c}55`, boxShadow: 'inset 0 2px 0 #fff, 0 26px 50px rgba(40,30,90,.18)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', boxSizing: 'border-box'}}>
            <div style={{width: 36, height: 36, borderRadius: 10, background: c}} />
            <span style={{...T(36, INK), position: 'relative'}}>{b}<span style={{position: 'absolute', left: 0, top: '52%', height: 4, background: HOT[1], width: `${st * 100}%`}} /></span></div>; })}
      </div>
      {s.line && <div style={{position: 'absolute', top: 470, width: '100%', ...T(84, INK, DISP), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15, opacity: k(t, [lineAt, lineAt + 0.3], [0, 1])}}><Words t={s.line} t0={t} at={lineAt} hot={s.hot} wrap /></div>}
    </AbsoluteFill>
  );
};

const Cycle: React.FC<P<Extract<Scene, {kind: 'cycle'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt();
  const lineAt = s.line ? wordAt(s.line, 0.5, m[1] ?? d * 0.6) : d + 1;
  const ats: number[] = []; s.items.forEach((it, i) => ats.push(wordAt(it, i ? ats[i - 1] + 0.1 : 0, (i * (lineAt - 0.1)) / s.items.length)));
  const w = Math.max(0, ats.filter((x) => t >= x).length - 1), lw = t - ats[w];
  const heavy = k(t, [lineAt - 0.1, lineAt + 0.3], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 300, ...T(64, '#4a4560'), opacity: 1 - heavy}}>{s.prefix}</div>
      <div style={{position: 'absolute', top: 400, ...T(110, HOT[w % HOT.length], DISP), opacity: (1 - heavy) * k(lw, [0, 0.25], [0, 1]), filter: `blur(${k(lw, [0, 0.25], [10, 0])}px)`, transform: `translateY(${k(lw, [0, 0.3], [50, 0])}px)`}}>{s.items[w]}</div>
      <div style={{position: 'absolute', top: 640, display: 'flex', gap: 14, opacity: 1 - heavy}}>{s.items.map((_, i) => <div key={i} style={{width: i === w ? 54 : 16, height: 16, borderRadius: 8, background: i <= w ? HOT[i % HOT.length] : '#d6d4f2'}} />)}</div>
      {s.line && heavy > 0 && <div style={{position: 'absolute', ...T(84), whiteSpace: 'normal', width: 1400, textAlign: 'center', lineHeight: 1.2}}><Words t={s.line} t0={t} at={lineAt} gap={0.1} hot={s.hot} wrap /></div>}
    </AbsoluteFill>
  );
};

const Cards: React.FC<P<Extract<Scene, {kind: 'cards'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), n = s.cards.length;
  const ats: number[] = []; s.cards.forEach(([a], i) => ats.push(wordAt(a, i ? ats[i - 1] + 0.15 : 0, m[i] ?? (i * d) / (n + 1))));
  const flowAt = s.flow ? wordAt(s.flow, ats[n - 1] + 0.3, m[n] ?? d * 0.75) : d + 1, flow = k(t, [flowAt, flowAt + 0.75], [0, 1], IO);
  const pos = (i: number) => (n > 3 ? [-560 + (i % 3) * 560, Math.floor(i / 3) ? 200 : -200] : [-560 + (1120 * i) / Math.max(1, n - 1), i % 2 ? 140 : -140]);
  const keys: Key[] = [[0, pos(0)[0], pos(0)[1], 1.35]];
  s.cards.forEach((_, i) => { const [x, y] = pos(i); if (i) keys.push([ats[i] - 0.25, ...keys[keys.length - 1].slice(1)] as Key, [ats[i] + 0.1, x, y, 1.35]); keys.push([Math.min(flowAt, (ats[i + 1] ?? flowAt) - 0.25), x, y + 20, 1.35]); });
  keys.push([flowAt + 0.35, 0, 0, 0.9], [d, 0, 0, 0.95]);
  return (
    <World t={t} keys={keys} id="cd">
      <svg width={2000} height={400} style={{position: 'absolute', left: -1000, top: -200, overflow: 'visible'}}>
        <path d="M 0 200 C 400 -40, 700 420, 1000 200 S 1600 -40, 2000 200" fill="none" stroke={HOT[2]} strokeWidth={10} strokeLinecap="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - flow)} /></svg>
      {s.cards.map(([a, b], i) => { const [x, y] = pos(i), c = HOT[(i * 3 + 1) % HOT.length];
        return <At key={a} x={x} y={y * (1 - flow)}><Pop t={t} at={ats[i]}><Card w={500} style={{textAlign: 'center', borderTop: `8px solid ${c}`}}>
          <div style={{...T(66, c, DISP), whiteSpace: 'normal'}}>{a}</div><div style={{...T(34, '#666'), marginTop: 12, whiteSpace: 'normal', lineHeight: 1.2}}>{b}</div></Card></Pop></At>; })}
      {s.flow && <At x={0} y={330}><div style={{...T(88, INK, DISP), opacity: k(t, [flowAt + 0.2, flowAt + 0.6], [0, 1])}}><Words t={s.flow} t0={t} at={flowAt + 0.2} hot={['flow.', 'flow', 'time.', 'single']} /></div></At>}
    </World>
  );
};

const People: React.FC<P<Extract<Scene, {kind: 'people'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), n = s.rows.length;
  const ats: number[] = []; s.rows.forEach(([w], i) => ats.push(wordAt(w, i ? ats[i - 1] + 0.15 : 0, m[i] ?? (i * d) / (n + 1))));
  const afterAt = s.after ? wordAt(s.after, ats[n - 1] + 0.3, m[n] ?? d * 0.8) : d + 1, sc = k(t, [afterAt, afterAt + 0.6], [0, 1], IO);
  const ky = (i: number) => (i - (n - 1) / 2) * 150;
  const focus = Math.max(0, ats.filter((x) => t >= x).length - 1);
  const c = cam(t, [[0, 0, ky(0), 1.25], ...ats.map((x, i) => [x + 0.2, 0, ky(i) * 0.6, 1.2] as Key), [afterAt, 0, 0, 1.0], [d, 0, 0, 0.96]]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${c.z}) translateY(${-c.y}px)`}}>
        {s.rows.map(([who, apps], i) => { const a = k(t, [ats[i], ats[i] + 0.35], [0, 1]), dx = (random(`x${i}`) - 0.5) * 1300 * sc, dy = (random(`y${i}`) - 0.5) * 500 * sc, on = i === focus && sc < 0.1;
          return <div key={who} style={{position: 'absolute', left: 960 - 600 + dx, top: 540 + ky(i) - 56 + dy, width: 1200, display: 'flex', alignItems: 'center', gap: 28, opacity: a * (1 - sc * 0.3), transform: `translateX(${(1 - a) * -80}px) rotate(${sc * (random(`r${i}`) - 0.5) * 18}deg)`}}>
            <span style={{...T(70, on ? HOT[(i * 3) % HOT.length] : '#8d89a6', DISP), width: 600, textAlign: 'right'}}>{who}</span>
            {apps.map((ap, j) => <Pop key={ap} t={t} at={ats[i] + 0.15 + j * 0.12}><Icon app={ap} s={116} /></Pop>)}</div>; })}
      </AbsoluteFill>
      {s.after && <div style={{position: 'absolute', top: 460, width: '100%', ...T(100, INK, DISP), opacity: k(t, [afterAt + 0.2, afterAt + 0.5], [0, 1])}}><Words t={s.after} t0={t} at={afterAt + 0.2} hot={['Different', 'different', 'apps.', 'people,']} /></div>}
    </AbsoluteFill>
  );
};

const Tiers: React.FC<P<Extract<Scene, {kind: 'tiers'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), n = s.tiers.length;
  const pain = (i: number) => m[i * 2] ?? (i * d) / n, price = (i: number) => wordAt(s.tiers[i].name, pain(i), m[i * 2 + 1] ?? pain(i) + 1.5);
  const x = (i: number) => -780 + i * 520;
  const keys: Key[] = [[0, x(0), 0, 1.3]];
  s.tiers.forEach((_, i) => { if (i) keys.push([pain(i) - 0.3, x(i - 1), 0, 1.3], [pain(i) + 0.1, x(i), 0, 1.3]); });
  keys.push([price(n - 1) + 1.0, x(n - 1), 0, 1.3], [price(n - 1) + 1.6, 0, 0, 0.82], [d, 0, 0, 0.86]);
  return (
    <World t={t} keys={keys} id="tr">
      {s.tiers.map((tr, i) => { const a = k(t, [pain(i), pain(i) + 0.35], [0, 1]), pr = k(t, [price(i), price(i) + 0.35], [0, 1], Easing.bezier(0.2, 1.25, 0.4, 1)), c = HOT[(i * 3) % HOT.length];
        return <At key={tr.name} x={x(i)} y={0}><div style={{opacity: Math.max(0.2, a), transform: `translateY(${(1 - a) * 60}px)`}}><Card w={460} style={{padding: 34, borderTop: `10px solid ${c}`}}>
          <div style={T(32, c, DISP)}>{tr.who}</div>
          <div style={{...T(28, '#4a4560'), whiteSpace: 'normal', lineHeight: 1.3, marginTop: 18, minHeight: 110}}>{tr.pains}</div>
          <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 12, opacity: Math.min(1, Math.max(0, pr) * 1.4), transform: `scale(${0.7 + 0.3 * pr})`, transformOrigin: 'left center'}}>
            <span style={T(44, c, DISP)}>{tr.name}</span><span style={T(76, INK, DISP)}>{tr.price}</span><span style={T(28, '#777')}>/ month</span></div></Card></div></At>; })}
    </World>
  );
};

const Team: React.FC<P<Extract<Scene, {kind: 'team'}>>> = ({s, t, d, m}) => {
  const short = d < 3.6, trustAt = short ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55;
  const pr0 = short ? 0.5 : 0.6, press = k(t, [trustAt + pr0, trustAt + pr0 + 0.15, trustAt + pr0 + 0.3], [1, 0.92, 1], Easing.linear), conn = k(t, [trustAt + pr0 + 0.3, trustAt + pr0 + 0.7], [0, 1], IO);
  const [b0, b1] = s.button ?? ['Approve', 'Connected ✓'];
  const keys: Key[] = short ? [[0, 0, 300, 1.3], [d, 0, 300, 1.36]] : [[0, 0, 0, 1.2], [trustAt - 0.6, 0, 40, 1.12], [trustAt + 0.1, 0, 330, 1.5], [d, 0, 320, 1.45]];
  return (
    <World t={t} keys={keys} id="tm">
      {!short && <At x={0} y={-60}><Pop t={t} at={0.05}><Card w={1100} style={{padding: 36}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><span style={T(44, INK, DISP)}>Team workspace</span>
          <div style={{display: 'flex'}}>{HOT.slice(0, 4).map((c, i) => <div key={c} style={{width: 64, height: 64, borderRadius: 99, background: c, border: '4px solid #fff', marginLeft: -14, transform: `scale(${k(t, [0.4 + i * 0.15, 0.7 + i * 0.15], [0, 1], OUT)})`}} />)}</div></div>
        {s.rows.map(([r, who], i) => <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, padding: '20px 24px', borderRadius: 16, background: '#f5f4fb', opacity: k(t, [0.9 + i * 0.2, 1.2 + i * 0.2], [0, 1])}}>
          <span style={T(34)}>{r}</span><span style={{...T(26, HOT[(i * 3 + 2) % HOT.length])}}>{who}</span></div>)}
      </Card></Pop></At>}
      {s.chip && !short && <At x={360} y={-330}><Pop t={t} at={1.6}><div style={{padding: '14px 28px', borderRadius: 30, background: '#fff', border: `2px dashed ${PERI}`, ...T(32, HOT[0])}}>{s.chip}</div></Pop></At>}
      <At x={0} y={330}><div style={{opacity: k(t, [trustAt - 0.1, trustAt + 0.2], [0, 1]), transform: `scale(${press})`}}>
        <div style={{width: 320 + 140 * conn, height: 110, borderRadius: 60, background: interpolateColors(conn, [0, 1], [PERI, OK]), display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(50, '#fff', DISP), boxShadow: '0 20px 50px rgba(70,60,160,.3)'}}>{conn < 0.5 ? b0 : b1}</div></div></At>
      <At x={0} y={short ? 160 : 470}><div style={{...T(short ? 60 : 42, short ? INK : '#3b3650', short ? DISP : FONT), width: short ? 1300 : undefined, whiteSpace: short ? 'normal' : 'nowrap', textAlign: 'center', lineHeight: 1.2, opacity: k(t, short ? [0.05, 0.3] : [trustAt + 1.2, trustAt + 1.5], [0, 1])}}>
        <Words t={s.trust} t0={t} at={short ? 0.05 : trustAt + 1.2} hot={['approve', 'pay', "don't", 'Nothing', 'every']} wrap={short} /></div></At>
    </World>
  );
};

const End: React.FC<P<Extract<Scene, {kind: 'end'}>>> = ({t, d, m}) => {
  const bio = m[1] ?? d - 1.4;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [0, d], [1.06, 1], Easing.bezier(0.2, 0.9, 0.3, 1))})`}}>
      <div style={{position: 'absolute', top: 190, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={120} /></Pop><span style={T(100, INK, DISP)}><Rise t={t} at={0.2}>FansaChat</Rise></span></div>
      <div style={{position: 'absolute', top: 400, ...T(64)}}><Words t="Get every update first." t0={t} at={0.4} hot={['every', 'first.']} /></div>
      <div style={{position: 'absolute', top: 560, display: 'flex', gap: 34}}>
        <Pop t={t} at={1.2}><div style={{padding: '26px 50px', borderRadius: 60, background: HOT[0], ...T(50, '#fff', DISP)}}>Join the waitlist</div></Pop>
        <Pop t={t} at={1.7}><div style={{padding: '26px 50px', borderRadius: 60, background: '#fff', border: `3px solid ${HOT[2]}`, ...T(50, HOT[2], DISP)}}>Telegram community</div></Pop></div>
      <div style={{position: 'absolute', top: 770, ...T(46, '#4a4560'), opacity: k(t, [bio, bio + 0.4], [0, 1])}}>Link in bio</div>
    </AbsoluteFill>
  );
};

const VIEW: Record<Scene['kind'], React.FC<P<any>>> = {hook: Hook, brand: Brand, flow: Flow, glass: Glass, cycle: Cycle, cards: Cards, people: People, tiers: Tiers, team: Team, end: End};
const sceneApps = (sc: Scene): App[] => sc.kind === 'flow' ? sc.leaves.map((l) => l[1]).filter(Boolean) as App[] : sc.kind === 'people' ? sc.rows.flatMap((r) => r[1]) : sc.kind === 'hook' ? sc.phrases.map((p) => p.app).filter(Boolean) as App[] : [];

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
  const wa = (text: string, after: number, fb: number) => { const w0 = norm(text.split(' ')[0]); const h = sp.words.find(([s, , w]) => s >= after - 0.05 && norm(w) === w0); return h ? h[0] - 0.08 : fb; };
  timeline(sp).forEach(({sc, a, b, m}, i) => {
    const d = b - a;
    if (i) out.push([a - 0.12, sc.kind === 'end' ? 'transition_camera_flash_1' : `transition_whoosh_${['0.25s', '0.45s', '0.7s'][i % 3]}`, 0.48]);
    if (sc.kind === 'hook') { let prev = a; sc.phrases.forEach((p, j) => { prev = wa(p.text, prev + (j ? 0.2 : 0), a + 0.05 + (j / sc.phrases.length) * d * 0.86); out.push([prev, `text_mouth_pop_${(j % 4) + 1}`, 0.45]); }); }
    if (sc.kind === 'brand') { const L = sc.line ? (m[1] ?? 2.6) : 0; out.push([a + L, 'node_pop_4', 0.5]); if (sc.apps) out.push([wa('connected', a + L, a + d * 0.55), 'counter_roll_riser_1.5s', 0.38]); }
    if (sc.kind === 'flow') { const n = sc.leaves.length, tEnd = Math.min(d * 0.32, 0.5 + sc.say.length * 0.03), g = (j: number) => tEnd + 0.25 + j * Math.min(0.45, (d * 0.38) / n), run = g(n - 1) + 0.6;
      out.push([a + 0.5, 'typing_keyboard_2.0s', 0.4], [a + tEnd, 'ui_click_2', 0.55]); sc.leaves.forEach((_, j) => out.push([a + g(j), `node_pop_${(j % 5) + 1}`, 0.42])); out.push([a + run, 'ui_click_1', 0.6], [a + run + 0.3, 'success_chime_C', 0.45]); }
    if (sc.kind === 'glass') { let prev = a; sc.bars.forEach((bb, j) => { prev = wa(bb, prev + (j ? 0.15 : 0), a + 0.2 + (j * d * 0.6) / sc.bars.length); out.push([prev, `ui_tick_${(j % 2) + 1}`, 0.42]); }); }
    if (sc.kind === 'cycle') { let prev = a; sc.items.forEach((it, j) => { prev = wa(it, prev + (j ? 0.1 : 0), a + j * 0.9); out.push([prev, `ui_click_${(j % 3) + 1}`, 0.42]); }); }
    if (sc.kind === 'cards' || sc.kind === 'people') { let prev = a; (sc.kind === 'cards' ? sc.cards.map((c) => c[0]) : sc.rows.map((r) => r[0])).forEach((x, j) => { prev = wa(x, prev + (j ? 0.15 : 0), a + (m[j] ?? j)); out.push([prev, `node_pop_${(j % 5) + 1}`, 0.45]); }); }
    if (sc.kind === 'tiers') m.forEach((x, j) => out.push([a + x, j % 2 ? 'success_chime_G' : 'ui_tick_1', j % 2 ? 0.32 : 0.4]));
    if (sc.kind === 'team') { const tr = d < 3.6 ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55, p0 = d < 3.6 ? 0.5 : 0.6; out.push([a + 0.05, 'node_pop_1', 0.4], [a + tr + p0, 'ui_click_1', 0.65], [a + tr + p0 + 0.3, 'success_chime_C', 0.5]); }
    if (sc.kind === 'end') out.push([a + 0.05, 'hook_bass_impact_0.8s', 0.45], [a + 1.2, 'node_pop_4', 0.45], [a + 1.7, 'node_pop_5', 0.45]);
  });
  return out;
};

export const Ad: React.FC<{spec: Spec; music?: boolean}> = ({spec, music = false}) => {
  const f = useCurrentFrame(), {fps, width, height, durationInFrames} = useVideoConfig(), s = f / fps;
  const tl = React.useMemo(() => timeline(spec), [spec]), sfx = React.useMemo(() => sfxFor(spec), [spec]);
  const i = Math.max(0, tl.findIndex(({a, b}) => s >= a && s < b)), {sc, a, b, m} = tl[i];
  const t = s - a, d = b - a, V = VIEW[sc.kind];
  const inn = i ? k(t, [0, 0.2], [1, 0]) : 0, out = i < tl.length - 1 ? k(t, [d - 0.15, d], [0, 1], IN) : 0;
  const fit = height > width ? width / 1500 : Math.max(width / 1920, height / 1080);
  const bgs = Math.max(width / 1920, height / 1080);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <style>{css}</style>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${bgs})`}}>
        <Backdrop theme={spec.theme} s={s} si={i} apps={sceneApps(sc)} />
      </div>
      <Audio src={staticFile(`audio/${spec.id}/vo.wav`)} />
      {sfx.map(([at, file, v], j) => <Sequence key={j} from={Math.max(0, Math.round(at * fps))}><Audio src={staticFile(`sfx/proc/${file}.ogg`)} volume={v} /></Sequence>)}
      {music && <Audio src={staticFile(`audio/${spec.music}`)} volume={(fr) => 0.24 * Math.min(1, fr / 30) * Math.min(1, (durationInFrames - fr) / 90)} />}
      <AbsoluteFill style={{transform: `scale(${1 - inn * 0.06 + out * 0.18})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 8}px)` : undefined, opacity: 1 - out * 0.4}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${fit})`}}>
          <C.Provider value={{si: i, words: spec.words, a}}><AbsoluteFill><V s={sc} t={t} d={d} m={m} /></AbsoluteFill></C.Provider>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
