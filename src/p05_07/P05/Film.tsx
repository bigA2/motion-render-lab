// P05 picture. All timing comes from plan.ts (shared with the sound). Fictional people/data only.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {At, CameraRig, hitShake} from '../kit/CameraRig';
import {clamp, lerp, noise1, prog} from '../kit/curves';
import {F} from '../kit/fonts';
import {Corners, LiveBorder, LivingBg, Pal, a} from '../kit/Living';
import {EndCard} from '../kit/EndCard';
import {GiantLetters, TrackIn, TypedText, VoLine, longShadow} from '../kit/type';
import {Avatar, Check, Cursor, Logo, Row, Stamp, Tag, Th, Toast, Win, Wire, wirePt} from '../kit/ui';
import * as P from './plan';

export const PAL: Pal = {bg: '#DCE3EA', bg2: '#BCC9D8', glow: '#FFFFFF', glow2: '#B7A6FF', line: '#AFBCCC', ink: '#0B1520', muted: '#56657A', accent: '#6A4CFF', hot: '#E2491A', panel: '#F7F9FC', panelLine: '#D3DCE6', dark: false};
export const TH: Th = {panel: '#FFFFFF', panel2: '#F3F5F9', line: '#E0E5EE', ink: '#0B1520', muted: '#5E6B7E', accent: '#6A4CFF', hot: '#E2491A', ok: '#14A06A', font: F.sans, mono: F.mono, dark: false};
const {L, T} = P;
const vis = (f: number, a0: number, b0: number) => f >= a0 && f < b0;

// ---------------- hook ----------------
const STICKIES = [
  {t: 'Dana W. call Thu??', x: -190, y: -150, r: -8, c: '#FFE066'}, {t: 'follow up Jen', x: 40, y: -210, r: 6, c: '#FF9EBB'},
  {t: 'Rio Labs budget?', x: -120, y: 30, r: 4, c: '#9EE6FF'}, {t: 'send deck !!', x: 90, y: -20, r: -6, c: '#FFE066'},
  {t: "who's Marco?", x: -40, y: 200, r: -3, c: '#C7F59A'}, {t: 'CRM later…', x: 150, y: 170, r: 9, c: '#FF9EBB'},
];
const Sticky: React.FC<{t: string; c: string; w?: number; size?: number}> = ({t, c, w = 250, size = 40}) => (
  <div style={{width: w, height: w * 0.86, background: c, borderRadius: 6, boxShadow: '0 18px 30px rgba(40,40,60,.22), inset 0 -10px 18px rgba(0,0,0,.05)', padding: 22, fontFamily: F.serif, fontSize: size, lineHeight: 1.05, color: '#2A2418', position: 'relative'}}>
    <div style={{position: 'absolute', top: -12, left: w / 2 - 40, width: 80, height: 26, background: a('#ffffff', 0.55), transform: 'rotate(-3deg)'}} />{t}
  </div>
);
const CALLS = [['Dana Whitfield', 'Northbeam', 'Thu 2:30'], ['Marco Ruiz', 'Brightline Studio', 'Fri 10:00'], ['Jen Okafor', 'Cobalt & Co', 'Fri 1:15']];
const DashMini: React.FC<{f: number}> = ({f}) => (
  <Win th={TH} w={520} logo="pipedrive" title="Today's calls" meta={<Tag c={TH.ok}>Auto</Tag>} pad={22}>
    {CALLS.map(([n, c, t], i) => <Row key={n} gap={14} style={{padding: '14px 0', borderBottom: i < 2 ? `1.5px solid ${TH.line}` : undefined, opacity: clamp((f - 30 - i * 8) / 10)}}>
      <Avatar name={n} size={48} /><div style={{flex: 1}}><div style={{fontSize: 25, fontWeight: 700}}>{n}</div><div style={{fontSize: 22, color: TH.muted}}>{c} · {t}</div></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end'}}><Tag c={TH.accent} size={19}>Deal ✓</Tag><Tag c={TH.ok} size={19}>Prep ✓</Tag></div></Row>)}
  </Win>
);
const Hook: React.FC<{f: number}> = ({f}) => (
  <>
    <At x={L.pile.x - 110} y={L.pile.y - 90}>{STICKIES.map((s, i) => { const p = prog(f, -14 + i * 4, 24, 'snapOut');
      return <div key={i} style={{position: 'absolute', left: s.x * 0.62, top: s.y * 0.85, transform: `rotate(${s.r + noise1(f / 50, i) * 2}deg) scale(${lerp(1.3, 1, p)})`, opacity: p}}><Sticky t={s.t} c={s.c} w={200} size={32} /></div>; })}</At>
    <At x={L.dash.x - 230} y={L.dash.y - 230} o={clamp((f + 6) / 10)} s={lerp(0.92, 1, prog(f, -6, 40, 'snapOut'))}><div style={{transform: 'scale(0.9)', transformOrigin: '0 0'}}><DashMini f={f} /></div></At>
    <At x={790 - 230} y={640} w={460} style={{textAlign: 'center'}}><GiantLetters text="THIS" f0={T.this} stagger={4} size={128} color={PAL.hot} shadow={longShadow('#9C2E0C', 12)} font={F.display} /></At>
    <At x={1370 - 230} y={640} w={460} style={{textAlign: 'center'}}><GiantLetters text="THAT" f0={T.that} stagger={4} size={128} color={PAL.accent} shadow={longShadow('#3B2A99', 12)} font={F.display} /></At>
    <At x={L.div - 470} y={1330} w={420} style={{textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: PAL.hot, opacity: clamp((f - T.this) / 10)}}>3 calls · 0 prepped</At>
    <At x={L.div + 50} y={1330} w={420} style={{textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: PAL.accent, opacity: clamp((f - T.that) / 10)}}>3 calls · 3 prepped</At>
    <At x={L.div - 340} y={1440} w={300} style={{textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: 4, color: PAL.muted, opacity: clamp((f - T.this) / 10)}}>STICKY NOTES</At>
    <At x={L.div + 40} y={1440} w={300} style={{textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: 4, color: PAL.muted, opacity: clamp((f - T.that) / 10)}}>AUTOMATIC</At>
  </>
);
const Divider: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{position: 'absolute', left: L.div - 1.5, top: -400, width: 3, height: 5000, background: `linear-gradient(180deg, transparent, ${a(PAL.ink, 0.25)} 10%, ${a(PAL.ink, 0.25)} 90%, transparent)`}} />
    <div style={{position: 'absolute', left: L.div - 1.5, top: ((f * 9) % 2400) - 200, width: 3, height: 220, background: `linear-gradient(180deg, transparent, ${PAL.accent}, transparent)`}} />
    <At x={L.div - 46} y={960} w={92} h={92} style={{borderRadius: 46, background: PAL.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.serif, fontSize: 46, boxShadow: `0 0 0 8px ${a(PAL.bg, 0.8)}`}}>or</At>
  </>
);

