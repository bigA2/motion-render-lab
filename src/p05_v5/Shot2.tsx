// P05 v5 test shot 2: hook words -> cut into our REAL app (still from our own recording) -> camera dives into the composer
// -> the prompt is typed big inside the real pill -> camera tracks to the send button -> press -> hard cut to the real
// 'sent' still. Motion = one camera (null-style) + layered crops; motion blur 120 deg (180 smeared the typed text on the track). Draft = same timing in B/W Arial.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {loadFont as geist} from '@remotion/google-fonts/Geist';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {CAM, CPS, H, HOOK, LINES, PILL, PILL_GRAD, SEND, SFX, T, UI_FONT, W, WDUR, WORD0, WSTEP} from './plan2';

const GEIST = geist('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;
const INTER = inter('normal', {weights: ['500'], subsets: ['latin']}).fontFamily;

// Curves (see LEARNED_v2 §3)
const settle = Easing.bezier(0.16, 1, 0.3, 1);   // entrances
const outCut = Easing.bezier(0, 0, 0.2, 1);      // incoming after a cut: max speed on the first frame
const inCut = Easing.bezier(0.8, 0, 1, 1);       // outgoing into a cut: max speed on the last frame
const peak = Easing.bezier(0.8, 0, 0.2, 1);      // camera move with a sharp speed peak
const glide = Easing.bezier(0.45, 0, 0.55, 1);   // slow drift on holds
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const k = (f: number, a: number, b: number, e: (t: number) => number = settle) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});

type Cam = {cx: number; cy: number; s: number};
const mix = (a: Cam, b: Cam, p: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p, s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * p),
});
const camAt = (f: number): Cam => {
  if (f >= T.cut2) {
    const m = k(f, T.cut2, T.cut2 + 12, outCut);
    return {...CAM.sent, s: CAM.sent.s * (0.84 + 0.16 * m) * (1 + 0.03 * (f - T.cut2) / 15)};
  }
  if (f < T.zoom0) return {...CAM.window, s: CAM.window.s * (0.82 + 0.18 * k(f, T.cut1, T.cut1 + 10, outCut))};
  if (f < T.zoom1) return mix(CAM.window, CAM.composer, k(f, T.zoom0, T.zoom1, peak));
  if (f < T.track0) return mix(CAM.composer, CAM.drift, k(f, T.zoom1, T.track0, glide));
  if (f < T.track1) return mix(CAM.drift, CAM.send, k(f, T.track0, T.track1, peak));
  return mix(CAM.send, CAM.push, k(f, T.track1, T.cut2, inCut));
};

// hook exit: each LINE scales 1 -> 1.18 from its centre, blurs 0 -> 16 px, fades; line 2 leaves 1 f later; ease-in into the cut
const lineExit = (f: number, ln: number, draft: boolean): React.CSSProperties => {
  const q = k(f, T.hookOut + ln, T.hookOut + ln + 6, inCut);
  return {opacity: 1 - q, transform: `scale(${1 + 0.18 * q})`, filter: draft ? 'none' : `blur(${q * 16}px)`};
};

const L0 = LINES[0].length;
const fLine2 = T.type0 + (L0 + 1) / CPS;

