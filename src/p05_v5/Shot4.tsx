// P05 v5 test shot 4 (5:4 1350x1080, 8.2 s). Hook on a typographic grid -> a Chrome window slides in from the right onto an
// ice/steel field -> a blurry LIQUID GLASS prompt box with a neon border lifts off our real composer pill, the prompt is
// typed -> send -> the box shrinks INTO the real sent chat bubble (it never stays as an overlay) -> real states: shape
// picker card transforms into the "Reading your request" card -> the built flow connects node by node + "What goes where"
// slides in -> the camera pushes into the Notion node, which opens into the real Notion page (same Chrome window, tab +
// address switch, window resizes) -> Notion slides out, real Slack slides in, the real message arrives -> push-in.
// Draft = the same picture in greyscale with the typographic grid, the box rects and the cue list overlaid.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFont as geist} from '@remotion/google-fonts/Geist';
import {siNotion, siSlack} from 'simple-icons';
import {B, BOX, CHROME_H, CPS, GRID, H, HOOK, HOOK_LINES, IMG, LINES, NOTION_BODY, Rect, SCALE_USED, SEND_R, SFX, SLACK_LINE, T, TOTAL, W, WIN, WDUR, WORD0, WSTEP, colX, colR} from './plan4';

const GEIST = geist('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;

const settle = Easing.bezier(0.16, 1, 0.3, 1);   // expo-out
const outCut = Easing.bezier(0, 0, 0.2, 1);
const inCut = Easing.bezier(0.8, 0, 1, 1);
const peak = Easing.bezier(0.8, 0, 0.2, 1);
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const glide = Easing.bezier(0.45, 0, 0.55, 1);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const k = (f: number, a: number, b: number, e: (t: number) => number = settle) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpR = (a: Rect, b: Rect, p: number): Rect => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p)});
const TRIM = {textBox: 'trim-both cap alphabetic'} as unknown as React.CSSProperties; // box = cap top .. baseline

const INK = '#0F1622', DIM = '#B6C0CC';
const NEON_A = '#62F2FF', NEON_B = '#9A7CFF', NEON_C = '#FF7AD9';

// ---------- camera (stage px -> screen): screen = 675 + (p - c) * s ----------
type Cam = {cx: number; cy: number; s: number};
const mix = (a: Cam, b: Cam, p: number): Cam => ({cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), p))});
const sc = (c: Cam, m: number): Cam => ({...c, s: c.s * m});

// builder content: crop px -> stage px
const BWS = WIN.builder.w / IMG.ready.w;
const bx = (x: number) => WIN.builder.x + x * BWS, by = (y: number) => WIN.builder.y + CHROME_H + y * BWS;
const bRect = (r: {x: number; y: number; w: number; h: number}): Rect => ({x: bx(r.x), y: by(r.y), w: r.w * BWS, h: r.h * BWS});
const NWS = WIN.notion.w / IMG.notion.w, SWS = WIN.slack.w / IMG.slackFrame.w;
const node2 = {x: bx(B.nodes[1].cx), y: by(B.nodeCy)};

