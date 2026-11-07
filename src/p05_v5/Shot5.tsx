// P05 FULL v5 (5:4 1350x1080, 15 s), built from test shot 4b (Shot4b.tsx, untouched) with the founder's 7 notes applied:
// hook (Inter, word pop) -> Chrome window slides in -> ZOOM 1 INTO the real composer: liquid glass applied IN PLACE (lifted
// 3 px, ice-blue neon), the prompt typed, the composer grows upward like the real textarea -> send: zoom releases to the
// wide, the glass flies into the real sent bubble -> wide hold: picker card transforms into "Reading your request" ->
// the real reply card ("Review the steps on the right / What goes where") slides in -> ZOOM 2 onto the reply, ONE pan
// across form -> Notion -> Slack while the nodes connect, zoom OUT -> simple dissolve into the real Notion page ->
// ZOOM 3 on the body lines -> Slack slides in, the real message arrives -> ZOOM 4 on it -> logo + "Join the waitlist".
// App content = real captures only (public/real4). Draft = greyscale + grid + zoom/cue labels.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {siNotion, siSlack} from 'simple-icons';
import {B, BED, CHROME_H, COMP, GRID, H, HOOK, HOOK_LINES, IMG, LINES, LINE_START, NOTION_BODY, NOTION_LINES, NOTION_PLATE, Rect, S0, SCALE_USED, SFX, SLACK_LINE, T, TOTAL, W, WAYS, WIN, WDUR, WORD0, WSTEP, ZOOMS, charsAt, colX, lineStartF} from './plan5';

const INTER = inter('normal', {weights: ['500', '600', '700', '800'], subsets: ['latin']}).fontFamily;
const DISPLAY: React.CSSProperties = {fontFamily: INTER, fontOpticalSizing: 'auto', fontFeatureSettings: '"ss01", "cv11"'} as React.CSSProperties;

const settle = Easing.bezier(0.16, 1, 0.3, 1);
const inCut = Easing.bezier(0.8, 0, 1, 1);
const peak = Easing.bezier(0.8, 0, 0.2, 1);
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const glide = Easing.bezier(0.45, 0, 0.55, 1);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const k = (f: number, a: number, b: number, e: (t: number) => number = settle) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpR = (a: Rect, b: Rect, p: number): Rect => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p)});
const TRIM = {textBox: 'trim-both cap alphabetic'} as unknown as React.CSSProperties;

const INK = '#0F1622', DIM = '#B6C0CC';
// related-colour neon: ice / brand blue family only
const NEON_A = '#BFE9FF', NEON_B = '#6CC4FF', NEON_C = '#3D8BFF';

type Cam = {cx: number; cy: number; s: number};
const mix = (a: Cam, b: Cam, p: number): Cam => ({cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), p))});
const sc = (c: Cam, m: number): Cam => ({...c, s: c.s * m});

const BWS = WIN.builder.w / IMG.ready.w;
const bx = (x: number) => WIN.builder.x + x * BWS, by = (y: number) => WIN.builder.y + CHROME_H + y * BWS;
const bRect = (r: {x: number; y: number; w: number; h: number}): Rect => ({x: bx(r.x), y: by(r.y), w: r.w * BWS, h: r.h * BWS});
const NWS = WIN.notion.w / IMG.notion.w, SWS = WIN.slack.w / IMG.slackFrame.w;

// ---------- composer geometry (stage px). At the zoom the box text starts on column 3 and baselines sit on the 8 px grid ----------
const PILL = bRect(B.pill);
const H1 = PILL.h * S0;                                  // 1-line composer height on screen at the zoom = the real pill
const PAD_B = (H1 - COMP.cap * COMP.size) / 2;           // text vertically centred in the 1-line pill
const BOT = Math.round((540 + 120 - PAD_B) / 8) * 8 + PAD_B; // screen y of the composer bottom at the zoom (last baseline on grid)
const CAM_COMP: Cam = {cx: PILL.x + (675 - (colX(2) - COMP.padL)) / S0, cy: PILL.y + PILL.h - (BOT - 540) / S0, s: S0};
const LIFT = 3;                                          // stage px the glass composer lifts off the panel
const linesAt = (f: number) => 1 + k(f, lineStartF(1) - 1, lineStartF(1) + 5, smooth) + k(f, lineStartF(2) - 1, lineStartF(2) + 5, smooth);
const compStage = (f: number): Rect => {
  const lift = LIFT * k(f, T.lift0, T.lift1);
  const h = PILL.h + (linesAt(f) - 1) * COMP.lead / S0;
  return {x: PILL.x, y: PILL.y + PILL.h - h - lift, w: PILL.w, h};
};

