// P07 picture. Timing from plan.ts (shared with the sound). Fictional people/data only.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {At, CameraRig, Depth, hitShake} from '../kit/CameraRig';
import {clamp, lerp, prog} from '../kit/curves';
import {F} from '../kit/fonts';
import {Corners, LiveBorder, LivingBg, Pal, a} from '../kit/Living';
import {RotatingWord, TrackIn, TypedText, VoLine, longShadow} from '../kit/type';
import {Avatar, Check, Logo, Row, Stamp, Tag, Th, Win, Wire} from '../kit/ui';
import * as P from './plan';

export const PAL: Pal = {bg: '#051214', bg2: '#0A2629', glow: '#0F4C4D', glow2: '#12385A', line: '#1D4245', ink: '#E7F4F2', muted: '#86A6A3', accent: '#3EE6C1', hot: '#FFD166', panel: '#0E2A2D', panelLine: '#1D4245', dark: true};
export const TH: Th = {panel: '#0D2427', panel2: '#0A1C1F', line: '#1C3D40', ink: '#E7F4F2', muted: '#8DAEAB', accent: '#3EE6C1', hot: '#FFD166', ok: '#3EE6C1', font: F.display, mono: F.mono, dark: true};
const {L, T} = P;
const vis = (f: number, a0: number, b0: number) => f >= a0 && f < b0;
const CW = 960, CH = 690;

