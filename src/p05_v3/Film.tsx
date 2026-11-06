// P05 v3 production ad "Tired of manual work?" — 4:5 and 5:4, each composed for its own frame (layout() in plan.ts).
// hook (bg A frost) -> problem: Copy. Paste. Repeat. Every booking. By hand. (cursor, doc card, chat bubble, stack, clock)
// -> turn (bg B ring + horizon): the stack collapses into a ring, the ring builds into the prompt bar, the sentence is typed
// -> proof (bg C steelScan + sweep): REAL footage on a glass screen, camera pushes into the diagram, two real result
//    cards fly out beside it -> payoff (white bloom) -> CTA (logo over the horizon).
// Our own type is always a <G> (text guard); every mockup is an <M> (the guard fails on text over a mockup). MIT.
import React from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {hitShake} from '../p05_07/kit/CameraRig';
import {clamp, ease, lerp, noise1, prog} from '../p05_07/kit/curves';
import {F} from '../p05_07/kit/fonts';
import {Corners, LiveBorder, a} from '../p05_07/kit/Living';
import {G, M, TextGuard} from '../p05_07/kit/TextGuard';
import {Cursor} from '../p05_07/kit/ui';
import {Bloom, DARK, FrostGrain, ICE, INK, LIGHT, NIGHT, PAPER, RingHorizon, STEEL, SUB, SteelScan} from './bg';
import * as P from './plan';
import {LiveWord} from './text';

const {T} = P;
type L = P.Lay;
const Abs: React.FC<{b: P.Box; children?: React.ReactNode; style?: React.CSSProperties}> = ({b, children, style}) =>
  <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, ...style}}>{children}</div>;

// ================= 1. HOOK =================
const Hook: React.FC<{f: number; L: L}> = ({f, L}) => {
  const hs = hitShake(f, P.MANUAL_DONE, 0.12); const push = lerp(1, 1.03, prog(f, 0, T.copy, 'softOut'));
  const w = (k: number, gap = true) => { const x = P.HOOK[k];
    return <span style={{display: 'inline-block', margin: gap ? `0 ${Math.round(L.hookSize * 0.13)}px` : 0}}><LiveWord id={`h-${k}`} text={x.t} size={L.hookSize} color={x.hot ? ICE : '#F4F7FA'} font={F.display} reveal={{kind: 'glow', g: P.GH, from: x.from}} life={[0, T.copy]} seed={k} out={T.copy - 6} /></span>; };
  return <div style={{position: 'absolute', left: 0, width: L.W, top: L.H / 2 - L.hookSize * 1.15, textAlign: 'center', transform: `translate(${hs.x}px, ${hs.y}px) scale(${push * hs.s})`}}>
    <div>{w(0)}{w(1)}</div><div style={{marginTop: 10}}>{w(2)}{w(3)}</div>
  </div>;
};

// ================= 2. PROBLEM =================
// mockup slots inside the mockup zone (fractions of L.mock)
const slots = (L: L) => {
  const m = L.mock; const B = (x: number, y: number, w: number, h: number): P.Box => ({x: m.x + x * m.w, y: m.y + y * m.h, w: w * m.w, h: h * m.h});
  return L.wide
    ? {book: B(0, 0.02, 0.5, 0.17), doc: B(0.54, 0.0, 0.46, 0.4), bubble: B(0, 0.46, 0.52, 0.2), stack: B(0.56, 0.47, 0.44, 0.24), clock: B(0, 0.78, 0.46, 0.14)}
    : {book: B(0, 0.02, 0.44, 0.19), doc: B(0.5, 0.0, 0.5, 0.44), bubble: B(0, 0.5, 0.46, 0.22), stack: B(0.52, 0.53, 0.48, 0.27), clock: B(0, 0.8, 0.42, 0.15)};
};
const center = (b: P.Box) => ({x: b.x + b.w / 2, y: b.y + b.h / 2});
const card = (dark = false): React.CSSProperties => ({position: 'absolute', inset: 0, borderRadius: 26, background: dark ? 'linear-gradient(150deg, rgba(36,58,84,.92), rgba(15,26,38,.95))' : PAPER, border: `1.5px solid ${dark ? a(ICE, 0.35) : '#C9D3DD'}`, boxShadow: dark ? `0 24px 50px rgba(0,0,0,.5), 0 0 40px ${a(STEEL, 0.25)}` : '0 24px 50px rgba(0,0,0,.45)', overflow: 'hidden'});

