// W1-01 "Meet FansaChat" — characterless motion-design introduction (founder refs: Flowz DTkR1ctDYYb motion system,
// JustPaid Db28edFqHTP hyper promo energy, intro_v1 16:9 quality). No captions: the type IS the animation.
// Palette (unique to this video): brand lilac + peach on iridescent pastel, alternating with deep ink-violet.
// 9:16 1080x1920 @30. Scene boundaries = VO line starts (female narrator, Whisper-timed).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, interpolate, Easing, random} from 'remotion';
import vo from '../../public/v5/I01/vo.json';
import {BlurWords, clamp, ease, Flip3D, Grain, LightLeak, punch, Scramble, Shimmer, sp, Ticker, TextRoll, typed, Caret} from './fx';
import {AppTile, F, Key, Logo} from './ui';

type Line = {file: string; dur: number; text: string; words: {w: string; s: number; e: number}[]};
const V = vo as unknown as Line[];
const GAP = 7, LEAD = 26;
export const START: number[] = []; { let t = LEAD; for (const l of V) { START.push(t); t += Math.round(l.dur * 30) + GAP; } }
export const TOTAL = START[V.length - 1] + Math.round(V[V.length - 1].dur * 30) + 70;
const wd = (i: number, k: number) => Math.round((V[i]?.words[k]?.s ?? 0) * 30); // word offset (frames) inside line i
const C = {ink: '#0E0A24', ink2: '#1B1446', lilac: '#7C6CFF', lilac2: '#B4A9FF', peach: '#FF9E7A', coral: '#FF6B6B', cream: '#FFF7F1', white: '#FFFFFF', text: '#17122E'};

// ---------- backgrounds ----------
const Dark: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: `radial-gradient(90% 60% at ${50 + Math.sin(f / 60) * 8}% 40%, ${C.ink2}, ${C.ink} 70%)`}}><AbsoluteFill style={{background: `radial-gradient(35% 25% at 30% 75%, rgba(124,108,255,0.18), transparent 70%)`}} /></AbsoluteFill>; };
const Light: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: C.cream}}>
  <AbsoluteFill style={{background: `radial-gradient(60% 40% at ${30 + Math.sin(f / 45) * 10}% 25%, rgba(180,169,255,0.75), transparent 70%), radial-gradient(55% 40% at ${75 + Math.cos(f / 50) * 8}% 70%, rgba(255,158,122,0.6), transparent 70%), radial-gradient(40% 30% at 50% 50%, rgba(255,214,240,0.7), transparent 70%)`}} />
  <AbsoluteFill style={{background: `linear-gradient(${120 + f * 0.3}deg, transparent 30%, rgba(255,255,255,0.35) 45%, rgba(170,230,255,0.25) 50%, transparent 65%)`, mixBlendMode: 'soft-light'}} />
