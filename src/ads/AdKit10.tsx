// AdKit v10 — P01–P07 rebuilt after the founder's v9 review (memory feedback_ad_visual_rules_bright, reference reel
// DeKoRsNgOPK "making of a launch film"): clean airy liquid-glass look, SOLID text (ink + two hot colours per video, never
// gradient), NO stock 3D objects — each video has its own design-element background (streaks / bokeh / dots / prisms /
// ripples / silk / constellation), hot words sit in the centre zone, and nouns become visuals (people -> illustrated
// avatars, messages -> chat stack, time -> clock roll, invoices -> invoice card, numbers -> count-ups).
// Timing still comes from the VO: public/audio/<id>/times.json (line starts) + words.json (word starts).
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const FONT = 'AdText', DISP = 'AdDisp';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}@font-face{font-family:${DISP};src:url(${staticFile('fonts/InterTight-700.woff2')}) format('woff2');}`;
const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.7, 0, 0.84, 0), BACK = Easing.bezier(0.2, 1.25, 0.4, 1);
const k = (t: number, i: number[], o: number[], e = OUT) => interpolate(t, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const INK = '#0E1222', SUB = '#5A6075', OK = '#12A150', RED = '#E5484D';
const T = (s: number, c = INK, f = DISP): React.CSSProperties => ({fontFamily: f, fontSize: s, color: c, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: f === DISP ? '-0.035em' : '-0.01em'});
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(k(t, [a, b], [0, s.length], Easing.linear)));
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$]/g, '');
const glass: React.CSSProperties = {background: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 30px 70px rgba(30,40,90,.12), inset 0 1px 0 #fff'};

// ---- spec types --------------------------------------------------------------------------------------------------
export type App = string; // 'ap/hubspot.png' | 'si/whatsapp.svg'
export type Fx = 'streaks' | 'bokeh' | 'dots' | 'prisms' | 'ripples' | 'silk' | 'constellation';
export type Theme = {bg: [string, string]; bloom: [string, string]; hot: [string, string]; fx: Fx; stage: 'laptop' | 'land'; wipe: 'blur' | 'circle' | 'whip'};
export type Vis =
  | {v: 'chat'; n: number; badge: string} | {v: 'sheet'} | {v: 'invoice'; badge: string} | {v: 'people'; n: number}
  | {v: 'clock'; from: string; to: string} | {v: 'ticket'; label: string} | {v: 'app'; app: App} | {v: 'person'; tag: string; sign?: boolean}
  | {v: 'shots'} | {v: 'lead'; msg: string; ago: string};
export type Scene =
  | {kind: 'hook'; from: number; phrases: {text: string; hot?: string[]; vis?: Vis}[]}
  | {kind: 'brand'; from: number; line?: string; hot?: string[]; sub: string; apps?: App[]; chip?: string}
  | {kind: 'flow'; from: number; say: string; root: string; leaves: [string, App?][]; caption?: string; hot?: string[]; button?: string}
  | {kind: 'glass'; from: number; bars: string[]; strike?: boolean; line?: string; hot?: string[]}
  | {kind: 'cycle'; from: number; prefix: string; items: string[]; line?: string; hot?: string[]}
  | {kind: 'cards'; from: number; cards: [string, string][]; flow?: string}
  | {kind: 'people'; from: number; rows: [string, App[]][]; after?: string}
  | {kind: 'tiers'; from: number; tiers: {name: string; price: string; who: string; pains: string}[]}
  | {kind: 'team'; from: number; rows: [string, string][]; chip?: string; trust: string}
  | {kind: 'end'; from: number};
export type Spec = {id: string; music: string; times: number[]; end: number; words: [number, number, string][]; theme: Theme; scenes: Scene[]};

type Ctx = {words: [number, number, string][]; a: number; th: Theme};
const C = React.createContext<Ctx>({words: [], a: 0, th: {bg: ['#fff', '#fff'], bloom: ['#ccd', '#ccd'], hot: ['#2563EB', '#6D28D9'], fx: 'bokeh', stage: 'land', wipe: 'blur'}});
const useTh = () => React.useContext(C).th;
const useWordAt = () => {
  const {words, a} = React.useContext(C);
  return (text: string, after: number, fallback: number) => {
    const w0 = norm(text.split(' ')[0]);
    const hit = words.find(([s, , w]) => s - a >= after - 0.05 && norm(w) === w0);
    return hit ? Math.max(0, hit[0] - a - 0.08) : fallback;
  };
};

// ---- primitives --------------------------------------------------------------------------------------------------
const Rise: React.FC<{t: number; at: number; children: React.ReactNode; d?: number}> = ({t, at, children, d = 0.38}) => {
  const a = k(t, [at, at + d], [0, 1]);
  return <span style={{display: 'inline-block', opacity: a, filter: `blur(${(1 - a) * 14}px)`, transform: `translateY(${(1 - a) * 18}px)`}}>{children}</span>;
};
// Hot words blur in a beat later with a small scale settle; colours alternate the video's two solid hot colours.
const Words: React.FC<{t: string; t0: number; at: number; gap?: number; hot?: string[]; wrap?: boolean; style?: React.CSSProperties; off?: number}> = ({t, t0, at, gap = 0.06, hot = [], wrap, style, off = 0}) => {
  const th = useTh();
  let h = 0;
  return (
    <div style={{display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap: '0 0.24em', ...style}}>
      {t.split(' ').map((w, i) => { const isHot = hot.some((x) => norm(x) === norm(w)), c = isHot ? th.hot[(off + h++) % 2] : undefined, a = at + i * gap + (isHot ? 0.08 : 0);
        const sc = isHot ? k(t0, [a, a + 0.5], [1.12, 1], OUT) : 1;
        return <Rise key={i} t={t0} at={a}><span style={{color: c, display: 'inline-block', transform: `scale(${sc})`}}>{w}</span></Rise>; })}
    </div>
  );
};
const Pop: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, at, children, style}) => {
  const a = k(t, [at, at + 0.4], [0, 1], BACK);
  return <div style={{opacity: Math.min(1, Math.max(0, a) * 1.5), transform: `scale(${0.75 + 0.25 * a})`, filter: `blur(${Math.max(0, 1 - a) * 8}px)`, ...style}}>{children}</div>;
};
const Card: React.FC<{w: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 30, ...glass, padding: 28, boxSizing: 'border-box', ...style}}>{children}</div>
);
const Icon: React.FC<{app: App; s?: number}> = ({app, s = 92}) => (
  <div style={{width: s, height: s, borderRadius: s * 0.26, background: '#fff', boxShadow: '0 12px 30px rgba(30,40,90,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'}}>
    <Img src={staticFile(`logos/${app}`)} style={{width: s * 0.6, height: s * 0.6, objectFit: 'contain'}} /></div>
);
const Logo: React.FC<{s: number}> = ({s}) => <Img src={staticFile('logo-fansa.png')} style={{width: s, height: s, objectFit: 'contain'}} />;
const Pill: React.FC<{c: string; children: React.ReactNode; solid?: boolean; s?: number}> = ({c, children, solid, s = 30}) => (
  <div style={{padding: `${s * 0.45}px ${s * 0.9}px`, borderRadius: 99, background: solid ? c : '#fff', border: solid ? 'none' : `2px solid ${c}33`, boxShadow: '0 10px 26px rgba(30,40,90,.12)', ...T(s, solid ? '#fff' : c, FONT), fontWeight: 600}}>{children}</div>
);

// Illustrated person (no real faces — founder rule: no personal data as mock). Deterministic per seed.
const SKIN = ['#F7D7BC', '#E9B892', '#C98E66', '#8D5A3B', '#F2C9A6', '#A8714E'], HAIR = ['#2A1D19', '#5B3A24', '#C58A45', '#161616', '#8A5A2B', '#D9B26A'];
const SHIRT = ['#4F7CFF', '#FF7A59', '#22B07D', '#8B5CF6', '#F4B400', '#EC4899', '#0EA5E9', '#334155'], BGS = ['#DCE7FF', '#FFE4DA', '#D8F5E8', '#EDE4FF', '#FFF1CC', '#FFE0EE'];
const Avatar: React.FC<{seed: number; s: number; grey?: number; ring?: string}> = ({seed, s, grey = 0, ring}) => {
  const r = (n: string) => random(`av${seed}${n}`), pick = <X,>(a: X[], n: string) => a[Math.floor(r(n) * a.length)];
  const hs = Math.floor(r('h') * 4), hair = pick(HAIR, 'c'), skin = pick(SKIN, 's'), id = `c${seed}`;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{filter: grey ? `grayscale(${grey})` : undefined, borderRadius: 99, boxShadow: ring ? `0 0 0 ${s * 0.04}px ${ring}, 0 10px 24px rgba(30,40,90,.16)` : '0 10px 24px rgba(30,40,90,.16)', flex: '0 0 auto'}}>
      <defs><clipPath id={id}><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width="100" height="100" fill={pick(BGS, 'b')} />
        {hs === 1 && <path d="M28 46 Q26 82 34 92 L66 92 Q74 82 72 46 Z" fill={hair} />}
        <ellipse cx="50" cy="104" rx="38" ry="30" fill={pick(SHIRT, 't')} />
        <rect x="44" y="60" width="12" height="12" rx="4" fill={skin} />
        <circle cx="50" cy="45" r="19" fill={skin} />
        {hs === 3 ? <circle cx="50" cy="22" r="9" fill={hair} /> : null}
        <path d={hs === 2 ? 'M31 44 Q31 24 50 24 Q69 24 69 44 Q62 34 50 34 Q40 34 31 44Z' : 'M30 46 Q29 22 50 22 Q71 22 70 46 Q66 31 50 31 Q35 31 30 46Z'} fill={hair} />
        <circle cx="43" cy="47" r="1.9" fill="#1d1d24" /><circle cx="57" cy="47" r="1.9" fill="#1d1d24" />
        <path d="M44 54 Q50 58.5 56 54" stroke="#1d1d24" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};
const Bar: React.FC<{w: number; c?: string; h?: number}> = ({w, c = '#E3E6F0', h = 12}) => <div style={{width: w, height: h, borderRadius: 99, background: c}} />;
const countUp = (label: string, p: number) => label.replace(/\d[\d,]*/, (m) => Math.round(Number(m.replace(/,/g, '')) * p).toLocaleString('en-US'));

// ---- noun visuals (hook beats) -------------------------------------------------------------------------------------
const VisView: React.FC<{v: Vis; u: number; seed: number}> = ({v, u, seed}) => {
  const th = useTh();
  if (v.v === 'chat') {
    const msgs = ['Can you send the file again?', 'Any update on this?', 'Where is the invoice?', 'Call today?'];
    return <div style={{position: 'relative', width: 760}}>
      {Array.from({length: v.n}, (_, i) => <Pop key={i} t={u} at={i * 0.14} style={{marginTop: i ? 16 : 0, marginLeft: i % 2 ? 90 : 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px 18px 18px', borderRadius: 28, ...glass, width: 600}}>
          <Avatar seed={seed + i} s={64} /><div><div style={T(22, SUB, FONT)}>Client · just now</div><div style={{...T(30, INK, FONT), marginTop: 8}}>{msgs[i % 4]}</div></div></div></Pop>)}
      <div style={{position: 'absolute', right: 40, top: -26}}><Pop t={u} at={v.n * 0.14 + 0.1}><Pill c={RED} solid s={26}>{v.badge}</Pill></Pop></div>
    </div>;
  }
  if (v.v === 'sheet') {
    return <Pop t={u} at={0}><Card w={780} style={{padding: 22}}>
      {Array.from({length: 5}, (_, r) => <div key={r} style={{display: 'flex', gap: 10, marginTop: r ? 10 : 0}}>
        {Array.from({length: 5}, (_, c) => { const bad = random(`sh${seed}${r}${c}`) < 0.22, jig = bad ? Math.sin(u * 9 + r + c) * 6 : 0;
          return <div key={c} style={{width: 138, height: 46, borderRadius: 10, background: r === 0 ? '#EEF1F8' : bad ? `${RED}18` : '#F7F8FC', border: bad ? `2px solid ${RED}66` : '1px solid #E6E9F2', transform: `translate(${jig}px, ${jig * 0.4}px)`, display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box'}}>
            {r === 0 ? <span style={T(20, SUB, FONT)}>{'ABCDE'[c]}</span> : <Bar w={30 + random(`sw${r}${c}`) * 80} c={bad ? `${RED}88` : '#D9DDE8'} h={10} />}</div>; })}</div>)}
    </Card></Pop>;
  }
  if (v.v === 'invoice') {
    const shake = Math.sin(u * 40) * k(u, [0.55, 0.9], [8, 0], Easing.linear) * (u > 0.55 ? 1 : 0);
    return <Pop t={u} at={0}><div style={{position: 'relative'}}><Card w={560} style={{padding: 34}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={T(34)}>Invoice #1042</span><span style={T(24, SUB, FONT)}>Acme Co.</span></div>
      {[0, 1, 2].map((i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginTop: 22}}><Bar w={220 - i * 40} /><Bar w={70} /></div>)}
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30, alignItems: 'baseline'}}><span style={T(26, SUB, FONT)}>Total</span><span style={T(52)}>{countUp('$1,200', k(u, [0.1, 0.8], [0, 1]))}</span></div>
    </Card><div style={{position: 'absolute', right: -40, top: -28, transform: `translateX(${shake}px) rotate(6deg)`}}><Pop t={u} at={0.5}><Pill c={RED} solid s={28}>{v.badge}</Pill></Pop></div></div></Pop>;
  }
  if (v.v === 'people') {
    return <div style={{display: 'flex', gap: 22, alignItems: 'flex-end'}}>{Array.from({length: v.n}, (_, i) => { const mid = Math.abs(i - (v.n - 1) / 2);
      return <Pop key={i} t={u} at={0.06 * i}><div style={{transform: `translateY(${mid * 26 + Math.sin(u * 2 + i) * 6}px)`}}><Avatar seed={seed + i} s={150 - mid * 18} grey={k(u, [0.3 + i * 0.08, 0.7 + i * 0.08], [1, 0], Easing.linear)} /></div></Pop>; })}</div>;
  }
  if (v.v === 'clock') {
    const p = k(u, [0.15, 0.75], [0, 1], IO), n = Math.max(v.from.length, v.to.length);
    return <Pop t={u} at={0}><div style={{display: 'flex', ...T(170), letterSpacing: 0, clipPath: 'inset(0 round 40px)', height: 210, alignItems: 'center', padding: '0 64px', borderRadius: 40, ...glass}}>
      {Array.from({length: n}, (_, i) => { const a = v.from[i] ?? ' ', b = v.to[i] ?? ' ', q = a === b ? 0 : k(p, [i / n * 0.5, i / n * 0.5 + 0.5], [0, 1], IO);
        return <span key={i} style={{position: 'relative', display: 'inline-block', width: /\d/.test(b) || /\d/.test(a) ? '0.62em' : a === ' ' && b === ' ' ? '0.28em' : undefined, textAlign: 'center', height: '1em'}}>
          <span style={{position: 'absolute', left: 0, right: 0, transform: `translateY(${-q * 110}%)`, filter: `blur(${Math.sin(q * Math.PI) * 6}px)`}}>{a}</span>
          <span style={{position: 'absolute', left: 0, right: 0, transform: `translateY(${(1 - q) * 110}%)`, filter: `blur(${Math.sin(q * Math.PI) * 6}px)`, color: q > 0 ? th.hot[0] : undefined}}>{b}</span>
          <span style={{visibility: 'hidden'}}>{b.length > a.length ? b : a}</span></span>; })}</div></Pop>;
  }
  if (v.v === 'ticket') {
    return <Pop t={u} at={0}><Card w={620} style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Avatar seed={seed} s={96} /><div style={{flex: 1}}><div style={T(34)}>{v.label}</div><div style={{marginTop: 14, height: 12, borderRadius: 9, background: '#EEF0F6', overflow: 'hidden'}}><div style={{width: `${12 + 6 * Math.sin(u * 3)}%`, height: '100%', background: th.hot[1]}} /></div></div>
      <Pill c={SUB} s={24}>{['waiting', 'waiting.', 'waiting..', 'waiting...'][Math.floor(u * 4) % 4]}</Pill></Card></Pop>;
  }
  if (v.v === 'app') {
    const ring = k(u, [0.05, 0.9], [0, 1], OUT);
    return <div style={{position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 260 * ring, height: 260 * ring, borderRadius: 99, border: `3px solid ${th.hot[0]}`, opacity: 1 - ring}} />
      <Pop t={u} at={0}><Icon app={v.app} s={170} /></Pop></div>;
  }
  if (v.v === 'person') {
    const sig = k(u, [0.35, 1.1], [0, 1], Easing.bezier(0.4, 0, 0.2, 1));
    return <Pop t={u} at={0}><div style={{position: 'relative'}}><Card w={600} style={{display: 'flex', alignItems: 'center', gap: 28, padding: 32}}>
      <Avatar seed={seed} s={140} ring="#fff" /><div><div style={T(40)}>{v.sign ? 'Bloom Studio' : 'New hire'}</div><div style={{marginTop: 14}}><Pill c={th.hot[1]} s={24}>{v.tag}</Pill></div>
        {v.sign && <svg width={300} height={70} style={{marginTop: 10}}><path d="M6 50 C 30 10, 50 10, 52 44 S 80 70, 96 30 S 130 10, 140 46 C 150 70, 170 20, 190 36 S 240 56, 292 28" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray={520} strokeDashoffset={520 * (1 - sig)} /></svg>}</div></Card>
      {v.sign && <div style={{position: 'absolute', right: -30, top: -26}}><Pop t={u} at={1.0}><Pill c={OK} solid s={26}>Signed ✓</Pill></Pop></div>}</div></Pop>;
  }
  if (v.v === 'shots') {
    return <div style={{position: 'relative', width: 700, height: 380}}>{[0, 1, 2, 3].map((i) => { const a = k(u, [i * 0.12, i * 0.12 + 0.45], [0, 1], BACK), rot = (random(`sr${i}`) - 0.5) * 22;
      return <div key={i} style={{position: 'absolute', left: 120 + i * 40, top: 20 + i * 18, width: 420, height: 270, borderRadius: 18, ...glass, opacity: Math.min(1, a * 1.4), transform: `translateY(${(1 - a) * -260}px) rotate(${rot * a}deg)`, padding: 18, boxSizing: 'border-box'}}>
        <div style={{display: 'flex', gap: 8}}>{[0, 1, 2].map((j) => <div key={j} style={{width: 12, height: 12, borderRadius: 9, background: '#E3E6F0'}} />)}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 150, marginTop: 24}}>{[0.5, 0.8, 0.35, 0.9, 0.6].map((h, j) => <div key={j} style={{width: 46, height: `${h * 100}%`, borderRadius: 8, background: j === i ? th.hot[0] : '#DCE0EC'}} />)}</div>
        <div style={{...T(18, SUB, FONT), marginTop: 12}}>screenshot_{14 + i}.png</div></div>; })}</div>;
  }
  // lead
  return <Pop t={u} at={0}><div style={{display: 'flex', alignItems: 'flex-start', gap: 22}}>
    <div style={{position: 'relative'}}><Avatar seed={seed} s={120} ring="#fff" /><div style={{position: 'absolute', right: 4, top: 4, width: 26, height: 26, borderRadius: 99, background: RED, border: '4px solid #fff', transform: `scale(${k(u, [0.4, 0.7], [0, 1], BACK)})`}} /></div>
    <div><div style={{padding: '24px 30px', borderRadius: '8px 30px 30px 30px', ...glass, ...T(34, INK, FONT)}}>{v.msg}</div>
      <div style={{marginTop: 16, display: 'flex'}}><Pop t={u} at={0.45}><Pill c={th.hot[1]} s={24}>{v.ago}</Pill></Pop></div></div></div></Pop>;
};

// ---- background: pale two-tone + drifting light blooms + the video's own design-element layer ----------------------
const FxLayer: React.FC<{th: Theme; s: number}> = ({th, s}) => {
  const [b0, b1] = th.bloom;
  if (th.fx === 'streaks') return <AbsoluteFill style={{filter: 'blur(16px)'}}>{Array.from({length: 16}, (_, i) => { const x = ((i * 137 + s * (i % 2 ? 26 : -18)) % 2200 + 2200) % 2200 - 140, h = 520 + random(`sk${i}`) * 420;
    return <div key={i} style={{position: 'absolute', left: x, bottom: -40, width: 50 + random(`sw${i}`) * 90, height: h, background: `linear-gradient(to top, ${i % 3 ? b0 : b1}, rgba(255,255,255,0))`, opacity: 0.55 + 0.25 * Math.sin(s * 0.8 + i)}} />; })}</AbsoluteFill>;
  if (th.fx === 'bokeh') return <AbsoluteFill>{Array.from({length: 30}, (_, i) => { const r = 14 + random(`br${i}`) * 60, y = 1160 - ((s * (30 + random(`bv${i}`) * 50) + random(`by${i}`) * 1400) % 1400), x = random(`bx${i}`) * 1920 + Math.sin(s * 0.5 + i) * 30;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: 99, background: i % 2 ? b0 : b1, filter: `blur(${r / 3}px)`, opacity: 0.7}} />; })}</AbsoluteFill>;
  if (th.fx === 'dots') { const cx = 960 + 520 * Math.sin(s * 0.3), cy = 540 + 260 * Math.cos(s * 0.23), out: React.ReactNode[] = [];
    for (let gx = 0; gx < 41; gx++) for (let gy = 0; gy < 24; gy++) { const x = gx * 48, y = gy * 48, dd = Math.hypot(x - cx, y - cy), w = Math.max(0, Math.sin(dd / 70 - s * 3.2)) * Math.exp(-dd / 700);
      out.push(<circle key={`${gx}-${gy}`} cx={x} cy={y} r={2 + 4.5 * w} fill={th.hot[0]} opacity={0.14 + 0.5 * w} />); }
    return <svg width={1920} height={1080} style={{position: 'absolute'}}>{out}</svg>; }
  if (th.fx === 'prisms') return <AbsoluteFill>{Array.from({length: 8}, (_, i) => { const x = random(`px${i}`) * 1800, y = random(`py${i}`) * 960, sz = 120 + random(`ps${i}`) * 220, far = i % 3 === 0;
    return <svg key={i} width={sz} height={sz} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y + Math.sin(s * 0.6 + i) * 24, transform: `rotate(${s * (i % 2 ? 9 : -7) + i * 40}deg)`, filter: far ? 'blur(6px)' : 'drop-shadow(0 18px 30px rgba(120,80,60,.12))', opacity: far ? 0.5 : 0.85}}>
      <polygon points="50,6 94,86 6,86" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.95)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="50,6 94,86 50,64" fill={i % 2 ? b0 : b1} opacity=".55" /></svg>; })}</AbsoluteFill>;
  if (th.fx === 'ripples') return <svg width={1920} height={1080} style={{position: 'absolute'}}>{[[260, 820], [1680, 240]].flatMap(([x, y], si) => Array.from({length: 6}, (_, j) => { const r = ((s * 130 + j * 200 + si * 100) % 1200);
    return <circle key={`${si}${j}`} cx={x} cy={y} r={r} fill="none" stroke={si ? b1 : b0} strokeWidth={4} opacity={(1 - r / 1200) * 0.9} />; }))}</svg>;
  if (th.fx === 'silk') return <svg width={1920} height={1080} style={{position: 'absolute', filter: 'blur(6px)'}}>{Array.from({length: 5}, (_, i) => { let d = '';
    for (let x = -80; x <= 2000; x += 40) { const y = 640 + i * 70 + 70 * Math.sin(x / 320 + s * 0.7 + i * 0.9) + 34 * Math.sin(x / 170 - s * 0.45 + i); d += `${x === -80 ? 'M' : 'L'} ${x} ${y} `; }
    return <path key={i} d={d} fill="none" stroke={i % 2 ? b1 : b0} strokeWidth={34 + i * 14} strokeLinecap="round" opacity={0.55} />; })}</svg>;
  // constellation
  const pts = Array.from({length: 34}, (_, i) => [random(`cx${i}`) * 1920 + 40 * Math.sin(s * 0.3 + i), random(`cy${i}`) * 1080 + 30 * Math.cos(s * 0.25 + i * 2)]);
  return <svg width={1920} height={1080} style={{position: 'absolute'}}>
    {pts.flatMap(([x, y], i) => pts.slice(i + 1).map(([x2, y2], j) => { const dd = Math.hypot(x - x2, y - y2); return dd < 280 ? <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke={th.hot[0]} strokeWidth={1.5} opacity={(1 - dd / 280) * 0.35} /> : null; }))}
    {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 5 ? 3.5 : 6} fill={i % 5 ? th.hot[0] : th.hot[1]} opacity={0.55} />)}</svg>;
};
const Backdrop: React.FC<{th: Theme; s: number}> = ({th, s}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${th.bg[0]}, ${th.bg[1]})`}}>
    {th.bloom.map((c, i) => { const x = 50 + 36 * Math.sin(s * (0.16 + i * 0.07) + i * 2.4), y = 30 + 26 * Math.cos(s * (0.13 + i * 0.05) + i);
      return <AbsoluteFill key={i} style={{background: `radial-gradient(34% 46% at ${x}% ${y}%, ${c}, rgba(255,255,255,0) 72%)`}} />; })}
    <FxLayer th={th} s={s} />
    <AbsoluteFill style={{background: 'radial-gradient(46% 42% at 50% 54%, rgba(255,255,255,.62), rgba(255,255,255,0) 75%)'}} />
  </AbsoluteFill>
);