/** a ghost copy of the booking (decorative duplicate, not guarded text: it only ever sits on top of other cards) */
const Ghost: React.FC<{w: number; h: number; o?: number}> = ({w, h, o = 1}) => <div style={{width: w, height: h, borderRadius: 18, background: '#FFFFFF', border: `2px solid ${STEEL}`, boxShadow: `0 14px 30px rgba(0,0,0,.45), 0 0 26px ${a(ICE, 0.55)}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', opacity: o, fontFamily: F.sans, fontWeight: 700, fontSize: Math.min(24, h * 0.32), color: INK, whiteSpace: 'nowrap', overflow: 'hidden'}}>
  <div style={{width: 14, height: 14, borderRadius: 7, background: STEEL, flexShrink: 0}} />New booking · Thu 2:30 PM</div>;

const Problem: React.FC<{f: number; L: L}> = ({f, L}) => {
  const s = slots(L); const col = prog(f, T.collapse - 4, 12, 'inHard'); // collapse into the ring
  const wob = f >= T.every ? Math.sin((f - T.every) / 2.6) * 2.4 * clamp((f - T.every) / 10) : 0;
  const ring = center(L.mock);
  const shrink = (b: P.Box, k: number): React.CSSProperties => { const c = center(b); return {transform: `translate(${(ring.x - c.x) * col}px, ${(ring.y - c.y) * col}px) scale(${lerp(1, 0.1, col)}) rotate(${wob * k}deg)`, opacity: 1 - clamp(col * 3)}; };
  const inP = (f0: number) => prog(f, f0, 16, 'spring');
  // copy: cursor grabs a ghost from the booking card and drops it into the doc card
  const bk = center(s.book), dc = {x: s.doc.x + s.doc.w * 0.5, y: s.doc.y + s.doc.h * 0.62};
  const drag = prog(f, T.copy + 12, 28, 'swift2');
  const gx = lerp(bk.x, dc.x, drag), gy = lerp(bk.y, dc.y, drag) - Math.sin(drag * Math.PI) * 60;
  const cur = f < T.copy + 8 ? {x: lerp(bk.x + 160, bk.x + 30, prog(f, T.copy, 8, 'softOut')), y: lerp(bk.y + 120, bk.y + 10, prog(f, T.copy, 8, 'softOut'))} : f < T.copy + 42 ? {x: gx + 30, y: gy + 10} : {x: lerp(dc.x + 30, dc.x + 120, prog(f, T.copy + 42, 30, 'softOut')), y: dc.y + 30};
  const press = f >= T.copy + 6 && f < T.copy + 42 ? 1 : 0;
  const rowIn = f >= T.copy + 42; // the dropped booking becomes a row of the doc card
  // paste: a ghost flies from the doc card into the chat bubble
  const bb = center(s.bubble); const pp = prog(f, T.paste, 14, 'swift2');
  // repeat: the stack of copies
  const clockMin = Math.round(lerp(P.CLOCK.from, P.CLOCK.to, prog(f, T.repeat + 4, 28, 'inOut')));
  const clockTxt = `${((Math.floor(clockMin / 60) + 11) % 12) + 1}:${String(clockMin % 60).padStart(2, '0')} PM`;
  const gw = Math.min(330, s.stack.w - 30), gh = 60;
  return <>
    {/* booking card (source) */}
    <M id="book"><Abs b={s.book} style={{...shrink(s.book, -1), transform: `${shrink(s.book, -1).transform} scale(${inP(T.copy - 4)})`}}>
      <div style={card(true)} />
      <div style={{position: 'absolute', left: 22, top: 18, right: 18}}>
        <G id="p-book-t" size={28} color="#CFE6F5" font={F.sans} weight={600}>Booking form</G>
        <div style={{marginTop: 8}}><G id="p-book-n" size={34} color="#FFFFFF" font={F.display} weight={800}>New booking</G></div>
        <div style={{marginTop: 6, fontFamily: F.sans, fontSize: 22, color: '#9FB0C3', whiteSpace: 'nowrap'}}>Thu 2:30 PM · intro call</div>
      </div>
      <LiveBorder color={a(ICE, 0.7)} r={26} width={2} speed={70} />
    </Abs></M>
    {/* doc card (target of "Copy.") */}
    <M id="doc"><Abs b={s.doc} style={{...shrink(s.doc, 1), transform: `${shrink(s.doc, 1).transform} scale(${inP(T.copy)})`}}>
      <div style={card()} />
      <div style={{position: 'absolute', left: 24, top: 20, right: 20, fontFamily: F.sans}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}><div style={{width: 30, height: 36, borderRadius: 6, border: '2px solid #9AA7B6', background: '#fff'}} />
          <G id="p-doc-t" size={34} color={INK} font={F.display} weight={800}>Deals</G></div>
        {['Sam Ortiz · Mon', 'Lee Park · Tue', 'Ana Ruiz · Wed'].map((r, i) => <div key={r} style={{marginTop: i ? 10 : 18, display: 'flex', gap: 10, alignItems: 'center', fontSize: 21, color: SUB, whiteSpace: 'nowrap'}}><div style={{width: 18, height: 18, borderRadius: 4, border: '2px solid #B8C3CF'}} />{r}</div>)}
        <div style={{marginTop: 12, height: 52, borderRadius: 12, background: rowIn ? a(STEEL, 0.1 + 0.1 * Math.sin(f / 5)) : 'transparent', border: `2px dashed ${rowIn ? STEEL : '#C9D3DD'}`, display: 'flex', alignItems: 'center', padding: '0 12px'}}>
          {rowIn && <G id="p-doc-row" size={26} color={INK} font={F.sans} weight={700} style={{whiteSpace: 'nowrap', transform: `scale(${prog(f, T.copy + 42, 12, 'spring')})`, transformOrigin: '0 50%'}}>New booking · Thu</G>}
        </div>
      </div>
    </Abs></M>
    {/* chat bubble (target of "Paste.") */}
    {f >= T.paste && <M id="bubble"><Abs b={s.bubble} style={{...shrink(s.bubble, -1), transform: `${shrink(s.bubble, -1).transform} scale(${prog(f, T.paste + 12, 16, 'spring')})`, transformOrigin: '10% 90%'}}>
      <div style={{...card(), borderRadius: '26px 26px 26px 6px'}} />
      <div style={{position: 'absolute', left: 22, top: 16, right: 16}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.sans}}><div style={{width: 34, height: 34, borderRadius: 9, background: '#3D6E9E'}} />
          <G id="p-bub-c" size={26} color={SUB} font={F.sans} weight={700}>#sales</G></div>
        <div style={{marginTop: 8}}><G id="p-bub-m" size={28} color={INK} font={F.sans} weight={600} style={{whiteSpace: 'nowrap'}}>New booking, Thu 2:30</G></div>
      </div>
    </Abs></M>}
    {/* clock: late night, by hand */}
    {f >= T.repeat && <M id="clock"><Abs b={s.clock} style={{...shrink(s.clock, 1), transform: `${shrink(s.clock, 1).transform} scale(${prog(f, T.repeat, 14, 'spring')})`}}>
      <div style={card(true)} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px'}}>
        <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" stroke={ICE} strokeWidth="3" fill="none" />
          <line x1="28" y1="28" x2={28 + 15 * Math.sin((clockMin / 60) * Math.PI * 2)} y2={28 - 15 * Math.cos((clockMin / 60) * Math.PI * 2)} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="28" x2={28 + 10 * Math.sin((clockMin / 720) * Math.PI * 2)} y2={28 - 10 * Math.cos((clockMin / 720) * Math.PI * 2)} stroke={ICE} strokeWidth="4" strokeLinecap="round" /></svg>
        <G id="p-clock" size={44} color="#FFFFFF" font={F.display} weight={800} style={{whiteSpace: 'nowrap'}}>{clockTxt}</G>
      </div>
    </Abs></M>}
    {/* the stack of copies (decorative duplicates) */}
    {f >= T.repeat && <div style={{position: 'absolute', left: s.stack.x, top: s.stack.y, ...shrink(s.stack, 2)}}>
      {P.STACK.map((sf, i) => f >= sf && <div key={i} style={{position: 'absolute', left: 6 + i * 7, top: s.stack.h - gh - 10 - i * 18, transform: `rotate(${(i % 2 ? 2.5 : -2) + wob * (i - 2.5) * 0.6}deg) scale(${lerp(1.18, 1, prog(f, sf, 6, 'snapOut'))})`}}><Ghost w={gw} h={gh} o={0.65 + i * 0.07} /></div>)}
    </div>}
    {/* the ghost in flight (copy, paste) */}
    {f >= T.copy + 6 && f < T.copy + 44 && <div style={{position: 'absolute', left: gx - 130, top: gy - 28, transform: `rotate(${Math.sin(drag * Math.PI) * -6}deg) scale(${lerp(0.9, 0.75, drag)})`}}><Ghost w={260} h={56} /></div>}
    {f >= T.paste && f < T.paste + 16 && <div style={{position: 'absolute', left: lerp(dc.x, bb.x, pp) - 130, top: lerp(dc.y, bb.y, pp) - 28 - Math.sin(pp * Math.PI) * 50, transform: `scale(${lerp(0.75, 0.6, pp)})`, opacity: 1 - clamp((pp - 0.85) / 0.15)}}><Ghost w={260} h={56} /></div>}
    {f < T.copy + 80 && <Cursor x={cur.x} y={cur.y} press={press} clicks={[T.copy + 8]} color="#fff" ring={ICE} o={1 - clamp((f - T.copy - 60) / 16)} />}
    {f >= T.paste && f < T.paste + 30 && <Cursor x={lerp(dc.x + 120, bb.x + 60, prog(f, T.paste - 4, 10, 'swift2'))} y={lerp(dc.y + 30, bb.y + 20, prog(f, T.paste - 4, 10, 'swift2'))} press={0} clicks={[T.paste + 4]} color="#fff" ring={ICE} o={1 - clamp((f - T.paste - 20) / 10)} />}
  </>;
};
const WORDS: [string, string[], number, number][] = [['copy', ['Copy.'], T.copy, T.paste], ['paste', ['Paste.'], T.paste, T.repeat], ['repeat', ['Repeat.'], T.repeat, T.every], ['every', ['Every booking.', 'By hand.'], T.every, T.turn]];
const ProblemWords: React.FC<{f: number; L: L}> = ({f, L}) => {
  const w = WORDS.find(([, , a0, a1]) => f >= a0 && f < a1); if (!w) return null;
  const [id, lines, a0, a1] = w; const size = L.wide ? (id === 'every' ? 80 : 100) : L.wordSize;
  const words = lines.flatMap((ln, li) => ln.split(' ').map((t, k) => ({t, li, k})));
  const tz = L.text; const out = a1 === T.turn ? T.collapse - 6 : a1 - 5;
  return <div style={{position: 'absolute', left: tz.x, top: L.wide ? tz.y + 40 : tz.y + 14, width: tz.w, textAlign: 'left'}}>
    {lines.map((ln, li) => <div key={li} style={{display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26}}>{words.filter((x) => x.li === li).map((x, n) => {
      const idx = words.indexOf(x);
      return <LiveWord key={n} id={`w-${id}-${idx}`} text={x.t} size={size} color={id === 'every' && x.t === 'hand.' ? ICE : '#F4F7FA'} font={F.display} reveal={{kind: 'rise', f0: a0 + idx * 4, stagger: 2, dur: 12}} life={[a0, a1]} seed={idx + 3} out={out} />; })}</div>)}
  </div>;
};

// ================= 3. TURN: ring -> prompt bar (trim path + glow + 96/95 % rims) =================
const Turn: React.FC<{f: number; L: L}> = ({f, L}) => {
  const c0 = center(L.mock), c1 = center(L.bar);
  const mv = prog(f, T.turn, 22, 'swift2'), morph = prog(f, T.turn + 16, T.bar - T.turn - 10, 'inOut');
  const trim = prog(f, T.turn + 14, T.bar - T.turn - 4, 'inOut'), fill = prog(f, T.bar - 6, 14, 'softOut');
  const cx = lerp(c0.x, c1.x, mv), cy = lerp(c0.y, c1.y, mv);
  const w = lerp(150, L.bar.w, morph), h = lerp(150, L.bar.h, morph), rx = h / 2;
  const appear = prog(f, T.collapse, 10, 'spring');
  const enter = f >= T.enter ? 1 - ease((f - T.enter) / 12, 'snapOut') : 0; // Enter flash
  const fly = prog(f, T.proof - 10, 10, 'inHard');
  const per = 2 * (w - 2 * rx) + 2 * Math.PI * rx;
  const sc = appear * lerp(1, 1.12, fly);
  return <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: `scale(${sc})`, opacity: 1 - fly}}>
    <M id="bar"><div style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}>
      <svg width={w + 80} height={h + 80} style={{position: 'absolute', left: -40, top: -40, overflow: 'visible'}}>
        <defs><filter id="gl" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <rect x={40} y={40} width={w} height={h} rx={rx} fill={NIGHT} opacity={fill * 0.92} />
        {/* glow stroke + trim-path build-on */}
        <rect x={40} y={40} width={w} height={h} rx={rx} fill="none" stroke={ICE} strokeWidth={10} filter="url(#gl)" strokeDasharray={`${per * Math.max(trim, 0.08)} ${per}`} strokeDashoffset={-f * 4} opacity={0.75} />
        <rect x={40} y={40} width={w} height={h} rx={rx} fill="none" stroke="#E8FBFF" strokeWidth={3} strokeDasharray={`${per * Math.max(trim, 0.08)} ${per}`} strokeDashoffset={-f * 4} />
        {/* rim duplicates at 96 % and 95 % */}
        {[0.96, 0.95].map((k, i) => <rect key={k} x={40 + (w * (1 - k)) / 2} y={40 + (h * (1 - k)) / 2} width={w * k} height={h * k} rx={(h * k) / 2} fill="none" stroke={ICE} strokeWidth={1.4} opacity={fill * (i ? 0.25 : 0.4)} />)}
        <rect x={40} y={40} width={w} height={h} rx={rx} fill="#FFFFFF" opacity={enter * 0.35} />
      </svg>
      {fill > 0.5 && <>
        {/* icon at the left (sparkle), send button at the right */}
        <div style={{position: 'absolute', left: h * 0.18, top: h / 2 - 34, width: 68, height: 68, borderRadius: 34, background: a(STEEL, 0.25), border: `2px solid ${a(ICE, 0.6)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${prog(f, T.bar, 14, 'spring')}) rotate(${f * 0.8}deg)`}}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={ICE} /></svg></div>
        <div style={{position: 'absolute', right: h * 0.16, top: h / 2 - 40, width: 80, height: 80, borderRadius: 40, background: STEEL, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${24 + enter * 50}px ${ICE}`, transform: `scale(${prog(f, T.bar + 6, 14, 'spring') * (1 - enter * 0.12)})`}}>
          <svg width="38" height="38" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <div style={{position: 'absolute', left: h * 0.18 + 92, right: h * 0.16 + 100, top: 0, bottom: 0, display: 'flex', alignItems: 'center'}}>
          <div style={{display: 'flex', flexWrap: 'wrap', columnGap: L.promptSize * 0.26, rowGap: 4}}>
            {P.PROMPT.split(' ').map((t, i, all) => <LiveWord key={i} id={`pr-${i}`} text={t} size={L.promptSize} color="#F4F7FA" font={F.sans} weight={600} reveal={{kind: 'glow', g: P.GP, from: all.slice(0, i).reduce((n, x) => n + x.length + 1, 0)}} life={[P.GP.start, T.proof]} seed={i} />)}
          </div>
        </div>
      </>}
    </div></M>
  </div>;
};

