// FansaChat introduction film v5 (I27). Taxtello-prompt motion language on the REAL builder:
// one product surface, payoffs are state changes on it (steps morph in place, branches light, Draft → Approved).
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import SPEC from '../intro26/I26.json';
import {ez, EXPO, FONT, Glyph, Line, Lockup, Roll, Theme, THEMES} from './ui';

export type Vo = {file: string; dur: number; words: {w: string; s: number; e: number}[]}[];
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LEAD = 20, GAP = 18, END_HOLD = 150;
export const estimateVo = (): Vo => SPEC.lines.map((t, i) => { const ws = t.split(' '); const dur = ws.length / 2.5 + 0.3; return {file: `v/I26/${String(i + 1).padStart(2, '0')}.wav`, dur, words: ws.map((w, j) => ({w, s: (j / ws.length) * dur, e: ((j + 1) / ws.length) * dur}))}; });
export const timeline = (vo: Vo) => { const st: number[] = []; let t = LEAD; vo.forEach((l) => { st.push(t); t += Math.round(l.dur * FPS) + GAP; }); return {st, total: t + END_HOLD}; };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const makeWf = (vo: Vo, st: number[]) => (li: number, pre: string[], nth = 0) => {
  let k = 0; for (const x of vo[li]?.words ?? []) if (pre.some((p) => norm(x.w).startsWith(p))) { if (k === nth) return st[li] + Math.round(x.s * FPS); k++; }
  const toks = SPEC.lines[li].split(' ').map(norm); let n = 0;
  for (let i = 0; i < toks.length; i++) if (pre.some((p) => toks[i].startsWith(p))) { if (n === nth) return st[li] + Math.round((i / toks.length) * (vo[li]?.dur ?? 3) * FPS); n++; }
  return st[li];
};

// ---------- flows (only apps in our catalogue; triggers have t>0 or are schedules) ----------
type Step = {k: string; label: string; c: number; r?: number; tag?: string};
type Flow = {title: string; you: string; steps: Step[]; edges: [number, number, string?][]};
const lin = (n: number) => Array.from({length: n - 1}, (_, i) => [i, i + 1] as [number, number]);
const FLOWS: Flow[] = [
  {title: 'Client Onboarding', you: 'When a client pays in Stripe, create their Drive folder, send the DocuSign contract and a kickoff email.', steps: [{k: 'stripe', label: 'Client pays', c: 0}, {k: 'drive', label: 'Create client folder', c: 1}, {k: 'docusign', label: 'Send contract', c: 2}, {k: 'gmail', label: 'Send kickoff email', c: 3}], edges: lin(4)},
  {title: 'Invoice Reminders', you: "Every morning, find overdue Xero invoices, wait 3 days, and send a polite reminder if they're still unpaid.", steps: [{k: 'schedule', label: 'Every morning', c: 0}, {k: 'xero', label: 'Find overdue invoices', c: 1}, {k: 'wait', label: 'Wait 3 days', c: 2}, {k: 'router', label: 'Paid yet?', c: 3}, {k: 'gmail', label: 'Send polite reminder', c: 4, r: 0.55}, {k: 'xero', label: 'Mark as settled', c: 4, r: -0.55}], edges: [[0, 1], [1, 2], [2, 3], [3, 4, 'No'], [3, 5, 'Yes']]},
  {title: 'Booking to Deal', you: 'When someone books a Calendly call, create a Pipedrive deal and write me a prep note.', steps: [{k: 'calendly', label: 'New booking', c: 0.5}, {k: 'pipedrive', label: 'Create deal', c: 1.75}, {k: 'ai', label: 'Write prep note', c: 3}], edges: lin(3)},
  {title: 'Ad Lead Routing', you: 'When a Meta lead form comes in, add the lead to HubSpot and tell the right owner on Slack.', steps: [{k: 'meta', label: 'New ad lead', c: 0}, {k: 'hubspot', label: 'Create contact', c: 1}, {k: 'router', label: 'Which region?', c: 2}, {k: 'slack', label: 'Notify EU owner', c: 3, r: -0.55}, {k: 'slack', label: 'Notify US owner', c: 3, r: 0.55}], edges: [[0, 1], [1, 2], [2, 3, 'EU'], [2, 4, 'US']]},
  {title: 'Monday Client Report', you: "Every Monday at 8, pull last week's Search Console numbers, summarise them, build a Slides report and email the client.", steps: [{k: 'schedule', label: 'Mondays 08:00', c: 0}, {k: 'gsc', label: 'Pull last week', c: 1}, {k: 'ai', label: 'Summarise results', c: 2}, {k: 'slides', label: 'Build the report', c: 3}, {k: 'gmail', label: 'Send to client', c: 4}], edges: lin(5)},
  {title: 'Team Flows', you: 'Give each role on my team its own flow.', steps: [{k: 'hubspot', label: 'New client', c: 0.6, r: -1}, {k: 'gcal', label: 'Book kickoff', c: 1.8, r: -1}, {k: 'gmail', label: 'Send agenda', c: 3, r: -1}, {k: 'figma', label: 'Design request', c: 0.6, r: 0}, {k: 'drive', label: 'Share assets', c: 1.8, r: 0}, {k: 'slack', label: 'Ping for review', c: 3, r: 0}, {k: 'asana', label: 'New project', c: 0.6, r: 1}, {k: 'clickup', label: 'Create tasks', c: 1.8, r: 1}, {k: 'slides', label: 'Status update', c: 3, r: 1}], edges: [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8]]},
  {title: 'Feedback Routing', you: 'When a client comments in Figma, send it to whoever owns the file on Slack.', steps: [{k: 'figma', label: 'New comment', c: 0.5}, {k: 'router', label: 'Who owns the file?', c: 1.75}, {k: 'slack', label: 'DM the designer', c: 3, r: -0.55}, {k: 'slack', label: 'DM the copywriter', c: 3, r: 0.55}], edges: [[0, 1], [1, 2, 'Design'], [1, 3, 'Copy']]},
  {title: 'Appointment Reminders', you: 'When someone books in Acuity, text them a reminder 24 hours before.', steps: [{k: 'acuity', label: 'New appointment', c: 0.5}, {k: 'wait', label: 'Until 24 h before', c: 1.75}, {k: 'twilio', label: 'Send SMS reminder', c: 3}], edges: lin(3)},
  {title: 'Order Follow-up', you: 'When a Shopify order ships, track it with Shippo and ask for a review 5 days after delivery.', steps: [{k: 'shopify', label: 'Order fulfilled', c: 0}, {k: 'shippo', label: 'Track the parcel', c: 1.33}, {k: 'wait', label: '5 days after delivery', c: 2.66}, {k: 'gmail', label: 'Ask for a review', c: 4}], edges: lin(4)},
];
const LANES = ['Account manager', 'Designer', 'Project lead'];