// ---------------- problem ----------------
const Board: React.FC<{f: number}> = ({f}) => (
  <At x={L.board.x - 420} y={L.board.y - 250} w={840} h={500} style={{borderRadius: 26, background: '#E9DCC5', boxShadow: 'inset 0 0 0 10px #D8C6A6, 0 30px 60px rgba(60,50,30,.2)'}}>
    <div style={{position: 'absolute', left: 30, top: 24, fontFamily: F.mono, fontSize: 22, letterSpacing: 3, color: '#7A6648'}}>TO DO (SOMEDAY)</div>
    {[['invoice Q3?', '#9EE6FF', 560, 30, 7]].map(([t, c, x, y, r], i) => <div key={i} style={{position: 'absolute', left: x as number, top: y as number, transform: `rotate(${r}deg)`, opacity: 0.85}}><Sticky t={t as string} c={c as string} w={200} size={30} /></div>)}
    {P.notes.map((n, i) => { const p = prog(f, n.at - 8, 14, 'snapOut'); if (f < n.at - 8) return null; const fall = i === 0 ? prog(f, T.dayStart + 40, 40, 'inHard') : 0;
      return <div key={i} style={{position: 'absolute', left: 290 + n.x, top: 130 + n.y + fall * 700, transform: `rotate(${n.r + fall * 40}deg) scale(${lerp(1.5, 1, p)})`, opacity: p}}><Sticky t={n.txt} c={n.c} w={240} size={38} />
        {i === 1 && f >= T.xMark && <svg width={240} height={210} style={{position: 'absolute', left: 0, top: 0}}><path d="M30 30 L210 180 M210 30 L30 180" stroke={PAL.hot} strokeWidth={14} strokeLinecap="round" fill="none" strokeDasharray={520} strokeDashoffset={520 * (1 - prog(f, T.xMark, 14, 'swift'))} /></svg>}</div>; })}
  </At>
);
const Calendar: React.FC<{f: number}> = ({f}) => {
  const n = P.meetAt.filter((x) => f >= x).length;
  return <At x={L.cal.x - 420} y={L.cal.y - 300} o={clamp((f - (T.dayStart - 30)) / 16)}>
    <Win th={TH} w={840} logo="calendly" title="Thu, Nov 13" meta={<><span style={{fontFamily: F.mono}}>{n}</span> meetings</>} pad={20}>
      <div style={{position: 'relative', height: 520}}>
        {['9', '10', '11', '12', '1', '2', '3', '4'].map((h, i) => <div key={h} style={{position: 'absolute', left: 0, top: i * 64, width: '100%', borderTop: `1.5px solid ${TH.line}`, fontSize: 20, color: TH.muted, paddingTop: 2}}>{h}{i < 3 ? ' AM' : ' PM'}</div>)}
        {P.MEET.map(([t, name, c], i) => { if (f < P.meetAt[i]) return null; const p = prog(f, P.meetAt[i], 14, 'spring'); const hh = parseFloat(t.replace(':30', '.5').replace(':00', ''));
          const row = (hh < 9 ? hh + 12 : hh) - 9; const cols = ['#7C8BFF', '#F4A261', '#5BC0EB', '#9B5DE5', PAL.hot];
          return <div key={i} style={{position: 'absolute', left: 90 + (i % 2) * 330, top: row * 64 + 4, width: 320, height: 56, borderRadius: 12, background: a(cols[c], i === 6 ? 0.22 : 0.16), borderLeft: `6px solid ${cols[c]}`, padding: '6px 12px', fontSize: 21, fontWeight: 600, transform: `scale(${p})`, transformOrigin: 'left center', whiteSpace: 'nowrap', overflow: 'hidden'}}>
            <span style={{color: TH.muted, fontFamily: F.mono, fontSize: 18}}>{t}</span> {name}</div>; })}
      </div>
    </Win>
  </At>;
};
const Slacky: React.FC<{f: number}> = ({f}) => (
  <>{[['Priya N.', '@you can you look at the forecast?', 30], ['Ops bot', '3 invoices need approval', 56]].map(([n, l, d], i) => { const at = T.dayStart + (d as number); if (f < at) return null; const p = prog(f, at, 20, 'snapOut');
    return <At key={i} x={L.cal.x - 380 + (1 - p) * 300} y={L.cal.y + 340 + i * 105} o={p * (1 - prog(f, P.SC.C + 20, 30, 'softOut'))}><div style={{transform: 'scale(0.9)', transformOrigin: '0 0'}}><Toast th={TH} logo="slack" app="Slack" title={n as string} line={l as string} time="now" w={760} /></div></At>; })}</>
);

