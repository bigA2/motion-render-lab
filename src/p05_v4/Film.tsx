// P05 v4 "Tired of manual work?" — one continuous camera through four worlds (see plan.ts). Every element lives at a
// world position; the camera (cam: x, y, zoom, roll) travels to it. Whips get directional motion blur from the camera
// speed. Our own type is always a guarded <G> while it is meant to be read (Tx), every card is an <M>. MIT, our own code.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease, lerp, prog, rnd} from '../p05_07/kit/curves';
import {F} from '../p05_07/kit/fonts';
import {a} from '../p05_07/kit/Living';
import {G, M, TextGuard} from '../p05_07/kit/TextGuard';
import {Cursor, Logo} from '../p05_07/kit/ui';
import {cursorPath} from '../p05_07/kit/events';
import {AMBER, DotWorld, GridFly, Horizon, ICE, INK, Leaks, MeshFlow, MUTED, NIGHT, Particles, Refract, STEEL} from './bg';
import * as P from './plan';

const {T, s} = P;
type L = P.Lay;
const px = (n: number) => `${n.toFixed(2)}px`;

// ---------- text: guarded while it is meant to be read ----------
const Tx: React.FC<{id: string; on?: boolean; size: number; color: string; font?: string; weight?: number; anim?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({id, on = true, size, color, font = F.sans, weight = 600, anim, style, children}) =>
  on ? <G id={id} size={size} color={color} font={font} weight={weight} anim={anim} style={{lineHeight: 1.15, whiteSpace: 'pre', ...style}}>{children}</G>
    : <span style={{display: 'inline-block', fontSize: size, color, fontFamily: font, fontWeight: weight, lineHeight: 1.15, whiteSpace: 'pre', ...style}}>{children}</span>;

// world-positioned box (centre x, y)
const At: React.FC<{x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w = 0, h = 0, style, children}) =>
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w || undefined, height: h || undefined, ...style}}>{children}</div>;

const glass = (dark = true, r = 30): React.CSSProperties => ({
  borderRadius: r, overflow: 'hidden', position: 'relative',
  background: dark ? 'linear-gradient(160deg, rgba(34,54,82,0.96) 0%, rgba(13,22,36,0.97) 60%, rgba(10,17,28,0.98) 100%)' : 'linear-gradient(165deg, #FFFFFF 0%, #F3F6FA 100%)',
  border: `1.5px solid ${dark ? 'rgba(139,233,255,0.30)' : 'rgba(255,255,255,0.95)'}`,
  boxShadow: dark ? '0 60px 110px rgba(0,0,0,0.6), 0 14px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -30px 60px rgba(139,233,255,0.05)'
    : '0 60px 110px rgba(0,0,0,0.5), 0 14px 30px rgba(0,0,0,0.3), inset 0 1px 0 #fff',
});
const Spec: React.FC<{f0: number; dur?: number}> = ({f0, dur = 40}) => { const f = useCurrentFrame(); const t = (f - f0) / dur; if (t < 0 || t > 1) return null;
  return <div style={{position: 'absolute', top: '-20%', bottom: '-20%', left: `${-40 + t * 160}%`, width: '28%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none'}} />; };

// typed text with caret
const typed = (ty: P.Type, f: number) => ty.text.slice(0, P.shown(ty, f));
const Caret: React.FC<{on: boolean; c: string; h: number}> = ({on, c, h}) => { const f = useCurrentFrame(); return on ? <span style={{display: 'inline-block', width: 3, height: h, background: c, marginLeft: 3, verticalAlign: 'middle', opacity: Math.floor(f / 15) % 2 ? 0.25 : 1}} /> : null; };

// ======================================================= WORLD 1 =======================================================
const HOOK_SIZE = (L: L) => (L.wide ? 150 : 170);
const hookLines = (L: L) => L.wide ? [[{t: 'Tired', f0: 0}, {t: 'of', f0: 9}], [{t: 'manual', f0: T.manual - 8, hot: true}, {t: 'work?', f0: T.manual + 8}]]
  : [[{t: 'Tired', f0: 0}, {t: 'of', f0: 9}], [{t: 'manual', f0: T.manual - 8, hot: true}], [{t: 'work?', f0: T.manual + 8}]];
const lineY = (L: L, i: number) => (L.wide ? [-175, 0][i] : [-205, 0, 205][i]);

const Hook: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = HOOK_SIZE(L); const out = prog(f, s(0.96), 8, 'linear');
  return <>{hookLines(L).map((line, li) => <At key={li} x={0} y={lineY(L, li)} w={2400} h={S * 1.3} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: S * 0.26}}>
    {line.map((w, wi) => {
      const hot = 'hot' in w && w.hot; const p = prog(f, w.f0, hot ? 8 : 12, hot ? 'snapOut' : 'softOut');
      if (p <= 0) return <span key={wi} style={{fontSize: S, fontFamily: F.display, fontWeight: 800, opacity: 0, whiteSpace: 'pre'}}>{w.t}</span>;
      // arrival from depth (small + blurred) or, for "manual", a slam from in front of the camera
      const sc = hot ? lerp(2.1, 1, p) : lerp(0.55, 1, p); const bl = (1 - p) * (hot ? 10 : 16);
      // scatter: "manual" breaks into sparks as the box grows; the others fall out of frame
      const gone = hot ? prog(f, T.box, 9, 'linear') : out;
      const o = clamp(p * 1.6) * (1 - gone);
      const sel = hot ? prog(f, T.manual + 1, 7, 'snapOut') * (1 - prog(f, T.box, 3, 'linear')) : 0;
      const letters = [...w.t].map((ch, j) => { const r1 = rnd(j * 7 + li), r2 = rnd(j * 13 + 3);
        const dx = hot ? gone * (r1 - 0.5) * 500 : 0, dy = hot ? gone * (r2 - 0.6) * 380 : gone * (li - (L.wide ? 0.5 : 1)) * 160;
        return <span key={j} style={{display: 'inline-block', transform: `translate(${px(dx)}, ${px(dy)}) rotate(${(hot ? gone * (r1 - 0.5) * 90 : 0).toFixed(1)}deg)`, textShadow: hot ? `0 0 ${30 * (1 - p) + 18}px ${a(ICE, 0.55)}` : undefined}}>{ch}</span>; });
      return <span key={wi} style={{position: 'relative', display: 'inline-block', transform: `scale(${sc.toFixed(4)})`, filter: bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : undefined, opacity: o}}>
        <Tx id={`hook-${w.t}`} size={S} color={hot ? ICE : '#FFFFFF'} font={F.display} weight={800} anim={p < 1 || gone > 0 || bl > 0.3} style={{letterSpacing: '-0.03em'}}>{letters}</Tx>
        {sel > 0 && <div style={{position: 'absolute', inset: `${-S * 0.06}px ${-S * 0.1}px`, border: `4px solid ${ICE}`, borderRadius: 6, transform: `scale(${lerp(1.18, 1, sel)})`, opacity: sel, boxShadow: `0 0 30px ${a(ICE, 0.5)}`, background: a(STEEL, 0.18)}}>
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v], k) => <div key={k} style={{position: 'absolute', left: `calc(${u * 100}% - 9px)`, top: `calc(${v * 100}% - 9px)`, width: 18, height: 18, background: '#fff', border: `3px solid ${STEEL}`, borderRadius: 3}} />)}
        </div>}
      </span>;
    })}
  </At>)}</>;
};

