// P01 "Stop copying leads by hand" — 9:16, 30 fps, ~30 s. Storyboard build.
// Camera language: fansachat-camera-zoom (one camera per world, crash zoom on the beat, drift + wobble, particle hand-offs).
// Brand look reused from intro27/intro28 (paper stage, periwinkle/blush liquid, Clash/Sora/Inter, builder composer, Lockup).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT, Glyph, Lockup} from '../intro27/ui';
import {Cursor, ez, glass, lerp, Liquid} from '../intro28/kit';
import {BUILDER, CHECK, END, KEYWORDS, NODES, PLAN, SENTENCE, TURN, VO} from './copy';
import {FPS, T, VO_AT, VOL} from './timeline';
import {Backdrop} from './backdrop';

const BEATS = [T.morph, ...T.cross, T.send, T.run, T.done];

const W = 1080, H = 1920;
const INK = '#221E30', LO = '#6A6580', PERI = '#8B8FE8', PERI_D = '#6468D8', PAPER = '#F7F6F9', DARK = '#100D16';
const RED = '#E5484D', GREEN = '#2FB67C';
const REVEAL = Easing.bezier(0.33, 0, 0.2, 1), SMOOTH = Easing.inOut(Easing.cubic), CRASH = Easing.bezier(0.16, 1, 0.3, 1);
// one settle for the whole film (critically damped step, fps-aware: 30 fps here)
const settle = (f: number, at: number, w = 14) => { const t = Math.max(0, (f - at) / FPS); return 1 - (1 + w * t) * Math.exp(-w * t); };
const hash = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- camera: [frame, zoom, focusX, focusY, ease-into-this-key], zoom eased in log space ----------
type K = [number, number, number, number, ('c' | 's' | 'r')?];
const camAt = (k: K[], f: number): [number, number, number] => {
  if (f <= k[0][0]) return [k[0][1], k[0][2], k[0][3]];
  for (let i = 0; i < k.length - 1; i++) {
    const [a, za, xa, ya] = k[i], [b, zb, xb, yb, e] = k[i + 1];
    if (f <= b) { const p = interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e === 'c' ? CRASH : e === 'r' ? REVEAL : SMOOTH});
      return [Math.exp(lerp(Math.log(za), Math.log(zb), p)), lerp(xa, xb, p), lerp(ya, yb, p)]; }
  }
  const l = k[k.length - 1]; return [l[1], l[2], l[3]];
};
const CAM_A: K[] = [[0, 1.0, 580, 960], [90, 1.06, 578, 955], [T.crash, 1.07, 578, 975], [T.crash + 10, 2.15, 440, 1020, 'c'], [T.scatter + 14, 2.3, 445, 1015]];
const B0Y = 880; // camera B focus y at the iris (chat box centre lands at screen y 720)
const CAM_B: K[] = [[T.iris - 6, 0.9, 583, B0Y], [T.typeAt, 0.9, 583, B0Y], [T.typeAt + 30, 0.9, 583, 870], [T.typeAt + 38, 0.92, 583, 860, 'c'], [T.typeAt + 60, 0.92, 583, 860], [T.typeAt + 68, 0.936, 583, 850, 'c'], [T.send, 0.936, 583, 850], [T.lift + 24, 1.04, 607, 861, 'r'], [T.pull, 1.05, 607, 861], [T.pull + 18, 0.92, 588, 935, 'r'], [T.run - 8, 0.94, 588, 945], [T.run + 6, 0.98, 588, 961, 'c'], [T.pushDone - 2, 0.99, 588, 961], [T.pushDone + 11, 1.6, 565, 1290, 'c'], [T.end, 1.66, 565, 1292]];