const C = {
  full: {cx: 675, cy: 548, s: 1.0},
  type: {cx: 675, cy: 548, s: 1.04},
  bubble: {cx: 560, cy: 530, s: 1.1},
  picker: {cx: 760, cy: 560, s: 1.12},
  flow: {cx: 598, cy: 520, s: 1.3},
  node: {cx: node2.x, cy: node2.y, s: 2.6},
  nFit: {cx: 693, cy: 548, s: 1.0},
  nKey: {cx: WIN.notion.x + NOTION_BODY.cx * NWS, cy: WIN.notion.y + CHROME_H + NOTION_BODY.cy * NWS - 20, s: 1.85},
  sFit: {cx: 675, cy: 548, s: 1.0},
  sKey: {cx: WIN.slack.x + SLACK_LINE.cx * SWS + 40, cy: WIN.slack.y + CHROME_H + (IMG.slackMsg.slotY + SLACK_LINE.cy) * SWS, s: 2.0},
};
const camAt = (f: number): Cam => {
  if (f < T.win1) return sc(C.full, 0.94 + 0.06 * k(f, T.win0, T.win1));
  if (f < T.morph0) return mix(C.full, C.type, k(f, T.win1, T.morph0, glide));
  if (f < T.pick0) return mix(C.type, C.bubble, k(f, T.morph0, T.pick0, smooth));
  if (f < T.flow0) return mix(C.bubble, C.picker, k(f, T.pick0, T.flow0, smooth));
  if (f < T.nIn0) return mix(C.picker, C.flow, k(f, T.flow0, T.flow0 + 16, smooth));
  if (f < T.cutN) return mix(C.flow, C.node, k(f, T.nIn0, T.cutN, inCut));   // speed peaks as the node opens
  if (f < T.nPush0) return mix(C.node, C.nFit, k(f, T.cutN, T.nFit, outCut));
  if (f < T.sSwap0) return sc(mix(C.nFit, C.nKey, k(f, T.nPush0, T.nPush1, peak)), 1 + 0.02 * k(f, T.nPush1, T.sSwap0, glide));
  if (f < T.sPush0) return mix(sc(C.nKey, 1.02), C.sFit, k(f, T.sSwap0, T.sSwap1, smooth));
  return sc(mix(C.sFit, C.sKey, k(f, T.sPush0, T.sPush1, peak)), 1 + 0.02 * k(f, T.sPush1, T.end, glide));
};
const toScreen = (c: Cam, r: Rect): Rect => ({x: 675 + (r.x - c.cx) * c.s, y: 540 + (r.y - c.cy) * c.s, w: r.w * c.s, h: r.h * c.s});

// ---------- window rect per frame (resizes between apps) ----------
type App = 'builder' | 'notion' | 'slack';
const winAt = (f: number): Rect => {
  if (f < T.cutN - 2) {
    const r = WIN.builder, p = k(f, T.win0, T.win1);
    return {...r, x: r.x + (1 - p) * 1150};
  }
  if (f < T.sSwap0) return lerpR(WIN.builder, WIN.notion, k(f, T.cutN - 2, T.nFit));
  return lerpR(WIN.notion, WIN.slack, k(f, T.sSwap0, T.sSwap1));
};
const appAt = (f: number): App => (f >= T.sSwap0 + 2 ? 'slack' : f >= T.cutN - 2 ? 'notion' : 'builder');