// the selection box grows into the booking card (3D flip as it lands)
const manualRect = (L: L) => { const S = HOOK_SIZE(L); return {x: P.MX(L), y: 0, w: 6 * 0.6 * S + S * 0.2, h: S * 1.25}; };
const Row: React.FC<{k: string; v: React.ReactNode; f: number; at: number; on: boolean; hl?: number; dark?: boolean}> = ({k, v, f, at, on, hl = 0, dark = true}) => {
  const p = prog(f, at, 12, 'snapOut');
  return <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '16px 0', borderTop: `1.5px solid ${dark ? 'rgba(139,233,255,0.12)' : '#E3E8EE'}`, opacity: p, transform: `translateY(${px((1 - p) * 26)})`}}>
    <div style={{width: 190, flexShrink: 0}}><Tx id={`k-${k}`} on={on && p > 0.99} size={30} color={dark ? MUTED : '#5A6B7E'} weight={500}>{k}</Tx></div>
    <div style={{position: 'relative'}}>{hl > 0 && <div style={{position: 'absolute', inset: '-6px -12px', borderRadius: 10, background: a(STEEL, 0.75 * hl)}} />}
      <div style={{position: 'relative'}}>{v}</div></div>
  </div>;
};

const BookingCard: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L).card, r0 = manualRect(L); const g = prog(f, T.box, T.card - T.box, 'swift');
  if (f < T.box) return null;
  const w = lerp(r0.w, P.CARD.w, g), h = lerp(r0.h, P.CARD.h, g), x = lerp(r0.x, S.x, g), y = lerp(r0.y, S.y, g);
  const flip = (1 - g) * 38; const fill = prog(f, T.card - 10, 14, 'softOut'); const on = f >= T.card + 12 && f < T.whip1;
  const hl = prog(f, T.click + 7, 5, 'snapOut');
  const cur = cursorPath([{f: T.card + 2, x: 760, y: 520}, {f: T.click - 1, x: 330, y: 150}, {f: T.click, x: 330, y: 150, click: true}, {f: T.click + 7, x: 332, y: 151, click: true}, {f: T.lift + 10, x: 520, y: 420}]);
  const cp = cur.at(f); const co = clamp(prog(f, T.card + 2, 8) * (1 - prog(f, T.lift + 4, 8)));
  return <At x={x} y={y} w={w} h={h} style={{perspective: 1400}}>
    <M id="booking" style={{width: w, height: h}}>
      <div style={{width: w, height: h, transform: `rotateY(${flip.toFixed(2)}deg) rotateX(${(flip * 0.3).toFixed(2)}deg)`, ...glass(true), border: `${lerp(4, 1.5, g)}px solid ${a(ICE, lerp(1, 0.3, g))}`, background: g < 1 ? `linear-gradient(160deg, ${a('#22364F', 0.4 + 0.56 * g)}, ${a('#0D1624', 0.4 + 0.57 * g)})` : glass(true).background}}>
        <div style={{padding: '30px 40px', opacity: fill}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12}}>
            <div style={{width: 46, height: 46, borderRadius: 12, background: `linear-gradient(140deg, ${ICE}, ${STEEL})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CalIcon /></div>
            <Tx id="bk-title" on={on} size={38} color="#FFFFFF" weight={700}>Booking form</Tx>
            <div style={{marginLeft: 'auto', padding: '6px 16px', borderRadius: 999, background: a(AMBER, 0.2), border: `1.5px solid ${a(AMBER, 0.6)}`}}><Tx id="bk-new" on={on} size={28} color={AMBER} weight={700}>New</Tx></div>
          </div>
          <Row k="Name" f={f} at={T.card - 4} on={on} hl={hl} v={<Tx id="bk-name" on={on} size={36} color="#FFFFFF" weight={700}>{P.PERSON}</Tx>} />
          <Row k="Company" f={f} at={T.card + 2} on={on} v={<Tx id="bk-co" on={on} size={34} color="#E6EEF6">{P.COMPANY}</Tx>} />
          <Row k="Call time" f={f} at={T.card + 8} on={on} v={<Tx id="bk-call" on={on} size={34} color="#E6EEF6">{P.CALL}</Tx>} />
        </div>
        <Spec f0={T.card} />
      </div>
      {co > 0 && <Cursor x={cp.x} y={cp.y} press={cp.press} clicks={cur.clicks} color="#FFFFFF" ring={ICE} o={co} />}
    </M>
  </At>;
};
const CalIcon = () => <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="#06101C" strokeWidth="2.4" /><path d="M3 10h18M8 3v4M16 3v4" stroke="#06101C" strokeWidth="2.4" strokeLinecap="round" /></svg>;

const DealsDoc: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L).doc; const p = prog(f, T.doc - 16, 16, 'slideIn'); if (p <= 0) return null;
  const bl = (1 - p) * 22; const on = f >= T.doc + 6 && f < T.whip2; const dropped = f >= T.doc + 6;
  const co = typed(P.TY.doc, f); const typing = P.shown(P.TY.doc, f) < P.TY.doc.text.length && f >= P.TY.doc.f0;
  return <At x={S.x + (1 - p) * 900} y={S.y} w={P.CARD.w} h={520}>
    <M id="deals" style={{width: P.CARD.w, height: 520}}>
      <div style={{width: P.CARD.w, height: 520, ...glass(false), filter: bl > 0.4 ? `blur(${bl.toFixed(1)}px)` : undefined}}>
        <div style={{padding: '30px 40px', color: INK}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14}}>
            <div style={{fontSize: 40}}>📄</div><Tx id="dl-title" on={on} size={40} color={INK} font={F.display} weight={800}>Deals</Tx>
            <div style={{marginLeft: 'auto'}}><Tx id="dl-by" on={on} size={28} color="#5A6B7E" weight={500}>edited by hand</Tx></div>
          </div>
          {[['Sam Ortiz', 'Lumen Labs'], ['Ivy Chen', 'Parcel Co']].map(([n, c], i) => <div key={i} style={{display: 'flex', gap: 24, padding: '14px 0', borderTop: '1.5px solid #E3E8EE', opacity: 0.55}}>
            <span style={{width: 300, fontSize: 30, fontFamily: F.sans, color: '#3A4A5C'}}>{n}</span><span style={{fontSize: 30, fontFamily: F.sans, color: '#3A4A5C'}}>{c}</span></div>)}
          <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderTop: '1.5px solid #E3E8EE', borderBottom: '1.5px solid #E3E8EE', background: a(ICE, 0.12)}}>
            <div style={{width: 300, height: 48}}>{dropped && <Pill f={f} at={T.doc + 6} on={on} id="pill-doc" />}</div>
            <div><Tx id="dl-co" on={on && !typing} size={32} color={INK} weight={600}>{co}</Tx><Caret on={f >= P.TY.doc.f0 - 6 && f < T.whip2} c={STEEL} h={34} /></div>
          </div>
        </div>
        <Spec f0={T.doc + 4} />
      </div>
    </M>
  </At>;
};
const Pill: React.FC<{f: number; at: number; on: boolean; id: string}> = ({f, at, on, id}) => { const p = prog(f, at, 10, 'spring');
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 18px', borderRadius: 999, background: `linear-gradient(140deg, ${ICE}, #4FC3F7)`, boxShadow: `0 10px 30px ${a(ICE, 0.45)}`, transform: `scale(${p.toFixed(3)})`}}>
    <Tx id={id} on={on && p > 0.99} size={30} color="#04121F" weight={700}>{P.PERSON}</Tx></div>; };

const SalesChat: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L).chat; const p = prog(f, T.chat - 14, 14, 'snapOut'); if (p <= 0) return null;
  const sc = lerp(0.5, 1, p); const on = f >= T.chat + 6 && f < T.pull + 4; const msg = typed(P.TY.chat, f); const done = P.shown(P.TY.chat, f) >= P.TY.chat.text.length;
  const sent = prog(f, P.SENT, 10, 'snapOut');
  return <At x={S.x} y={S.y} w={P.CARD.w} h={480} style={{transform: `scale(${sc.toFixed(4)})`, opacity: clamp(p * 1.5), filter: p < 0.9 ? `blur(${((1 - p) * 14).toFixed(1)}px)` : undefined}}>
    <M id="chat" style={{width: P.CARD.w, height: 480}}>
      <div style={{width: P.CARD.w, height: 480, ...glass(true), background: 'linear-gradient(170deg, #1F2329 0%, #15181C 100%)'}}>
        <div style={{padding: '24px 36px', borderBottom: '1.5px solid #2C3036', display: 'flex', alignItems: 'center', gap: 12}}>
          <Tx id="ch-name" on={on} size={36} color="#FFFFFF" weight={800}># sales</Tx><div style={{marginLeft: 'auto'}}><Tx id="ch-n" on={on} size={28} color="#ABABAD" weight={500}>12 members</Tx></div></div>
        <div style={{padding: '22px 36px'}}>
          <div style={{display: 'flex', gap: 16, opacity: 0.5, marginBottom: 18}}><div style={{width: 48, height: 48, borderRadius: 10, background: '#5BC0EB'}} />
            <div style={{fontFamily: F.sans, fontSize: 28, color: '#D1D2D3', lineHeight: 1.3}}>Sam Ortiz booked Wed 2 PM<br />Ivy Chen booked Thu 9 AM</div></div>
          {sent > 0 && <div style={{display: 'flex', gap: 16, transform: `translateY(${px((1 - sent) * 40)})`, opacity: sent}}><div style={{width: 48, height: 48, borderRadius: 10, background: '#F4A261'}} />
            <div><span style={{fontFamily: F.sans, fontSize: 30, color: '#FFFFFF'}}>{P.TY.chat.text}</span></div></div>}
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 26, height: 76, borderRadius: 14, border: '1.5px solid #565856', display: 'flex', alignItems: 'center', padding: '0 22px'}}>
          {sent < 0.5 && <><Tx id="ch-typing" on={on && done} size={30} color="#FFFFFF" weight={500}>{msg}</Tx><Caret on={f >= P.TY.chat.f0 - 4} c="#FFFFFF" h={32} /></>}
        </div>
        <Spec f0={T.chat + 2} />
      </div>
    </M>
  </At>;
};

