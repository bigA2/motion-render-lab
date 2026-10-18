// FansaChat intro I28 — built from the founder's 4 references:
// ref 2 (twoclipping-5cba86) one morphing shape · ref 4 (notdwd-7de38a) logo click → icon orbit → menu bar → glass prompt → whip-tilt
// ref 1 (twoclipping-d89be5) 3D land-view floor, steps stand up, arches rise out of the mockup · ref 3 (thismacapital-dfba20) arc floods,
// headline stacks, checklist counter, iris → dot → logo. Liquid-glass colouring, a colour change between every scene. 60 fps.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import SPEC from '../intro26/I26.json';
import {FONT, Glyph, Lockup} from '../intro27/ui';
import {AppTile, ArcFlood, BLUSH, Cursor, ez, FPS, glass, INK, lerp, LineIn, Liquid, LO, PAPER, PERI, PERI_D, spr, springTo} from './kit';
import {Floor, FRow, FTheme, rowY} from './floor';

export type Vo = {file: string; dur: number; words: {w: string; s: number; e: number}[]}[];
const LEAD = 24, GAP = 20, END_HOLD = 170;
export const estimateVo = (): Vo => SPEC.lines.map((t, i) => { const ws = t.split(' '); const dur = ws.length / 2.5 + 0.3; return {file: `v/I26/${String(i + 1).padStart(2, '0')}.wav`, dur, words: ws.map((w, j) => ({w, s: (j / ws.length) * dur, e: ((j + 1) / ws.length) * dur}))}; });
export const timeline = (vo: Vo) => { const st: number[] = []; let t = LEAD; vo.forEach((l) => { st.push(t); t += Math.round(l.dur * FPS) + GAP; }); return {st, total: t + END_HOLD}; };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const makeWf = (vo: Vo, st: number[]) => (li: number, pre: string[], nth = 0) => {
  let k = 0; for (const x of vo[li]?.words ?? []) if (pre.some((p) => norm(x.w).startsWith(p))) { if (k === nth) return st[li] + Math.round(x.s * FPS); k++; }
  const toks = SPEC.lines[li].split(' ').map(norm); let n = 0;
  for (let i = 0; i < toks.length; i++) if (pre.some((p) => toks[i].startsWith(p))) { if (n === nth) return st[li] + Math.round((i / toks.length) * (vo[li]?.dur ?? 3) * FPS); n++; }
  return st[li];
};