// ---------- designed ice/steel field with parallax slabs ----------
const Field: React.FC<{f: number}> = ({f}) => {
  const c = camAt(f);
  const par = 0.18, slide = (1 - k(f, T.win0, T.win1)) * 60;
  const tx = -(c.cx - 675) * par + slide, ty = -(c.cy - 548) * par, s = 1 + (c.s - 1) * 0.08;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(165deg, #F3F6FA 0%, #E4EAF1 48%, #D2DBE6 100%)', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: -260, top: -340, width: 980, height: 980, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,0))'}} />
        {[{x: 760, y: -120, w: 760, h: 520, r: -14, o: 0.55}, {x: -220, y: 700, w: 820, h: 460, r: -14, o: 0.45}, {x: 980, y: 760, w: 520, h: 420, r: -14, o: 0.35}].map((p, i) => (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, borderRadius: 64, transform: `rotate(${p.r}deg)`, opacity: p.o,
            background: 'linear-gradient(135deg, rgba(255,255,255,.75), rgba(214,224,236,.25))', border: '1.5px solid rgba(255,255,255,.9)',
            boxShadow: '0 40px 90px rgba(60,80,110,.10)'}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: -200, height: 520, background: 'radial-gradient(60% 50% at 50% 0%, rgba(120,140,170,.16), rgba(120,140,170,0))'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// a crop of a real capture, placed at (x, y) content px, scaled by s
const Crop: React.FC<{src: string; iw: number; ih: number; r: {x: number; y: number; w: number; h: number}; s: number; style?: React.CSSProperties}> = ({src, iw, ih, r, s, style}) => (
  <div style={{position: 'absolute', left: r.x * s, top: r.y * s, width: r.w * s, height: r.h * s, overflow: 'hidden', ...style}}>
    <Img src={staticFile(src)} style={{position: 'absolute', left: -r.x * s, top: -r.y * s, width: iw * s, height: ih * s, display: 'block', maxWidth: 'none'}} />
  </div>
);
const Full: React.FC<{src: string; w: number; h: number; s: number; o?: number}> = ({src, w, h, s, o = 1}) =>
  o <= 0 ? null : <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: w * s, height: h * s, opacity: o, display: 'block', maxWidth: 'none'}} />;

// ---------- builder content: real states animated (dissolve, card transform, slide-in, node-by-node connect) ----------
const BuilderContent: React.FC<{f: number}> = ({f}) => {
  const s = BWS, iw = IMG.ready.w, ih = IMG.ready.h;
  const oSent = k(f, T.sent0, T.sent1, smooth), oRead = k(f, T.pick0, T.pick0 + 4, smooth);
  const pk = k(f, T.pick0, T.pick1, smooth);
  const fl = f >= T.flow0;
  const pop = (t: number) => k(f, t, t + 7);
  const lineP = (a: number, b: number) => k(f, a, b, smooth);
  const cardR = (from: typeof B.picker, to: typeof B.loading, p: number) => ({x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), w: lerp(from.w, to.w, p), h: lerp(from.h, to.h, p)});
  // a moving card = the source crop scaled into a moving rect
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
      {f >= T.lift0 && f < T.sent1 && <Crop src={IMG.pillPlate.src} iw={IMG.pillPlate.w} ih={IMG.pillPlate.h} r={{x: 0, y: 0, w: IMG.pillPlate.w, h: IMG.pillPlate.h}} s={s}
        style={{left: IMG.pillPlate.x * s, top: IMG.pillPlate.y * s, opacity: k(f, T.lift0, T.lift0 + 6)}} />}
      <Full src={IMG.sent.src} w={iw} h={ih} s={s} o={oSent} />
      <Full src={IMG.read.src} w={iw} h={ih} s={s} o={oRead} />
      {/* while the cards transform, the real static cards are hidden by the moving copies of themselves */}
      {f >= T.pick0 && f < T.flow0 + 8 && (
        <>
          {/* the read state's own canvas with its card row-interpolated away, under the moving cards */}
          <Crop src={IMG.cardPlate.src} iw={IMG.cardPlate.w} ih={IMG.cardPlate.h} r={{x: 0, y: 0, w: IMG.cardPlate.w, h: IMG.cardPlate.h}} s={s}
            style={{left: B.picker.x * s, top: B.picker.y * s, opacity: oRead}} />
          <Moving src={IMG.sent.src} from={B.picker} rect={cardR(B.picker, B.loading, pk)} o={(1 - k(f, T.pick0 + 2, T.pick1 - 2, smooth)) * (1 - loadOut)} />
          <Moving src={IMG.read.src} from={B.loading} rect={cardR(B.picker, B.loading, pk)} o={k(f, T.pick0 + 2, T.pick1 - 2, smooth) * (1 - loadOut)} />
        </>
      )}
      {fl && (
        <>
          {/* canvas of the built state dissolves in, flow hidden under its plate until each node connects */}
          <Crop src={IMG.built.src} iw={iw} ih={ih} r={B.canvas} s={s} style={{opacity: canvasIn}} />
          <Crop src={IMG.flowPlate.src} iw={IMG.flowPlate.w} ih={IMG.flowPlate.h} r={{x: 0, y: 0, w: IMG.flowPlate.w, h: IMG.flowPlate.h}} s={s}
            style={{left: IMG.flowPlate.x * s, top: IMG.flowPlate.y * s, opacity: canvasIn}} />
          {/* the loading card shrinks into the first node */}
          {loadOut < 1 && <Moving src={IMG.read.src} from={B.loading} rect={cardR(B.loading, {x: B.nodes[0].cx - 60, y: B.nodeCy - 40, w: 120, h: 64}, k(f, T.flow0, T.flow0 + 8, inCut))} o={1 - loadOut} />}
          {/* connect: node 1 -> line -> node 2 -> line -> node 3 */}
          {[T.node1, T.node2, T.node3].map((t, i) => {
            const p = pop(t);
            if (p <= 0) return null;
            const n = B.nodes[i];
            return <Crop key={i} src={IMG.built.src} iw={iw} ih={ih} r={n} s={s}
              style={{opacity: interpolate(p, [0, 0.4], [0, 1], cl), transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: `${(n.cx - n.x) * s}px ${(B.nodeCy - n.y) * s}px`}} />;
          })}
          {[[T.node1 + 2, T.node2], [T.node2 + 2, T.node3]].map(([a, b], i) => {
            const p = lineP(a, b);
            if (p <= 0) return null;
            const l = B.lines[i];
            return <Crop key={'l' + i} src={IMG.built.src} iw={iw} ih={ih} r={l} s={s} style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}} />;
          })}
          {/* "What goes where": the whole left column of the built state slides in from the left */}
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

// ---------- the Chrome window (generic browser chrome drawn in code; content = real crops) ----------
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
  // active-tab highlight glides between tabs (Apple-style continuous move)
  const pos = f < T.cutN - 2 ? 0 : f < T.sSwap0 ? k(f, T.cutN - 2, T.cutN + 8) : 1 + k(f, T.sSwap0, T.sSwap0 + 10);
  const urlSwap = (a: number) => k(f, a, a + 6, smooth);
  const urlO = app === 'builder' ? 1 : app === 'notion' ? urlSwap(T.cutN - 2) : urlSwap(T.sSwap0 + 2);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: CHROME_H, fontFamily: GEIST, fontWeight: 500}}>
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
  const app = appAt(f);
  const cw = r.w, ch = r.h - CHROME_H;
  // Notion opens out of the Notion node: a growing circle from the node's stage point
  const nOpen = k(f, T.cutN - 2, T.cutN + 10, outCut);
  const cxN = node2.x - r.x, cyN = node2.y - (r.y + CHROME_H);
  const rad = lerp(B.nodeR * BWS, Math.hypot(Math.max(cxN, cw - cxN), Math.max(cyN, ch - cyN)) + 4, nOpen);
  const sw = k(f, T.sSwap0, T.sSwap1); // Notion out left, Slack in from the right
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 14, overflow: 'hidden', background: '#fff',
      boxShadow: '0 50px 110px rgba(30,45,70,.24), 0 12px 30px rgba(30,45,70,.12), 0 0 0 1px rgba(255,255,255,.7)',
      opacity: interpolate(pin, [0, 0.25], [0, 1], cl), filter: pin < 1 ? `blur(${(1 - pin) * 8}px)` : undefined}}>
      <ChromeBar f={f} w={r.w} />
      <div style={{position: 'absolute', left: 0, top: CHROME_H, width: cw, height: ch, overflow: 'hidden', background: '#fff'}}>
        {app === 'builder' || nOpen < 1 ? (app !== 'slack' && <BuilderContent f={Math.min(f, T.cutN + 10)} />) : null}
        {f >= T.cutN - 2 && f < T.sSwap1 && (
          <div style={{position: 'absolute', inset: 0, clipPath: nOpen < 1 ? `circle(${rad}px at ${cxN}px ${cyN}px)` : undefined,
            transform: `translateX(${-sw * cw * 0.45}px)`, opacity: 1 - interpolate(sw, [0.2, 0.8], [0, 1], cl)}}>
            <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
            <Full src={IMG.notion.src} w={IMG.notion.w} h={IMG.notion.h} s={cw / IMG.notion.w} />
          </div>
        )}
        {f >= T.sSwap0 && (
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - sw) * cw * 0.6}px)`, opacity: interpolate(sw, [0, 0.3], [0, 1], cl)}}>
            <SlackContent f={f} s={cw / IMG.slackFrame.w} />
          </div>
        )}
      </div>
    </div>
  );
};

// camera-transformed stage (window only; the field has its own parallax)
const Stage: React.FC<{f: number}> = ({f}) => {
  const c = camAt(f);
  return (
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${675 - c.cx * c.s}px, ${540 - c.cy * c.s}px) scale(${c.s})`}}>
      <Window f={f} />
    </AbsoluteFill>
  );
};