// ---------------- solution ----------------
const Prompt: React.FC<{f: number}> = ({f}) => {
  const enter = f >= P.typed.end + 6; const press = enter ? 1 - prog(f, P.typed.end + 6, 16, 'softOut') : 0;
  const chips: [string, string][] = [['calendly', 'Calendly'], ['pipedrive', 'Pipedrive'], ['trello', 'Trello']];
  const gone = prog(f, P.P.toast - 14, 22, 'inHard');
  return <At x={P.PROMPT.x} y={P.PROMPT.y - gone * 260} o={1 - gone}>
    <div style={{position: 'absolute', left: P.PROMPT_TEXT.x - P.PROMPT.x - 6, top: -170, width: 760}}>
      <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: 4, color: PAL.accent, opacity: clamp((f - P.VO[3]) / 8)}}>RIGHT SIDE →</div>
      <VoLine words={[['tell', 0.3], ['FansaChat', 0.42]].map(([w, t]) => ({w: w as string, f: P.VO[3] + Math.round((t as number) * 60)}))} hot={{fansachat: PAL.accent}} style={{fontFamily: F.display, fontWeight: 800, fontSize: 74, color: PAL.ink, letterSpacing: '-0.02em'}} />
    </div>
    <Win th={TH} w={P.PROMPT.w} logo="fansa" title="FansaChat" meta={<><span style={{width: 12, height: 12, borderRadius: 6, background: TH.ok, display: 'inline-block'}} /> New workflow</>} pad={28}>
      <div style={{display: 'flex', gap: 26}}>
        <div style={{width: P.PROMPT.side, flexShrink: 0, borderRight: `1.5px solid ${TH.line}`, paddingRight: 14, fontSize: 20}}>
          <div style={{color: TH.muted, fontSize: 19, letterSpacing: 1.5, marginBottom: 12}}>WORKFLOWS</div>
          {[['Leads → CRM', 'On'], ['Invoices → Slack', 'On'], ['Calls → Deals', 'Draft']].map(([n, s], i) => <div key={n} style={{padding: '10px 12px', borderRadius: 12, marginBottom: 6, background: i === 2 ? a(TH.accent, 0.1) : undefined, fontWeight: i === 2 ? 700 : 500, color: i === 2 ? TH.accent : TH.ink}}>{n}<div style={{fontSize: 18, color: s === 'On' ? TH.ok : TH.muted}}>{s === 'On' ? '● running' : '○ draft'}</div></div>)}
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 22, color: TH.muted, height: 50}}>Describe what should happen</div>
          <div style={{minHeight: 3 * P.PROMPT_TEXT.lh + 20, padding: '14px 0', fontSize: P.PROMPT_TEXT.size, lineHeight: `${P.PROMPT_TEXT.lh}px`, fontWeight: 500, position: 'relative', top: -14}}>
            {(() => { const n = P.typed.count(f); let k = n; return P.LINES.map((ln, i) => { const show = Math.max(0, Math.min(ln.length, k)); k -= ln.length + 1; const last = k < 0 || i === P.LINES.length - 1;
              const prev = P.LINES.slice(0, i).reduce((s, x) => s + x.length + 1, 0);
              const t = {...P.typed, text: ln, times: P.typed.times.slice(prev, prev + ln.length), count: () => show};
              return <div key={i} style={{whiteSpace: 'nowrap'}}>{show > 0 || i === 0 ? <TypedText t={t} caret={last && (show < ln.length || i === P.LINES.length - 1) && f < P.typed.end + 30 ? TH.accent : 'transparent'} hot={['Calendly', 'Pipedrive', 'Trello']} hotColor={TH.accent} /> : null}</div>; }); })()}
          </div>
          <Row gap={12} style={{marginTop: 6, height: 52}}>{chips.map(([lg, nm]) => { const i = P.SENTENCE.indexOf(nm) + nm.length - 1; const at = P.typed.times[i] + 3; const p = prog(f, at, 18, 'spring');
            return f < at ? <div key={nm} style={{width: 170}} /> : <div key={nm} style={{transform: `scale(${p})`}}><Tag c={TH.ink} size={22} style={{background: TH.panel2, border: `1.5px solid ${TH.line}`, color: TH.ink, gap: 8}}><Logo name={lg} size={30} round={8} />{nm}</Tag></div>; })}</Row>
          <Row style={{marginTop: 20, justifyContent: 'space-between', borderTop: `1.5px solid ${TH.line}`, paddingTop: 18}}>
            <span style={{fontSize: 21, color: TH.muted}}>3 apps connected · builds in ~10 s</span>
            <div style={{padding: '14px 30px', borderRadius: 16, background: TH.accent, color: '#fff', fontWeight: 700, fontSize: 25, transform: `scale(${1 - press * 0.08})`, boxShadow: enter ? `0 0 0 ${press * 14}px ${a(TH.accent, 0.25)}` : undefined}}>Build ↵</div>
          </Row>
        </div>
      </div>
    </Win>
    <LiveBorder color={TH.accent} r={30} o={0.8} />
  </At>;
};
const NODES = [
  {lg: 'calendly', step: '1 · TRIGGER', title: 'Calendly — Invitee created', d: 'Event: Discovery call (30 min) · any host'},
  {lg: 'pipedrive', step: '2 · ACTION', title: 'Pipedrive — Create deal', d: 'Pipeline: Sales · Stage: Qualified · Owner: you'},
  {lg: 'trello', step: '3 · ACTION', title: 'Trello — Create card', d: 'Board: Sales prep · List: This week · 5-item checklist'},
];
const Nodes: React.FC<{f: number}> = ({f}) => (
  <>
    {NODES.map((n, i) => f >= T.typeStart && f < T.nodes[i] + 4 && <At key={'g' + i} x={L.nodes[i].x - 380} y={L.nodes[i].y - 95} w={760} h={190} o={clamp((f - T.typeStart) / 30) * 0.9} style={{borderRadius: 28, border: `3px dashed ${a(PAL.ink, 0.22)}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', fontFamily: F.mono, fontSize: 24, color: a(PAL.ink, 0.4)}}>
      <div style={{width: 78, height: 78, borderRadius: 18, background: a(PAL.ink, 0.07)}} />{i === 0 ? 'WHEN … ?' : 'THEN … ?'}<span style={{marginLeft: 'auto', fontSize: 20}}>waiting for your sentence</span></At>)}
    {[0, 1].map((i) => { const A = L.nodes[i], B = L.nodes[i + 1]; const pr = prog(f, T.nodes[i] + 6, 18, 'swift');
      return <Wire key={i} x1={A.x} y1={A.y + 95} x2={B.x} y2={B.y - 95} p={pr} color={TH.accent} base={a(PAL.ink, 0.25)} width={6} />; })}
    {NODES.map((n, i) => { const at = T.nodes[i]; if (f < at) return null; const p = prog(f, at, 22, 'spring'); const hot = (i === 0 && vis(f, P.P.toast, P.P.dot1[0] + 10)) || (i === 1 && vis(f, P.P.dot1[0] + P.P.dot1[1] - 6, P.P.dealIn + 30)) || (i === 2 && vis(f, P.P.dot2[0] + P.P.dot2[1] - 6, P.P.cardIn + 30));
      return <At key={i} x={L.nodes[i].x - 380} y={L.nodes[i].y - 95} w={760} h={190} s={p} style={{borderRadius: 28, background: TH.panel, border: `2px solid ${hot ? TH.accent : TH.line}`, boxShadow: hot ? `0 0 0 8px ${a(TH.accent, 0.18)}, 0 30px 50px rgba(30,40,80,.16)` : '0 30px 50px rgba(30,40,80,.14)', display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', fontFamily: F.sans, color: TH.ink}}>
        <Logo name={n.lg} size={78} round={18} />
        <div style={{flex: 1}}><div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: 2, color: TH.accent}}>{n.step}</div><div style={{fontSize: 30, fontWeight: 700}}>{n.title}</div><div style={{fontSize: 22, color: TH.muted}}>{n.d}</div></div>
        <Tag c={TH.ok} size={20}>{hot ? 'Running' : 'Ready'}</Tag>
      </At>; })}
  </>
);

// ---------------- payoff ----------------
const STAGES = ['Lead in', 'Qualified', 'Demo', 'Proposal', 'Won'];
const Deal: React.FC<{f: number}> = ({f}) => {
  const p = P.dealArr.p(f); if (p <= 0) return null; const v = P.value.shown(f);
  const st = f >= P.P.dealIn + 60 ? 1 : 0; const stP = prog(f, P.P.dealIn + 60, 30, 'snapOut');
  return <At x={L.deal.x - 450 + (1 - p) * 360} y={L.deal.y - 330} o={clamp(p * 2)}>
    <Win th={TH} w={900} logo="pipedrive" title="Deal · Marco Ruiz" meta={<span style={{fontFamily: F.mono, fontSize: 20}}>#D-2481</span>} pad={26}>
      <Row gap={18}>
        <Avatar name="Marco Ruiz" size={72} />
        <div style={{flex: 1}}><div style={{fontSize: 34, fontWeight: 800}}>Brightline Studio</div><div style={{fontSize: 22, color: TH.muted}}>marco@brightline.example · +1 555-0187</div></div>
        <div style={{textAlign: 'right'}}><div style={{fontSize: 20, color: TH.muted}}>Value</div><div style={{fontFamily: F.display, fontSize: 52, fontWeight: 800, color: TH.ink}}>${v.toLocaleString('en-US')}</div></div>
      </Row>
      <div style={{display: 'flex', gap: 6, marginTop: 22}}>{STAGES.map((s, i) => <div key={s} style={{flex: 1, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: i <= st ? '#fff' : TH.muted, background: i < st ? a(TH.accent, 0.7) : i === st ? (st === 1 ? `linear-gradient(90deg, ${TH.accent} ${stP * 100}%, ${a(TH.accent, 0.25)} ${stP * 100}%)` : TH.accent) : TH.panel2}}>{s}</div>)}</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginTop: 22, fontSize: 23}}>
        <Row gap={10}><span style={{color: TH.muted}}>Source</span><Logo name="calendly" size={28} round={7} /><b>Calendly</b><span style={{color: TH.muted}}>· 2 min ago</span></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Owner</span><Avatar name="You Me" size={30} idx={1} /><b>You</b></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Next</span><b>Discovery · Fri 10:00</b></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Lead score</span><b style={{color: TH.ok, fontFamily: F.mono}}>{P.score.shown(f)}</b><div style={{width: 110, height: 10, borderRadius: 5, background: TH.panel2}}><div style={{width: `${P.score.shown(f)}%`, height: 10, borderRadius: 5, background: TH.ok}} /></div></Row>
      </div>
      <Row gap={8} style={{marginTop: 18}}><Tag c={TH.accent} size={20}>Inbound</Tag><Tag c="#0E8F9E" size={20}>Calendly</Tag><Tag c={TH.hot} size={20}>Q4</Tag><Tag c={TH.muted} size={20}>Agency · 11-50</Tag></Row>
      <div style={{marginTop: 18, borderTop: `1.5px solid ${TH.line}`, paddingTop: 14, fontSize: 22}}>
        {[['10:02', 'Booked “Discovery call” via Calendly'], ['10:02', 'Answer: “Need a CRM that updates itself”'], ['10:02', 'Prep card created in Trello']].map(([t, l], i) => <Row key={i} gap={12} style={{padding: '5px 0', opacity: clamp((f - P.P.dealIn - 40 - i * 12) / 10)}}><span style={{fontFamily: F.mono, color: TH.muted, fontSize: 19}}>{t}</span><div style={{width: 10, height: 10, borderRadius: 5, background: TH.accent}} />{l}</Row>)}
      </div>
      <div style={{position: 'absolute', right: 30, bottom: 26}}><Stamp f0={P.P.stamp} c={TH.ok} size={24}>Synced to Pipedrive ✓</Stamp></div>
    </Win>
    {f >= T.tracked && <div style={{position: 'absolute', right: -40, top: -54, transform: `scale(${prog(f, T.tracked, 16, 'spring')}) rotate(4deg)`}}><Tag c={TH.accent} solid size={40}>tracked ✓</Tag></div>}
  </At>;
};
const Card: React.FC<{f: number}> = ({f}) => {
  const p = P.cardArr.p(f); if (p <= 0) return null; const done = P.P.checks.filter((x) => f >= x).length;
  return <At x={L.card.x - 450 - (1 - p) * 360} y={L.card.y - 320} o={clamp(p * 2)}>
    <Win th={TH} w={900} logo="trello" title="Sales prep · This week" meta="Board" pad={26}>
      <Row gap={8}><Tag c="#0E8F9E" solid size={20}>Discovery</Tag><Tag c={TH.hot} solid size={20}>Hot lead</Tag><Tag c="#9B5DE5" solid size={20}>Agency</Tag></Row>
      <div style={{fontSize: 36, fontWeight: 800, marginTop: 14}}>Prep: call with Marco Ruiz</div>
      <Row gap={20} style={{marginTop: 10, fontSize: 22, color: TH.muted}}><span>Due <b style={{color: TH.ink}}>Fri 9:30 AM</b></span><Row gap={-8}>{['You Me', 'Sam Lee'].map((n, i) => <Avatar key={n} name={n} size={36} idx={i + 1} ring="#fff" />)}</Row><span>Attachment: <b style={{color: TH.ink}}>booking-answers.pdf</b></span></Row>
      <div style={{marginTop: 16, fontSize: 22, color: TH.muted}}>Checklist {done}/5</div>
      <div style={{height: 10, borderRadius: 5, background: TH.panel2, marginTop: 6}}><div style={{width: `${done * 20}%`, height: 10, borderRadius: 5, background: TH.ok}} /></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14}}>
        <Check th={TH} at={P.P.checks[0]}>Read booking answers</Check><Check th={TH} at={P.P.checks[1]}>Look up Brightline Studio</Check>
        <Check th={TH}>Draft 3 questions</Check><Check th={TH}>Send agenda</Check><Check th={TH}>Log notes after call</Check>
      </div>
    </Win>
    {f >= T.prepped && <div style={{position: 'absolute', left: -40, top: -54, transform: `scale(${prog(f, T.prepped, 16, 'spring')}) rotate(-4deg)`}}><Tag c={TH.ok} solid size={40}>prepped ✓</Tag></div>}
  </At>;
};
const Payoff: React.FC<{f: number}> = ({f}) => (
  <>
    {f >= P.P.toast && f < P.P.dealIn + 60 && <At x={L.nodes[0].x - 410 + (1 - prog(f, P.P.toast, 22, 'snapOut')) * 700} y={L.nodes[0].y - 300} o={1 - prog(f, P.P.dealIn + 30, 30, 'softOut')}>
      <Toast th={TH} logo="calendly" app="Calendly · new booking" title="Marco Ruiz booked Discovery call" line="Fri, Nov 14 · 10:00 AM · Brightline Studio" w={820} /></At>}
    <Wire x1={L.nodes[2].x - 380} y1={L.nodes[0].y} x2={L.deal.x - 450} y2={L.deal.y - 300} p={0} bend={-300} color="transparent" base="transparent" />
    {(() => { const A = {x: L.nodes[0].x - 380, y: L.nodes[0].y}, B = {x: L.deal.x - 400, y: L.deal.y - 330}; const t = (f - P.P.dot1[0]) / P.P.dot1[1];
      return f > P.P.dot1[0] - 20 && <Wire x1={A.x} y1={A.y} x2={B.x} y2={B.y} bend={-150} p={prog(f, P.P.dot1[0] - 20, 24, 'swift')} dot={t >= 0 && t <= 1 ? prog(f, P.P.dot1[0], P.P.dot1[1], 'inOut') : -1} color={TH.accent} base={a(PAL.ink, 0.22)} />; })()}
    {(() => { const A = {x: L.deal.x + 450, y: L.deal.y + 200}, B = {x: L.card.x + 400, y: L.card.y - 320}; const t = (f - P.P.dot2[0]) / P.P.dot2[1];
      return f > P.P.dot2[0] - 20 && <Wire x1={A.x} y1={A.y} x2={B.x} y2={B.y} bend={240} p={prog(f, P.P.dot2[0] - 20, 24, 'swift')} dot={t >= 0 && t <= 1 ? prog(f, P.P.dot2[0], P.P.dot2[1], 'inOut') : -1} color={TH.ok} base={a(PAL.ink, 0.22)} />; })()}
    <Deal f={f} /><Card f={f} />
  </>
);
void wirePt;

// ---------------- screen-space type ----------------
const vw = (line: number, words: string[], starts: number[]) => words.map((w, i) => ({w, f: P.VO[line] + Math.round(starts[i] * 60)}));
const Overlay: React.FC<{f: number}> = ({f}) => {
  const {width: w, height: h} = useVideoConfig();
  const sh = hitShake(f, T.auto, 0.12);
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {vis(f, P.SC.C + 20, T.whip + 4) && <div style={{position: 'absolute', left: 60, right: 60, top: h * 0.5 - (h > 1500 ? 600 : 470), textAlign: 'center'}}>
      <VoLine words={vw(2, ['the', 'call', 'you', 'forgot', 'to', 'prep', 'is', 'the', 'one', 'that', 'mattered.'], [0.06, 0.14, 0.36, 0.64, 0.92, 1.14, 1.38, 1.66, 1.84, 2.0, 2.16])} hot={{forgot: PAL.hot, mattered: PAL.hot}} f1={T.whip - 6}
        style={{fontFamily: F.display, fontWeight: 800, fontSize: 82, lineHeight: 1.02, color: PAL.ink, letterSpacing: '-0.02em', textShadow: `0 2px 30px ${a(PAL.bg, 0.9)}`}} /></div>}
    {vis(f, T.auto - 20, P.SC.F + 6) && <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 40% at 50% 50%, ${a(PAL.bg, 0.92 * prog(f, T.auto - 20, 24, 'softOut'))}, ${a(PAL.bg, 0.55 * prog(f, T.auto - 20, 24, 'softOut'))})`}} />}
    {vis(f, P.SC.A, P.SC.B + 12) && <div style={{position: 'absolute', left: 0, right: 0, top: h > 1500 ? 170 : 36, textAlign: 'center', fontSize: h > 1500 ? 96 : 78, opacity: 1 - prog(f, P.SC.B - 6, 16, 'inHard'), transform: `translateY(${-prog(f, P.SC.B - 6, 16, 'inHard') * 60}px)`}}>
      <TrackIn f0={T.headIn} dur={70} style={{fontFamily: F.display, fontWeight: 800, fontSize: 'inherit', color: PAL.ink, lineHeight: 1}}>Booking sales calls?</TrackIn></div>}
    {vis(f, T.auto - 4, P.SC.F + 6) && <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 110, textAlign: 'center', transform: `translate(${sh.x}px, ${sh.y}px) scale(${sh.s * lerp(0.6, 1.05, prog(f, T.auto - 4, 72, 'softOut'))})`}}>
      <div style={{display: 'inline-block', fontFamily: F.display, fontWeight: 800, fontSize: 118, letterSpacing: `${lerp(0.25, -0.03, prog(f, T.auto - 4, 30, 'snapOut'))}em`, color: PAL.accent, textShadow: longShadow('#3B2A99', 16), opacity: clamp((f - T.auto + 4) / 4)}}>Automatically.</div>
      <div style={{fontFamily: F.sans, fontSize: 40, fontWeight: 600, color: PAL.ink, marginTop: 24, opacity: clamp((f - T.auto - 20) / 12)}}>every booking → deal + prep card</div></div>}
  </AbsoluteFill>;
};