// ---------- cameras ----------
const REPLY = bRect(B.reply);
const nodeX = B.nodes.map((n) => bx(n.cx)), nodeY = by(B.nodeCy);
const C = {
  full: {cx: 693, cy: 548, s: 1.0},
  comp: CAM_COMP,
  // reply and flow share one height band at 1.8x so the single pan is (almost) horizontal and short: the reply card sits
  // left with the canvas beside it, then the camera slides right over form -> Notion -> Slack
  reply: {cx: REPLY.x + 355, cy: (REPLY.y + nodeY) / 2 + 20, s: 1.8},
  flow: {cx: nodeX[1] - 30, cy: nodeY - 30, s: 1.8},
  nFit: {cx: 693, cy: 548, s: 1.0},
  nKey: {cx: WIN.notion.x + NOTION_BODY.cx * NWS, cy: WIN.notion.y + CHROME_H + NOTION_BODY.cy * NWS - 20, s: 1.85},
  sFit: {cx: 693, cy: 548, s: 1.0},
  sKey: {cx: WIN.slack.x + SLACK_LINE.cx * SWS + 40, cy: WIN.slack.y + CHROME_H + (IMG.slackMsg.slotY + SLACK_LINE.cy) * SWS - 24, s: 2.0},
};
type Key = {f: number; c: Cam; e: (t: number) => number};
const KEYS: Key[] = [
  {f: T.win1, c: C.full, e: settle},
  {f: T.z1, c: sc(C.full, 1.01), e: glide},                       // calm wide hold
  {f: T.z1in, c: C.comp, e: smooth},                              // ZOOM 1 in
  {f: T.press, c: sc(C.comp, 1.02), e: glide},                    // slow drift while typing
  {f: T.rel1b, c: C.full, e: smooth},                             // release to the wide
  {f: T.z2, c: sc(C.full, 1.012), e: glide},                      // wide hold (picker -> reading -> reply slides in)
  {f: T.z2in, c: C.reply, e: smooth},                             // ZOOM 2 onto the reply
  {f: T.pan0, c: sc(C.reply, 1.015), e: glide},                   // read hold
  {f: T.pan1, c: C.flow, e: smooth},                              // ONE pan across form -> Notion -> Slack
  {f: T.out0, c: sc(C.flow, 1.012), e: glide},
  {f: T.out1, c: C.full, e: smooth},                              // zoom OUT
  {f: T.z3, c: sc(C.nFit, 1.01), e: glide},                       // wide hold + transition into Notion
  {f: T.z3in, c: C.nKey, e: smooth},                              // ZOOM 3
  {f: T.z3hold, c: sc(C.nKey, 1.02), e: glide},
  {f: T.z3rel, c: C.sFit, e: smooth},
  {f: T.z4, c: sc(C.sFit, 1.01), e: glide},
  {f: T.z4in, c: C.sKey, e: smooth},                              // ZOOM 4
  {f: T.z4hold, c: sc(C.sKey, 1.02), e: glide},
  {f: T.z4rel, c: C.full, e: smooth},
  {f: T.end, c: sc(C.full, 0.99), e: glide},
];
const camAt = (f: number): Cam => {
  if (f < T.win1) return sc(C.full, 0.94 + 0.06 * k(f, T.win0, T.win1));
  for (let i = 1; i < KEYS.length; i++) if (f < KEYS[i].f) return mix(KEYS[i - 1].c, KEYS[i].c, k(f, KEYS[i - 1].f, KEYS[i].f, KEYS[i].e));
  return KEYS[KEYS.length - 1].c;
};
const zoomAt = (f: number) => ZOOMS.findIndex((z) => f >= z.t && f < z.rel1);

