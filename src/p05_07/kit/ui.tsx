// UI building blocks for realistic, information-dense app mockups (our own drawings; brand logos only from
// public/logos/ap or simple-icons, as elsewhere in this repo). Fictional people and data only. MIT.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import * as si from 'simple-icons';
import {prog, lerp} from './curves';
import {a} from './Living';

export type Th = {panel: string; panel2: string; line: string; ink: string; muted: string; accent: string; hot: string; ok: string; font: string; mono: string; dark: boolean};

export const Logo: React.FC<{name: string; size?: number; round?: number; bg?: string}> = ({name, size = 44, round = 12, bg}) => {
  const png: Record<string, string> = {calendly: 'calendly', pipedrive: 'pipedrive', trello: 'trello', tally: 'tally', clickup: 'clickup', discord: 'discord', telegram: 'telegram-bot', notion: 'notion', slack: 'slack', webhook: 'webhook.svg'};
  if (png[name]) return <div style={{width: size, height: size, borderRadius: round, overflow: 'hidden', background: bg ?? '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,.12)'}}><Img src={staticFile(`logos/ap/${png[name].includes('.') ? png[name] : png[name] + '.png'}`)} style={{width: size * 0.78, height: size * 0.78, objectFit: 'contain'}} /></div>;
  if (name === 'fansa') return <div style={{width: size, height: size, borderRadius: round, background: bg ?? '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Img src={staticFile('logo-fansa.png')} style={{width: size * 0.86, height: size * 0.86}} /></div>;
  const ic = (si as unknown as Record<string, {path: string; hex: string}>)['si' + name[0].toUpperCase() + name.slice(1)];
  return <div style={{width: size, height: size, borderRadius: round, background: bg ?? (ic ? `#${ic.hex}` : '#888'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    {ic && <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}><path d={ic.path} fill={name === 'intercom' ? '#111' : '#fff'} /></svg>}</div>;
};

const AV = ['#F4A261', '#7C8BFF', '#3EE6C1', '#FF7AA8', '#FFC93C', '#5BC0EB', '#9B5DE5', '#F15BB5'];
export const Avatar: React.FC<{name: string; size?: number; ring?: string; idx?: number}> = ({name, size = 40, ring, idx}) => {
  const init = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const c = AV[(idx ?? name.length + name.charCodeAt(0)) % AV.length];
  return <div style={{width: size, height: size, borderRadius: size, background: `linear-gradient(140deg, ${c}, ${a(c, 0.7)})`, color: '#0b0b10', fontWeight: 700, fontSize: size * 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: ring ? `0 0 0 3px ${ring}` : undefined, letterSpacing: 0}}>{init}</div>;
};

export const Tag: React.FC<{c: string; children: React.ReactNode; solid?: boolean; size?: number; style?: React.CSSProperties}> = ({c, children, solid, size = 22, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: `${size * 0.18}px ${size * 0.5}px`, borderRadius: 999, fontSize: size, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', color: solid ? '#fff' : c, background: solid ? c : a(c, 0.13), border: `1.5px solid ${a(c, solid ? 0 : 0.3)}`, ...style}}>{children}</span>
);

/** App window: header with logo + title + meta, body, optional live border. */
export const Win: React.FC<{th: Th; w: number; h?: number; logo?: string; title: string; meta?: React.ReactNode; children: React.ReactNode; live?: boolean; style?: React.CSSProperties; pad?: number}> = ({th, w, h, logo, title, meta, children, style, pad = 28}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 30, background: th.panel, border: `1.5px solid ${th.line}`, boxShadow: th.dark ? '0 40px 80px rgba(0,0,0,.45), 0 8px 18px rgba(0,0,0,.3)' : '0 40px 80px rgba(30,40,70,.18), 0 8px 18px rgba(30,40,70,.10)', fontFamily: th.font, color: th.ink, overflow: 'hidden', ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: `20px ${pad}px`, borderBottom: `1.5px solid ${th.line}`, background: th.panel2}}>
      <div style={{display: 'flex', gap: 8, marginRight: 6}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.9}} />)}</div>
      {logo && <Logo name={logo} size={36} round={9} />}
      <div style={{fontWeight: 700, fontSize: 26}}>{title}</div>
      <div style={{marginLeft: 'auto', fontSize: 22, color: th.muted, display: 'flex', alignItems: 'center', gap: 10}}>{meta}</div>
    </div>
    <div style={{padding: pad}}>{children}</div>
  </div>
);

export const Row: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 12, style}) => <div style={{display: 'flex', alignItems: 'center', gap, ...style}}>{children}</div>;
export const Label: React.FC<{th: Th; children: React.ReactNode; w?: number}> = ({th, children, w = 150}) => <div style={{width: w, flexShrink: 0, fontSize: 22, color: th.muted, fontWeight: 500}}>{children}</div>;