// ---------- glass box ----------
type Box = Rect & {r: number; dark: number; ts: number; o: number};
const boxAt = (f: number): Box | null => {
  if (f < T.lift0 || f >= T.morph1) return null;
  const c = camAt(f);
  const pill = toScreen(c, bRect(B.pill));
  const hero: Rect = {x: BOX.x, y: BOX.y, w: BOX.w, h: BOX.h};
  const p = k(f, T.lift0, T.lift1);
  let r: Rect = lerpR(pill, hero, p);
  let rad = lerp(pill.h / 2, BOX.r, p), dark = 0, ts = 1, o = 1;
  if (f >= T.morph0) {
    const q = k(f, T.morph0, T.morph1 - 2, peak);
    const bub = toScreen(c, bRect(B.bubble));
    r = lerpR(hero, bub, q);
    rad = lerp(BOX.r, 22 * BWS * c.s, q);
    dark = k(f, T.morph0 + 4, T.morph1 - 4, smooth);
    ts = r.w / BOX.w;
    o = 1 - k(f, T.morph1 - 5, T.morph1, smooth); // the real bubble (sent state) is underneath by now
  }
  return {...r, r: rad, dark, ts, o};
};

const dispMap = (w: number, h: number, r: number) => {
  const rim = Math.max(10, Math.min(w, h) * 0.26);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${rim * 0.45}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#x)"/><rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${rim}" y="${rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(0, r - rim)}" fill="rgb(128,128,0)" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const Neon: React.FC<{w: number; h: number; r: number; head: number; amp: number}> = ({w, h, r, head, amp}) => {
  const pad = 40;
  const segs = [{L: 34, sw: 4, op: 0.22}, {L: 20, sw: 5, op: 0.5}, {L: 10, sw: 6, op: 0.95}, {L: 2.2, sw: 7, op: 1, white: true}];
  const rr = (s: typeof segs[number], i: number, glow: boolean, hd: number, op = 1) => (
    <rect key={(glow ? 'g' : 'c') + i + '-' + hd} x={pad} y={pad} width={w} height={h} rx={r} ry={r} pathLength={100} fill="none"
      stroke={s.white ? '#fff' : 'url(#ng4)'} strokeWidth={glow ? s.sw * 5 : s.sw} strokeLinecap="round" opacity={s.op * amp * op * (glow ? 0.7 : 1)}
      strokeDasharray={`${s.L} ${100 - s.L}`} strokeDashoffset={s.L - hd} />
  );
  return (
    <svg width={w + pad * 2} height={h + pad * 2} style={{position: 'absolute', left: -pad, top: -pad, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="ng4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={NEON_A} /><stop offset="0.55" stopColor={NEON_B} /><stop offset="1" stopColor={NEON_C} /></linearGradient>
        <filter id="nb4" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <rect x={pad} y={pad} width={w} height={h} rx={r} ry={r} fill="none" stroke="url(#ng4)" strokeWidth={2} opacity={0.5 * amp} />
      <g filter="url(#nb4)">{segs.map((s, i) => rr(s, i, true, head))}</g>
      <g>{segs.map((s, i) => rr(s, i, false, head))}</g>
      <g>{segs.slice(0, 3).map((s, i) => rr(s, i, false, head - 50, 0.35))}</g>
    </svg>
  );
};

const GlassBox: React.FC<{f: number; b: Box; draft: boolean}> = ({f, b, draft}) => {
  const W0 = Math.max(2, Math.round(b.w)), H0 = Math.max(2, Math.round(b.h));
  const map = useMemo(() => dispMap(W0, H0, b.r), [W0, H0, b.r]);
  const n = Math.max(0, Math.floor((f - T.type0) * CPS));
  const total = LINES.reduce((a, l) => a + l.length + 1, 0) - 1;
  const typing = f >= T.type0 && n < total;
  const caretOn = typing || Math.floor(f / 8) % 2 === 0;
  const textIn = k(f, T.lift1 - 4, T.lift1 + 2);
  let used = 0;
  const lines = LINES.map((l) => {const st = used; used += l.length + 1; return {l, st};});
  const lap = (ff: number) => (ff < T.press ? (ff - T.lift0) / 34 : (T.press - T.lift0) / 34 + (ff - T.press) / 22);
  const head = (lap(f) * 100) % 100;
  const amp = k(f, T.lift0, T.lift1) * (1 - b.dark);
  const press = f >= T.press ? interpolate(f, [T.press, T.press + 1, T.press + 5], [1, 0.86, 1], cl) : 1;
  const ink = interpolateColors(b.dark, [0, 1], [INK, '#FFFFFF']);
  return (
    <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, opacity: b.o}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, boxShadow: '0 34px 70px rgba(24,34,60,.24), 0 8px 18px rgba(24,34,60,.12)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, overflow: 'hidden', isolation: 'isolate'}}>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id="lg4" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={-60} y={-60} width={W0 + 120} height={H0 + 120} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={11} result="bl" />
            <feImage href={map} x={0} y={0} width={W0} height={H0} preserveAspectRatio="none" result="m" />
            <feDisplacementMap in="bl" in2="m" scale={-64} xChannelSelector="R" yChannelSelector="G" result="dr" />
            <feDisplacementMap in="bl" in2="m" scale={-72} xChannelSelector="R" yChannelSelector="G" result="dg" />
            <feDisplacementMap in="bl" in2="m" scale={-80} xChannelSelector="R" yChannelSelector="G" result="db" />
            <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feComposite in="r" in2="g" operator="arithmetic" k2={1} k3={1} result="rg" />
            <feComposite in="rg" in2="b" operator="arithmetic" k2={1} k3={1} />
          </filter>
        </svg>
        {/* backdrop: the field + the camera stage re-rendered in box space, blurred and lensed at the rim */}
        <div style={{position: 'absolute', left: 0, top: 0, width: W0, height: H0, filter: 'url(#lg4)'}}>
          <div style={{position: 'absolute', left: -b.x, top: -b.y, width: W, height: H}}>
            <Field f={f} />
            <Stage f={f} />
          </div>
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,.12)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 72%, rgba(210,225,255,.28) 100%)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: b.r, boxShadow: 'inset 0 2px 1px rgba(255,255,255,.95), inset 0 -18px 40px rgba(255,255,255,.3), inset 0 -2px 8px rgba(30,40,80,.10), inset 0 10px 24px rgba(30,40,80,.06)'}} />
        {b.dark > 0 && <div style={{position: 'absolute', inset: 0, background: '#141518', opacity: b.dark}} />}
        {/* typed prompt: lines laid out from the start (untyped part transparent), baselines on the 8 px grid */}
        <div style={{position: 'absolute', left: 0, top: 0, width: BOX.w, height: BOX.h, transform: `scale(${b.ts})`, transformOrigin: '0 0', opacity: textIn}}>
          {lines.map(({l, st}, i) => {
            const shown = Math.max(0, Math.min(l.length, n - st));
            const caretHere = f >= T.lift1 - 2 && f < T.press && caretOn && ((n >= st && n <= st + l.length) || (i === 0 && n === 0));
            return (
              <div key={i} style={{position: 'absolute', left: BOX.padX, bottom: BOX.h - (BOX.base0 - BOX.y + i * BOX.lead), whiteSpace: 'pre',
                fontFamily: GEIST, fontWeight: 700, fontSize: BOX.size, lineHeight: 1, letterSpacing: '-0.028em', color: ink, ...TRIM}}>
                <span>{l.slice(0, shown)}</span>
                {caretHere && <span style={{display: 'inline-block', width: 5, height: '0.8em', marginLeft: 3, borderRadius: 2, background: NEON_B}} />}
                <span style={{color: 'transparent'}}>{l.slice(shown)}</span>
              </div>
            );
          })}
          <div style={{position: 'absolute', right: 26, bottom: 26, width: SEND_R * 2, height: SEND_R * 2, borderRadius: '50%', opacity: 1 - b.dark,
            transform: `scale(${press})`, background: f >= T.press ? INK : 'rgba(255,255,255,.85)', border: '1.5px solid rgba(15,22,34,.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(24,34,60,.18)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke={f >= T.press ? '#fff' : INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, padding: 1.6, opacity: 1 - b.dark, background: 'linear-gradient(150deg, rgba(255,255,255,1), rgba(255,255,255,.25) 40%, rgba(255,255,255,.08) 62%, rgba(255,255,255,.7))',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'}} />
      {amp > 0.01 && <Neon w={b.w} h={b.h} r={b.r} head={head} amp={amp} />}
      {draft && <div style={{position: 'absolute', inset: -2, border: '2px dashed #f00', borderRadius: b.r}} />}
    </div>
  );
};