type WayC = {top: string; bot: string; a: string; b: string; c: string; j: number; p: number};
const wayAt = (f: number): WayC => {
  let j = -1;
  ZOOMS.forEach((z, i) => {if (f >= z.t) j = i;});
  if (j < 0) return {...WAYS[0], j: 0, p: 0};
  const p = k(f, ZOOMS[j].t, ZOOMS[j].in1 + 6, smooth), A = WAYS[j], Bw = WAYS[j + 1];
  const m = (x: string, y: string) => interpolateColors(p, [0, 1], [x, y]);
  return {top: m(A.top, Bw.top), bot: m(A.bot, Bw.bot), a: m(A.a, Bw.a), b: m(A.b, Bw.b), c: m(A.c, Bw.c), j: j + 1, p};
};
const rgba = (col: string, al: number) => {
  const m = col.match(/[\d.]+/g);
  if (col.startsWith('#')) {const n = parseInt(col.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al})`;}
  return m ? `rgba(${m[0]},${m[1]},${m[2]},${al})` : col;
};
const toScreen = (c: Cam, r: Rect): Rect => ({x: 675 + (r.x - c.cx) * c.s, y: 540 + (r.y - c.cy) * c.s, w: r.w * c.s, h: r.h * c.s});

// ---------- window rect / app per frame ----------
type App = 'builder' | 'notion' | 'slack';
const winAt = (f: number): Rect => {
  if (f < T.tr0) {
    const r = WIN.builder, p = k(f, T.win0, T.win1);
    return {...r, x: r.x + (1 - p) * 1150};
  }
  if (f < T.sSwap0) return lerpR(WIN.builder, WIN.notion, k(f, T.tr0, T.tr1, smooth));
  return lerpR(WIN.notion, WIN.slack, k(f, T.sSwap0, T.sSwap1));
};
const appAt = (f: number): App => (f >= T.sSwap0 + 2 ? 'slack' : f >= T.tr0 + 4 ? 'notion' : 'builder');

// ---------- animated ice/steel field (as 4b), light sweep on each of the 4 zoom pushes ----------
const Field: React.FC<{f: number}> = ({f}) => {
  const c = camAt(f), w = wayAt(f), t = f / 30;
  const slide = (1 - k(f, T.win0, T.win1)) * 60;
  const pc = {cx: lerp(693, c.cx, Math.min(1, 1 / c.s)), cy: lerp(548, c.cy, Math.min(1, 1 / c.s)), s: c.s};
  const lay = (par: number, sc0: number) => ({transform: `translate(${-(pc.cx - 693) * par + slide * par / 0.18}px, ${-(pc.cy - 548) * par}px) scale(${1 + (pc.s - 1) * sc0})`, transformOrigin: '50% 50%'});
  const S = Math.sin;
  const blob = (x: number, y: number, d: number, col: string, al: number) => (
    <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', background: `radial-gradient(closest-side, ${rgba(col, al)}, ${rgba(col, al * 0.45)} 55%, ${rgba(col, 0)})`}} />
  );
  const amb = ((f + 40) % 120) / 120;
  const zs = ZOOMS.map((z) => k(f, z.t - 1, z.t + 16, smooth)).find((p) => p > 0 && p < 1);
  const sweep = (p: number, al: number, wd: number) => (
    <div style={{position: 'absolute', left: -900 + p * 3150, top: -400, width: wd, height: 1900, transform: 'rotate(22deg)',
      background: `linear-gradient(90deg, rgba(255,255,255,0), ${rgba(w.c, al)} 50%, rgba(255,255,255,0))`}} />
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(165deg, ${w.top} 0%, ${interpolateColors(0.5, [0, 1], [w.top, w.bot])} 50%, ${w.bot} 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={lay(0.07, 0.04)}>
        {blob(120 + 170 * S(t * 0.55), 860 + 90 * S(t * 0.42 + 1), 1300, w.a, 0.85)}
        {blob(1180 + 140 * S(t * 0.47 + 2), 120 + 110 * S(t * 0.6), 1150, w.b, 0.8)}
        {blob(330 + 200 * S(t * 0.36 + 4), 40 + 80 * S(t * 0.5 + 3), 980, w.c, 0.95)}
        {blob(1050 + 160 * S(t * 0.4 + 5), 900 + 70 * S(t * 0.52 + 2), 760, w.a, 0.55)}
      </AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'soft-light'}}>{sweep(amb, 0.9, 520)}</AbsoluteFill>
      <AbsoluteFill style={lay(0.18, 0.08)}>
        {[{x: 760, y: -120, w: 760, h: 520, o: 0.6, ph: 0}, {x: -220, y: 700, w: 820, h: 460, o: 0.5, ph: 2}, {x: 980, y: 760, w: 520, h: 420, o: 0.42, ph: 4}].map((p, i) => (
          <div key={i} style={{position: 'absolute', left: p.x + 36 * S(t * 0.5 + p.ph), top: p.y + 24 * S(t * 0.4 + p.ph), width: p.w, height: p.h, borderRadius: 64,
            transform: `rotate(${-14 + 2.2 * S(t * 0.33 + p.ph)}deg)`, opacity: p.o,
            background: `linear-gradient(135deg, rgba(255,255,255,.78), ${rgba(w.b, 0.22)} 60%, ${rgba(w.a, 0.18)})`, border: '1.5px solid rgba(255,255,255,.95)',
            boxShadow: '0 40px 90px rgba(60,80,110,.13)'}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -200, height: 520, background: 'radial-gradient(55% 38% at 50% 50%, rgba(90,110,145,.2), rgba(90,110,145,0))'}} />
      </AbsoluteFill>
      {zs !== undefined && <AbsoluteFill>{sweep(zs, 0.5 * S(zs * Math.PI), 760)}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

const Crop: React.FC<{src: string; iw: number; ih: number; r: {x: number; y: number; w: number; h: number}; s: number; style?: React.CSSProperties}> = ({src, iw, ih, r, s, style}) => (
  <div style={{position: 'absolute', left: r.x * s, top: r.y * s, width: r.w * s, height: r.h * s, overflow: 'hidden', ...style}}>
    <Img src={staticFile(src)} style={{position: 'absolute', left: -r.x * s, top: -r.y * s, width: iw * s, height: ih * s, display: 'block', maxWidth: 'none'}} />
  </div>
);
const Full: React.FC<{src: string; w: number; h: number; s: number; o?: number}> = ({src, w, h, s, o = 1}) =>
  o <= 0 ? null : <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: w * s, height: h * s, opacity: o, display: 'block', maxWidth: 'none'}} />;

// ---------- builder content (real states) ----------
const BuilderContent: React.FC<{f: number}> = ({f}) => {
  const s = BWS, iw = IMG.ready.w, ih = IMG.ready.h;
  const oSent = k(f, T.sent0, T.sent1, smooth), oRead = k(f, T.pick0, T.pick0 + 4, smooth);
  const pk = k(f, T.pick0, T.pick1, smooth);
  const fl = f >= T.flow0;
  const pop = (t: number) => k(f, t, t + 7);
  const lineP = (a: number, b: number) => k(f, a, b, smooth);
  const cardR = (from: typeof B.picker, to: typeof B.loading, p: number) => ({x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), w: lerp(from.w, to.w, p), h: lerp(from.h, to.h, p)});
  const Moving: React.FC<{src: string; from: typeof B.picker; rect: {x: number; y: number; w: number; h: number}; o: number}> = ({src, from, rect, o}) => {
    const m = rect.w / from.w;
    return o <= 0 ? null : (
      <div style={{position: 'absolute', left: rect.x * s, top: rect.y * s, width: rect.w * s, height: rect.h * s, overflow: 'hidden', opacity: o, borderRadius: 30 * s * m}}>
        <Img src={staticFile(src)} style={{position: 'absolute', left: -from.x * s * m, top: -from.y * s * m, width: iw * s * m, height: ih * s * m, display: 'block', maxWidth: 'none'}} />
      </div>
    );
  };
  const mapIn = k(f, T.flow0, T.flow0 + 16), canvasIn = k(f, T.flow0, T.flow0 + 8, smooth);
  const loadOut = k(f, T.flow0, T.flow0 + 8, inCut);
  return (
    <>
      <Full src={IMG.ready.src} w={iw} h={ih} s={s} />
      {/* while the glass composer sits in place, the real pill under it is replaced by its clean plate (the glass shows the panel) */}
      {f >= T.lift0 && f < T.sent1 && <Crop src={IMG.pillPlate.src} iw={IMG.pillPlate.w} ih={IMG.pillPlate.h} r={{x: 0, y: 0, w: IMG.pillPlate.w, h: IMG.pillPlate.h}} s={s}
        style={{left: IMG.pillPlate.x * s, top: IMG.pillPlate.y * s, opacity: k(f, T.lift0, T.lift0 + 6)}} />}
      <Full src={IMG.sent.src} w={iw} h={ih} s={s} o={oSent} />
      <Full src={IMG.read.src} w={iw} h={ih} s={s} o={oRead} />
      {f >= T.pick0 && f < T.flow0 + 8 && (
        <>
          <Crop src={IMG.cardPlate.src} iw={IMG.cardPlate.w} ih={IMG.cardPlate.h} r={{x: 0, y: 0, w: IMG.cardPlate.w, h: IMG.cardPlate.h}} s={s}
            style={{left: B.picker.x * s, top: B.picker.y * s, opacity: oRead}} />
          <Moving src={IMG.sent.src} from={B.picker} rect={cardR(B.picker, B.loading, pk)} o={(1 - k(f, T.pick0 + 2, T.pick1 - 2, smooth)) * (1 - loadOut)} />
          <Moving src={IMG.read.src} from={B.loading} rect={cardR(B.picker, B.loading, pk)} o={k(f, T.pick0 + 2, T.pick1 - 2, smooth) * (1 - loadOut)} />
        </>
      )}
      {fl && (
        <>
          <Crop src={IMG.built.src} iw={iw} ih={ih} r={B.canvas} s={s} style={{opacity: canvasIn}} />
          <Crop src={IMG.flowPlate.src} iw={IMG.flowPlate.w} ih={IMG.flowPlate.h} r={{x: 0, y: 0, w: IMG.flowPlate.w, h: IMG.flowPlate.h}} s={s}
            style={{left: IMG.flowPlate.x * s, top: IMG.flowPlate.y * s}} />
          {loadOut < 1 && <Moving src={IMG.read.src} from={B.loading} rect={cardR(B.loading, {x: B.nodes[0].cx - 60, y: B.nodeCy - 40, w: 120, h: 64}, k(f, T.flow0, T.flow0 + 8, inCut))} o={1 - loadOut} />}
          {[T.node1, T.node2, T.node3].map((t, i) => {
            const p = pop(t);
            if (p <= 0) return null;
            const n = B.nodes[i];
            return <Crop key={i} src={IMG.built.src} iw={iw} ih={ih} r={n} s={s}
              style={{opacity: interpolate(p, [0, 0.4], [0, 1], cl), transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: `${(n.cx - n.x) * s}px ${(B.nodeCy - n.y) * s}px`}} />;
          })}
          {[[T.node1 + 3, T.node2], [T.node2 + 3, T.node3]].map(([a, b], i) => {
            const p = lineP(a, b);
            if (p <= 0) return null;
            const l = B.lines[i];
            return <Crop key={'l' + i} src={IMG.built.src} iw={iw} ih={ih} r={l} s={s} style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}} />;
          })}
          {/* the RESPONSE: the real reply card column slides in from the left */}
          <Crop src={IMG.built.src} iw={iw} ih={ih} r={B.mapping} s={s} style={{opacity: interpolate(mapIn, [0, 0.5], [0, 1], cl), transform: `translateX(${(1 - mapIn) * -90}px)`}} />
        </>
      )}
    </>
  );
};

const SlackContent: React.FC<{f: number; s: number}> = ({f, s}) => {
  const m = k(f, T.msg, T.msg + 9);
  return (
    <>
      <Full src={IMG.slackFrame.src} w={IMG.slackFrame.w} h={IMG.slackFrame.h} s={s} />
      {f >= T.msg && (
        <div style={{position: 'absolute', left: 0, top: (IMG.slackMsg.slotY + (1 - m) * 60) * s, width: IMG.slackMsg.w * s, height: IMG.slackMsg.h * s, opacity: interpolate(m, [0, 0.5], [0, 1], cl)}}>
          <Full src={IMG.slackMsg.src} w={IMG.slackMsg.w} h={IMG.slackMsg.h} s={s} />
        </div>
      )}
    </>
  );
};

const Favicon: React.FC<{app: App}> = ({app}) =>
  app === 'builder' ? <Img src={staticFile('logo-fansa.png')} style={{width: 16, height: 16, objectFit: 'contain'}} />
    : <svg width="15" height="15" viewBox="0 0 24 24"><path d={(app === 'notion' ? siNotion : siSlack).path} fill={app === 'notion' ? '#111' : '#4A154B'} /></svg>;
const TABS: {app: App; title: string; url: string}[] = [
  {app: 'builder', title: 'FansaChat · Builder', url: 'fansachat.com/builder'},
  {app: 'notion', title: 'Maya Chen', url: 'notion.so/Maya-Chen'},
  {app: 'slack', title: 'all-fansachat-test · Slack', url: 'app.slack.com/client/all-fansachat-test'},
];
const ChromeBar: React.FC<{f: number; w: number}> = ({f, w}) => {
  const app = appAt(f);
  const ai = TABS.findIndex((t) => t.app === app);
  const tabW = Math.min(232, (w - 120) / 3);
  const pos = f < T.sSwap0 ? k(f, T.tr0, T.tr0 + 10) : 1 + k(f, T.sSwap0, T.sSwap0 + 10);
  const urlSwap = (a: number) => k(f, a, a + 6, smooth);
  const urlO = app === 'builder' ? 1 : app === 'notion' ? urlSwap(T.tr0 + 4) : urlSwap(T.sSwap0 + 2);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: CHROME_H, fontFamily: INTER, fontWeight: 500}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 36, background: '#DFE3E8'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <div key={c} style={{position: 'absolute', left: 16 + i * 20, top: 12, width: 12, height: 12, borderRadius: 6, background: c}} />)}
        <div style={{position: 'absolute', left: 84 + pos * tabW, top: 6, width: tabW, height: 30, background: '#fff', borderRadius: '10px 10px 0 0'}} />
        {TABS.map((t, i) => (
          <div key={t.app} style={{position: 'absolute', left: 84 + i * tabW + 12, top: 6, width: tabW - 24, height: 30, display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: i === ai ? '#1F2328' : '#5E6670', whiteSpace: 'nowrap', overflow: 'hidden'}}>
            <Favicon app={t.app} /><span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{t.title}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, top: 36, width: w, height: 40, background: '#fff', borderBottom: '1px solid #E3E6EA'}}>
        <svg width="70" height="40" style={{position: 'absolute', left: 10, top: 0}} viewBox="0 0 70 40">
          <path d="M14 20h12M14 20l5-5M14 20l5 5" stroke="#5F6368" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M50 20H38M50 20l-5-5M50 20l-5 5" stroke="#B8BCC2" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: 84, right: 16, top: 6, height: 28, borderRadius: 14, background: '#F1F3F4', display: 'flex', alignItems: 'center', paddingLeft: 14, gap: 8, fontSize: 14, color: '#202124'}}>
          <svg width="12" height="14" viewBox="0 0 12 14"><rect x="1.5" y="6" width="9" height="7" rx="1.5" fill="#5F6368" /><path d="M3.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#5F6368" strokeWidth="1.5" fill="none" /></svg>
          <span style={{opacity: urlO}}>{TABS[ai].url}</span>
        </div>
      </div>
    </div>
  );
};

const Window: React.FC<{f: number}> = ({f}) => {
  if (f < T.win0) return null;
  const r = winAt(f);
  const pin = k(f, T.win0, T.win1);
  const cw = r.w, ch = r.h - CHROME_H;
  const tr = k(f, T.tr0, T.tr1, smooth);      // builder -> Notion: simple dissolve with a 3 % scale settle
  const sw = k(f, T.sSwap0, T.sSwap1);        // Notion out left, Slack in from the right
  const ns = cw / IMG.notion.w;
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 14, overflow: 'hidden', background: '#fff',
      boxShadow: '0 50px 110px rgba(30,45,70,.24), 0 12px 30px rgba(30,45,70,.12), 0 0 0 1px rgba(255,255,255,.7)',
      opacity: interpolate(pin, [0, 0.25], [0, 1], cl), filter: pin < 1 ? `blur(${(1 - pin) * 8}px)` : undefined}}>
      <ChromeBar f={f} w={r.w} />
      <div style={{position: 'absolute', left: 0, top: CHROME_H, width: cw, height: ch, overflow: 'hidden', background: '#fff'}}>
        {f < T.tr1 && (
          <div style={{position: 'absolute', left: 0, top: 0, width: WIN.builder.w, height: WIN.builder.h - CHROME_H, opacity: 1 - tr, transform: `scale(${1 + 0.03 * tr})`, transformOrigin: '50% 50%'}}>
            <BuilderContent f={f} />
          </div>
        )}
        {f >= T.tr0 && f < T.sSwap1 && (
          <div style={{position: 'absolute', inset: 0, opacity: tr * (1 - interpolate(sw, [0.2, 0.8], [0, 1], cl)), transform: `translateX(${-sw * cw * 0.3}px) scale(${0.97 + 0.03 * tr})`, transformOrigin: '50% 40%'}}>
            <Full src={IMG.notion.src} w={IMG.notion.w} h={IMG.notion.h} s={ns} />
            <div style={{position: 'absolute', left: NOTION_PLATE.x * ns, top: NOTION_PLATE.y * ns, width: NOTION_PLATE.w * ns, height: NOTION_PLATE.h * ns, background: '#fff'}} />
            {NOTION_LINES.map((l, j) => {
              const p = k(f, T.line0 + j * T.lineStep, T.line0 + j * T.lineStep + 9);
              return p <= 0 ? null : <Crop key={j} src={IMG.notion.src} iw={IMG.notion.w} ih={IMG.notion.h} r={l} s={ns}
                style={{opacity: interpolate(p, [0, 0.6], [0, 1], cl), transform: `translate(${(1 - p) * -10}px, ${(1 - p) * 16}px)`, filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined}} />;
            })}
          </div>
        )}
        {f >= T.sSwap0 && (
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - sw) * cw * 0.35}px)`, opacity: interpolate(sw, [0, 0.3], [0, 1], cl)}}>
            <SlackContent f={f} s={cw / IMG.slackFrame.w} />
          </div>
        )}
      </div>
    </div>
  );
};