const Clock: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L).clock; const p = prog(f, T.pull - 10, 18, 'snapOut'); if (p <= 0) return null;
  const mins = lerp(23 * 60 + 12, 23 * 60 + 47, prog(f, T.pull - 10, 24, 'swift'));
  const mA = (mins % 60) * 6, hA = ((mins / 60) % 12) * 30;
  return <At x={S.x} y={S.y} w={420} h={520} style={{transform: `scale(${lerp(0.6, 1, p).toFixed(3)})`, opacity: p}}>
    <M id="clock" style={{width: 420, height: 520}}>
      <div style={{width: 420, height: 420, borderRadius: '50%', ...glass(true, 210), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {Array.from({length: 12}, (_, i) => <div key={i} style={{position: 'absolute', left: 205, top: 22, width: 10, height: 30, borderRadius: 5, background: i % 3 ? a(ICE, 0.4) : ICE, transformOrigin: '5px 188px', transform: `rotate(${i * 30}deg)`}} />)}
        <div style={{position: 'absolute', left: 202, top: 95, width: 16, height: 120, borderRadius: 8, background: '#fff', transformOrigin: '8px 115px', transform: `rotate(${hA}deg)`}} />
        <div style={{position: 'absolute', left: 205, top: 50, width: 10, height: 165, borderRadius: 5, background: AMBER, transformOrigin: '5px 160px', transform: `rotate(${mA}deg)`, boxShadow: `0 0 20px ${a(AMBER, 0.6)}`}} />
      </div>
      <div style={{textAlign: 'center', marginTop: 18, fontFamily: F.display, fontWeight: 800, fontSize: 64, color: AMBER}}>{`11:${String(Math.floor(mins % 60)).padStart(2, '0')} PM`}</div>
    </M>
  </At>;
};

// the copied name travels with the camera from the card to the doc, a copy flies on to the chat
const HeroPill: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L); const p1 = prog(f, T.lift, T.doc + 6 - T.lift, 'swift');
  if (f < T.lift || f >= T.doc + 6) return null;
  const a0 = {x: S.card.x - 80, y: S.card.y - 64}, a1 = {x: S.doc.x - 240, y: S.doc.y + 120};
  const x = lerp(a0.x, a1.x, p1), y = lerp(a0.y, a1.y, p1) - Math.sin(p1 * Math.PI) * 220;
  return <At x={x} y={y} w={300} h={60} style={{display: 'flex', justifyContent: 'center', transform: `scale(${(1 + Math.sin(p1 * Math.PI) * 0.35).toFixed(3)}) rotate(${(Math.sin(p1 * Math.PI) * -6).toFixed(2)}deg)`}}><Pill f={f} at={T.lift} on={false} id="pill-fly" /></At>;
};

