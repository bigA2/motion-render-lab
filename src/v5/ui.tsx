// v5 realistic UI kit: Chrome-style browser, Gmail inbox, Google Sheets grid, Slack message, FansaChat app,
// workflow canvas with real brand logos (simple-icons, CC0), macOS terminal, iOS notifications, cursor, keycaps.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as mono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as brico} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as instr} from '@remotion/google-fonts/InstrumentSerif';
import * as si from 'simple-icons';
import {ease, sp, typed, Caret} from './fx';

export const F = {
  ui: inter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily,
  mono: mono('normal', {weights: ['400', '600'], subsets: ['latin']}).fontFamily,
  head: brico('normal', {weights: ['600', '700', '800'], subsets: ['latin']}).fontFamily,
  serif: instr('italic', {weights: ['400'], subsets: ['latin']}).fontFamily,
};

// ---------- brand logos ----------
type SI = {path: string; hex: string; title: string};
export const ICON: Record<string, SI> = {
  gmail: si.siGmail, sheets: si.siGooglesheets, slack: si.siSlack, telegram: si.siTelegram, notion: si.siNotion, trello: si.siTrello,
  shopify: si.siShopify, stripe: si.siStripe, hubspot: si.siHubspot, discord: si.siDiscord, whatsapp: si.siWhatsapp, drive: si.siGoogledrive,
  dropbox: si.siDropbox, airtable: si.siAirtable, asana: si.siAsana, calendly: si.siCalendly, zoom: si.siZoom, gcal: si.siGooglecalendar,
  mailchimp: si.siMailchimp, figma: si.siFigma, canva: si.siCanva, instagram: si.siInstagram, youtube: si.siYoutube, xero: si.siXero,
  quickbooks: si.siQuickbooks, salesforce: si.siSalesforce, jira: si.siJira, github: si.siGithub, linear: si.siLinear, clickup: si.siClickup,
  typeform: si.siTypeform, woo: si.siWoocommerce, paypal: si.siPaypal, wise: si.siWise,
} as unknown as Record<string, SI>;
export const Logo: React.FC<{k: string; size?: number; color?: string}> = ({k, size = 40, color}) => {
  const i = ICON[k];
  return <svg viewBox="0 0 24 24" width={size} height={size}><path d={i.path} fill={color ?? '#' + i.hex} /></svg>;
};
const lum = (h: string) => { const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
export const AppTile: React.FC<{k: string; size?: number; dark?: boolean; style?: React.CSSProperties}> = ({k, size = 96, dark, style}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: dark ? 'linear-gradient(160deg,#20243A,#12142A)' : 'linear-gradient(160deg,#FFFFFF,#EEF0F8)', boxShadow: dark ? '0 18px 40px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)' : '0 18px 40px -16px rgba(30,30,80,0.45), inset 0 1px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}}>
    <Logo k={k} size={size * 0.52} color={dark && lum(ICON[k].hex) < 0.22 ? '#fff' : undefined} />
  </div>
);

// ---------- macOS cursor with click ripple ----------
export const Cursor: React.FC<{x: number; y: number; clickAt?: number[]; scale?: number}> = ({x, y, clickAt = [], scale = 1.6}) => {
  const f = useCurrentFrame();
  const c = clickAt.map((a) => f - a).find((d) => d >= 0 && d < 12);
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale * (c !== undefined && c < 4 ? 0.88 : 1)})`, transformOrigin: '0 0', zIndex: 50}}>
    {c !== undefined && <div style={{position: 'absolute', left: -22 + 4, top: -22 + 4, width: 44, height: 44, borderRadius: 22, border: '3px solid rgba(91,108,255,0.8)', transform: `scale(${0.3 + c / 8})`, opacity: 1 - c / 12}} />}
    <svg width="26" height="34" viewBox="0 0 26 34"><path d="M2 2 L2 27 L8.5 21 L13 31 L17 29.2 L12.6 19.6 L21 19.6 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
  </div>;
};

// ---------- Chrome-like browser window ----------
export const Browser: React.FC<{w: number; h: number; url: string; title: string; favicon?: React.ReactNode; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, url, title, favicon, dark, children, style}) => (
  <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', background: dark ? '#202124' : '#fff', boxShadow: '0 50px 120px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)', fontFamily: F.ui, display: 'flex', flexDirection: 'column', ...style}}>
    <div style={{height: 46, background: dark ? '#202124' : '#DEE1E6', display: 'flex', alignItems: 'flex-end', paddingLeft: 16, gap: 12}}>
      <div style={{display: 'flex', gap: 8, alignSelf: 'center'}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}</div>
      <div style={{marginLeft: 12, height: 36, padding: '0 16px', minWidth: 230, borderRadius: '10px 10px 0 0', background: dark ? '#35363A' : '#fff', display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, color: dark ? '#E8EAED' : '#3C4043'}}>{favicon}<span style={{whiteSpace: 'nowrap'}}>{title}</span><span style={{marginLeft: 'auto', opacity: 0.6, fontSize: 14}}>✕</span></div>
      <div style={{alignSelf: 'center', fontSize: 20, color: dark ? '#9AA0A6' : '#5F6368'}}>+</div>
    </div>
    <div style={{height: 44, background: dark ? '#35363A' : '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', borderBottom: dark ? '1px solid #3c3c3c' : '1px solid #E3E5E8'}}>
      <span style={{color: dark ? '#9AA0A6' : '#5F6368', fontSize: 18}}>←&nbsp;&nbsp;→&nbsp;&nbsp;⟳</span>
      <div style={{flex: 1, height: 30, borderRadius: 15, background: dark ? '#202124' : '#F1F3F4', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: dark ? '#E8EAED' : '#202124', gap: 8}}><span style={{opacity: 0.6}}>🔒</span>{url}</div>
    </div>
    <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
  </div>
);

// ---------- Gmail inbox ----------
const MAILS = [
  ['Acme Ltd', 'Invoice INV-2031 — September services', 'Hi, please find attached our invoice for…', '3:58 AM', true],
  ['North & Co', 'Invoice #1046 attached', 'Payment due in 14 days. Thanks for…', '3:41 AM', true],
  ['Bloom Studio', 'INV-882 for logo project', 'Hey! Here is the invoice we talked…', '2:19 AM', true],
  ['Stripe', 'Your payout is on the way', 'A payout of $1,240.00 is expected…', '1:02 AM', false],
  ['Mia (client)', 'Re: revisions + invoice', 'Looks great, sending the invoice…', '12:47 AM', true],
  ['Shopify', 'You have a new order #1046', 'Order from Daniel K. — 2 items…', 'Yesterday', false],
] as const;
export const Gmail: React.FC<{hi?: number; w?: number}> = ({hi = 0, w = 1000}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F6F8FC', fontFamily: F.ui}}>
    <div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px'}}><Logo k="gmail" size={34} /><span style={{fontSize: 24, color: '#444746'}}>Gmail</span>
      <div style={{marginLeft: 40, flex: 1, height: 46, borderRadius: 24, background: '#E9EEF6', display: 'flex', alignItems: 'center', padding: '0 20px', color: '#5F6368', fontSize: 17}}>Search mail&nbsp;&nbsp;<b style={{color: '#1F1F1F'}}>has:attachment invoice</b></div></div>
    <div style={{margin: '4px 14px', background: '#fff', borderRadius: 16, overflow: 'hidden'}}>
      {MAILS.map(([from, subj, snip, time, att], i) => (
        <div key={i} style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', borderBottom: '1px solid #F1F3F4', background: i === hi ? '#C2E7FF' : i < 3 ? '#fff' : '#F8FAFD', fontSize: 17, color: '#1F1F1F'}}>
          <span style={{color: '#C4C7C5'}}>☐ ☆</span>
          <span style={{width: 150, fontWeight: i < 3 ? 700 : 400, whiteSpace: 'nowrap'}}>{from}</span>
          <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}><b style={{fontWeight: i < 3 ? 700 : 500}}>{subj}</b> <span style={{color: '#5F6368'}}>— {snip}</span></span>
          {att && <span style={{fontSize: 13, padding: '4px 10px', borderRadius: 14, border: '1px solid #DADCE0', color: '#444', whiteSpace: 'nowrap'}}>📄 {subj.match(/(INV-?\d+|#\d+)/)?.[0] ?? 'invoice'}.pdf</span>}
          <span style={{width: 86, textAlign: 'right', fontWeight: i < 3 ? 700 : 400, fontSize: 15}}>{time}</span>
        </div>
      ))}
    </div>
  </div>
);

// ---------- Google Sheets ----------
export const Sheets: React.FC<{rows: string[][]; activeRow?: number; pasteAt?: number}> = ({rows, activeRow = -1, pasteAt = 0}) => {
  const f = useCurrentFrame();
  const cols = ['A', 'B', 'C', 'D', 'E'], wds = [70, 210, 230, 160, 170];
  return <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: F.ui}}>
    <div style={{height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px'}}><Logo k="sheets" size={34} /><span style={{fontSize: 21, color: '#1F1F1F'}}>Invoices 2026</span><span style={{marginLeft: 'auto', background: '#C2E7FF', padding: '8px 18px', borderRadius: 18, fontSize: 15, fontWeight: 600}}>Share</span></div>
    <div style={{height: 34, background: '#F9FBFD', borderTop: '1px solid #E1E3E1', borderBottom: '1px solid #E1E3E1', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: '#444'}}><i>fx</i>&nbsp;&nbsp;{activeRow >= 0 ? rows[activeRow]?.[1] : ''}</div>
    <div style={{display: 'flex', background: '#F8F9FA', borderBottom: '1px solid #E1E3E1'}}><div style={{width: 46}} />{cols.map((c, i) => <div key={c} style={{width: wds[i], textAlign: 'center', fontSize: 14, color: '#5F6368', padding: '6px 0', borderLeft: '1px solid #E1E3E1'}}>{c}</div>)}</div>
    {Array.from({length: 12}).map((_, r) => {
      const row = rows[r]; const isNew = r === activeRow; const k = isNew ? ease(f, pasteAt, pasteAt + 5) : 1;
      return <div key={r} style={{display: 'flex', height: 40, borderBottom: '1px solid #E1E3E1', fontSize: 16, color: '#1F1F1F', background: r === 0 ? '#E6F4EA' : undefined}}>
        <div style={{width: 46, textAlign: 'center', fontSize: 13, color: '#5F6368', background: '#F8F9FA', lineHeight: '40px'}}>{r + 1}</div>
        {cols.map((c, i) => <div key={c} style={{width: wds[i], borderLeft: '1px solid #E1E3E1', padding: '0 8px', lineHeight: '40px', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: r === 0 ? 700 : 400, opacity: row ? (isNew ? k : 1) : 1, outline: isNew && i === 1 ? '2px solid #1A73E8' : undefined, outlineOffset: -2, background: isNew && k < 1 ? `rgba(26,115,232,${0.15 * (1 - k)})` : undefined}}>{row?.[i] ?? ''}</div>)}
      </div>;
    })}
  </div>;
};

// ---------- Slack ----------
export const Slack: React.FC<{msgs: {who: string; text: string; time: string; bot?: boolean}[]; showN?: number}> = ({msgs, showN = 99}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', fontFamily: F.ui}}>
    <div style={{width: 220, background: '#3F0E40', color: '#CFC3CF', padding: '18px 14px', fontSize: 17}}><div style={{color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 18}}>Studio HQ</div>{['# general', '# finance', '# clients', '# random'].map((c) => <div key={c} style={{padding: '6px 10px', borderRadius: 6, background: c === '# finance' ? '#1164A3' : undefined, color: c === '# finance' ? '#fff' : undefined}}>{c}</div>)}</div>
    <div style={{flex: 1, background: '#fff', padding: '16px 22px'}}>
      <div style={{fontWeight: 800, fontSize: 20, borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 14}}># finance</div>
      {msgs.slice(0, showN).map((m, i) => <div key={i} style={{display: 'flex', gap: 12, marginBottom: 16}}>
        <div style={{width: 42, height: 42, borderRadius: 8, background: m.bot ? '#fff' : '#E8A87C', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: m.bot ? '1px solid #eee' : undefined}}>{m.bot ? <Img src={staticFile('logo-fansa.png')} style={{width: 34, height: 34, objectFit: 'contain'}} /> : <span style={{fontWeight: 800, color: '#fff'}}>{m.who[0]}</span>}</div>
        <div><div style={{fontSize: 17}}><b>{m.who}</b>{m.bot && <span style={{fontSize: 12, background: '#eee', padding: '1px 5px', borderRadius: 3, marginLeft: 6}}>APP</span>} <span style={{color: '#888', fontSize: 14}}>{m.time}</span></div><div style={{fontSize: 17, color: '#1D1C1D', marginTop: 2}}>{m.text}</div></div>
      </div>)}
    </div>
  </div>
);

// ---------- FansaChat app (chat → build) ----------
export const FansaApp: React.FC<{prompt: string; typeAt: number; sentAt: number; buildAt: number; dark?: boolean}> = ({prompt, typeAt, sentAt, buildAt, dark = true}) => {
  const f = useCurrentFrame();
  const sent = f >= sentAt;
  const txt = sent ? '' : typed(prompt, f - typeAt, 30);
  const bg = dark ? '#0E1022' : '#fff', panel = dark ? '#151833' : '#F6F7FB', ink = dark ? '#EEF0FF' : '#14162B', mute = dark ? '#8C91B8' : '#6B6F86';
  const dots = '.'.repeat(1 + (Math.floor(f / 6) % 3));
  return <div style={{position: 'absolute', inset: 0, display: 'flex', background: bg, fontFamily: F.ui, color: ink}}>
    <div style={{width: 230, background: panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 16}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18}}><Img src={staticFile('logo-fansa.png')} style={{width: 34, height: 34, objectFit: 'contain'}} /><b style={{fontSize: 19}}>FansaChat</b></div>
      {['New chat', 'Workflows', 'Templates', 'Connections', 'Runs'].map((x, i) => <div key={x} style={{padding: '9px 12px', borderRadius: 10, background: i === 0 ? (dark ? '#262B5C' : '#E6E8FF') : undefined, color: i === 0 ? ink : mute}}>{x}</div>)}
    </div>
    <div style={{flex: 1, position: 'relative', padding: '40px 50px'}}>
      {!sent && <div style={{position: 'absolute', top: '30%', left: 0, right: 0, textAlign: 'center'}}><div style={{fontFamily: F.head, fontWeight: 800, fontSize: 44}}>What should I <span style={{fontFamily: F.serif, fontWeight: 400, fontStyle: 'italic', color: '#7C8CFF'}}>automate?</span></div><div style={{color: mute, fontSize: 17, marginTop: 8}}>Describe it in plain English.</div></div>}
      {sent && <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{alignSelf: 'flex-end', maxWidth: 560, background: '#5B6CFF', color: '#fff', padding: '14px 18px', borderRadius: '18px 18px 4px 18px', fontSize: 18, lineHeight: 1.35, transform: `translateY(${(1 - sp(f, sentAt)) * 40}px)`, opacity: sp(f, sentAt)}}>{prompt}</div>
        <div style={{alignSelf: 'flex-start', display: 'flex', gap: 10, alignItems: 'center', background: panel, padding: '12px 16px', borderRadius: 14, fontSize: 17, color: mute, opacity: ease(f, sentAt + 6, sentAt + 12)}}><Img src={staticFile('logo-fansa.png')} style={{width: 24, height: 24, objectFit: 'contain'}} />{f < buildAt + 40 ? `Building your workflow${dots}` : 'Workflow ready ✓ Test run succeeded'}</div>
      </div>}
      <div style={{position: 'absolute', left: 50, right: 50, bottom: 34, minHeight: 64, borderRadius: 18, border: `2px solid ${!sent && f >= typeAt ? '#5B6CFF' : dark ? '#2A2F5E' : '#DADCF0'}`, background: panel, display: 'flex', alignItems: 'center', padding: '10px 70px 10px 20px', fontSize: 19, lineHeight: 1.35}}>
        {txt ? <span>{txt}{!sent && <Caret h={24} />}</span> : <span style={{color: mute}}>Ask FansaChat to automate something…</span>}
        <div style={{position: 'absolute', right: 12, width: 44, height: 44, borderRadius: 22, background: txt.length > 10 ? '#5B6CFF' : dark ? '#2A2F5E' : '#DADCF0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transform: `scale(${f >= sentAt - 3 && f < sentAt + 3 ? 0.85 : 1})`}}>↑</div>
      </div>
    </div>
  </div>;
};

// ---------- workflow canvas ----------
export const Node: React.FC<{k: string; step: string; title: string; sub: string; at: number; ok?: number; x: number; y: number; dark?: boolean}> = ({k, step, title, sub, at, ok, x, y, dark = true}) => {
  const f = useCurrentFrame(); const s = sp(f, at, 30, 12, 180);
  return <div style={{position: 'absolute', left: x, top: y, width: 300, padding: '18px 20px', borderRadius: 22, background: dark ? 'linear-gradient(160deg,#1C2046,#141733)' : '#fff', border: dark ? '1px solid rgba(140,150,255,0.25)' : '1px solid #E6E8F5', boxShadow: dark ? '0 30px 60px -20px rgba(0,0,0,0.7)' : '0 30px 60px -24px rgba(40,40,100,0.35)', display: 'flex', gap: 16, alignItems: 'center', fontFamily: F.ui, transform: `scale(${s}) translateY(${(1 - s) * 40}px)`, opacity: Math.min(1, s * 1.4)}}>
    <AppTile k={k} size={64} dark={dark} />
    <div><div style={{fontSize: 13, letterSpacing: '0.08em', color: '#8C96FF', fontWeight: 700}}>{step}</div><div style={{fontSize: 23, fontWeight: 800, color: dark ? '#fff' : '#14162B'}}>{title}</div><div style={{fontSize: 15, color: dark ? '#9AA0C8' : '#6B6F86'}}>{sub}</div></div>
    {ok !== undefined && f >= ok && <div style={{position: 'absolute', right: -14, top: -14, width: 40, height: 40, borderRadius: 20, background: '#22C55E', color: '#fff', fontWeight: 900, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sp(f, ok, 30, 9, 260)})`, boxShadow: '0 0 30px rgba(34,197,94,0.7)'}}>✓</div>}
  </div>;
};
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; dur?: number; color?: string}> = ({x1, y1, x2, y2, at, dur = 10, color = '#7C8CFF'}) => {
  const f = useCurrentFrame(); const k = ease(f, at, at + dur);
  const d = `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`;
  const flow = (f * 3) % 40;
  return <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%">
    <path d={d} stroke={color} strokeOpacity={0.25} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${k} 1`} />
    <path d={d} stroke={color} strokeWidth={4} fill="none" strokeDasharray="10 30" strokeDashoffset={-flow} opacity={k >= 1 ? 1 : 0} />
  </svg>;
};

// ---------- macOS terminal ----------
export const Terminal: React.FC<{lines: [number, string, string?][]; w?: number; h?: number; title?: string}> = ({lines, w = 900, h = 520, title = 'fansachat — build'}) => {
  const f = useCurrentFrame();
  const shown = lines.filter(([at]) => f >= at);
  const maxLines = Math.floor((h - 60) / 34);
  return <div style={{width: w, height: h, borderRadius: 16, overflow: 'hidden', background: 'rgba(14,16,30,0.94)', backdropFilter: 'blur(20px)', boxShadow: '0 50px 100px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)', fontFamily: F.mono}}>
    <div style={{height: 40, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />)}<span style={{margin: '0 auto', color: '#9AA0B8', fontSize: 14, fontFamily: F.ui}}>{title}</span></div>
    <div style={{padding: '14px 20px', fontSize: 21, lineHeight: '34px'}}>
      {shown.slice(-maxLines).map(([at, t, c], i, arr) => <div key={at + t} style={{color: c ?? '#C8D0FF', whiteSpace: 'pre', opacity: ease(f, at, at + 3)}}>{t}{i === arr.length - 1 && Math.floor(f / 8) % 2 ? '▋' : ''}</div>)}
    </div>
  </div>;
};

// ---------- iOS notification (branded FansaChat) ----------
export const Notif: React.FC<{title: string; body: string; time?: string; at: number; y: number; app?: string}> = ({title, body, time = 'now', at, y, app = 'FANSACHAT'}) => {
  const f = useCurrentFrame(); const s = sp(f, at, 30, 13, 170);
  return <div style={{position: 'absolute', left: 60, right: 60, top: y, transform: `translateY(${(1 - s) * -120}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.5), padding: '20px 24px', borderRadius: 30, background: 'rgba(245,246,255,0.78)', backdropFilter: 'blur(28px) saturate(1.6)', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.5)', display: 'flex', gap: 18, alignItems: 'center', fontFamily: F.ui}}>
    <div style={{width: 64, height: 64, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.12)'}}><Img src={staticFile('logo-fansa.png')} style={{width: 52, height: 52, objectFit: 'contain'}} /></div>
    <div style={{flex: 1}}><div style={{display: 'flex', fontSize: 17, color: '#555', letterSpacing: '0.04em'}}><span>{app}</span><span style={{marginLeft: 'auto'}}>{time}</span></div><div style={{fontSize: 25, fontWeight: 700, color: '#111'}}>{title}</div><div style={{fontSize: 22, color: '#333'}}>{body}</div></div>
  </div>;
};

// ---------- keycap ----------
export const Key: React.FC<{label: string; size?: number; down?: boolean; style?: React.CSSProperties}> = ({label, size = 120, down, style}) => (
  <div style={{width: label.length > 1 ? size * 1.5 : size, height: size, borderRadius: size * 0.22, background: 'linear-gradient(180deg,#2A2D3E,#15172A)', boxShadow: down ? '0 2px 0 #06070F, inset 0 1px 0 rgba(255,255,255,0.15)' : '0 10px 0 #06070F, 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.18)', transform: `translateY(${down ? 8 : 0}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8EBFF', fontFamily: F.ui, fontWeight: 600, fontSize: size * 0.34, ...style}}>{label}</div>
);
