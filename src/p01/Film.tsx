// P01 "Stop copying leads by hand" — 30 fps, ~30 s. One film, two layouts:
// tall (1080x1920 design canvas; the 4:5 cut is a crop of it) and wide (native 1920x1080 for X: cards side by side, big text).
// Camera language: fansachat-camera-zoom (one camera per world, crash zoom on the beat, drift + wobble, particle hand-offs).
// Brand look reused from intro27/intro28 (paper stage, periwinkle/blush liquid, Clash/Sora/Inter, builder composer, Lockup).
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT, Glyph, Lockup} from '../intro27/ui';
import {Cursor, ez, glass, lerp, Liquid} from '../intro28/kit';
import {BUILDER, CHECK, END, KEYWORDS, NODES, PLAN, SENTENCE, TURN, VO} from './copy';
import {FPS, T, VO_AT, VOL} from './timeline';
import {Backdrop} from './backdrop';

const BEATS = [T.morph, ...T.cross, T.send, T.run, T.done];

const INK = '#221E30', LO = '#6A6580', PERI = '#8B8FE8', PERI_D = '#6468D8', PAPER = '#F7F6F9', DARK = '#100D16';
const RED = '#E5484D', GREEN = '#2FB67C';
const CHAT_BG = 'linear-gradient(100deg, rgba(232,233,251,0.92), rgba(253,236,231,0.92))';
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
const drift = (f: number) => 1 + 0.012 * Math.sin(f / 55);

// ---------- layouts: every position / size the scenes use ----------
type Lay = {
  W: number; H: number; wide: boolean; camA: K[]; camB: K[];
  card: {x: number; cy: number; w: number; h0: number; h1: number; pad: number; tile: number; title: number; sub: number; label: number; bar: number; gap: number; rowTop: number; rowPitch: number; rowFont: number; xIcon: number; rowTile: number};
  turn: {top: number; font: number; right: number};
  chat: {cx: number; cy: number; w: number; h: number; txt: number; lh: number; pad: number; liftY: number; liftSc: number; btn: number};
  win: {x: number; y: number; w: number; h: number; headY: number; padX: number; title: number; meta: number; run: number};
  talk: {x: number; thinkY: number; replyY: number; think: number; reply: number};
  plan: {x: number; w: number; top: number; h: number; rowY: number[]; rowH: number; font: number; tile: number; head: number; meta: number};
  nodes: {x: number[]; y: number[]; w: number; h: number; tile: number; name: number; action: number};
  done: {x: number; y: number; font: number};
  cap: {left: number; right: number; top: number; h: number; font: number};
  end: {pb: number; size: number; url: number};
};
const tall = (): Lay => ({
  W: 1080, H: 1920, wide: false,
  camA: [[0, 1.0, 580, 960], [90, 1.06, 578, 955], [T.crash, 1.07, 578, 975], [T.crash + 10, 2.15, 440, 1020, 'c'], [T.scatter + 14, 2.3, 445, 1015]],
  camB: [[T.iris - 6, 0.9, 583, 880], [T.typeAt, 0.9, 583, 880], [T.typeAt + 30, 0.9, 583, 870], [T.typeAt + 38, 0.92, 583, 860, 'c'], [T.typeAt + 60, 0.92, 583, 860], [T.typeAt + 68, 0.936, 583, 850, 'c'], [T.send, 0.936, 583, 850], [T.lift + 24, 1.04, 607, 861, 'r'], [T.pull, 1.05, 607, 861], [T.pull + 18, 0.92, 588, 935, 'r'], [T.run - 8, 0.94, 588, 945], [T.run + 6, 0.98, 588, 961, 'c'], [T.pushDone - 2, 0.99, 588, 961], [T.pushDone + 11, 1.6, 565, 1290, 'c'], [T.end, 1.66, 565, 1292]],
  card: {x: 130, cy: 760, w: 820, h0: 560, h1: 660, pad: 56, tile: 108, title: 52, sub: 32, label: 28, bar: 24, gap: 26, rowTop: 120, rowPitch: 210, rowFont: 64, xIcon: 84, rowTile: 78},
  turn: {top: 830, font: 128, right: 80},
  chat: {cx: 540, cy: 640, w: 940, h: 260, txt: 42, lh: 58, pad: 44, liftY: 330, liftSc: 0.8, btn: 84},
  win: {x: 40, y: 130, w: 1000, h: 1095, headY: 522, padX: 64, title: 34, meta: 32, run: 32},
  talk: {x: 164, thinkY: 458, replyY: 462, think: 34, reply: 32},
  plan: {x: 150, w: 780, top: 585, h: 340, rowY: [700, 785, 870], rowH: 72, font: 32, tile: 60, head: 36, meta: 28},
  nodes: {x: [150, 150, 150], y: [690, 910, 1130], w: 780, h: 160, tile: 96, name: 44, action: 32},
  done: {x: 540, y: 1230, font: 56},
  cap: {left: 60, right: 140, top: 1235, h: 175, font: 66},
  end: {pb: 260, size: 250, url: 46},
});
// wide: world coords = screen coords at zoom 1; every body text is >= 44 px ON SCREEN (font x camera zoom x local scale)
const wide = (): Lay => ({
  W: 1920, H: 1080, wide: true,
  camA: [[0, 1.0, 960, 470], [90, 1.06, 958, 466], [T.crash, 1.07, 958, 480], [T.crash + 10, 1.6, 900, 600, 'c'], [T.scatter + 14, 1.7, 905, 595]],
  camB: [[T.iris - 6, 0.95, 960, 470], [T.typeAt, 0.95, 960, 470], [T.typeAt + 30, 0.95, 960, 462], [T.typeAt + 38, 0.97, 960, 455, 'c'], [T.typeAt + 60, 0.97, 960, 455], [T.typeAt + 68, 0.985, 960, 448, 'c'], [T.send, 0.985, 960, 448], [T.lift + 24, 0.97, 960, 470, 'r'], [T.pull, 0.98, 960, 470], [T.pull + 18, 0.96, 960, 480, 'r'], [T.run - 8, 0.965, 960, 482], [T.run + 6, 0.975, 960, 490, 'c'], [T.pushDone - 2, 0.98, 960, 490], [T.pushDone + 11, 1.5, 960, 470, 'c'], [T.end, 1.55, 960, 470]],
  card: {x: 510, cy: 430, w: 900, h0: 650, h1: 660, pad: 56, tile: 120, title: 64, sub: 46, label: 44, bar: 28, gap: 22, rowTop: 120, rowPitch: 210, rowFont: 72, xIcon: 92, rowTile: 88},
  turn: {top: 450, font: 160, right: 0},
  chat: {cx: 960, cy: 400, w: 1240, h: 316, txt: 58, lh: 76, pad: 44, liftY: 200, liftSc: 0.84, btn: 96},
  win: {x: 20, y: 30, w: 1880, h: 830, headY: 425, padX: 64, title: 48, meta: 46, run: 46},
  talk: {x: 460, thinkY: 350, replyY: 352, think: 48, reply: 48},
  plan: {x: 410, w: 1100, top: 510, h: 300, rowY: [615, 685, 755], rowH: 62, font: 48, tile: 56, head: 48, meta: 46},
  nodes: {x: [40, 682, 1324], y: [675, 675, 675], w: 556, h: 330, tile: 96, name: 54, action: 46},
  done: {x: 960, y: 400, font: 56},
  cap: {left: 160, right: 160, top: 895, h: 140, font: 64},
  end: {pb: 60, size: 250, url: 46},
});
const LayCtx = createContext<Lay>(tall());
const useL = () => useContext(LayCtx);