// ---- camera ------------------------------------------------------------------------------------------------------
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

// ---- scenes ------------------------------------------------------------------------------------------------------
// Hook: one phrase per beat (like the reel's "8:02 am" / "46 replies" beats). Visual above, words in the centre zone.
const Hook: React.FC<P<Extract<Scene, {kind: 'hook'}>>> = ({s, t, d}) => {
  const wordAt = useWordAt(), n = s.phrases.length;
  const ats: number[] = [];
  s.phrases.forEach((p, i) => ats.push(wordAt(p.text, i ? ats[i - 1] + 0.2 : 0, 0.05 + (i / n) * d * 0.86)));
  const push = k(t, [0, d], [1.0, 1.05], Easing.linear);
  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      {s.phrases.map((p, i) => { const a = i ? ats[i] - 0.12 : -1, b = i < n - 1 ? ats[i + 1] - 0.12 : d + 1, u = t - Math.max(0, ats[i] - 0.05);
        if (t < a - 0.05 || t > b + 0.3) return null;
        const out = k(t, [b - 0.05, b + 0.25], [0, 1], IN), hasV = !!p.vis;
        return <AbsoluteFill key={i} style={{opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 16}px)` : undefined, transform: `translateY(${-out * 40}px) scale(${1 - out * 0.04})`}}>
          {hasV && <At x={960} y={hasV ? 380 : 540}><VisView v={p.vis!} u={u} seed={i * 7 + 3} /></At>}
          <At x={960} y={hasV ? 790 : 540}><div style={T(hasV ? 104 : 140)}><Words t={p.text} t0={t} at={ats[i]} hot={p.hot} off={i} /></div></At>
        </AbsoluteFill>; })}
    </AbsoluteFill>
  );
};

// Brand: line blurs out, the logo blooms in with a light ring, wordmark types on with a caret (reel 12–14 s).
const Brand: React.FC<P<Extract<Scene, {kind: 'brand'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), th = useTh();
  const L = s.line ? (m[1] ?? 2.6) : 0.1, apps = s.apps ?? [];
  const lineOut = s.line ? k(t, [L - 0.4, L], [0, 1]) : 1;
  const ring = k(t, [L - 0.1, L + 0.9], [0, 1], OUT), icon = k(t, [L, L + 0.5], [0, 1], BACK);
  const word = typed('FansaChat', t, L + 0.45, L + 0.95);
  const appsAt = apps.length ? wordAt('connected', L, Math.max(L + 1.4, d * 0.55)) : d;
  const lift = apps.length ? k(t, [appsAt - 0.3, appsAt + 0.4], [0, 1], IO) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${k(t, [L, d], [1, 1.05], Easing.linear)})`}}>
      {s.line && <div style={{position: 'absolute', width: 1500, ...T(92), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.12, opacity: 1 - lineOut, filter: `blur(${lineOut * 14}px)`, transform: `translateY(${-lineOut * 50}px)`}}>
        <Words t={s.line} t0={t} at={0.05} gap={Math.min(0.2, (L - 0.8) / s.line.split(' ').length)} hot={s.hot} wrap /></div>}
      <div style={{position: 'absolute', top: 340 - lift * 120, display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: 150 + 260 * ring, height: 150 + 260 * ring, borderRadius: 99, border: `3px solid ${th.hot[0]}`, opacity: (1 - ring) * 0.8}} />
          <div style={{position: 'absolute', width: 300, height: 300, borderRadius: 99, background: `radial-gradient(${th.bloom[0]}, rgba(255,255,255,0) 70%)`, opacity: icon}} />
          <div style={{opacity: Math.min(1, Math.max(0, icon) * 1.4), transform: `scale(${0.5 + 0.5 * icon})`}}><Logo s={150} /></div></div>
        <span style={{...T(130), minWidth: 640}}>{word}<span style={{opacity: t > L + 0.4 && t < L + 1.6 && Math.floor(t * 3) % 2 === 0 ? 1 : 0, color: th.hot[0], fontFamily: FONT}}>|</span></span>
      </div>
      <div style={{position: 'absolute', top: 560 - lift * 120, ...T(54, SUB, FONT)}}><Words t={s.sub} t0={t} at={L + 1.0} hot={['automation', 'autopilot', 'busywork', 'sentence', 'plain-English', 'FansaChat']} /></div>
      {apps.map((f, i) => { const col = i % 8, row = Math.floor(i / 8), e = k(t, [appsAt + col * 0.05 + row * 0.12, appsAt + 0.6 + col * 0.05 + row * 0.12], [0, 1], BACK);
        return <div key={f + i} style={{position: 'absolute', left: 960 - 4 * 130 + col * 130 + 20, top: 600 + row * 130, opacity: Math.min(1, Math.max(0, e) * 1.4), transform: `translateY(${(1 - e) * 60}px) scale(${0.6 + 0.4 * e})`}}><Icon app={f} s={96} /></div>; })}
      {s.chip && <div style={{position: 'absolute', top: 920, opacity: k(t, [appsAt + 0.6, appsAt + 1], [0, 1]), transform: `scale(${k(t, [appsAt + 0.6, appsAt + 1.1], [0.8, 1], BACK)})`}}><Pill c={th.hot[0]} solid s={36}>{s.chip}</Pill></div>}
    </AbsoluteFill>
  );
};

