// P05 on the REAL interface. All timing comes from plan.ts (shared with the sound). Every piece of our own type is a
// <G> registered with the TextGuard. Footage = our real /workflow page; Notion + Slack cards are recreations of each
// app's layout carrying the exact text of the real run (real_results.json). Two font families: display + sans.
import React, {useMemo} from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {At, CameraRig, Depth, hitShake} from '../kit/CameraRig';
import {clamp, lerp, noise1, prog} from '../kit/curves';
import {EndCard} from '../kit/EndCard';
import {F} from '../kit/fonts';
import {Corners, LiveBorder, LivingBg, Pal, a} from '../kit/Living';
import {G, TextGuard} from '../kit/TextGuard';
import {GiantLetters, longShadow} from '../kit/type';
import {Cursor, Logo} from '../kit/ui';
import * as P from './plan';

const {T, UI, CARD} = P;
export const PAL: Pal = {bg: '#DCE3EA', bg2: '#BCC9D8', glow: '#FFFFFF', glow2: '#B7A6FF', line: '#AFBCCC', ink: '#0B1520', muted: '#3A475A', accent: '#6A4CFF', hot: '#E2491A', panel: '#F7F9FC', panelLine: '#D3DCE6', dark: false};
const INK = PAL.ink, SUB = '#3A475A', HOT = '#E2491A', HOT_D = '#B8330C', ACC = PAL.accent, NOTE = '#2A2418';
const fade = (f: number, a0: number, a1: number, len = 8) => clamp((f - a0) / len) * (1 - clamp((f - (a1 - len)) / len));
const vis = (f: number, a0: number, a1: number) => f >= a0 && f < a1;