const Paths: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L); const p = prog(f, T.pull - 6, 26, 'softOut'); if (p <= 0) return null;
  const pts = [S.card, S.doc, S.chat]; const d = `M ${pts[0].x} ${pts[0].y} Q ${(pts[0].x + pts[1].x) / 2} ${pts[1].y + 300} ${pts[1].x} ${pts[1].y} T ${pts[2].x} ${pts[2].y}`;
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <path d={d} fill="none" stroke={a(ICE, 0.45)} strokeWidth={10} strokeDasharray="30 26" strokeDashoffset={-f * 4} pathLength={1000} style={{strokeDasharray: `${p * 1000} 1000`}} />
  </svg>;
};

const Dups: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L); if (f < T.pull) return null; const c = {x: S.doc.x, y: 150};
  const names = ['Sam Ortiz', 'Ivy Chen', 'Leo Park', 'Mia Grant', 'Raj Patel', 'Ana Ruiz', 'Tom Hale'];
  return <>{names.map((n, i) => { const ang = (i / names.length) * Math.PI * 2 + 0.4; const R = 2350 + rnd(i) * 500; const p = prog(f, T.pull + 4 + i * 3, 16, 'snapOut');
    return <At key={i} x={c.x + Math.cos(ang) * R} y={c.y + Math.sin(ang) * R * 0.62} w={P.CARD.w} h={300} style={{opacity: p, transform: `scale(${lerp(0.4, 0.8, p).toFixed(3)}) rotate(${((rnd(i * 3) - 0.5) * 16 + (f - T.pull) * 0.05).toFixed(2)}deg)`}}>
      <div style={{width: P.CARD.w, height: 300, ...glass(true), padding: 36}}><div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: '#fff'}}>Booking · {n}</div>
        <div style={{marginTop: 20, height: 18, width: '70%', borderRadius: 9, background: a(ICE, 0.25)}} /><div style={{marginTop: 16, height: 18, width: '50%', borderRadius: 9, background: a(ICE, 0.18)}} /></div>
    </At>; })}</>;
};

const StationCaption: React.FC<{f: number; x: number; y: number; t0: number; t1: number; text: string; id: string}> = ({f, x, y, t0, t1, text, id}) => {
  const i = prog(f, t0, 10, 'snapOut'), o = prog(f, t1 - 6, 6, 'inHard'); const v = i * (1 - o); if (v <= 0) return null;
  return <At x={x} y={y} w={1400} h={140} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: v, transform: `translateY(${px((1 - i) * 40)}) scale(${lerp(0.8, 1, i).toFixed(3)})`}}>
    <Tx id={id} size={104} color="#FFFFFF" font={F.display} weight={800} anim={i < 1 || o > 0} style={{letterSpacing: '-0.03em'}}>{text.slice(0, -1)}<span style={{color: ICE}}>{text.slice(-1)}</span></Tx>
  </At>;
};

const World1: React.FC<{f: number; L: L}> = ({f, L}) => {
  const S = P.ST(L);
  return <>
    <Paths f={f} L={L} /><Dups f={f} L={L} /><Clock f={f} L={L} />
    <BookingCard f={f} L={L} /><DealsDoc f={f} L={L} /><SalesChat f={f} L={L} /><HeroPill f={f} L={L} />
    {f < T.box + 20 && <Hook f={f} L={L} />}
    <StationCaption f={f} x={S.card.x} y={S.card.y - 370} t0={T.lift} t1={T.whip1 + 2} text="Copy." id="cap-copy" />
    <StationCaption f={f} x={S.doc.x} y={S.doc.y - 380} t0={T.doc + 6} t1={T.whip2 + 2} text="Paste." id="cap-paste" />
    <StationCaption f={f} x={S.chat.x} y={S.chat.y - 360} t0={T.chat + 4} t1={T.pull + 8} text="Repeat." id="cap-repeat" />
  </>;
};

// ======================================================= WORLD 2 =======================================================
const World2: React.FC<{f: number; L: L}> = ({f, L}) => {
  const flare = prog(f, T.w2, 8, 'snapOut'); const draw = prog(f, T.ring, T.bar - 12 - T.ring, 'swift'); const m = prog(f, T.bar - 12, 14, 'swift');
  const BW = L.wide ? 1140 : 960, BH = L.wide ? 150 : 210; const R = L.wide ? 400 : 420;
  const w = lerp(R * 2, BW, m), h = lerp(R * 2, BH, m), rad = lerp(R, BH / 2, m);
  const tilt = lerp(14, 0, prog(f, T.bar, T.enter - T.bar, 'softOut'));
  const txt = typed(P.TY.prompt, f); const press = f >= T.enter - 4 && f < T.enter + 4;
  const pulse = prog(f, T.enter - 2, 10, 'inHard');
  return <>
    {/* light point */}
    <At x={0} y={0} w={60} h={60} style={{borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${40 + 80 * flare}px ${ICE}, 0 0 160px ${a(ICE, 0.6)}`, transform: `scale(${(lerp(0.3, 1.4, flare) * (1 - m)).toFixed(3)})`, opacity: 1 - m}} />
    {m < 1 && <svg style={{position: 'absolute', left: -R - 20, top: -R - 20, overflow: 'visible', transform: `rotate(${(-90 + (f - T.ring) * 1.5).toFixed(1)}deg)`, opacity: 1 - m}} width={R * 2 + 40} height={R * 2 + 40}>
      <circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke={ICE} strokeWidth={14} strokeLinecap="round" pathLength={100} strokeDasharray={`${draw * 100} 100`} style={{filter: `drop-shadow(0 0 30px ${ICE}) drop-shadow(0 0 60px ${STEEL})`}} />
      <circle cx={R + 20} cy={R + 20} r={R * 0.95} fill="none" stroke={a(ICE, 0.45)} strokeWidth={5} pathLength={100} strokeDasharray={`${draw * 100} 100`} />
    </svg>}
    {m > 0 && <At x={0} y={0} w={w} h={h} style={{perspective: 1300}}>
      <M id="prompt" style={{width: w, height: h}}>
        <div style={{width: w, height: h, borderRadius: rad, transform: `rotateX(${tilt.toFixed(2)}deg)`, background: 'linear-gradient(170deg, rgba(30,50,78,0.95), rgba(10,18,30,0.97))', border: `3px solid ${a(ICE, 0.85)}`,
          boxShadow: `0 0 50px ${a(ICE, 0.45)}, 0 40px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)`, display: 'flex', alignItems: 'center', padding: `0 ${BH * 0.32}px`, gap: 22, overflow: 'hidden'}}>
          {m > 0.8 && <>
            <div style={{width: 64, height: 64, borderRadius: 16, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile('logo-fansa.png')} style={{width: 54, height: 54}} /></div>
            <div style={{flex: 1, minWidth: 0, whiteSpace: 'normal'}}>
              {txt.length === 0 && <span style={{fontFamily: F.sans, fontSize: L.wide ? 50 : 46, color: '#6F8197'}}>Describe your automation…</span>}
              {txt.length > 0 && <Tx id="prompt" size={L.wide ? 50 : 46} color="#FFFFFF" weight={600} anim={P.shown(P.TY.prompt, f) < P.TY.prompt.text.length} style={{whiteSpace: 'normal', maxWidth: L.wide ? 900 : 700}}>{txt}<Caret on={f < T.enter} c={ICE} h={44} /></Tx>}
            </div>
            <div style={{width: BH * 0.62, height: BH * 0.62, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(140deg, ${ICE}, ${STEEL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press ? 0.86 : 1})`, boxShadow: `0 0 ${press ? 60 : 24}px ${a(ICE, 0.7)}`}}>
              <svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke="#04121F" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          </>}
          <Spec f0={T.bar + 4} dur={50} />
        </div>
      </M>
    </At>}
    {pulse > 0 && <At x={BW / 2 - 60 + pulse * 1400} y={0} w={120} h={30} style={{borderRadius: 30, background: `linear-gradient(90deg, transparent, #fff)`, boxShadow: `0 0 40px ${ICE}`}} />}
  </>;
};