// THE REAL FansaChat builder (fansa-landing/public/workflow.html): chat input types the sentence, the preview grows the
// tree root -> split dots -> app leaves, the flow runs every path, "Approve & Run" -> Running. Staged inside a 3D laptop
// (theme.stage 'laptop', reel 19–22 s) or in the land view; the camera tracks leaf by leaf.
const Flow: React.FC<P<Extract<Scene, {kind: 'flow'}>>> = ({s, t, d}) => {
  const th = useTh(), [H0, H1] = th.hot, lap = th.stage === 'laptop';
  const n = s.leaves.length, morph = k(t, [0, 0.5], [0, 1], IO);
  const tEnd = Math.min(d * 0.32, 0.5 + s.say.length * 0.03), grow = (i: number) => tEnd + 0.25 + i * Math.min(0.45, (d * 0.38) / n);
  const runAt = grow(n - 1) + 0.6, flow = k(t, [runAt - 0.4, runAt + 0.6], [0, 1]), press = k(t, [runAt, runAt + 0.12, runAt + 0.25], [1, 0.92, 1], Easing.linear);
  const gap = Math.min(150, 620 / Math.max(1, n - 1)), ly = (i: number) => (i - (n - 1) / 2) * gap;
  const splits = [[230, (ly(0) + ly(Math.ceil(n / 2) - 1)) / 2], [230, (ly(Math.ceil(n / 2)) + ly(n - 1)) / 2]] as const;
  const sp = (i: number) => (n > 2 ? splits[i < Math.ceil(n / 2) ? 0 : 1] : [230, ly(i)]);
  const z0 = lap ? 0.62 : 1.4;
  const keys: Key[] = [[0, lap ? 0 : -480, lap ? 120 : 290, z0], [Math.min(0.9, tEnd * 0.4), -460, 270, 1.3], [tEnd, -460, 260, 1.3], [grow(0) + 0.1, 380, ly(0), 1.35]];
  s.leaves.forEach((_, i) => i && keys.push([grow(i) + 0.15, 380, ly(i), 1.35]));
  keys.push([runAt - 0.3, 100, 0, 0.92], [runAt + 0.4, 160, 60, 0.95], [d, 180, 60, 1.0]);
  const tilt = lap ? k(t, [0, 0.9], [18, 4], IO) : k(t, [0, d], [26, 14], IO), rz = lap ? 0 : k(t, [0, d], [-6, -2], IO);
  const wire = (x1: number, y1: number, x2: number, y2: number) => `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
  return (
    <AbsoluteFill style={{perspective: 2000}}>
      <World t={t} keys={keys} id="fl">
        <div style={{position: 'absolute', transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateZ(${rz}deg)`}}>
          {lap && <><div style={{position: 'absolute', left: -880, top: -500, width: 1760, height: 1000, borderRadius: 44, background: '#16171C', boxShadow: '0 80px 160px rgba(30,40,90,.28)'}} />
            <div style={{position: 'absolute', left: -1060, top: 500, width: 2120, height: 46, borderRadius: '0 0 60px 60px', background: 'linear-gradient(#E6E8EE, #C9CCD6)', boxShadow: '0 40px 80px rgba(30,40,90,.2)'}} /></>}
          <div style={{position: 'absolute', left: -850, top: -470, width: 1700, height: 940, borderRadius: lap ? 22 : 36, background: 'rgba(255,255,255,.97)', boxShadow: lap ? undefined : '0 70px 140px rgba(30,40,90,.18)', border: '1px solid #fff'}} />
          <div style={{position: 'absolute', left: -800, top: -420, width: 600, height: 840, borderRadius: 26, background: '#F5F7FB', padding: 28, boxSizing: 'border-box'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}><Logo s={44} /><span style={T(30)}>FansaChat</span></div>
            <div style={{marginTop: 30, padding: '18px 22px', borderRadius: 18, background: '#fff', ...T(26, '#444', FONT), whiteSpace: 'normal', lineHeight: 1.35, opacity: k(t, [tEnd, tEnd + 0.3], [0, 1])}}>Got it. Here's your workflow — approve it to run.</div>
          </div>
          <div style={{position: 'absolute', left: -780 + (1 - morph) * 180, top: 250 - (1 - morph) * 350, width: 600 * morph + 240 * (1 - morph), minHeight: 120, borderRadius: 26 + (1 - morph) * 40, background: '#fff', boxShadow: '0 20px 50px rgba(30,40,90,.14)', border: `2px solid ${H0}`, padding: '20px 24px', boxSizing: 'border-box', transform: 'translateZ(40px)'}}>
            <div style={{...T(28, INK, FONT), whiteSpace: 'normal', lineHeight: 1.3}}>{typed(s.say, t, 0.5, tEnd)}<span style={{opacity: Math.floor(t * 3) % 2, color: H0}}>|</span></div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10}}><span style={{width: 48, height: 48, borderRadius: 99, background: t > tEnd ? H0 : '#ddd', ...T(26, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</span></div>
          </div>
          <svg width={1000} height={900} style={{position: 'absolute', left: -100, top: -450, overflow: 'visible'}}>
            {s.leaves.map((_, i) => { const [sx, sy] = sp(i), g = k(t, [grow(i) - 0.1, grow(i) + 0.3], [0, 1], IO);
              return <g key={i} transform="translate(100 450)">
                <path d={wire(0, 0, sx, sy)} fill="none" stroke={INK} strokeWidth={2.4} strokeDasharray={400} strokeDashoffset={400 * (1 - k(t, [tEnd + 0.1, tEnd + 0.4], [0, 1]))} />
                <path d={wire(sx, sy, 470, ly(i))} fill="none" stroke={INK} strokeWidth={2.4} strokeDasharray={500} strokeDashoffset={500 * (1 - g)} />
                <path d={wire(0, 0, sx, sy) + ' ' + wire(sx, sy, 470, ly(i)).replace('M', 'L')} fill="none" stroke={H1} strokeWidth={7} strokeLinecap="round" strokeDasharray="22 260" strokeDashoffset={-((t * 160 + i * 40) % 282)} opacity={flow} />
              </g>; })}
          </svg>
          <div style={{position: 'absolute', left: -38, top: -38, width: 76, height: 76, borderRadius: 99, background: '#fff', border: `2.5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(22, INK, FONT), transform: `translateZ(30px) scale(${k(t, [tEnd, tEnd + 0.3], [0, 1], OUT)})`}}>{s.root}</div>
          {(n > 2 ? splits : []).map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: 99, background: '#F3F4FA', border: '2px solid #9AA0B8', transform: `scale(${k(t, [tEnd + 0.2, tEnd + 0.45], [0, 1], OUT)})`}} />)}
          {s.leaves.map(([label, app], i) => { const l = k(t, [grow(i), grow(i) + 0.4], [0, 1], BACK);
            return <div key={label} style={{position: 'absolute', left: 470 - 46, top: ly(i) - 46, display: 'flex', alignItems: 'center', gap: 18, transform: `translateZ(${l * 60}px) scale(${Math.max(0, l)})`, transformOrigin: '46px 46px'}}>
              <div style={{width: 92, height: 92, borderRadius: 99, background: '#fff', border: `2.5px solid ${flow > 0.5 ? H1 : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(20,16,24,.16)'}}>{app ? <Img src={staticFile(`logos/${app}`)} style={{width: 52, height: 52, objectFit: 'contain'}} /> : <span style={T(30)}>{i + 1}</span>}</div>
              <span style={{...T(32, INK, FONT), background: 'rgba(255,255,255,.9)', padding: '6px 14px', borderRadius: 12}}>{label}</span></div>; })}
          <div style={{position: 'absolute', left: 140, top: 330, transform: `translateZ(50px) scale(${press})`, opacity: k(t, [runAt - 0.6, runAt - 0.3], [0, 1])}}>
            <div style={{padding: '22px 46px', borderRadius: 50, background: interpolateColors(k(t, [runAt + 0.2, runAt + 0.5], [0, 1]), [0, 1], [H0, OK]), ...T(40, '#fff'), boxShadow: '0 20px 50px rgba(30,40,90,.25)'}}>{t < runAt + 0.35 ? (s.button ?? 'Approve & Run') : 'Running ✓'}</div></div>
        </div>
      </World>
      {s.caption && <div style={{position: 'absolute', bottom: 80, width: '100%', ...T(72)}}><Words t={s.caption} t0={t} at={Math.max(runAt + 0.3, d - 2.2)} hot={s.hot} /></div>}
    </AbsoluteFill>
  );
};

// Glass bars (GlassUI) — each bar flies in on its word; optional strike-through; the line lands in the centre zone.
const Glass: React.FC<P<Extract<Scene, {kind: 'glass'}>>> = ({s, t, d}) => {
  const wordAt = useWordAt(), th = useTh(), n = s.bars.length;
  const ats: number[] = []; s.bars.forEach((b, i) => ats.push(wordAt(b, i ? ats[i - 1] + 0.15 : 0, 0.2 + (i * d * 0.6) / n)));
  const lineAt = s.line ? Math.max(ats[n - 1] + 0.6, d * 0.62) : d + 1, out = k(t, [lineAt - 0.2, lineAt + 0.4], [0, 1], IO);
  return (
    <AbsoluteFill style={{perspective: 1800}}>
      <div style={{position: 'absolute', left: '50%', top: '52%', transformStyle: 'preserve-3d', opacity: 1 - out * 0.75, filter: `blur(${out * 10}px)`, transform: `rotateX(${46 - 8 * k(t, [0, d], [0, 1])}deg) rotateZ(${-22 + 8 * k(t, [0, d], [0, 1])}deg) scale(${(1.55 + 0.2 * k(t, [0, d], [0, 1], IO)) * (1 - 0.35 * out)})`}}>
        {s.bars.map((b, i) => { const e = k(t, [ats[i], ats[i] + 0.4], [1, 0], OUT), y = (i - (n - 1) / 2) * 116, c = th.hot[i % 2], st = s.strike ? k(t, [lineAt - 0.3 + i * 0.05, lineAt + i * 0.05], [0, 1]) : 0;
          return <div key={b + i} style={{position: 'absolute', left: -390, top: y - 46, width: 780, height: 92, borderRadius: 24, transform: `translateZ(${-e * 300}px)`, opacity: 1 - e, ...glass, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', boxSizing: 'border-box'}}>
            <div style={{width: 34, height: 34, borderRadius: 10, background: c}} />
            <span style={{...T(36, INK, FONT), position: 'relative'}}>{b}<span style={{position: 'absolute', left: 0, top: '52%', height: 4, background: RED, width: `${st * 100}%`}} /></span></div>; })}
      </div>
      {s.line && <div style={{position: 'absolute', top: 470, width: '100%', ...T(96), whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.12, opacity: k(t, [lineAt, lineAt + 0.3], [0, 1])}}><Words t={s.line} t0={t} at={lineAt} hot={s.hot} wrap /></div>}
    </AbsoluteFill>
  );
};

// Cycle: "For [audience]" — every audience is a person, so each word swap brings its own avatar.
const Cycle: React.FC<P<Extract<Scene, {kind: 'cycle'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), th = useTh();
  const lineAt = s.line ? wordAt(s.line, 0.5, m[1] ?? d * 0.6) : d + 1;
  const ats: number[] = []; s.items.forEach((it, i) => ats.push(wordAt(it, i ? ats[i - 1] + 0.1 : 0, (i * (lineAt - 0.1)) / s.items.length)));
  const w = Math.max(0, ats.filter((x) => t >= x).length - 1), lw = t - ats[w], heavy = k(t, [lineAt - 0.1, lineAt + 0.3], [0, 1]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 250, opacity: 1 - heavy, display: 'flex', gap: 18}}>{s.items.map((_, i) => <div key={i} style={{opacity: i <= w ? 1 : 0.35, transform: `scale(${i === w ? 1.15 : 0.85})`}}><Avatar seed={40 + i} s={120} grey={i === w ? 0 : 1} ring={i === w ? th.hot[w % 2] : undefined} /></div>)}</div>
      <div style={{position: 'absolute', top: 470, ...T(64, SUB, FONT), opacity: 1 - heavy}}>{s.prefix}</div>
      <div style={{position: 'absolute', top: 560, ...T(116, th.hot[w % 2]), opacity: (1 - heavy) * k(lw, [0, 0.25], [0, 1]), filter: `blur(${k(lw, [0, 0.25], [10, 0])}px)`, transform: `translateY(${k(lw, [0, 0.3], [40, 0])}px)`}}>{s.items[w]}</div>
      {s.line && heavy > 0 && <div style={{position: 'absolute', ...T(92), whiteSpace: 'normal', width: 1400, textAlign: 'center', lineHeight: 1.15}}><Words t={s.line} t0={t} at={lineAt} gap={0.1} hot={s.hot} wrap /></div>}
    </AbsoluteFill>
  );
};