// ---------------- world A: hook + problem ----------------
const Sticky: React.FC<{id: string; t: string; c: string; w: number; h: number; size?: number; strike?: number}> = ({id, t, c, w, h, size = 40, strike = 0}) => (
  <div style={{width: w, height: h, background: c, borderRadius: 6, boxShadow: '0 18px 30px rgba(40,40,60,.22), inset 0 -10px 18px rgba(0,0,0,.05)', padding: 24, position: 'relative'}}>
    <div style={{position: 'absolute', top: -12, left: w / 2 - 40, width: 80, height: 26, background: a('#ffffff', 0.55), transform: 'rotate(-3deg)'}} />
    <G id={id} size={size} color={NOTE} font={F.sans} weight={600} style={{lineHeight: 1.12}}>{t}</G>
    {strike > 0 && <div style={{position: 'absolute', left: 18, top: 24 + size * 0.62, height: 7, width: (w - 36) * strike, background: HOT, borderRadius: 4}} />}
  </div>
);
const RealStill: React.FC<{w: number; at: number}> = ({w, at}) => ( // a frame of the real page (diagram drawn)
  <div style={{width: w, height: (w * 9) / 16, borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 60px rgba(30,40,80,.25)', border: `2px solid ${a('#ffffff', 0.9)}`}}>
    <Freeze frame={0}><OffthreadVideo src={staticFile('real/P05_ui.webm')} trimBefore={Math.round(at * 60)} muted style={{width: w, height: (w * 9) / 16}} /></Freeze>
  </div>
);
const MEET = ['9:00  Standup', '10:00  Hiring sync', '11:30  Q4 review', '13:00  Board deck', '15:00  Vendor call'];

const WorldA: React.FC<{f: number}> = ({f}) => {
  const hook = 1 - clamp((f - T.hookOut) / 10);
  const bookP = prog(f, T.booking, 24, 'snapOut'), bookO = clamp((f - T.booking) / 6) * (1 - clamp((f - T.calOut - 6) / 10));
  const calP = prog(f, T.cal, 30, 'snapOut'), calOut = prog(f, T.calOut, 22, 'inHard');
  const covered = calP > 0.35 && calOut < 0.7; // notes are under the calendar
  const n1 = f >= T.note1 ? prog(f, T.note1, 14, 'snapOut') : 0, n2 = f >= T.note2 ? prog(f, T.note2, 14, 'snapOut') : 0;
  const n1o = covered || f >= T.calOut ? 0 : n1, n2o = covered ? 0 : n2;
  const hs = hitShake(f, T.mattered, 0.12);
  return <>
    {/* hook */}
    {hook > 0 && <>
      <At x={0} y={378} w={1080} o={hook * clamp((f - T.head) / 8)} style={{textAlign: 'center'}}><G id="head" size={66} color={INK} font={F.display} weight={800} style={{letterSpacing: '-0.02em'}}>Booking sales calls</G></At>
      <At x={70} y={520} w={430} o={hook * clamp((f - T.this) / 3)} style={{textAlign: 'center'}}><G id="this" size={140} color={HOT} font={F.display}><GiantLetters text="THIS" f0={T.this} stagger={4} size={140} color={HOT} shadow={longShadow('#9C2E0C', 10)} font={F.display} /></G></At>
      <At x={580} y={520} w={430} o={hook * clamp((f - T.that) / 3)} style={{textAlign: 'center'}}><G id="that" size={140} color={ACC} font={F.display}><GiantLetters text="THAT" f0={T.that} stagger={4} size={140} color={ACC} shadow={longShadow('#3B2A99', 10)} font={F.display} /></G></At>
      <At x={492} y={552} w={96} h={96} o={hook * clamp((f - T.this - 6) / 8)} style={{borderRadius: 48, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 8px ${a(PAL.bg, 0.8)}`}}><G id="or" size={42} color="#FFFFFF" font={F.display} weight={700}>or</G></At>
      <At x={540} y={760} w={3} h={600} o={hook * 0.5} style={{background: a(INK, 0.4)}}>{null}</At>
      {[{id: 'h-note1', t: 'call Dana??', x: 90, y: 790, r: -6, c: '#FFE066'}, {id: 'h-note2', t: 'CRM later…', x: 230, y: 1030, r: 5, c: '#FF9EBB'}].map((n, i) => { const p = prog(f, 4 + i * 6, 22, 'snapOut');
        return <At key={n.id} x={n.x} y={n.y} o={hook * p} style={{transform: `rotate(${n.r + noise1(f / 50, i) * 1.5}deg) scale(${lerp(1.25, 1, p)})`}}><Sticky id={n.id} t={n.t} c={n.c} w={240} h={190} size={36} /></At>; })}
      <At x={590} y={850} o={hook * clamp((f - 8) / 12)}><Depth ry={-14 + noise1(f / 60, 3) * 3} rx={4}><RealStill w={420} at={41.5} /></Depth></At>
      <At x={70} y={1278} w={430} o={hook * clamp((f - T.this) / 10)} style={{textAlign: 'center'}}><G id="cap-this" size={36} color={INK} font={F.sans} weight={700}>Sticky notes</G></At>
      <At x={580} y={1278} w={430} o={hook * clamp((f - T.that) / 10)} style={{textAlign: 'center'}}><G id="cap-that" size={36} color={INK} font={F.sans} weight={700}>One sentence</G></At>
    </>}
    {/* problem: a booking comes in */}
    {bookO > 0 && <At x={110} y={420 - (1 - bookP) * 240} w={860} h={200} o={bookO} style={{borderRadius: 28, background: '#FFFFFF', boxShadow: '0 30px 60px rgba(20,25,50,.18)', display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px'}}>
      <Logo name="webhook" size={84} round={20} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <G id="book-k" size={28} color={SUB} font={F.sans} weight={600}>New booking · booking form</G>
        <G id="book-name" size={38} color={INK} font={F.sans} weight={700}>Dana Whitfield, Northwind Studio</G>
        <G id="book-what" size={30} color={SUB} font={F.sans}>Sales call</G>
      </div>
    </At>}
    {/* cork board + the two notes */}
    {f >= T.booking && f < T.cutB && <At x={110} y={680} w={860} h={470} o={(1 - clamp((f - T.calOut) / 16)) * clamp((f - T.booking) / 10)} style={{borderRadius: 26, background: '#E9DCC5', boxShadow: 'inset 0 0 0 10px #D8C6A6, 0 30px 60px rgba(60,50,30,.2)'}}>{null}</At>}
    {n1o > 0 && <At x={150} y={730} o={n1o} style={{transform: `rotate(-4deg) scale(${lerp(1.3, 1, n1)})`}}><Sticky id="note1" t="add Dana to CRM" c="#FFE066" w={330} h={250} /></At>}
    {n2o > 0 && f < T.cutB && <At x={570 + hs.x} y={760 + hs.y} o={n2o} style={{transform: `rotate(3deg) scale(${lerp(1.3, 1, n2) * hs.s})`, filter: f >= T.forgot ? `saturate(${lerp(1, 0.55, prog(f, T.forgot, 30))})` : undefined}}><Sticky id="note2" t="prep for the call" c="#FF9EBB" w={330} h={250} strike={prog(f, T.forgot, 14, 'swift')} /></At>}
    {f >= T.forgot + 10 && f < T.cutB && <At x={735 - 230} y={1060} w={460} h={96} o={clamp((f - T.forgot - 10) / 4)} style={{borderRadius: 18, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(1.25, 1, prog(f, T.forgot + 10, 14, 'snapOut'))}) rotate(-3deg)`, boxShadow: '0 20px 40px rgba(60,20,10,.2)', border: `4px solid ${HOT_D}`}}><G id="stamp" size={44} color={HOT_D} font={F.display} weight={800} style={{letterSpacing: '0.04em'}}>NOT PREPPED</G></At>}
    {/* the day happens: calendar slides over the board */}
    {calP > 0 && calOut < 1 && <At x={110} y={660 + (1 - calP) * 900 + calOut * 1100} w={860} h={760} style={{borderRadius: 28, background: '#FFFFFF', boxShadow: '0 40px 80px rgba(20,25,50,.22)', padding: '30px 36px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18}}><Logo name="google-calendar" size={56} round={14} /><G id="cal-h" size={38} color={INK} font={F.sans} weight={700}>Today</G></div>
      {MEET.map((m, i) => { const p = prog(f, T.cal + 26 + i * 9, 14, 'spring');
        return <div key={m} style={{height: 112, marginBottom: 14, borderRadius: 18, background: ['#E8E4FF', '#DDF3EA', '#FFE9DC', '#E3EEFF', '#F1E8FF'][i], borderLeft: `8px solid ${[ACC, '#14A06A', HOT, '#2F6FE0', '#8A4CD6'][i]}`, display: 'flex', alignItems: 'center', padding: '0 26px', transform: `scale(${lerp(0.85, 1, p)})`, transformOrigin: '0 50%', opacity: clamp(p * 1.5)}}>
          <G id={`meet${i}`} size={34} color={INK} font={F.sans} weight={600} style={{whiteSpace: 'pre'}}>{m}</G></div>; })}
    </At>}
  </>;
};

// ---------------- world B: the real page, then the results ----------------
const Footage: React.FC = () => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, borderRadius: 26, overflow: 'hidden', background: '#F6F6F8', boxShadow: '0 50px 120px rgba(20,25,60,.28), 0 10px 30px rgba(20,25,60,.15)'}}>
    {P.SEG.map((g, i) => <Sequence key={i} from={g.f0} durationInFrames={g.f1 - g.f0} layout="none">
      <OffthreadVideo src={staticFile('real/P05_ui.webm')} trimBefore={Math.round(g.a * 60)} playbackRate={g.r} muted style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />
    </Sequence>)}
    <LiveBorder color={a(ACC, 0.7)} r={26} width={3} speed={40} />
  </div>
);
const Card: React.FC<{y: number; h: number; p: number; o: number; children: React.ReactNode}> = ({y, h, p, o, children}) => (
  <At x={CARD.x - CARD.w / 2} y={y + (1 - p) * 120} w={CARD.w} h={h} o={o} style={{borderRadius: 30, background: '#FFFFFF', boxShadow: '0 40px 80px rgba(20,25,60,.22), 0 8px 20px rgba(20,25,60,.1)', overflow: 'hidden'}}>
    {children}<LiveBorder color={a(ACC, 0.6)} r={30} width={3} speed={50} phase={y} />
  </At>
);
const Skel: React.FC<{w: number; o?: number}> = ({w, o = 1}) => <div style={{width: w, height: 18, borderRadius: 9, background: '#ECEEF2', opacity: o}} />;
const Results: React.FC<{f: number}> = ({f}) => {
  const np = P.notionArr.p(f), sp = P.slackArr.p(f);
  const created = prog(f, T.notionIn + 30, 14, 'snapOut');
  return <>
    {np > 0 && <Card y={CARD.notion.y} h={CARD.notion.h} p={np} o={clamp(np * 2)}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 30px', borderBottom: '2px solid #EFEFEF'}}>
        <Logo name="notion" size={52} round={12} /><G id="n-app" size={32} color={INK} font={F.sans} weight={700}>Notion</G>
        <div style={{display: 'flex', gap: 10, marginLeft: 22}}><Skel w={90} o={0.8} /><Skel w={120} o={0.8} /></div>
      </div>
      <div style={{padding: '36px 56px 0'}}>
        <div style={{width: 74, height: 74, borderRadius: 16, background: '#F1F0EE', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Logo name="notion" size={46} round={10} /></div>
        <G id="n-title" size={64} color="#191919" font={F.sans} weight={700} style={{letterSpacing: '-0.01em'}}>{P.NOTION_TITLE}</G>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 26}}><Skel w={520} /><Skel w={440} /><Skel w={480} /></div>
      </div>
      {created > 0 && <div style={{position: 'absolute', right: 34, top: 120, padding: '10px 20px', borderRadius: 14, border: '3px solid #0E7A50', background: '#FFFFFF', transform: `scale(${lerp(1.6, 1, created)}) rotate(-3deg)`, opacity: clamp(created * 3)}}><G id="n-stamp" size={32} color="#0E7A50" font={F.sans} weight={800}>Page created</G></div>}
    </Card>}
    {sp > 0 && <Card y={CARD.slack.y} h={CARD.slack.h} p={sp} o={clamp(sp * 2)}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 30px', borderBottom: '2px solid #EFEFEF', background: '#FAFAFA'}}>
        <Logo name="slack" size={52} round={12} /><G id="s-app" size={32} color={INK} font={F.sans} weight={700}>Slack</G>
        <div style={{display: 'flex', gap: 10, marginLeft: 22}}><Skel w={140} o={0.8} /></div>
      </div>
      <div style={{display: 'flex', gap: 22, padding: '26px 34px'}}>
        <Logo name="fansa" size={70} round={16} bg="#F1EEFF" />
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><G id="s-who" size={32} color="#1D1C1D" font={F.sans} weight={800}>FansaChat</G>
            <span style={{padding: '2px 10px', borderRadius: 6, background: '#E8E8E8'}}><G id="s-app-tag" size={32} color="#4A4A4A" font={F.sans} weight={700}>APP</G></span></div>
          <G id="s-msg" size={36} color="#1D1C1D" font={F.sans} style={{lineHeight: 1.3, marginTop: 8}}>{P.SLACK_TEXT}</G>
        </div>
      </div>
    </Card>}
  </>;
};
const DataDot: React.FC<{f: number}> = ({f}) => {
  const d = P.dot(f); if (!d) return null;
  const tr = [3, 6, 9].map((k) => P.dot(f - k)).filter(Boolean) as {x: number; y: number}[];
  return <>
    {tr.map((t, i) => <div key={i} style={{position: 'absolute', left: t.x - (9 - i * 2), top: t.y - (9 - i * 2), width: (9 - i * 2) * 2, height: (9 - i * 2) * 2, borderRadius: 20, background: ACC, opacity: 0.45 - i * 0.12}} />)}
    <div style={{position: 'absolute', left: d.x - 30, top: d.y - 30, width: 60, height: 60, borderRadius: 30, background: a(ACC, 0.2)}} />
    <div style={{position: 'absolute', left: d.x - 12, top: d.y - 12, width: 24, height: 24, borderRadius: 12, background: ACC, boxShadow: `0 0 22px 6px ${a(ACC, 0.6)}`, border: '3px solid #fff'}} />
  </>;
};
const WorldB: React.FC<{f: number}> = ({f}) => {
  const c = P.cursor.at(f); const chip = fade(f, T.chip, T.d2 + 6, 8);
  return <>
    <Footage />
    {vis(f, P.F_SHAPE - 56, P.F_SHAPE + 50) && <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(0.7)', transformOrigin: `${c.x}px ${c.y}px`}}><Cursor x={c.x} y={c.y} press={c.press} clicks={P.cursor.clicks} ring={ACC} o={fade(f, P.F_SHAPE - 56, P.F_SHAPE + 50, 8)} /></div>}
    {chip > 0 && <At x={UI.trig.x - 150} y={UI.trig.y + 78 + (1 - prog(f, T.chip, 14, 'snapOut')) * 16} w={300} h={64} o={chip} style={{borderRadius: 16, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(10,15,30,.25)'}}>
      <G id="chip" size={13} color="#FFFFFF" font={F.sans} weight={700}>New booking · Dana Whitfield</G></At>}
    <DataDot f={f} />
    <Results f={f} />
  </>;
};

// ---------------- screen space: captions, headline, which side ----------------
const Captions: React.FC<{f: number; h: number}> = ({f, h}) => {
  const c = P.CAPS.find(([, a0, a1]) => f >= a0 && f < a1); if (!c) return null;
  const o = fade(f, c[1], c[2], 8); const p = prog(f, c[1], 16, 'snapOut');
  return <div style={{position: 'absolute', left: 0, width: 1080, top: h * 0.06 + 34, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * -20}px)`}}>
    <div style={{padding: '18px 38px', borderRadius: 999, background: INK, boxShadow: '0 16px 40px rgba(10,15,30,.3)'}}><G id="caption" size={46} color="#FFFFFF" font={F.display} weight={700}>{c[0]}</G></div>
  </div>;
};
const AutoHead: React.FC<{f: number; h: number}> = ({f, h}) => {
  if (f < T.auto - 2 || f >= T.outB) return null; const p = prog(f, T.auto - 2, 18, 'snapOut');
  return <div style={{position: 'absolute', left: 0, width: 1080, top: h * 0.06 + 30, textAlign: 'center', opacity: clamp(p * 3) * (1 - clamp((f - T.outB + 8) / 8)), transform: `scale(${lerp(1.12, 1, p)})`}}>
    <G id="auto" size={92} color={INK} font={F.display} weight={800} style={{letterSpacing: '-0.03em'}}>Automatically.</G></div>;
};
const WhichSide: React.FC<{f: number; h: number}> = ({f, h}) => {
  const o = fade(f, T.F, T.outF + 8, 8); const c0 = h / 2 - 130;
  const card = (i: number) => prog(f, T.F + 8 + i * 8, 22, 'spring');
  return <AbsoluteFill style={{opacity: o}}>
    <div style={{position: 'absolute', left: 0, width: 1080, top: c0 - 330, textAlign: 'center'}}><G id="q" size={84} color={INK} font={F.display} weight={800} style={{lineHeight: 1.02, letterSpacing: '-0.02em'}}>Which side<br />are you on?</G></div>
    {[{id: 'this', l: 'THIS', c: 'Sticky notes', bg: HOT_D, x: 90}, {id: 'that', l: 'THAT', c: 'One sentence', bg: ACC, x: 560}].map((k, i) => (
      <div key={k.id} style={{position: 'absolute', left: k.x, top: c0, width: 430, height: 420, borderRadius: 36, background: k.bg, transform: `scale(${card(i)}) rotate(${i ? 2 : -2}deg)`, opacity: clamp((card(i) - 0.55) * 3), boxShadow: '0 30px 60px rgba(20,25,50,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
        <G id={`w-${k.id}`} size={92} color="#FFFFFF" font={F.display} weight={800}>{k.l}</G>
        {i === 0 ? <div style={{width: 150, height: 120, background: '#FFE066', borderRadius: 6, transform: 'rotate(-5deg)', boxShadow: '0 10px 20px rgba(0,0,0,.2)'}} /> : <div style={{display: 'flex', gap: 14}}><Logo name="webhook" size={70} round={16} /><Logo name="notion" size={70} round={16} /><Logo name="slack" size={70} round={16} /></div>}
        <G id={`wc-${k.id}`} size={40} color="#FFFFFF" font={F.sans} weight={700}>{k.c}</G>
      </div>))}
  </AbsoluteFill>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {height: h} = useVideoConfig();
  const {camA, camB} = useMemo(() => P.cams(h), [h]);
  const inB = f >= T.cutB && f < T.outB + 10; const bO = 1 - clamp((f - T.outB) / 10);
  return <AbsoluteFill style={{background: PAL.bg}}>
    <LivingBg p={PAL} cam={f >= T.cutB ? camB : camA} rings={f < T.cutB} />
    {f < T.cutB && <AbsoluteFill style={{opacity: 1 - clamp((f - T.whip) / 4)}}><CameraRig cam={camA} id="a"><WorldA f={f} /></CameraRig></AbsoluteFill>}
    {inB && <AbsoluteFill style={{opacity: bO}}><CameraRig cam={camB} id="b" blur={0.15}><WorldB f={f} /></CameraRig></AbsoluteFill>}
    {inB && <Captions f={f} h={h} />}
    <AutoHead f={f} h={h} />
    {f >= T.F && f < T.end && <WhichSide f={f} h={h} />}
    {f >= T.end && <EndCard f0={T.end} pill={T.pill} apps={['webhook', 'notion', 'slack']} tagline="One sentence. It runs." accent={ACC} ink={INK} muted={SUB} display={F.display} body={F.sans} dot={[T.end + 40, 50]} pillSize={48} sweepAlpha={0.18} />}
    <Corners p={PAL} />
    <TextGuard every={4} label="P05R" />
  </AbsoluteFill>;
};