const World: React.FC<{f: number; keys: K[]; children: React.ReactNode}> = ({f, keys, children}) => {
  const {W, H} = useL();
  const [z, x, y] = camAt(keys, f), [z0, x0, y0] = camAt(keys, f - 1);
  const rot = 0.6 * Math.sin(f / 70) - 0.2 * Math.sin(f / 23);
  const v = Math.abs(Math.log(z / z0)) * 900 + Math.hypot(x - x0, y - y0) * z * 0.05; // camera speed → directional-ish blur
  return <AbsoluteFill style={{filter: v > 0.6 ? `blur(${Math.min(9, v * 0.5)}px)` : undefined}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) rotate(${rot}deg) scale(${z * drift(f)}) translate(${-x}px, ${-y}px)`}}>{children}</div>
  </AbsoluteFill>;
};
const toScreen = (L: Lay, keys: K[], f: number, wx: number, wy: number): [number, number] => { const [z, x, y] = camAt(keys, f); const zz = z * drift(f); return [L.W / 2 + (wx - x) * zz, L.H / 2 + (wy - y) * zz]; };

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', borderRadius: 48, background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: 'inset 0 1.5px 0 #fff, 0 50px 90px -40px rgba(40,30,80,0.38)', boxSizing: 'border-box', ...extra});
const Tile: React.FC<{k: string; size: number; on?: boolean}> = ({k, size, on}) => <div style={{width: size, height: size, borderRadius: size * 0.28, background: on ? 'rgba(47,182,124,0.14)' : '#F1EFF8', border: '1px solid rgba(32,28,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><Img src={staticFile(`logos/ap/${k}.png`)} style={{width: size * 0.6, height: size * 0.6, objectFit: 'contain'}} /></div>;

// letter write-in: per glyph opacity / rise / blur, 1.5 f stagger
const Write: React.FC<{text: string; f: number; at: number; style: React.CSSProperties}> = ({text, f, at, style}) => <span style={{...style, whiteSpace: 'nowrap'}}>{text.split('').map((c, i) => { const k = ez(f, at + i * 1.5, at + i * 1.5 + 9); return <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 12}px)`, filter: `blur(${(1 - k) * 8}px)`, whiteSpace: 'pre'}}>{c === ' ' ? <span style={{display: 'inline-block', width: '0.32em'}} /> : c}</span>; })}</span>;