// Cards: each card carries a small real visual (avatars / checklist / chart) instead of a stock object.
const Mini: React.FC<{i: number; c: string}> = ({i, c}) => i % 3 === 0
  ? <div style={{display: 'flex', justifyContent: 'center'}}>{[0, 1, 2].map((j) => <div key={j} style={{marginLeft: j ? -18 : 0}}><Avatar seed={60 + j} s={70} ring="#fff" /></div>)}</div>
  : i % 3 === 1 ? <div>{[0, 1, 2].map((j) => <div key={j} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: j ? 8 : 0}}><div style={{width: 22, height: 22, borderRadius: 6, background: j ? '#E3E6F0' : c}} /><Bar w={180 - j * 30} /></div>)}</div>
    : <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 80, justifyContent: 'center'}}>{[0.4, 0.7, 0.5, 1].map((h, j) => <div key={j} style={{width: 28, height: `${h * 100}%`, borderRadius: 6, background: j === 3 ? c : '#DCE0EC'}} />)}</div>;
const Cards: React.FC<P<Extract<Scene, {kind: 'cards'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), th = useTh(), n = s.cards.length;
  const ats: number[] = []; s.cards.forEach(([a], i) => ats.push(wordAt(a, i ? ats[i - 1] + 0.15 : 0, m[i] ?? (i * d) / (n + 1))));
  const flowAt = s.flow ? wordAt(s.flow, ats[n - 1] + 0.3, m[n] ?? d * 0.75) : d + 1, flow = k(t, [flowAt, flowAt + 0.75], [0, 1], IO);
  const pos = (i: number) => [-560 + (1120 * i) / Math.max(1, n - 1), i % 2 ? 120 : -120];
  const keys: Key[] = [[0, pos(0)[0], pos(0)[1], 1.3]];
  s.cards.forEach((_, i) => { const [x, y] = pos(i); if (i) keys.push([ats[i] - 0.25, ...keys[keys.length - 1].slice(1)] as Key, [ats[i] + 0.1, x, y, 1.3]); keys.push([Math.min(flowAt, (ats[i + 1] ?? flowAt) - 0.25), x, y + 20, 1.3]); });
  keys.push([flowAt + 0.35, 0, 0, 0.9], [d, 0, 0, 0.95]);
  return (
    <World t={t} keys={keys} id="cd">
      <svg width={2000} height={400} style={{position: 'absolute', left: -1000, top: -200, overflow: 'visible'}}>
        <path d="M 0 200 C 400 -40, 700 420, 1000 200 S 1600 -40, 2000 200" fill="none" stroke={th.hot[0]} strokeWidth={8} strokeLinecap="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - flow)} /></svg>
      {s.cards.map(([a, b], i) => { const [x, y] = pos(i), c = th.hot[i % 2];
        return <At key={a} x={x} y={y * (1 - flow)}><Pop t={t} at={ats[i]}><Card w={480} style={{textAlign: 'center', padding: 32}}>
          <Mini i={i} c={c} /><div style={{...T(62, c), whiteSpace: 'normal', marginTop: 22}}>{a}</div><div style={{...T(32, SUB, FONT), marginTop: 12, whiteSpace: 'normal', lineHeight: 1.2}}>{b}</div></Card></Pop></At>; })}
      {s.flow && <At x={0} y={330}><div style={{...T(92), opacity: k(t, [flowAt + 0.2, flowAt + 0.6], [0, 1])}}><Words t={s.flow} t0={t} at={flowAt + 0.2} hot={['flow.', 'flow', 'smooth']} /></div></At>}
    </World>
  );
};