const Stage: React.FC<{f: number}> = ({f}) => {
  const c = camAt(f);
  const e = k(f, T.end0, T.end1, smooth); // the window recedes for the end card
  if (e >= 1) return null;
  return (
    <AbsoluteFill style={{opacity: 1 - e, filter: e > 0 ? `blur(${e * 14}px)` : undefined, transform: `scale(${1 - 0.08 * e}) translateY(${-30 * e}px)`, transformOrigin: '50% 50%'}}>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${675 - c.cx * c.s}px, ${540 - c.cy * c.s}px) scale(${c.s})`}}>
        <Window f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- the composer in liquid glass, IN PLACE (screen rect = camera-projected real composer) ----------
type Box = Rect & {r: number; dark: number; ts: number; o: number; glass: number};
const boxAt = (f: number): Box | null => {
  if (f < T.lift0 || f >= T.morph1) return null;
  const c = camAt(f);
  let r = toScreen(c, compStage(f));
  let rad = PILL.h / 2 * c.s, dark = 0, o = 1;
  const glass = k(f, T.lift0, T.lift1);
  if (f >= T.morph0) {
    const q = k(f, T.morph0, T.morph1 - 2, peak);
    const bub = toScreen(c, bRect(B.bubble));
    r = lerpR(r, bub, q);
    rad = lerp(rad, 22 * BWS * c.s, q);
    dark = k(f, T.morph0 + 4, T.morph1 - 4, smooth);
    o = 1 - k(f, T.morph1 - 5, T.morph1, smooth);
  }
  return {...r, r: rad, dark, ts: r.w / (PILL.w * S0), o, glass};
};

const dispMap = (w: number, h: number, r: number) => {
  const rim = Math.max(10, Math.min(w, h) * 0.26);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${rim * 0.45}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#x)"/><rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${rim}" y="${rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(0, r - rim)}" fill="rgb(128,128,0)" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const Neon: React.FC<{w: number; h: number; r: number; head: number; amp: number}> = ({w, h, r, head, amp}) => {
  const pad = 40;
  const segs = [{L: 30, sw: 3, op: 0.25}, {L: 16, sw: 4, op: 0.55}, {L: 7, sw: 5, op: 0.95}, {L: 1.8, sw: 5.5, op: 1, white: true}];
  const rr = (s: typeof segs[number], i: number, glow: boolean, hd: number, op = 1) => (
    <rect key={(glow ? 'g' : 'c') + i + '-' + hd} x={pad} y={pad} width={w} height={h} rx={r} ry={r} pathLength={100} fill="none"
      stroke={s.white ? '#fff' : 'url(#ng5)'} strokeWidth={glow ? s.sw * 4 : s.sw} strokeLinecap="round" opacity={s.op * amp * op * (glow ? 0.6 : 1)}
      strokeDasharray={`${s.L} ${100 - s.L}`} strokeDashoffset={s.L - hd} />
  );
  return (
    <svg width={w + pad * 2} height={h + pad * 2} style={{position: 'absolute', left: -pad, top: -pad, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="ng5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={NEON_A} /><stop offset="0.5" stopColor={NEON_B} /><stop offset="1" stopColor={NEON_C} /></linearGradient>
        <filter id="nb5" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {/* soft steady ice-blue glow all round + a runner */}
      <rect x={pad} y={pad} width={w} height={h} rx={r} ry={r} fill="none" stroke={NEON_B} strokeWidth={10} opacity={0.22 * amp} filter="url(#nb5)" />
      <rect x={pad} y={pad} width={w} height={h} rx={r} ry={r} fill="none" stroke="url(#ng5)" strokeWidth={1.6} opacity={0.7 * amp} />
      <g filter="url(#nb5)">{segs.map((s, i) => rr(s, i, true, head))}</g>
      <g>{segs.map((s, i) => rr(s, i, false, head))}</g>
    </svg>
  );
};

const GlassBox: React.FC<{f: number; b: Box; draft: boolean}> = ({f, b, draft}) => {
  const W0 = Math.max(2, Math.round(b.w)), H0 = Math.max(2, Math.round(b.h));
  const map = useMemo(() => dispMap(W0, H0, b.r), [W0, H0, b.r]);
  const n = charsAt(f);
  const typing = f >= T.type0 && n < LINES.reduce((a, l) => a + l.length + 1, 0) - 1;
  const caretOn = typing || Math.floor(f / 8) % 2 === 0;
  const lap = (ff: number) => (ff - T.lift0) / 40;
  const head = (lap(f) * 100) % 100;
  const amp = b.glass * (1 - b.dark);
  const press = f >= T.press ? interpolate(f, [T.press, T.press + 1, T.press + 5], [1, 0.86, 1], cl) : 1;
  const ink = interpolateColors(b.dark, [0, 1], [INK, '#FFFFFF']);
  const refW = PILL.w * S0, refH = b.h / b.ts;               // text layer laid out at the zoom's reference scale
  const top0 = (H1 - COMP.cap * COMP.size) / 2;               // first cap top inside the box
  return (
    <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, opacity: b.o}}>
      {/* lift: a deeper soft shadow grows under the glass (a few px of depth) */}
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, boxShadow: `0 ${4 + 18 * b.glass}px ${10 + 34 * b.glass}px rgba(24,40,70,${0.1 + 0.14 * b.glass}), 0 0 ${26 * amp}px ${rgba(NEON_B, 0.28 * amp)}`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, overflow: 'hidden', isolation: 'isolate'}}>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id="lg5" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={-60} y={-60} width={W0 + 120} height={H0 + 120} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={10 * b.glass + 0.01} result="bl" />
            <feImage href={map} x={0} y={0} width={W0} height={H0} preserveAspectRatio="none" result="m" />
            <feDisplacementMap in="bl" in2="m" scale={-54 * b.glass} xChannelSelector="R" yChannelSelector="G" result="dr" />
            <feDisplacementMap in="bl" in2="m" scale={-60 * b.glass} xChannelSelector="R" yChannelSelector="G" result="dg" />
            <feDisplacementMap in="bl" in2="m" scale={-66 * b.glass} xChannelSelector="R" yChannelSelector="G" result="db" />
            <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feComposite in="r" in2="g" operator="arithmetic" k2={1} k3={1} result="rg" />
            <feComposite in="rg" in2="b" operator="arithmetic" k2={1} k3={1} />
          </filter>
        </svg>
        <div style={{position: 'absolute', left: 0, top: 0, width: W0, height: H0, filter: 'url(#lg5)'}}>
          <div style={{position: 'absolute', left: -b.x, top: -b.y, width: W, height: H}}>
            <Field f={f} />
            <Stage f={f} />
          </div>
        </div>
        <div style={{position: 'absolute', inset: 0, background: `rgba(244,249,255,${0.22 * b.glass})`}} />
        <div style={{position: 'absolute', inset: 0, opacity: b.glass, background: 'linear-gradient(170deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(190,225,255,.3) 100%)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: b.r, opacity: b.glass, boxShadow: 'inset 0 2px 1px rgba(255,255,255,.95), inset 0 -14px 30px rgba(255,255,255,.3), inset 0 -2px 8px rgba(30,40,80,.10)'}} />
        {b.dark > 0 && <div style={{position: 'absolute', inset: 0, background: '#141518', opacity: b.dark}} />}
        <div style={{position: 'absolute', left: 0, top: 0, width: refW, height: refH, transform: `scale(${b.ts})`, transformOrigin: '0 0'}}>
          {LINES.map((l, i) => {
            const st = LINE_START[i];
            const shown = Math.max(0, Math.min(l.length, n - st));
            const caretHere = f >= T.lift1 - 2 && f < T.press && caretOn && ((n >= st && n <= st + l.length) || (i === 0 && n === 0));
            if (shown <= 0 && !caretHere) return null;
            return (
              <div key={i} style={{position: 'absolute', left: COMP.padL, top: top0 + i * COMP.lead, whiteSpace: 'pre', ...DISPLAY,
                fontWeight: 700, fontSize: COMP.size, lineHeight: 1, letterSpacing: '-0.022em', color: ink, ...TRIM}}>
                <span>{l.slice(0, shown)}</span>
                {caretHere && <span style={{display: 'inline-block', width: 3.5, height: '0.82em', marginLeft: 3, borderRadius: 2, background: NEON_C}} />}
              </div>
            );
          })}
          {/* the real composer's send disc, in place at the right end */}
          <div style={{position: 'absolute', left: refW - COMP.discR - COMP.disc / 2, top: refH - H1 / 2 - COMP.disc / 2, width: COMP.disc, height: COMP.disc, borderRadius: '50%', opacity: 1 - b.dark,
            transform: `scale(${press})`, background: f >= T.press ? INK : 'rgba(255,255,255,.9)', border: '2.5px solid rgba(15,22,34,.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke={f >= T.press ? '#fff' : INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, padding: 1.6, opacity: (1 - b.dark) * b.glass, background: 'linear-gradient(150deg, rgba(255,255,255,1), rgba(255,255,255,.25) 40%, rgba(255,255,255,.08) 62%, rgba(255,255,255,.7))',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'}} />
      {amp > 0.01 && <Neon w={b.w} h={b.h} r={b.r} head={head} amp={amp} />}
      {draft && <div style={{position: 'absolute', inset: -2, border: '2px dashed #f00', borderRadius: b.r}} />}
    </div>
  );
};

// ---------- hook (on the grid; the liked word pop) ----------
const Hook: React.FC<{f: number}> = ({f}) => {
  if (f >= T.win1) return null;
  return (
    <>
      {HOOK_LINES.map((L, ln) => (
        <div key={ln} style={{position: 'absolute', left: colX(0), bottom: H - L.baseline, display: 'flex', alignItems: 'flex-end', gap: '0.24em',
          ...DISPLAY, fontSize: L.size, letterSpacing: `${L.track}em`, lineHeight: 1}}>
          {HOOK.map((h, i) => {
            if (h.line !== ln) return null;
            const p = k(f, WORD0 + i * WSTEP, WORD0 + i * WSTEP + WDUR);
            const q = k(f, T.hookOut + i, T.hookOut + i + 7, inCut);
            return <span key={i} style={{display: 'inline-block', fontWeight: L.weight, ...TRIM, opacity: interpolate(p, [0, 0.5], [0, 1], cl) * (1 - q),
              color: interpolateColors(p, [0, 1], [DIM, h.bold ? INK : '#2A3442']),
              transform: `translate(${-q * 260}px, ${(1 - p) * 22}px) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 10 + q * 14}px)`}}>{h.w}</span>;
          })}
        </div>
      ))}
    </>
  );
};

// ---------- end card: logo + wordmark + CTA (on the grid, centred) ----------
const EndCard: React.FC<{f: number}> = ({f}) => {
  if (f < T.logo0) return null;
  const lg = k(f, T.logo0, T.logo0 + 14), wd = k(f, T.word0, T.word0 + 12), ct = k(f, T.cta0, T.cta0 + 12);
  const shine = k(f, T.cta0 + 10, T.cta0 + 34, smooth);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 675 - 84, top: 272 + (1 - lg) * 40, width: 168, height: 168, borderRadius: 44, background: 'rgba(255,255,255,.92)',
        boxShadow: '0 30px 70px rgba(30,45,70,.18), 0 0 0 1px rgba(255,255,255,.9), inset 0 2px 1px #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: interpolate(lg, [0, 0.4], [0, 1], cl), transform: `scale(${0.86 + 0.14 * lg})`, filter: `blur(${(1 - lg) * 8}px)`}}>
        <Img src={staticFile('logo-fansa.png')} style={{width: 128, height: 128, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: W, bottom: H - 576, textAlign: 'center', ...DISPLAY, fontWeight: 800, fontSize: 76.3, letterSpacing: '-0.035em', color: INK, ...TRIM,
        opacity: interpolate(wd, [0, 0.5], [0, 1], cl), transform: `translateY(${(1 - wd) * 22}px)`, filter: `blur(${(1 - wd) * 8}px)`}}>FansaChat</div>
      <div style={{position: 'absolute', left: 675 - 330, top: 632 + (1 - ct) * 24, width: 660, height: 96, borderRadius: 48, overflow: 'hidden', background: INK,
        boxShadow: `0 24px 50px rgba(15,22,34,.28), 0 0 ${30 * ct}px ${rgba(NEON_B, 0.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: interpolate(ct, [0, 0.5], [0, 1], cl), transform: `scale(${0.94 + 0.06 * ct})`}}>
        <span style={{...DISPLAY, fontWeight: 700, fontSize: 39.06, letterSpacing: '-0.02em', color: '#fff', ...TRIM}}>Join the waitlist <span style={{color: NEON_A, fontWeight: 600}}>·</span> fansachat.com</span>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: -200 + shine * 1060, width: 140, background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.22), rgba(255,255,255,0))'}} />
      </div>
    </AbsoluteFill>
  );
};