// ======================================================= WORLD 3 =======================================================
const NODE = [{id: 'Booking', logo: 'cal'}, {id: 'FansaChat', logo: 'fansa'}, {id: 'Notion', logo: 'notion'}, {id: 'Slack', logo: 'slack'}];
const NT = [T.n1, T.n2, T.n3, T.n4];
const World3: React.FC<{f: number; L: L}> = ({f, L}) => {
  const N = P.NODES(L), Wn = P.WIN3(L); const asm = prog(f, T.w3, 22, 'snapOut');
  const ghost = prog(f, T.dive + 4, 12, 'linear') * (1 - prog(f, T.pullB, 18, 'softOut')); const wo = lerp(1, 0.12, ghost);
  const nodeOn = f >= T.n4 + 12 && f < T.dive && wo > 0.9;
  const glow = prog(f, T.pullB, 20, 'softOut');
  return <>
    <At x={0} y={0} w={Wn.w} h={Wn.h} style={{perspective: 2200, opacity: wo}}>
      <M id="flow-window" style={{width: Wn.w, height: Wn.h}}>
        <div style={{width: Wn.w, height: Wn.h, ...glass(true, 36), transform: `rotateX(${lerp(22, L.wide ? 6 : 4, asm).toFixed(2)}deg) rotateY(${lerp(-14, L.wide ? -3 : -2, asm).toFixed(2)}deg) scale(${lerp(0.86, 1, asm).toFixed(3)})`, opacity: clamp(asm * 2)}}>
          <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: '0 26px', borderBottom: '1.5px solid rgba(139,233,255,0.14)', transform: `translateY(${px((1 - asm) * -60)})`}}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
            <span style={{marginLeft: 18, fontFamily: F.sans, fontSize: 26, color: MUTED}}>FansaChat · New booking flow</span>
          </div>
          <div style={{position: 'absolute', inset: '64px 0 0 0', backgroundImage: `radial-gradient(${a(ICE, 0.18)} 2px, transparent 2.5px)`, backgroundSize: '44px 44px', backgroundPosition: `${(f * 0.6) % 44}px 0px`}} />
          {/* lines + travelling pulses */}
          <svg style={{position: 'absolute', left: Wn.w / 2, top: Wn.h / 2 + 20, overflow: 'visible'}} width={1} height={1}>
            {N.slice(0, 3).map((n, i) => { const b = N[i + 1]; const p = prog(f, NT[i] + 4, NT[i + 1] - NT[i], 'swift');
              const pp = ((f - NT[i]) / 50) % 1;
              return <g key={i}><line x1={n.x} y1={n.y} x2={lerp(n.x, b.x, p)} y2={lerp(n.y, b.y, p)} stroke={a(ICE, 0.75 + 0.25 * glow)} strokeWidth={6 + glow * 3} strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${10 + glow * 14}px ${ICE})`}} />
                {p >= 1 && <circle cx={lerp(n.x, b.x, pp)} cy={lerp(n.y, b.y, pp)} r={9} fill="#fff" style={{filter: `drop-shadow(0 0 12px ${ICE})`}} />}</g>; })}
          </svg>
          {N.map((n, i) => { const p = prog(f, NT[i], 16, 'spring'); if (f < NT[i]) return null; const nw = L.wide ? 290 : 380, nh = L.wide ? 230 : 250;
            return <div key={i} style={{...glass(true, 26), position: 'absolute', left: Wn.w / 2 + n.x - nw / 2, top: Wn.h / 2 + 20 + n.y - nh / 2, width: nw, height: nh, transform: `scale(${p.toFixed(3)}) translateZ(0)`, background: i === 1 ? 'linear-gradient(160deg, rgba(60,110,170,0.95), rgba(14,30,52,0.97))' : glass(true).background, border: `2px solid ${a(ICE, i === 1 ? 0.8 : 0.35)}`,
              display: 'flex', flexDirection: L.wide ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 18}}>
              {NODE[i].logo === 'cal' ? <div style={{width: 92, height: 92, borderRadius: 22, background: `linear-gradient(140deg, ${ICE}, ${STEEL})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CalIcon /></div> : <Logo name={NODE[i].logo} size={92} round={22} />}
              <Tx id={`node-${i}`} on={nodeOn} size={34} color="#FFFFFF" weight={700}>{NODE[i].id}</Tx>
            </div>; })}
        </div>
      </M>
    </At>
    <NotionPage f={f} L={L} /><SlackMsg f={f} L={L} />
  </>;
};

