// Per-video hook / problem / payoff scenes. Everything is drawn in the 900x860 visual canvas and is a pure function of the local frame.
import React from 'react';
import {Easing} from 'remotion';
import {glass} from '../intro28/kit';
import {TL} from './timeline';
import {card, Cross, CRASH, ez, FONT, GREEN, hash, INK, LO, lerp, Orb, PERI, PERI_D, Pill, RED, settle, SMOOTH, textW, Tile, VH, VW, Write} from './ui';

type A = any;
const rel = (a: A, abs: number) => abs - a.start;
const AMBERS = ['#FBE7A8', '#F9D9C9', '#E3E4FA', '#FBE7A8', '#F9D9C9'];

// ---------- checklist: rows write in, red crosses draw on at the spoken words ----------
export type Row = {text: string; app?: string};
export const CheckRows: React.FC<{f: number; rows: Row[]; at: number[]; cross: number[]; x: number; y: number; w: number; rowH: number; fs?: number; op?: number}> = ({f, rows, at, cross, x, y, w, rowH, fs = 56, op = 1}) => {
  const longest = rows.reduce((m, r) => Math.max(m, textW(r.text, 100, 600, FONT.clash)), 1);
  const size = Math.min(fs, Math.floor(((w - rowH * 0.7 - (rows.some((r) => r.app) ? rowH * 0.62 : 0) - 70) / longest) * 100));
  return <>{rows.map((r, i) => { const dk = ez(f, cross[i], cross[i] + 6, Easing.out(Easing.cubic)), dk2 = ez(f, cross[i] + 3, cross[i] + 9, Easing.out(Easing.cubic)), rk = ez(f, at[i] - 4, at[i] + 6);
    return <div key={i} style={{position: 'absolute', left: x, top: y + i * rowH, width: w, height: rowH, display: 'flex', alignItems: 'center', gap: 26, opacity: rk * op, transform: `translateY(${(1 - rk) * 10}px)`}}>
      <Cross s={rowH * 0.7} k1={dk} k2={dk2} on={f >= cross[i]} />
      <Write text={r.text} f={f} at={at[i]} style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: size, color: f >= cross[i] + 6 ? 'rgba(34,30,48,0.5)' : INK, letterSpacing: '-0.02em'}} />
      {r.app ? <div style={{marginLeft: 'auto', opacity: ez(f, at[i] + 8, at[i] + 20)}}><Tile k={r.app} size={rowH * 0.62} /></div> : null}
    </div>; })}</>;
};

// ================= P03: numbered list with an open loop (01 shown, 02-03 blurred) =================
export const ListHook: React.FC<{f: number; a: A; tl: TL}> = ({f, a}) => {
  const k = ez(f, -8, 10), push = 1 + 0.05 * ez(f, 0, a.end - a.start, Easing.linear);
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 50%'}}>
    <div style={{position: 'absolute', left: 20, top: 40, width: 860, height: 780, transform: `scale(${lerp(0.95, 1, k)})`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined}}>
      <div style={card({inset: 0, background: 'rgba(24,20,34,0.94)', border: '1px solid rgba(255,255,255,0.12)'})} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(139,143,232,0.25) 1.6px, transparent 2px)', backgroundSize: '40px 40px', borderRadius: 44, opacity: 0.6}} />
      <div style={{position: 'absolute', left: 48, top: 40, right: 48, display: 'flex', alignItems: 'center', gap: 16}}>
        <Pill size={26} bg="rgba(139,143,232,0.18)" fg="#CFD0FA" style={{border: '1px solid rgba(139,143,232,0.4)'}}>5-person agency</Pill>
      </div>
      <div style={{position: 'absolute', left: 48, top: 126, right: 48, fontFamily: FONT.sora, fontWeight: 600, fontSize: 54, color: '#EDEBF5', lineHeight: 1.12}}>Automate these 3 first</div>
      {a.items.map((it: {n: string; t: string}, i: number) => { const ik = ez(f, -10 + i * 3, 4 + i * 3); const blur = i === 0 ? 0 : 15;
        return <div key={it.n} style={{position: 'absolute', left: 48, right: 48, top: 290 + i * 150, height: 124, display: 'flex', alignItems: 'center', gap: 34, opacity: ik, transform: `translateY(${(1 - ik) * 16}px)`, borderRadius: 30, background: i === 0 ? 'rgba(139,143,232,0.16)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? 'rgba(139,143,232,0.5)' : 'rgba(255,255,255,0.10)'}`, padding: '0 34px'}}>
          <div style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 76, color: i === 0 ? PERI : 'rgba(237,235,245,0.4)', letterSpacing: '-0.03em'}}>{it.n}</div>
          <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 52, color: '#EDEBF5', filter: blur ? `blur(${blur}px)` : undefined, opacity: i === 0 ? 1 : 0.55, whiteSpace: 'nowrap'}}>{it.t}</div>
        </div>; })}
    </div>
  </div>;
};