const World: React.FC<{f: number; keys: K[]; children: React.ReactNode}> = ({f, keys, children}) => {
  const [z, x, y] = camAt(keys, f), [z0, x0, y0] = camAt(keys, f - 1);
  const drift = 1 + 0.012 * Math.sin(f / 55), rot = 0.6 * Math.sin(f / 70) - 0.2 * Math.sin(f / 23);
  const v = Math.abs(Math.log(z / z0)) * 900 + Math.hypot(x - x0, y - y0) * z * 0.05; // camera speed → directional-ish blur
  return <AbsoluteFill style={{filter: v > 0.6 ? `blur(${Math.min(9, v * 0.5)}px)` : undefined}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) rotate(${rot}deg) scale(${z * drift}) translate(${-x}px, ${-y}px)`}}>{children}</div>
  </AbsoluteFill>;
};
const toScreen = (keys: K[], f: number, wx: number, wy: number): [number, number] => { const [z, x, y] = camAt(keys, f); return [W / 2 + (wx - x) * z, H / 2 + (wy - y) * z]; };

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', borderRadius: 48, background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: 'inset 0 1.5px 0 #fff, 0 50px 90px -40px rgba(40,30,80,0.38)', boxSizing: 'border-box', ...extra});
const Tile: React.FC<{k: string; size: number; on?: boolean}> = ({k, size, on}) => <div style={{width: size, height: size, borderRadius: size * 0.28, background: on ? 'rgba(47,182,124,0.14)' : '#F1EFF8', border: '1px solid rgba(32,28,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><Img src={staticFile(`logos/ap/${k}.png`)} style={{width: size * 0.6, height: size * 0.6, objectFit: 'contain'}} /></div>;

// letter write-in: per glyph opacity / rise / blur, 1.5 f stagger
const Write: React.FC<{text: string; f: number; at: number; style: React.CSSProperties}> = ({text, f, at, style}) => <span style={{...style, whiteSpace: 'nowrap'}}>{text.split('').map((c, i) => { const k = ez(f, at + i * 1.5, at + i * 1.5 + 9); return <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 12}px)`, filter: `blur(${(1 - k) * 8}px)`, whiteSpace: 'pre'}}>{c === ' ' ? <span style={{display: 'inline-block', width: '0.32em'}} /> : c}</span>; })}</span>;

