// FansaChat introduction film (I26). One continuous world, one camera: [frame, zoom, x, y] keyframes,
// zoom interpolated in log space. Moves: zoom-through (nested plates), zoom-aside (lateral dolly), zoom-out reveal.
// Every element is keyed to the narrator's word timings (public/v/I26/vo.json). Pure function of frame.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as brico} from '@remotion/google-fonts/BricolageGrotesque';
import * as si from 'simple-icons';
import SPEC from './I26.json';

export type Vo = {file: string; dur: number; words: {w: string; s: number; e: number}[]}[];
const F = {
  ui: inter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily,
  head: brico('normal', {weights: ['700', '800'], subsets: ['latin']}).fontFamily,
};
const C = {ink: '#17122E', sub: '#6A6489', accent: '#6468D8', warm: '#E68C74', ok: '#19A55A', bad: '#E8362B', cream: '#FFF8F2', lilac: '#F2EEFF', peach: '#FFE9DF'};
const GRAD = `linear-gradient(90deg, ${C.accent}, ${C.warm})`;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const ez = (f: number, a: number, b: number, e = EXPO) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const sp = (f: number, at: number) => spring({frame: f - at, fps: 30, config: {damping: 20, stiffness: 170}}); // critically damped-ish: overshoot < 2%

// ---------------- timeline ----------------
const LEAD = 10, GAP = 9, END_HOLD = 80;
export const estimateVo = (): Vo => SPEC.lines.map((t, i) => {
  const ws = t.split(' '); const dur = ws.length / 2.5 + 0.3;
  return {file: `v/I26/${String(i + 1).padStart(2, '0')}.wav`, dur, words: ws.map((w, j) => ({w, s: (j / ws.length) * dur, e: ((j + 1) / ws.length) * dur}))};
});
export const timeline = (vo: Vo) => {
  const st: number[] = []; let t = LEAD;
  vo.forEach((l) => { st.push(t); t += Math.round(l.dur * 30) + GAP; });
  return {st, total: t + END_HOLD};
};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// frame of a word: search Whisper words by prefix; fall back to its position in the script text
const makeWf = (vo: Vo, st: number[]) => (li: number, prefixes: string[], nth = 0) => {
  const ws = vo[li]?.words ?? [];
  let k = 0;
  for (const x of ws) { if (prefixes.some((p) => norm(x.w).startsWith(p))) { if (k === nth) return st[li] + Math.round(x.s * 30); k++; } }
  const toks = SPEC.lines[li].split(' ').map(norm); let n = 0;
  for (let i = 0; i < toks.length; i++) if (prefixes.some((p) => toks[i].startsWith(p))) { if (n === nth) return st[li] + Math.round((i / toks.length) * (vo[li]?.dur ?? 3) * 30); n++; }
  return st[li];
};

// ---------------- icons ----------------
const SI: Record<string, string> = {stripe: 'siStripe', drive: 'siGoogledrive', xero: 'siXero', calendly: 'siCalendly', hubspot: 'siHubspot', meta: 'siMeta', gsc: 'siGooglesearchconsole', slides: 'siGoogleslides', figma: 'siFigma', shopify: 'siShopify', gmail: 'siGmail', notion: 'siNotion', quickbooks: 'siQuickbooks', typeform: 'siTypeform', zoom: 'siZoom', canva: 'siCanva', webflow: 'siWebflow', woo: 'siWoocommerce', mailchimp: 'siMailchimp', asana: 'siAsana', clickup: 'siClickup', zendesk: 'siZendesk', intercom: 'siIntercom', airtable: 'siAirtable', dropbox: 'siDropbox', paypal: 'siPaypal', github: 'siGithub', jira: 'siJira', linear: 'siLinear', wordpress: 'siWordpress', squarespace: 'siSquarespace', telegram: 'siTelegram', discord: 'siDiscord', trello: 'siTrello', gcal: 'siGooglecalendar', etsy: 'siEtsy', klaviyo: 'siKlaviyo', youtube: 'siYoutube', wix: 'siWix', calcom: 'siCaldotcom'};
const CUSTOM: Record<string, [string, string, string]> = {slack: ['#4A154B', 'S', '#fff'], docusign: ['#FFCC22', 'DS', '#1A1A1A'], pipedrive: ['#1A1A1A', 'p', '#fff'], acuity: ['#1F2D3D', 'A', '#fff'], shippo: ['#0E6E5C', 'Sh', '#fff'], twilio: ['#F22F46', 'T', '#fff'], mail: ['#6468D8', '@', '#fff'], sheets: ['#0F9D58', '▦', '#fff'], salesforce: ['#00A1E0', 'sf', '#fff'], outlook: ['#0078D4', 'O', '#fff'], teams: ['#5059C9', 'T', '#fff'], excel: ['#107C41', 'X', '#fff'], monday: ['#FF3D57', 'm', '#fff'], key: ['#17122E', '🔑', '#fff']};
const Icon: React.FC<{k: string; size: number}> = ({k, size}) => {
  const ic = SI[k] ? (si as unknown as Record<string, {path: string; hex: string} | undefined>)[SI[k]] : undefined;
  if (ic) return <svg viewBox="0 0 24 24" width={size} height={size}><path d={ic.path} fill={'#' + ic.hex} /></svg>;
  const cu = CUSTOM[k] ?? ['#6468D8', k.slice(0, 2).toUpperCase(), '#fff'];
  return <svg viewBox="0 0 24 24" width={size} height={size}><rect width="24" height="24" rx="6" fill={cu[0]} /><text x="12" y="16.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize={cu[1].length > 1 ? 10 : 14} fill={cu[2]}>{cu[1]}</text></svg>;
};
const Tile: React.FC<{k: string; size: number; style?: React.CSSProperties}> = ({k, size, style}) => <div style={{width: size, height: size, borderRadius: size * 0.26, background: 'linear-gradient(160deg,#FFFFFF,#F1F0F8)', boxShadow: '0 18px 36px -14px rgba(40,30,80,0.38), inset 0 1px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', ...style}}><Icon k={k} size={size * 0.56} /></div>;