const NotionPage: React.FC<{f: number; L: L}> = ({f, L}) => {
  const n = P.NODES(L)[2]; const op = prog(f, T.dive + 6, T.page - T.dive - 6, 'swift'); const cl = prog(f, T.whip3, 14, 'inHard');
  if (op <= 0 || cl >= 1) return null;
  const pw = L.wide ? 1040 : 880, ph = L.wide ? 720 : 840; const sc = lerp(0.22, 1, op) * lerp(1, 0.25, cl);
  const on = f >= T.page + 4 && f < T.whip3 - 2; const title = typed(P.TY.title, f);
  const rows = [['Company', P.COMPANY], ['Call time', P.CALL]] as const;
  return <At x={n.x - cl * 500} y={n.y} w={pw} h={ph} style={{perspective: 1800, opacity: 1 - cl, filter: cl > 0.05 ? `blur(${(cl * 20).toFixed(1)}px)` : undefined}}>
    <M id="notion" style={{width: pw, height: ph}}>
      <div style={{width: pw, height: ph, transform: `scale(${sc.toFixed(4)}) rotateY(${lerp(-80, 0, op).toFixed(2)}deg) rotateX(${lerp(10, 0, op).toFixed(2)}deg)`, ...glass(false, 28), color: '#191919'}}>
        <div style={{height: L.wide ? 120 : 150, background: 'linear-gradient(120deg, #DCEBFA, #F4E9DB)'}} />
        <div style={{padding: L.wide ? '0 64px' : '0 56px', marginTop: -46}}>
          <div style={{width: 92, height: 92, borderRadius: 18, background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo name="notion" size={70} round={12} /></div>
          <div style={{height: 100, marginTop: 14, display: 'flex', alignItems: 'center'}}>
            <Tx id="np-title" on={on && title.length === P.PERSON.length} size={L.wide ? 76 : 74} color="#191919" font={F.display} weight={800} style={{letterSpacing: '-0.02em'}}>{title}</Tx><Caret on={title.length < P.PERSON.length && f >= P.TY.title.f0 - 4} c="#191919" h={70} /></div>
          {rows.map(([k, v], i) => { const p = prog(f, T.props + i * 9, 12, 'snapOut');
            return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '14px 0', opacity: p, transform: `translateX(${px((1 - p) * -40)})`}}>
              <div style={{width: 230}}><Tx id={`np-k${i}`} on={on && p > 0.99} size={34} color="#5F5E5B" weight={500}>{k}</Tx></div>
              <div style={{padding: '4px 14px', borderRadius: 8, background: i === 0 ? '#E3EEF9' : '#F1EFEA'}}><Tx id={`np-v${i}`} on={on && p > 0.99} size={36} color="#191919" weight={600}>{v}</Tx></div>
            </div>; })}
          <div style={{height: 2, background: '#ECEBE8', margin: '14px 0 18px', opacity: prog(f, T.props + 16, 10)}} />
          <div style={{opacity: prog(f, T.ticks - 8, 10)}}><Tx id="np-prep" on={on && f > T.ticks} size={36} color="#191919" font={F.display} weight={800}>Prep</Tx></div>
          {P.PREP.map((t, i) => { const p = prog(f, T.ticks - 6 + i * 5, 10, 'snapOut'); const tick = f >= T.ticks + i * 13;
            return <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 0', opacity: p, transform: `translateY(${px((1 - p) * 20)})`}}>
              <div style={{width: 40, height: 40, borderRadius: 8, border: `3px solid ${tick ? STEEL : '#B8B6B0'}`, background: tick ? STEEL : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tick ? lerp(1.25, 1, prog(f, T.ticks + i * 13, 8)) : 1})`}}>
                {tick && <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
              <Tx id={`np-p${i}`} on={on && p > 0.99} size={34} color={tick ? '#6E6D69' : '#191919'} weight={500} style={{textDecoration: tick ? 'line-through' : undefined}}>{t}</Tx>
            </div>; })}
        </div>
        <Spec f0={T.ticks + 30} dur={36} />
      </div>
    </M>
  </At>;
};

const SlackMsg: React.FC<{f: number; L: L}> = ({f, L}) => {
  const n = P.NODES(L)[3]; const ti = prog(f, T.toast - 14, 14, 'slideIn'); const ex = prog(f, T.msg, 18, 'swift'); const cl = prog(f, T.pullB, 16, 'inHard');
  if (ti <= 0 || cl >= 1) return null;
  const mw = L.wide ? 1060 : 900, mh = L.wide ? 520 : 640; const tw = L.wide ? 860 : 820, th = 150;
  const w = lerp(tw, mw, ex), h = lerp(th, mh, ex); const yOff = lerp(L.wide ? -300 : -420, 0, ex);
  const on = f >= T.msg + 20 && f < T.pullB - 2; const onT = f >= T.toast + 2 && f < T.msg - 2;
  const react = prog(f, T.react, 12, 'spring');
  return <At x={n.x + (1 - ti) * 1200} y={n.y + yOff} w={w} h={h} style={{opacity: 1 - cl, transform: `scale(${lerp(1, 0.25, cl).toFixed(3)})`, filter: ti < 0.92 || cl > 0.05 ? `blur(${((1 - ti) * 26 + cl * 16).toFixed(1)}px)` : undefined}}>
    <M id="slack" style={{width: w, height: h}}>
      <div style={{width: w, height: h, ...glass(true, 26), background: 'linear-gradient(170deg, #22262C 0%, #16191D 100%)', border: '1.5px solid rgba(255,255,255,0.14)'}}>
        {ex < 0.4 && <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px', opacity: 1 - ex * 2.5}}>
          <Logo name="slack" size={92} round={20} />
          <div style={{minWidth: 0}}><Tx id="toast-h" on={onT} size={30} color="#FFFFFF" weight={700}>#sales · FansaChat</Tx><br />
            <Tx id="toast-l" on={onT} size={30} color="#C9CACC" weight={500}>{P.CHAT.slice(0, 30) + '…'}</Tx></div>
          <div style={{marginLeft: 'auto', alignSelf: 'flex-start'}}><Tx id="toast-t" on={onT} size={26} color="#ABABAD" weight={500}>now</Tx></div>
        </div>}
        {ex > 0.3 && <div style={{opacity: (ex - 0.3) / 0.7}}>
          <div style={{padding: '22px 36px', borderBottom: '1.5px solid #2C3036', display: 'flex', alignItems: 'center', gap: 14}}><Logo name="slack" size={48} round={10} />
            <Tx id="sl-ch" on={on} size={36} color="#FFFFFF" weight={800}># sales</Tx></div>
          <div style={{display: 'flex', gap: 22, padding: '30px 36px'}}>
            <div style={{width: 84, height: 84, borderRadius: 18, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile('logo-fansa.png')} style={{width: 72, height: 72}} /></div>
            <div style={{minWidth: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Tx id="sl-name" on={on} size={34} color="#FFFFFF" weight={800}>FansaChat</Tx>
                <span style={{padding: '2px 10px', borderRadius: 6, background: '#3A3D42'}}><Tx id="sl-app" on={on} size={26} color="#D1D2D3" weight={700}>APP</Tx></span>
                <Tx id="sl-time" on={on} size={28} color="#ABABAD" weight={500}>10:02 AM</Tx></div>
              <div style={{marginTop: 14, maxWidth: L.wide ? 820 : 640}}><Tx id="sl-msg" on={on} size={L.wide ? 48 : 46} color="#FFFFFF" weight={600} style={{whiteSpace: 'normal', lineHeight: 1.28}}>{P.CHAT}</Tx></div>
              {react > 0 && <div style={{marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', borderRadius: 999, background: a(STEEL, 0.35), border: `2px solid ${STEEL}`, transform: `scale(${react.toFixed(3)})`}}>
                <span style={{fontSize: 30}}>✅</span><Tx id="sl-r" on={on && react > 0.99} size={28} color="#FFFFFF" weight={700}>1</Tx></div>}
            </div>
          </div>
        </div>}
        <Spec f0={T.msg + 16} />
      </div>
    </M>
  </At>;
};

// payoff over the pulled-back flow (world 3), above the window
const Payoff: React.FC<{f: number; L: L}> = ({f, L}) => {
  const Wn = P.WIN3(L); const top = -Wn.h / 2; const o = prog(f, T.collapse, 14, 'inHard');
  const ws: [string, number, number, string][] = L.wide ? [['Make your work life', T.pay1, 200, '#FFFFFF'], ['hassle-free.', T.pay2, 300, ICE]] : [['Make your work life', T.pay1, 180, '#FFFFFF'], ['hassle-free.', T.pay2, 272, ICE]];
  void top; const ys = L.wide ? [-902, -550] : [-1305, -994];
  return <>{ws.map(([t, f0, S, c], i) => { const p = prog(f, f0, i ? 9 : 14, i ? 'snapOut' : 'softOut'); if (p <= 0) return null;
    const sc = i ? lerp(1.8, 1, p) : lerp(0.6, 1, p); const bl = (1 - p) * 14;
    const sw = ((f - T.pay2 - 8) / 30);
    return <At key={i} x={0} y={ys[i]} w={5200} h={S * 1.3} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: clamp(p * 1.5) * (1 - o), transform: `scale(${(sc * (1 + 0.03 * prog(f, f0, 80, 'linear'))).toFixed(4)})`, filter: bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : undefined}}>
      <span style={{position: 'relative', display: 'inline-block', overflow: 'hidden'}}>
        <Tx id={`pay-${i}`} size={S} color={c} font={F.display} weight={800} anim={p < 1 || o > 0} style={{letterSpacing: '-0.03em', textShadow: i ? `0 0 40px ${a(ICE, 0.5)}` : undefined}}>{t}</Tx>
        {i === 1 && sw > 0 && sw < 1 && <span style={{position: 'absolute', top: 0, bottom: 0, left: `${-30 + sw * 140}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-18deg)', mixBlendMode: 'overlay'}} />}
      </span>
    </At>; })}</>;
};