// People: a row of person cards (grey -> colour as each role is spoken, reel 16–18 s face-wall idea) with their apps.
const People: React.FC<P<Extract<Scene, {kind: 'people'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), th = useTh(), n = s.rows.length;
  const ats: number[] = []; s.rows.forEach(([w], i) => ats.push(wordAt(w, i ? ats[i - 1] + 0.15 : 0, m[i] ?? (i * d) / (n + 1))));
  const afterAt = s.after ? wordAt(s.after, ats[n - 1] + 0.3, m[n] ?? d * 0.8) : d + 1, sc = k(t, [afterAt, afterAt + 0.6], [0, 1], IO);
  const cw = Math.min(330, 1560 / n);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 960 - (cw * n) / 2, top: 250 - sc * 120, width: cw * n, display: 'flex', opacity: 1 - sc * 0.55, filter: `blur(${sc * 6}px)`}}>
        {s.rows.map(([who, apps], i) => { const on = k(t, [ats[i], ats[i] + 0.4], [0, 1]);
          return <div key={who} style={{width: cw, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `translateY(${(1 - on) * 24}px)`}}>
            <Avatar seed={20 + i * 3} s={cw * 0.55} grey={1 - on} ring={on > 0.5 ? th.hot[i % 2] : undefined} />
            <span style={{...T(40, on > 0.5 ? INK : '#9AA0B5'), whiteSpace: 'normal', textAlign: 'center'}}>{who}</span>
            <div style={{display: 'flex', gap: 10, opacity: on}}>{apps.map((ap, j) => <Pop key={ap} t={t} at={ats[i] + 0.15 + j * 0.1}><Icon app={ap} s={70} /></Pop>)}</div></div>; })}
      </div>
      {s.after && <div style={{position: 'absolute', top: 680, width: '100%', ...T(104), opacity: k(t, [afterAt + 0.2, afterAt + 0.5], [0, 1])}}><Words t={s.after} t0={t} at={afterAt + 0.2} hot={['Different', 'different', 'apps.', 'people,']} /></div>}
    </AbsoluteFill>
  );
};

