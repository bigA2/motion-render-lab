// P06 picture. Timing from plan.ts (shared with the sound). Fictional people/data only.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {At, CameraRig, Depth, hitShake} from '../kit/CameraRig';
import {clamp, lerp, noise1, prog, rnd} from '../kit/curves';
import {F} from '../kit/fonts';
import {Corners, LiveBorder, LivingBg, Pal, a} from '../kit/Living';
import {TrackIn, TypedText, VoLine, longShadow} from '../kit/type';
import {Avatar, Check, Logo, Row, Stamp, Tag, Th, Win, Wire} from '../kit/ui';
import * as P from './plan';

export const PAL: Pal = {bg: '#EDE6DD', bg2: '#DACDE2', glow: '#FFF6EC', glow2: '#F3C3D6', line: '#CDBFB0', ink: '#2A1B2E', muted: '#776A73', accent: '#7B2D8E', hot: '#D2451E', panel: '#F8F4EE', panelLine: '#D8CDBF', dark: false};
export const TH: Th = {panel: '#FFFDFB', panel2: '#F6F0EA', line: '#EADFD5', ink: '#2A1B2E', muted: '#7A6E77', accent: '#7B2D8E', hot: '#D2451E', ok: '#2F8F5B', font: F.sans, mono: F.mono, dark: false};
const {L, T} = P;
const vis = (f: number, a0: number, b0: number) => f >= a0 && f < b0;
const rowY = (i: number) => 150 + i * 98;