// ---------- hook (on the grid) ----------
const Hook: React.FC<{f: number}> = ({f}) => {
  if (f >= T.win1) return null;
  return (
    <>
      {HOOK_LINES.map((L, ln) => (
        <div key={ln} style={{position: 'absolute', left: colX(0), bottom: H - L.baseline, display: 'flex', alignItems: 'flex-end', gap: '0.24em',
          fontFamily: GEIST, fontSize: L.size, letterSpacing: `${L.track}em`, lineHeight: 1}}>
          {HOOK.map((h, i) => {
            if (h.line !== ln) return null;
            const p = k(f, WORD0 + i * WSTEP, WORD0 + i * WSTEP + WDUR);
            const q = k(f, T.hookOut + i, T.hookOut + i + 9, inCut); // slide out left into the window's entrance
            return <span key={i} style={{display: 'inline-block', fontWeight: L.weight, ...TRIM, opacity: interpolate(p, [0, 0.5], [0, 1], cl) * (1 - q),
              color: interpolateColors(p, [0, 1], [DIM, h.bold ? INK : '#2A3442']),
              transform: `translate(${-q * 260}px, ${(1 - p) * 22}px) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 10 + q * 14}px)`}}>{h.w}</span>;
          })}
        </div>
      ))}
    </>
  );
};