/** Cursor arrow with press squash and a double ripple on each click frame. */
export const Cursor: React.FC<{x: number; y: number; press: number; clicks: number[]; color?: string; ring?: string; o?: number}> = ({x, y, press, clicks, color = '#111', ring = '#6A4CFF', o = 1}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none', zIndex: 50}}>
    {clicks.map((c, i) => [0, 14].map((d) => { const t = (f - c - d) / 36; if (t < 0 || t > 1) return null; const r = lerp(8, 70, prog(t, 0, 1, 'snapOut'));
      return <div key={`${i}-${d}`} style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${ring}`, opacity: 1 - t}} />; }))}
    <svg width="46" height="52" viewBox="0 0 23 26" style={{transform: `scale(${1 - press * 0.16})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.35))'}}>
      <path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.5 14.2 L17 14.2 Z" fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  </div>;
};

/** Toast / notification with app logo, title, line, time. */
export const Toast: React.FC<{th: Th; logo: string; app: string; title: React.ReactNode; line: React.ReactNode; time?: string; w?: number}> = ({th, logo, app, title, line, time = 'now', w = 820}) => (
  <div style={{width: w, borderRadius: 30, padding: '22px 26px', background: th.dark ? a('#1a1d24', 0.92) : a('#ffffff', 0.94), border: `1.5px solid ${th.line}`, boxShadow: '0 30px 60px rgba(20,25,50,.28)', display: 'flex', gap: 18, fontFamily: th.font, color: th.ink}}>
    <Logo name={logo} size={58} round={14} />
    <div style={{flex: 1, minWidth: 0}}>
      <Row style={{justifyContent: 'space-between'}}><span style={{fontSize: 21, fontWeight: 700, color: th.muted, textTransform: 'uppercase', letterSpacing: 1.5}}>{app}</span><span style={{fontSize: 21, color: th.muted}}>{time}</span></Row>
      <div style={{fontSize: 28, fontWeight: 700, marginTop: 4}}>{title}</div>
      <div style={{fontSize: 24, color: th.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{line}</div>
    </div>
  </div>
);

/** Wire between two points with a travelling data dot; p = 0..1 draw, dot = 0..1 travel (or <0 none). */
export const Wire: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; dot?: number; color: string; base: string; bend?: number; width?: number}> = ({x1, y1, x2, y2, p, dot = -1, color, base, bend = 0, width = 5}) => {
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.15;
  const pt = (t: number) => ({x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2});
  const minx = Math.min(x1, x2, mx) - 40, miny = Math.min(y1, y2, my) - 40;
  const D = dot >= 0 && dot <= 1 ? pt(dot) : null;
  return <svg style={{position: 'absolute', left: minx, top: miny, overflow: 'visible'}} width={1} height={1}>
    <g transform={`translate(${-minx} ${-miny})`}>
      <path d={d} stroke={base} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray="2 12" />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={`${len * p} ${len}`} />
      {D && [0.06, 0.03, 0].map((lag, i) => { const q = pt(Math.max(0, dot - lag)); return <circle key={i} cx={q.x} cy={q.y} r={[6, 9, 13][i]} fill={color} opacity={[0.25, 0.5, 1][i]} />; })}
      {D && <circle cx={D.x} cy={D.y} r={26} fill={color} opacity={0.18} />}
    </g>
  </svg>;
};
export const wirePt = (x1: number, y1: number, x2: number, y2: number, t: number, bend = 0) => {
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2;
  return {x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2};
};

/** "Synced ✓" stamp: scales from 1.6 with hit-decay, slight rotation. */
export const Stamp: React.FC<{f0: number; children: React.ReactNode; c: string; size?: number}> = ({f0, children, c, size = 26}) => {
  const f = useCurrentFrame(); if (f < f0) return null; const p = prog(f, f0, 14, 'snapOut');
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, border: `3px solid ${c}`, color: c, fontWeight: 800, fontSize: size, transform: `scale(${lerp(1.7, 1, p)}) rotate(${lerp(-9, -3, p)}deg)`, opacity: Math.min(1, p * 3), background: a(c, 0.08), whiteSpace: 'nowrap'}}>{children}</div>;
};

/** Checklist row that ticks at frame `at`. */
export const Check: React.FC<{th: Th; at?: number; children: React.ReactNode; size?: number; bad?: boolean}> = ({th, at = 1e9, children, size = 26, bad}) => {
  const f = useCurrentFrame(); const p = prog(f, at, 12, 'spring'); const done = f >= at;
  const col = bad ? th.hot : th.ok;
  return <Row gap={14} style={{fontSize: size, color: done && !bad ? th.muted : th.ink, textDecoration: done && !bad ? 'line-through' : undefined}}>
    <div style={{width: size * 1.1, height: size * 1.1, borderRadius: 8, border: `2.5px solid ${done ? col : th.line}`, background: done ? col : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? p : 1})`, color: '#fff', fontWeight: 900, fontSize: size * 0.8}}>{done ? (bad ? '✕' : '✓') : ''}</div>
    <span>{children}</span>
  </Row>;
};