// ---------------- card 01 (front) / prompt (back) ----------------
const Front: React.FC<{f: number}> = ({f}) => {
  const un = prog(f, T.catcher - 6, 20, 'softOut');
  return <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: `linear-gradient(160deg, #0F3236, #0A1D20)`, border: `1.5px solid ${a(TH.accent, 0.35)}`, boxShadow: `0 50px 100px rgba(0,0,0,.5), 0 0 80px ${a(TH.accent, 0.12)}`, backfaceVisibility: 'hidden', padding: 50, fontFamily: F.display, color: TH.ink, overflow: 'hidden'}}>
    <Row style={{justifyContent: 'space-between', fontFamily: F.mono, fontSize: 24, letterSpacing: 3, color: TH.muted}}><span>AUTOMATION / 01</span><span style={{color: TH.hot}}>SET UP FIRST</span></Row>
    <div style={{fontSize: 330, fontWeight: 800, lineHeight: 0.95, color: TH.accent, textShadow: longShadow('#0B5F52', 18), marginTop: 20, letterSpacing: '-0.04em'}}>{f < 4 ? '0' : f < 10 ? '00' : '01'}</div>
    <div style={{fontSize: 74, fontWeight: 800, marginTop: 6, filter: `blur(${(1 - un) * 18}px)`, opacity: lerp(0.6, 1, un)}}>The brief catcher</div>
    <div style={{fontFamily: F.mono, fontSize: 24, color: TH.muted, marginTop: 14}}>for freelance designers · 1 sentence · 4 apps</div>
    <LiveBorder color={TH.accent} r={44} o={0.6} speed={35} />
  </div>;
};
const Back: React.FC<{f: number}> = ({f}) => {
  const press = f >= P.typed.end + 6 ? 1 - prog(f, P.typed.end + 6, 16, 'softOut') : 0;
  return <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: '#081A1C', border: `1.5px solid ${a(TH.accent, 0.5)}`, boxShadow: `0 50px 100px rgba(0,0,0,.5), 0 0 120px ${a(TH.accent, 0.18)}`, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', fontFamily: F.mono, color: TH.ink, overflow: 'hidden'}}>
    <Row gap={14} style={{padding: '20px 34px', borderBottom: `1.5px solid ${TH.line}`, height: 74, boxSizing: 'border-box'}}><Logo name="fansa" size={36} round={9} /><b style={{fontFamily: F.display, fontSize: 27}}>FansaChat</b><span style={{fontSize: 20, color: TH.muted}}>~/workflows/new</span><span style={{marginLeft: 'auto'}}><Tag c={TH.accent} size={19}>● online</Tag></span></Row>
    <div style={{padding: '30px 34px'}}>
      <div style={{fontSize: 22, color: TH.muted, height: 46}}>{'>'} describe the automation</div>
      <div style={{fontSize: P.PROMPT_TEXT.size, lineHeight: `${P.PROMPT_TEXT.lh}px`, minHeight: 4 * P.PROMPT_TEXT.lh, letterSpacing: '-0.02em'}}>
        {(() => { const n = P.typed.count(f); let k = n; return P.LINES.map((ln, i) => { const show = Math.max(0, Math.min(ln.length, k)); k -= ln.length + 1; const prev = P.LINES.slice(0, i).reduce((s, x) => s + x.length + 1, 0);
          const t = {...P.typed, text: ln, times: P.typed.times.slice(prev, prev + ln.length), count: () => show};
          const here = (show > 0 && show < ln.length) || (i === P.LINES.length - 1 && show === ln.length) || (show === 0 && i === 0);
          return <div key={i} style={{whiteSpace: 'nowrap', height: P.PROMPT_TEXT.lh}}>{(show > 0 || i === 0) && <TypedText t={t} caret={here && f < P.typed.end + 30 ? TH.accent : 'transparent'} hot={['Tally', 'Trello', 'Clockify', 'Telegram']} hotColor={TH.accent} />}</div>; }); })()}
      </div>
      <Row style={{marginTop: 26, justifyContent: 'space-between'}}>
        <Row gap={10}>{[['tally', 'Tally'], ['trello', 'Trello'], ['clockify', 'Clockify'], ['telegram', 'Telegram']].map(([lg, nm]) => { const i = P.SENTENCE.indexOf(nm) + nm.length - 1; const at = P.typed.times[i] + 3; const p = prog(f, at, 18, 'spring');
          return f < at ? null : <div key={nm} style={{transform: `scale(${p})`}}><Tag c={TH.ink} size={20} style={{gap: 8, background: TH.panel, border: `1.5px solid ${TH.line}`}}><Logo name={lg} size={26} round={7} />{nm}</Tag></div>; })}</Row>
        <div style={{padding: '12px 24px', borderRadius: 14, background: TH.accent, color: '#04201C', fontWeight: 700, fontSize: 24, transform: `scale(${1 - press * 0.1})`, boxShadow: `0 0 ${20 + press * 30}px ${a(TH.accent, 0.5)}`}}>run ↵</div>
      </Row>
    </div>
  </div>;
};
const Card: React.FC<{f: number}> = ({f}) => {
  const flip = prog(f, T.flip, 44, 'swift') * 180;
  const back = f >= P.SC.B - 10 && f < P.SC.C; const recede = back ? prog(f, P.SC.B - 10, 40, 'softOut') * (1 - prog(f, P.SC.C - 30, 30, 'softOut')) : 0;
  return <Depth x={L.card.x - CW / 2} y={L.card.y - CH / 2} z={-700 * recede}>
    <div style={{width: CW, height: CH, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${flip}deg) rotateX(${Math.sin(f / 70) * 2}deg)`, opacity: lerp(1, 0.35, recede)}}>
      <Front f={f} /><Back f={f} />
    </div>
  </Depth>;
};

// ---------------- problem: briefs from everywhere + Monday list ----------------
const Bubbles: React.FC<{f: number}> = ({f}) => {
  const items: {at: number; el: React.ReactNode; ang: number; r: number; z: number}[] = [
    {at: T.dm, ang: -40, r: 380, z: 160, el: <div style={{width: 640, borderRadius: 30, padding: 24, background: 'linear-gradient(135deg,#3A1D4E,#4E1F3A)', border: '1.5px solid #6C3A68', fontFamily: F.display, color: '#F7EAF5'}}>
      <Row gap={12}><Avatar name="Lumen Coffee" size={48} idx={0} /><div><b style={{fontSize: 25}}>lumen.coffee</b><div style={{fontSize: 19, color: '#C9A9C4'}}>Instagram DM · 9:12</div></div></Row>
      <div style={{fontSize: 27, marginTop: 14, lineHeight: 1.3}}>hey! could you do our rebrand + new bags? budget ~6k, need it by Dec</div></div>},
    {at: T.email, ang: 70, r: 420, z: 60, el: <div style={{width: 680, borderRadius: 26, padding: 22, background: '#F4F6F8', color: '#1B2733', fontFamily: F.display}}>
      <Row gap={12}><Logo name="gmail" size={40} round={10} bg="#fff" /><b style={{fontSize: 24}}>Aisha Bello</b><span style={{marginLeft: 'auto', fontSize: 19, color: '#6A7785'}}>9:40</span></Row>
      <div style={{fontSize: 25, fontWeight: 700, marginTop: 10}}>Brief: packaging refresh — see attached</div>
      <div style={{fontSize: 22, color: '#55626F'}}>Hi! Following up on the DM, attaching our moodboard and…</div>
      <Row gap={8} style={{marginTop: 10}}>{['moodboard.pdf', 'bag-dieline.ai'].map((x) => <span key={x} style={{fontSize: 18, padding: '4px 10px', borderRadius: 8, border: '1.5px solid #D5DCE3'}}>{x}</span>)}</Row></div>},
    {at: T.form, ang: 190, r: 400, z: 260, el: <div style={{width: 600, borderRadius: 26, padding: 22, background: '#FFFFFF', color: '#141414', fontFamily: F.display}}>
      <Row gap={12}><Logo name="tally" size={40} round={10} /><b style={{fontSize: 24}}>New response · Project brief</b></Row>
      {[['Name', 'Aisha Bello'], ['Company', 'Lumen Coffee Co.'], ['Budget', '$6–8k']].map(([k, v]) => <Row key={k} gap={10} style={{fontSize: 22, marginTop: 8}}><span style={{width: 120, color: '#777'}}>{k}</span><b>{v}</b></Row>)}</div>},
  ];
  const out = prog(f, T.rebuild - 16, 20, 'inHard');
  return <>{items.map((it, i) => { if (f < it.at - 4) return null; const p = prog(f, it.at - 4, 22, 'snapOut'); const ang = (it.ang + (f - it.at) * 0.12) * Math.PI / 180;
    return <Depth key={i} x={L.card.x + Math.cos(ang) * it.r * lerp(0.4, 1, p) - 320} y={L.card.y + Math.sin(ang) * it.r * 1.5 * lerp(0.4, 1, p) - 90 - out * 400} z={it.z} ry={Math.cos(ang) * -14} s={lerp(0.6, 1, p)}>
      <div style={{opacity: p * (1 - out)}}>{it.el}</div></Depth>; })}</>;
};
const Monday: React.FC<{f: number}> = ({f}) => {
  if (f < T.rebuild - 10 || f > P.SC.C + 10) return null; const p = prog(f, T.rebuild - 10, 20, 'snapOut'); const again = f >= T.monday;
  return <At x={L.card.x - 440} y={L.card.y - 300 + (1 - p) * 200} o={p * (1 - prog(f, P.SC.C - 14, 20, 'softOut'))}>
    <Win th={TH} w={880} title={again ? 'To-do · Mon, Nov 17' : 'To-do · Mon, Nov 10'} meta={<span style={{fontFamily: F.mono, color: again ? TH.hot : TH.muted}}>{again ? 'rebuilt again' : 'rebuilt'}</span>} pad={28}>
      {P.TODO.map((t, i) => { const at = P.todoAt[i]; const crossed = again && f >= T.monday + i * 3;
        return <div key={t} style={{padding: '10px 0', opacity: f >= at ? 1 : 0, borderBottom: `1.5px solid ${TH.line}`}}><Check th={TH} at={crossed ? T.monday + i * 3 : 1e9} bad size={30}>{t}</Check></div>; })}
    </Win></At>;
};

// ---------------- slot-column nodes ----------------
const NODE = [['tally', 'WHEN', 'Tally form', '“Project brief” sent'], ['trello', 'THEN', 'Trello card', 'list: New briefs'], ['clockify', 'AND', 'Clockify project', 'client + estimate'], ['telegram', 'AND', 'Telegram', 'message me']];
const Slots: React.FC<{f: number}> = ({f}) => (<>
  {[0, 1, 2].map((i) => <Wire key={i} x1={L.nodes[i].x + 112} y1={L.nodes[i].y} x2={L.nodes[i + 1].x - 112} y2={L.nodes[i + 1].y} p={prog(f, T.nodes[i + 1] + 10, 14, 'swift')} color={TH.accent} base={a(TH.ink, 0.15)} width={5} />)}
  {NODE.map(([lg, k, t, d], i) => { const st = P.slotSteps(i); if (f < st[0]) return null; const step = st.filter((x) => f >= x).length; const settle = prog(f, st[3], 14, 'snapOut');
    const pool = ['tally', 'trello', 'clockify', 'telegram']; const shown = step < 4 ? pool[(i + step) % 4] : lg;
    const lit = (i === 0 && vis(f, P.P.brief, P.P.dot1[0] + 20)) || (i === 1 && vis(f, P.P.dot1[0], P.P.trelloIn + 30)) || (i === 2 && vis(f, P.P.dot2[0], P.P.clockIn + 30)) || (i === 3 && vis(f, P.P.dot3[0], P.P.teleIn + 30));
    return <At key={i} x={L.nodes[i].x - 112} y={L.nodes[i].y - 165} w={224} h={330} style={{borderRadius: 28, background: TH.panel, border: `2px solid ${lit ? TH.accent : TH.line}`, boxShadow: lit ? `0 0 40px ${a(TH.accent, 0.4)}` : '0 30px 60px rgba(0,0,0,.4)', overflow: 'hidden', fontFamily: F.display, color: TH.ink, padding: 20}}>
      <div style={{transform: `translateY(${step < 4 ? -14 : (1 - settle) * -24}px)`, filter: step < 4 ? 'blur(2px)' : undefined}}><Logo name={shown} size={74} round={18} /></div>
      <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: 2, color: TH.accent, marginTop: 20, opacity: step >= 4 ? 1 : 0.3}}>{k}</div>
      <div style={{fontSize: 29, fontWeight: 700, lineHeight: 1.1, marginTop: 6, opacity: step >= 4 ? 1 : 0.3}}>{t}</div>
      <div style={{fontSize: 20, color: TH.muted, marginTop: 8}}>{d}</div>
    </At>; })}
</>);

// ---------------- payoff dashboard panels ----------------
const Tally: React.FC<{f: number}> = ({f}) => { const p = P.briefArr.p(f); if (p <= 0) return null;
  return <At x={L.tally.x - 430} y={L.tally.y - 360 + (1 - p) * 700} o={clamp(p * 2)}>
    <Win th={TH} w={860} logo="tally" title="Project brief · new response" meta={<span style={{fontFamily: F.mono}}>#112</span>} pad={26}>
      {[['Name', 'Aisha Bello'], ['Company', 'Lumen Coffee Co.'], ['Project', 'Brand refresh + coffee bag packaging'], ['Budget', '$6,000 – 8,000'], ['Deadline', 'Fri, Dec 12'], ['Files', 'moodboard.pdf · bag-dieline.ai · logo-old.svg']].map(([k, v], i) =>
        <Row key={k} gap={16} style={{fontSize: 25, padding: '10px 0', borderBottom: `1.5px solid ${TH.line}`, opacity: clamp((f - P.P.brief - 8 - i * 4) / 8)}}><span style={{width: 150, color: TH.muted, fontFamily: F.mono, fontSize: 21}}>{k}</span><b style={{fontWeight: 600}}>{v}</b></Row>)}
      <div style={{fontSize: 23, color: TH.muted, marginTop: 14, lineHeight: 1.35}}>“Warm, a bit playful, must work on kraft paper.”</div>
    </Win></At>; };
const Trello: React.FC<{f: number}> = ({f}) => { const p = P.trelloArr.p(f); if (p <= 0) return null;
  return <At x={L.trello.x - 430 + (1 - p) * 700} y={L.trello.y - 360} o={clamp(p * 2)}>
    <Win th={TH} w={860} logo="trello" title="Client work · New briefs" meta="Board" pad={26}>
      <Row gap={8}><Tag c="#FFD166" solid size={20} style={{color: '#2B2100'}}>Branding</Tag><Tag c="#7C8BFF" solid size={20}>Packaging</Tag><Tag c="#FF7AA8" solid size={20}>$6–8k</Tag></Row>
      <div style={{fontSize: 36, fontWeight: 800, marginTop: 14}}>Lumen Coffee — brand refresh</div>
      <Row gap={18} style={{marginTop: 10, fontSize: 23, color: TH.muted}}><span>Due <b style={{color: TH.ink}}>Dec 12</b></span><Avatar name="Aisha Bello" size={36} idx={3} /><span>3 attachments</span></Row>
      <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10}}><Check th={TH} size={24} at={P.P.trelloIn + 40}>Read brief + moodboard</Check><Check th={TH} size={24}>Send quote</Check><Check th={TH} size={24}>Kick-off call</Check></div>
      <Row gap={10} style={{marginTop: 16, fontSize: 21, color: TH.muted}}>{['New briefs', 'Quoted', 'In progress', 'Review'].map((c, i) => <span key={c} style={{padding: '6px 12px', borderRadius: 10, background: i === 0 ? a(TH.accent, 0.18) : TH.panel2, color: i === 0 ? TH.accent : TH.muted}}>{c}</span>)}</Row>
    </Win></At>; };
const Clock: React.FC<{f: number}> = ({f}) => { const p = P.clockArr.p(f); if (p <= 0) return null;
  return <At x={L.clock.x - 430 - (1 - p) * 700} y={L.clock.y - 330} o={clamp(p * 2)}>
    <Win th={TH} w={860} logo="clockify" title="Projects · Lumen Coffee" meta={<Tag c={TH.accent} size={19}>Billable</Tag>} pad={26}>
      <div style={{fontSize: 36, fontWeight: 800}}>Lumen Coffee — Brand refresh</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 18}}>
        {[['Client', 'Lumen Coffee Co.'], ['Rate', '$85 / h'], ['Estimate', `${P.est.shown(f)} h`]].map(([k, v]) => <div key={k} style={{padding: 16, borderRadius: 18, background: TH.panel2}}><div style={{fontSize: 20, color: TH.muted, fontFamily: F.mono}}>{k}</div><div style={{fontSize: 30, fontWeight: 700, marginTop: 4}}>{v}</div></div>)}
      </div>
      <Row style={{marginTop: 18, justifyContent: 'space-between', fontSize: 24}}><span style={{color: TH.muted}}>Timer</span><span style={{fontFamily: F.mono, fontSize: 40, color: TH.accent}}>00:00:00</span><span style={{padding: '10px 22px', borderRadius: 14, background: TH.accent, color: '#04201C', fontWeight: 700}}>Start</span></Row>
    </Win></At>; };
const Tele: React.FC<{f: number}> = ({f}) => { const p = P.teleArr.p(f); if (p <= 0) return null;
  return <At x={L.tele.x - 330 + (1 - p) * 700} y={L.tele.y - 420} o={clamp(p * 2)}>
    <div style={{width: 660, height: 840, borderRadius: 70, background: '#0B0F12', border: '10px solid #1D2A2E', boxShadow: '0 50px 100px rgba(0,0,0,.55)', overflow: 'hidden', fontFamily: F.display}}>
      <Row gap={14} style={{padding: '50px 30px 20px', background: '#17212B', color: '#fff'}}><Logo name="telegram" size={56} round={28} /><div><b style={{fontSize: 28}}>Brief Bot</b><div style={{fontSize: 20, color: '#8FA3B5'}}>bot · online</div></div></Row>
      <div style={{padding: 26, background: '#0E1621', height: '100%'}}>
        <div style={{maxWidth: 520, borderRadius: 26, padding: '18px 22px', background: '#182533', color: '#E8EEF4', fontSize: 27, lineHeight: 1.35, transform: `scale(${prog(f, P.P.teleIn + 14, 18, 'spring')})`, transformOrigin: 'left top'}}>
          <b style={{color: '#64B5EF'}}>New brief from Aisha Bello</b><br />Lumen Coffee Co. · $6–8k · due Dec 12<br /><span style={{color: '#8FA3B5', fontSize: 22}}>Trello card ✓ · Clockify project ✓</span>
          <div style={{textAlign: 'right', fontSize: 18, color: '#6C8296'}}>10:02</div></div>
      </div></div></At>; };

// ---------------- overlay type ----------------
const vw = (line: number, words: string[], starts: number[]) => words.map((w, i) => ({w, f: P.VO[line] + Math.round(starts[i] * 60)}));
const Overlay: React.FC<{f: number}> = ({f}) => {
  const {height: h} = useVideoConfig(); const top = h > 1500 ? 150 : 60; const bot = h > 1500 ? h - 420 : h - 300;
  const sh = hitShake(f, T.onePlace - 4, 0.1);
  return <AbsoluteFill style={{pointerEvents: 'none', textAlign: 'center', fontFamily: F.display, color: TH.ink}}>
    {vis(f, 6, P.SC.B) && <div style={{position: 'absolute', left: 0, right: 0, top, fontSize: 70, fontWeight: 700, lineHeight: 1.05, opacity: 1 - prog(f, P.SC.B - 14, 14, 'inHard')}}>
      <div>If I were a</div><RotatingWord words={P.ROLE} at={P.T.swap} color={[TH.muted, TH.muted, TH.accent]} style={{fontWeight: 800, fontSize: 84}} /></div>}
    {vis(f, T.one - 40, P.SC.B) && <div style={{position: 'absolute', left: 60, right: 60, top: bot, opacity: 1 - prog(f, P.SC.B - 14, 14, 'inHard')}}>
      <VoLine words={vw(0, ['this', 'is', 'the', 'one', 'automation', "I'd", 'set', 'up', 'first.'], [1.8, 1.92, 2.06, 2.22, 2.46, 2.96, 3.5, 3.62, 3.8])} hot={{first: TH.hot}} style={{fontSize: 60, fontWeight: 700, lineHeight: 1.1}} /></div>}
    {vis(f, T.dm - 10, T.rebuild - 8) && <div style={{position: 'absolute', left: 40, right: 40, top: bot + 40}}>
      <VoLine words={vw(1, ['Briefs', 'come', 'in', 'by', 'DM,', 'email,', 'a', 'form…'], [0, 0.3, 0.44, 0.6, 0.76, 1.58, 2.22, 2.28])} hot={{dm: TH.hot, email: TH.hot, form: TH.hot}} f1={T.rebuild - 20} style={{fontSize: 64, fontWeight: 800}} /></div>}
    {vis(f, T.rebuild - 4, P.SC.C) && <div style={{position: 'absolute', left: 40, right: 40, top}}>
      <VoLine words={vw(1, ['…and', 'you', 'rebuild', 'your', 'to-do', 'list', 'every', 'Monday.'], [2.92, 3.0, 3.2, 3.44, 3.74, 4.02, 4.24, 4.56])} hot={{rebuild: TH.hot, monday: TH.hot}} f1={P.SC.C - 14} style={{fontSize: 62, fontWeight: 800, lineHeight: 1.08}} /></div>}
    {vis(f, T.lands - 10, P.SC.F) && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 30% at 50% 14%, ${a(PAL.bg, 0.9 * prog(f, T.lands - 10, 20, 'softOut'))}, transparent 100%), radial-gradient(ellipse 90% 30% at 50% 88%, ${a(PAL.bg, 0.9 * prog(f, T.lands - 10, 20, 'softOut'))}, transparent 100%)`}} />}
    {vis(f, T.lands - 10, P.SC.F) && <div style={{position: 'absolute', left: 30, right: 30, top, transform: `translate(${sh.x}px, ${sh.y}px) scale(${sh.s})`}}>
      <VoLine words={vw(4, ['Every', 'brief', 'lands', 'in', 'one', 'place,'], [0, 0.22, 0.58, 0.78, 1.06, 1.24])} hot={{one: TH.accent, place: TH.accent}} style={{fontSize: 74, fontWeight: 800, lineHeight: 1.05}} />
      <div style={{marginTop: 14, display: 'inline-block'}}><Stamp f0={T.ready} c={TH.hot} size={38}>ready to track</Stamp></div></div>}
    {vis(f, T.opened - 50, P.SC.F) && <div style={{position: 'absolute', left: 40, right: 40, top: bot + 40}}>
      <VoLine words={vw(4, ['before', "you've", 'even', 'opened', 'it.'], [3.22, 3.44, 3.82, 4.0, 4.28])} hot={{opened: TH.hot}} style={{fontSize: 64, fontWeight: 800}} /></div>}
  </AbsoluteFill>;
};