</AbsoluteFill>; };
const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dark?: boolean}> = ({children, style, dark}) => <div style={{background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.62)', border: `1px solid ${dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)'}`, backdropFilter: 'blur(18px)', boxShadow: dark ? '0 30px 80px -30px rgba(0,0,0,0.8)' : '0 30px 70px -28px rgba(70,50,140,0.35)', borderRadius: 28, ...style}}>{children}</div>;
const center: React.CSSProperties = {position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center'};

// ---------- S1 Meet FansaChat ----------
const S1: React.FC = () => {
  const f = useCurrentFrame(); // local: 0 = START[0] - LEAD
  const snap = LEAD + 4;
  const px = interpolate(f, [0, snap], [-260, 0], {...clamp, easing: Easing.inOut(Easing.cubic)}), py = interpolate(f, [0, snap], [320, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const s = sp(f, snap, 30, 10, 170);
  return <AbsoluteFill><Dark />
    {f < snap && <div style={{position: 'absolute', left: 540 - 14 + px, top: 820 - 14 + py, width: 28, height: 28, borderRadius: 8, background: C.lilac2, boxShadow: `0 0 40px ${C.lilac}`, transform: `rotate(${f * 6}deg)`}} />}
    {[0, 1, 2].map((i) => { const k = ease(f, snap + i * 5, snap + i * 5 + 30); return <div key={i} style={{position: 'absolute', left: 540 - 300, top: 820 - 300, width: 600, height: 600, borderRadius: 300, border: `2px solid rgba(180,169,255,${0.5 * (1 - k)})`, transform: `scale(${0.4 + k * 1.6})`}} />; })}
    <div style={{position: 'absolute', left: 540 - 150, top: 820 - 150, width: 300, height: 300, borderRadius: 80, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, boxShadow: `0 0 ${80 * s}px rgba(124,108,255,0.6)`}}><Img src={staticFile('logo-fansa.png')} style={{width: 240, height: 240, objectFit: 'contain'}} /></div>
    <div style={{...center, top: 1030}}><Flip3D text="Meet FansaChat" at={snap + 6} size={120} color="#fff" font={F.head} stagger={1.4} /></div>
  </AbsoluteFill>;
};

// ---------- S2 a tool for everything (glass app cloud, depth of field) ----------
const CLOUD = ['gmail', 'sheets', 'slack', 'notion', 'shopify', 'stripe', 'hubspot', 'trello', 'calendly', 'airtable', 'canva', 'figma', 'whatsapp', 'drive', 'xero', 'asana', 'zoom', 'typeform'];
const pos = (i: number, f = 0) => { const a = random('a' + i) * Math.PI * 2 + f * 0.006, r = 330 + random('r' + i) * 260; return {x: 540 + Math.cos(a) * r * 0.95, y: 900 + Math.sin(a) * r * 1.35, z: random('z' + i)}; };
const Cloud: React.FC<{break_?: number}> = ({break_}) => {
  const f = useCurrentFrame();
  return <>{CLOUD.map((k, i) => { const p = pos(i, f); const k2 = sp(f, i * 1.3, 30, 12, 170); const bob = Math.sin(f / 20 + i) * 10; const scl = 0.65 + p.z * 0.7; const shake = break_ !== undefined && f > break_ ? (random(`sh${i}${f}`) - 0.5) * 10 : 0;
    return <div key={k} style={{position: 'absolute', left: p.x - 60 + shake, top: p.y - 60 + bob, transform: `scale(${k2 * scl})`, filter: p.z < 0.3 ? `blur(${(0.3 - p.z) * 14}px)` : undefined, zIndex: Math.round(p.z * 10)}}><AppTile k={k} size={140} /></div>; })}</>;
};
const S2: React.FC = () => <AbsoluteFill><Light /><Cloud />
  <div style={{...center, top: 800, padding: '0 80px'}}><Glass style={{padding: '30px 40px'}}><BlurWords text="A tool for everything." at={4} size={92} color={C.text} accent={C.lilac} em={['everything']} font={F.head} stagger={4} /></Glass></div>
</AbsoluteFill>;

// ---------- S3 none of them talk (broken links + alert swarm) ----------
const ALERTS = ['Missed: invoice #2031', 'Lead not added to CRM', 'Order #1046 not synced', 'Reminder never sent', 'Duplicate row in Sheets', 'Support ticket lost'];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11]];
  const P = (i: number) => pos(i, f);
  return <AbsoluteFill style={{transform: `translate(${(random('x' + f) - 0.5) * (f > 18 && f < 30 ? 16 : 0)}px, 0)`}}><Light /><Cloud break_={18} />
    <svg style={{position: 'absolute', inset: 0}} width={1080} height={1920}>{pairs.map(([a, b], i) => { const A = P(a), B = P(b); const k = ease(f, i * 2, i * 2 + 12); const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2; const brk = f > 16 + i * 2;
      return <g key={i}><line x1={A.x} y1={A.y} x2={A.x + (mx - A.x) * k * (brk ? 0.8 : 1)} y2={A.y + (my - A.y) * k * (brk ? 0.8 : 1)} stroke={brk ? C.coral : C.lilac} strokeWidth={5} strokeDasharray="12 10" /><line x1={B.x} y1={B.y} x2={B.x + (mx - B.x) * k * (brk ? 0.8 : 1)} y2={B.y + (my - B.y) * k * (brk ? 0.8 : 1)} stroke={brk ? C.coral : C.lilac} strokeWidth={5} strokeDasharray="12 10" />
        {brk && <text x={mx} y={my + 16} textAnchor="middle" fontSize={54} fontWeight={900} fill={C.coral} opacity={ease(f, 16 + i * 2, 20 + i * 2)} fontFamily={F.ui}>×</text>}</g>; })}</svg>
    {ALERTS.map((t, i) => { const at = 20 + i * 3; const s = sp(f, at, 30, 12, 200); const x = 60 + (i % 2) * 330 + random('ax' + i) * 40, y = 300 + i * 210; return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${s}) rotate(${(random('ar' + i) - 0.5) * 10}deg) translateY(${Math.sin(f / 12 + i) * 8}px)`, opacity: Math.min(1, s * 1.4)}}>
      <Glass style={{padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 20}}><div style={{width: 40, height: 40, borderRadius: 20, background: '#FFB020', color: '#fff', fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,176,32,0.7)'}}>!</div><span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 34, color: C.text}}>{t}</span></Glass></div>; })}
    <div style={{...center, top: 1560}}><Glass style={{padding: '22px 34px'}}><div style={{fontFamily: F.head, fontWeight: 800, fontSize: 70, color: C.text, letterSpacing: '-0.03em'}}>None of them <span style={{color: C.coral}}><Scramble text="talk." at={8} dur={14} size={70} font={F.head} weight={800} color={C.coral} style={{display: 'inline'}} /></span></div></Glass></div>
  </AbsoluteFill>;
};