// ---------- draft overlay: typographic grid + labels ----------
const GridOverlay: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: GRID.cols}).map((_, i) => <div key={i} style={{position: 'absolute', left: colX(i), top: 0, width: GRID.col, height: H, background: 'rgba(255,0,60,.07)', borderLeft: '1px solid rgba(255,0,60,.35)', borderRight: '1px solid rgba(255,0,60,.35)'}} />)}
    {Array.from({length: H / GRID.baseline}).map((_, i) => <div key={'b' + i} style={{position: 'absolute', left: 0, top: i * GRID.baseline, width: W, height: 1, background: i % 8 === 0 ? 'rgba(0,120,255,.35)' : 'rgba(0,120,255,.10)'}} />)}
    <div style={{position: 'absolute', left: GRID.margin, top: GRID.top, right: GRID.margin, bottom: GRID.bottom, border: '2px solid rgba(0,160,80,.7)'}} />
    {HOOK_LINES.map((L, i) => <div key={'h' + i} style={{position: 'absolute', left: 0, top: L.baseline, width: W, height: 2, background: 'rgba(255,120,0,.9)'}} />)}
    {[0, 1, 2, 3].map((i) => <div key={'t' + i} style={{position: 'absolute', left: BOX.x, top: BOX.base0 + i * BOX.lead, width: BOX.w, height: 2, background: 'rgba(255,120,0,.6)'}} />)}
    <div style={{position: 'absolute', left: 8, top: 8, padding: '6px 10px', background: 'rgba(255,255,255,.92)', fontFamily: 'Arial', fontSize: 15, color: '#000', lineHeight: 1.35}}>
      DRAFT f{f} · 12 col / margin 96 / gutter 24 / col 77.5 · baseline 8 px · safe 96/72<br />
      type scale 16×1.25ⁿ: {SCALE_USED.map((s) => `n${s.n}=${s.px}px ${s.use}`).join(' · ')}
    </div>
    <div style={{position: 'absolute', left: 8, bottom: 8, padding: '4px 8px', background: 'rgba(255,255,255,.92)', fontFamily: 'Arial', fontSize: 15, color: '#000'}}>
      SFX here: {SFX.filter((c) => f >= c.f && f < c.f + 3).map((c) => c.why).join(' | ') || '—'}
    </div>
  </AbsoluteFill>
);

