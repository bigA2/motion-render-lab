// The production Film: one stage driven by a per-video spec (src/prod/specs/P0N.ts) + its VO timeline.
// Formats: 4:5 = 1080x1350 (visual on top, kinetic captions below) · 16:9 = TRUE native 1920x1080 (copy left, visual right).
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lockup} from '../intro27/ui';
import {Liquid} from '../intro28/kit';
import {BriefScene, ChatFlash, InboxScene, ListHook, MythCard, PingScene, PollScene, RecapScene, SplitScene, TurnWords} from './acts';
import {Compose} from './compose';
import {FPS, TL} from './timeline';
import {Backdrop, DARK, ez, FONT, INK, layout, Lay, lerp, PERI, PERI_D, VH, VW} from './ui';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
type Wd = {w: string; s: number; line: number};

// ---------- captions: script words (exact spelling) timed by the Whisper word timings of the real VO ----------
const buildCaps = (tl: TL, land: boolean): Wd[][] => {
  const words: Wd[] = [];
  tl.spec.lines.forEach((l, li) => {
    if (tl.spec.nocap?.includes(li)) return;
    const toks = l.split(' ').reduce<string[]>((acc, t) => { if (t === '—' && acc.length) acc[acc.length - 1] += ' —'; else acc.push(t); return acc; }, []);
    const ws = tl.VOL[li].words, at = tl.S[li]; let timed: Wd[];
    if (ws.length === toks.length) timed = toks.map((t, j) => ({w: t, s: at + ws[j].s * FPS, line: li}));
    else { const a0 = ws.length ? ws[0].s : 0, b0 = ws.length ? ws[ws.length - 1].e : tl.VOL[li].dur; const tot = toks.reduce((s2, t) => s2 + t.length + 2, 0); let c = 0;
      timed = toks.map((t) => { const s2 = at + (a0 + ((b0 - a0) * c) / tot) * FPS; c += t.length + 2; return {w: t, s: s2, line: li}; }); }
    const cu = tl.spec.capUntil?.[li];
    if (cu && !land) { const idx = toks.findIndex((t) => norm(t).startsWith(cu)); if (idx >= 0) timed = timed.slice(0, idx); } // the typed sentence is the caption (4:5); 16:9 keeps all words
    words.push(...timed);
  });
  const max = land ? 3 : 4; const chunks: Wd[][] = [];
  words.forEach((w, i) => { const cur = chunks[chunks.length - 1], prev = words[i - 1]; if (!cur || cur.length >= max || prev.line !== w.line || /[.,:;?!—]$/.test(prev.w)) chunks.push([w]); else cur.push(w); });
  return chunks;
};

const Captions: React.FC<{f: number; tl: TL; lay: Lay; dark: boolean}> = ({f, tl, lay, dark}) => {
  const chunks = useMemo(() => buildCaps(tl, lay.land), [tl, lay.land]);
  let ci = -1; chunks.forEach((c, i) => { if (f >= c[0].s - 1) ci = i; }); if (ci < 0) return null;
  const c = chunks[ci], next = chunks[ci + 1], lineEnd = tl.S[c[0].line] + tl.D[c[0].line] + 8; if (f > lineEnd && !(next && f >= next[0].s)) return null;
  const last = c.filter((w) => f >= w.s - 1).pop();
  const box: React.CSSProperties = lay.land
    ? {left: 90, top: 250, width: lay.vx - 90 - 50, height: 580, justifyContent: 'flex-start', textAlign: 'left'}
    : {left: 70, right: 70, top: 968, height: 300, justifyContent: 'center', textAlign: 'center'};
  const fs = lay.land ? 108 : 80;
  return <div style={{position: 'absolute', display: 'flex', flexWrap: 'wrap', alignContent: 'center', columnGap: fs * 0.26, rowGap: 0, ...box}}>
    {c.map((w) => { const k = ez(f, w.s - 2, w.s + 8);
      return <span key={w.w + w.s} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: fs, lineHeight: 1.12, letterSpacing: '-0.02em', opacity: k, transform: `translateY(${(1 - k) * 16}px)`, filter: `blur(${(1 - k) * 12}px)`, color: w === last ? (dark ? PERI : PERI_D) : dark ? '#EDEBF5' : INK, textShadow: dark ? '0 2px 18px rgba(0,0,0,0.5)' : '0 2px 18px rgba(247,246,249,0.9)'}}>{w.w}</span>; })}
  </div>;
};

// ---------- the stage ----------
const Act: React.FC<{f: number; a: any; tl: TL}> = ({f, a, tl}) => {
  switch (a.kind) {
    case 'list': return <ListHook f={f} a={a} tl={tl} />;
    case 'chatflash': return <ChatFlash f={f} a={a} />;
    case 'myth': return <MythCard f={f} a={a} tl={tl} />;
    case 'split': return <SplitScene f={f} a={a} tl={tl} />;
    case 'inbox': return <InboxScene f={f} a={a} tl={tl} />;
    case 'brief': return <BriefScene f={f} a={a} tl={tl} />;
    case 'compose': return <Compose f={f} a={a} tl={tl} />;
    case 'ping': return <PingScene f={f} a={a} tl={tl} />;
    case 'recap': return <RecapScene f={f} a={a} />;
    case 'poll': return <PollScene f={f} a={a} />;
    default: return null;
  }
};