// ---------------- shared look ----------------
const glass: React.CSSProperties = {background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(255,255,255,1)', borderRadius: 28, boxShadow: '0 40px 80px -34px rgba(40,20,80,0.38), 0 2px 0 rgba(255,255,255,0.9) inset'};
type S = {f: number; W: number; H: number; w: boolean; u: number; wf: ReturnType<typeof makeWf>};
const Rise: React.FC<{at: number; f: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties}> = ({at, f, children, dy = 40, style}) => {
  const k = ez(f, at, at + 14);
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * dy}px) scale(${0.96 + 0.04 * k})`, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined, ...style}}>{children}</div>;
};
const Words: React.FC<{text: string; at: number; f: number; size: number; color?: string; em?: string[]; stagger?: number; weight?: number}> = ({text, at, f, size, color = C.ink, em = [], stagger = 2, weight = 800}) => (
  <span style={{display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, fontFamily: F.head, fontWeight: weight, fontSize: size, lineHeight: 1.05, letterSpacing: '-0.035em', color}}>
    {text.split(' ').map((wd, i) => { const k = ez(f, at + i * stagger, at + i * stagger + 11); const e = em.includes(wd.replace(/[.,!?:]/g, '')); return <span key={i} style={{display: 'inline-block', opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `translateY(${(1 - k) * 16}px)`, ...(e ? {backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {})}}>{wd}</span>; })}
  </span>
);
const Label: React.FC<{text: string; at: number; f: number; u: number}> = ({text, at, f, u}) => {
  const k = ez(f, at, at + 12);
  return <div style={{display: 'inline-block', padding: `${10 * u}px ${30 * u}px`, borderRadius: 999, background: C.ink, color: '#fff', fontFamily: F.head, fontWeight: 800, fontSize: 46 * u, letterSpacing: '0.02em', transform: `scaleX(${0.2 + 0.8 * k}) translateX(${(1 - k) * -60 * u}px)`, transformOrigin: '0 50%', opacity: k, boxShadow: '0 18px 30px -14px rgba(23,18,46,0.6)'}}>{text}</div>;
};
const Chip: React.FC<{text: string; color: string; u: number; at?: number; f?: number}> = ({text, color, u, at, f}) => {
  const k = at !== undefined && f !== undefined ? ez(f, at, at + 10) : 1;
  return <span style={{display: 'inline-flex', alignItems: 'center', gap: 8 * u, padding: `${6 * u}px ${16 * u}px`, borderRadius: 999, background: color + '1F', color, fontFamily: F.ui, fontWeight: 800, fontSize: 22 * u, opacity: k, transform: `scale(${0.85 + 0.15 * k})`}}>{text}</span>;
};
const Card: React.FC<{icon: string; title: string; sub?: string; u: number; at: number; f: number; done?: number; width?: number; chip?: React.ReactNode}> = ({icon, title, sub, u, at, f, done, width = 600, chip}) => {
  const k = sp(f, at); const ok = done !== undefined && f >= done; const kd = done !== undefined ? ez(f, done, done + 8) : 0;
  const sh = ((f - at + 400) % 54) / 54;
  return <div style={{...glass, width: width * u, padding: 22 * u, display: 'flex', gap: 18 * u, alignItems: 'center', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 50 * u}px) scale(${0.92 + 0.08 * k})`, position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${-40 + sh * 180}%`, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent)', pointerEvents: 'none'}} />
    <Tile k={icon} size={78 * u} />
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 30 * u, color: C.ink, lineHeight: 1.15}}>{title}</div>
      {sub ? <div style={{fontFamily: F.ui, fontWeight: 500, fontSize: 22 * u, color: C.sub, marginTop: 4 * u}}>{sub}</div> : null}
    </div>
    {chip}
    {done !== undefined ? <div style={{width: 46 * u, height: 46 * u, borderRadius: 999, background: ok ? C.ok : '#ECEAF4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 * u, fontWeight: 900, transform: `scale(${0.7 + 0.3 * kd})`}}>{ok ? '✓' : ''}</div> : null}
  </div>;
};
const Stamp: React.FC<{text: string; color: string; at: number; f: number; u: number; rot?: number}> = ({text, color, at, f, u, rot = -10}) => {
  if (f < at) return null; const k = ez(f, at, at + 7, Easing.out(Easing.cubic));
  return <div style={{padding: `${6 * u}px ${24 * u}px`, border: `${7 * u}px solid ${color}`, borderRadius: 16 * u, color, fontFamily: F.head, fontWeight: 800, fontSize: 64 * u, transform: `rotate(${rot}deg) scale(${1.9 - 0.9 * k})`, opacity: Math.min(1, k * 2), background: 'rgba(255,255,255,0.9)'}}>{text}</div>;
};
const Cursor: React.FC<{x: number; y: number; press: number; u: number}> = ({x, y, press, u}) => <svg width={44 * u} height={44 * u} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))', zIndex: 30}}><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#17122E" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
const Arrow: React.FC<{at: number; f: number; u: number; vertical?: boolean; len?: number}> = ({at, f, u, vertical, len = 120}) => {
  const k = ez(f, at, at + 12); const L = len * u;
  return <svg width={vertical ? 30 * u : L} height={vertical ? L : 30 * u} style={{overflow: 'visible', flex: 'none'}}>
    {vertical ? <line x1={15 * u} y1={0} x2={15 * u} y2={L * k} stroke={C.accent} strokeWidth={6 * u} strokeLinecap="round" strokeDasharray={`${2 * u} ${14 * u}`} /> : <line x1={0} y1={15 * u} x2={L * k} y2={15 * u} stroke={C.accent} strokeWidth={6 * u} strokeLinecap="round" strokeDasharray={`${2 * u} ${14 * u}`} />}
  </svg>;
};
const AMB = ['stripe', 'hubspot', 'shopify', 'xero', 'figma', 'calendly', 'gsc', 'slack', 'acuity', 'drive', 'meta', 'pipedrive'];
const Plate: React.FC<{children: React.ReactNode; tint?: string; seed?: number}> = ({children, tint = '#FFFFFF', seed = 0}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{borderRadius: 64, background: `linear-gradient(160deg, ${tint}, #FFFFFF 60%)`, boxShadow: '0 80px 140px -60px rgba(40,20,80,0.45)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.9)'}}>
    {[0, 1, 2, 3, 4, 5].map((i) => { const r = (q: number) => ((Math.sin((seed + 1) * 91.7 + i * 37.3 + q * 13.1) + 1) / 2); const x = (i % 3) * 33 + r(1) * 20 + (i < 3 ? 2 : 8); const y = i < 3 ? 4 + r(2) * 12 : 80 + r(3) * 10; return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y + Math.sin(f / (40 + i * 7) + i) * 2.2}%`, opacity: 0.16, transform: `rotate(${(r(4) - 0.5) * 24 + Math.sin(f / 50 + i) * 4}deg)`}}><Tile k={AMB[(seed * 5 + i) % AMB.length]} size={70 + r(5) * 40} /></div>; })}
    <AbsoluteFill style={{transform: `translate(${Math.sin(f / 45 + seed) * 6}px, ${Math.cos(f / 52 + seed) * 5}px)`}}>{children}</AbsoluteFill>
  </AbsoluteFill>;
};
const Center: React.FC<{children: React.ReactNode; dir?: 'row' | 'column'; gap?: number; style?: React.CSSProperties}> = ({children, dir = 'column', gap = 24, style}) => <AbsoluteFill style={{display: 'flex', flexDirection: dir, alignItems: 'center', justifyContent: 'center', gap, ...style}}>{children}</AbsoluteFill>;

// ---------------- scenes (each is a W×H stage) ----------------
const Hook: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const words: [string, number, string][] = [['COPY', t.copy, 'stripe'], ['PASTE', t.paste, 'xero'], ['CHASE', t.chase, 'hubspot'], ['REPEAT', t.repeat, 'shopify']];
  const loop = f > t.repeat + 8 ? Math.floor((f - t.repeat - 8) / Math.max(2, 7 - Math.floor((f - t.repeat) / 12))) % 4 : -1;
  const seamK = ez(f, t.seam, t.seam + 16);
  return <AbsoluteFill>
    <Center gap={34 * u}>
      <div style={{display: 'flex', flexDirection: w ? 'row' : 'column', gap: 22 * u, alignItems: 'center'}}>
        {words.map(([wd, at, ic], i) => { const k = ez(f, at - 2, at + 6, Easing.out(Easing.cubic)); const hot = loop === i; return <div key={wd} style={{display: 'flex', alignItems: 'center', gap: 14 * u, padding: `${16 * u}px ${30 * u}px ${16 * u}px ${16 * u}px`, borderRadius: 999, background: hot || (loop < 0 && f >= at && f < at + 10) ? C.ink : '#FFFFFF', color: hot || (loop < 0 && f >= at && f < at + 10) ? '#fff' : C.ink, boxShadow: '0 24px 40px -20px rgba(40,20,80,0.45)', opacity: k, transform: `scale(${1.35 - 0.35 * k})`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined, fontFamily: F.head, fontWeight: 800, fontSize: 84 * u, letterSpacing: '-0.03em'}}><Tile k={ic} size={86 * u} />{wd}.</div>; })}
      </div>
    </Center>
    <div style={{position: 'absolute', left: 0, right: 0, top: w ? '66%' : '70%', textAlign: 'center', padding: `0 ${60 * u}px`}}><Words text="That's not the job you signed up for." at={t.that} f={f} size={(w ? 92 : 80) * u} em={['job']} /></div>
    {/* the seam: a red strike that becomes a light slit the camera flies through */}
    <div style={{position: 'absolute', left: '50%', top: w ? '80%' : '84%', width: 1500 * u * ez(f, t.strike, t.strike + 10), height: 10 * u + seamK * 22 * u, marginLeft: -750 * u * ez(f, t.strike, t.strike + 10), marginTop: -(5 * u + seamK * 11 * u), borderRadius: 999, background: seamK > 0 ? `linear-gradient(90deg, transparent, #FFFFFF 20%, #FFFFFF 80%, transparent)` : C.bad, boxShadow: seamK > 0 ? `0 0 ${60 * u}px ${20 * u}px rgba(255,255,255,0.9)` : undefined}} />
  </AbsoluteFill>;
};

const Intro: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const nodes: [string, string][] = [['stripe', 'Client pays'], ['drive', 'Folder'], ['docusign', 'Contract'], ['mail', 'Kickoff email']];
  const morph = ez(f, t.workflow - 6, t.workflow + 10);
  const count = Math.round(700 * ez(f, t.n700 - 10, t.n700 + 16, Easing.out(Easing.cubic)));
  const ring = ['shopify', 'hubspot', 'xero', 'calendly', 'figma', 'gsc', 'slides', 'meta', 'acuity', 'twilio', 'pipedrive', 'slack', 'notion', 'zendesk', 'mailchimp', 'asana', 'webflow', 'quickbooks'];
  const R = (w ? 820 : 470) * u; const ringK = ez(f, t.n700 - 14, t.n700 + 20);
  return <Plate tint={C.lilac} seed={1}>
    {ring.map((k, i) => { const a = (i / ring.length) * Math.PI * 2 + f * 0.006; const r = R * (0.55 + 0.45 * ringK); return <div key={k} style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(${Math.cos(a) * r - 40 * u}px, ${Math.sin(a) * r * (w ? 0.48 : 0.62) - 40 * u}px) scale(${0.7 + 0.3 * Math.sin(a)})`, opacity: ringK * (0.55 + 0.45 * Math.sin(a)), zIndex: Math.sin(a) > 0 ? 3 : 0}}><Tile k={k} size={80 * u} /></div>; })}
    <Center gap={30 * u}>
      <Rise at={t.fansa - 4} f={f}><div style={{display: 'flex', alignItems: 'center', gap: 18 * u}}><Img src={staticFile('logo-fansa.png')} style={{width: 92 * u, height: 92 * u, objectFit: 'contain'}} /><span style={{fontFamily: F.head, fontWeight: 800, fontSize: 96 * u, color: C.ink, letterSpacing: '-0.04em'}}>FansaChat</span><Chip text="Coming soon" color={C.accent} u={u} at={t.fansa + 8} f={f} /></div></Rise>
      <div style={{position: 'relative', width: (w ? 1500 : 940) * u, height: (w ? 220 : 560) * u}}>
        {/* sentence card that morphs into the workflow */}
        <div style={{...glass, position: 'absolute', left: '50%', top: '50%', width: (w ? 1150 : 900) * u, transform: `translate(-50%, -50%) scale(${1 - 0.35 * morph})`, opacity: 1 - morph, padding: 30 * u, fontFamily: F.ui, fontWeight: 600, fontSize: 38 * u, color: C.ink, textAlign: 'left'}}>
          <span style={{color: C.sub, fontSize: 24 * u, display: 'block', marginBottom: 8 * u}}>One sentence</span>
          “When a client pays, set up their folder, contract and kickoff email.”
        </div>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: w ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: 12 * u}}>
          {nodes.map(([k, label], i) => { const kk = ez(f, t.workflow + i * 4, t.workflow + i * 4 + 12); return <React.Fragment key={k}>
            {i ? <Arrow at={t.workflow + i * 4} f={f} u={u} vertical={!w} len={w ? 70 : 40} /> : null}
            <div style={{...glass, padding: `${16 * u}px ${22 * u}px`, display: 'flex', gap: 14 * u, alignItems: 'center', opacity: kk, transform: `scale(${0.6 + 0.4 * kk}) translateY(${(1 - kk) * 30 * u}px)`}}><Tile k={k} size={64 * u} /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: 28 * u, color: C.ink, whiteSpace: 'nowrap'}}>{label}</span></div>
          </React.Fragment>; })}
        </div>
      </div>
      <Rise at={t.n700 - 10} f={f}><div style={{fontFamily: F.head, fontWeight: 800, fontSize: 70 * u, color: C.ink}}><span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{count}+</span> apps</div></Rise>
    </Center>
  </Plate>;
};

// Freelancer payoffs
const F1: React.FC<S & {t: Record<string, number>}> = ({f, u, t}) => <Plate tint={C.peach} seed={2}>
  <div style={{position: 'absolute', left: 70 * u, top: 60 * u}}><Label text="FREELANCERS" at={t.free} f={f} u={u} /></div>
  <Center gap={22 * u} style={{paddingTop: 60 * u}}>
    <Rise at={t.stripe} f={f}><div style={{...glass, background: C.ink, color: '#fff', padding: `${18 * u}px ${28 * u}px`, display: 'flex', gap: 16 * u, alignItems: 'center', fontFamily: F.ui, fontWeight: 800, fontSize: 32 * u}}><Tile k="stripe" size={60 * u} />Payment received · Lumen Studio</div></Rise>
    <Card icon="drive" title="Client folder created" sub="Google Drive" u={u} at={t.folder} f={f} done={t.folder + 8} />
    <Card icon="docusign" title="Contract sent to sign" sub="DocuSign" u={u} at={t.folder + 5} f={f} done={t.folder + 14} />
    <Card icon="mail" title="Kickoff email sent" sub="Welcome + next steps" u={u} at={t.folder + 10} f={f} done={t.folder + 20} />
  </Center>
</Plate>;
const F2: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const wait = ez(f, t.remind - 14, t.remind + 4);
  return <Plate tint={C.cream} seed={3}>
    <Center dir={w ? 'row' : 'column'} gap={40 * u}>
      <div style={{position: 'relative'}}>
        <Card icon="xero" title="Invoice INV-0142" sub="Due 12 days ago" u={u} at={t.xero} f={f} width={560} />
        <div style={{position: 'absolute', right: -30 * u, top: -40 * u}}>{f < t.paid ? <Stamp text="OVERDUE" color={C.bad} at={t.xero + 8} f={f} u={u} /> : <Stamp text="PAID" color={C.ok} at={t.paid} f={f} u={u} rot={8} />}</div>
      </div>
      <Rise at={t.remind - 16} f={f}><div style={{...glass, padding: `${18 * u}px ${26 * u}px`, display: 'flex', gap: 18 * u, alignItems: 'center'}}>
        <svg width={64 * u} height={64 * u} viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" stroke="#ECEAF4" strokeWidth="5" fill="none" /><circle cx="20" cy="20" r="16" stroke={C.accent} strokeWidth="5" fill="none" pathLength={1} strokeDasharray={`${wait} 1`} transform="rotate(-90 20 20)" /></svg>
        <div><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 30 * u, color: C.ink}}>Wait 3 days</div><div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 24 * u, color: f >= t.remind + 4 ? C.ok : C.sub}}>{f >= t.remind + 4 ? '✓ Polite reminder sent' : 'then remind'}</div></div>
      </div></Rise>
    </Center>
  </Plate>;
};
const F3: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const fly = ez(f, t.crm - 8, t.crm + 8, Easing.inOut(Easing.cubic));
  return <Plate tint={C.lilac} seed={4}>
    <Center dir={w ? 'row' : 'column'} gap={60 * u}>
      <div style={{transform: w ? `translateX(${fly * 330 * u}px) scale(${1 - 0.3 * fly})` : `translateY(${fly * 300 * u}px) scale(${1 - 0.3 * fly})`, opacity: 1 - fly * 0.9, zIndex: 3}}><Card icon="calendly" title="Intro call booked" sub="Thu · 10:00" u={u} at={t.cal} f={f} width={500} /></div>
      <Rise at={t.cal + 4} f={f}><div style={{...glass, width: 460 * u, padding: 22 * u}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * u, fontFamily: F.ui, fontWeight: 800, fontSize: 26 * u, color: C.ink, marginBottom: 14 * u}}><Tile k="pipedrive" size={50 * u} />Pipedrive · New deals</div>
        {['Rhea · brand refresh', 'Kai · landing page'].map((d) => <div key={d} style={{padding: 14 * u, borderRadius: 16 * u, background: '#F5F4FA', fontFamily: F.ui, fontWeight: 600, fontSize: 22 * u, color: C.sub, marginBottom: 10 * u}}>{d}</div>)}
        <div style={{padding: 14 * u, borderRadius: 16 * u, background: C.accent + '18', border: `2px solid ${C.accent}`, fontFamily: F.ui, fontWeight: 800, fontSize: 22 * u, color: C.ink, opacity: ez(f, t.crm, t.crm + 8), transform: `scale(${0.9 + 0.1 * ez(f, t.crm, t.crm + 8)})`}}>Intro call · Thu 10:00 ✓</div>
      </div></Rise>
    </Center>
  </Plate>;
};

// Agency payoffs
const A1: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => <Plate tint={C.lilac} seed={5}>
  <div style={{position: 'absolute', left: 70 * u, top: 60 * u}}><Label text="AGENCIES" at={t.ag} f={f} u={u} /></div>
  <Center dir={w ? 'row' : 'column'} gap={26 * u} style={{paddingTop: 60 * u}}>
    <Card icon="meta" title="New ad lead" sub="Spring campaign · lead form" u={u} at={t.meta} f={f} width={520} />
    <Arrow at={t.meta + 6} f={f} u={u} vertical={!w} len={w ? 110 : 60} />
    <Card icon="hubspot" title="Contact in HubSpot" sub="Owner assigned · Maya R." u={u} at={t.hub} f={f} done={t.hub + 10} width={540} />
  </Center>
</Plate>;
const A2: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const draw = ez(f, t.search - 4, t.search + 22, Easing.inOut(Easing.cubic)); const toSlide = ez(f, t.search + 22, t.search + 34);
  const pts = [0.62, 0.55, 0.58, 0.44, 0.47, 0.33, 0.28, 0.18];
  const Wc = 560 * u, Hc = 260 * u; const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(i / (pts.length - 1)) * Wc},${p * Hc}`).join(' ');
  return <Plate tint={C.cream} seed={6}>
    <Center dir={w ? 'row' : 'column'} gap={44 * u}>
      <Rise at={t.mon - 6} f={f}><div style={{...glass, width: 220 * u, overflow: 'hidden', textAlign: 'center'}}><div style={{background: C.bad, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 30 * u, padding: 10 * u}}>MON</div><div style={{fontFamily: F.head, fontWeight: 800, fontSize: 84 * u, color: C.ink, padding: 12 * u}}>08:00</div></div></Rise>
      <Rise at={t.search - 6} f={f}><div style={{...glass, padding: 24 * u, width: Wc + 48 * u, position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * u, fontFamily: F.ui, fontWeight: 800, fontSize: 24 * u, color: C.ink, marginBottom: 10 * u}}><Tile k={toSlide > 0.5 ? 'slides' : 'gsc'} size={46 * u} />{toSlide > 0.5 ? 'Client report · week 42' : 'Search Console · clicks'}</div>
        <svg width={Wc} height={Hc} style={{overflow: 'visible'}}><path d={d} stroke={C.accent} strokeWidth={7 * u} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} /></svg>
        <div style={{position: 'absolute', right: 20 * u, bottom: 20 * u}}><Chip text="✓ Sent to client" color={C.ok} u={u} at={t.search + 30} f={f} /></div>
      </div></Rise>
    </Center>
  </Plate>;
};
const A3: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const lanes: [string, string[]][] = [['Account manager', ['hubspot', 'gcal', 'mail']], ['Designer', ['figma', 'drive', 'slack']], ['Project lead', ['asana', 'clickup', 'slides']]];
  return <Plate tint={C.peach} seed={7}>
    <Center gap={18 * u}>
      {lanes.map(([role, apps], i) => { const at = t.role + i * 6; const k = ez(f, at, at + 12); return <div key={role} style={{...glass, display: 'flex', alignItems: 'center', gap: 18 * u, padding: `${16 * u}px ${24 * u}px`, width: (w ? 1080 : 900) * u, opacity: k, transform: `translateX(${(1 - k) * -80 * u}px)`}}>
        <div style={{width: (w ? 300 : 260) * u, fontFamily: F.ui, fontWeight: 800, fontSize: 28 * u, color: C.ink}}>{role}</div>
        {apps.map((a, j) => <React.Fragment key={a}>{j ? <Arrow at={at + j * 4} f={f} u={u} len={50} /> : null}<Tile k={a} size={60 * u} style={{opacity: ez(f, at + j * 4, at + j * 4 + 8)}} /></React.Fragment>)}
        <div style={{marginLeft: 'auto'}}><Chip text="own flow" color={C.accent} u={u} at={at + 12} f={f} /></div>
      </div>; })}
      <Rise at={t.role + 22} f={f}><div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 26 * u, color: C.sub}}>One shared client table · every role in sync</div></Rise>
    </Center>
  </Plate>;
};
const A4: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const split = ez(f, t.figma + 6, t.figma + 18);
  return <Plate tint={C.lilac} seed={8}>
    <Center dir={w ? 'row' : 'column'} gap={30 * u}>
      <Rise at={t.feed - 4} f={f}><div style={{...glass, padding: 22 * u, width: 440 * u}}><div style={{display: 'flex', gap: 12 * u, alignItems: 'center', fontFamily: F.ui, fontWeight: 800, fontSize: 24 * u, color: C.ink}}><Tile k="figma" size={50 * u} />Homepage v3 · comment</div><div style={{marginTop: 12 * u, padding: 14 * u, borderRadius: 16 * u, background: '#F5F4FA', fontFamily: F.ui, fontSize: 24 * u, color: C.ink}}>“Can we try the blue logo?”</div></div></Rise>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * u, opacity: ez(f, t.figma, t.figma + 10)}}>
        <div style={{...glass, padding: `${12 * u}px ${20 * u}px`, fontFamily: F.ui, fontWeight: 800, fontSize: 24 * u, color: C.ink, border: `2px solid ${C.accent}`}}>Who owns this file?</div>
        <div style={{display: 'flex', gap: 14 * u}}>{['Design ✓', 'Copy'].map((b, i) => <div key={b} style={{padding: `${8 * u}px ${18 * u}px`, borderRadius: 999, background: i ? '#ECEAF4' : C.ok + '22', color: i ? C.sub : C.ok, fontFamily: F.ui, fontWeight: 800, fontSize: 22 * u, transform: `translateX(${(i ? 1 : -1) * (1 - split) * 30 * u}px)`, opacity: split}}>{b}</div>)}</div>
      </div>
      <Rise at={t.slack} f={f}><div style={{...glass, padding: 20 * u, width: 470 * u, display: 'flex', gap: 14 * u, alignItems: 'center'}}><Tile k="slack" size={60 * u} /><div><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 26 * u, color: C.ink}}>DM to @designer</div><div style={{fontFamily: F.ui, fontSize: 22 * u, color: C.sub}}>New feedback on Homepage v3</div></div></div></Rise>
    </Center>
  </Plate>;
};