// ================= 4. PROOF: real footage on a glass screen, result cards beside it =================
const Footage: React.FC<{f: number; bw: number; bh: number}> = ({f, bw, bh}) => {
  const k = prog(f, T.push, T.built - T.push + 30, 'inOut');
  const vw = lerp(P.VIEW_WIDE.w, P.VIEW_DIAG.w, k), cx = lerp(P.VIEW_WIDE.cx, P.VIEW_DIAG.cx, k), cy = lerp(P.VIEW_WIDE.cy, P.VIEW_DIAG.cy, k);
  let sw = vw, sh = vw * (bh / bw); if (sh > 1080) { sh = 1080; sw = sh * (bw / bh); }
  const x0 = clamp(cx - sw / 2, 0, 1920 - sw), y0 = clamp(cy - sh / 2, 0, 1080 - sh); const s = bw / sw;
  return <Freeze frame={0}><OffthreadVideo src={staticFile('real/P05_ui.webm')} trimBefore={Math.round(P.srcT(f) * 60)} muted style={{position: 'absolute', left: -x0 * s, top: -y0 * s, width: 1920 * s, height: 1080 * s}} /></Freeze>;
};
const Proof: React.FC<{f: number; L: L}> = ({f, L}) => {
  const fly = prog(f, T.proof, 34, 'snapOut'); const sm = L.wide ? 0 : prog(f, T.built - 26, 20, 'inOut');
  const b = {x: lerp(L.screen.x, L.screenSmall.x, sm), y: lerp(L.screen.y, L.screenSmall.y, sm), w: lerp(L.screen.w, L.screenSmall.w, sm), h: lerp(L.screen.h, L.screenSmall.h, sm)};
  const yaw = lerp(L.wide ? -16 : 0, L.wide ? -5 : 0, fly) + noise1(f / 60, 4) * 1.2, pitch = lerp(22, 3, fly) + noise1(f / 50, 8) * 0.8;
  const pad = 12; const out = prog(f, T.payoff - 10, 10, 'inHard');
  return <>
    <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
      <M id="screen"><div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, transform: `translateY(${(1 - fly) * 240}px) rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${lerp(0.82, 1, fly) * (1 - out * 0.08)})`, opacity: clamp(fly * 3) * (1 - out)}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'linear-gradient(145deg, rgba(255,255,255,.9), rgba(205,220,234,.65))', border: '1.5px solid rgba(255,255,255,.95)', boxShadow: `0 50px 100px rgba(20,30,70,.28), 0 10px 26px rgba(20,30,70,.16), 0 0 60px ${a(STEEL, 0.25)}`}} />
        <div style={{position: 'absolute', left: pad, top: pad, right: pad, bottom: pad, borderRadius: 20, overflow: 'hidden', background: '#F6F6F8'}}><Footage f={f} bw={b.w - 2 * pad} bh={b.h - 2 * pad} /></div>
        <LiveBorder color={a(STEEL, 0.7)} r={30} width={3} speed={60} />
      </div></M>
    </div>
    <ResultCard f={f} at={T.card1} b={L.cards[0]} from={b} kind="notion" out={out} L={L} />
    <ResultCard f={f} at={T.card2} b={L.cards[1]} from={b} kind="slack" out={out} L={L} />
  </>;
};
const ResultCard: React.FC<{f: number; at: number; b: P.Box; from: P.Box; kind: 'notion' | 'slack'; out: number; L: L}> = ({f, at, b, from, kind, out, L}) => {
  if (f < at) return null;
  // flies out of the screen's near edge (it starts small, beside the screen, and never crosses it)
  const p = prog(f, at, 22, 'snapOut'); const tc = center(b);
  const dx = L.wide ? 40 : 0, dy = L.wide ? 0 : -30;
  const x = tc.x + dx * (1 - p) - b.w / 2, y = tc.y + dy * (1 - p) - b.h / 2; void from;
  const t0 = at + 18; // text rises once the card has landed beside the screen
  const sz = L.wide ? 1 : 1;
  return <M id={`card-${kind}`}><div style={{position: 'absolute', left: x, top: y, width: b.w, height: b.h, transform: `scale(${lerp(0.7, 1, p)}) rotate(${(1 - p) * (kind === 'notion' ? -5 : 5)}deg)`, opacity: clamp(p * 4) * (1 - out)}}>
    <div style={{...card(), boxShadow: '0 30px 60px rgba(20,30,70,.22), 0 6px 16px rgba(20,30,70,.12)', border: '1.5px solid #D5DEE7'}} />
    <LiveBorder color={a(STEEL, 0.55)} r={26} width={2} speed={80} phase={kind === 'notion' ? 0 : 180} />
    {kind === 'notion' ? <div style={{position: 'absolute', left: 26, top: 22, right: 22}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}><div style={{width: 26, height: 32, borderRadius: 5, border: '2px solid #9AA7B6'}} />
        {f >= t0 && <LiveWord id="r-n-lab" text="Notion page" size={26 * sz} color={SUB} font={F.sans} weight={600} reveal={{kind: 'rise', f0: t0}} life={[t0, T.payoff]} seed={1} />}</div>
      <div style={{marginTop: 12}}>{f >= t0 && <LiveWord id="r-n-title" text={P.PERSON} size={L.wide ? 46 : 44} color={INK} font={F.display} weight={800} reveal={{kind: 'rise', f0: t0 + 4}} life={[t0, T.payoff]} seed={2} />}</div>
      <div style={{marginTop: 4}}>{f >= t0 && <LiveWord id="r-n-co" text={P.COMPANY} size={32} color="#26476E" font={F.sans} weight={600} reveal={{kind: 'rise', f0: t0 + 8}} life={[t0, T.payoff]} seed={3} />}</div>
      <div style={{marginTop: 14, display: 'flex', gap: 10}}>{['Call time', 'Prep list'].map((x, i) => <div key={x} style={{padding: '6px 14px', borderRadius: 999, background: a(STEEL, 0.1), border: `1.5px solid ${a(STEEL, 0.35)}`, fontFamily: F.sans, fontSize: 21, fontWeight: 600, color: STEEL, opacity: clamp((f - t0 - 10 - i * 4) / 6), whiteSpace: 'nowrap'}}>{x}</div>)}</div>
    </div> : <div style={{position: 'absolute', left: 22, top: 22, right: 20, display: 'flex', gap: 16}}>
      <div style={{width: 60, height: 60, borderRadius: 14, background: '#E3F3FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Img src={staticFile('logo-fansa.png')} style={{width: 50, height: 50}} /></div>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>{f >= t0 && <LiveWord id="r-s-who" text="Slack message" size={26} color={SUB} font={F.sans} weight={700} reveal={{kind: 'rise', f0: t0}} life={[t0, T.payoff]} seed={4} />}</div>
        <div style={{marginTop: 8, display: 'flex', flexWrap: 'wrap', columnGap: 8, rowGap: 2}}>
          {f >= t0 && P.CHAT.split(' ').map((t, i) => <LiveWord key={i} id={`r-s-${i}`} text={t} size={L.wide ? 30 : 29} color={INK} font={F.sans} weight={600} reveal={{kind: 'rise', f0: t0 + 3 + i * 2, stagger: 1, dur: 10}} life={[t0, T.payoff]} seed={i + 5} />)}
        </div>
      </div>
    </div>}
  </div></M>;
};
const CAPS: [string, string, number, number][] = [['cap1', 'Built from one sentence.', T.proof + 16, T.cap2], ['cap2', 'Real Notion page. Real Slack message.', T.cap2, T.payoff]];
const Caption: React.FC<{f: number; L: L}> = ({f, L}) => {
  const c = CAPS.find(([, , a0, a1]) => f >= a0 && f < a1); if (!c) return null;
  const [id, txt, a0, a1] = c; const size = L.capSize; const tz = L.text;
  return <div style={{position: 'absolute', left: tz.x, top: tz.y + (L.wide ? 40 : 30), width: tz.w, display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26, rowGap: 0}}>
    {txt.split(' ').map((t, i) => <LiveWord key={i} id={`${id}-${i}`} text={t} size={size} color={/^(sentence\.|Real)$/.test(t) ? STEEL : INK} font={F.display} reveal={{kind: 'rise', f0: a0 + i * 3}} life={[a0, a1]} seed={i} out={a1 - 6} />)}
  </div>;
};

// ================= 5. PAYOFF + 6. CTA =================
const Payoff: React.FC<{f: number; L: L}> = ({f, L}) => {
  const lines = L.wide ? [['Make', 'your', 'work', 'life'], ['hassle-free.']] : [['Make', 'your'], ['work', 'life'], ['hassle-free.']];
  const size = L.wide ? 104 : 124; let n = 0; const hs = hitShake(f, T.payoff, 0.1);
  const out = T.cta - 8;
  return <div style={{position: 'absolute', left: 0, width: L.W, top: L.H / 2 - (lines.length * size * 1.1) / 2, transform: `translate(${hs.x}px, ${hs.y}px)`}}>
    {lines.map((ln, li) => <div key={li} style={{display: 'flex', justifyContent: 'center', columnGap: size * 0.24}}>{ln.map((t) => { const i = n++;
      return <LiveWord key={t} id={`pay-${i}`} text={t} size={size} color={t === 'hassle-free.' ? STEEL : INK} font={F.display} reveal={{kind: 'rise', f0: T.payoff + 4 + i * 4, stagger: 2, dur: 14}} life={[T.payoff, T.cta]} seed={i} out={out} />; })}</div>)}
  </div>;
};
const Cta: React.FC<{f: number; L: L}> = ({f, L}) => {
  const up = prog(f, T.cta, 40, 'snapOut'); const big = L.wide ? 150 : 180; const hs = hitShake(f, T.cta, 0.08);
  const top = L.H * (L.wide ? 0.2 : 0.24);
  const sweep = ((f - T.pill - 10) % 70) / 30;
  return <div style={{position: 'absolute', left: 0, width: L.W, top, textAlign: 'center', transform: `translate(${hs.x}px, ${hs.y + (1 - up) * 140}px) scale(${lerp(1, 1.03, prog(f, T.cta, 100, 'softOut'))})`}}>
    <div style={{display: 'inline-flex', width: big, height: big, borderRadius: big * 0.26, background: '#FFFFFF', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${a(STEEL, 0.7)}, 0 0 30px ${a(ICE, 0.5)}`, transform: `scale(${prog(f, T.cta, 26, 'spring')})`, opacity: clamp(up * 3)}}>
      <Img src={staticFile('logo-fansa.png')} style={{width: '82%', height: '82%'}} /></div>
    <div style={{marginTop: 26}}><LiveWord id="cta-word" text="FansaChat" size={L.wide ? 96 : 104} color="#FFFFFF" font={F.display} reveal={{kind: 'rise', f0: T.cta + 10, stagger: 2}} life={[T.cta, T.end]} seed={1} /></div>
    <div style={{marginTop: L.wide ? 30 : 44, display: 'inline-block', position: 'relative', overflow: 'hidden', borderRadius: 999, transform: `scale(${prog(f, T.pill, 18, 'spring')})`, boxShadow: `0 0 50px ${a(STEEL, 0.55)}`}}>
      <div style={{padding: '20px 44px', background: STEEL, display: 'flex', columnGap: 12}}>
        <LiveWord id="cta-pill" text="Join the waitlist" size={L.wide ? 40 : 42} color="#FFFFFF" font={F.sans} weight={700} reveal={{kind: 'rise', f0: T.pill + 4, stagger: 1, dur: 10}} life={[T.pill, T.end]} seed={2} />
      </div>
      {sweep >= 0 && sweep <= 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 140 - 30}%`, width: '20%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-20deg)'}} />}
    </div>
    <div style={{marginTop: 22}}><LiveWord id="cta-url" text="fansachat.com" size={L.wide ? 40 : 44} color={ICE} font={F.sans} weight={600} reveal={{kind: 'rise', f0: T.pill + 14, stagger: 1, dur: 10}} life={[T.pill, T.end]} seed={3} /></div>
  </div>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const L = P.layout(W, H);
  const sec = f < T.copy ? 'hook' : f < T.turn ? 'problem' : f < T.proof ? 'turn' : f < T.payoff ? 'proof' : f < T.cta ? 'payoff' : 'cta';
  const dark = sec !== 'proof' && sec !== 'payoff';
  return <AbsoluteFill style={{background: dark ? NIGHT : PAPER}}>
    {(sec === 'hook' || sec === 'problem') && <FrostGrain push={prog(f, 0, T.turn, 'softOut')} />}
    {sec === 'turn' && <RingHorizon ring={prog(f, T.turn, 24, 'softOut')} cy={H / 2} r={Math.min(W, H) * 0.44} charge={prog(f, T.bar, T.enter - T.bar, 'linear')} />}
    {sec === 'proof' && <SteelScan />}
    {sec === 'payoff' && <Bloom k={prog(f, T.payoff, 18, 'snapOut')} />}
    {sec === 'cta' && <RingHorizon ring={0.35 * prog(f, T.cta, 30, 'softOut')} cy={H * 0.36} r={Math.min(W, H) * 0.3} horizon={prog(f, T.cta, 40, 'snapOut')} />}
    {sec === 'hook' && <Hook f={f} L={L} />}
    {sec === 'problem' && <><Problem f={f} L={L} /><ProblemWords f={f} L={L} /></>}
    {(sec === 'turn' || (sec === 'problem' && f >= T.collapse)) && <Turn f={f} L={L} />}
    {sec === 'proof' && <><Proof f={f} L={L} /><Caption f={f} L={L} /></>}
    {sec === 'payoff' && <Payoff f={f} L={L} />}
    {sec === 'cta' && <Cta f={f} L={L} />}
    <Corners p={dark ? DARK : LIGHT} />
    {f >= T.cta && <AbsoluteFill style={{background: '#FFFFFF', opacity: 0.6 * (1 - clamp((f - T.cta) / 10)), pointerEvents: 'none'}} />}
    <TextGuard every={4} label="P05V3" />
  </AbsoluteFill>;
};