// ================= world A: hook (Typeform card, on screen from frame 0) → problem (same card becomes the checklist) =================
const WorldA: React.FC<{f: number}> = ({f}) => {
  const {card: C} = useL();
  const pop = settle(f, 0, 9), mk = ez(f, T.morph, T.morph + 18, SMOOTH);
  const h = lerp(C.h0, C.h1, mk), formK = 1 - ez(f, T.morph, T.morph + 10);
  return <>
    <div style={{position: 'absolute', left: C.x, top: C.cy - h / 2, width: C.w, height: h, transform: `scale(${lerp(0.94, 1, pop)})`, transformOrigin: '50% 50%'}}>
      <div style={card({inset: 0})} />
      {/* hook content: Typeform "new response" card; labels are there at frame 0, the answers fill across the hook line */}
      {formK > 0 ? <div style={{position: 'absolute', inset: 0, padding: C.pad, opacity: formK, filter: `blur(${(1 - formK) * 10}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <Tile k="typeform" size={C.tile} />
          <div><div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: C.title, color: INK, lineHeight: 1.1}}>Typeform</div><div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: C.sub, color: LO, marginTop: 6}}>New response</div></div>
          <div style={{marginLeft: 'auto', width: 22, height: 22, borderRadius: 99, background: PERI_D, boxShadow: `0 0 0 ${8 + 6 * Math.abs(Math.sin(f / 9))}px rgba(100,104,216,0.18)`}} />
        </div>
        <div style={{height: 1, background: 'rgba(32,28,46,0.10)', margin: '40px 0 30px'}} />
        {['Name', 'Email', 'Company'].map((l, i) => { const fa = 10 + i * Math.max(5, (T.morph - 40) / 3), k = ez(f, fa, fa + 14); return <div key={l} style={{marginBottom: C.gap}}>
          <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: C.label, color: LO}}>{l}</div>
          <div style={{height: C.bar, width: `${[62, 84, 48][i]}%`, borderRadius: C.bar / 2, background: 'rgba(231,228,240,0.45)', marginTop: 10, overflow: 'hidden'}}><div style={{height: '100%', width: `${k * 100}%`, borderRadius: C.bar / 2, background: '#E7E4F0'}} /></div>
        </div>; })}
      </div> : null}
      {/* problem content: Notes-style checklist, red crosses draw on */}
      {mk > 0 ? CHECK.map((r, i) => { const y = C.rowTop + i * C.rowPitch - (C.h1 - h) / 2, cx = T.cross[i], dk = ez(f, cx, cx + 6, Easing.out(Easing.cubic)), dk2 = ez(f, cx + 3, cx + 9, Easing.out(Easing.cubic)); const rowK = ez(f, T.rows[i] - 4, T.rows[i] + 6);
        return <div key={r.text} style={{position: 'absolute', left: C.pad, right: C.pad, top: y - 50, height: 100, display: 'flex', alignItems: 'center', gap: 34, opacity: rowK}}>
          <svg width={C.xIcon} height={C.xIcon} viewBox="0 0 84 84" style={{flex: 'none'}}>
            <circle cx={42} cy={42} r={36} fill="none" stroke={f >= cx ? RED : 'rgba(32,28,46,0.25)'} strokeWidth={4} />
            <path d="M28 28 L56 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dk} fill="none" />
            <path d="M56 28 L28 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - dk2} fill="none" />
          </svg>
          <Write text={r.text} f={f} at={T.rows[i]} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: C.rowFont, color: f >= cx + 6 ? 'rgba(34,30,48,0.55)' : INK, letterSpacing: '-0.02em'}} />
          <div style={{marginLeft: 'auto', opacity: ez(f, T.rows[i] + 8, T.rows[i] + 20)}}><Tile k={r.app} size={C.rowTile} /></div>
        </div>; }) : null}
    </div>
  </>;
};

// ================= turn: dark plate, list scatters into particles → "let's fix that" → the plate shrinks into the chat box =================
const N = 150;
// the dark plate: full frame until T.converge, then one settle shrinks it onto the chat box's on-screen rect (flood → object)
const plateAt = (L: Lay, f: number) => {
  const s = f < T.converge ? 0 : settle(f, T.converge, 9);
  const [l, t] = toScreen(L, L.camB, f, L.chat.cx - L.chat.w / 2, L.chat.cy - L.chat.h / 2), zz = camAt(L.camB, f)[0] * drift(f);
  return {s, l: lerp(0, l, s), t: lerp(0, t, s), r: lerp(L.W, l + L.chat.w * zz, s), b: lerp(L.H, t + L.chat.h * zz, s), rad: lerp(0, 44 * zz, s)};
};
const Turn: React.FC<{f: number}> = ({f}) => {
  const L = useL();
  const rIn = lerp(0, 1300 * Math.max(L.W, L.H) / 1920, ez(f, T.scatter - 4, T.scatter + 8));
  const words = TURN.map((w, i) => ({w, k: ez(f, T.turnText + i * 3, T.turnText + i * 3 + 10)}));
  const out = ez(f, T.converge - 2, T.converge + 10);
  const g = f >= T.glitch && f < T.glitch + 10; const j = (s: number) => (hash(f, s) - 0.5) * 18;
  const p = plateAt(L, f), clip = f < T.converge ? `circle(${rIn}px at 50% 50%)` : `inset(${p.t}px ${L.W - p.r}px ${L.H - p.b}px ${p.l}px round ${p.rad}px)`;
  return <>
    <AbsoluteFill style={{clipPath: clip, opacity: 1 - ez(f, T.iris, T.iris + 10)}}>
      <Liquid f={f} a="rgba(100,104,216,0.55)" b="rgba(244,184,168,0.18)" c="rgba(139,143,232,0.30)" base={DARK} />
      <div style={{position: 'absolute', left: 0, right: L.turn.right, top: L.turn.top, display: 'flex', justifyContent: 'center', gap: 30, opacity: 1 - out, filter: out > 0 ? `blur(${out * 18}px)` : undefined, transform: `scale(${1 + out * 0.15})`}}>
        {words.map(({w, k}) => <div key={w} style={{position: 'relative', opacity: k, transform: `translateY(${(1 - k) * 24}px)`, filter: `blur(${(1 - k) * 12}px)`, fontFamily: FONT.clash, fontWeight: 600, fontSize: L.turn.font, letterSpacing: '-0.03em', color: w === 'fix' ? PERI : '#EDEBF5', lineHeight: 1}}>
          {w === 'fix' && g ? <>
            <span style={{position: 'absolute', left: j(1), top: j(2) * 0.3, color: 'rgba(255,60,90,0.85)', mixBlendMode: 'screen'}}>{w}</span>
            <span style={{position: 'absolute', left: -j(3), top: -j(4) * 0.3, color: 'rgba(60,220,255,0.85)', mixBlendMode: 'screen'}}>{w}</span>
          </> : null}
          <span style={{position: 'relative', clipPath: g ? `inset(${hash(f, 5) * 40}% 0 ${hash(f, 6) * 30}% 0)` : undefined}}>{w}</span>
          {w === 'fix' && g ? <span style={{position: 'absolute', left: j(7) * 1.5, top: 0, clipPath: `inset(${50 + hash(f, 8) * 20}% 0 0 0)`}}>{w}</span> : null}
        </div>)}
      </div>
      {/* on landing, the plate's colour turns into the chat box glass; then it hands over to the real chat box underneath */}
      <AbsoluteFill style={{background: 'linear-gradient(100deg, #E8E9FB, #FDECE7)', opacity: ez(f, T.iris - 9, T.iris - 1, Easing.inOut(Easing.quad))}} />
    </AbsoluteFill>
  </>;
};
// the checklist bursts into particles that drift out and fade (no convergence: the plate itself carries the hand-off)
const Particles: React.FC<{f: number}> = ({f}) => {
  const L = useL();
  if (f < T.scatter || f > T.converge + 10) return null;
  const burst = ez(f, T.scatter, T.scatter + 26), fade = 1 - ez(f, T.converge - 8, T.converge + 10);
  const C = L.card;
  return <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: N}, (_, i) => {
      const row = i % 3, wx = C.x + 170 + hash(i, 1) * 420, wy = C.cy - C.h1 / 2 + C.rowTop + row * C.rowPitch + (hash(i, 2) - 0.5) * 50; // checklist glyph area (world A)
      const [sx, sy] = toScreen(L, L.camA, T.scatter, wx, wy);
      const a = hash(i, 3) * Math.PI * 2, d = 160 + hash(i, 4) * 520 + 140 * Math.max(0, (f - T.scatter - 26) / 30);
      const x = sx + Math.cos(a) * d * burst, y = sy + Math.sin(a) * d * burst * 0.8;
      return <circle key={i} cx={x} cy={y} r={3 + hash(i, 6) * 4} fill={hash(i, 7) > 0.35 ? '#EDEBF5' : PERI} opacity={lerp(1, 0.45, burst) * fade} />;
    })}
  </svg>;
};

// ================= world B: chat box → sentence types → words become 3 nodes → zoom-out → run =================
let measureCtx: CanvasRenderingContext2D | null = null;
const textW = (t: string, px: number) => { if (typeof document === 'undefined') return t.length * px * 0.52; measureCtx = measureCtx ?? document.createElement('canvas').getContext('2d'); measureCtx!.font = `500 ${px}px ${FONT.ui}`; return measureCtx!.measureText(t).width; };
const NodeAction: React.FC<{text: string; wrap?: boolean}> = ({text, wrap}) => text.includes('{name}') ? <>{text.split('{name}')[0].split('“')[0]}<span style={{whiteSpace: wrap ? 'normal' : 'nowrap'}}>“{text.split('{name}')[0].split('“')[1]}<span style={{fontWeight: 600, color: PERI_D, background: 'rgba(100,104,216,0.14)', borderRadius: 8, padding: '0 8px'}}>{'{name}'}</span>{text.split('{name}')[1]}</span></> : <>{text}</>;
const WorldB: React.FC<{f: number}> = ({f}) => {
  const L = useL(), CH = L.chat, PL = L.plan, ND = L.nodes;
  const TXT = CH.txt, LH = CH.lh, PADX = CH.pad, PADY = CH.pad;
  const full = SENTENCE.join(' '); const typed = Math.max(0, Math.floor((f - T.typeAt) * T.cps));
  const lift = ez(f, T.lift, T.lift + 22, CRASH); const press = Math.max(0, 1 - Math.abs(f - T.send) / 5);
  const cx = CH.cx, cy = lerp(CH.cy, CH.liftY, lift), sc = lerp(1, CH.liftSc, lift);
  const winK = ez(f, T.pull - 8, T.pull + 16);
  // line layout (local to the chat card, origin = its top-left)
  let used = 0; const lines = SENTENCE.map((l) => { const start = used; used += l.length + 1; return {l, start}; });
  const kwPos = KEYWORDS.map((kw, i) => { const li = lines.findIndex((x) => x.l.includes(kw)); const off = textW(lines[li].l.slice(0, lines[li].l.indexOf(kw)), TXT); const wdt = textW(kw, TXT);
    return {i, li, at: lines[li].start + lines[li].l.indexOf(kw), x: PADX + off, y: PADY + li * LH, w: wdt}; });
  const local = (x: number, y: number): [number, number] => [cx + (x - CH.w / 2) * sc, cy + (y - CH.h / 2) * sc];
  const runPress = Math.max(0, 1 - Math.abs(f - T.run) / 5), ran = f >= T.run;
  const btnX = CH.cx + CH.w / 2 - 24 - CH.btn / 2, btnY = CH.cy + CH.h / 2 - 24 - CH.btn / 2; // send button centre (unlifted)
  return <>
    {/* builder window chrome, revealed by the pull-back */}
    <div style={{position: 'absolute', left: L.win.x, top: L.win.y, width: L.win.w, height: L.win.h, opacity: winK, transform: `scale(${lerp(1.04, 1, winK)})`}}>
      <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 56}} />
      <div style={{position: 'absolute', left: L.win.padX, right: 56, top: L.win.headY - L.win.y, height: 64, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: L.win.title, color: INK, whiteSpace: 'nowrap'}}>{BUILDER.title}</div>
        <div style={{fontFamily: FONT.ui, fontSize: L.win.meta, color: LO, whiteSpace: 'nowrap'}}>{BUILDER.planMeta}</div>
        <div style={{marginLeft: 'auto', padding: '12px 24px', borderRadius: 999, background: ran ? PERI_D : '#fff', color: ran ? '#fff' : INK, border: '1px solid rgba(32,28,46,0.10)', fontFamily: FONT.ui, fontWeight: 600, fontSize: L.win.run, whiteSpace: 'nowrap', transform: `scale(${1 - 0.08 * runPress})`}}>▷ {BUILDER.run}</div>
      </div>
    </div>
    {/* chat box (the builder composer) */}
    <div style={{position: 'absolute', left: cx - CH.w / 2, top: cy - CH.h / 2, width: CH.w, height: CH.h, transform: `scale(${sc})`, transformOrigin: '50% 50%'}}>
      {(() => { const mv = Math.abs(lift - ez(f - 1, T.lift, T.lift + 22, CRASH)) * 40; return <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 44, background: CHAT_BG, border: '1.5px solid rgba(255,255,255,0.98)', boxShadow: `inset 0 2px 0 #fff, inset 0 -12px 26px rgba(139,143,232,0.14), ${mv > 0.2 ? `${-Math.min(2, mv)}px 0 0 rgba(255,70,110,0.45), ${Math.min(2, mv)}px 0 0 rgba(60,200,255,0.45), ` : ''}0 50px 90px -40px rgba(40,30,80,0.38)`}} />; })()}
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
      <div style={{position: 'absolute', right: 24, bottom: 24, width: CH.btn, height: CH.btn, borderRadius: 999, background: typed > 0 ? PERI_D : 'transparent', border: `2px solid ${typed > 0 ? PERI_D : '#2B2734'}`, color: typed > 0 ? '#fff' : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui, fontWeight: 700, fontSize: CH.btn * 0.48, transform: `scale(${1 - 0.08 * press})`}}>↑</div>
    </div>
    {/* agent flow under the lifted message: "Thinking…" shimmer → reply */}
    {f >= T.think && f < T.reply + 6 ? (() => { const k = ez(f, T.think, T.think + 8) * (1 - ez(f, T.reply - 4, T.reply + 4)); const sh = ((f - T.think) * 14) % 700;
      return <div style={{position: 'absolute', left: L.talk.x, top: L.talk.thinkY, opacity: k, display: 'flex', gap: 14, alignItems: 'baseline'}}>
        <span style={{width: 22, height: 22, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${PERI} 45%, ${PERI_D})`, flex: 'none', alignSelf: 'center'}} />
        <span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: L.talk.think, backgroundImage: `linear-gradient(90deg, ${LO} 0px, ${LO} ${sh - 120}px, ${PERI} ${sh}px, ${LO} ${sh + 120}px, ${LO} 900px)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{BUILDER.thinking}</span>
      </div>; })() : null}
    <div style={{position: 'absolute', left: L.talk.x, top: L.talk.replyY, opacity: ez(f, T.reply, T.reply + 12), transform: `translateY(${(1 - ez(f, T.reply, T.reply + 12)) * 14}px)`, display: 'flex', gap: 14, alignItems: 'baseline'}}>
      <span style={{width: 22, height: 22, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${PERI} 45%, ${PERI_D})`, flex: 'none', alignSelf: 'center'}} />
      <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: L.talk.reply, color: LO, whiteSpace: 'nowrap'}}>{BUILDER.reply}</span>
    </div>
    {/* plan card with a checklist; each row then morphs into its node */}
    {f >= T.plan && f < T.morphPlan + 14 ? (() => { const k = settle(f, T.plan), out = ez(f, T.morphPlan, T.morphPlan + 10);
      return <div style={{position: 'absolute', left: PL.x, top: PL.top, width: PL.w, height: PL.h, opacity: Math.min(1, k * 1.5) * (1 - out), transform: `translateY(${(1 - k) * 40}px) scale(${0.96 + 0.04 * k})`}}>
        <div style={card({inset: 0, borderRadius: 40})} />
        <div style={{position: 'absolute', left: 36, top: 26, display: 'flex', gap: 16, alignItems: 'baseline'}}><span style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: PL.head, color: INK}}>{BUILDER.plan}</span><span style={{fontFamily: FONT.ui, fontSize: PL.meta, color: LO}}>{BUILDER.planMeta}</span></div>
      </div>; })() : null}
    {/* connectors OUTSIDE the cards: tall = arcs off the right edges, wide = arcs across the gaps between the side-by-side cards */}
    <svg width={L.W} height={L.H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {[0, 1].map((i) => { const k = ez(f, T.edges + i * 6, T.edges + i * 6 + 14); const on = f >= T.lit[i + 1];
        let d: string, ex: number, ey: number;
        if (L.wide) { const a = ND.x[i] + ND.w, b = ND.x[i + 1], y = ND.y[i] - 40; d = `M${a} ${y} C ${a + 34} ${y - 60}, ${b - 34} ${y - 60}, ${b} ${y}`; ex = b; ey = y; }
        else { const x = ND.x[i] + ND.w, y1 = ND.y[i] + 28, y2 = ND.y[i + 1] - 28; d = `M${x} ${y1} C ${x + 58} ${y1}, ${x + 58} ${y2}, ${x} ${y2}`; ex = x; ey = y2; }
        return k <= 0 ? null : <g key={i}><path d={d} fill="none" stroke={on ? GREEN : '#2B2734'} strokeWidth={4} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" />
          <circle cx={ex} cy={ey} r={8} fill={on ? GREEN : '#2B2734'} opacity={k >= 0.98 ? 1 : 0} /></g>; })}
    </svg>
    {/* plan rows → nodes (shared element: the row's rect grows into the node card) */}
    {NODES.map((n, i) => { if (f < T.plan + 6 + i * 5) return null;
      const rk = ez(f, T.plan + 6 + i * 5, T.plan + 18 + i * 5), mk = ez(f, T.morphPlan + i * 3, T.morphPlan + 18 + i * 3, SMOOTH), lit = f >= T.lit[i], sweep = ez(f, T.lit[i], T.lit[i] + 8);
      const ry = PL.rowY[i], x = lerp(PL.x + 24, ND.x[i], mk), y = lerp(ry - PL.rowH / 2, ND.y[i] - ND.h / 2, mk), w = lerp(PL.w - 48, ND.w, mk), h = lerp(PL.rowH, ND.h, mk);
      const tick = f >= T.plan + 14 + i * 6, rowOp = 1 - ez(f, T.morphPlan + i * 3, T.morphPlan + 8 + i * 3), nodeOp = ez(f, T.morphPlan + 8 + i * 3, T.morphPlan + 18 + i * 3);
      const badge = <div style={{position: 'absolute', right: 26, top: 22, width: 46, height: 46, borderRadius: 99, background: lit ? GREEN : PERI_D, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{lit ? '✓' : i + 1}</div>;
      return <div key={n.app} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: rk, transform: `translateY(${(1 - rk) * 16}px)`}}>
        <div style={card({inset: 0, borderRadius: lerp(20, 40, mk), background: `rgba(255,255,255,${lerp(0, 0.88, mk)})`, boxShadow: mk > 0 ? `inset 0 1.5px 0 #fff, 0 50px 90px -40px rgba(40,30,80,${0.38 * mk})` : 'none', border: `2px solid ${lit ? GREEN : `rgba(255,255,255,${mk * 0.95})`}`})} />
        {rowOp > 0 ? <div style={{position: 'absolute', inset: 0, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 20, opacity: rowOp}}>
          <Tile k={n.app} size={PL.tile} />
          <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: PL.font, color: INK, whiteSpace: 'nowrap'}}>{PLAN[i]}</span>
          <div style={{marginLeft: 'auto', width: 44, height: 44, borderRadius: 99, border: `3px solid ${tick ? PERI_D : 'rgba(32,28,46,0.25)'}`, background: tick ? PERI_D : 'transparent', color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tick ? '✓' : ''}</div>
        </div> : null}
        {nodeOp > 0 ? <>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`, borderRadius: 40, background: 'rgba(47,182,124,0.10)'}} />
          {L.wide ? <div style={{position: 'absolute', inset: 0, padding: '30px 34px', opacity: nodeOp}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <Tile k={n.app} size={ND.tile} on={lit} />
              <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: ND.name, color: INK, lineHeight: 1.1}}>{n.name}</div>
            </div>
            <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: ND.action, lineHeight: 1.22, color: LO, marginTop: 18}}><NodeAction text={n.action} wrap /></div>
            {badge}
          </div> : <div style={{position: 'absolute', inset: 0, padding: '0 80px 0 34px', display: 'flex', alignItems: 'center', gap: 26, opacity: nodeOp}}>
            <Tile k={n.app} size={ND.tile} on={lit} />
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: ND.name, color: INK, lineHeight: 1.15}}>{n.name}</div>
              <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: ND.action, lineHeight: 1.25, color: LO, marginTop: 4}}><NodeAction text={n.action} /></div>
            </div>
            {badge}
          </div>}
        </> : null}
      </div>; })}
    {/* ★ signature: the typed keywords fly out of the sentence and land as the plan-row icons */}
    {kwPos.map((p) => { const at = T.plan - 2 + p.i * 5, k = ez(f, at, at + 14, Easing.inOut(Easing.cubic)); if (f < at || k >= 1) return null;
      const [sx, sy] = local(p.x + p.w / 2, p.y + LH / 2), tx = PL.x + 24 + 12 + PL.tile / 2, ty = PL.rowY[p.i];
      const x = lerp(sx, tx, k), y = lerp(sy, ty, k) - Math.sin(k * Math.PI) * 50, w = lerp(p.w * sc + 16, PL.tile, k), h = lerp(LH * sc, PL.tile, k);
      return <div key={p.i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: lerp(10, PL.tile * 0.28, k), background: k > 0.5 ? '#F1EFF8' : 'rgba(100,104,216,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `blur(${Math.sin(k * Math.PI) * 4}px)`, overflow: 'hidden'}}>
        {k < 0.5 ? <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT * sc, color: PERI_D, opacity: 1 - k * 2, whiteSpace: 'nowrap'}}>{KEYWORDS[p.i]}</span> : <Img src={staticFile(`logos/ap/${NODES[p.i].app}.png`)} style={{width: PL.tile * 0.6, height: PL.tile * 0.6, objectFit: 'contain', opacity: (k - 0.5) * 2}} />}
      </div>; })}
    {/* cursor arrives, presses Send (0.92), leaves */}
    {f >= T.cursor && f < T.lift + 14 ? (() => { const k = ez(f, T.cursor, T.send - 4, Easing.inOut(Easing.cubic)), lv = ez(f, T.send + 4, T.lift + 14, Easing.in(Easing.cubic));
      return <Cursor x={lerp(btnX + 186, btnX - 6, k) + lv * 160} y={lerp(btnY + 336, btnY - 6, k) + lv * 240} rot={-12 + (1 - k) * 18} hover={ez(f, T.send - 10, T.send - 4)} press={press} s={1.7} />; })() : null}
    {/* ✓ Done */}
    {(() => { const k = settle(f, T.done); return f >= T.done ? <div style={{position: 'absolute', left: L.done.x, top: L.done.y, transform: `translate(-50%, 0) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.6), padding: '20px 54px', borderRadius: 999, background: GREEN, color: '#fff', fontFamily: FONT.clash, fontWeight: 600, fontSize: L.done.font, whiteSpace: 'nowrap', boxShadow: '0 24px 50px -22px rgba(47,182,124,0.8)'}}>{BUILDER.done}</div> : null; })()}
  </>;
};

