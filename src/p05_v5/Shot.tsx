// P05 v5 hook shot. Final = real recording in a floating window over a deep graphite field, Inter Tight + Instrument Serif type.
// Draft = same timing in plain black and white (Arial, flat boxes), per the draft-first method.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';
import {ACCENT, CARD_H, FPS, G, HOOK, REC_START_S, SEND, SFX, T, WORD0, WSTEP} from './plan';

const expo = Easing.bezier(0.16, 1, 0.3, 1);      // entrances
const inout = Easing.bezier(0.65, 0, 0.35, 1);    // camera
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const k = (f: number, a: number, b: number, e = expo) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});

let fontsReady = false;
const useFonts = () => {
  const [h] = React.useState(() => (fontsReady ? null : delayRender('fonts')));
  React.useEffect(() => {
    if (h === null) return;
    const ff = [new FontFace('InterTight', `url(${staticFile('fonts/InterTight-500.woff2')})`, {weight: '500'}),
      new FontFace('InstrumentSerif', `url(${staticFile('fonts/InstrumentSerif-400i.woff2')})`, {style: 'italic'})];
    Promise.all(ff.map((x) => x.load())).then((l) => { l.forEach((x) => document.fonts.add(x)); fontsReady = true; continueRender(h); });
  }, [h]);
};

export const Shot: React.FC<{draft: boolean}> = ({draft}) => {
  useFonts();
  const f = useCurrentFrame();
  const sans = draft ? 'Arial' : 'InterTight';
  const serif = draft ? 'Arial' : 'InstrumentSerif';
  const ink = draft ? '#000' : '#F3F1FA';
  // hook: centred at first, then lifts into the title band (scale 1 -> 0.62)
  const lift = k(f, T.lift, T.lift + 16, inout);
  const hookY = interpolate(lift, [0, 1], [G.H / 2 - 50, 170]);
  const hookS = interpolate(lift, [0, 1], [1, 0.62]);
  // window: rises 70 px, scale .94 -> 1, blur 10 -> 0, then a slow push toward the send button
  const e = k(f, T.card, T.card + 18);
  const push = k(f, T.settle, T.end, inout);
  const sc = interpolate(e, [0, 1], [0.94, 1]) * interpolate(push, [0, 1], [1, 1.08]);
  const ty = interpolate(e, [0, 1], [70, 0]);
  const s = G.cardW / 1920;
  const sendX = G.cardX + SEND.x * s, sendY = G.cardY + SEND.y * s;
  const ox = sendX - G.cardX, oy = sendY - G.cardY; // push origin = send button
  // cursor: enters bottom-right, expo-travels to send, press dip at T.press
  const c = k(f, T.cursorIn, T.press - 4);
  const cx = interpolate(c, [0, 1], [sendX + 380, sendX]), cy = interpolate(c, [0, 1], [sendY + 160, sendY]);
  const press = f >= T.press && f < T.press + 5 ? 0.86 : 1;
  const ring = (f - T.send) / 12; // click ring: 12 frames, 0 -> 64 px, fades
  return (
    <AbsoluteFill style={{background: draft ? '#fff' : 'radial-gradient(120% 90% at 50% 0%, #2A2440 0%, #14121C 55%, #0C0B11 100%)', overflow: 'hidden'}}>
      {!draft && SFX.map((x, i) => <Sequence key={i} from={x.f} layout="none"><Audio src={staticFile(x.src)} volume={x.vol} /></Sequence>)}
      {/* window */}
      {f >= T.card && <div style={{position: 'absolute', left: G.cardX, top: G.cardY, width: G.cardW, height: CARD_H, opacity: e,
        transform: `translateY(${ty}px) scale(${sc})`, transformOrigin: `${ox}px ${oy}px`, filter: draft ? 'none' : `blur(${(1 - e) * 10}px)`,
        borderRadius: 18, overflow: 'hidden', border: draft ? '3px solid #000' : '1px solid rgba(255,255,255,.14)',
        boxShadow: draft ? 'none' : '0 40px 90px rgba(0,0,0,.55), 0 8px 24px rgba(0,0,0,.35)'}}>
        {draft ? <div style={{width: '100%', height: '100%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial', fontSize: 40}}>REAL UI: prompt typed, sent</div>
          : <Sequence from={T.card} layout="none"><OffthreadVideo src={staticFile('real/P05_ui.webm')} startFrom={Math.round(REC_START_S * FPS)} muted style={{width: '100%', height: '100%'}} /></Sequence>}
      </div>}
      {/* hook type */}
      <div style={{position: 'absolute', left: G.M, right: G.M, top: hookY, transform: `translateY(-50%) scale(${hookS})`, transformOrigin: '50% 50%',
        textAlign: 'center', color: ink, fontSize: 96, lineHeight: 1.08, letterSpacing: draft ? 0 : '-0.035em', fontFamily: sans, fontWeight: 500}}>
        {HOOK.map((w, i) => {
          const p = k(f, WORD0 + i * WSTEP, WORD0 + i * WSTEP + 9);
          const acc = ACCENT.has(w);
          return <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: p, transform: `translateY(${(1 - p) * 28}px)`,
            filter: draft ? 'none' : `blur(${(1 - p) * 8}px)`, fontFamily: acc ? serif : sans, fontStyle: acc ? 'italic' : 'normal',
            fontSize: acc && !draft ? '1.12em' : '1em', letterSpacing: acc ? '-0.01em' : undefined, color: acc && !draft ? '#C9B8FF' : ink}}>{w}</span>;
        })}
      </div>
      {/* cursor + click ring */}
      {f >= T.cursorIn && <div style={{position: 'absolute', left: cx, top: cy, transform: `scale(${press})`, transformOrigin: '0 0', opacity: c}}>
        <svg width="34" height="44" viewBox="0 0 17 22"><path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" fill={draft ? '#000' : '#fff'} stroke={draft ? '#fff' : '#111'} strokeWidth="1.2" strokeLinejoin="round" /></svg></div>}
      {ring >= 0 && ring <= 1 && <div style={{position: 'absolute', left: sendX - 64 * ring, top: sendY - 64 * ring, width: 128 * ring, height: 128 * ring,
        borderRadius: '50%', border: `${3 * (1 - ring) + 1}px solid ${draft ? '#000' : '#fff'}`, opacity: 1 - ring}} />}
      {draft && <div style={{position: 'absolute', left: 24, bottom: 18, fontFamily: 'Arial', fontSize: 22}}>DRAFT f{f} · hook words → lift → window enters → latch → cursor → click/send</div>}
    </AbsoluteFill>
  );
};