// ---------- builder window ----------
type BState = {flow: number; at: number; prev: number; active: number; approveAt: number; popAt: number; smsAt: number; branchLit: number};
const Builder: React.FC<{f: number; W: number; H: number; w: boolean; th: Theme; s: BState; buildAt: number}> = ({f, W, H, w, th, s, buildAt}) => {
  const winW = w ? W * 0.86 : W * 0.9, winH = w ? H * 0.8 : H * 0.84;
  const chatW = w ? winW * 0.27 : winW, chatH = w ? winH : winH * 0.27;
  const cvW = w ? winW - chatW : winW, cvH = w ? winH : winH - chatH;
  const A = FLOWS[s.flow], P = FLOWS[s.prev];
  const mk = ez(f, s.at, s.at + 42, Easing.inOut(Easing.cubic)); // morph progress
  const lanes = s.flow === 5;
  // node placement: columns across the canvas (16:9) or rows down it (4:5 = the builder's top-down layout)
  const place = (st: Step, fl: Flow) => {
    const cols = Math.max(...fl.steps.map((x) => x.c)) + 1;
    if (w) { const gx = (cvW - 260) / Math.max(1, cols - 1); return [130 + st.c * gx, cvH * 0.5 + (st.r ?? 0) * cvH * 0.34 + 14]; }
    const gy = (cvH - 260) / Math.max(1, cols - 1); return [cvW * 0.5 + (st.r ?? 0) * cvW * 0.3, 120 + st.c * gy];
  };
  const R = w ? 38 : 34;
  const nodes = A.steps.map((st, i) => {
    const to = place(st, A); const p = P.steps[i]; const from = p && s.prev !== s.flow ? place(p, P) : to;
    const x = from[0] + (to[0] - from[0]) * mk, y = from[1] + (to[1] - from[1]) * mk;
    const born = s.flow === 0 ? buildAt + i * 14 : (p ? s.at : s.at + 18 + i * 4);
    const kin = ez(f, born, born + 26);
    const swap = p && p.k !== st.k && s.prev !== s.flow ? mk : 1;
    return {st, x, y, kin, swap, old: p, i};
  });
  const gone = s.prev !== s.flow ? P.steps.slice(A.steps.length).map((st, j) => ({st, xy: place(st, P), k: 1 - ez(f, s.at, s.at + 20), i: A.steps.length + j})) : [];
  const edgeK = (j: number) => ez(f, (s.flow === 0 ? buildAt + 20 : s.at + 26) + j * 10, (s.flow === 0 ? buildAt + 44 : s.at + 52) + j * 10);
  const lit = (i: number) => s.active >= 0 && f >= s.active + i * 18;
  const approved = f >= s.approveAt; const press = Math.max(0, 1 - Math.abs(f - s.approveAt) / 8);
  const titleK = ez(f, s.at, s.at + 30);
  const chip = (txt: string, on: boolean) => <span style={{marginLeft: 14, padding: '4px 12px', borderRadius: 999, background: on ? th.accent : th.panel2, color: on ? '#fff' : th.lo, fontFamily: FONT.ui, fontWeight: 600, fontSize: 15}}>{txt}</span>;
  const tbtn = (label: string, icon: React.ReactNode, primary = false) => <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: primary && approved ? th.accent : th.dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF', border: `1px solid ${th.line}`, color: primary && approved ? '#fff' : primary ? th.lo : th.ink, fontFamily: FONT.ui, fontWeight: 600, fontSize: 18, transform: primary ? `scale(${1 - 0.05 * press})` : undefined, boxShadow: '0 6px 14px -10px rgba(20,16,24,.4)'}}>{icon}{label}</div>;
  // chat: current YOU message + reply
  const msgK = s.flow === 0 ? ez(f, buildAt - 50, buildAt - 20) : ez(f, s.at - 6, s.at + 22);
  return <div style={{width: winW, height: winH, borderRadius: 28, background: th.panel, border: `1px solid ${th.line}`, boxShadow: th.dark ? '0 60px 120px -50px rgba(0,0,0,0.9)' : '0 60px 120px -60px rgba(40,30,80,0.38)', display: 'flex', flexDirection: w ? 'row' : 'column', overflow: 'hidden', position: 'relative'}}>
    {/* chat panel */}
    <div style={{width: chatW, height: chatH, boxSizing: 'border-box', padding: w ? '34px 30px' : '26px 30px', borderRight: w ? `1px solid ${th.line}` : undefined, borderBottom: w ? undefined : `1px solid ${th.line}`, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative'}}>
      <div style={{opacity: msgK, transform: `translateY(${(1 - msgK) * 14}px)`}}>
        <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', color: th.lo}}>YOU</div>
        <div style={{fontFamily: FONT.ui, fontWeight: 400, fontSize: w ? 21 : 19, lineHeight: 1.45, color: th.ink, marginTop: 6}}>{A.you}</div>
      </div>
      <div style={{opacity: ez(f, (s.flow === 0 ? buildAt : s.at) + 20, (s.flow === 0 ? buildAt : s.at) + 44)}}>
        <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', color: th.lo}}>FANSACHAT</div>
        <div style={{fontFamily: FONT.ui, fontSize: w ? 19 : 17, color: th.lo, marginTop: 6}}>Here it is — {A.steps.length} steps. Tell me what to change.</div>
      </div>
      {w ? <div style={{position: 'absolute', left: 22, right: 22, bottom: 22, height: 62, borderRadius: 999, background: 'linear-gradient(90deg, rgba(139,143,232,0.35), rgba(244,184,168,0.35))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 26px', fontFamily: FONT.ui, fontSize: 18, color: th.lo}}>Describe a workflow…<div style={{width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${th.edge}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: th.ink}}>↑</div></div> : null}
    </div>
    {/* canvas */}
    <div style={{width: cvW, height: cvH, position: 'relative'}}>
      <div style={{position: 'absolute', left: 30, right: 30, top: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap'}}>
        <div style={{overflow: 'hidden', height: 30}}><div style={{transform: `translateY(${(1 - titleK) * 100}%)`, fontFamily: FONT.sora, fontWeight: 600, fontSize: w ? 22 : 19, color: th.ink, whiteSpace: 'nowrap'}}>{A.title}</div></div>
        <span style={{fontFamily: FONT.ui, fontSize: w ? 16 : 14, color: th.lo, marginLeft: 8, whiteSpace: 'nowrap'}}>{lanes ? '3 flows · one per role' : `${A.steps.length} steps · built from chat`}</span>
        {s.approveAt < 1e8 ? chip(approved ? 'Approved' : 'Draft', approved) : null}
        {w ? <div style={{marginLeft: 'auto', display: 'flex', gap: 10}}>
          {tbtn('Horizontal', <Glyph k="router" size={18} color={th.ink} />)}
          {tbtn('Fit', <span>⤢</span>)}
          {tbtn('Approve & Run', <span>▷</span>, true)}
        </div> : null}
      </div>
      {lanes ? LANES.map((l, j) => { const k = ez(f, s.at + 10 + j * 10, s.at + 36 + j * 10); const y = (w ? cvH * 0.5 + (j - 1) * cvH * 0.34 + 14 : 0); return w ? <div key={l} style={{position: 'absolute', left: 30, top: y - 70, opacity: k, fontFamily: FONT.ui, fontWeight: 600, fontSize: 17, color: th.lo, letterSpacing: '0.04em'}}>{l.toUpperCase()}</div> : null; }) : null}
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={cvW} height={cvH}>
        {A.edges.map(([a, b, lab], j) => { const na = nodes[a], nb = nodes[b]; if (!na || !nb) return null;
          const kept = s.prev !== s.flow && P.edges.some((e) => e[0] === a && e[1] === b); const k = kept ? 1 : edgeK(j);
          const dx = nb.x - na.x, dy = nb.y - na.y; let d: string;
          if (Math.abs(dy) < 2) d = `M${na.x + R},${na.y} L${nb.x - R},${nb.y}`;
          else if (Math.abs(dx) < 2) d = `M${na.x},${na.y + R} L${nb.x},${nb.y - R}`;
          else if (w) { const mx = (na.x + nb.x) / 2; d = `M${na.x + R},${na.y} C${mx},${na.y} ${mx},${nb.y} ${nb.x - R},${nb.y}`; }
          else { const my = (na.y + nb.y) / 2; d = `M${na.x},${na.y + R} C${na.x},${my} ${nb.x},${my} ${nb.x},${nb.y - R}`; }
          const on = s.branchLit >= 0 && f >= s.branchLit && lab !== undefined && j === A.edges.length - 2;
          return <path key={j} d={d} stroke={on ? th.accent : th.edge} strokeWidth={on ? 3.2 : 2.4} fill="none" pathLength={1} strokeDasharray={`${k} 1`} />; })}
      </svg>
      {A.edges.map(([a, b, lab], j) => { if (!lab) return null; const na = nodes[a], nb = nodes[b]; const k = edgeK(j); const on = s.branchLit >= 0 && f >= s.branchLit && j === A.edges.length - 2; return <div key={'l' + j} style={{position: 'absolute', left: (na.x + nb.x) / 2, top: (na.y + nb.y) / 2, transform: 'translate(-50%,-50%)', padding: '4px 12px', borderRadius: 999, background: on ? th.accent : th.dark ? '#26213A' : '#FFFFFF', color: on ? '#fff' : th.ink, border: `1px solid ${th.line}`, fontFamily: FONT.ui, fontWeight: 600, fontSize: 15, opacity: k}}>{lab}</div>; })}
      {[...gone.map((g) => ({st: g.st, x: g.xy[0], y: g.xy[1], kin: g.k, swap: 1, old: undefined as Step | undefined, i: g.i})), ...nodes].map((n) => {
        const on = lit(n.i);
        return <div key={n.i + n.st.label} style={{position: 'absolute', left: n.x, top: n.y, width: 0, height: 0, opacity: n.kin}}>
          <div style={{position: 'absolute', left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: 999, background: th.node, border: `2px solid ${on ? th.accent : th.edge}`, boxShadow: on ? `0 0 0 6px ${th.accent}22, 0 10px 22px -12px rgba(20,16,24,.5)` : '0 10px 22px -12px rgba(20,16,24,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * n.kin})`}}>
            {n.old && n.swap < 1 ? <div style={{position: 'absolute', opacity: 1 - n.swap, transform: `scale(${1 - 0.3 * n.swap})`}}><Glyph k={n.old.k} size={R * 0.95} color={th.ink} /></div> : null}
            <div style={{opacity: n.swap, transform: `scale(${0.7 + 0.3 * n.swap})`}}><Glyph k={n.st.k} size={R * 0.95} color={n.st.k === 'ai' ? th.accent : th.ink} /></div>
          </div>
          <div style={{position: 'absolute', left: -R - 6, top: -R - 8, width: 26, height: 26, borderRadius: 999, background: th.accent, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n.i + 1}</div>
          <div style={w ? {position: 'absolute', left: -120, width: 240, top: R + 12, textAlign: 'center', overflow: 'hidden'} : {position: 'absolute', left: R + 14, width: 230, top: -14, textAlign: 'left', overflow: 'hidden'}}>
            <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: w ? 19 : 17, lineHeight: 1.3, color: th.ink, transform: `translateY(${(1 - Math.min(n.kin, n.swap === 1 ? 1 : n.swap)) * 100}%)`}}>{n.st.label}</div>
          </div>
        </div>;
      })}
      {/* SMS endpoint (Twilio step) */}
      {s.smsAt < 1e8 && s.flow === 7 ? (() => { const n = nodes[2]; const k = ez(f, s.smsAt, s.smsAt + 26); return <div style={{position: 'absolute', left: w ? n.x - 150 : n.x - 150, top: w ? n.y - 210 : n.y + 100, width: 300, padding: '14px 18px', borderRadius: '22px 22px 22px 6px', background: th.dark ? '#26213A' : '#FFFFFF', border: `1px solid ${th.line}`, boxShadow: '0 20px 40px -24px rgba(20,16,24,.5)', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}><div style={{fontFamily: FONT.ui, fontSize: 13, color: th.lo, marginBottom: 4}}>SMS · Twilio</div><div style={{fontFamily: FONT.ui, fontSize: 17, color: th.ink, lineHeight: 1.35}}>See you tomorrow at 10. Reply C to confirm.</div></div>; })() : null}
      {/* "Your accounts" popover (own logins) */}
      {s.popAt < 1e8 ? (() => { const k = ez(f, s.popAt, s.popAt + 28); return <div style={{position: 'absolute', right: 30, top: w ? 86 : cvH - 240, width: 330, padding: 18, borderRadius: 20, background: th.dark ? '#1C1826' : '#FFFFFF', border: `1px solid ${th.line}`, boxShadow: '0 30px 60px -30px rgba(20,16,24,.5)', opacity: k, transform: `translateY(${(1 - k) * -10}px)`}}>
        <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', color: th.lo, marginBottom: 10}}>YOUR ACCOUNTS</div>
        {['shopify', 'shippo', 'gmail'].map((a, j) => <div key={a} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: j ? `1px solid ${th.line}` : undefined, opacity: ez(f, s.popAt + 10 + j * 8, s.popAt + 30 + j * 8)}}><Glyph k={a} size={22} color={th.ink} /><span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 17, color: th.ink, flex: 1}}>{a === 'shopify' ? 'Shopify' : a === 'shippo' ? 'Shippo' : 'Gmail'}</span><span style={{fontFamily: FONT.ui, fontSize: 14, color: th.lo}}>your login ✓</span></div>)}
      </div>; })() : null}
    </div>
  </div>;
};

// ---------- camera: [frame, zoom, x, y] in screen space, zoom eased in log space ----------
type KF = [number, number, number, number];
const cam = (k: KF[], f: number): [number, number, number] => {
  if (f <= k[0][0]) return [k[0][1], k[0][2], k[0][3]];
  for (let i = 0; i < k.length - 1; i++) { const [a, za, xa, ya] = k[i], [b, zb, xb, yb] = k[i + 1]; if (f <= b) { const e = interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}); return [Math.exp(Math.log(za) + (Math.log(zb) - Math.log(za)) * e), xa + (xb - xa) * e, ya + (yb - ya) * e]; } }
  const l = k[k.length - 1]; return [l[1], l[2], l[3]];
};