// Pricing: glass cards, an avatar for who it is for, the price counts up when the tier is named.
const Tiers: React.FC<P<Extract<Scene, {kind: 'tiers'}>>> = ({s, t, d, m}) => {
  const wordAt = useWordAt(), th = useTh(), n = s.tiers.length;
  const pain = (i: number) => m[i * 2] ?? (i * d) / n, price = (i: number) => wordAt(s.tiers[i].name, pain(i), m[i * 2 + 1] ?? pain(i) + 1.5);
  const x = (i: number) => -780 + i * 520;
  const keys: Key[] = [[0, x(0), 0, 1.3]];
  s.tiers.forEach((_, i) => { if (i) keys.push([pain(i) - 0.3, x(i - 1), 0, 1.3], [pain(i) + 0.1, x(i), 0, 1.3]); });
  keys.push([price(n - 1) + 1.0, x(n - 1), 0, 1.3], [price(n - 1) + 1.6, 0, 0, 0.82], [d, 0, 0, 0.86]);
  return (
    <World t={t} keys={keys} id="tr">
      {s.tiers.map((tr, i) => { const a = k(t, [pain(i), pain(i) + 0.35], [0, 1]), pr = k(t, [price(i), price(i) + 0.7], [0, 1]), c = th.hot[i % 2];
        return <At key={tr.name} x={x(i)} y={0}><div style={{opacity: Math.max(0.25, a), transform: `translateY(${(1 - a) * 60}px)`}}><Card w={460} style={{padding: 34}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Avatar seed={80 + i} s={70} /><span style={{...T(32, c), whiteSpace: 'normal'}}>{tr.who}</span></div>
          <div style={{...T(28, SUB, FONT), whiteSpace: 'normal', lineHeight: 1.3, marginTop: 20, minHeight: 110}}>{tr.pains}</div>
          <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 12, opacity: Math.min(1, pr * 3)}}>
            <span style={T(40, c)}>{tr.name}</span><span style={T(80)}>{countUp(tr.price, pr)}</span><span style={T(28, SUB, FONT)}>/ month</span></div></Card></div></At>; })}
    </World>
  );
};