// ---------------- floor rows (only catalogue apps; triggers t>0 or schedules) ----------------
type R = Omit<FRow, 'at'> & {key: string};
const lin = (n: number) => Array.from({length: n - 1}, (_, i) => [i, i + 1] as [number, number]);
const ROWS: R[] = [
  {key: 'onb', title: 'Client Onboarding', steps: [{k: 'stripe', label: 'Client pays', c: 0}, {k: 'drive', label: 'Create folder', c: 1}, {k: 'docusign', label: 'Send contract', c: 2}, {k: 'gmail', label: 'Kickoff email', c: 3}], edges: lin(4)},
  {key: 'inv', title: 'Invoice Reminders', steps: [{k: 'xero', label: 'Overdue invoice', c: 0}, {k: 'wait', label: 'Wait 3 days', c: 1}, {k: 'router', label: 'Paid yet?', c: 2}, {k: 'gmail', label: 'Polite reminder', c: 3, r: 0.5}, {k: 'xero', label: 'Mark settled', c: 3, r: -0.5}], edges: [[0, 1], [1, 2], [2, 3, 'No'], [2, 4, 'Yes']]},
  {key: 'cal', title: 'Booking to Deal', steps: [{k: 'calendly', label: 'New booking', c: 0}, {k: 'pipedrive', label: 'Create deal', c: 1}, {k: 'ai', label: 'Prep note', c: 2}], edges: lin(3)},
  {key: 'ads', title: 'Ad Lead Routing', steps: [{k: 'meta', label: 'New ad lead', c: 0}, {k: 'hubspot', label: 'Create contact', c: 1}, {k: 'router', label: 'Which region?', c: 2}, {k: 'slack', label: 'EU owner', c: 3, r: -0.5}, {k: 'slack', label: 'US owner', c: 3, r: 0.5}], edges: [[0, 1], [1, 2], [2, 3, 'EU'], [2, 4, 'US']]},
  {key: 'rep', title: 'Monday Client Report', steps: [{k: 'schedule', label: 'Mondays 08:00', c: 0}, {k: 'gsc', label: 'Last week', c: 1}, {k: 'ai', label: 'Summarise', c: 2}, {k: 'slides', label: 'Build report', c: 3}, {k: 'gmail', label: 'Send to client', c: 4}], edges: lin(5)},
  {key: 'team', title: 'Team Flows · one per role', steps: [{k: 'hubspot', label: 'Account manager', c: 0, r: -0.6}, {k: 'figma', label: 'Designer', c: 0, r: 0}, {k: 'asana', label: 'Project lead', c: 0, r: 0.6}, {k: 'gcal', label: 'Book kickoff', c: 1, r: -0.6}, {k: 'drive', label: 'Share assets', c: 1, r: 0}, {k: 'clickup', label: 'Create tasks', c: 1, r: 0.6}, {k: 'gmail', label: 'Send agenda', c: 2, r: -0.6}, {k: 'slack', label: 'Ask for review', c: 2, r: 0}, {k: 'slides', label: 'Status update', c: 2, r: 0.6}], edges: [[0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]]},
  {key: 'fig', title: 'Feedback Routing', steps: [{k: 'figma', label: 'New comment', c: 0}, {k: 'router', label: 'Who owns it?', c: 1}, {k: 'slack', label: 'DM designer', c: 2, r: -0.5}, {k: 'slack', label: 'DM copywriter', c: 2, r: 0.5}], edges: [[0, 1], [1, 2, 'Design'], [1, 3, 'Copy']]},
  {key: 'appt', title: 'Appointment Reminders', steps: [{k: 'acuity', label: 'New appointment', c: 0}, {k: 'wait', label: '24 h before', c: 1}, {k: 'twilio', label: 'Text reminder', c: 2}], edges: lin(3)},
  {key: 'ord', title: 'Order Follow-up', steps: [{k: 'shopify', label: 'Order fulfilled', c: 0}, {k: 'shippo', label: 'Track parcel', c: 1}, {k: 'wait', label: '5 days later', c: 2}, {k: 'gmail', label: 'Ask for a review', c: 3}], edges: lin(4)},
];
const TH: Record<'light' | 'dark' | 'brand', FTheme & {bg: [string, string, string, string]}> = {
  light: {plate: 'rgba(255,255,255,0.86)', plateLine: 'rgba(32,28,46,0.10)', ink: INK, lo: LO, arch: '#2B2734', archGlow: PERI, node: '#FFFFFF', dark: false, bg: [PAPER, '#DADCFB', '#FFE1D8', '#EEF0FF']},
  dark: {plate: 'rgba(30,26,44,0.92)', plateLine: 'rgba(255,255,255,0.10)', ink: '#EDEBF5', lo: '#9A95B0', arch: '#B9BCF6', archGlow: PERI, node: '#26213A', dark: true, bg: ['#0F0C16', '#2C2766', '#3A2033', '#141A3A']},
  brand: {plate: 'rgba(255,255,255,0.62)', plateLine: 'rgba(100,104,216,0.18)', ink: INK, lo: LO, arch: PERI_D, archGlow: BLUSH, node: '#FFFFFF', dark: false, bg: ['#ECEBFF', '#C9CCF8', '#FFD6CA', '#F7E8FF']},
};