// Small-business payoffs
const PHONE = {x: 0.68, y: 0.52}; // phone screen centre inside B1 (stage fraction) = zoom-through target
const B1: React.FC<S & {t: Record<string, number>}> = ({f, u, w, W, H, t}) => {
  const pw = 330 * u, ph = 640 * u;
  return <Plate tint={C.peach} seed={9}>
    <div style={{position: 'absolute', left: 70 * u, top: 60 * u}}><Label text="SMALL BUSINESSES" at={t.small} f={f} u={u} /></div>
    <div style={{position: 'absolute', left: w ? W * 0.12 : W * 0.06, top: w ? H * 0.38 : H * 0.2}}><Card icon="acuity" title="Haircut · tomorrow 10:00" sub="Acuity Scheduling" u={u} at={t.book} f={f} width={w ? 600 : 560} /></div>
    <div style={{position: 'absolute', left: W * PHONE.x - pw / 2, top: H * PHONE.y - ph / 2, width: pw, height: ph, borderRadius: 54 * u, background: '#121212', padding: 10 * u, boxShadow: '0 50px 90px -40px rgba(0,0,0,0.6)', transform: `translateY(${(1 - sp(f, t.book + 4)) * 300 * u}px)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 46 * u, background: 'linear-gradient(170deg,#FFF3EA,#F2EEFF)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 60 * u, width: '100%', textAlign: 'center', fontFamily: F.ui, fontWeight: 300, fontSize: 70 * u, color: C.ink}}>9:41</div>
        <div style={{position: 'absolute', left: 14 * u, right: 14 * u, top: 200 * u, padding: 16 * u, borderRadius: 22 * u, background: '#fff', boxShadow: '0 10px 20px -10px rgba(0,0,0,0.3)', opacity: ez(f, t.book + 12, t.book + 20), transform: `translateY(${(1 - ez(f, t.book + 12, t.book + 20)) * -40 * u}px)`}}>
          <div style={{display: 'flex', gap: 8 * u, alignItems: 'center', fontFamily: F.ui, fontSize: 16 * u, color: C.sub}}><Icon k="twilio" size={22 * u} />SMS · now</div>
          <div style={{fontFamily: F.ui, fontWeight: 700, fontSize: 21 * u, color: C.ink, marginTop: 6 * u}}>See you tomorrow at 10. Reply C to confirm.</div>
        </div>
      </div>
    </div>
  </Plate>;
};
const B2: React.FC<S & {t: Record<string, number>}> = ({f, u, w, t}) => {
  const steps: [string, string, number][] = [['shopify', 'Order #1048 fulfilled', t.orders], ['shippo', 'Out for delivery', t.orders + 8], ['mail', 'Wait 5 days → review request', t.review - 4]];
  return <Plate tint={C.cream} seed={10}>
    <Center gap={18 * u}>
      {steps.map(([k, label, at]) => <Card key={label} icon={k} title={label} u={u} at={at} f={f} done={at + 10} width={w ? 680 : 640} />)}
      <Rise at={t.review + 4} f={f}><div style={{fontSize: 64 * u, letterSpacing: 8 * u, color: '#FFB020'}}>{'★★★★★'.split('').map((s, i) => <span key={i} style={{opacity: ez(f, t.review + 4 + i * 2, t.review + 10 + i * 2)}}>{s}</span>)}</div></Rise>
    </Center>
  </Plate>;
};
const B3: React.FC<S & {t: Record<string, number>}> = ({f, u, w, W, H, t}) => {
  const press = Math.max(0, 1 - Math.abs(f - t.approve) / 4); const approved = f >= t.approve;
  const cx = interpolate(f, [t.approve - 20, t.approve - 2], [W * 0.85, W * (w ? 0.6 : 0.62)], {...clamp, easing: EXPO}); const cy = interpolate(f, [t.approve - 20, t.approve - 2], [H * 0.9, H * (w ? 0.6 : 0.64)], {...clamp, easing: EXPO});
  return <Plate tint={C.lilac} seed={11}>
    <Center gap={26 * u}>
      <Card icon="key" title="Your own logins" sub="Connections stay yours" u={u} at={t.own} f={f} width={620} done={t.own + 10} />
      <Rise at={t.own + 6} f={f}><div style={{...glass, padding: 24 * u, width: 620 * u, display: 'flex', alignItems: 'center', gap: 18 * u}}>
        <div style={{flex: 1, fontFamily: F.ui, fontWeight: 800, fontSize: 28 * u, color: C.ink}}>Booking reminders</div>
        <Chip text={approved ? '✓ Approved' : 'Draft'} color={approved ? C.ok : C.sub} u={u} />
        <div style={{padding: `${14 * u}px ${24 * u}px`, borderRadius: 999, background: GRAD, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 24 * u, transform: `scale(${1 - 0.08 * press})`}}>Approve & Run</div>
      </div></Rise>
    </Center>
    {f > t.approve - 22 ? <Cursor x={cx} y={cy} press={press} u={u} /> : null}
  </Plate>;
};

// ---------------- camera ----------------
type KF = [number, number, number, number]; // frame, zoom, x, y
const camAt = (kfs: KF[], f: number) => {
  if (f <= kfs[0][0]) return kfs[0];
  for (let i = 0; i < kfs.length - 1; i++) {
    const [a, za, xa, ya] = kfs[i], [b, zb, xb, yb] = kfs[i + 1];
    if (f <= b) {
      const k = interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
      const z = Math.exp(Math.log(za) + (Math.log(zb) - Math.log(za)) * k);
      // keep the focus point stable in screen space while zoom changes (log-space path)
      const kz = za === zb ? k : (1 / z - 1 / za) / (1 / zb - 1 / za);
      return [f, z, xa + (xb - xa) * kz, ya + (yb - ya) * kz] as KF;
    }
  }
  return kfs[kfs.length - 1];
};

// ---------------- film ----------------
export const Film: React.FC<{vo: Vo}> = ({vo}) => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const u = w ? W / 1920 : W / 1080;
  const {st, total} = timeline(vo); const wf = makeWf(vo, st);
  const t = {
    copy: wf(0, ['copy']), paste: wf(0, ['paste']), chase: wf(0, ['chase']), repeat: wf(0, ['repeat']), that: wf(0, ['that']), strike: wf(0, ['signed', 'sign']), seam: st[1] - 14,
    fansa: wf(1, ['fansa', 'fan']), workflow: wf(1, ['workflow', 'work']), n700: wf(1, ['700', 'seven', 'hundred']),
    free: wf(2, ['freelanc']), stripe: wf(2, ['stripe']), folder: wf(2, ['folder']), xero: wf(2, ['xero', 'zero']), remind: wf(2, ['reminder']), paid: wf(2, ['reminder']) + 18, cal: wf(2, ['calendly', 'calend']), crm: wf(2, ['crm', 'cr']),
    ag: wf(3, ['agenc']), meta: wf(3, ['meta']), hub: wf(3, ['hubspot', 'hub']), mon: wf(3, ['monday']), search: wf(3, ['search']), role: wf(3, ['role']), feed: wf(3, ['feedback']), figma: wf(3, ['figma']), slack: wf(3, ['slack']),
    small: wf(4, ['small']), book: wf(4, ['booking']), noshow: wf(4, ['noshow', 'no']), orders: wf(4, ['order']), review: wf(4, ['review']), own: wf(4, ['own', 'your']), approve: wf(4, ['approve']),
    end: st[5], workday: wf(5, ['workday', 'work']), join: st[6],
  };
  const props: S = {f, W, H, w, u, wf};
  // ---- world layout (units = px at zoom 1) ----
  const s6 = 1 / 6, s36 = 1 / 36;
  const P0: [number, number] = [0, H * 0.12]; // seam point in the hook stage
  const gx = W * s6 * 1.07, gy = H * s6 * 1.12;
  const pos = {
    intro: P0,
    f1: [P0[0] + gx, P0[1]], f2: [P0[0] + gx * 2, P0[1]], f3: [P0[0] + gx * 3, P0[1]],
    a1: [P0[0] + gx * 3, P0[1] + gy], a2: [P0[0] + gx * 4, P0[1] + gy], a3: [P0[0] + gx * 5, P0[1] + gy], a4: [P0[0] + gx * 6, P0[1] + gy],
    b1: [P0[0] + gx * 6, P0[1] + gy * 2],
  } as Record<string, [number, number]>;
  const phone: [number, number] = [pos.b1[0] + (PHONE.x - 0.5) * W * s6, pos.b1[1] + (PHONE.y - 0.5) * H * s6];
  pos.b2 = phone; pos.b3 = [phone[0] + W * s36 * 1.16, phone[1]];
  const board: [number, number] = [(pos.intro[0] + pos.a4[0]) / 2, (pos.intro[1] + pos.b1[1]) / 2];
  const boardZ = Math.min(W / ((pos.a4[0] - pos.intro[0]) + W * s6 * 1.3), H / ((pos.b1[1] - pos.intro[1]) + H * s6 * 1.4));
  // ---- camera keyframes ----
  const T = (x: number) => Math.round(x);
  const kfs: KF[] = [
    [0, 1, 0, 0], [T(t.seam), 1.08, 0, P0[1] * 0.3],
    [T(t.seam + 18), 6, ...P0], [T(t.free - 12), 6.6, ...P0],                                   // zoom-through the seam into the intro plate
    [T(t.free + 2), 6, ...pos.f1], [T(t.xero - 12), 6.5, ...pos.f1],                            // zoom-aside →
    [T(t.xero + 6), 6, ...pos.f2], [T(t.cal - 12), 6.5, ...pos.f2],
    [T(t.cal + 6), 6, ...pos.f3], [T(t.ag - 12), 6.5, ...pos.f3],
    [T(t.ag + 6), 6, ...pos.a1], [T(t.mon - 12), 6.5, ...pos.a1],                               // aside ↓
    [T(t.mon + 6), 6, ...pos.a2], [T(t.role - 12), 6.5, ...pos.a2],
    [T(t.role + 6), 6, ...pos.a3], [T(t.feed - 12), 6.5, ...pos.a3],
    [T(t.feed + 6), 6, ...pos.a4], [T(t.small - 30), 6.5, ...pos.a4],
    [T(t.small - 6), boardZ, ...board],                                                          // zoom-out: the whole board
    [T(t.small + 10), boardZ * 1.02, ...board],
    [T(t.small + 30), 6, ...pos.b1], [T(t.orders - 16), 6.3, ...phone],
    [T(t.orders + 2), 36, ...pos.b2], [T(t.own - 12), 39, ...pos.b2],                            // zoom-through the phone screen
    [T(t.own + 6), 36, ...pos.b3], [T(t.end - 4), 39, ...pos.b3],
    [T(t.end + 20), boardZ * 0.8, ...board],                                                     // big pull-back reveal
    [T(total), boardZ * 0.84, ...board],
  ];
  const [, z, cx, cy] = camAt(kfs, f);
  const m = Math.min;
  const d: Record<string, number> = {...t};
  const arr = (x: number) => x + 2;
  d.workflow = m(t.workflow, t.fansa + 26); d.n700 = m(t.n700, d.workflow + 30);
  d.stripe = m(t.stripe, arr(t.free) + 4); d.folder = m(t.folder, d.stripe + 12);
  d.xero = arr(t.xero) - 10; d.remind = m(t.remind, d.xero + 16); d.paid = d.remind + 16;
  d.cal = arr(t.cal) - 10; d.crm = m(t.crm, d.cal + 22);
  d.ag = arr(t.ag) - 4; d.meta = arr(t.ag) - 8; d.hub = m(t.hub, d.meta + 14);
  d.mon = arr(t.mon) - 10; d.search = m(t.search, d.mon + 10);
  d.role = arr(t.role) - 8;
  d.feed = arr(t.feed) - 10; d.figma = m(t.figma, d.feed + 12); d.slack = m(t.slack, d.figma + 18);
  d.book = t.small + 14; d.noshow = d.book + 16;
  d.review = m(t.review, t.orders + 30);
  d.own = arr(t.own) - 10; d.approve = m(t.approve, d.own + 30);
  const UIW: Record<string, number> = {intro: 1.3, f1: 1.6, f2: 1.6, f3: 1.6, a1: 1.35, a2: 1.6, a3: 1.6, a4: 1.4, b1: 1.4, b2: 1.55, b3: 1.6};
  const pp = (id: string) => ({...props, u: u * (w ? UIW[id] : id === 'intro' ? 1 : 1.15), t: d});
  const scenes: {id: string; at: [number, number]; s: number; el: React.ReactNode}[] = [
    {id: 'intro', at: pos.intro, s: s6, el: <Intro {...pp('intro')} />},
    {id: 'f1', at: pos.f1, s: s6, el: <F1 {...pp('f1')} />}, {id: 'f2', at: pos.f2, s: s6, el: <F2 {...pp('f2')} />}, {id: 'f3', at: pos.f3, s: s6, el: <F3 {...pp('f3')} />},
    {id: 'a1', at: pos.a1, s: s6, el: <A1 {...pp('a1')} />}, {id: 'a2', at: pos.a2, s: s6, el: <A2 {...pp('a2')} />}, {id: 'a3', at: pos.a3, s: s6, el: <A3 {...pp('a3')} />}, {id: 'a4', at: pos.a4, s: s6, el: <A4 {...pp('a4')} />},
    {id: 'b1', at: pos.b1, s: s6, el: <B1 {...pp('b1')} />}, {id: 'b2', at: pos.b2, s: s36, el: <B2 {...pp('b2')} />}, {id: 'b3', at: pos.b3, s: s36, el: <B3 {...pp('b3')} />},
  ];
  const gateOf = (id: string) => (id === 'intro' ? 0 : id === 'b2' || id === 'b3' ? t.orders - 16 : t.seam + 14);
  // screen rect culling
  const vis = (at: [number, number], s: number) => { const sw = W * s * z, sh = H * s * z; const sx = (at[0] - cx) * z + W / 2, sy = (at[1] - cy) * z + H / 2; return sw > 6 && sx + sw / 2 > -W * 0.2 && sx - sw / 2 < W * 1.2 && sy + sh / 2 > -H * 0.2 && sy - sh / 2 < H * 1.2; };
  const blur = (() => { const [, z2, x2, y2] = camAt(kfs, f + 1); const v = Math.hypot((x2 - cx) * z, (y2 - cy) * z) / W + Math.abs(Math.log(z2 / z)) * 0.6; return Math.min(14, v * 120); })();
  const outro = ez(f, t.end + 10, t.end + 24); const endK = ez(f, t.join - 6, t.join + 10);
  return <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
    {/* table: soft mesh + dot grid that moves with the camera */}
    <AbsoluteFill style={{background: `radial-gradient(60% 50% at ${35 + Math.sin(f / 70) * 10}% 30%, ${C.peach}, transparent 70%), radial-gradient(60% 60% at 80% 80%, ${C.lilac}, transparent 70%), linear-gradient(160deg, #FFFFFF, ${C.cream})`}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(100,104,216,0.16) 2px, transparent 2px)', backgroundSize: '44px 44px', backgroundPosition: `${-cx * z * 0.2}px ${-cy * z * 0.2}px`}} />
    <AbsoluteFill style={{filter: blur > 0.8 ? `blur(${blur}px)` : undefined, opacity: 1 - 0.75 * outro}}>
      <div style={{position: 'absolute', left: W / 2, top: H / 2, transform: `scale(${z}) translate(${-cx}px, ${-cy}px)`, transformOrigin: '0 0'}}>
        {/* hook stage = the world origin, full size */}
        {f < t.free ? <div style={{position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, opacity: 1 - ez(f, t.seam + 16, t.seam + 30)}}><Hook {...props} t={t} /></div> : null}
        {scenes.map((sc) => vis(sc.at, sc.s) && f >= gateOf(sc.id) ? <div key={sc.id} style={{opacity: sc.id === 'b2' || sc.id === 'b3' ? ez(f, t.orders - 16, t.orders - 6) : sc.id === 'intro' ? 1 : ez(f, t.seam + 14, t.seam + 26), position: 'absolute', left: sc.at[0] - (W * sc.s) / 2, top: sc.at[1] - (H * sc.s) / 2, width: W, height: H, transform: `scale(${sc.s})`, transformOrigin: '0 0', clipPath: sc.id === 'intro' ? `inset(${50 - 50 * ez(f, t.seam, t.seam + 14)}% 0 ${50 - 50 * ez(f, t.seam, t.seam + 14)}% 0 round 64px)` : undefined}}>{sc.el}</div> : null)}
      </div>
    </AbsoluteFill>
    {/* business types carousel + "Your workday, back." */}
    {f >= t.end && f < t.join + 4 ? <Outro f={f} u={u} w={w} t={t} /> : null}
    {/* end card */}
    {f >= t.join - 6 ? <AbsoluteFill style={{background: `rgba(255,248,242,${endK})`}}><End f={f} u={u} t={t} /></AbsoluteFill> : null}
    <AudioTrack vo={vo} st={st} total={total} t={d} />
  </AbsoluteFill>;
};

const BIZ: [string, string][] = [['Clinics', 'acuity'], ['Salons', 'calcom'], ['Law firms', 'docusign'], ['Online shops', 'shopify'], ['Recruiters', 'calendly'], ['Studios', 'figma']];
const Outro: React.FC<{f: number; u: number; w: boolean; t: Record<string, number>}> = ({f, u, w, t}) => {
  const ats = [wfLocal(t, 0), ...[1, 2, 3, 4, 5].map((i) => wfLocal(t, i))];
  let idx = -1; ats.forEach((a, i) => { if (f >= a) idx = i; });
  const fin = f >= t.workday - 4; const kf = ez(f, t.workday - 4, t.workday + 10);
  return <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {!fin ? <div style={{position: 'relative', width: 0, height: 0, perspective: 1400}}>{BIZ.map(([name, ic], i) => { const o = i - idx - ez(f, ats[Math.max(0, idx)], ats[Math.max(0, idx)] + 8) + 1; if (idx < 0 || Math.abs(o) > 1.6) return null; return <div key={name} style={{position: 'absolute', left: -330 * u, top: -110 * u, width: 660 * u, height: 220 * u, ...glass, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 * u, transform: `translateY(${o * 240 * u}px) rotateX(${-o * 40}deg) scale(${1 - Math.min(1, Math.abs(o)) * 0.2})`, opacity: 1 - Math.abs(o) * 0.55}}><Tile k={ic} size={100 * u} /><span style={{fontFamily: F.head, fontWeight: 800, fontSize: 84 * u, color: C.ink, letterSpacing: '-0.035em'}}>{name}</span></div>; })}</div>
      : <div style={{textAlign: 'center', opacity: kf, transform: `scale(${0.94 + 0.06 * kf})`}}><Words text="Your workday, back." at={t.workday - 4} f={f} size={(w ? 130 : 110) * u} em={['back.', 'back']} /></div>}
  </AbsoluteFill>;
};
// carousel word times: evenly across line 6 before "workday" (names are short single words)
const wfLocal = (t: Record<string, number>, i: number) => Math.round(t.end + 4 + ((t.workday - 8 - t.end) * i) / 6);

const End: React.FC<{f: number; u: number; t: Record<string, number>}> = ({f, u, t}) => {
  const a = t.join - 6; const k = sp(f, a);
  return <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 * u}}>
    <div style={{width: 230 * u, height: 230 * u, borderRadius: 62 * u, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 90px -30px rgba(40,20,80,0.45)', transform: `scale(${k})`}}><Img src={staticFile('logo-fansa.png')} style={{width: 180 * u, height: 180 * u, objectFit: 'contain'}} /></div>
    <Rise at={a + 6} f={f}><div style={{display: 'flex', alignItems: 'center', gap: 18 * u}}><span style={{fontFamily: F.head, fontWeight: 800, fontSize: 110 * u, letterSpacing: '-0.04em', backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>FansaChat</span><Chip text="Coming soon" color={C.accent} u={u} /></div></Rise>
    <Rise at={a + 14} f={f}><div style={{padding: `${20 * u}px ${54 * u}px`, borderRadius: 999, background: C.ink, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 44 * u}}>Join the waitlist →</div></Rise>
    <Rise at={a + 22} f={f}><div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 30 * u, color: C.ink}}>fansachat.com · Community: t.me/fansachat</div></Rise>
  </AbsoluteFill>;
};

// ---------------- audio: music ducked under VO + one soft SFX per event (Kenney CC0) ----------------
const AudioTrack: React.FC<{vo: Vo; st: number[]; total: number; t: Record<string, number>}> = ({vo, st, total, t}) => {
  const talk = (x: number) => vo.some((l, i) => x >= st[i] && x <= st[i] + l.dur * 30);
  const sfx: [number, string, number][] = [
    [t.copy, 'k_select_003', 0.35], [t.paste, 'k_select_003', 0.35], [t.chase, 'k_select_003', 0.35], [t.repeat, 'k_select_003', 0.4], [t.strike, 'k_drop_002', 0.3],
    [t.workflow + 10, 'k_confirmation_002', 0.25], [t.stripe, 'k_glass_002', 0.3], [t.folder + 20, 'k_pluck_001', 0.25], [t.xero + 8, 'k_drop_002', 0.25], [t.paid, 'k_confirmation_002', 0.22],
    [t.crm, 'k_pluck_002', 0.25], [t.hub + 10, 'k_glass_002', 0.25], [t.search + 30, 'k_pluck_001', 0.22], [t.slack, 'k_glass_002', 0.25], [t.noshow - 6, 'k_glass_002', 0.3],
    [t.review + 6, 'k_pluck_002', 0.22], [t.approve, 'k_click_002', 0.4], [t.workday - 4, 'k_confirmation_002', 0.22], [t.join - 6, 'k_pluck_002', 0.3],
  ];
  return <>
    <Audio src={staticFile('audio/03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3')} volume={(x) => interpolate(x, [0, 15, total - 45, total], [0, 1, 1, 0], clamp) * (talk(x) ? 0.11 : 0.24)} />
    {vo.map((l, i) => <Sequence key={i} from={st[i]}><Audio src={staticFile(l.file)} /></Sequence>)}
    {sfx.map(([at, s, v], i) => <Sequence key={'s' + i} from={Math.max(0, Math.round(at))}><Audio src={staticFile(`audio/sfx/${s}.ogg`)} volume={v} /></Sequence>)}
  </>;
};