const Team: React.FC<P<Extract<Scene, {kind: 'team'}>>> = ({s, t, d, m}) => {
  const th = useTh(), short = d < 3.6, trustAt = short ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55;
  const pr0 = short ? 0.5 : 0.6, press = k(t, [trustAt + pr0, trustAt + pr0 + 0.15, trustAt + pr0 + 0.3], [1, 0.92, 1], Easing.linear), conn = k(t, [trustAt + pr0 + 0.3, trustAt + pr0 + 0.7], [0, 1], IO);
  const keys: Key[] = short ? [[0, 0, 300, 1.3], [d, 0, 300, 1.36]] : [[0, 0, 0, 1.2], [trustAt - 0.6, 0, 40, 1.12], [trustAt + 0.1, 0, 330, 1.5], [d, 0, 320, 1.45]];
  return (
    <World t={t} keys={keys} id="tm">
      {!short && <At x={0} y={-60}><Pop t={t} at={0.05}><Card w={1100} style={{padding: 36}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><span style={T(44)}>Team workspace</span>
          <div style={{display: 'flex'}}>{[0, 1, 2, 3].map((i) => <div key={i} style={{marginLeft: i ? -16 : 0, transform: `scale(${k(t, [0.4 + i * 0.15, 0.7 + i * 0.15], [0, 1], BACK)})`}}><Avatar seed={90 + i} s={66} ring="#fff" /></div>)}</div></div>
        {s.rows.map(([r, who], i) => <div key={r} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, padding: '18px 24px', borderRadius: 16, background: '#F5F7FB', opacity: k(t, [0.9 + i * 0.2, 1.2 + i * 0.2], [0, 1])}}>
          <span style={T(34, INK, FONT)}>{r}</span><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Avatar seed={90 + i} s={44} /><span style={T(26, th.hot[i % 2], FONT)}>{who}</span></div></div>)}
      </Card></Pop></At>}
      {s.chip && !short && <At x={360} y={-330}><Pop t={t} at={1.6}><Pill c={th.hot[0]} s={30}>{s.chip}</Pill></Pop></At>}
      <At x={0} y={330}><div style={{opacity: k(t, [trustAt - 0.1, trustAt + 0.2], [0, 1]), transform: `scale(${press})`}}>
        <div style={{width: 320 + 140 * conn, height: 110, borderRadius: 60, background: interpolateColors(conn, [0, 1], [th.hot[0], OK]), display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(50, '#fff'), boxShadow: '0 20px 50px rgba(30,40,90,.25)'}}>{conn < 0.5 ? 'Approve' : 'Connected ✓'}</div></div></At>
      <At x={0} y={short ? 160 : 470}><div style={{...T(short ? 64 : 44, short ? INK : SUB, short ? DISP : FONT), width: short ? 1300 : undefined, whiteSpace: short ? 'normal' : 'nowrap', textAlign: 'center', lineHeight: 1.2, opacity: k(t, short ? [0.05, 0.3] : [trustAt + 1.2, trustAt + 1.5], [0, 1])}}>
        <Words t={s.trust} t0={t} at={short ? 0.05 : trustAt + 1.2} hot={['approve', 'pay', "don't", 'Nothing', 'every']} wrap={short} /></div></At>
    </World>
  );
};