const GridOverlay: React.FC<{f: number}> = ({f}) => {
  const z = zoomAt(f);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: GRID.cols}).map((_, i) => <div key={i} style={{position: 'absolute', left: colX(i), top: 0, width: GRID.col, height: H, background: 'rgba(255,0,60,.07)', borderLeft: '1px solid rgba(255,0,60,.35)', borderRight: '1px solid rgba(255,0,60,.35)'}} />)}
      {Array.from({length: H / GRID.baseline}).map((_, i) => <div key={'b' + i} style={{position: 'absolute', left: 0, top: i * GRID.baseline, width: W, height: 1, background: i % 8 === 0 ? 'rgba(0,120,255,.35)' : 'rgba(0,120,255,.10)'}} />)}
      <div style={{position: 'absolute', left: GRID.margin, top: GRID.top, right: GRID.margin, bottom: GRID.bottom, border: '2px solid rgba(0,160,80,.7)'}} />
      {HOOK_LINES.map((L, i) => <div key={'h' + i} style={{position: 'absolute', left: 0, top: L.baseline, width: W, height: 2, background: 'rgba(255,120,0,.9)'}} />)}
      {[0, 1, 2].map((i) => <div key={'t' + i} style={{position: 'absolute', left: colX(2) - COMP.padL, top: BOT - (H1 - COMP.cap * COMP.size) / 2 - (2 - i) * COMP.lead, width: PILL.w * S0, height: 2, background: 'rgba(255,120,0,.6)'}} />)}
      <div style={{position: 'absolute', left: 8, top: 8, padding: '6px 10px', background: 'rgba(255,255,255,.92)', fontFamily: 'Arial', fontSize: 15, color: '#000', lineHeight: 1.35}}>
        DRAFT f{f} · 12 col / margin 96 / gutter 24 / col 77.5 · baseline 8 px · safe 96/72 · Inter (OFL)<br />
        type scale 16×1.25ⁿ: {SCALE_USED.map((s) => `n${s.n}=${s.px}px ${s.use}`).join(' · ')} · browser chrome 13–14 px = mockup chrome, off-scale
      </div>
      <div style={{position: 'absolute', left: 8, bottom: 8, padding: '4px 8px', background: 'rgba(255,255,255,.92)', fontFamily: 'Arial', fontSize: 15, color: '#000'}}>
        zoom: {z >= 0 ? `${z + 1}/4 ${ZOOMS[z].id}` : 'wide'} · colourway → {WAYS[wayAt(f).j].name} ({wayAt(f).p.toFixed(2)}) · SFX: {SFX.filter((c) => f >= c.f && f < c.f + 3).map((c) => `[${c.type}] ${c.why}`).join(' | ') || '—'}
      </div>
    </AbsoluteFill>
  );
};