// ================= captions: word by word, fixed band, chunks of ≤4 words =================
type Wd = {w: string; s: number; line: number};
// script words (exact spelling) timed by the Whisper word timings of the real VO; proportional fallback if counts differ
const WORDS: Wd[] = VO.flatMap((l, li) => { if (li === 3) return []; const toks = l.split(' ').reduce<string[]>((acc, t) => { if (t === '—' && acc.length) acc[acc.length - 1] += ' —'; else acc.push(t); return acc; }, []);
  const ws = VOL[li].words, at = VO_AT[li];
  if (ws.length === toks.length) return toks.map((t, j) => ({w: t, s: at + ws[j].s * FPS, line: li}));
  const a = ws.length ? ws[0].s : 0, b = ws.length ? ws[ws.length - 1].e : VOL[li].dur;
  const tot = toks.reduce((s2, t) => s2 + t.length + 2, 0); let c = 0; return toks.map((t) => { const s2 = at + (a + ((b - a) * c) / tot) * FPS; c += t.length + 2; return {w: t, s: s2, line: li}; }); });
const CHUNKS: Wd[][] = []; WORDS.forEach((w, i) => { const cur = CHUNKS[CHUNKS.length - 1]; const prev = WORDS[i - 1]; if (!cur || cur.length >= 4 || prev.line !== w.line || /[.,—]$/.test(prev.w)) CHUNKS.push([w]); else cur.push(w); });
const SKIP = new Set(["Let's", 'fix', 'that —']); // the big kinetic "let's fix that" is the caption for those words
// stress words keep the keyword colour once spoken (the hook's "owners" is coloured from frame 0)
const STRESS = new Set(['owners —', 'hand.', 'HubSpot.', 'anyway.', 'sentence.', 'automatically.']);
const Captions: React.FC<{f: number; dark: boolean}> = ({f, dark}) => {
  const {cap} = useL();
  // the first chunk (the hook line) is on screen from frame 0 (words rise in over the first frames); the highlight still follows the voice
  let ci = 0; CHUNKS.forEach((c, i) => { if (f >= c[0].s) ci = i; });
  const c = CHUNKS[ci], next = CHUNKS[ci + 1], lineEnd = VO_AT[c[0].line] + VOL[c[0].line].dur * FPS + 8; if (f > lineEnd && !(next && f >= next[0].s)) return null;
  const vis = c.filter((w) => !(w.line === 2 && SKIP.has(w.w))); if (!vis.length) return null;
  const last = c.filter((w) => f >= w.s).pop();
  return <div style={{position: 'absolute', left: cap.left, right: cap.right, top: cap.top, height: cap.h, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', columnGap: 20, rowGap: 0}}>
    {vis.map((w, j) => { const k = ci === 0 ? ez(f, j * 3 - 9, j * 3 + 1) : ez(f, w.s, w.s + 10); const hot = w === last || (STRESS.has(w.w) && (ci === 0 || f >= w.s)); return <span key={w.w + w.s} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: cap.font, lineHeight: 1.18, letterSpacing: '-0.015em', opacity: k, transform: `translateY(${(1 - k) * 16}px)`, filter: `blur(${(1 - k) * 12}px)`, color: hot ? (dark ? PERI : PERI_D) : dark ? '#EDEBF5' : INK, textShadow: dark ? '0 2px 18px rgba(0,0,0,0.5)' : '0 2px 18px rgba(247,246,249,0.9)'}}>{w.w}</span>; })}
  </div>;
};