// ---------- S4 copy / paste / chase in a glowing ring ----------
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const every = Math.max(10, Math.round((wd(3, 6) - wd(3, 2)) / 2)) || 16;
  const pulse = punch(f, 0, 0.06) * punch(f, every, 0.06) * punch(f, every * 2, 0.06);
  return <AbsoluteFill><Dark />
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 540 - 450, top: 900 - 450, width: 900, height: 900, borderRadius: 450, border: `2px solid rgba(124,108,255,${0.35 - i * 0.07})`, transform: `scale(${0.55 + i * 0.22 + ((f / 40) % 1) * 0.22})`}} />)}
    <div style={{position: 'absolute', left: 540 - 260, top: 900 - 260, width: 520, height: 520, borderRadius: 260, background: 'conic-gradient(from ' + f * 4 + 'deg, #B4A9FF, #FF9E7A, #7C6CFF, #B4A9FF)', transform: `scale(${pulse})`, boxShadow: '0 0 120px rgba(124,108,255,0.65), inset 0 0 60px rgba(255,255,255,0.5)'}}>
      <div style={{position: 'absolute', inset: 46, borderRadius: 220, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 50px rgba(124,108,255,0.6)'}}><TextRoll words={['copy.', 'paste.', 'chase.']} every={every} at={wd(3, 2)} size={104} font={F.head} color="#fff" accent={C.peach} /></div>
    </div>
    {['Ctrl', 'C', 'V', 'Ctrl', 'V', 'C'].map((k, i) => { const a = (i / 6) * Math.PI * 2 + f * 0.03; return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 430 - 70, top: 900 + Math.sin(a) * 520 - 60, transform: `rotate(${Math.sin(a) * 18}deg) scale(0.75)`, opacity: ease(f, i * 2, i * 2 + 8)}}><Key label={k} size={120} down={Math.floor((f + i * 5) / 9) % 3 === 0} /></div>; })}
    <div style={{...center, top: 1540}}><BlurWords text="So you copy. You paste. You chase." at={0} size={64} color="#D9D3FF" accent={C.peach} em={['chase.']} font={F.head} stagger={4} /></div>
  </AbsoluteFill>;
};