// ---------------- end ----------------
const End: React.FC<{f: number}> = ({f}) => (
  <At x={0} y={600} w={1080} style={{textAlign: 'center', fontFamily: F.display, color: TH.ink}}>
    <div style={{display: 'inline-block', transform: `scale(${lerp(0.4, 1, prog(f, T.endCard + 4, 30, 'spring'))})`, filter: `drop-shadow(0 0 40px ${a(TH.accent, 0.5)})`}}><Logo name="fansa" size={210} round={56} /></div>
    <TrackIn f0={T.endCard + 10} dur={60} from={0.5} style={{fontWeight: 800, fontSize: 116, marginTop: 24}}>FansaChat</TrackIn>
    <div style={{fontFamily: F.mono, fontSize: 34, color: TH.muted, marginTop: 6, opacity: clamp((f - T.endCard - 25) / 12)}}>catch every brief in one place</div>
    <div style={{marginTop: 50, display: 'inline-block', transform: `scale(${prog(f, P.VO[5] + 4, 20, 'spring')})`}}><Tag c={TH.accent} solid size={46} style={{color: '#04201C'}}>Join the waitlist · link in bio</Tag></div>
  </At>
);

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  const sw = prog(f, P.SC.F - 16, 30, 'swift'); const inF = f >= P.SC.F - 16;
  const cut = `polygon(${sw * 160 - 30}% 0, 200% 0, 200% 100%, ${sw * 160 - 60}% 100%)`;
  return <AbsoluteFill style={{background: PAL.bg}}>
    <AbsoluteFill style={{clipPath: inF ? cut : undefined}}>
      <LivingBg p={PAL} cam={P.cam} particles={44} seed={21} />
      <CameraRig cam={P.cam} id="w" perspective={1800}>
        {f < P.SC.E + 60 && <Card f={f} />}
        {vis(f, P.SC.B - 10, P.SC.C + 10) && <Bubbles f={f} />}
        <Monday f={f} />
        {f >= T.buildStart - 2 && <Slots f={f} />}
        {f >= P.SC.E - 20 && <>
          {[[L.nodes[0], L.tally, [P.SC.E - 10, 30], 0], [L.tally, L.trello, P.P.dot1, -200], [L.trello, L.clock, P.P.dot2, 200], [L.clock, L.tele, P.P.dot3, -200]].map(([A, B, d, bend], i) => { const D = d as readonly [number, number]; const a0 = A as {x: number; y: number}, b0 = B as {x: number; y: number}; const t = (f - D[0]) / D[1];
            const p1 = i === 0 ? {x: a0.x, y: a0.y + 165} : {x: a0.x + (i === 2 ? -200 : 430), y: a0.y + (i === 2 ? 360 : 0)}; const p2 = i === 0 ? {x: b0.x - 300, y: b0.y - 360} : {x: b0.x - (i === 2 ? -200 : 430), y: b0.y - (i === 2 ? 330 : 0)};
            return f > D[0] - 20 && <Wire key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} bend={bend as number} p={prog(f, D[0] - 20, 24, 'swift')} dot={t >= 0 && t <= 1 ? prog(f, D[0], D[1], 'inOut') : -1} color={TH.accent} base={a(TH.ink, 0.15)} />; })}
          <Tally f={f} /><Trello f={f} /><Clock f={f} /><Tele f={f} /></>}
      </CameraRig>
      <Overlay f={f} />
    </AbsoluteFill>
    {inF && <AbsoluteFill style={{clipPath: `polygon(-100% 0, ${sw * 160 - 30}% 0, ${sw * 160 - 60}% 100%, -100% 100%)`}}>
      <LivingBg p={{...PAL, bg: '#062022'}} cam={P.camF} particles={40} seed={29} />
      <CameraRig cam={P.camF} id="e"><End f={f} /></CameraRig>
    </AbsoluteFill>}
    {inF && sw > 0 && sw < 1 && <div style={{position: 'absolute', top: 0, left: 0, width: w, height: h, background: `linear-gradient(105deg, transparent ${sw * 160 - 62}%, ${a('#FFFFFF', 0.85)} ${sw * 160 - 46}%, transparent ${sw * 160 - 28}%)`, mixBlendMode: 'screen', pointerEvents: 'none'}} />}
    <Corners p={PAL} label={['BRIEF CATCHER', 'P07 · {t}']} />
  </AbsoluteFill>;
};
