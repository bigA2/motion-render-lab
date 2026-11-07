// P05 v5 test shot 3: hook -> our REAL builder panel (2x crop) -> camera dives to the composer -> a LIQUID GLASS prompt box
// lifts off the real pill, a neon light runs around its border while the real lead prompt is typed big -> send -> the box
// parks at the top and stays fixed (match cut, VAk5 #1) while the world swaps to the REAL Notion page, then the REAL Slack
// channel, each with a push-in to the key line. Ice/steel near-solid background. Motion blur 90 deg. Draft = B/W plan.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFont as geist} from '@remotion/google-fonts/Geist';
import {CAM, COMPACT, H, HERO, HOOK, IMG, LINES, PILL_CAM, PILL_PANEL, SEND_R, SFX, T, TYPE, W, WDUR, WORD0, WSTEP, CPS} from './plan3';

const GEIST = geist('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;

const settle = Easing.bezier(0.16, 1, 0.3, 1);
const outCut = Easing.bezier(0, 0, 0.2, 1);
const inCut = Easing.bezier(0.8, 0, 1, 1);
const peak = Easing.bezier(0.8, 0, 0.2, 1);
const glide = Easing.bezier(0.45, 0, 0.55, 1);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const k = (f: number, a: number, b: number, e: (t: number) => number = settle) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- palette (ice / steel) ----------
const ICE = '#E9EEF4', ICE_EDGE = '#D3DCE7', INK = '#0F1622', DIM = '#B6C0CC';
const NEON_A = '#62F2FF', NEON_B = '#9A7CFF', NEON_C = '#FF7AD9';

// ---------- cameras ----------
type Cam = {cx: number; cy: number; s: number; ax: number; ay: number};
const mix = (a: Cam, b: Cam, p: number): Cam => ({
  cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p), ax: lerp(a.ax, b.ax, p), ay: lerp(a.ay, b.ay, p),
  s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), p)),
});
const scaled = (c: Cam, m: number): Cam => ({...c, s: c.s * m});
type Scene = 'panel' | 'notion' | 'slack';
const sceneAt = (f: number): Scene => (f >= T.cut3 ? 'slack' : f >= T.cut2 ? 'notion' : 'panel');
const pillCam: Cam = {...PILL_CAM, ax: 675, ay: 540};
const camAt = (f: number): Cam => {
  const sc = sceneAt(f);
  if (sc === 'panel') {
    if (f < T.dive0) return scaled(CAM.panel, 0.82 + 0.18 * k(f, T.cut1, T.cut1 + 10, outCut));
    if (f < T.dive1) return mix(CAM.panel, pillCam, k(f, T.dive0, T.dive1, peak));
    const drift = scaled(pillCam, 1.03);
    if (f < T.compact0) return mix(pillCam, drift, k(f, T.dive1, T.compact0, glide));
    return scaled(drift, 1 + 0.15 * k(f, T.compact0, T.cut2, inCut)); // speed peaks on the cut
  }
  if (sc === 'notion') {
    const fit = scaled(CAM.notionFit, 0.86 + 0.14 * k(f, T.cut2, T.cut2 + 10, outCut));
    if (f < T.nPush1) return mix(fit, CAM.notionKey, k(f, T.nPush0, T.nPush1, peak));
    return scaled(CAM.notionKey, 1 + 0.02 * k(f, T.nPush1, T.cut3, glide));
  }
  const fit = scaled(CAM.slackFit, 0.86 + 0.14 * k(f, T.cut3, T.cut3 + 10, outCut));
  if (f < T.sPush1) return mix(fit, CAM.slackKey, k(f, T.sPush0, T.sPush1, peak));
  return scaled(CAM.slackKey, 1 + 0.02 * k(f, T.sPush1, T.end, glide));
};
const sceneCut = (f: number) => (f >= T.cut3 ? T.cut3 : f >= T.cut2 ? T.cut2 : T.cut1);