// ================= world A: hook (Typeform card) → problem (same card becomes the checklist) =================
const WorldA: React.FC<{f: number}> = ({f}) => {
  const pop = ez(f, T.speck, T.cardIn + 4), mk = ez(f, T.morph, T.morph + 18, SMOOTH);
  const h = lerp(560, 660, mk), formK = 1 - ez(f, T.morph, T.morph + 10);
  return <>
    <div style={{position: 'absolute', left: 130, top: 760 - h / 2, width: 820, height: h, transform: `scale(${lerp(0.04, 1, pop)})`, transformOrigin: '50% 50%', filter: pop < 1 ? `blur(${(1 - pop) * 26}px)` : undefined}}>
      <div style={card({inset: 0})} />
      {/* hook content: Typeform "new response" card */}
      {formK > 0 ? <div style={{position: 'absolute', inset: 0, padding: 56, opacity: formK, filter: `blur(${(1 - formK) * 10}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <Tile k="typeform" size={108} />
          <div><div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 52, color: INK, lineHeight: 1.1}}>Typeform</div><div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: LO, marginTop: 6}}>New response</div></div>
          <div style={{marginLeft: 'auto', width: 22, height: 22, borderRadius: 99, background: PERI_D, boxShadow: `0 0 0 ${8 + 6 * Math.abs(Math.sin(f / 9))}px rgba(100,104,216,0.18)`}} />
        </div>
        <div style={{height: 1, background: 'rgba(32,28,46,0.10)', margin: '40px 0 30px'}} />
        {['Name', 'Email', 'Company'].map((l, i) => { const fa = 10 + i * Math.max(5, (T.morph - 40) / 3), k = ez(f, fa, fa + 14); // fields fill in across the hook line return <div key={l} style={{marginBottom: 26, opacity: k, transform: `translateY(${(1 - k) * 14}px)`}}>
          <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, color: LO}}>{l}</div>
          <div style={{height: 24, width: `${[62, 84, 48][i]}%`, borderRadius: 12, background: '#E7E4F0', marginTop: 10}} />
        </div>; })}
      </div> : null}
      {/* problem content: Notes-style checklist, red crosses draw on */}
      {mk > 0 ? CHECK.map((r, i) => { const y = 120 + i * 210 - (660 - h) / 2, cx = T.cross[i], dk = ez(f, cx, cx + 6, Easing.out(Easing.cubic)), dk2 = ez(f, cx + 3, cx + 9, Easing.out(Easing.cubic)); const rowK = ez(f, T.rows[i] - 4, T.rows[i] + 6);
        return <div key={r.text} style={{position: 'absolute', left: 56, right: 56, top: y - 50, height: 100, display: 'flex', alignItems: 'center', gap: 34, opacity: rowK}}>
          <svg width={84} height={84} viewBox="0 0 84 84" style={{flex: 'none'}}>
            <circle cx={42} cy={42} r={36} fill="none" stroke={f >= cx ? RED : 'rgba(32,28,46,0.25)'} strokeWidth={4} />
            <path d="M28 28 L56 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dk} fill="none" />
            <path d="M56 28 L28 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dk2} fill="none" />
          </svg>
          <Write text={r.text} f={f} at={T.rows[i]} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 64, color: f >= cx + 6 ? 'rgba(34,30,48,0.55)' : INK, letterSpacing: '-0.02em'}} />
          <div style={{marginLeft: 'auto', opacity: ez(f, T.rows[i] + 8, T.rows[i] + 20)}}><Tile k={r.app} size={78} /></div>
        </div>; }) : null}
    </div>
  </>;
};

// ================= turn: dark plate, list scatters into particles → "let's fix that" → particles form the chat box =================
const N = 150;
const CHAT = {cx: 540, cy: 640, w: 940, h: 260};
const Turn: React.FC<{f: number}> = ({f}) => {
  const rIn = lerp(0, 1300, ez(f, T.scatter - 4, T.scatter + 8));
  const words = TURN.map((w, i) => ({w, k: ez(f, T.turnText + i * 3, T.turnText + i * 3 + 10)}));
  const out = ez(f, T.converge - 2, T.converge + 10);
  const g = f >= T.glitch && f < T.glitch + 10; const j = (s: number) => (hash(f, s) - 0.5) * 18;
  return <>
    <AbsoluteFill style={{clipPath: `circle(${rIn}px at 50% 50%)`}}>
      <Liquid f={f} a="rgba(100,104,216,0.55)" b="rgba(244,184,168,0.18)" c="rgba(139,143,232,0.30)" base={DARK} />
      <div style={{position: 'absolute', left: 0, right: 80, top: 830, display: 'flex', justifyContent: 'center', gap: 30, opacity: 1 - out, filter: out > 0 ? `blur(${out * 18}px)` : undefined, transform: `scale(${1 + out * 0.15})`}}>
        {words.map(({w, k}) => <div key={w} style={{position: 'relative', opacity: k, transform: `translateY(${(1 - k) * 24}px)`, filter: `blur(${(1 - k) * 12}px)`, fontFamily: FONT.clash, fontWeight: 600, fontSize: 128, letterSpacing: '-0.03em', color: w === 'fix' ? PERI : '#EDEBF5', lineHeight: 1}}>
          {w === 'fix' && g ? <>
            <span style={{position: 'absolute', left: j(1), top: j(2) * 0.3, color: 'rgba(255,60,90,0.85)', mixBlendMode: 'screen'}}>{w}</span>
            <span style={{position: 'absolute', left: -j(3), top: -j(4) * 0.3, color: 'rgba(60,220,255,0.85)', mixBlendMode: 'screen'}}>{w}</span>
          </> : null}
          <span style={{position: 'relative', clipPath: g ? `inset(${hash(f, 5) * 40}% 0 ${hash(f, 6) * 30}% 0)` : undefined}}>{w}</span>
          {w === 'fix' && g ? <span style={{position: 'absolute', left: j(7) * 1.5, top: 0, clipPath: `inset(${50 + hash(f, 8) * 20}% 0 0 0)`}}>{w}</span> : null}
        </div>)}
      </div>
    </AbsoluteFill>
  </>;
};
// particles drawn on top of both worlds during the hand-offs
const Particles: React.FC<{f: number}> = ({f}) => {
  if (f < T.scatter || f > T.iris + 14) return null;
  const burst = ez(f, T.scatter, T.scatter + 26), conv = ez(f, T.converge, T.iris + 2, Easing.inOut(Easing.cubic)), fade = 1 - ez(f, T.iris + 2, T.iris + 14);
  const per = 2 * (CHAT.w + CHAT.h); // world units; scaled by zb below
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: N}, (_, i) => {
      const row = i % 3, wx = 300 + hash(i, 1) * 420, wy = 760 - 330 + 120 + row * 210 + (hash(i, 2) - 0.5) * 50; // checklist glyph area (world A)
      const [sx, sy] = toScreen(CAM_A, T.scatter, wx, wy);
      const a = hash(i, 3) * Math.PI * 2, d = 160 + hash(i, 4) * 520;
      const bx = sx + Math.cos(a) * d * burst, by = sy + Math.sin(a) * d * burst * 0.8;
      const [L, Tp] = toScreen(CAM_B, T.iris, CHAT.cx - CHAT.w / 2, CHAT.cy - CHAT.h / 2); const zb = camAt(CAM_B, T.iris)[0]; let p = (i / N) * per * zb; let tx: number, ty: number; // chat box perimeter in screen space
      const cw = CHAT.w * zb, ch = CHAT.h * zb; if (p < cw) { tx = L + p; ty = Tp; } else if ((p -= cw) < ch) { tx = L + cw; ty = Tp + p; } else if ((p -= ch) < cw) { tx = L + cw - p; ty = Tp + ch; } else { p -= cw; tx = L; ty = Tp + ch - p; }
      const dl = hash(i, 5) * 0.25, ck = Math.min(1, Math.max(0, (conv - dl) / (1 - dl)));
      const x = lerp(bx, tx, ck), y = lerp(by, ty, ck);
      const op = (f < T.converge ? lerp(1, 0.45, burst) : lerp(0.45, 1, ck)) * fade;
      return <circle key={i} cx={x} cy={y} r={3 + hash(i, 6) * 4} fill={hash(i, 7) > 0.35 ? '#EDEBF5' : PERI} opacity={op} />;
    })}
  </svg>;
};

// ================= world B: chat box → sentence types → words become 3 nodes → zoom-out → run =================
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, px: number) => { if (typeof document === 'undefined') return t.length * px * 0.52; measureCtx = measureCtx ?? document.createElement('canvas').getContext('2d'); measureCtx!.font = `500 ${px}px ${FONT.ui}`; return measureCtx!.measureText(t).width; };
const TXT = 42, LH = 58, PADX = 44, PADY = 44;
const NODE_Y = [690, 910, 1130], NODE = {x: 150, w: 780, h: 160}, PLAN_TOP = 585, PLAN_ROW_Y = [700, 785, 870];
const WorldB: React.FC<{f: number}> = ({f}) => {
  const full = SENTENCE.join(' '); const typed = Math.max(0, Math.floor((f - T.typeAt) * T.cps));
  const lift = ez(f, T.lift, T.lift + 22, CRASH); const press = Math.max(0, 1 - Math.abs(f - T.send) / 5);
  const cx = CHAT.cx, cy = lerp(CHAT.cy, 330, lift), sc = lerp(1, 0.8, lift);
  const winK = ez(f, T.pull - 8, T.pull + 16);
  // line layout (local to the chat card, origin = its top-left)
  let used = 0; const lines = SENTENCE.map((l) => { const start = used; used += l.length + 1; return {l, start}; });
  const kwPos = KEYWORDS.map((kw, i) => { const li = lines.findIndex((x) => x.l.includes(kw)); const off = textW(lines[li].l.slice(0, lines[li].l.indexOf(kw)), TXT); const wdt = textW(kw, TXT);
    return {i, li, at: lines[li].start + lines[li].l.indexOf(kw), x: PADX + off, y: PADY + li * LH, w: wdt}; });
  const local = (x: number, y: number): [number, number] => [cx + (x - CHAT.w / 2) * sc, cy + (y - CHAT.h / 2) * sc];
  const runPress = Math.max(0, 1 - Math.abs(f - T.run) / 5), ran = f >= T.run;
  return <>
    {/* builder window chrome, revealed by the pull-back */}
    <div style={{position: 'absolute', left: 40, top: 130, width: 1000, height: 1095, opacity: winK, transform: `scale(${lerp(1.04, 1, winK)})`}}>
      <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 56}} />
      <div style={{position: 'absolute', left: 64, right: 56, top: 392, height: 64, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 34, color: INK, whiteSpace: 'nowrap'}}>{BUILDER.title}</div>
        <div style={{fontFamily: FONT.ui, fontSize: 32, color: LO, whiteSpace: 'nowrap'}}>{BUILDER.planMeta}</div>
        <div style={{marginLeft: 'auto', padding: '12px 24px', borderRadius: 999, background: ran ? PERI_D : '#fff', color: ran ? '#fff' : INK, border: '1px solid rgba(32,28,46,0.10)', fontFamily: FONT.ui, fontWeight: 600, fontSize: 32, whiteSpace: 'nowrap', transform: `scale(${1 - 0.08 * runPress})`}}>▷ {BUILDER.run}</div>
      </div>
    </div>
    {/* chat box (the builder composer) */}
    <div style={{position: 'absolute', left: cx - CHAT.w / 2, top: cy - CHAT.h / 2, width: CHAT.w, height: CHAT.h, transform: `scale(${sc})`, transformOrigin: '50% 50%'}}>
      {(() => { const mv = Math.abs(lift - ez(f - 1, T.lift, T.lift + 22, CRASH)) * 40; return <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 44, background: 'linear-gradient(100deg, rgba(232,233,251,0.92), rgba(253,236,231,0.92))', border: '1.5px solid rgba(255,255,255,0.98)', boxShadow: `inset 0 2px 0 #fff, inset 0 -12px 26px rgba(139,143,232,0.14), ${mv > 0.2 ? `${-Math.min(2, mv)}px 0 0 rgba(255,70,110,0.45), ${Math.min(2, mv)}px 0 0 rgba(60,200,255,0.45), ` : ''}0 50px 90px -40px rgba(40,30,80,0.38)`}} />; })()}
      {typed === 0 ? <div style={{position: 'absolute', left: PADX, top: PADY, fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT, color: LO}}>{BUILDER.placeholder}</div> : null}
      {lines.map(({l, start}, li) => { const n = Math.min(l.length, Math.max(0, typed - start)); if (n <= 0) return null;
        const segs: React.ReactNode[] = []; let pos = 0;
        KEYWORDS.forEach((kw) => { const fi = l.indexOf(kw); if (fi < 0 || fi >= n) return; const end = Math.min(n, fi + kw.length);
          segs.push(<span key={'a' + kw}>{l.slice(pos, fi)}</span>);
          segs.push(<span key={kw} style={{background: 'rgba(100,104,216,0.18)', color: PERI_D, borderRadius: 10, boxShadow: '0 0 0 4px rgba(100,104,216,0.18)', opacity: 1}}>{l.slice(fi, end)}</span>); pos = end; });
        segs.push(<span key="z">{l.slice(pos, n)}</span>);
        const curLine = lines.findIndex((x, j) => j === lines.length - 1 || typed < lines[j + 1].start);
        const caret = li === curLine && f < T.send && Math.floor(f / 8) % 2 === 0;
        return <div key={li} style={{position: 'absolute', left: PADX, top: PADY + li * LH, height: LH, fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT, color: INK, whiteSpace: 'pre', display: 'flex', alignItems: 'center'}}>{segs}{caret ? <span style={{width: 4, height: TXT * 1.05, background: PERI_D, marginLeft: 3, borderRadius: 2}} /> : null}</div>; })}
      <div style={{position: 'absolute', right: 24, bottom: 24, width: 84, height: 84, borderRadius: 999, background: typed > 0 ? PERI_D : 'transparent', border: `2px solid ${typed > 0 ? PERI_D : '#2B2734'}`, color: typed > 0 ? '#fff' : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui, fontWeight: 700, fontSize: 40, transform: `scale(${1 - 0.08 * press})`}}>↑</div>
    </div>
    {/* agent flow under the lifted message: "Thinking…" shimmer → reply */}
    {f >= T.think && f < T.reply + 6 ? (() => { const k = ez(f, T.think, T.think + 8) * (1 - ez(f, T.reply - 4, T.reply + 4)); const sh = ((f - T.think) * 14) % 700;
      return <div style={{position: 'absolute', left: 164, top: 458, opacity: k, display: 'flex', gap: 14, alignItems: 'baseline'}}>
        <span style={{width: 22, height: 22, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${PERI} 45%, ${PERI_D})`, flex: 'none', alignSelf: 'center'}} />
        <span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 34, backgroundImage: `linear-gradient(90deg, ${LO} 0px, ${LO} ${sh - 120}px, ${PERI} ${sh}px, ${LO} ${sh + 120}px, ${LO} 900px)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BUILDER.thinking}</span>
      </div>; })() : null}
    <div style={{position: 'absolute', left: 164, top: 462, opacity: ez(f, T.reply, T.reply + 12), transform: `translateY(${(1 - ez(f, T.reply, T.reply + 12)) * 14}px)`, display: 'flex', gap: 14, alignItems: 'baseline'}}>
      <span style={{width: 22, height: 22, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${PERI} 45%, ${PERI_D})`, flex: 'none', alignSelf: 'center'}} />
      <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: LO, whiteSpace: 'nowrap'}}>{BUILDER.reply}</span>
    </div>
    {/* plan card with a checklist; each row then morphs into its node */}
    {f >= T.plan && f < T.morphPlan + 14 ? (() => { const k = settle(f, T.plan), out = ez(f, T.morphPlan, T.morphPlan + 10);
      return <div style={{position: 'absolute', left: NODE.x, top: PLAN_TOP, width: NODE.w, height: 340, opacity: Math.min(1, k * 1.5) * (1 - out), transform: `translateY(${(1 - k) * 40}px) scale(${0.96 + 0.04 * k})`}}>
        <div style={card({inset: 0, borderRadius: 40})} />
        <div style={{position: 'absolute', left: 36, top: 26, display: 'flex', gap: 16, alignItems: 'baseline'}}><span style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 36, color: INK}}>{BUILDER.plan}</span><span style={{fontFamily: FONT.ui, fontSize: 28, color: LO}}>{BUILDER.planMeta}</span></div>
      </div>; })() : null}
    {/* connectors: arcs OUTSIDE the cards (right edge → right edge) */}
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {[0, 1].map((i) => { const k = ez(f, T.edges + i * 6, T.edges + i * 6 + 14); const x = NODE.x + NODE.w, y1 = NODE_Y[i] + 28, y2 = NODE_Y[i + 1] - 28; const on = f >= T.lit[i + 1];
        return k <= 0 ? null : <g key={i}><path d={`M${x} ${y1} C ${x + 58} ${y1}, ${x + 58} ${y2}, ${x} ${y2}`} fill="none" stroke={on ? GREEN : '#2B2734'} strokeWidth={4} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" />
          <circle cx={x} cy={y2} r={8} fill={on ? GREEN : '#2B2734'} opacity={k >= 0.98 ? 1 : 0} /></g>; })}
    </svg>
    {/* plan rows → nodes (shared element: the row's rect grows into the node card) */}
    {NODES.map((n, i) => { if (f < T.plan + 6 + i * 5) return null;
      const rk = ez(f, T.plan + 6 + i * 5, T.plan + 18 + i * 5), mk = ez(f, T.morphPlan + i * 3, T.morphPlan + 18 + i * 3, SMOOTH), lit = f >= T.lit[i], sweep = ez(f, T.lit[i], T.lit[i] + 8);
      const ry = PLAN_ROW_Y[i], x = lerp(NODE.x + 24, NODE.x, mk), y = lerp(ry - 36, NODE_Y[i] - NODE.h / 2, mk), w = lerp(NODE.w - 48, NODE.w, mk), h = lerp(72, NODE.h, mk);
      const tick = f >= T.plan + 14 + i * 6, rowOp = 1 - ez(f, T.morphPlan + i * 3, T.morphPlan + 8 + i * 3), nodeOp = ez(f, T.morphPlan + 8 + i * 3, T.morphPlan + 18 + i * 3);
      return <div key={n.app} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: rk, transform: `translateY(${(1 - rk) * 16}px)`}}>
        <div style={card({inset: 0, borderRadius: lerp(20, 40, mk), background: `rgba(255,255,255,${lerp(0, 0.88, mk)})`, boxShadow: mk > 0 ? `inset 0 1.5px 0 #fff, 0 50px 90px -40px rgba(40,30,80,${0.38 * mk})` : 'none', border: `2px solid ${lit ? GREEN : `rgba(255,255,255,${mk * 0.95})`}`})} />
        {rowOp > 0 ? <div style={{position: 'absolute', inset: 0, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 20, opacity: rowOp}}>
          <Tile k={n.app} size={60} />
          <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: INK, whiteSpace: 'nowrap'}}>{PLAN[i]}</span>
          <div style={{marginLeft: 'auto', width: 44, height: 44, borderRadius: 99, border: `3px solid ${tick ? PERI_D : 'rgba(32,28,46,0.25)'}`, background: tick ? PERI_D : 'transparent', color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tick ? '✓' : ''}</div>
        </div> : null}
        {nodeOp > 0 ? <>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`, borderRadius: 40, background: 'rgba(47,182,124,0.10)'}} />
          <div style={{position: 'absolute', inset: 0, padding: '0 80px 0 34px', display: 'flex', alignItems: 'center', gap: 26, opacity: nodeOp}}>
            <Tile k={n.app} size={96} on={lit} />
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 44, color: INK, lineHeight: 1.15}}>{n.name}</div>
              <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: LO, marginTop: 4}}>{n.action.includes('{name}') ? <>{n.action.split('{name}')[0].split('“')[0]}<span style={{whiteSpace: 'nowrap'}}>“{n.action.split('{name}')[0].split('“')[1]}<span style={{fontWeight: 600, color: PERI_D, background: 'rgba(100,104,216,0.14)', borderRadius: 8, padding: '0 8px'}}>{'{name}'}</span>{n.action.split('{name}')[1]}</span></> : n.action}</div>
            </div>
            <div style={{position: 'absolute', right: 26, top: 22, width: 46, height: 46, borderRadius: 99, background: lit ? GREEN : PERI_D, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{lit ? '✓' : i + 1}</div>
          </div>
        </> : null}
      </div>; })}
    {/* ★ signature: the typed keywords fly out of the sentence and land as the plan-row icons */}
    {kwPos.map((p) => { const at = T.plan - 2 + p.i * 5, k = ez(f, at, at + 14, Easing.inOut(Easing.cubic)); if (f < at || k >= 1) return null;
      const [sx, sy] = local(p.x + p.w / 2, p.y + LH / 2), tx = NODE.x + 24 + 12 + 30, ty = PLAN_ROW_Y[p.i];
      const x = lerp(sx, tx, k), y = lerp(sy, ty, k) - Math.sin(k * Math.PI) * 50, w = lerp(p.w * sc + 16, 60, k), h = lerp(LH * sc, 60, k);
      return <div key={p.i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: lerp(10, 17, k), background: k > 0.5 ? '#F1EFF8' : 'rgba(100,104,216,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `blur(${Math.sin(k * Math.PI) * 4}px)`, overflow: 'hidden'}}>
        {k < 0.5 ? <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT * sc, color: PERI_D, opacity: 1 - k * 2, whiteSpace: 'nowrap'}}>{KEYWORDS[p.i]}</span> : <Img src={staticFile(`logos/ap/${NODES[p.i].app}.png`)} style={{width: 36, height: 36, objectFit: 'contain', opacity: (k - 0.5) * 2}} />}
      </div>; })}
    {/* cursor arrives, presses Send (0.92), leaves */}
    {f >= T.cursor && f < T.lift + 14 ? (() => { const k = ez(f, T.cursor, T.send - 4, Easing.inOut(Easing.cubic)), lv = ez(f, T.send + 4, T.lift + 14, Easing.in(Easing.cubic));
      return <Cursor x={lerp(1130, 938, k) + lv * 160} y={lerp(1040, 698, k) + lv * 240} rot={-12 + (1 - k) * 18} hover={ez(f, T.send - 10, T.send - 4)} press={press} s={1.7} />; })() : null}
    {/* ✓ Done */}
    {(() => { const k = settle(f, T.done); return f >= T.done ? <div style={{position: 'absolute', left: 540, top: 1230, transform: `translate(-50%, 0) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.6), padding: '20px 54px', borderRadius: 999, background: GREEN, color: '#fff', fontFamily: FONT.clash, fontWeight: 600, fontSize: 56, whiteSpace: 'nowrap', boxShadow: '0 24px 50px -22px rgba(47,182,124,0.8)'}}>{BUILDER.done}</div> : null; })()}
  </>;
};