// ================= P03: the empty composer flashes in ("each one takes one sentence") =================
export const ChatFlash: React.FC<{f: number; a: A}> = ({f}) => {
  const k = settle(f, 2, 16), pulse = 0.5 + 0.5 * Math.sin(f / 6);
  return <div style={{position: 'absolute', left: 20, top: 250, width: 860, height: 300, opacity: Math.min(1, k * 1.5), transform: `scale(${0.9 + 0.1 * k})`}}>
    <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 44, background: 'linear-gradient(100deg, rgba(232,233,251,0.95), rgba(253,236,231,0.95))', border: '1.5px solid rgba(255,255,255,0.98)', boxShadow: `0 0 ${40 + 30 * pulse}px rgba(100,104,216,${0.25 + 0.2 * pulse}), 0 50px 90px -40px rgba(40,30,80,0.38)`}} />
    <div style={{position: 'absolute', left: 40, top: 36, display: 'flex', alignItems: 'center', fontFamily: FONT.ui, fontWeight: 500, fontSize: 40, color: LO}}>Describe a workflow…{Math.floor(f / 8) % 2 === 0 ? <span style={{width: 4, height: 42, background: PERI_D, marginLeft: 6, borderRadius: 2}} /> : null}</div>
    <div style={{position: 'absolute', left: 40, bottom: 34}}><Pill size={30} bg="rgba(100,104,216,0.14)" fg={PERI_D} style={{border: 'none'}}>1 sentence</Pill></div>
  </div>;
};