// ======================================================= WORLD 4 =======================================================
const World4: React.FC<{f: number; L: L}> = ({f, L}) => {
  const flare = prog(f, T.w4, 8, 'snapOut'); const draw = prog(f, T.w4 + 4, T.logo - T.w4 - 6, 'swift');
  const lp = prog(f, T.logo, 22, 'spring'); const MS = L.wide ? 250 : 230; const WS = L.wide ? 156 : 118;
  const ww = 9 * 0.58 * WS; const slide = prog(f, T.word, 26, 'swift'); const rowY = L.wide ? -210 : -240;
  const mx = lerp(0, -(ww + 34) / 2, slide); const ringOut = prog(f, T.logo, 24, 'softOut');
  const sw = (f - T.sweep) / 26;
  return <>
    {f < T.logo + 4 && <At x={0} y={rowY} w={50} h={50} style={{borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${40 + 80 * flare}px ${ICE}`, transform: `scale(${(lerp(0.3, 1.2, flare) * (1 - prog(f, T.logo - 8, 10))).toFixed(3)})`}} />}
    <svg style={{position: 'absolute', left: -200, top: rowY - 200, overflow: 'visible', opacity: 1 - ringOut, transform: `scale(${lerp(1, 1.9, ringOut).toFixed(3)}) rotate(${(-90 + (f - T.w4) * 2).toFixed(1)}deg)`}} width={400} height={400}>
      <circle cx={200} cy={200} r={170} fill="none" stroke={ICE} strokeWidth={7} strokeLinecap="round" pathLength={100} strokeDasharray={`${draw * 100} 100`} style={{filter: `drop-shadow(0 0 16px ${ICE})`}} />
    </svg>
    {lp > 0 && <At x={mx} y={rowY} w={MS} h={MS}>
      <M id="logo" style={{width: MS, height: MS}}>
        <div style={{width: MS, height: MS, borderRadius: MS * 0.26, background: '#FFFFFF', transform: `scale(${lerp(0.4, 1, lp).toFixed(4)})`, boxShadow: `0 0 90px ${a(ICE, 0.6)}, 0 30px 60px rgba(0,0,0,0.5)`, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={staticFile('logo-fansa.png')} style={{width: '84%', height: '84%'}} />
          {sw > 0 && sw < 1 && <div style={{position: 'absolute', top: '-30%', bottom: '-30%', left: `${-50 + sw * 180}%`, width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)', transform: 'skewX(-20deg)'}} />}
        </div>
      </M>
    </At>}
    {/* wordmark tracks out from behind the mark */}
    {slide > 0 && <At x={mx + MS / 2 + 34 + ww / 2} y={rowY} w={ww + 40} h={WS * 1.3} style={{overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
      <Tx id="wordmark" size={WS} color="#FFFFFF" font={F.display} weight={800} anim={slide < 1} style={{letterSpacing: '-0.03em'}}>
        {[...'FansaChat'].map((ch, j) => { const p = prog(f, T.word + j * 2, 18, 'snapOut'); return <span key={j} style={{display: 'inline-block', transform: `translateX(${px((1 - p) * -(ww * 0.3))})`, opacity: clamp(p * 1.4 - 0.2)}}>{ch}</span>; })}
      </Tx>
    </At>}
    <EndLine f={f} y={L.wide ? -40 : -70} f0={T.tag} id="tag" size={L.wide ? 58 : 52} color="#D6E4F0" text="Automations from one sentence." />
    {f >= T.cta && <At x={0} y={L.wide ? 115 : 110} w={700} h={130} style={{display: 'flex', justifyContent: 'center', transform: `translateY(${px((1 - prog(f, T.cta, 16, 'snapOut')) * 120)})`, opacity: prog(f, T.cta, 10)}}>
      <M id="cta" style={{position: 'relative'}}><div style={{padding: '22px 52px', borderRadius: 999, background: `linear-gradient(140deg, ${STEEL}, #1F7BFF)`, boxShadow: `0 0 60px ${a(STEEL, 0.6)}, inset 0 1px 0 rgba(255,255,255,0.4)`, position: 'relative', overflow: 'hidden'}}>
        <Tx id="cta" size={54} color="#FFFFFF" weight={700}>Join the waitlist</Tx>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${-40 + (((f - T.cta) % 70) / 50) * 180}%`, width: '25%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', transform: 'skewX(-20deg)'}} />
      </div></M>
    </At>}
    <EndLine f={f} y={L.wide ? 255 : 255} f0={T.url} id="url" size={48} color={ICE} text="fansachat.com" />
  </>;
};
const EndLine: React.FC<{f: number; y: number; f0: number; id: string; size: number; color: string; text: string}> = ({f, y, f0, id, size, color, text}) => {
  const p = prog(f, f0, 14, 'snapOut'); if (p <= 0) return null;
  return <At x={0} y={y} w={1300} h={size * 1.4} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: clamp(p * 1.4), transform: `translateY(${px((1 - p) * 30)})`, filter: p < 0.85 ? `blur(${((1 - p) * 8).toFixed(1)}px)` : undefined}}>
    <Tx id={id} size={size} color={color} weight={600} anim={p < 0.99}>{text}</Tx></At>;
};

// ======================================================= FILM =======================================================
export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const L = P.layout(W, H);
  const c = P.camAt(L, f), c2 = P.camAt(L, f + 1); const wd = P.WORLD(f);
  // directional motion blur from the camera speed (screen px per frame)
  const sdx = (c2.x - c.x) * c.z * L.k, sdy = (c2.y - c.y) * c.z * L.k; const zv = Math.abs(Math.log(c2.z / c.z)) * 900 * L.k;
  const bx = clamp((Math.abs(sdx) - 10) * 0.45, 0, 34) + clamp((zv - 12) * 0.2, 0, 8), by = clamp((Math.abs(sdy) - 10) * 0.45, 0, 34) + clamp((zv - 12) * 0.2, 0, 8);
  const blur = bx > 0.4 || by > 0.4;
  const bg = f < T.box + 6 ? 'A' : wd === 1 ? 'B' : wd === 2 ? 'C' : wd === 4 ? 'G' : f < T.dive + 8 ? 'D' : f < T.whip3 + 8 ? 'E' : f < T.pullB ? 'F' : 'G';
  const pre = f < T.w2 ? prog(f, T.shrink + 6, T.w2 - T.shrink - 6, 'inHard') : 0; // the world shrinking into one light point
  const flash = Math.max(0, 1 - Math.abs(f - T.enter) / 6) * 0.5 + Math.max(0, 1 - Math.abs(f - T.logo) / 5) * 0.25;
  return <AbsoluteFill style={{background: NIGHT, overflow: 'hidden'}}>
    {bg === 'A' && <GridFly speed={lerp(1, 0.3, prog(f, s(0.9), 20))} />}
    {bg === 'B' && <DotWorld cx={c.x} cy={c.y} z={c.z} warm={prog(f, T.pull, 30)} />}
    {bg === 'C' && <MeshFlow ring={prog(f, T.ring, 30)} />}
    {bg === 'D' && <Particles dir={L.wide ? [1, 0] : [0, 1]} cx={c.x} cy={c.y} />}
    {bg === 'E' && <Leaks />}
    {bg === 'F' && <Refract />}
    {bg === 'G' && <Horizon rise={wd === 4 ? lerp(0.5, 1, prog(f, T.w4, T.end - T.w4, 'softOut')) : prog(f, T.pullB, 60, 'softOut') * 0.5} beam={wd === 4 ? 1 : 0.5} />}
    {blur && <svg width={0} height={0} style={{position: 'absolute'}}><filter id="mb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`${bx.toFixed(1)} ${by.toFixed(1)}`} /></filter></svg>}
    <div style={{position: 'absolute', left: W / 2, top: H / 2, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${c.r.toFixed(3)}deg) scale(${(c.z * L.k).toFixed(5)}) translate(${(-c.x).toFixed(2)}px, ${(-c.y).toFixed(2)}px)`, filter: blur ? 'url(#mb)' : undefined, opacity: wd === 1 ? 1 - pre * 0.85 : 1}}>
      {wd === 1 && <World1 f={f} L={L} />}
      {wd === 2 && <World2 f={f} L={L} />}
      {wd === 3 && <><World3 f={f} L={L} /><Payoff f={f} L={L} /></>}
      {wd === 4 && <World4 f={f} L={L} />}
    </div>
    {/* captions that ride the camera (screen space, lag behind its velocity) */}
    <ScreenCaps f={f} L={L} lag={{x: -sdx * 1.2, y: -sdy * 1.2}} />
    {pre > 0 && <div style={{position: 'absolute', left: W / 2 - 40, top: H / 2 - 40, width: 80, height: 80, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${60 * pre}px ${ICE}, 0 0 140px ${a(ICE, 0.7 * pre)}`, transform: `scale(${lerp(0.1, 0.6, pre).toFixed(3)})`, opacity: pre}} />}
    {flash > 0.01 && <AbsoluteFill style={{background: ICE, opacity: flash, pointerEvents: 'none'}} />}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
    <TextGuard every={4} label="P05V4" />
  </AbsoluteFill>;
};

const ScreenCaps: React.FC<{f: number; L: L; lag: {x: number; y: number}}> = ({f, L, lag}) => {
  const caps: [string, number, number, number, number][] = [ // text, in, out, y (fraction of H), size
    ['Every booking. By hand.', T.pull + 22, T.w2 - 6, L.wide ? 0.84 : 0.78, L.wide ? 76 : 70],
    ['Built from one sentence.', T.n4 + 4, T.dive + 4, L.wide ? 0.115 : 0.1, L.wide ? 60 : 62],
    ['Real Notion page.', T.page + 10, T.whip3 + 2, L.wide ? 0.085 : 0.075, L.wide ? 56 : 60],
    ['Real Slack message.', T.msg + 10, T.pullB + 2, L.wide ? 0.115 : 0.1, L.wide ? 60 : 62],
  ];
  return <>{caps.map(([t, i0, o0, y, S], k) => { const i = prog(f, i0, 12, 'snapOut'), o = prog(f, o0 - 8, 8, 'inHard'); const v = i * (1 - o); if (v <= 0) return null;
    const lines = !L.wide && t.length > 20 ? t.split('. ').map((x, j, arr) => (j < arr.length - 1 ? x + '.' : x)) : [t];
    return <div key={k} style={{position: 'absolute', left: 0, right: 0, top: L.H * y, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v, transform: `translate(${px(clamp(lag.x, -40, 40))}, ${px(clamp(lag.y, -40, 40) + (1 - i) * 30)})`, filter: i < 0.9 || o > 0.1 ? `blur(${((1 - i) * 10 + o * 12).toFixed(1)}px)` : undefined}}>
      {lines.map((ln, j) => <Tx key={j} id={`cap${k}-${j}`} size={S} color="#FFFFFF" font={F.display} weight={800} anim={i < 1 || o > 0} style={{letterSpacing: '-0.02em', textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>{ln}</Tx>)}
    </div>; })}</>;
};