// ================= film =================
const Scenes: React.FC = () => {
  const f = useCurrentFrame(); const L = useL();
  const endOn = f >= T.end;
  const p = plateAt(L, f), capMid = L.cap.top + L.cap.h / 2;
  const dark = (f >= T.scatter && f < T.iris - 6 && p.b > capMid) || endOn; // caption ink follows what is behind the band
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    {f < T.scatter + 14 ? <AbsoluteFill><Backdrop f={f} beats={BEATS} base={PAPER} W={L.W} H={L.H} /><World f={f} keys={L.camA}><WorldA f={f} /></World></AbsoluteFill> : null}
    {f >= T.converge && !endOn ? <AbsoluteFill><Backdrop f={f} beats={BEATS} base={PAPER} W={L.W} H={L.H} /><World f={f} keys={L.camB}><WorldB f={f} /></World></AbsoluteFill> : null}
    {f >= T.scatter - 4 && f < T.iris + 14 ? <Turn f={f} /> : null}
    {!endOn ? <Particles f={f} /> : null}
    {endOn ? <AbsoluteFill>
      <Liquid f={f} a="rgba(100,104,216,0.45)" b="rgba(244,184,168,0.14)" c="rgba(139,143,232,0.22)" base={DARK} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: L.end.pb, transform: `scale(${1.04 - 0.04 * ez(f, T.end, T.end + 40)})`}}>
        <Lockup f={f} at={T.lockup} size={L.end.size} th={{bg: DARK, ink: '#EDEBF5', lo: '#9A95B0', panel: '', panel2: '', line: '', edge: '', node: '', accent: PERI, streakA: '', streakB: '', dark: true}} sub={<div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: L.end.url, color: '#C9C5DA', letterSpacing: '0.01em'}}>{END.url}</div>} />
      </AbsoluteFill>
    </AbsoluteFill> : null}
    <Captions f={f} dark={dark} />
    {/* grain (anti-banding), deterministic seed */}
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}><filter id="p01n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2)} /></filter><rect width="100%" height="100%" filter="url(#p01n)" /></svg>
  </AbsoluteFill>;
};
export const Film: React.FC<{wide?: boolean}> = ({wide: isWide}) => <LayCtx.Provider value={isWide ? wide() : tall()}><Scenes /></LayCtx.Provider>;