// ================= captions: word by word, fixed band (y 1380–1560), chunks of ≤4 words =================
type Wd = {w: string; s: number; line: number};
// script words (exact spelling) timed by the Whisper word timings of the real VO; proportional fallback if counts differ
const WORDS: Wd[] = VO.flatMap((l, li) => { if (li === 3) return []; const toks = l.split(' ').reduce<string[]>((acc, t) => { if (t === '—' && acc.length) acc[acc.length - 1] += ' —'; else acc.push(t); return acc; }, []);
  const ws = VOL[li].words, at = VO_AT[li];
  if (ws.length === toks.length) return toks.map((t, j) => ({w: t, s: at + ws[j].s * FPS, line: li}));
  const a = ws.length ? ws[0].s : 0, b = ws.length ? ws[ws.length - 1].e : VOL[li].dur;
  const tot = toks.reduce((s2, t) => s2 + t.length + 2, 0); let c = 0; return toks.map((t) => { const s2 = at + (a + ((b - a) * c) / tot) * FPS; c += t.length + 2; return {w: t, s: s2, line: li}; }); });
const CHUNKS: Wd[][] = []; WORDS.forEach((w, i) => { const cur = CHUNKS[CHUNKS.length - 1]; const prev = WORDS[i - 1]; if (!cur || cur.length >= 4 || prev.line !== w.line || /[.,—]$/.test(prev.w)) CHUNKS.push([w]); else cur.push(w); });
const SKIP = new Set(["Let's", 'fix', 'that —']); // the big kinetic "let's fix that" is the caption for those words
const Captions: React.FC<{f: number; dark: boolean}> = ({f, dark}) => {
  let ci = -1; CHUNKS.forEach((c, i) => { if (f >= c[0].s) ci = i; }); if (ci < 0) return null;
  const c = CHUNKS[ci], next = CHUNKS[ci + 1], lineEnd = VO_AT[c[0].line] + VOL[c[0].line].dur * FPS + 8; if (f > lineEnd && !(next && f >= next[0].s)) return null;
  const vis = c.filter((w) => !(w.line === 2 && SKIP.has(w.w))); if (!vis.length) return null;
  const last = c.filter((w) => f >= w.s).pop();
  return <div style={{position: 'absolute', left: 60, right: 140, top: 1235, height: 175, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', columnGap: 20, rowGap: 0}}>
    {vis.map((w) => { const k = ez(f, w.s, w.s + 10); return <span key={w.w + w.s} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 66, lineHeight: 1.18, letterSpacing: '-0.015em', opacity: k, transform: `translateY(${(1 - k) * 16}px)`, filter: `blur(${(1 - k) * 12}px)`, color: w === last ? (dark ? PERI : PERI_D) : dark ? '#EDEBF5' : INK, textShadow: dark ? '0 2px 18px rgba(0,0,0,0.5)' : '0 2px 18px rgba(247,246,249,0.9)'}}>{w.w}</span>; })}
  </div>;
};