const Picture: React.FC<{draft: boolean}> = ({draft}) => {
  const f = useCurrentFrame();
  const b = boxAt(f);
  const btn = b ? {x: b.x + b.w - 26 - SEND_R, y: b.y + b.h - 26 - SEND_R} : {x: 0, y: 0};
  const cu = k(f, T.cursorIn, T.press - 2);
  const curX = interpolate(cu, [0, 1], [W + 60, btn.x + 6]), curY = interpolate(cu, [0, 1], [H + 40, btn.y + 8]);
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
      <AbsoluteFill style={{background: 'radial-gradient(90% 85% at 50% 50%, rgba(0,0,0,0) 65%, rgba(20,30,50,.10) 100%)', pointerEvents: 'none'}} />
      {draft && <GridOverlay f={f} />}
    </AbsoluteFill>
  );
};

export const Shot4: React.FC<{draft: boolean}> = ({draft}) => (
  <AbsoluteFill>
    {!draft && SFX.map((x, i) => <Sequence key={i} from={x.f} durationInFrames={Math.min(30, TOTAL - x.f)} layout="none"><Audio src={staticFile(x.src)} volume={x.vol} /></Sequence>)}
    {draft ? <Picture draft /> : <CameraMotionBlur shutterAngle={90} samples={8}><Picture draft={false} /></CameraMotionBlur>}
  </AbsoluteFill>
);