// ---------- world (one real crop, framed as a floating window on the ice field) ----------
const World: React.FC<{f: number; draft: boolean}> = ({f, draft}) => {
  if (f < T.cut1) return null;
  const sc = sceneAt(f);
  const img = IMG[sc];
  const cam = camAt(f);
  const inn = k(f, sceneCut(f), sceneCut(f) + 10, outCut);
  const label = sc === 'panel' ? 'REAL BUILDER PANEL (2x crop)' : sc === 'notion' ? 'REAL NOTION PAGE: Maya Chen' : 'REAL SLACK: #all-fansachat-test, FansaChat 12:34 PM';
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: img.w, height: img.h, transformOrigin: '0 0',
      transform: `translate(${cam.ax - cam.cx * cam.s}px, ${cam.ay - cam.cy * cam.s}px) scale(${cam.s})`,
      opacity: interpolate(inn, [0, 0.3], [0, 1], cl)}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: img.r, overflow: 'hidden', background: '#fff',
        boxShadow: draft ? 'none' : '0 30px 80px rgba(28,40,64,.22), 0 6px 18px rgba(28,40,64,.12)',
        border: draft ? '4px solid #000' : '1px solid rgba(255,255,255,.9)',
        filter: draft ? 'none' : `blur(${(1 - inn) * 8}px)`}}>
        {draft ? <div style={{width: '100%', height: '100%', background: '#ddd', fontFamily: 'Arial', fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{label}</div>
          : <Img src={staticFile(img.src)} style={{width: img.w, height: img.h, display: 'block'}} />}
      </div>
    </div>
  );
};

const Field: React.FC<{draft: boolean}> = ({draft}) => (
  <AbsoluteFill style={{background: draft ? '#fff' : `radial-gradient(90% 85% at 50% 42%, ${ICE} 0%, #E3E9F0 55%, ${ICE_EDGE} 100%)`}} />
);

// ---------- the glass box geometry ----------
type Box = {x: number; y: number; w: number; h: number; r: number; sc: number};
const nullZoom = (f: number, c: number) => (f < c ? 1 + 0.06 * k(f, c - 4, c, inCut) : 1 + 0.06 * (1 - k(f, c, c + 8, outCut)));
const boxAt = (f: number): Box | null => {
  if (f < T.lift0) return null;
  const pill = {x: 675 + (PILL_PANEL.x - PILL_CAM.cx) * PILL_CAM.s, y: 540 + (PILL_PANEL.y - PILL_CAM.cy) * PILL_CAM.s, w: PILL_PANEL.w, h: PILL_PANEL.h};
  const p = k(f, T.lift0, T.lift1);
  const b: Box = {x: lerp(pill.x, HERO.x, p), y: lerp(pill.y, HERO.y, p), w: lerp(pill.w, HERO.w, p), h: lerp(pill.h, HERO.h, p), r: lerp(pill.h / 2, HERO.r, p), sc: 1};
  const c = k(f, T.compact0, T.compact1, peak);
  const heroCy = HERO.y + HERO.h / 2;
  b.y += (COMPACT.cy - heroCy) * c;
  // VAk5 null zoom straddling each match cut: 1 -> 1.06 into the cut (ease-in), back to 1 after (ease-out)
  const near = (cut: number) => (f >= cut - 4 && f < cut + 8 ? nullZoom(f, cut) : 1);
  b.sc = lerp(1, COMPACT.sc, c) * near(T.cut2) * near(T.cut3);
  return b;
};