// ---------------- inbox ----------------
const InboxRow: React.FC<{i: number; f: number; urgent?: boolean}> = ({i, f, urgent}) => {
  const [n, msg, t] = P.ROWS[i]; const p = prog(f, P.rowsIn[i], 16, 'snapOut');
  return <div style={{position: 'absolute', left: 0, top: rowY(i) - 150, width: 860, height: 88, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', borderRadius: 18, background: urgent ? a(TH.hot, 0.07) : TH.panel, borderLeft: urgent ? `6px solid ${TH.hot}` : '6px solid transparent', opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
    <Avatar name={n} size={52} idx={i} />
    <div style={{flex: 1, minWidth: 0}}><Row gap={10}><span style={{fontSize: 25, fontWeight: 700}}>{n}</span>{urgent && <Tag c={TH.hot} solid size={18}>URGENT</Tag>}</Row>
      <div style={{fontSize: 23, color: urgent ? TH.ink : TH.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{msg}</div></div>
    <span style={{fontSize: 20, color: TH.muted, fontFamily: F.mono}}>{t}</span>
    {!urgent && <div style={{width: 12, height: 12, borderRadius: 6, background: TH.accent, opacity: 0.6}} />}
  </div>;
};
const Inbox: React.FC<{f: number}> = ({f}) => (
  <At x={L.inbox.x - 450} y={L.inbox.y - 560}>
    <Win th={TH} w={900} logo="intercom" title="Inbox · Client support" meta={<Tag c={TH.hot} size={22}>{P.unread.shown(f)} unread</Tag>} pad={20}>
      <Row gap={10} style={{marginBottom: 14}}>{['All', 'Mine', 'Unassigned', 'Urgent'].map((x, i) => <Tag key={x} c={i === 0 ? TH.accent : TH.muted} solid={i === 0} size={20}>{x}</Tag>)}<span style={{marginLeft: 'auto', fontSize: 20, color: TH.muted}}>Newest first</span></Row>
      <div style={{position: 'relative', height: P.ROWS.length * 98}}>{P.ROWS.map((_, i) => <InboxRow key={i} i={i} f={f} urgent={i === L.urgentRow} />)}
        {/* "buried": quick-question cards pile onto the urgent row */}
        {[0, 1, 2, 3, 4, 5].map((k) => { const at = T.buried + k * 7; if (f < at) return null; const p = prog(f, at, 16, 'snapOut'); const r = (rnd(k + 3) - 0.5) * 8;
          return <div key={k} style={{position: 'absolute', left: 30 + (rnd(k) - 0.5) * 80, top: rowY(L.urgentRow) - 150 - 40 + (rnd(k + 9) - 0.5) * 60, width: 800, height: 84, borderRadius: 18, background: TH.panel, boxShadow: '0 14px 30px rgba(60,30,60,.18)', border: `1.5px solid ${TH.line}`, transform: `translateY(${(1 - p) * -260}px) rotate(${r}deg) scale(${lerp(1.15, 1, p)})`, opacity: p, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', fontSize: 23}}>
            <Avatar name={P.ROWS[(k * 5) % 12][0]} size={44} idx={k + 2} /><b>{P.ROWS[(k * 5 + 1) % 12][0]}</b><span style={{color: TH.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{P.ROWS[(k * 3 + 2) % 12][1]}</span></div>; })}
      </div>
    </Win>
  </At>
);

// ---------------- checklist ----------------
const ITEMS = ['Read all 50 messages', 'Spot the urgent one', 'Make a task', 'Tell the team'];
const List: React.FC<{f: number}> = ({f}) => {
  const m = P.respTime.shown(f);
  return <At x={L.list.x - 430} y={L.list.y - 470} o={clamp((f - P.SC.B + 20) / 14)}>
    <Win th={TH} w={860} logo="clickup" title="Every morning, by hand" meta={<span>Mon · 9:12</span>} pad={30}>
      {ITEMS.map((t, i) => { const at = P.steps[i]; const p = prog(f, at, 8, 'snapOut'); return <div key={t} style={{opacity: f >= at ? 1 : 0.25, transform: `translateX(${(1 - p) * 30}px)`, padding: '16px 0', borderBottom: `1.5px solid ${TH.line}`}}>
        <Row gap={16}><Check th={TH} at={at + 12} bad size={34}>{t}</Check><span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 22, color: TH.muted}}>{['~40 min', '?', '6 min', '4 min'][i]}</span></Row></div>; })}
      <Row style={{marginTop: 26, justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div><div style={{fontSize: 22, color: TH.muted}}>First reply to Kara</div><div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: TH.hot}}>{Math.floor(m / 60)}h {String(m % 60).padStart(2, '0')}m</div></div>
        <div style={{textAlign: 'right', fontSize: 22, color: TH.muted}}>SLA <b style={{color: TH.ink}}>15m</b><br /><span style={{color: TH.hot, fontWeight: 700}}>breached</span></div>
      </Row>
    </Win>
  </At>;
};

// ---------------- card fan (turn) ----------------
const Fan: React.FC<{f: number}> = ({f}) => {
  const p = prog(f, T.fan, 70, 'flyAccel');
  return <At x={1060} y={1000}>{P.ROWS.map((r, i) => { const urgent = i === L.urgentRow; const ang = (i - 5.5) * 13; const z = urgent ? 200 : -400 - (i % 4) * 500; const blur = urgent ? 0 : 6 * p;
    return <Depth key={i} x={Math.sin(ang * Math.PI / 180) * 900 * p - 400} y={(i - 6) * 70 * (1 - p) - 44 + (urgent ? 0 : (rnd(i) - 0.5) * 600 * p)} z={z * p} ry={urgent ? -6 * p : ang * 2 * p} rz={(rnd(i + 4) - 0.5) * 20 * p}>
      <div style={{width: 800, height: 88, borderRadius: 18, background: urgent ? '#FFF6F1' : TH.panel, border: `2px solid ${urgent ? TH.hot : TH.line}`, boxShadow: urgent ? `0 0 0 10px ${a(TH.hot, 0.15)}, 0 30px 60px rgba(60,30,60,.25)` : '0 20px 40px rgba(60,30,60,.18)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', fontFamily: F.sans, fontSize: 24, color: TH.ink, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
        <Avatar name={r[0]} size={48} idx={i} /><b style={{whiteSpace: 'nowrap'}}>{r[0]}</b>{urgent && <Tag c={TH.hot} solid size={18}>URGENT</Tag>}<span style={{color: TH.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r[1]}</span></div>
    </Depth>; })}</At>;
};

// ---------------- prompt + nodes ----------------
const HOT = ['Intercom', 'urgent', 'ClickUp', 'Discord'];
const Prompt: React.FC<{f: number}> = ({f}) => {
  const press = f >= P.typed.end + 6 ? 1 - prog(f, P.typed.end + 6, 16, 'softOut') : 0;
  return <At x={P.PROMPT.x} y={P.PROMPT.y}>
    <div style={{width: P.PROMPT.w, borderRadius: 40, background: TH.panel, border: `1.5px solid ${TH.line}`, boxShadow: '0 40px 80px rgba(60,30,70,.18)', fontFamily: F.sans, color: TH.ink, position: 'relative'}}>
      <Row gap={14} style={{padding: '22px 30px', borderBottom: `1.5px solid ${TH.line}`}}><Logo name="fansa" size={40} round={10} /><b style={{fontSize: 27}}>FansaChat</b><span style={{fontSize: 22, color: TH.muted}}>· Agency workspace</span><span style={{marginLeft: 'auto'}}><Tag c={TH.ok} size={20}>4 apps connected</Tag></span></Row>
      <div style={{padding: '24px 30px 26px'}}>
        <div style={{fontFamily: F.serif, fontSize: 34, color: TH.muted, height: 50}}>Tell me what should happen…</div>
        <div style={{fontSize: P.PROMPT_TEXT.size, lineHeight: `${P.PROMPT_TEXT.lh}px`, fontWeight: 500, minHeight: 4 * P.PROMPT_TEXT.lh}}>
          {(() => { const n = P.typed.count(f); let k = n; return P.LINES.map((ln, i) => { const show = Math.max(0, Math.min(ln.length, k)); k -= ln.length + 1; const prev = P.LINES.slice(0, i).reduce((s, x) => s + x.length + 1, 0);
            const t = {...P.typed, text: ln, times: P.typed.times.slice(prev, prev + ln.length), count: () => show};
            const caretHere = (show > 0 && show < ln.length) || (i === P.LINES.length - 1 && show === ln.length) || (show === 0 && i === 0);
            return <div key={i} style={{whiteSpace: 'nowrap', height: P.PROMPT_TEXT.lh}}>{(show > 0 || i === 0) && <TypedText t={t} caret={caretHere && f < P.typed.end + 30 ? TH.accent : 'transparent'} hot={HOT} hotColor={TH.accent} />}</div>; }); })()}
        </div>
        <Row style={{marginTop: 18, justifyContent: 'space-between'}}>
          <Row gap={10}>{[['intercom', 'Intercom'], ['', '#urgent'], ['clickup', 'ClickUp'], ['discord', 'Discord']].map(([lg, nm]) => { const w = nm.replace('#', ''); const i = P.SENTENCE.indexOf(w) + w.length - 1; const at = P.typed.times[i] + 3; const p = prog(f, at, 18, 'spring');
            return f < at ? null : <div key={nm} style={{transform: `scale(${p})`}}><Tag c={lg ? TH.ink : TH.hot} size={21} style={{gap: 8, background: lg ? TH.panel2 : undefined}}>{lg && <Logo name={lg} size={28} round={7} />}{nm}</Tag></div>; })}</Row>
          <div style={{width: 64, height: 64, borderRadius: 32, background: TH.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, transform: `scale(${1 - press * 0.12})`, boxShadow: `0 0 0 ${press * 16}px ${a(TH.accent, 0.22)}`}}>↑</div>
        </Row>
      </div>
      <LiveBorder color={TH.accent} r={40} o={0.7} speed={40} />
    </div>
  </At>;
};
const NODES = [
  {lg: 'intercom', k: 'WHEN', t: 'New conversation', d: 'Intercom · all inboxes'},
  {lg: '', k: 'ONLY IF', t: 'Tag = urgent', d: 'filter'},
  {lg: 'clickup', k: 'THEN', t: 'Create task', d: 'List: Client fires · assignee: on duty'},
  {lg: 'discord', k: 'AND', t: 'Post message', d: '#client-urgent · mention @on-duty'},
];
const Nodes: React.FC<{f: number}> = ({f}) => (
  <>{NODES.map((n, i) => { const at = T.nodes[i]; if (f < at) return null; const p = prog(f, at, 24, 'spring'); const N = L.nodes[i];
    const lit = (i === 0 && vis(f, P.P.convo + 20, P.P.dot1[0] + 20)) || (i === 1 && vis(f, P.P.filter - 4, P.P.filter + 40)) || (i === 2 && vis(f, P.P.dot2[0], P.P.taskIn + 40)) || (i === 3 && vis(f, P.P.dot3[0], P.P.discordIn + 40));
    return <React.Fragment key={i}>
      {i < 3 && <Wire x1={N.x + 140} y1={N.y} x2={L.nodes[i + 1].x - 140} y2={L.nodes[i + 1].y} p={prog(f, at + 8, 18, 'swift')} color={TH.accent} base={a(TH.ink, 0.2)} bend={0} width={5} />}
      <At x={N.x - 140} y={N.y - 150} w={280} h={300} s={p} style={{transform: `scale(${p}) rotate(${N.r}deg)`, borderRadius: 30, background: i === 1 ? '#FFF6F1' : TH.panel, border: `2px solid ${lit ? (i === 1 ? TH.hot : TH.accent) : TH.line}`, boxShadow: lit ? `0 0 0 10px ${a(i === 1 ? TH.hot : TH.accent, 0.16)}, 0 30px 60px rgba(60,30,70,.2)` : '0 30px 60px rgba(60,30,70,.16)', padding: 24, fontFamily: F.sans, color: TH.ink}}>
        {n.lg ? <Logo name={n.lg} size={70} round={18} /> : <div style={{width: 70, height: 70, borderRadius: 18, background: a(TH.hot, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', color: TH.hot, fontSize: 40, fontWeight: 800}}>#</div>}
        <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: 2, color: i === 1 ? TH.hot : TH.accent, marginTop: 18}}>{n.k}</div>
        <div style={{fontSize: 30, fontWeight: 700, lineHeight: 1.1, marginTop: 4}}>{n.t}</div>
        <div style={{fontSize: 21, color: TH.muted, marginTop: 8, lineHeight: 1.25}}>{n.d}</div>
        {i === 1 && f >= P.P.filter && <div style={{position: 'absolute', right: 18, top: 18}}><Stamp f0={P.P.filter} c={TH.ok} size={20}>pass ✓</Stamp></div>}
      </At>
    </React.Fragment>; })}</>
);

// ---------------- payoff panels ----------------
const Convo: React.FC<{f: number}> = ({f}) => { const p = P.convoArr.p(f); if (p <= 0) return null;
  return <At x={L.convo.x - 450 + (1 - p) * 1000} y={L.convo.y - 380}>
    <Win th={TH} w={900} logo="intercom" title="Kara Lin · Meridian Goods" meta={<Tag c={TH.hot} solid size={20}>Reply in 15m</Tag>} pad={26}>
      <Row gap={16}><Avatar name="Kara Lin" size={64} idx={3} /><div><div style={{fontSize: 28, fontWeight: 700}}>Kara Lin <span style={{color: TH.muted, fontWeight: 500}}>· Head of E-commerce</span></div><div style={{fontSize: 22, color: TH.muted}}>Growth plan · $1,200/mo · client since 2024 · kara@meridian.example</div></div></Row>
      <div style={{marginTop: 20, padding: '18px 22px', borderRadius: 22, background: TH.panel2, fontSize: 27, lineHeight: 1.35}}>Checkout is <b style={{color: TH.hot}}>down</b> on our live store — customers get a 500 error at payment. We've been losing orders since 10:02.</div>
      <Row gap={10} style={{marginTop: 16, fontSize: 21, color: TH.muted}}><span style={{padding: '8px 14px', borderRadius: 12, border: `1.5px solid ${TH.line}`}}>screenshot-500.png · 214 KB</span><span>10:04</span></Row>
      <Row gap={10} style={{marginTop: 18}}><Tag c={TH.hot} solid size={21}>urgent</Tag><Tag c={TH.accent} size={21}>store</Tag><Tag c={TH.muted} size={21}>payments</Tag>
        <span style={{marginLeft: 'auto', fontSize: 22}}>Assignee: <b style={{color: f >= P.P.taskIn + 34 ? TH.ok : TH.muted}}>{f >= P.P.taskIn + 34 ? 'Leo Park (on duty)' : 'Unassigned'}</b></span></Row>
    </Win></At>; };
const Task: React.FC<{f: number}> = ({f}) => { const p = P.taskArr.p(f); if (p <= 0) return null;
  return <At x={L.task.x - 450 - (1 - p) * 1000} y={L.task.y - 360}>
    <Win th={TH} w={900} logo="clickup" title="Client fires" meta={<span style={{fontFamily: F.mono}}>CU-7731</span>} pad={26}>
      <Row gap={10}><Tag c={TH.hot} solid size={21}>URGENT</Tag><Tag c={TH.accent} size={21}>Meridian Goods</Tag><span style={{marginLeft: 'auto', fontSize: 21, color: TH.muted}}>created 10:04 · by FansaChat</span></Row>
      <div style={{fontSize: 36, fontWeight: 800, marginTop: 14, lineHeight: 1.12}}>Meridian checkout returns 500 at payment</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 22px', marginTop: 18, fontSize: 23}}>
        <Row gap={10}><span style={{color: TH.muted}}>Assignee</span><Avatar name="Leo Park" size={34} idx={5} /><b>Leo</b><Tag c={TH.ok} size={17}>on duty</Tag></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Due</span><b style={{color: TH.hot}}>Today 10:30</b></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Priority</span><b style={{color: TH.hot}}>Urgent</b></Row>
        <Row gap={10}><span style={{color: TH.muted}}>Source</span><Logo name="intercom" size={28} round={7} /><b>#48213</b></Row>
      </div>
      <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10}}><Check th={TH} size={24}>Reproduce the 500 at payment</Check><Check th={TH} size={24}>Roll back last deploy (v3.18)</Check><Check th={TH} size={24}>Reply to Kara with ETA</Check></div>
      <div style={{position: 'absolute', right: 30, bottom: 28}}><Stamp f0={P.P.taskIn + 34} c={TH.ok} size={22}>Assigned ✓</Stamp></div>
    </Win></At>; };
const Discord: React.FC<{f: number}> = ({f}) => { const p = P.discArr.p(f); if (p <= 0) return null; const sn = P.seen.shown(f);
  const D = {bg: '#313338', side: '#2B2D31', ink: '#F2F3F5', mut: '#B5BAC1', blurple: '#5865F2'};
  return <At x={L.discord.x - 450 + (1 - p) * 1000} y={L.discord.y - 330}>
    <div style={{width: 900, borderRadius: 30, overflow: 'hidden', background: D.bg, boxShadow: '0 40px 80px rgba(30,20,40,.35)', fontFamily: F.sans, color: D.ink}}>
      <Row gap={12} style={{padding: '18px 26px', background: D.side, fontSize: 25}}><Logo name="discord" size={36} round={10} /><b># client-urgent</b><span style={{color: D.mut, fontSize: 21}}>· Studio Ops</span><span style={{marginLeft: 'auto', color: D.mut, fontSize: 21}}>7 online</span></Row>
      <div style={{padding: 26}}>
        <Row gap={14} style={{alignItems: 'flex-start'}}><Logo name="fansa" size={56} round={28} />
          <div style={{flex: 1}}><Row gap={10}><b style={{fontSize: 26}}>FansaChat</b><span style={{background: D.blurple, borderRadius: 6, padding: '1px 8px', fontSize: 16, fontWeight: 700}}>APP</span><span style={{color: D.mut, fontSize: 20}}>Today at 10:04</span></Row>
            <div style={{fontSize: 26, marginTop: 6, lineHeight: 1.35}}><span style={{background: a(D.blurple, 0.35), borderRadius: 6, padding: '0 6px'}}>@Leo (on duty)</span> URGENT from Meridian Goods — checkout is down on the live store.</div>
            <div style={{marginTop: 14, borderLeft: `5px solid ${TH.hot}`, background: '#2B2D31', borderRadius: 10, padding: '14px 18px', fontSize: 22}}><b>CU-7731 · Meridian checkout returns 500</b><div style={{color: D.mut, marginTop: 4}}>ClickUp · Client fires · due 10:30 · Intercom #48213</div></div>
            <Row gap={10} style={{marginTop: 14}}>{[['eyes', Math.min(3, Math.floor(sn / 2))], ['on it', sn >= 6 ? 1 : 0]].map(([k, v]) => <span key={k as string} style={{padding: '6px 14px', borderRadius: 10, background: '#3A3D44', border: `1.5px solid ${(v as number) > 0 ? D.blurple : '#3A3D44'}`, fontSize: 21}}>{k} {v}</span>)}</Row>
          </div></Row>
        <Row gap={12} style={{marginTop: 22, paddingTop: 18, borderTop: '1.5px solid #3F4147', fontSize: 23, color: D.mut}}><Avatar name="Leo Park" size={36} idx={5} /><span><b style={{color: D.ink}}>Leo</b> is typing…</span><span style={{marginLeft: 'auto'}}>seen in <b style={{color: '#57F287', fontFamily: F.mono}}>0:{String(sn).padStart(2, '0')}</b></span></Row>
      </div>
    </div></At>; };

// ---------------- screen-space type ----------------
const glass: React.CSSProperties = {display: 'inline-block', padding: '18px 34px', borderRadius: 34, background: a('#FFFDFB', 0.62), backdropFilter: 'blur(14px) saturate(1.3)', border: `1.5px solid ${a('#FFFFFF', 0.8)}`, boxShadow: '0 20px 50px rgba(60,30,70,.15)'};
const vw = (line: number, words: string[], starts: number[]) => words.map((w, i) => ({w, f: P.VO[line] + Math.round(starts[i] * 60)}));
const Overlay: React.FC<{f: number}> = ({f}) => {
  const {height: h} = useVideoConfig(); const top = h > 1500 ? 170 : 90; const bot = h > 1500 ? h - 430 : h - 330;
  const sh = hitShake(f, T.seconds, 0.12);
  return <AbsoluteFill style={{pointerEvents: 'none', textAlign: 'center'}}>
    {vis(f, T.head, T.fifty - 6) && <div style={{position: 'absolute', left: 40, right: 40, top}}><div style={glass}>
      <VoLine words={vw(0, ['Agency', 'owners:'], [0, 0.34])} style={{fontFamily: F.serif, fontSize: 92, lineHeight: 1, color: TH.ink}} /></div></div>}
    {vis(f, T.fifty - 6, P.SC.B + 20) && <div style={{position: 'absolute', left: 40, right: 40, top: bot - 60, transform: `scale(${lerp(0.7, 1, prog(f, T.fifty - 6, 30, 'snapOut'))})`}}><div style={glass}>
      <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: 130, color: TH.hot, textShadow: longShadow('#8A2A10', 10), verticalAlign: 'middle'}}>{P.unread.shown(f)}</span>
      <span style={{fontFamily: F.serif, fontSize: 74, color: TH.ink, marginLeft: 22, verticalAlign: 'middle'}}>quick questions</span></div></div>}
    {vis(f, T.fix - 4, T.fix + 70) && <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 + (h > 1500 ? 300 : 230), transform: `scale(${lerp(0.6, 1.05, prog(f, T.fix - 4, 72, 'softOut'))})`, opacity: 1 - prog(f, T.fix + 56, 14, 'inHard')}}>
      <span style={{fontFamily: F.serif, fontSize: 140, color: TH.accent, letterSpacing: '-0.02em'}}>Let's fix that.</span></div>}
    {vis(f, T.urgentMeans - 4, T.seconds - 26) && <div style={{position: 'absolute', left: 40, right: 40, top}}><div style={glass}>
      <VoLine words={vw(4, ['Now', 'urgent', 'means', 'urgent.'], [0, 0.48, 0.66, 1.3])} hot={{urgent: TH.hot}} style={{fontFamily: F.serif, fontSize: 84, lineHeight: 1.05, color: TH.ink}} /></div></div>}
    {vis(f, T.seconds - 4, P.SC.F + 4) && <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 130, transform: `translate(${sh.x}px, ${sh.y}px) scale(${sh.s * lerp(0.6, 1.05, prog(f, T.seconds - 4, 72, 'softOut'))})`}}>
      <div style={{fontFamily: F.sans, fontSize: 44, fontWeight: 600, color: TH.ink}}>Your team sees it in</div>
      <div style={{fontFamily: F.serif, fontSize: 200, lineHeight: 1, color: TH.hot, textShadow: longShadow('#8A2A10', 14)}}>seconds.</div></div>}
  </AbsoluteFill>;
};

// ---------------- end ----------------
const End: React.FC<{f: number}> = ({f}) => {
  const ec = f >= T.endCard; const one = prog(f, T.one - 6, 40, 'snapOut');
  return <>{!ec && <At x={0} y={700} w={1080} style={{textAlign: 'center'}}>
      <div style={{fontFamily: F.sans, fontSize: 30, color: TH.muted, padding: '0 90px', lineHeight: 1.35, transform: `scale(${lerp(1, 0.86, one)})`, opacity: lerp(1, 0.55, one)}}>“{P.SENTENCE}”</div>
      <div style={{fontFamily: F.serif, fontSize: 170, color: TH.ink, marginTop: 50, opacity: one, transform: `translateY(${(1 - one) * 40}px)`, letterSpacing: `${lerp(0.2, -0.02, one)}em`}}>One sentence.</div>
    </At>}
    {ec && <At x={0} y={600} w={1080} style={{textAlign: 'center'}}>
      <div style={{display: 'inline-block', transform: `scale(${lerp(0.4, 1, prog(f, T.endCard + 4, 30, 'spring'))})`}}><Logo name="fansa" size={210} round={56} /></div>
      <TrackIn f0={T.endCard + 10} dur={60} from={0.5} style={{fontFamily: F.serif, fontSize: 130, color: TH.ink, marginTop: 20}}>FansaChat</TrackIn>
      <div style={{fontFamily: F.sans, fontSize: 42, color: TH.muted, opacity: clamp((f - T.endCard - 25) / 12)}}>Urgent client messages, never missed</div>
      <div style={{marginTop: 50, display: 'inline-block', transform: `scale(${prog(f, P.VO[6] + 4, 20, 'spring')})`}}><Tag c={TH.accent} solid size={46}>Join the waitlist · link in bio</Tag></div>
    </At>}</>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const inF = f >= P.SC.F - 14; const iris = prog(f, P.SC.F - 14, 26, 'swift');
  const fanOn = vis(f, T.fan, T.fix + 80);
  return <AbsoluteFill style={{background: PAL.bg}}>
    <AbsoluteFill style={{clipPath: inF ? `circle(${(1 - iris) * 120}% at 50% 50%)` : undefined}}>
      <LivingBg p={PAL} cam={P.cam} grid={false} particles={36} seed={11} />
      <CameraRig cam={P.cam} id="w" perspective={1600}>
        {f < T.fan + 10 && <div style={{position: 'absolute', opacity: 1 - prog(f, T.fan - 4, 14, 'softOut')}}><Inbox f={f} /><List f={f} /></div>}
        {fanOn && <Fan f={f} />}
        {f >= T.fix + 20 && f < P.SC.F + 10 && <><Prompt f={f} /><Nodes f={f} />
          {[[L.nodes[0], L.convo, P.P.dot1, -300], [L.convo, L.task, P.P.dot2, 300], [L.task, L.discord, P.P.dot3, -300]].map(([A, B, d, bend], i) => { const D = d as readonly [number, number]; const a0 = A as {x: number; y: number}, b0 = B as {x: number; y: number}; const t = (f - D[0]) / D[1];
            return f > D[0] - 20 && <Wire key={i} x1={a0.x + (i ? 450 : 0)} y1={a0.y + (i ? 200 : 150)} x2={b0.x + (i ? 450 : 0)} y2={b0.y - (i ? 300 : 380)} bend={bend as number} p={prog(f, D[0] - 20, 24, 'swift')} dot={t >= 0 && t <= 1 ? prog(f, D[0], D[1], 'inOut') : -1} color={i === 0 ? TH.hot : TH.accent} base={a(TH.ink, 0.2)} />; })}
          <Convo f={f} /><Task f={f} /><Discord f={f} /></>}
      </CameraRig>
      <Overlay f={f} />
    </AbsoluteFill>
    {inF && <AbsoluteFill style={{clipPath: `circle(${iris * 120}% at 50% 50%)`}}>
      <LivingBg p={{...PAL, bg: '#F3ECE4'}} cam={P.camF} grid={false} particles={28} seed={13} />
      <CameraRig cam={P.camF} id="e"><End f={f} /></CameraRig>
    </AbsoluteFill>}
    <Corners p={PAL} label={['URGENT · INBOX', 'P06 · {t}']} />
  </AbsoluteFill>;
};
void noise1;