const Picture: React.FC<{draft: boolean}> = ({draft}) => {
  const f = useCurrentFrame();
  const b = boxAt(f);
  const btn = b ? {x: b.x + b.w - COMP.discR * b.ts, y: b.y + b.h - H1 / 2 * b.ts} : {x: 0, y: 0};
  const cu = k(f, T.cursorIn, T.press - 2);
  const curX = interpolate(cu, [0, 1], [W + 60, btn.x - 6]), curY = interpolate(cu, [0, 1], [H + 40, btn.y - 4]);
  const dip = f >= T.press && f < T.press + 4 ? 0.86 : 1;
  const curOut = 1 - k(f, T.press + 3, T.press + 9);
  const ring = (f - T.press) / 9;
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: draft ? 'grayscale(1)' : undefined}}>
      <Field f={f} />
      <Stage f={f} />
      {b && <GlassBox f={f} b={b} draft={draft} />}
      <Hook f={f} />
      {b && f >= T.cursorIn && curOut > 0 && (
        <div style={{position: 'absolute', left: curX, top: curY, transform: `scale(${dip})`, transformOrigin: '0 0', opacity: curOut}}>
          <svg width="40" height="52" viewBox="0 0 17 22"><path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" fill="#0F1622" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" /></svg>
        </div>
      )}
      {b && ring >= 0 && ring <= 1 && (
        <div style={{position: 'absolute', left: btn.x - 80 * ring, top: btn.y - 80 * ring, width: 160 * ring, height: 160 * ring, borderRadius: '50%',
          border: `${4 * (1 - ring) + 1}px solid ${NEON_B}`, opacity: 1 - ring}} />
      )}
      <EndCard f={f} />
      <AbsoluteFill style={{background: 'radial-gradient(90% 85% at 50% 50%, rgba(0,0,0,0) 65%, rgba(20,30,50,.10) 100%)', pointerEvents: 'none'}} />
      {draft && <GridOverlay f={f} />}
    </AbsoluteFill>
  );
};

export const Shot5: React.FC<{draft: boolean; bed?: boolean; sfx?: boolean}> = ({draft, bed = true, sfx = true}) => (
  <AbsoluteFill>
    {!draft && sfx && SFX.map((x, i) => {
      const d = Math.min(x.dur ?? 40, TOTAL - x.f);
      return <Sequence key={i} from={x.f} durationInFrames={d} layout="none"><Audio src={staticFile(x.src)} volume={(fr) => x.vol * (x.dur ? interpolate(fr, [d - 3, d - 1], [1, 0], cl) : 1)} /></Sequence>;
    })}
    {!draft && bed && <Audio src={staticFile(BED.src)} startFrom={BED.from} volume={(fr) => BED.vol * interpolate(fr, [0, BED.fadeIn, BED.fadeOut0, TOTAL - 1], [0, 1, 1, 0], cl)} />}
    {draft ? <Picture draft /> : <CameraMotionBlur shutterAngle={90} samples={8}><Picture draft={false} /></CameraMotionBlur>}
  </AbsoluteFill>
);