// ---------- S5 one sentence -> working automation (typographic, pill unfolds into nodes) ----------
const SENT = 'When an invoice arrives, log it and tell me.';
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const typeEnd = 44, split = typeEnd + 6;
  const k = ease(f, split, split + 16);
  const nodes = [['gmail', 'Invoice arrives'], ['sheets', 'Logged in Sheets'], ['slack', 'You get a message']];
  return <AbsoluteFill><Light />
    <div style={{...center, top: 230, padding: '0 70px'}}><BlurWords text="One sentence. A working automation." at={wd(4, 2)} size={84} color={C.text} accent={C.lilac} em={['sentence.', 'working', 'automation.']} font={F.head} stagger={3} /></div>
    <div style={{...center, top: 640, opacity: 1 - k, transform: `scale(${1 + k * 0.3})`, filter: `blur(${k * 10}px)`}}><Glass style={{padding: '26px 34px', borderRadius: 60, maxWidth: 920}}><span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 52, color: C.text}}>{typed(SENT, f, 32)}{f < typeEnd && <Caret h={40} color={C.lilac} />}</span></Glass></div>
    {nodes.map(([key, label], i) => { const y = 600 + i * 330; const s = sp(f, split + 4 + i * 6, 30, 11, 190); return <React.Fragment key={key}>
      {i > 0 && <div style={{position: 'absolute', left: 538, top: y - 210, width: 6, height: 210 * ease(f, split + 4 + i * 6, split + 12 + i * 6), background: `linear-gradient(${C.lilac}, ${C.peach})`, borderRadius: 3}} />}
      <div style={{...center, top: y, transform: `scale(${s})`}}><Glass style={{padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 26, width: 820, transform: `rotate(${Math.sin(f / 25 + i) * 1.5}deg)`}}><AppTile k={key} size={120} /><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 52, color: C.text}}>{label}</div>
        {f > split + 34 + i * 4 && <div style={{marginLeft: 'auto', width: 54, height: 54, borderRadius: 27, background: '#22C55E', color: '#fff', fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f, split + 34 + i * 4, 30, 9, 260)})`}}>✓</div>}</Glass></div>
    </React.Fragment>; })}
  </AbsoluteFill>;
};

// ---------- S6 Invoices / Leads / Orders / Support — 3D card carousel ----------
const CARDS: [string, string, string][] = [['Invoices', '#7C6CFF', 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h6'], ['Leads', '#FF9E7A', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6'], ['Orders', '#22C1A5', 'M3 4h3l2 12h11l2-8H7 M9 21a1 1 0 1 0 0-2 M18 21a1 1 0 1 0 0-2'], ['Support', '#4C8DFF', 'M4 5h16v11H9l-5 4z M8 9h8 M8 12h5']];
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const starts = [0, 1, 2, 3].map((k) => wd(5, k));
  let idx = 0; starts.forEach((s, i) => { if (f >= s) idx = i; });
  const t = idx + ease(f, starts[idx], starts[idx] + 9) - 1;
  return <AbsoluteFill><Dark /><LightLeak color="#7C6CFF" color2="#FF9E7A" strength={0.25} />
    <AbsoluteFill style={{perspective: 1400}}>{CARDS.map(([label, col, d], i) => { const o = i - Math.max(0, t); const x = o * 430, rot = -o * 32, sc = 1 - Math.min(1, Math.abs(o)) * 0.28, op = Math.abs(o) > 1.6 ? 0 : 1 - Math.abs(o) * 0.35;
      return <div key={label} style={{position: 'absolute', left: 540 - 220 + x, top: 900 - 290, width: 440, height: 580, borderRadius: 56, background: `linear-gradient(160deg, ${col}, ${col}BB)`, boxShadow: `0 60px 120px -40px ${col}, inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -20px 40px rgba(0,0,0,0.2)`, transform: `rotateY(${rot}deg) scale(${sc})`, opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36}}>
        <svg width="220" height="220" viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.35))'}}><path d={d} fill="rgba(255,255,255,0.22)" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{fontFamily: F.head, fontWeight: 800, fontSize: 70, color: '#fff', letterSpacing: '-0.03em'}}>{label}</div>
      </div>; })}</AbsoluteFill>
  </AbsoluteFill>;
};

// ---------- S7 700+ apps — dual conveyor + ticker pill ----------
const ROW = ['gmail', 'sheets', 'slack', 'notion', 'shopify', 'stripe', 'hubspot', 'trello', 'calendly', 'airtable', 'canva', 'figma', 'whatsapp', 'drive', 'xero', 'asana', 'zoom', 'typeform', 'mailchimp', 'salesforce', 'jira', 'github', 'linear', 'clickup', 'woo', 'paypal', 'quickbooks', 'telegram', 'discord', 'dropbox', 'instagram', 'youtube'];
const Conveyor: React.FC<{y: number; dir: 1 | -1; off: number}> = ({y, dir, off}) => { const f = useCurrentFrame(); const x = ((f * 7 * dir + off) % 2240 + 2240) % 2240 - 2240; return <div style={{position: 'absolute', top: y, left: x, display: 'flex', gap: 30}}>{[...ROW, ...ROW].map((k, i) => <AppTile key={i} k={k} size={110} />)}</div>; };
const S7: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill><Light />
  <Conveyor y={520} dir={-1} off={0} /><Conveyor y={680} dir={1} off={600} /><Conveyor y={1110} dir={-1} off={300} /><Conveyor y={1270} dir={1} off={900} />
  <div style={{...center, top: 860, transform: `scale(${sp(f, 2, 30, 11, 180)})`}}><Glass style={{padding: '26px 56px', display: 'flex', alignItems: 'baseline', gap: 20, background: 'rgba(255,255,255,0.9)'}}><Ticker to={700} at={4} size={130} color={C.text} font={F.head} suffix="+" /><span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 44, color: C.lilac}}>apps, connected</span></Glass></div>
</AbsoluteFill>; };

// ---------- S8 No flowcharts. No code. — strike-through gag + echo stack ----------
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const b = wd(7, 2) || 28;
  const strike = (at: number) => ease(f, at, at + 8);
  const Echo: React.FC<{text: string; at: number; y: number; s: number; glyph: React.ReactNode}> = ({text, at, y, s, glyph}) => <div style={{...center, top: y, opacity: ease(f, at, at + 5)}}>
    <div style={{position: 'relative'}}>
      {[-2, -1, 1, 2].map((k) => <div key={k} style={{position: 'absolute', top: k * 70 * ease(f, at, at + 10), left: 0, right: 0, textAlign: 'center', fontFamily: F.head, fontWeight: 800, fontSize: 130, color: 'transparent', WebkitTextStroke: '2px rgba(180,169,255,0.35)', whiteSpace: 'nowrap'}}>No {text}</div>)}
      <div style={{position: 'relative', fontFamily: F.head, fontWeight: 800, fontSize: 130, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '-0.03em'}}>No <span style={{position: 'relative', color: C.lilac2}}>{text}<span style={{position: 'absolute', left: -6, right: -6, top: '55%', height: 14, background: C.coral, borderRadius: 7, transform: `scaleX(${strike(s)})`, transformOrigin: '0 50%'}} /></span></div>
      <div style={{position: 'absolute', right: -40, top: -90, transform: `rotate(12deg) scale(${sp(f, at + 2, 30, 10, 200)})`}}>{glyph}</div>
    </div>
  </div>;
  return <AbsoluteFill><Dark />
    <Echo text="flowcharts." at={0} y={620} s={8} glyph={<svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#FF9E7A" strokeWidth="1.5"><rect x="2" y="2" width="7" height="5" rx="1" /><rect x="15" y="9" width="7" height="5" rx="1" /><rect x="2" y="17" width="7" height="5" rx="1" /><path d="M5.5 7v10 M9 4.5h3v7h3" /></svg>} />
    <Echo text="code." at={b} y={1080} s={b + 6} glyph={<div style={{fontFamily: F.mono, fontSize: 90, color: C.peach, fontWeight: 700}}>{'</>'}</div>} />
  </AbsoluteFill>;
};

// ---------- S9 Tested / running / while you rest — typewriter pills + phone on an arc ----------
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const pills: [string, string, number][] = [['✓', 'Tested', wd(8, 0)], ['●', 'Running', wd(8, 5)], ['☾', 'While you rest', wd(8, 6)]];
  let cur = 0; pills.forEach((p, i) => { if (f >= p[2]) cur = i; });
  const [ic, label, at] = pills[cur];
  const up = sp(f, 4, 30, 14, 120);
  const notes = [['Invoice #2031 logged', '2:14 AM'], ['Lead added to HubSpot', '3:02 AM'], ['Order #1046 synced', '4:40 AM']];
  return <AbsoluteFill><Light />
    <svg style={{position: 'absolute', inset: 0}} width={1080} height={1920}><path d="M-60,1500 Q540,700 1140,1500" stroke="rgba(124,108,255,0.45)" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${ease(f, 0, 20)} 1`} />
      {[0.12, 0.3, 0.7, 0.88].map((t, i) => { const x = -60 + 1200 * t, y = 1500 - 1600 * t * (1 - t) * 1; return <g key={i} opacity={ease(f, 6 + i * 3, 12 + i * 3)}><circle cx={x} cy={y} r={34} fill="#fff" stroke="rgba(124,108,255,0.4)" strokeWidth={3} /><g transform={`translate(${x - 18},${y - 18}) scale(1.5)`}><path d={['M3 8l9 6 9-6', 'M4 4h16v16H4z', 'M12 2v20 M2 12h20', 'M5 12l5 5 9-10'][i]} stroke={C.lilac} strokeWidth={2} fill="none" /></g></g>; })}
    </svg>
    <div style={{position: 'absolute', left: 540 - 230, top: 640 + (1 - up) * 900, width: 460, height: 940, transform: `perspective(1600px) rotateY(${Math.sin(f / 28) * 14}deg) rotateX(${6 - up * 6}deg) scale(${1.15 + Math.sin(f / 40) * 0.03})`, borderRadius: 74, background: '#111', padding: 14, boxShadow: '0 80px 140px -40px rgba(60,40,140,0.55)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 62, background: 'linear-gradient(170deg,#EDEBFF,#FFE7DD)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 16, left: 160, width: 120, height: 34, borderRadius: 17, background: '#111'}} />
        <div style={{position: 'absolute', top: 80, width: '100%', textAlign: 'center', fontFamily: F.ui, fontWeight: 300, fontSize: 96, color: C.text}}>7:45</div>
        {notes.map(([t, tm], i) => { const s = sp(f, 16 + i * 8, 30, 13, 180); return <div key={i} style={{position: 'absolute', left: 18, right: 18, top: 260 + i * 120, padding: '14px 16px', borderRadius: 24, background: 'rgba(255,255,255,0.8)', display: 'flex', gap: 12, alignItems: 'center', transform: `translateY(${(1 - s) * -60}px)`, opacity: s}}><Img src={staticFile('logo-fansa.png')} style={{width: 44, height: 44, borderRadius: 11, background: '#fff'}} /><div style={{fontFamily: F.ui}}><div style={{fontSize: 15, color: '#666'}}>FANSACHAT · {tm}</div><div style={{fontSize: 26, fontWeight: 700, color: '#111'}}>{t}</div></div></div>; })}
      </div>
    </div>
    <div style={{...center, top: 330}}><div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 36px', borderRadius: 60, background: C.ink, transform: `scale(${punch(f, at, 0.08)})`}}><span style={{width: 50, height: 50, borderRadius: 25, background: C.lilac, color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{ic}</span><span style={{fontFamily: F.head, fontWeight: 800, fontSize: 64, color: '#fff'}}>{typed(label, f - at, 26)}<Caret h={56} color={C.peach} /></span></div></div>
  </AbsoluteFill>;
};

// ---------- S10/S11 logo: line draws a loop -> real logo, wordmark flip, tagline, waitlist ----------
const SEnd: React.FC<{cta: number}> = ({cta}) => {
  const f = useCurrentFrame();
  const draw = ease(f, 0, 20);
  const s = sp(f, 16, 30, 10, 170);
  return <AbsoluteFill><Light />
    <svg style={{position: 'absolute', inset: 0}} width={1080} height={1920}><path d="M-40,1200 C300,1180 360,700 540,700 C760,700 760,1000 540,1000 C330,1000 380,760 1120,740" stroke={C.lilac} strokeWidth={14} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${draw} 1`} opacity={1 - ease(f, 18, 26)} /></svg>
    {ROW.slice(0, 14).map((k, i) => { const a = (i / 14) * Math.PI * 2 + f * 0.015; const r = 420 * ease(f, 18 + i, 34 + i); return <div key={k} style={{position: 'absolute', left: 540 - 50 + Math.cos(a) * r, top: 850 - 50 + Math.sin(a) * r * 0.75, transform: `scale(${0.7 + 0.3 * Math.sin(a)})`, opacity: ease(f, 18 + i, 26 + i) * (0.55 + 0.45 * Math.sin(a)), zIndex: 0}}><AppTile k={k} size={100} /></div>; })}
    <div style={{position: 'absolute', left: 540 - 170, top: 680, width: 340, height: 340, borderRadius: 90, background: '#fff', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 50px 120px -30px rgba(124,108,255,0.6)'}}><Img src={staticFile('logo-fansa.png')} style={{width: 280, height: 280, objectFit: 'contain'}} /></div>
    <div style={{...center, top: 1080}}><Flip3D text="FansaChat" at={22} size={150} color={C.text} font={F.head} stagger={1.3} /></div>
    <div style={{...center, top: 1260, opacity: ease(f, 34, 42)}}><Shimmer text="Automation, in plain English." size={52} color="#7C6CFF" accent="#FF9E7A" font={F.ui} weight={700} period={50} /></div>
    <div style={{...center, top: 1400}}><div style={{padding: '24px 54px', borderRadius: 60, background: `linear-gradient(90deg, ${C.lilac}, ${C.peach})`, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 48, transform: `scale(${sp(f, cta, 30, 9, 230)})`, boxShadow: '0 30px 70px -20px rgba(124,108,255,0.7)'}}>Join the waitlist →</div></div>
    <div style={{...center, top: 1530, opacity: ease(f, cta + 10, cta + 20), fontFamily: F.ui, fontSize: 32, color: '#6A5FA8'}}>fansachat.com · t.me/fansachat</div>
  </AbsoluteFill>;
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9];
export const Intro01: React.FC = () => {
  const f = useCurrentFrame();
  const sceneStart = (i: number) => (i === 0 ? 0 : START[i] - 2);
  const endAt = START[9] - 2;
  return <AbsoluteFill style={{background: C.ink}}>
    {SCENES.map((S, i) => { const a = sceneStart(i), b = sceneStart(i + 1); return <Sequence key={i} from={a} durationInFrames={b - a}><AbsoluteFill style={{transform: `scale(${punch(f - a, 0, 0.05) * (1 + 0.1 * Easing.inOut(Easing.sin)(Math.min(1, (f - a) / (b - a))))}) rotate(${(i % 2 ? 1 : -1) * (1.6 * ((f - a) / (b - a)) - 0.8)}deg) translateY(${(i % 2 ? -1 : 1) * 18 * ((f - a) / (b - a))}px)`}}><S /></AbsoluteFill></Sequence>; })}
    <Sequence from={endAt}><SEnd cta={START[10] - endAt} /></Sequence>
    <Grain opacity={0.05} />
    {/* audio: music bed ducked under VO; VO; soft pops on cuts (no whooshes) */}
    <Audio src={staticFile('audio/09_upbeat-uplifting_uplifting-bass_mixkit-173.mp3')} volume={(x) => { const talking = V.some((l, i) => x >= START[i] - 3 && x <= START[i] + l.dur * 30 + 3); return interpolate(x, [0, 10, TOTAL - 40, TOTAL], [0, 1, 1, 0], clamp) * (talking ? 0.16 : 0.32); }} />
    {V.map((l, i) => l.file ? <Sequence key={i} from={START[i]}><Audio src={staticFile(l.file)} /></Sequence> : null)}
    {[START[0] - 22, ...START.slice(1, 10).map((s) => s - 2)].map((at, i) => <Sequence key={'p' + i} from={at}><Audio src={staticFile('audio/sfx/pop_kenney.ogg')} volume={0.28} /></Sequence>)}
    <Sequence from={START[10]}><Audio src={staticFile('audio/sfx/success_kenney.ogg')} volume={0.3} /></Sequence>
  </AbsoluteFill>;
};