const THEME_D = {bg: DARK, ink: '#EDEBF5', lo: '#9A95B0', panel: '', panel2: '', line: '', edge: '', node: '', accent: PERI, streakA: '', streakB: '', dark: true};

export const Film: React.FC<{tl: TL}> = ({tl}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig(); const lay = layout(width, height);
  const cx = lay.vx + (VW * lay.vs) / 2, cy = lay.vy + (VH * lay.vs) / 2, R = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.05;
  let darkK = 0;
  const lines = tl.spec.lines; let curLine = 0; tl.S.forEach((s, i) => { if (f >= s - 2) curLine = i; });
  const label = tl.spec.labels?.[curLine];
  return <AbsoluteFill style={{background: '#F7F6F9', overflow: 'hidden'}}>
    <Backdrop f={f} W={width} H={height} />
    {tl.acts.map((a, ai) => {
      if (a.dark) return null;
      const fl = f - a.start, d = a.end - a.start; if (fl < -12 || fl > d + 12) return null;
      const inK = ai === 0 ? 1 : ez(fl, -10, 4), outK = ai === tl.acts.length - 1 ? 0 : ez(fl, d - 4, d + 10);
      const op = inK * (1 - outK), bl = (1 - inK) * 10 + outK * 10, sc = lerp(0.97, 1, inK) * lerp(1, 1.03, outK);
      return <div key={ai} style={{position: 'absolute', left: lay.vx, top: lay.vy, width: VW * lay.vs, height: VH * lay.vs, opacity: op, filter: bl > 0.3 ? `blur(${bl}px)` : undefined, transform: `scale(${sc})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, transform: `scale(${lay.vs})`, transformOrigin: '0 0'}}><Act f={fl} a={a} tl={tl} /></div>
      </div>;
    })}
    {/* dark scenes: iris opens from the visual, shrinks back on the next beat */}
    {tl.acts.map((a, ai) => {
      if (!a.dark) return null;
      const fl = f - a.start, d = a.end - a.start; if (fl < -8 || fl > d + 8) return null;
      const inK = ez(fl, -6, 14, Easing.inOut(Easing.cubic)), outK = a.kind === 'end' ? 0 : ez(fl, d - 6, d + 6, Easing.inOut(Easing.cubic)), k = inK * (1 - outK);
      darkK = Math.max(darkK, k > 0.5 ? 1 : 0); if (k <= 0.001) return null;
      const lastLine = a.to; const lockAt = a.lead ? tl.S[lastLine] - a.start - 4 : 6;
      return <AbsoluteFill key={'d' + ai} style={{clipPath: `circle(${R * k}px at ${cx}px ${cy}px)`}}>
        <Liquid f={f} a="rgba(100,104,216,0.5)" b="rgba(244,184,168,0.16)" c="rgba(139,143,232,0.26)" base={DARK} />
        {a.kind === 'turn' ? <div style={{position: 'absolute', left: lay.vx, top: lay.vy, width: VW * lay.vs, height: VH * lay.vs, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><TurnWords f={fl} a={a} tl={tl} size={lay.land ? 150 : 128} /></div> : null}
        {a.kind === 'end' ? <>
          {a.lead ? <div style={{position: 'absolute', left: lay.vx, top: lay.vy, width: VW * lay.vs, height: VH * lay.vs, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - ez(fl, lockAt - 10, lockAt + 4), filter: `blur(${ez(fl, lockAt - 10, lockAt + 4) * 16}px)`}}>
            <div style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: lay.land ? 140 : 124, letterSpacing: '-0.03em', color: '#EDEBF5', transform: `translateY(${(1 - ez(fl, 4, 20)) * 24}px)`, opacity: ez(fl, 4, 20)}}>{a.lead}</div>
          </div> : null}
          <div style={{position: 'absolute', left: lay.vx, top: lay.vy, width: VW * lay.vs, height: VH * lay.vs, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1.04 - 0.04 * ez(fl, lockAt, lockAt + 40)})`, filter: `drop-shadow(0 0 ${46 * ez(fl, lockAt, lockAt + 30)}px rgba(139,143,232,0.55))`}}>
            <div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,124,230,0.32) 0%, rgba(120,124,230,0) 65%)', opacity: ez(fl, lockAt, lockAt + 30)}} />
            <Lockup f={fl} at={lockAt} size={lay.land ? 270 : 250} th={THEME_D} sub={<div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: lay.land ? 54 : 48, color: '#C9C5DA', letterSpacing: '0.01em'}}>fansachat.com</div>} />
          </div>
        </> : null}
      </AbsoluteFill>;
    })}
    {lay.land && label ? <div style={{position: 'absolute', left: 90, top: 128, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT.ui, fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase', color: darkK ? '#C9C5DA' : PERI_D}}><span style={{width: 14, height: 14, borderRadius: 99, background: darkK ? PERI : PERI_D}} />{label}</div> : null}
    <Captions f={f} tl={tl} lay={lay} dark={darkK > 0} />
    {/* grain (anti-banding), deterministic */}
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}><filter id="prodn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2)} /></filter><rect width="100%" height="100%" filter="url(#prodn)" /></svg>
  </AbsoluteFill>;
};