// ---------------- end ----------------
const End: React.FC<{f: number}> = ({f}) => {
  const c = P.cursor.at(f); const voted = f >= T.pollClick; const pct = P.poll.shown(f);
  const ec = f >= P.T.endCard;
  return <>
    {!ec && <At x={50} y={700} w={980} style={{fontFamily: F.sans}}>
      <div style={{borderRadius: 40, background: TH.panel, padding: 44, boxShadow: '0 40px 80px rgba(30,40,80,.2)', border: `1.5px solid ${TH.line}`}}>
        <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: 4, color: TH.muted, textAlign: 'center', marginBottom: 10}}>POLL · 2,418 VOTES</div><TrackIn f0={P.VO[5]} dur={50} s0={0.9} s1={1} style={{fontFamily: F.display, fontWeight: 800, fontSize: 78, color: TH.ink, textAlign: 'center', lineHeight: 1.05}}>Which side are you on?</TrackIn>
        {[['Sticky notes', 100 - pct, PAL.hot], ['Automatic', pct, PAL.accent]].map(([n, v, col], i) => <div key={i} style={{position: 'relative', marginTop: i ? 22 : 36, height: 118, borderRadius: 26, border: `3px solid ${i === 1 && voted ? col : TH.line}`, overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 32px', fontSize: 44, fontWeight: 700, transform: i === 1 && voted ? `scale(${1 + 0.04 * (1 - prog(f, T.pollClick, 20, 'softOut'))})` : undefined}}>
          {voted && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: a(col as string, 0.18)}} />}
          <span style={{position: 'relative'}}>{n}</span>{voted && <span style={{position: 'relative', marginLeft: 'auto', fontFamily: F.mono, color: col as string}}>{v}%</span>}</div>)}
      </div>
    </At>}
    {!ec && <Cursor x={c.x} y={c.y} press={c.press} clicks={P.cursor.clicks} ring={PAL.accent} o={clamp((f - T.pollClick + 50) / 8)} />}
  </>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  const inF = f >= P.SC.F - 12; const bloom = prog(f, P.SC.F - 12, 22, 'inHard');
  const leftBlur = f >= P.SC.C ? prog(f, P.SC.C, 40, 'softOut') * 7 * (1 - prog(f, T.whip, 10, 'softOut')) : 0;
  return <AbsoluteFill style={{background: PAL.bg}}>
    <AbsoluteFill style={{clipPath: inF ? `circle(${(1 - bloom) * 140}% at 50% 50%)` : undefined}}>
      <LivingBg p={PAL} cam={P.cam} rings particles={30} />
      <CameraRig cam={P.cam} id="w">
        <Divider f={f} />
        {f < P.SC.B + 30 && <Hook f={f} />}
        <div style={{position: 'absolute', filter: leftBlur > 0.2 ? `blur(${leftBlur}px)` : undefined}}>
          {vis(f, P.SC.B - 30, T.whip + 40) && <><At x={L.toast.x - 410 + (1 - prog(f, T.toastIn, 24, 'snapOut')) * 700} y={L.toast.y - 70} o={clamp((f - T.toastIn) / 6)}><Toast th={TH} logo="calendly" app="Calendly" title="New event: Dana Whitfield" line="Discovery call · 30 min · Thu, Nov 13, 2:30 PM" time="9:41" w={820} /></At>
            {f < T.note1 + 40 && <At x={L.toast.x - 386} y={L.toast.y + 90} o={clamp((f - T.toastIn - 10) / 10) * (1 - prog(f, T.note1 + 10, 20, 'softOut'))}>
              <Row gap={12}>{['Add to CRM', f >= P.SNOOZE.at ? 'Snoozed · tomorrow' : 'Snooze'].map((b, i) => <div key={i} style={{padding: '12px 22px', borderRadius: 14, fontFamily: F.sans, fontSize: 24, fontWeight: 700, background: i === 1 && f >= P.SNOOZE.at ? a(PAL.hot, 0.14) : TH.panel, color: i === 1 && f >= P.SNOOZE.at ? PAL.hot : TH.ink, border: `1.5px solid ${TH.line}`, boxShadow: '0 8px 20px rgba(30,40,70,.12)', transform: i === 1 ? `scale(${1 - P.cursorB.at(f).press * 0.08})` : undefined}}>{b}</div>)}</Row></At>}
            {vis(f, T.toastIn + 20, P.SNOOZE.at + 60) && (() => { const c = P.cursorB.at(f); return <Cursor x={c.x} y={c.y} press={c.press} clicks={P.cursorB.clicks} ring={PAL.hot} o={clamp((f - T.toastIn - 20) / 8) * (1 - prog(f, P.SNOOZE.at + 40, 20, 'softOut'))} />; })()}
            <Board f={f} /><Calendar f={f} /><Slacky f={f} /></>}
        </div>
        {vis(f, P.SC.B, T.whip + 40) && <At x={L.sticky.x - 125} y={L.sticky.y - 105} o={1 - 0.85 * prog(f, T.mattered - 10, 50, 'softOut')}><div style={{transform: `rotate(${-6 + noise1(f / 60, 3) * 2}deg)`}}><Sticky t="prep call??" c="#FFE066" w={250} size={44} /></div></At>}
        {f >= T.whip - 20 && f < P.SC.F + 10 && <><Prompt f={f} /><Nodes f={f} /><Payoff f={f} /></>}
      </CameraRig>
      <Overlay f={f} />
    </AbsoluteFill>
    {inF && <AbsoluteFill style={{clipPath: `circle(${bloom * 140}% at 50% 50%)`}}>
      <LivingBg p={PAL} cam={P.camF} rings particles={24} seed={7} />
      <CameraRig cam={P.camF} id="e"><End f={f} /></CameraRig>
      {f >= T.endCard && <EndCard f0={T.endCard} pill={P.VO[6] + 4} apps={['calendly', 'pipedrive', 'trello']} dot={[T.endCard + 40, 50]} tagline="One sentence → a working automation" sentence={P.SENTENCE} accent={PAL.accent} ink={PAL.ink} muted={PAL.muted} display={F.display} body={F.sans} />}
      {inF && bloom < 1 && <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${bloom * 98}%, ${a(PAL.accent, 0.6)} ${bloom * 99}%, transparent ${bloom * 100 + 4}%)`}} />}
    </AbsoluteFill>}
    <Corners p={PAL} label={['THIS  /  THAT', 'P05 · {t}']} />
  </AbsoluteFill>;
};