// End card (reel 46–52 s): logo + wordmark type-on, tagline with hot word, CTA chips, soft bloom bars rising.
const End: React.FC<P<Extract<Scene, {kind: 'end'}>>> = ({t, d, m}) => {
  const th = useTh(), bio = m[1] ?? d - 1.4;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', bottom: -60, left: 0, right: 0, height: 420, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18, filter: 'blur(22px)'}}>
        {Array.from({length: 22}, (_, i) => { const mid = 1 - Math.abs(i - 10.5) / 11; return <div key={i} style={{width: 60, height: (120 + 300 * mid) * k(t, [0.2, 1.2], [0, 1]) * (0.85 + 0.15 * Math.sin(t * 4 + i)), borderRadius: 40, background: i % 2 ? th.bloom[0] : th.bloom[1]}} />; })}</div>
      <div style={{position: 'absolute', top: 210, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={124} /></Pop>
        <span style={{...T(110), minWidth: 560}}>{typed('FansaChat', t, 0.25, 0.75)}</span></div>
      <div style={{position: 'absolute', top: 420, ...T(66)}}><Words t="Get every update first." t0={t} at={0.6} hot={['every', 'first.']} /></div>
      <div style={{position: 'absolute', top: 580, display: 'flex', gap: 30}}>
        <Pop t={t} at={1.2}><Pill c={th.hot[0]} solid s={48}>Join the waitlist</Pill></Pop>
        <Pop t={t} at={1.6}><Pill c={th.hot[1]} s={48}>Telegram community</Pill></Pop></div>
      <div style={{position: 'absolute', top: 790, ...T(44, SUB, FONT), opacity: k(t, [bio, bio + 0.4], [0, 1])}}>Link in bio</div>
    </AbsoluteFill>
  );
};

const VIEW: Record<Scene['kind'], React.FC<P<any>>> = {hook: Hook, brand: Brand, flow: Flow, glass: Glass, cycle: Cycle, cards: Cards, people: People, tiers: Tiers, team: Team, end: End};

// ---- timeline + sound design (unchanged from v9 except hook beats) -------------------------------------------------
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
    if (i) out.push([a - 0.12, sc.kind === 'end' ? 'transition_camera_flash_1' : `transition_whoosh_${['0.25s', '0.45s', '0.7s'][i % 3]}`, 0.42]);
    if (sc.kind === 'hook') { let prev = a; sc.phrases.forEach((p, j) => { prev = wa(p.text, prev + (j ? 0.2 : 0), a + 0.05 + (j / sc.phrases.length) * d * 0.86); out.push([prev, p.vis ? `node_pop_${(j % 5) + 1}` : `text_mouth_pop_${(j % 4) + 1}`, 0.42]); }); }
    if (sc.kind === 'brand') { const L = sc.line ? (m[1] ?? 2.6) : 0.1; out.push([a + L, 'node_pop_4', 0.5], [a + L + 0.45, 'typing_keyboard_2.0s', 0.25]); if (sc.apps) out.push([wa('connected', a + L, a + d * 0.55), 'counter_roll_riser_1.5s', 0.36]); }
    if (sc.kind === 'flow') { const n = sc.leaves.length, tEnd = Math.min(d * 0.32, 0.5 + sc.say.length * 0.03), g = (j: number) => tEnd + 0.25 + j * Math.min(0.45, (d * 0.38) / n), run = g(n - 1) + 0.6;
      out.push([a + 0.5, 'typing_keyboard_2.0s', 0.4], [a + tEnd, 'ui_click_2', 0.55]); sc.leaves.forEach((_, j) => out.push([a + g(j), `node_pop_${(j % 5) + 1}`, 0.42])); out.push([a + run, 'ui_click_1', 0.6], [a + run + 0.3, 'success_chime_C', 0.45]); }
    if (sc.kind === 'glass') { let prev = a; sc.bars.forEach((bb, j) => { prev = wa(bb, prev + (j ? 0.15 : 0), a + 0.2 + (j * d * 0.6) / sc.bars.length); out.push([prev, `ui_tick_${(j % 2) + 1}`, 0.42]); }); }
    if (sc.kind === 'cycle') { let prev = a; sc.items.forEach((it, j) => { prev = wa(it, prev + (j ? 0.1 : 0), a + j * 0.9); out.push([prev, `ui_click_${(j % 3) + 1}`, 0.42]); }); }
    if (sc.kind === 'cards' || sc.kind === 'people') { let prev = a; (sc.kind === 'cards' ? sc.cards.map((c) => c[0]) : sc.rows.map((r) => r[0])).forEach((x, j) => { prev = wa(x, prev + (j ? 0.15 : 0), a + (m[j] ?? j)); out.push([prev, `node_pop_${(j % 5) + 1}`, 0.45]); }); }
    if (sc.kind === 'tiers') m.forEach((x, j) => out.push([a + x, j % 2 ? 'counter_roll_riser_1.5s' : 'ui_tick_1', j % 2 ? 0.3 : 0.4]));
    if (sc.kind === 'team') { const tr = d < 3.6 ? 0.15 : m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55, p0 = d < 3.6 ? 0.5 : 0.6; out.push([a + 0.05, 'node_pop_1', 0.4], [a + tr + p0, 'ui_click_1', 0.65], [a + tr + p0 + 0.3, 'success_chime_C', 0.5]); }
    if (sc.kind === 'end') out.push([a + 0.05, 'hook_bass_impact_0.8s', 0.45], [a + 0.25, 'typing_keyboard_2.0s', 0.2], [a + 1.2, 'node_pop_4', 0.45], [a + 1.6, 'node_pop_5', 0.45]);
  });
  return out;
};

// Scene change per theme: 'blur' (zoom-blur), 'circle' (new scene revealed through a growing circle), 'whip' (lateral
// move with motion blur). One style per video so the seven ads feel different.
export const Ad10: React.FC<{spec: Spec; music?: boolean}> = ({spec, music = false}) => {
  const f = useCurrentFrame(), {fps, width, height, durationInFrames} = useVideoConfig(), s = f / fps;
  const tl = React.useMemo(() => timeline(spec), [spec]), sfx = React.useMemo(() => sfxFor(spec), [spec]);
  const i = Math.max(0, tl.findIndex(({a, b}) => s >= a && s < b)), {sc, a, b, m} = tl[i];
  const t = s - a, d = b - a, V = VIEW[sc.kind], w = spec.theme.wipe;
  const inn = i ? k(t, [0, w === 'circle' ? 0.45 : 0.22], [1, 0], w === 'circle' ? IO : OUT) : 0, out = i < tl.length - 1 ? k(t, [d - 0.16, d], [0, 1], IN) : 0;
  const fit = height > width ? width / 1500 : Math.max(width / 1920, height / 1080);
  const bgs = Math.max(width / 1920, height / 1080);
  const sceneStyle: React.CSSProperties = w === 'whip'
    ? {transform: `translateX(${(inn * 0.35 - out * 0.35) * width}px)`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 26}px)` : undefined, opacity: 1 - Math.max(inn, out) * 0.6}
    : w === 'circle' ? {clipPath: inn > 0 ? `circle(${(1 - inn) * 75}% at 50% 50%)` : undefined, opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : undefined}
      : {transform: `scale(${1 - inn * 0.06 + out * 0.16})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 10}px)` : undefined, opacity: 1 - out * 0.5};
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <style>{css}</style>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${bgs})`}}>
        <Backdrop th={spec.theme} s={s} />
      </div>
      <Audio src={staticFile(`audio/${spec.id}/vo.wav`)} />
      {sfx.map(([at, file, v], j) => <Sequence key={j} from={Math.max(0, Math.round(at * fps))}><Audio src={staticFile(`sfx/proc/${file}.ogg`)} volume={v} /></Sequence>)}
      {music && <Audio src={staticFile(`audio/${spec.music}`)} volume={(fr) => 0.24 * Math.min(1, fr / 30) * Math.min(1, (durationInFrames - fr) / 90)} />}
      <AbsoluteFill style={sceneStyle}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${fit})`}}>
          <C.Provider value={{words: spec.words, a, th: spec.theme}}><AbsoluteFill><V s={sc} t={t} d={d} m={m} /></AbsoluteFill></C.Provider>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