// ================= P04: MYTH or FACT card -> checklist -> MYTH fills red =================
const CODE = ['if (payment.status === "paid") {', '  rows.push({ id, amount, date });', '  await sheet.sync(token);', '} else { retry(queue, 3); }', 'for (const c of customers) {', '  webhook.verify(sig, secret);', '}', 'const cron = "0 9 * * 1-5";'];
export const MythCard: React.FC<{f: number; a: A; tl: TL}> = ({f, a, tl}) => {
  const t1 = rel(a, tl.S[1]), t2 = rel(a, tl.S[2]);
  const k = ez(f, -8, 10), p1 = ez(f, t1, t1 + 14), p2 = ez(f, t2, t2 + 10);
  const pop = ez(f, t2 + 3, t2 + 15, CRASH), press = Math.max(0, 1 - Math.abs(f - (t2 + 2)) / 3);
  const red = ez(f, t2 + 2, t2 + 8);
  const cues = [tl.w(1, 'stripe'), tl.w(1, 'sheet'), tl.w(1, 'miss')].map((x) => rel(a, x) + 6);
  const rowAt = [rel(a, tl.w(1, 'check')), rel(a, tl.w(1, 'update')), rel(a, tl.w(1, 'hope'))].map((x, i) => Math.min(x, t1 + 8 + i * 10));
  const wall = 1 - 0.6 * p1;
  return <div style={{position: 'absolute', inset: 0}}>
    {/* wall of code drifting behind (rack-focus blur) */}
    {CODE.map((c, i) => <div key={i} style={{position: 'absolute', left: ((i * 173) % 560) - 40 + 30 * Math.sin(f / 50 + i), top: 20 + i * 104 + ((f * 0.6 + i * 40) % 40), fontFamily: 'Consolas, "Courier New", monospace', fontSize: 34, color: PERI_D, opacity: 0.22 * wall * k, filter: `blur(${2 + 3 * p1}px)`, whiteSpace: 'pre'}}>{c}</div>)}
    <div style={{position: 'absolute', left: 20, top: 110, width: 860, height: 640, transform: `scale(${lerp(0.95, 1, k)})`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined}}>
      <div style={card({inset: 0})} />
      {/* hook: the myth, quoted */}
      <div style={{position: 'absolute', left: 52, right: 52, top: 190, opacity: 1 - p1, filter: `blur(${p1 * 14}px)`, fontFamily: FONT.sora, fontWeight: 600, fontSize: 62, lineHeight: 1.14, color: INK}}>
        “You need to <span style={{color: PERI_D}}>code</span> to automate your business.”
      </div>
      {/* problem: payments tracked by hand */}
      {p1 > 0 ? <div style={{opacity: 1 - p2 * 0.85, filter: `blur(${p2 * 12}px)`}}><CheckRows f={f} rows={[{text: 'Check Stripe', app: 'stripe'}, {text: 'Update the sheet', app: 'airtable'}, {text: 'Hope I missed none'}]} at={rowAt} cross={cues} x={44} y={150} w={772} rowH={150} fs={56} op={p1} /></div> : null}
    </div>
    {/* the two pills */}
    {[['MYTH', 0], ['FACT', 1]].map(([lab, i]) => { const isM = i === 0;
      const x = isM ? lerp(120, 450 - 130, pop) : 520, y = isM ? lerp(30, 330, pop) : 30, sc = isM ? lerp(1, 2.0, pop) * (1 - 0.08 * press) : 1;
      return <div key={lab as string} style={{position: 'absolute', left: x, top: y, width: 260, height: 90, transformOrigin: '50% 50%', transform: `scale(${sc})`, opacity: isM ? 1 : 1 - p2, zIndex: 5}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: isM ? `rgba(229,72,77,${red})` : '#fff', border: `3px solid ${isM && red > 0.5 ? RED : 'rgba(32,28,46,0.18)'}`, boxShadow: isM && red > 0.1 ? `0 24px 50px -20px rgba(229,72,77,${0.7 * red})` : '0 14px 30px -18px rgba(40,30,80,0.4)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.clash, fontWeight: 600, fontSize: 48, letterSpacing: '0.06em', color: isM && red > 0.5 ? '#fff' : INK}}>{lab}</div>
      </div>; })}
  </div>;
};

// ================= P05: sticky notes vs automatic (split) -> notes pile -> one forgotten note =================
const NOTES = [['add to CRM', 0.1, 0.05, -6], ['prep call', 0.62, 0.0, 5], ['follow up', 0.28, 0.32, 3], ['send invite', 0.75, 0.38, -4], ['reply?', 0.05, 0.62, 7], ['prep call??', 0.5, 0.66, -3], ['update deal', 0.85, 0.7, 6]] as [string, number, number, number][];
export const SplitScene: React.FC<{f: number; a: A; tl: TL}> = ({f, a, tl}) => {
  const t1 = rel(a, tl.S[1]), t2 = rel(a, tl.S[2]);
  const k = ez(f, -8, 10), ex = ez(f, t1, t1 + 22, SMOOTH), focus = ez(f, t2, t2 + 14);
  const Wp = lerp(424, 860, ex), Hp = lerp(660, 700, ex), Lx = 20, Rx = 456 + ex * 470;
  const cross = ez(f, rel(a, tl.w(1, 'day')), rel(a, tl.w(1, 'day')) + 12, Easing.out(Easing.cubic));
  const fade2 = 1 - ez(f, t2 + 40, t2 + 56);
  const notesVis = Math.min(NOTES.length, 4 + Math.floor(ex * 3));
  return <div style={{position: 'absolute', inset: 0, opacity: 1}}>
    {/* labels */}
    <div style={{position: 'absolute', left: Lx, top: 0, opacity: k * (1 - ex)}}><Pill size={34} bg="#fff">This · Sticky notes</Pill></div>
    <div style={{position: 'absolute', left: 456, top: 0, opacity: k * (1 - ex)}}><Pill size={34} bg={PERI_D} fg="#fff">That · Automatic</Pill></div>
    {/* left: sticky notes */}
    <div style={{position: 'absolute', left: Lx, top: 100, width: Wp, height: Hp, opacity: k, filter: focus > 0 ? undefined : undefined}}>
      <div style={card({inset: 0, borderRadius: 40})} />
      {NOTES.slice(0, notesVis).map(([t, fx, fy, rot], i) => { const isPrep = t === 'prep call??'; const nk = settle(f, -10 + i * 3, 14); const fall = i === 3 ? ez(f, t1 + 30, t1 + 60, Easing.in(Easing.cubic)) : 0;
        const nW = 210, nH = 150; const x = fx * (Wp - nW - 20) + 10, y = fy * (Hp - nH - 20) + 10 + fall * 160;
        const blurOthers = isPrep ? 0 : focus * 9; const big = isPrep ? focus : 0;
        return <div key={t} style={{position: 'absolute', left: lerp(x, Wp / 2 - nW / 2, big), top: lerp(y, Hp / 2 - nH / 2, big), width: nW, height: nH, transform: `rotate(${lerp(rot, 0, big)}deg) scale(${(0.7 + 0.3 * nk) * (1 + 0.55 * big)})`, opacity: Math.min(1, nk * 1.5) * (1 - fall * 0.6) * (isPrep ? 1 - ez(f, t2 + 44, t2 + 60) : 1 - focus * 0.55 * fade2), filter: blurOthers ? `blur(${blurOthers}px)` : undefined, background: AMBERS[i % AMBERS.length], borderRadius: 10, boxShadow: '0 14px 30px -14px rgba(40,30,80,0.45)', padding: 16, boxSizing: 'border-box', fontFamily: FONT.ui, fontWeight: 600, fontSize: 30, color: '#4B4636', lineHeight: 1.15}}>
          {t}<div style={{marginTop: 10, height: 8, width: '70%', borderRadius: 4, background: 'rgba(75,70,54,0.25)'}} /><div style={{marginTop: 8, height: 8, width: '45%', borderRadius: 4, background: 'rgba(75,70,54,0.18)'}} />
        </div>; })}
      {cross > 0 ? <svg width={Wp} height={Hp} style={{position: 'absolute', inset: 0, opacity: 1 - focus}}><path d={`M${Wp * 0.18} ${Hp * 0.2} L${Wp * 0.82} ${Hp * 0.8}`} stroke={RED} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${cross} 1`} /><path d={`M${Wp * 0.82} ${Hp * 0.2} L${Wp * 0.18} ${Hp * 0.8}`} stroke={RED} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0, cross - 0.3) / 0.7} 1`} /></svg> : null}
    </div>
    {/* right: automatic */}
    <div style={{position: 'absolute', left: Rx, top: 100, width: 424, height: 660, opacity: k * (1 - ex), transform: `scale(${1 - 0.12 * ex})`, filter: ex > 0 ? `blur(${ex * 10}px)` : undefined}}>
      <div style={card({inset: 0, borderRadius: 40})} />
      {[['calendly', 'New booking'], ['pipedrive', 'Deal created'], ['trello', 'Prep card ready']].map(([app, t], i) => { const ik = ez(f, -8 + i * 5, 8 + i * 5);
        return <div key={app} style={{position: 'absolute', left: 24, right: 24, top: 44 + i * 196, height: 150, borderRadius: 30, background: '#F7F6FB', border: '1px solid rgba(32,28,46,0.08)', opacity: ik, transform: `translateY(${(1 - ik) * 14}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <Tile k={app} size={64} on />
          <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, color: INK}}>{t}</div>
          <div style={{position: 'absolute', right: 14, top: 14, width: 34, height: 34, borderRadius: 99, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui}}>✓</div>
        </div>; })}
    </div>
  </div>;
};

// ================= P06: inbox with a buried URGENT line -> checklist =================
const INBOX = [['Quick question', 'Can you resend the file?'], ['Quick question', 'What are your hours?'], ['Quick question', 'Do you have a template?'], ['URGENT', 'Site is down, need help now'], ['Quick question', 'Is this included?'], ['Quick question', 'One small tweak?'], ['Quick question', 'Where is the invoice?']];
const HUES = ['#C9CBF5', '#F4C9BE', '#D6E8DA', '#EBD9F2', '#F7E2B8', '#C9E2F2', '#F4C9BE'];
export const InboxScene: React.FC<{f: number; a: A; tl: TL}> = ({f, a, tl}) => {
  const t1 = rel(a, tl.S[1]), k = ez(f, -8, 10), p1 = ez(f, t1, t1 + 16), push = 1 + 0.06 * ez(f, 0, t1, Easing.linear);
  const cues = [tl.w(1, 'everything'), tl.w(1, 'spot'), tl.w(1, 'task'), tl.w(1, 'team')].map((x) => rel(a, x) + 8);
  const rowAt = [rel(a, tl.w(1, 'read')), rel(a, tl.w(1, 'spot')) - 6, rel(a, tl.w(1, 'make')) - 4, rel(a, tl.w(1, 'tell')) - 4].map((x, i) => Math.min(x, t1 + 8 + i * 9));
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 40%'}}>
    <div style={{position: 'absolute', left: 20, top: 30, width: 860, height: 790, transform: `scale(${lerp(0.95, 1, k)})`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined}}>
      <div style={card({inset: 0})} />
      <div style={{position: 'absolute', left: 44, top: 34, right: 44, display: 'flex', alignItems: 'center', gap: 16, opacity: 1 - p1}}>
        <Tile k="intercom" size={64} /><div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 44, color: INK}}>Client inbox</div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - p1, filter: `blur(${p1 * 14}px)`}}>
        {INBOX.map(([who, msg], i) => { const urgent = who === 'URGENT'; const ik = ez(f, -10 + i * 1.5, 4 + i * 1.5);
          return <div key={i} style={{position: 'absolute', left: 36, right: 36, top: 122 + i * 94, height: 82, borderRadius: 22, background: urgent ? 'rgba(229,72,77,0.10)' : '#F7F6FB', border: `2px solid ${urgent ? 'rgba(229,72,77,0.55)' : 'rgba(32,28,46,0.06)'}`, opacity: ik, transform: `translateX(${(1 - ik) * 30}px)`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', boxSizing: 'border-box'}}>
            <div style={{width: 46, height: 46, borderRadius: 99, background: HUES[i], flex: 'none'}} />
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: FONT.ui, fontWeight: 700, fontSize: 24, color: urgent ? RED : LO, letterSpacing: urgent ? '0.08em' : 0}}>{who}</div>
              <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 28, color: INK, whiteSpace: 'nowrap'}}>{msg}</div>
            </div>
            {urgent ? <div style={{marginLeft: 'auto', width: 18, height: 18, borderRadius: 99, background: RED, boxShadow: `0 0 0 ${6 + 6 * Math.abs(Math.sin(f / 7))}px rgba(229,72,77,0.2)`}} /> : null}
          </div>; })}
      </div>
      {p1 > 0 ? <CheckRows f={f} rows={[{text: 'Read everything'}, {text: 'Spot the urgent one'}, {text: 'Make a task'}, {text: 'Tell the team'}]} at={rowAt} cross={cues} x={48} y={70} w={764} rowH={160} fs={58} op={p1} /> : null}
    </div>
  </div>;
};

// ================= P07: numbered brief card (blurred title) -> bubbles + checklist -> title un-blurs, card flips =================
export const BriefScene: React.FC<{f: number; a: A; tl: TL}> = ({f, a, tl}) => {
  const t1 = rel(a, tl.S[1]), t2 = rel(a, tl.S[2]), end = a.end - a.start;
  const k = ez(f, -8, 10), p1 = ez(f, t1, t1 + 16), p2 = ez(f, t2, t2 + 12), push = 1 + 0.05 * ez(f, 0, t1, Easing.linear);
  const flip = ez(f, end - 14, end, Easing.in(Easing.cubic));
  const cues = [tl.w(1, 'dm'), tl.w(1, 'email'), tl.w(1, 'form'), tl.w(1, 'rebuild')].map((x) => rel(a, x) + 8);
  const rowAt = [rel(a, tl.w(1, 'briefs')), rel(a, tl.w(1, 'dm')) + 2, rel(a, tl.w(1, 'email')) + 2, rel(a, tl.w(1, 'rebuild')) - 6].map((x, i) => Math.min(x, t1 + 8 + i * 9));
  const bub = [['DM', 'dm', 0], ['Email', 'mail', 2.1], ['Form', 'tally', 4.2]] as [string, string, number][];
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${push}) scaleX(${1 - flip})`, transformOrigin: '50% 50%'}}>
    {/* message bubbles swirling around the card */}
    {bub.map(([lab, app, ph], i) => { const ang = f / 38 + ph, x = 450 + Math.cos(ang) * 400 - 90, y = 420 + Math.sin(ang) * 380 - 36; const bk = p1 * (1 - p2);
      return <div key={lab} style={{position: 'absolute', left: x, top: y, opacity: bk, filter: `blur(${(1 - bk) * 8}px)`, zIndex: 6}}><Pill size={30} style={{display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 16px 30px -16px rgba(40,30,80,0.45)'}}><Tile k={app} size={46} />{lab}</Pill></div>; })}
    <div style={{position: 'absolute', left: 20, top: 70, width: 860, height: 700, transform: `scale(${lerp(0.95, 1, k)})`, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined}}>
      <div style={card({inset: 0})} />
      <div style={{position: 'absolute', left: 52, top: 40}}><Pill size={28} bg="rgba(100,104,216,0.14)" fg={PERI_D} style={{border: 'none'}}>Freelance designer</Pill></div>
      <div style={{position: 'absolute', left: 52, top: 130, right: 52, opacity: 1 - p1, filter: `blur(${p1 * 14}px)`}}>
        <div style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 250, lineHeight: 1, color: PERI_D, letterSpacing: '-0.04em'}}>01</div>
        <div style={{marginTop: 20, fontFamily: FONT.sora, fontWeight: 600, fontSize: 68, color: INK, filter: `blur(${(1 - p2) * 20}px)`, whiteSpace: 'nowrap'}}>The brief catcher</div>
      </div>
      {p1 > 0 ? <div style={{opacity: 1 - p2, filter: `blur(${p2 * 14}px)`}}><CheckRows f={f} rows={[{text: 'Briefs by DM'}, {text: 'Briefs by email'}, {text: 'Briefs in a form'}, {text: 'Rebuild the to-do list'}]} at={rowAt} cross={cues} x={52} y={110} w={756} rowH={140} fs={54} op={p1} /></div> : null}
      {p2 > 0 ? <div style={{position: 'absolute', left: 52, top: 190, right: 52, opacity: p2, transform: `translateY(${(1 - p2) * 20}px)`}}>
        <div style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 250, lineHeight: 1, color: PERI_D, letterSpacing: '-0.04em'}}>01</div>
        <div style={{marginTop: 20, fontFamily: FONT.sora, fontWeight: 600, fontSize: 68, color: INK, whiteSpace: 'nowrap'}}>The brief catcher</div>
      </div> : null}
    </div>
  </div>;
};

// ================= P04 payoff: Telegram ping + Airtable row =================
export const PingScene: React.FC<{f: number; a: A; tl: TL}> = ({f, a, tl}) => {
  const tPing = Math.max(8, rel(a, tl.w(a.line, 'you')) - 4), k = settle(f, tPing, 14), rowK = settle(f, tPing + 8, 14), glow = ez(f, tPing + 10, tPing + 26);
  const base = ez(f, -8, 10);
  return <div style={{position: 'absolute', inset: 0}}>
    <div style={{position: 'absolute', left: 20, top: 330, width: 860, height: 470, opacity: base}}>
      <div style={card({inset: 0, borderRadius: 38})} />
      <div style={{position: 'absolute', left: 40, top: 30, display: 'flex', alignItems: 'center', gap: 16}}><Tile k="airtable" size={56} /><div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 40, color: INK}}>Income</div></div>
      {['Date', 'Customer', 'Amount'].map((h, i) => <div key={h} style={{position: 'absolute', left: 40 + i * 270, top: 112, fontFamily: FONT.ui, fontWeight: 600, fontSize: 24, color: LO}}>{h}</div>)}
      {[0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: 40, right: 40, top: 152 + r * 62, height: 48, display: 'flex', gap: 30, alignItems: 'center'}}>{[150, 190, 120].map((w, c) => <div key={c} style={{width: w, height: 18, borderRadius: 9, background: '#E7E4F0', marginRight: 70 + (c === 0 ? 0 : 0)}} />)}</div>)}
      <div style={{position: 'absolute', left: 28, right: 28, top: 338 + (1 - rowK) * 40, height: 62, borderRadius: 18, background: `rgba(47,182,124,${0.14 * glow})`, border: `2px solid rgba(47,182,124,${glow})`, opacity: rowK, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 24, boxSizing: 'border-box'}}>
        <div style={{width: 130, height: 18, borderRadius: 9, background: 'rgba(47,182,124,0.45)'}} /><div style={{padding: '4px 14px', borderRadius: 10, background: 'rgba(100,104,216,0.14)', color: PERI_D, fontFamily: FONT.ui, fontWeight: 600, fontSize: 24}}>{'{customer}'}</div><div style={{marginLeft: 'auto', width: 110, height: 18, borderRadius: 9, background: 'rgba(47,182,124,0.6)'}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 50, top: 40, width: 800, height: 210, opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * -90}px) scale(${0.96 + 0.04 * k})`}}>
      <div style={{...glass('rgba(255,255,255,0.8)'), position: 'absolute', inset: 0, borderRadius: 42, background: 'rgba(255,255,255,0.94)'}} />
      <div style={{position: 'absolute', left: 36, top: 34, display: 'flex', gap: 24, alignItems: 'center'}}><Tile k="telegram" size={84} />
        <div><div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, color: LO}}>Telegram Bot · now</div>
          <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 44, color: INK, marginTop: 6, whiteSpace: 'nowrap'}}>New payment from <span style={{color: PERI_D, background: 'rgba(100,104,216,0.14)', borderRadius: 10, padding: '0 10px'}}>{'{customer}'}</span></div></div>
      </div>
    </div>
  </div>;
};

// ================= P03 recap: the three workflows side by side =================
export const RecapScene: React.FC<{f: number; a: A}> = ({f, a}) => {
  const k = ez(f, -8, 16), zoom = lerp(1.35, 1, ez(f, -8, 26, SMOOTH));
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 45%', filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined}}>
    {a.items.map((it: {n: string; t: string; a: string; b: string}, i: number) => { const ik = settle(f, 2 + i * 6, 14), on = ez(f, 22 + i * 8, 32 + i * 8);
      return <div key={it.n} style={{position: 'absolute', left: 20, top: 40 + i * 268, width: 860, height: 236, opacity: Math.min(1, ik * 1.6), transform: `translateY(${(1 - ik) * 30}px)`}}>
        <div style={card({inset: 0, borderRadius: 40, border: `2px solid ${on > 0.5 ? GREEN : 'rgba(255,255,255,0.95)'}`})} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${on * 100}%`, borderRadius: 40, background: 'rgba(47,182,124,0.09)'}} />
        <div style={{position: 'absolute', left: 40, top: 26, display: 'flex', alignItems: 'baseline', gap: 20}}><span style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 56, color: PERI_D}}>{it.n}</span><span style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 44, color: INK}}>{it.t}</span></div>
        <div style={{position: 'absolute', left: 40, bottom: 28, display: 'flex', alignItems: 'center', gap: 26}}><Tile k={it.a} size={86} on={on > 0.5} />
          <svg width={90} height={20} viewBox="0 0 90 20"><path d="M2 10 H84 M72 3 L84 10 L72 17" stroke={on > 0.5 ? GREEN : '#2B2734'} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <Tile k={it.b} size={86} on={on > 0.5} /></div>
        <div style={{position: 'absolute', right: 34, bottom: 38, width: 56, height: 56, borderRadius: 99, background: GREEN, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on})`}}>✓</div>
      </div>; })}
  </div>;
};

// ================= P05 poll: This / That =================
export const PollScene: React.FC<{f: number; a: A}> = ({f, a}) => {
  const k = settle(f, -4, 14), win = ez(f, 26, 40);
  return <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, k * 1.5), transform: `scale(${0.95 + 0.05 * k})`}}>
    {[['This', 'Sticky notes', 0], ['That', 'Automatic', 1]].map(([t, sub, i]) => { const mine = i === 1;
      return <div key={t as string} style={{position: 'absolute', left: 20 + (i as number) * 440, top: 110, width: 420, height: 620, transform: `scale(${mine ? 1 + 0.04 * win : 1 - 0.03 * win})`, opacity: mine ? 1 : 1 - 0.3 * win}}>
        <div style={card({inset: 0, borderRadius: 40, border: `3px solid ${mine ? `rgba(100,104,216,${0.25 + 0.75 * win})` : 'rgba(255,255,255,0.95)'}`, boxShadow: mine && win > 0 ? `0 0 ${60 * win}px rgba(100,104,216,${0.4 * win}), 0 50px 90px -40px rgba(40,30,80,0.38)` : undefined})} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 44, display: 'flex', justifyContent: 'center'}}><Pill size={36} bg={mine ? PERI_D : '#F1EFF8'} fg={mine ? '#fff' : INK} style={{border: 'none'}}>{t}</Pill></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
          {mine ? <div style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center'}}>{['calendly', 'pipedrive', 'trello'].map((app) => <Tile key={app} k={app} size={84} on />)}</div>
            : <div style={{position: 'relative', width: 240, height: 250}}>{[0, 1, 2].map((j) => <div key={j} style={{position: 'absolute', left: 10 + j * 26, top: 10 + j * 50, width: 200, height: 130, background: AMBERS[j], transform: `rotate(${[-7, 5, -3][j]}deg)`, borderRadius: 8, boxShadow: '0 12px 24px -12px rgba(40,30,80,0.45)'}} />)}</div>}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: FONT.sora, fontWeight: 600, fontSize: 44, color: INK}}>{sub}</div>
      </div>; })}
  </div>;
};

// ================= full-bleed dark scenes (drawn by the stage, not in the canvas) =================
export const TurnWords: React.FC<{f: number; a: A; tl: TL; size: number}> = ({f, a, tl, size}) => {
  const words: string[] = a.words; const g0 = rel(a, tl.w(a.line, 'fix'));
  const items = words.map((w, i) => { const at = rel(a, tl.w(a.line, w.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4))); return {w, k: ez(f, at - 2, at + 10), i}; });
  const g = f >= g0 && f < g0 + 10; const j = (s: number) => (hash(f, s) - 0.5) * 18;
  const out = 1 - ez(f, a.end - a.start - 14, a.end - a.start - 2);
  return <div style={{display: 'flex', gap: size * 0.24, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', opacity: out, padding: '0 40px'}}>
    {items.map(({w, k}) => { const fx = w.toLowerCase().startsWith('fix');
      return <div key={w} style={{position: 'relative', opacity: Math.max(k, 0.0), transform: `translateY(${(1 - k) * 24}px)`, filter: `blur(${(1 - k) * 12}px)`, fontFamily: FONT.clash, fontWeight: 600, fontSize: size, letterSpacing: '-0.03em', color: fx ? PERI : '#EDEBF5', lineHeight: 1}}>
        {fx && g ? <>
          <span style={{position: 'absolute', left: j(1), top: j(2) * 0.3, color: 'rgba(255,60,90,0.85)', mixBlendMode: 'screen'}}>{w}</span>
          <span style={{position: 'absolute', left: -j(3), top: -j(4) * 0.3, color: 'rgba(60,220,255,0.85)', mixBlendMode: 'screen'}}>{w}</span>
        </> : null}
        <span style={{position: 'relative', clipPath: fx && g ? `inset(${hash(f, 5) * 40}% 0 ${hash(f, 6) * 30}% 0)` : undefined}}>{w}</span>
      </div>; })}
  </div>;
};