export const Film: React.FC<{vo: Vo}> = ({vo}) => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H; const u = w ? W / 1920 : W / 1080;
  const {st, total} = timeline(vo); const wf = makeWf(vo, st);
  const t = {
    copy: wf(0, ['copy']), paste: wf(0, ['paste']), chase: wf(0, ['chase']), repeat: wf(0, ['repeat']), that: wf(0, ['that']),
    l2: st[1], turns: wf(1, ['turns']), one: wf(1, ['one']), plain: wf(1, ['plain']), sentence: wf(1, ['sentence']), workflow: wf(1, ['workflow']), apps: wf(1, ['700', 'seven']),
    l3: st[2], stripe: wf(2, ['stripe']), xero: wf(2, ['zero', 'xero']), cal: wf(2, ['calend']),
    l4: st[3], meta: wf(3, ['meta']), mon: wf(3, ['monday']), every: wf(3, ['every']), feed: wf(3, ['feedback']),
    l5: st[4], book: wf(4, ['booking']), orders: wf(4, ['order']), own: wf(4, ['your']), approve: wf(4, ['approve']),
    l6: st[5], workday: wf(5, ['work']), l7: st[6],
  };
  // ---------- scene windows ----------
  const S1 = [0, t.l2 - 6], S2 = [t.l2 - 6, t.workflow + 16], S3 = [t.workflow + 16, t.l6 - 10], S6 = [t.l6 - 10, t.l7 - 12], S7 = [t.l7 - 12, total];
  const inS = (s: number[]) => f >= s[0] && f < s[1];
  // ---------- floor: row timing (each row "arrives" on its word) and the camera glide ----------
  const rowAt = [t.workflow + 30, t.xero - 18, t.cal - 18, t.meta - 18, t.mon - 18, t.every - 18, t.feed - 18, t.book - 18, t.orders - 18];
  const rows: FRow[] = ROWS.map((r, i) => ({...r, at: rowAt[i], lit: r.key === 'inv' ? rowAt[i] + 70 : r.key === 'ads' ? rowAt[i] + 80 : r.key === 'fig' ? rowAt[i] + 80 : undefined}));
  // steady glide between row keys (smoothstep blend per segment, never reverses)
  const camKeys: [number, number][] = rowAt.map((a, i) => [a + 6, rowY(i)]);
  let camY = camKeys[0][1];
  for (let i = 0; i < camKeys.length - 1; i++) { const [a, ya] = camKeys[i], [b, yb] = camKeys[i + 1]; if (f >= a) camY = lerp(ya, yb, ez(f, a, b, Easing.inOut(Easing.sin))); }
  if (f < camKeys[0][0]) camY = rowY(0) - 1400 * (1 - ez(f, S3[0] - 10, camKeys[0][0], Easing.out(Easing.cubic)));
  camY += (f - camKeys[0][0]) * 0.35; // constant creep so the floor never stops
  const camZ = 200 + 140 * Math.sin(f / 400);
  // theme per section with an arc flood between them
  const sec = f < t.l4 - 16 ? 'light' : f < t.l5 - 16 ? 'dark' : 'brand';
  const th = TH[sec as 'light' | 'dark' | 'brand'];
  const sectionLabel = f < t.l4 - 16 ? ['For', 'freelancers.', 'payoff', 3, [rowAt[0], rowAt[1], rowAt[2]]] : f < t.l5 - 16 ? ['For', 'agencies.', 'payoff', 4, [rowAt[3], rowAt[4], rowAt[5], rowAt[6]]] : ['For small', 'businesses.', 'payoff', 3, [rowAt[7], rowAt[8], t.approve]];
  const secAt = f < t.l4 - 16 ? t.l3 - 8 : f < t.l5 - 16 ? t.l4 - 8 : t.l5 - 8;
  const done = (sectionLabel[4] as number[]).filter((a) => f >= a + 40).length;

  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    {/* ================= S1 · ref 2: ONE shape morphs through the copy-paste loop ================= */}
    {inS(S1) ? (() => {
      const ks: [number, number][] = [[0, 0], [t.paste, 1], [t.chase, 2], [t.repeat, 3], [t.that - 4, 4]];
      const st_ = (i: number) => ez(f, ks[i][0], ks[i][0] + 20); void st_;
      const sw = springTo(f, [[0, 300], [t.paste, 640], [t.chase, 720], [t.repeat, 150], [t.that - 4, 40]]) * u;
      const sh = springTo(f, [[0, 96], [t.paste, 110], [t.chase, 170], [t.repeat, 150], [t.that - 4, 40]]) * u;
      const rad = springTo(f, [[0, 48], [t.paste, 30], [t.chase, 36], [t.repeat, 75], [t.that - 4, 20]]) * u;
      const lightness = springTo(f, [[0, 0], [t.paste, 1], [t.chase, 0], [t.repeat, 0]]);
      const bg = `rgb(${lerp(34, 255, lightness)},${lerp(30, 255, lightness)},${lerp(48, 255, lightness)})`;
      const intro = spr(f, 6, 10);
      const swap = (at: number, next: number) => ({opacity: ez(f, at, at + 10) * (1 - ez(f, next - 4, next + 4)), filter: `blur(${(1 - ez(f, at, at + 10)) * 8 + ez(f, next - 4, next + 4) * 8}px)`});
      const curX = springTo(f, [[0, W * 0.72], [t.copy - 30, W / 2 + 40 * u], [t.paste - 6, W / 2 + 240 * u], [t.chase - 6, W / 2 + 280 * u], [t.repeat - 6, W / 2 + 60 * u], [t.that, W * 0.8]], 9);
      const curY = springTo(f, [[0, H * 0.8], [t.copy - 30, H / 2 + 10 * u], [t.paste - 6, H / 2 + 20 * u], [t.chase - 6, H / 2 + 40 * u], [t.repeat - 6, H / 2 + 50 * u], [t.that, H * 0.9]], 9);
      const press = [t.copy, t.paste, t.chase, t.repeat].reduce((m, a) => Math.max(m, 1 - Math.abs(f - a) / 6), 0);
      const spin = f >= t.repeat ? (f - t.repeat) * (6 + (f - t.repeat) * 0.25) : 0;
      return <AbsoluteFill>
        <Liquid f={f} a="rgba(139,143,232,0.35)" b="rgba(244,184,168,0.35)" c="rgba(200,205,255,0.4)" base={PAPER} />
        <div style={{position: 'absolute', left: W / 2, top: H / 2, width: sw, height: sh, marginLeft: -sw / 2, marginTop: -sh / 2, borderRadius: rad, background: bg, boxShadow: `0 ${30 * u}px ${60 * u}px -30px rgba(34,30,48,0.55)`, border: lightness > 0.5 ? `1.5px solid ${INK}` : 'none', transform: `scale(${0.6 + 0.4 * intro})`, opacity: intro * (1 - ez(f, t.that + 30, t.that + 50)), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
          <div style={{position: 'absolute', display: 'flex', alignItems: 'center', gap: 14 * u, color: '#fff', fontFamily: FONT.ui, fontWeight: 600, fontSize: 38 * u, ...swap(0, t.paste)}}><span style={{fontSize: 30 * u}}>⧉</span>Copy</div>
          <div style={{position: 'absolute', left: 30 * u, right: 30 * u, display: 'flex', alignItems: 'center', gap: 16 * u, color: INK, fontFamily: FONT.ui, fontSize: 34 * u, whiteSpace: 'nowrap', ...swap(t.paste, t.chase)}}><span style={{color: LO, fontSize: 24 * u, fontWeight: 600}}>PASTE</span><span style={{fontWeight: 600}}>INV-0142 · $1,200</span><span style={{width: 3, height: 40 * u, background: PERI_D, opacity: Math.floor(f / 20) % 2 ? 0.2 : 1}} /></div>
          <div style={{position: 'absolute', left: 34 * u, right: 34 * u, display: 'flex', alignItems: 'center', gap: 20 * u, color: '#fff', fontFamily: FONT.ui, ...swap(t.chase, t.repeat)}}><div style={{width: 64 * u, height: 64 * u, borderRadius: 20 * u, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 * u}}>🔔</div><div><div style={{fontWeight: 700, fontSize: 32 * u}}>Chasing invoice #3…</div><div style={{fontSize: 24 * u, opacity: 0.7}}>still unpaid · sent by hand</div></div></div>
          <div style={{position: 'absolute', ...swap(t.repeat, t.that - 4)}}><svg width={90 * u} height={90 * u} viewBox="0 0 40 40" style={{transform: `rotate(${spin}deg)`}}><circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="none" /><path d="M20 5 A15 15 0 0 1 35 20" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></div>
        </div>
        {/* the spoken words as one designed line under the shape */}
        <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 + 130 * u, display: 'flex', justifyContent: 'center'}}>
          {f < t.that - 4 ? <LineIn key={f < t.paste ? 'a' : f < t.chase ? 'b' : f < t.repeat ? 'c' : 'd'} text={f < t.paste ? 'Copy.' : f < t.chase ? 'Paste.' : f < t.repeat ? 'Chase.' : 'Repeat.'} f={f} at={f < t.paste ? t.copy : f < t.chase ? t.paste : f < t.repeat ? t.chase : t.repeat} size={64 * u} color={INK} /> : null}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 60 * u, display: 'flex', justifyContent: 'center'}}><LineIn text={<>That's not the <span style={{color: PERI_D}}>job</span> you signed up for.</>} f={f} at={t.that} size={(w ? 96 : 70) * u} color={INK} /></div>
        {f < t.that + 40 ? <Cursor x={curX} y={curY} press={press} hover={0.2} s={u * 1.2} /> : null}
      </AbsoluteFill>;
    })() : null}

    {/* ================= S2 · ref 4: logo click → icon orbit → menu bar → glass prompt → whip ================= */}
    {inS(S2) ? (() => {
      const a = S2[0]; const cut1 = t.one - 2, cut2 = Math.max(t.one + 60, t.sentence - 4), whip = t.workflow - 14;
      const p1 = f < cut1, p2 = f >= cut1 && f < cut2, p3 = f >= cut2;
      const haze = 1 - ez(f, a, a + 40);
      return <AbsoluteFill>
        <Liquid f={f} a="rgba(139,143,232,0.45)" b="rgba(244,184,168,0.4)" c="rgba(210,214,255,0.5)" base={PAPER} />
        <AbsoluteFill style={{background: `rgba(183,188,245,${0.85 * haze})`}} />
        {p1 ? (() => { // header rises out of the haze inside a light glass window; cursor clicks the logo
          const rise = springTo(f, [[a, 260], [a + 4, 0]], 9) * u; const winK = ez(f, a + 10, a + 34);
          const cx = springTo(f, [[a, W * 0.82], [a + 30, W * 0.6], [t.turns - 4, W / 2 - 150 * u]], 10), cy = springTo(f, [[a, H * 0.22], [a + 30, H * 0.3], [t.turns - 4, H / 2 + 20 * u]], 10);
          const hover = ez(f, t.turns - 16, t.turns - 6); const press = Math.max(0, 1 - Math.abs(f - t.turns) / 5);
          const zoom = 1 + 0.18 * ez(f, t.turns - 30, t.turns, Easing.inOut(Easing.cubic)) - 0.14 * ez(f, t.turns, cut1, Easing.in(Easing.cubic));
          return <AbsoluteFill style={{transform: `scale(${zoom})`}}>
            <div style={{position: 'absolute', left: W * 0.2, top: H * 0.24, width: W * 0.9, height: H, borderRadius: 90 * u, ...glass('rgba(255,255,255,0.7)'), opacity: winK}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 70 * u + rise, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 * u}}>
              <div style={{width: 140 * u, height: 140 * u, borderRadius: '50%', background: '#FBFCFE', border: '1px solid #E8E8EA', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${14 * u * hover}px rgba(139,143,232,${0.3 * hover})`}}><Img src={staticFile('logo-fansa.png')} style={{width: 108 * u, height: 108 * u, objectFit: 'contain'}} /></div>
              <span style={{fontFamily: FONT.sora, fontWeight: 700, fontSize: 64 * u, letterSpacing: '-0.02em', backgroundImage: 'linear-gradient(180deg,#6468D8,#8B8FE8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `blur(${(1 - ez(f, a + 2, a + 14)) * 8}px)`}}>FansaChat</span>
              <span style={{padding: `${8 * u}px ${18 * u}px`, borderRadius: 99, background: INK, color: '#fff', fontFamily: FONT.ui, fontWeight: 600, fontSize: 22 * u, transform: `translateX(${(1 - ez(f, a + 4, a + 18)) * 15}px)`, filter: `blur(${(1 - ez(f, a + 4, a + 18)) * 10}px)`}}>Coming soon</span>
            </div>
            <Cursor x={cx} y={cy} rot={lerp(-12, -30, ez(f, a + 30, t.turns - 10))} hover={hover} press={press} s={u * 1.2} />
          </AbsoluteFill>;
        })() : null}
        {p2 ? (() => { // hard cut on the drop: app icon + four squares orbit into a cross, then collapse right
          const k = f - cut1; const size = springTo(f, [[cut1, 300], [cut1 + 2, 190]], 9) * u; const lock = ez(f, cut1, cut1 + 26, Easing.out(Easing.cubic));
          const out = ez(f, cut2 - 22, cut2, Easing.in(Easing.cubic));
          const sq: [string, number][] = [['#FFFFFF', 180], [PERI, 270], [BLUSH, 0], [INK, 90]];
          return <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `blur(${out * 6}px)`}}>
            <div style={{position: 'absolute', width: lerp(240, 330, lock) * u, height: lerp(240, 330, lock) * u, borderRadius: '50%', background: '#E9E9EF', transform: `scale(${1 - out * 0.8})`}} />
            {sq.map(([c, ang], i) => { const A = ((ang + (1 - lock) * 260) * Math.PI) / 180; const r = lerp(320, 218, lock) * u; const rowX = (size / 2 + 40 * u + i * 100 * u) * out; return <div key={i} style={{position: 'absolute', width: 92 * u, height: 92 * u, borderRadius: 26 * u, background: c, border: c === '#FFFFFF' ? '1px solid #E3E8EF' : 'none', boxShadow: '0 10px 24px -12px rgba(0,0,0,0.35)', transform: `translate(${lerp(Math.cos(A) * r, rowX, out)}px, ${lerp(Math.sin(A) * r, 0, out)}px) scale(${1 - out * 0.55})`}} />; })}
            <div style={{position: 'relative', width: size * (1 - out * 0.78), height: size * (1 - out * 0.78), borderRadius: '28%', background: 'linear-gradient(160deg,#2C2950,#1A1730)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.6)'}}><Img src={staticFile('logo-fansa.png')} style={{width: '74%', height: '74%', objectFit: 'contain'}} /></div>
            <div style={{display: 'none'}}>{k}</div>
          </AbsoluteFill>;
        })() : null}
        {p3 ? (() => { // menu bar + frosted prompt springs out and types; then whip-tilt up through a periwinkle flash
          const text = 'When a client pays, set up their folder, contract and kickoff email.';
          const pop = spr(f, cut2 + 16, 13); const typed = text.slice(0, Math.max(0, Math.floor((f - cut2 - 24) * 1.1)));
          const wy = ez(f, whip, S2[1], Easing.in(Easing.cubic)) * H * 0.9; const flash = ez(f, whip + 6, S2[1]);
          return <AbsoluteFill style={{transform: `translateY(${-wy}px)`, filter: wy > 4 ? `blur(${Math.min(10, wy / 60)}px)` : undefined}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#2E2B5C 0%, #6C70D8 55%, #B9BCF6 100%)'}} />
            <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.35}}><circle cx={W * 0.62} cy={H * 0.9} r={H * 0.55} stroke="#fff" strokeWidth={1.5} fill="none" /><line x1={0} y1={H * 0.62} x2={W} y2={H * 0.62} stroke="#fff" strokeWidth={1} /><line x1={W * 0.3} y1={H * 0.2} x2={W * 0.3} y2={H} stroke="#fff" strokeWidth={1} /></svg>
            <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.16, height: 64 * u, background: 'rgba(20,18,36,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 26 * u, padding: `0 ${40 * u}px`, color: '#fff', fontFamily: FONT.ui, fontWeight: 600, fontSize: 26 * u, opacity: ez(f, cut2, cut2 + 8), filter: `blur(${(1 - ez(f, cut2, cut2 + 10)) * 3}px)`}}>
                            <div style={{width: 44 * u, height: 44 * u, borderRadius: 12 * u, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: f >= cut2 + 14 && f < cut2 + 20 ? `0 0 0 6px ${PERI}66` : undefined}}><Img src={staticFile('logo-fansa.png')} style={{width: 34 * u, height: 34 * u}} /></div>
              {[PERI, BLUSH, '#FFFFFF'].map((c, i) => <span key={i} style={{width: 30 * u, height: 30 * u, borderRadius: 99, background: c}} />)}
              <span>Mon 9:41 AM</span>
            </div>
            <div style={{position: 'absolute', left: W / 2 - 520 * u, top: H * 0.16 + 100 * u, width: 1040 * u, transformOrigin: '80% 0', transform: `scale(${0.3 + 0.7 * pop}, ${0.1 + 0.9 * pop})`, opacity: pop, ...glass('rgba(30,27,62,0.42)', true), borderRadius: 52 * u, padding: `${34 * u}px ${40 * u}px`}}>
              <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 40 * u, color: '#fff', minHeight: 110 * u, lineHeight: 1.35}}>{typed}<span style={{display: 'inline-block', width: 3, height: 40 * u, background: '#fff', marginLeft: 3, verticalAlign: 'middle'}} /></div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 * u}}><span style={{fontFamily: FONT.ui, fontSize: 24 * u, color: 'rgba(255,255,255,0.8)'}}>FansaChat · new workflow</span><div style={{width: 60 * u, height: 60 * u, borderRadius: 99, background: PERI_D, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 * u}}>↑</div></div>
            </div>
            <Cursor x={springTo(f, [[cut2, W * 0.66], [cut2 + 2, W / 2 + 160 * u]], 11)} y={springTo(f, [[cut2, H * 0.9], [cut2 + 2, H * 0.16 + 40 * u]], 11)} press={Math.max(0, 1 - Math.abs(f - cut2 - 14) / 4)} s={u * 1.1} />
            <AbsoluteFill style={{background: `rgba(220,222,255,${flash})`}} />
          </AbsoluteFill>;
        })() : null}
      </AbsoluteFill>;
    })() : null}

    {/* ================= S3–S5 · ref 1: 3D land view, arches rise out of the mockup ================= */}
    {inS(S3) ? <AbsoluteFill>
      <Liquid f={f} a={th.bg[1]} b={th.bg[2]} c={th.bg[3]} base={th.bg[0]} />
      <Floor f={f} W={W} H={H} camY={camY} camZ={camZ + (w ? 0 : 900)} rows={rows} th={th} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: H * 0.42, background: `linear-gradient(180deg, ${th.bg[0]} 0%, ${th.bg[0]}E6 38%, ${th.bg[0]}00 100%)`}} />
      {/* floating logo tiles that stay with the film (ref 1) */}
      {[0, 1, 2].map((i) => { const k = ez(f, S3[0] + 10 + i * 8, S3[0] + 40 + i * 8); return <div key={i} style={{position: 'absolute', left: [W * 0.06, W * 0.9, W * 0.82][i], top: [H * 0.72, H * 0.12, H * 0.84][i] + Math.sin(f / 70 + i) * 10, opacity: k * 0.9, transform: `scale(${0.6 + 0.4 * k}) rotate(${[-8, 10, -4][i]}deg)`, filter: i === 2 ? 'blur(6px)' : undefined}}><div style={{...glass(th.dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)', th.dark), width: [110, 90, 170][i] * u, height: [110, 90, 170][i] * u, borderRadius: 30 * u, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Img src={staticFile('logo-fansa.png')} style={{width: '70%', height: '70%', objectFit: 'contain'}} /></div></div>; })}
      {/* app tiles drifting past near the lens, blurred (700+ apps) */}
      {f < rowAt[1] ? ['shopify', 'hubspot', 'notion', 'zendesk', 'mailchimp', 'quickbooks'].map((k, i) => { const p = ez(f, t.apps - 40 + i * 5, t.apps + 80 + i * 5, Easing.inOut(Easing.sin)); return <div key={k} style={{position: 'absolute', left: (i % 2 ? W * 0.9 : W * 0.04) + (i % 2 ? -1 : 1) * p * 60, top: lerp(H * 1.1, -H * 0.3, p) + i * 40, opacity: Math.sin(p * Math.PI), filter: `blur(${4 + (i % 3) * 2}px)`}}><AppTile k={k} size={(120 + (i % 3) * 30) * u} /></div>; }) : null}
      {f >= t.apps - 30 && f < rowAt[1] ? <div style={{position: 'absolute', left: W / 2, bottom: H * 0.06, transform: 'translateX(-50%)', ...glass('rgba(255,255,255,0.7)'), borderRadius: 99, padding: `${12 * u}px ${30 * u}px`, fontFamily: FONT.ui, fontWeight: 700, fontSize: 30 * u, color: INK, opacity: ez(f, t.apps - 30, t.apps) * (1 - ez(f, rowAt[1] - 30, rowAt[1]))}}>Connects 700+ apps</div> : null}
      {/* section headline stack + checklist counter (ref 3) — reserved zone top-left */}
      {f >= t.l3 - 10 ? <div key={sectionLabel[1] as string} style={{position: 'absolute', left: 70 * u, top: 50 * u}}>
        <LineIn text={sectionLabel[0] as string} f={f} at={secAt} size={(w ? 70 : 64) * u} color={th.ink} />
        <LineIn text={<span style={{color: th.dark ? '#B9BCF6' : PERI_D}}>{sectionLabel[1] as string}</span>} f={f} at={secAt + 6} size={(w ? 70 : 64) * u} color={th.ink} />
        <div style={{marginTop: 14 * u, display: 'flex', alignItems: 'center', gap: 10 * u, opacity: ez(f, secAt + 20, secAt + 40)}}>
          {Array.from({length: sectionLabel[3] as number}).map((_, i) => <span key={i} style={{width: 14 * u, height: 14 * u, borderRadius: 99, background: i < done ? (th.dark ? '#B9BCF6' : PERI_D) : th.dark ? 'rgba(255,255,255,0.2)' : 'rgba(34,30,48,0.15)', transform: `scale(${i === done - 1 ? 1 + 0.4 * (1 - ez(f, (sectionLabel[4] as number[])[i] + 40, (sectionLabel[4] as number[])[i] + 60)) : 1})`}} />)}
          <span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 24 * u, color: th.lo, marginLeft: 6 * u}}>{done} / {sectionLabel[3] as number} handled</span>
        </div>
      </div> : null}
      {/* SMS endpoint standing beside the reminder row */}
      {f >= rowAt[7] + 50 && f < rowAt[8] ? <div style={{position: 'absolute', right: W * 0.08, top: H * 0.3, width: 380 * u, ...glass('rgba(255,255,255,0.8)'), borderRadius: `${26 * u}px ${26 * u}px ${26 * u}px ${6 * u}px`, padding: 22 * u, opacity: ez(f, rowAt[7] + 50, rowAt[7] + 70), transform: `translateY(${(1 - ez(f, rowAt[7] + 50, rowAt[7] + 70)) * 30}px)`}}><div style={{fontFamily: FONT.ui, fontSize: 18 * u, color: LO}}>SMS · Twilio · now</div><div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 26 * u, color: INK, marginTop: 6 * u}}>See you tomorrow at 10. Reply C to confirm.</div></div> : null}
      {/* ref 2 morph: the Approve & Run pill — draft → pressed → approved toast */}
      {f >= t.own - 20 ? (() => { const k = spr(f, t.own - 20, 11); const ok = ez(f, t.approve + 4, t.approve + 20); const pw = lerp(420, 520, ok) * u; return <div style={{position: 'absolute', left: W / 2 - pw / 2, bottom: H * 0.08, width: pw, height: 96 * u, borderRadius: 48 * u, background: ok > 0.5 ? '#19A55A' : PERI_D, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 * u, fontFamily: FONT.ui, fontWeight: 700, fontSize: 34 * u, transform: `scale(${k * (1 - 0.06 * Math.max(0, 1 - Math.abs(f - t.approve) / 6))})`, boxShadow: '0 30px 60px -24px rgba(40,30,80,0.5)'}}>
        <span style={{position: 'absolute', opacity: 1 - ok, filter: `blur(${ok * 8}px)`}}>▷ Approve &amp; Run</span><span style={{position: 'absolute', opacity: ok, filter: `blur(${(1 - ok) * 8}px)`}}>✓ Approved · runs on your logins</span></div>; })() : null}
      {f >= t.own - 30 ? <Cursor x={springTo(f, [[t.own - 30, W * 0.8], [t.approve - 22, W / 2 + 40 * u]], 10)} y={springTo(f, [[t.own - 30, H * 1.05], [t.approve - 22, H * 0.88]], 10)} press={Math.max(0, 1 - Math.abs(f - t.approve) / 5)} hover={ez(f, t.approve - 16, t.approve - 6)} s={u * 1.15} /> : null}
      {/* colour changes between sections (ref 3 arc floods) */}
      <ArcFlood f={f} at={t.l4 - 40} W={W} H={H} color="#14111C" />
      <ArcFlood f={f} at={t.l5 - 40} W={W} H={H} color="#C9CCF8" dir={-1} />
    </AbsoluteFill> : null}
    <ArcFlood f={f} at={t.workflow - 8} W={W} H={H} color="#DCDEFF" />

    {/* ================= S6 · ref 4: stacked cards with giant frosted-glass titles ================= */}
    {inS(S6) ? (() => {
      const pairs: [string, string][] = [['Clinics', 'Salons'], ['Law firms', 'Online shops'], ['Recruiters', 'Studios']];
      const seg = (t.workday - 10 - S6[0]) / 3; const pi = Math.min(2, Math.floor((f - S6[0]) / seg)); const lf = f - (S6[0] + pi * seg);
      const fin = f >= t.workday - 8;
      const arts = [['#6468D8', '#B9BCF6'], ['#E68C74', '#FFD6CA'], ['#2C2950', '#8B8FE8']];
      const Card = ({title, d, i}: {title: string; d: number; i: number}) => { const k = ez(lf, d, d + 26); const out = ez(lf, seg - 14, seg); const a = arts[(pi + i) % 3];
        return <div style={{width: (w ? 760 : 820) * u, height: (w ? 400 : 440) * u, borderRadius: 60 * u, position: 'relative', overflow: 'hidden', background: `linear-gradient(140deg, ${a[0]}, ${a[1]})`, transform: `translateY(${(1 - k) * 300 * u - out * 120 * u}px) scale(${lerp(1.08, 1, k)})`, opacity: k * (1 - out), filter: `blur(${(1 - k) * 12 + out * 8}px)`, boxShadow: '0 50px 90px -40px rgba(40,30,80,0.5)'}}>
          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.35}}><circle cx="78%" cy="20%" r={180 * u} stroke="#fff" strokeWidth={1.5} fill="none" /><line x1="0" y1="62%" x2="100%" y2="62%" stroke="#fff" /></svg>
          <div style={{position: 'absolute', left: 28 * u, top: 26 * u, ...glass('rgba(255,255,255,0.3)'), borderRadius: 99, padding: `${8 * u}px ${18 * u}px`, fontFamily: FONT.ui, fontWeight: 600, fontSize: 22 * u, color: '#fff'}}>Built for</div>
          <div style={{position: 'absolute', left: 30 * u, bottom: -36 * u, fontFamily: FONT.clash, fontWeight: 600, fontSize: Math.min(180, 1180 / Math.max(5, title.length)) * u * (w ? 1 : 1.05), letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 0 rgba(255,255,255,0.8)', WebkitTextStroke: '1.5px rgba(255,255,255,0.75)', whiteSpace: 'nowrap'}}>{title}</div>
        </div>; };
      return <AbsoluteFill>
        <Liquid f={f} a="rgba(139,143,232,0.35)" b="rgba(244,184,168,0.4)" c="rgba(230,232,255,0.6)" base={PAPER} />
        {!fin ? <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36 * u}}><Card title={pairs[pi][0]} d={0} i={0} /><Card title={pairs[pi][1]} d={8} i={1} /></AbsoluteFill>
          : <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LineIn text={<>Your workday, <span style={{color: PERI_D}}>back.</span></>} f={f} at={t.workday - 8} size={(w ? 140 : 100) * u} color={INK} /></AbsoluteFill>}
      </AbsoluteFill>;
    })() : null}

    {/* ================= S7 · ref 3/4: iris closes to a dot → dot becomes the logo → glowing wordmark end card ================= */}
    {inS(S7) ? (() => {
      const a = S7[0]; const R = Math.hypot(W, H); const close = ez(f, a, a + 30, Easing.inOut(Easing.cubic)); const dot = R * (1 - close) + 26 * u * close;
      const logoK = ez(f, a + 30, a + 56);
      return <AbsoluteFill style={{background: `radial-gradient(60% 60% at 50% 46%, #272436, #06050A)`}}>
        <div style={{position: 'absolute', left: W / 2 - dot, top: H * 0.42 - dot, width: dot * 2, height: dot * 2, borderRadius: '50%', background: PERI, opacity: 1 - logoK}} />
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: logoK}}>
          <Lockup f={f} at={a + 30} size={(w ? 200 : 190) * u} th={{bg: '', ink: '#EDEBF5', lo: '#9A95B0', panel: '', panel2: '', line: '', edge: '', node: '', accent: PERI, streakA: '', streakB: '', dark: true}} sub={<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u}}>
            <div style={{padding: `${16 * u}px ${42 * u}px`, borderRadius: 99, background: PERI_D, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 30 * u, boxShadow: `0 0 40px ${PERI}66`}}>Join the waitlist</div>
            <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 24 * u, color: '#B7B3CC'}}>fansachat.com · t.me/fansachat</div>
          </div>} />
        </AbsoluteFill>
      </AbsoluteFill>;
    })() : null}

    {/* dry audio: VO + one SFX per event (music is mixed afterwards = variant B) */}
    {vo.map((l, i) => <Sequence key={i} from={st[i]}><Audio src={staticFile(l.file)} /></Sequence>)}
    {([[t.copy, 'k_click_002', 0.3], [t.paste, 'k_click_002', 0.3], [t.chase, 'k_click_002', 0.3], [t.repeat, 'k_click_002', 0.32], [t.turns, 'k_click_002', 0.35], [t.one - 2, 'k_glass_002', 0.35], [Math.max(t.one + 60, t.sentence - 4) + 14, 'k_click_002', 0.3], [t.workflow - 8, 'k_select_003', 0.25], ...rowAt.map((x) => [x + 30, 'k_pluck_001', 0.18]), [t.approve, 'k_click_002', 0.4], [t.approve + 6, 'k_confirmation_002', 0.22], [S7[0] + 30, 'k_glass_002', 0.32]] as [number, string, number][]).map(([at, s, v], i) => <Sequence key={'s' + i} from={Math.max(0, Math.round(at))}><Audio src={staticFile(`audio/sfx/${s}.ogg`)} volume={v} /></Sequence>)}
    {void Glyph}
  </AbsoluteFill>;
};