// displacement map: R = x offset, G = y offset, neutral grey in the middle, strongest at the rim (lens edge)
const dispMap = (w: number, h: number, r: number) => {
  const rim = Math.max(10, Math.min(w, h) * 0.2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${rim * 0.45}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#x)"/><rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${rim}" y="${rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(0, r - rim)}" fill="rgb(128,128,0)" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// neon runner: a hot head + a fading comet tail travelling the rounded rect (pathLength 100), plus its glow copy
const Neon: React.FC<{w: number; h: number; r: number; head: number; amp: number; id: string}> = ({w, h, r, head, amp, id}) => {
  const pad = 40;
  const segs = [
    {L: 34, sw: 3, op: 0.18, col: `url(#ng-${id})`},
    {L: 20, sw: 3.5, op: 0.4, col: `url(#ng-${id})`},
    {L: 10, sw: 4, op: 0.85, col: `url(#ng-${id})`},
    {L: 2.2, sw: 5, op: 1, col: '#FFFFFF'},
  ];
  const rect = (s: typeof segs[number], i: number, glow: boolean) => (
    <rect key={(glow ? 'g' : 'c') + i} x={pad} y={pad} width={w} height={h} rx={r} ry={r} pathLength={100} fill="none"
      stroke={s.col} strokeWidth={glow ? s.sw * 4 : s.sw} strokeLinecap="round" opacity={s.op * amp * (glow ? 0.7 : 1)}
      strokeDasharray={`${s.L} ${100 - s.L}`} strokeDashoffset={s.L - head} />
  );
  // second, fainter runner half a lap behind keeps the whole rim alive
  const head2 = head - 50;
  return (
    <svg width={w + pad * 2} height={h + pad * 2} style={{position: 'absolute', left: -pad, top: -pad, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <linearGradient id={`ng-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={NEON_A} /><stop offset="0.55" stopColor={NEON_B} /><stop offset="1" stopColor={NEON_C} /></linearGradient>
        <filter id={`nb-${id}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      {/* faint always-on rim so the runner reads as light IN the border */}
      <rect x={pad} y={pad} width={w} height={h} rx={r} ry={r} fill="none" stroke={`url(#ng-${id})`} strokeWidth={1.4} opacity={0.28 * amp} />
      <g filter={`url(#nb-${id})`}>{segs.map((s, i) => rect(s, i, true))}</g>
      <g>{segs.map((s, i) => rect(s, i, false))}</g>
      <g opacity={0.35}>{segs.slice(0, 3).map((s, i) => (
        <rect key={'b' + i} x={pad} y={pad} width={w} height={h} rx={r} ry={r} pathLength={100} fill="none" stroke={s.col} strokeWidth={s.sw}
          opacity={s.op * amp} strokeLinecap="round" strokeDasharray={`${s.L} ${100 - s.L}`} strokeDashoffset={s.L - head2} />))}</g>
    </svg>
  );
};

const GlassBox: React.FC<{f: number; b: Box; draft: boolean}> = ({f, b, draft}) => {
  const W0 = Math.max(2, Math.round(b.w)), H0 = Math.max(2, Math.round(b.h));
  const map = useMemo(() => dispMap(W0, H0, b.r), [W0, H0, b.r]);
  // screen position of the box's top-left after its own centre scale
  const sx0 = b.x + b.w / 2 - (b.w / 2) * b.sc, sy0 = b.y + b.h / 2 - (b.h / 2) * b.sc;
  // typing
  const n = Math.max(0, Math.floor((f - T.type0) * CPS));
  const total = LINES.reduce((a, l) => a + l.length + 1, 0) - 1;
  const typing = f >= T.type0 && n < total;
  const caretOn = typing || Math.floor(f / 8) % 2 === 0;
  const textIn = k(f, T.lift1 - 4, T.lift1 + 2);
  let used = 0;
  const lines = LINES.map((l) => {const st = used; used += l.length + 1; return {l, st};});
  // neon: 1 lap / 34 f while typing, then a slower, dimmer lap; fades in on the lift
  const lapF = (ff: number) => (ff < T.press ? (ff - T.lift0) / 34 : (T.press - T.lift0) / 34 + (ff - T.press) / 60);
  const head = (lapF(f) * 100) % 100;
  const amp = k(f, T.lift0, T.lift1) * (f < T.press + 4 ? 1 : 0.62);
  const press = f >= T.press ? interpolate(f, [T.press, T.press + 1, T.press + 5], [1, 0.86, 1], cl) : 1;
  const ink = draft ? '#000' : INK;
  const fid = 'lgbox';
  return (
    <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, transform: `scale(${b.sc})`, transformOrigin: '50% 50%'}}>
      {/* outer shadow + neon halo sit outside the clip */}
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, boxShadow: draft ? 'none' : '0 34px 70px rgba(24,34,60,.26), 0 8px 18px rgba(24,34,60,.14)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: b.r, overflow: 'hidden', isolation: 'isolate', background: draft ? '#fff' : 'transparent', border: draft ? '3px solid #000' : 'none'}}>
        {!draft && (
          <>
            <svg width={0} height={0} style={{position: 'absolute'}}>
              <filter id={fid} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={-60} y={-60} width={W0 + 120} height={H0 + 120} colorInterpolationFilters="sRGB">
                <feImage href={map} x={0} y={0} width={W0} height={H0} preserveAspectRatio="none" result="m" />
                <feDisplacementMap in="SourceGraphic" in2="m" scale={-34} xChannelSelector="R" yChannelSelector="G" result="dr" />
                <feDisplacementMap in="SourceGraphic" in2="m" scale={-38} xChannelSelector="R" yChannelSelector="G" result="dg" />
                <feDisplacementMap in="SourceGraphic" in2="m" scale={-42} xChannelSelector="R" yChannelSelector="G" result="db" />
                <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
                <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
                <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
                <feComposite in="r" in2="g" operator="arithmetic" k2={1} k3={1} result="rg" />
                <feComposite in="rg" in2="b" operator="arithmetic" k2={1} k3={1} result="rgb" />
                <feGaussianBlur in="rgb" stdDeviation={7} />
              </filter>
            </svg>
            {/* what is behind the box (field + world), re-rendered in box space and lensed */}
            <div style={{position: 'absolute', left: 0, top: 0, width: W0, height: H0, filter: `url(#${fid})`}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `scale(${1 / b.sc}) translate(${-sx0}px, ${-sy0}px)`}}>
                <Field draft={false} />
                <World f={f} draft={false} />
              </div>
            </div>
            {/* milky tint for legibility, light from the top-left, inner shadow / glow */}
            <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,.42)'}} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 72%, rgba(210,225,255,.30) 100%)'}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: b.r, boxShadow: 'inset 0 2px 1px rgba(255,255,255,.95), inset 0 -18px 40px rgba(255,255,255,.35), inset 0 -2px 8px rgba(30,40,80,.10), inset 0 10px 24px rgba(30,40,80,.06)'}} />
          </>
        )}
        {/* typed prompt: every line laid out from the start (untyped part transparent) so nothing reflows */}
        <div style={{position: 'absolute', left: TYPE.padX * (b.w / HERO.w), top: 0, height: b.h, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          fontFamily: draft ? 'Arial' : GEIST, fontWeight: 700, fontSize: TYPE.size, lineHeight: TYPE.lh, letterSpacing: draft ? 0 : '-0.028em', color: ink,
          whiteSpace: 'pre', opacity: textIn}}>
          {lines.map(({l, st}, i) => {
            const shown = Math.max(0, Math.min(l.length, n - st));
            const caretHere = f >= T.lift1 - 2 && f < T.press && caretOn && ((n >= st && n <= st + l.length) || (i === 0 && n === 0));
            return (
              <div key={i} style={{position: 'relative'}}>
                <span>{l.slice(0, shown)}</span>
                {caretHere && <span style={{display: 'inline-block', width: 5, height: '0.95em', marginLeft: 3, verticalAlign: '-0.12em', borderRadius: 2, background: draft ? '#000' : NEON_B}} />}
                <span style={{color: 'transparent'}}>{l.slice(shown)}</span>
              </div>
            );
          })}
        </div>
        {/* send button: glass-white disc, arrow, 4 f press pop */}
        <div style={{position: 'absolute', right: 28, bottom: 28, width: SEND_R * 2, height: SEND_R * 2, borderRadius: '50%', opacity: textIn,
          transform: `scale(${press})`, background: draft ? '#fff' : f >= T.press ? INK : 'rgba(255,255,255,.85)',
          border: draft ? '2px solid #000' : '1.5px solid rgba(15,22,34,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: draft ? 'none' : '0 6px 14px rgba(24,34,60,.18)'}}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke={!draft && f >= T.press ? '#fff' : '#0F1622'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      {/* specular rim, brightest top-left */}
      {!draft && <div style={{position: 'absolute', inset: 0, borderRadius: b.r, padding: 1.6, background: 'linear-gradient(150deg, rgba(255,255,255,1), rgba(255,255,255,.25) 40%, rgba(255,255,255,.08) 62%, rgba(255,255,255,.7))',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'}} />}
      {draft ? <div style={{position: 'absolute', left: 0, top: -30, fontFamily: 'Arial', fontSize: 20}}>GLASS BOX · neon runner at {Math.round(head)}%</div>
        : <Neon w={b.w} h={b.h} r={b.r} head={head} amp={amp} id="p" />}
    </div>
  );
};

// hook exit: each line scales 1 -> 1.18, blurs 0 -> 16, fades; ease-in into the cut
const lineExit = (f: number, ln: number, draft: boolean): React.CSSProperties => {
  const q = k(f, T.hookOut + ln, T.hookOut + ln + 6, inCut);
  return {opacity: 1 - q, transform: `scale(${1 + 0.18 * q})`, filter: draft ? 'none' : `blur(${q * 16}px)`};
};

const Picture: React.FC<{draft: boolean}> = ({draft}) => {
  const f = useCurrentFrame();
  const b = boxAt(f);
  // cursor glides to the send button (screen space, follows the box)
  const btn = b ? {x: b.x + b.w / 2 + (b.w / 2 - 28 - SEND_R) * b.sc, y: b.y + b.h / 2 + (b.h / 2 - 28 - SEND_R) * b.sc} : {x: 0, y: 0};
  const cu = k(f, T.cursorIn, T.press - 2);
  const curX = interpolate(cu, [0, 1], [W + 60, btn.x + 6]), curY = interpolate(cu, [0, 1], [H + 40, btn.y + 8]);
  const dip = f >= T.press && f < T.press + 4 ? 0.86 : 1;
  const curOut = 1 - k(f, T.press + 4, T.compact0 + 4);
  const ring = (f - T.press) / 9;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Field draft={draft} />
      <World f={f} draft={draft} />
      {b && <GlassBox f={f} b={b} draft={draft} />}
      {f < T.cut1 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: draft ? 'Arial' : GEIST, fontSize: 104, lineHeight: 1.04, letterSpacing: draft ? 0 : '-0.035em'}}>
          {[0, 1].map((ln) => (
            <div key={ln} style={{display: 'flex', gap: '0.24em', ...lineExit(f, ln, draft)}}>
              {HOOK.map((h, i) => {
                if (h.line !== ln) return null;
                const p = k(f, WORD0 + i * WSTEP, WORD0 + i * WSTEP + WDUR);
                return <span key={i} style={{display: 'inline-block', fontWeight: h.bold ? 700 : 500, opacity: interpolate(p, [0, 0.5], [0, 1], cl),
                  color: draft ? '#000' : interpolateColors(p, [0, 1], [DIM, h.bold ? INK : '#2A3442']),
                  transform: `translateY(${(1 - p) * 22}px) scale(${0.94 + 0.06 * p})`, filter: draft ? 'none' : `blur(${(1 - p) * 10}px)`}}>{h.w}</span>;
              })}
            </div>
          ))}
        </div>
      )}
      {b && f >= T.cursorIn && curOut > 0 && (
        <div style={{position: 'absolute', left: curX, top: curY, transform: `scale(${dip})`, transformOrigin: '0 0', opacity: curOut}}>
          <svg width="40" height="52" viewBox="0 0 17 22"><path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" fill={draft ? '#fff' : '#0F1622'} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" /></svg>
        </div>
      )}
      {b && ring >= 0 && ring <= 1 && (
        <div style={{position: 'absolute', left: btn.x - 80 * ring, top: btn.y - 80 * ring, width: 160 * ring, height: 160 * ring, borderRadius: '50%',
          border: `${4 * (1 - ring) + 1}px solid ${draft ? '#000' : NEON_B}`, opacity: 1 - ring}} />
      )}
      {!draft && <AbsoluteFill style={{background: 'radial-gradient(90% 85% at 50% 50%, rgba(0,0,0,0) 65%, rgba(20,30,50,.10) 100%)', pointerEvents: 'none'}} />}
      {draft && <div style={{position: 'absolute', left: 20, bottom: 14, fontFamily: 'Arial', fontSize: 22, color: '#000', background: '#fff'}}>DRAFT f{f} · hook → panel → dive → glass box lifts → type (neon) → send → box parks top → Notion → Slack</div>}
    </AbsoluteFill>
  );
};

export const Shot3: React.FC<{draft: boolean}> = ({draft}) => (
  <AbsoluteFill>
    {!draft && SFX.map((x, i) => <Sequence key={i} from={x.f} durationInFrames={x.dur} layout="none"><Audio src={staticFile(x.src)} volume={x.vol} /></Sequence>)}
    {draft ? <Picture draft /> : <CameraMotionBlur shutterAngle={90} samples={8}><Picture draft={false} /></CameraMotionBlur>}
  </AbsoluteFill>
);