const Picture: React.FC<{draft: boolean}> = ({draft}) => {
  const f = useCurrentFrame();
  const sans = draft ? 'Arial' : GEIST;
  const ui = draft ? 'Arial' : INTER;
  const cam = camAt(f);
  const toScreen = (x: number, y: number) => ({x: (x - cam.cx) * cam.s + W / 2, y: (y - cam.cy) * cam.s + H / 2});
  const sent = f >= T.cut2;
  // incoming window (UI-morph): opacity in 3 f, blur 12 -> 0 in 10 f
  const win = k(f, T.cut1, T.cut1 + 10, outCut);
  const incoming = sent ? k(f, T.cut2, T.cut2 + 10, outCut) : win;
  // depth of field + pill coming forward
  const dof = sent ? 0 : k(f, T.dof0, T.dof1, glide);
  // typing
  const n = Math.max(0, Math.floor((f - T.type0) * CPS));
  const t0 = LINES[0].slice(0, n), t1 = LINES[1].slice(0, Math.max(0, n - L0 - 1));
  const typing = f >= T.type0 && n < L0 + 1 + LINES[1].length;
  const caretOn = typing || (f >= T.type0 && Math.floor(f / 8) % 2 === 0);
  const grow = k(f, fLine2, fLine2 + 6);
  const ph = PILL.h1 + (PILL.h2 - PILL.h1) * grow;
  const pTop = PILL.bottom - ph;
  const pop = 1 + 0.03 * dof;
  const pcx = PILL.x + PILL.w / 2, pcy = pTop + ph / 2;
  // send button (child of the pill), pressed at T.press: 0.88 -> 1 in 4 f
  const btnX = SEND.x, btnY = pcy;
  const press = f >= T.press ? interpolate(f, [T.press, T.press + 1, T.press + 5], [1, 0.88, 1], cl) : 1;
  const btnS = toScreen(pcx + (btnX - pcx) * pop, pcy + (btnY - pcy) * pop);
  // cursor (screen space)
  const cu = k(f, T.cursorIn, T.press - 2);
  const curX = interpolate(cu, [0, 1], [W + 60, btnS.x + 4]), curY = interpolate(cu, [0, 1], [H - 40, btnS.y + 6]);
  const dip = f >= T.press && f < T.press + 4 ? 0.86 : 1;
  const ring = (f - T.press) / 8;
  const ink = draft ? '#111' : '#2B2530';
  return (
    <AbsoluteFill style={{background: draft ? '#fff' : '#0A0A0D', overflow: 'hidden'}}>
      {!draft && <AbsoluteFill style={{background: 'radial-gradient(70% 60% at 50% 45%, #18171E 0%, #0A0A0D 100%)'}} />}
      {/* WORLD (camera = null): one real still + layered pill */}
      {f >= T.cut1 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0',
          transform: `translate(${W / 2 - cam.cx * cam.s}px, ${H / 2 - cam.cy * cam.s}px) scale(${cam.s})`,
          opacity: interpolate(incoming, [0, 0.25], [0, 1], cl)}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden',
            boxShadow: draft ? 'none' : '0 40px 120px rgba(0,0,0,.65), 0 10px 30px rgba(0,0,0,.4)',
            border: draft ? '4px solid #000' : '1px solid rgba(255,255,255,.10)',
            filter: draft ? 'none' : `blur(${(1 - incoming) * 6 + dof * 5}px) brightness(${1 - 0.42 * dof})`}}>
            {draft ? <div style={{width: '100%', height: '100%', background: '#ddd', fontFamily: 'Arial', fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{sent ? 'REAL STILL: message sent + reply' : 'REAL STILL: app, empty composer'}</div>
              : <Img src={staticFile(sent ? 'real/P05_still_sent.png' : 'real/P05_still_empty.png')} style={{width: 1920, height: 1080, display: 'block'}} />}
          </div>
          {!sent && f >= T.dof0 && (
            <div style={{position: 'absolute', left: PILL.x, top: pTop, width: PILL.w, height: ph, borderRadius: ph / 2,
              background: draft ? '#fff' : PILL_GRAD, border: draft ? '2px solid #000' : 'none', overflow: 'hidden',
              transform: `scale(${pop})`, transformOrigin: '50% 50%',
              boxShadow: draft ? 'none' : `0 ${10 * dof}px ${30 * dof}px rgba(20,10,40,${0.35 * dof})`}}>
              {f < T.type0 ? (
                <div style={{position: 'absolute', left: 53, top: 0, height: ph, display: 'flex', alignItems: 'center', fontFamily: ui, fontWeight: 500, fontSize: 15, color: draft ? '#777' : '#A0939F'}}>start connecting</div>
              ) : (
                <div style={{position: 'absolute', left: 24, right: 64, top: 0, height: ph, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  fontFamily: ui, fontWeight: 500, fontSize: UI_FONT, lineHeight: 1.3, letterSpacing: '-0.01em', color: ink, whiteSpace: 'pre'}}>
                  {[t0, t1].map((t, i) => (i === 1 && n <= L0 ? null :
                    <div key={i}>{t}{caretOn && ((i === 0 && n <= L0) || i === 1) && <span style={{display: 'inline-block', width: 1.8, height: '1.05em', marginLeft: 1, verticalAlign: '-0.15em', background: ink}} />}</div>))}
                </div>
              )}
              <div style={{position: 'absolute', left: btnX - PILL.x - SEND.r - 2, top: ph / 2 - SEND.r - 2, width: 2 * SEND.r + 4, height: 2 * SEND.r + 4,
                borderRadius: '50%', overflow: 'hidden', transform: `scale(${press})`,
                ...(draft ? {border: '2px solid #000', background: '#fff'} : {backgroundImage: `url(${staticFile('real/P05_still_empty.png')})`,
                  backgroundSize: '1920px 1080px', backgroundPosition: `${-(SEND.x - SEND.r - 2)}px ${-(SEND.y - SEND.r - 2)}px`})}} />
            </div>
          )}
        </div>
      )}
      {/* HOOK */}
      {f < T.cut1 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: sans, fontSize: 100, lineHeight: 1.04, letterSpacing: draft ? 0 : '-0.033em'}}>
          {[0, 1].map((ln) => (
            <div key={ln} style={{display: 'flex', gap: '0.24em', ...lineExit(f, ln, draft)}}>
              {HOOK.map((h, i) => {
                if (h.line !== ln) return null;
                const p = k(f, WORD0 + i * WSTEP, WORD0 + i * WSTEP + WDUR);
                const final = draft ? '#000' : h.bold ? '#FFFFFF' : '#E6E4EC';
                return <span key={i} style={{display: 'inline-block', fontWeight: h.bold ? 700 : 500,
                  opacity: interpolate(p, [0, 0.5], [0, 1], cl),
                  color: draft ? '#000' : interpolateColors(p, [0, 1], ['#4A4852', final]),
                  transform: `translateY(${(1 - p) * 22}px) scale(${0.94 + 0.06 * p})`,
                  filter: draft ? 'none' : `blur(${(1 - p) * 10}px)`}}>{h.w}</span>;
              })}
            </div>
          ))}
        </div>
      )}
      {/* CURSOR + RING (screen space) */}
      {f >= T.cursorIn && f < T.cut2 && (
        <div style={{position: 'absolute', left: curX, top: curY, transform: `scale(${dip})`, transformOrigin: '0 0'}}>
          <svg width="40" height="52" viewBox="0 0 17 22"><path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" fill={draft ? '#000' : '#fff'} stroke={draft ? '#fff' : '#111'} strokeWidth="1.2" strokeLinejoin="round" /></svg>
        </div>
      )}
      {ring >= 0 && ring <= 1 && f < T.cut2 && (
        <div style={{position: 'absolute', left: btnS.x - 90 * ring, top: btnS.y - 90 * ring, width: 180 * ring, height: 180 * ring, borderRadius: '50%',
          border: `${4 * (1 - ring) + 1}px solid ${draft ? '#000' : '#fff'}`, opacity: 1 - ring}} />
      )}
      {!draft && <AbsoluteFill style={{background: 'radial-gradient(85% 80% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,.32) 100%)', pointerEvents: 'none'}} />}
      {draft && <div style={{position: 'absolute', left: 20, bottom: 14, fontFamily: 'Arial', fontSize: 22, color: '#000', background: '#fff'}}>DRAFT f{f} · words → cut in (0.82→1) → dive to composer → type → track to send → press → cut (sent)</div>}
    </AbsoluteFill>
  );
};

export const Shot2: React.FC<{draft: boolean}> = ({draft}) => (
  <AbsoluteFill>
    {!draft && SFX.map((x, i) => <Sequence key={i} from={x.f} layout="none"><Audio src={staticFile(x.src)} volume={x.vol} /></Sequence>)}
    {draft ? <Picture draft /> : <CameraMotionBlur shutterAngle={120} samples={8}><Picture draft={false} /></CameraMotionBlur>}
  </AbsoluteFill>
);