// ================= film =================
export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const endOn = f >= T.end, irisR = lerp(0, 1500, ez(f, T.iris, T.iris + 14, Easing.in(Easing.quad)));
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    {f < T.scatter + 14 ? <AbsoluteFill><Backdrop f={f} beats={BEATS} base={PAPER} /><World f={f} keys={CAM_A}><WorldA f={f} /></World></AbsoluteFill> : null}
    {f >= T.scatter - 4 && f < T.iris + 16 ? <Turn f={f} /> : null}
    {f >= T.iris && !endOn ? <AbsoluteFill style={{clipPath: f < T.iris + 14 ? `circle(${irisR}px at 46% 39%)` : undefined}}><Backdrop f={f} beats={BEATS} base={PAPER} /><World f={f} keys={CAM_B}><WorldB f={f} /></World></AbsoluteFill> : null}
    {!endOn ? <Particles f={f} /> : null}
    {endOn ? <AbsoluteFill>
      <Liquid f={f} a="rgba(100,104,216,0.45)" b="rgba(244,184,168,0.14)" c="rgba(139,143,232,0.22)" base={DARK} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 260, transform: `scale(${1.04 - 0.04 * ez(f, T.end, T.end + 40)})`}}>
        <Lockup f={f} at={T.lockup} size={250} th={{bg: DARK, ink: '#EDEBF5', lo: '#9A95B0', panel: '', panel2: '', line: '', edge: '', node: '', accent: PERI, streakA: '', streakB: '', dark: true}} sub={<div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 46, color: '#C9C5DA', letterSpacing: '0.01em'}}>{END.url}</div>} />
      </AbsoluteFill>
    </AbsoluteFill> : null}
    <Captions f={f} dark={(f >= T.scatter && f < T.iris + 6) || endOn} />
    {/* grain (anti-banding), deterministic seed */}
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}><filter id="p01n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2)} /></filter><rect width="100%" height="100%" filter="url(#p01n)" /></svg>
  </AbsoluteFill>;
};