export const Film: React.FC<{vo: Vo; theme?: 'light' | 'dark'}> = ({vo, theme = 'light'}) => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const {st, total} = timeline(vo); const wf = makeWf(vo, st);
  const t = {
    copy: wf(0, ['copy']), paste: wf(0, ['paste']), chase: wf(0, ['chase']), repeat: wf(0, ['repeat']), that: wf(0, ['that']), l1end: st[1] - 30,
    fansa: wf(1, ['fansa', 'fan']), sentence: wf(1, ['sentence']), apps: wf(1, ['700', 'seven', 'hundred']),
    free: wf(2, ['freelanc']), xero: wf(2, ['xero', 'zero']), cal: wf(2, ['calendly', 'calend']),
    ag: wf(3, ['agenc']), meta: wf(3, ['meta']), mon: wf(3, ['monday']), every: wf(3, ['every']), feed: wf(3, ['feedback']), slack: wf(3, ['slack']),
    small: wf(4, ['small']), orders: wf(4, ['order']), own: wf(4, ['own', 'your']), approve: wf(4, ['approve']),
    biz: st[5], workday: wf(5, ['workday', 'work']), join: st[6],
  };
  const lead = 12;
  // which flow is on the canvas, and when it started morphing
  const sched: [number, number][] = [[t.sentence - 30, 0], [t.xero - lead, 1], [t.cal - lead, 2], [t.meta - lead, 3], [t.mon - lead, 4], [t.every - lead, 5], [t.feed - lead, 6], [t.small - lead, 7], [t.orders - lead, 8]];
  let cur = 0; sched.forEach(([a], i) => { if (f >= a) cur = i; });
  const bs: BState = {flow: sched[cur][1], at: sched[cur][0], prev: sched[Math.max(0, cur - 1)][1], active: -1, approveAt: 1e9, popAt: 1e9, smsAt: 1e9, branchLit: -1};
  if (bs.flow === 0 && f >= t.free) bs.active = t.free + 10;
  if (bs.flow === 1) bs.branchLit = t.xero + 70;
  if (bs.flow === 6) bs.branchLit = t.feed + 70;
  if (bs.flow === 3) bs.branchLit = t.meta + 80;
  if (bs.flow === 7) bs.smsAt = t.small + 70;
  if (bs.flow === 8) { bs.popAt = t.own - 20; bs.approveAt = t.approve; }
  // camera
  const cx = W / 2, cy = H / 2;
  const kfs: KF[] = [
    [t.l1end, 1.0, cx, cy], [t.fansa + 70, 1.02, cx, cy],
    [t.sentence - 30, 0.98, cx, cy], [t.free - 20, 1.0, cx, cy],
    [t.free + 10, 1.06, cx + (w ? W * 0.05 : 0), cy], [t.ag - 20, 1.08, cx + (w ? W * 0.05 : 0), cy],
    [t.ag + 10, 1.03, cx + (w ? W * 0.03 : 0), cy], [t.small - 20, 1.06, cx + (w ? W * 0.04 : 0), cy],
    [t.small + 10, 1.02, cx, cy], [t.approve - 50, 1.04, cx, cy], [t.biz - 10, 1.05, cx, cy],
  ];
  const [z, X, Y] = cam(kfs, f);
  const showBuilder = f >= t.fansa + 40 && f < t.workday + 30;
  const intoK = ez(f, t.fansa + 50, t.sentence - 20); // lockup → builder
  const outK = ez(f, t.biz - 6, t.biz + 34, Easing.inOut(Easing.cubic)); // builder recedes
  const buildAt = t.sentence + 10;
  const eyebrow = f < t.free - 10 ? null : f < t.ag - 10 ? ['For freelancers', t.free - 10] : f < t.small - 10 ? ['For agencies', t.ag - 10] : f < t.biz - 6 ? ['For small businesses', t.small - 10] : null;
  // background: off-white field with two slow pastel streaks (the builder's look)
  const streak = (a: number, c: string) => <div style={{position: 'absolute', left: '-30%', right: '-30%', top: `${30 + a * 30 + Math.sin(f / 200 + a * 3) * 6}%`, height: '26%', background: `linear-gradient(90deg, transparent, ${c}, transparent)`, filter: 'blur(60px)', transform: `rotate(${-14 + a * 10}deg) translateX(${Math.sin(f / 260 + a) * 6}%)`}} />;
  // ---- colour story: light → dark → light → dark → light → brand gradient → dark, joined by round iris reveals and gradient sweeps ----
  const TR: {at: number; to: keyof typeof THEMES | 'brand'; kind: 'iris' | 'sweep'; o: [number, number]}[] = theme === 'dark' ? [] : [
    {at: t.l1end - 4, to: 'dark', kind: 'iris', o: [0.5, 0.56]},
    {at: t.sentence - 40, to: 'light', kind: 'iris', o: [0.5, 0.42]},
    {at: t.ag - 22, to: 'dark', kind: 'sweep', o: [0, 0]},
    {at: t.small - 22, to: 'light', kind: 'iris', o: [0.12, 0.08]},
    {at: t.biz - 10, to: 'brand', kind: 'sweep', o: [0, 0]},
    {at: t.join - 18, to: 'dark', kind: 'iris', o: [0.5, 0.5]},
  ];
  const TD = 40; const BRAND: Theme = {...THEMES.light, bg: 'linear-gradient(135deg, #E9E8FF 0%, #D9DBFF 35%, #FFE3DA 75%, #FFF1EC 100%)', streakA: 'rgba(100,104,216,0.22)', streakB: 'rgba(230,140,116,0.22)'};
  const themeOf = (k: string): Theme => (k === 'brand' ? BRAND : THEMES[k as 'light' | 'dark']);
  let ti = -1; TR.forEach((x, i) => { if (f >= x.at) ti = i; });
  const thNow = ti < 0 ? THEMES[theme] : themeOf(TR[ti].to); const thPrev = ti <= 0 ? THEMES[theme] : themeOf(TR[ti - 1].to);
  const inTr = ti >= 0 && f < TR[ti].at + TD; const kTr = inTr ? ez(f, TR[ti].at, TR[ti].at + TD, Easing.inOut(Easing.cubic)) : 1;
  const Stage = (th: Theme) => <AbsoluteFill style={{background: th.bg, overflow: 'hidden'}}>
    {streak(0, th.streakA)}{streak(1, th.streakB)}
    {/* HOOK */}
    {f < t.fansa + 10 ? <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: 1 - ez(f, t.l1end + 4, t.l1end + 26)}}>
      <Roll words={['Copy.', 'Paste.', 'Chase.', 'Repeat.', 'Copy.', 'Paste.', 'Chase.', 'Repeat.']} ats={[t.copy, t.paste, t.chase, t.repeat, t.repeat + 22, t.repeat + 34, t.repeat + 44, t.repeat + 52]} f={f} size={w ? 150 : 120} color={th.ink} />
      <div style={{width: (w ? 520 : 420), height: 2, background: th.line, position: 'relative', overflow: 'hidden', borderRadius: 2, transform: `scaleX(${1 - ez(f, t.l1end - 30, t.l1end, Easing.in(Easing.cubic))})`}}><div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${100 * ez(f, t.copy, t.repeat + 60, Easing.inOut(Easing.quad))}%`, background: th.accent}} /></div>
      <Line text="That's not the job you signed up for." f={f} at={t.that - 6} size={w ? 64 : 46} color={th.lo} weight={500} out={t.l1end - 10} />
    </AbsoluteFill> : null}
    {/* LOCKUP (open) */}
    {f >= t.l1end && f < t.sentence + 10 ? <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - intoK, transform: `scale(${1 + intoK * 1.6})`}}>
      <Lockup f={f} at={t.l1end + 10} size={w ? 200 : 190} th={th} sub={<span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 18, letterSpacing: '0.24em', color: th.lo}}>COMING SOON</span>} />
    </AbsoluteFill> : null}
    {/* PRODUCT SURFACE */}
    {showBuilder ? <AbsoluteFill style={{transform: `translate(${W / 2 - X * z}px, ${H / 2 - Y * z}px) scale(${z})`, transformOrigin: '0 0'}}>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: w ? H * 0.09 : H * 0.1, opacity: intoK * (1 - outK), transform: `perspective(2600px) rotateX(${(1 - intoK) * 12 + (w ? 3 : 2)}deg) rotateY(${w ? -3 + Math.sin(f / 420) * 1.2 : 0}deg) scale(${(0.86 + 0.14 * intoK) * (1 - 0.45 * outK)}) translateY(${-outK * H * 0.2}px)`}}>
        <Builder f={f} W={W} H={H} w={w} th={th} s={bs} buildAt={buildAt} />
      </AbsoluteFill>
    </AbsoluteFill> : null}
    {/* 700+ apps strip (real catalogue names) */}
    {f >= t.apps - 30 && f < t.free ? (() => { const k = ez(f, t.apps - 30, t.apps) * (1 - ez(f, t.free - 24, t.free)); const apps = ['shopify', 'hubspot', 'xero', 'stripe', 'calendly', 'figma', 'gsc', 'slides', 'meta', 'notion', 'zendesk', 'mailchimp', 'asana', 'clickup', 'webflow', 'airtable', 'quickbooks', 'typeform', 'intercom', 'jira', 'github', 'trello', 'dropbox', 'woo']; return <div style={{position: 'absolute', left: 0, right: 0, bottom: w ? H * 0.035 : H * 0.03, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: k}}>
      <span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 18, color: th.ink, whiteSpace: 'nowrap'}}>Connect 700+ apps</span>
      <div style={{width: w ? 900 : 560, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)'}}><div style={{display: 'flex', gap: 26, transform: `translateX(${-((f - t.apps) * 1.6) % 800}px)`}}>{[...apps, ...apps].map((a, i) => <Glyph key={i} k={a} size={28} color={th.lo} />)}</div></div>
    </div>; })() : null}
    {/* eyebrow: reserved zone above the window, never overlapped */}
    {eyebrow ? <div style={{position: 'absolute', left: w ? W * 0.07 : W * 0.05, top: w ? H * 0.035 : H * 0.03}}><Line key={eyebrow[0] as string} text={eyebrow[0] as string} f={f} at={eyebrow[1] as number} size={w ? 44 : 40} color={th.ink} weight={600} /></div> : null}
    {/* business types → "Your workday, back." */}
    {f >= t.biz - 6 && f < t.join + 6 ? (() => { const names = ['Clinics.', 'Salons.', 'Law firms.', 'Online shops.', 'Recruiters.', 'Studios.']; const span = t.workday - 14 - t.biz; const ats = names.map((_, i) => Math.round(t.biz + (span * i) / names.length)); const out = ez(f, t.workday - 10, t.workday + 10); const kEnd = ez(f, t.join - 10, t.join + 10);
      return <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 1 - kEnd}}>
        {f < t.workday ? <div style={{opacity: 1 - out, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 20, letterSpacing: '0.24em', color: th.lo, opacity: ez(f, t.biz, t.biz + 20)}}>BUILT FOR</span><Roll words={names} ats={ats} f={f} size={w ? 140 : 104} color={th.ink} /></div>
          : <Line text="Your workday, back." f={f} at={t.workday - 6} size={w ? 130 : 92} color={th.ink} />}
      </AbsoluteFill>; })() : null}
    {/* LOCKUP (end) */}
    {f >= t.join - 10 ? <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Lockup f={f} at={t.join - 4} size={w ? 190 : 180} th={th} sub={<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{padding: '16px 40px', borderRadius: 999, background: th.accent, color: '#fff', fontFamily: FONT.ui, fontWeight: 600, fontSize: 28}}>Join the waitlist</div>
        <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 22, color: th.lo}}>fansachat.com · t.me/fansachat</div>
      </div>} />
    </AbsoluteFill> : null}
  </AbsoluteFill>;
  const RAD = Math.hypot(W, H) * 1.05;
  const tr = inTr ? TR[ti] : null;
  const clip = tr ? (tr.kind === 'iris' ? `circle(${RAD * kTr}px at ${tr.o[0] * W}px ${tr.o[1] * H}px)` : `polygon(0 0, ${kTr * 220 - 40}% 0, ${kTr * 220 - 120}% 100%, 0 100%)`) : undefined;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    {tr ? Stage(thPrev) : Stage(thNow)}
    {tr ? <AbsoluteFill style={{clipPath: clip}}>{Stage(thNow)}</AbsoluteFill> : null}
    {/* the colour edge: a thin periwinkle→blush ring / band riding the reveal */}
    {tr && tr.kind === 'iris' ? <div style={{position: 'absolute', left: tr.o[0] * W - RAD * kTr, top: tr.o[1] * H - RAD * kTr, width: 2 * RAD * kTr, height: 2 * RAD * kTr, borderRadius: '50%', boxShadow: `0 0 0 ${10 + 14 * (1 - kTr)}px rgba(139,143,232,${0.55 * (1 - kTr)}), 0 0 0 ${24 + 30 * (1 - kTr)}px rgba(244,184,168,${0.4 * (1 - kTr)})`, pointerEvents: 'none'}} /> : null}
    {tr && tr.kind === 'sweep' ? <div style={{position: 'absolute', top: '-20%', bottom: '-20%', width: W * 0.22, left: `${(kTr * 220 - 80) / 100 * W - W * 0.11}px`, transform: 'skewX(-21deg)', background: 'linear-gradient(90deg, rgba(244,184,168,0), rgba(244,184,168,0.55), rgba(139,143,232,0.6), rgba(139,143,232,0))', filter: 'blur(18px)', pointerEvents: 'none'}} /> : null}
    <Mix vo={vo} st={st} total={total} t={t} sched={sched} />
  </AbsoluteFill>;
};

// ---------- audio: music ducked under the VO, one quiet tactile SFX per event (Kenney CC0) ----------
const Mix: React.FC<{vo: Vo; st: number[]; total: number; t: Record<string, number>; sched: [number, number][]}> = ({vo, st, total, t, sched}) => {
  const sfx: [number, string, number][] = [
    [t.copy, 'k_tick_001', 0.25], [t.paste, 'k_tick_001', 0.25], [t.chase, 'k_tick_001', 0.25], [t.repeat, 'k_tick_001', 0.28],
    [t.l1end + 14, 'k_glass_002', 0.28], [t.sentence + 40, 'k_select_003', 0.18],
    ...sched.slice(1).map(([a]) => [a + 6, 'k_select_003', 0.16] as [number, string, number]),
    [t.approve, 'k_click_002', 0.35], [t.approve + 6, 'k_confirmation_002', 0.2], [t.join, 'k_glass_002', 0.28],
  ];
  return <>
    {/* music is NOT in the render: the dry VO+SFX mix is variant A; music is side-chain mixed afterwards (variant B) */}
    {vo.map((l, i) => <Sequence key={i} from={st[i]}><Audio src={staticFile(l.file)} /></Sequence>)}
    {sfx.map(([at, s, v], i) => <Sequence key={'s' + i} from={Math.max(0, Math.round(at))}><Audio src={staticFile(`audio/sfx/${s}.ogg`)} volume={v} /></Sequence>)}
  </>;
};
void EXPO;
