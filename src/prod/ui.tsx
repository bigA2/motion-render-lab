// Shared bits for the production engine: palette, springs, layout, app tiles, text helpers, backdrop.
import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile} from 'remotion';
import {FONT, Glyph} from '../intro27/ui';
import {ez, lerp} from '../intro28/kit';
import {FPS} from './timeline';

export {FONT, Glyph, ez, lerp};
export const INK = '#221E30', LO = '#6A6580', PERI = '#8B8FE8', PERI_D = '#6468D8', BLUSH = '#F4B8A8', PAPER = '#F7F6F9', DARK = '#100D16';
export const RED = '#E5484D', GREEN = '#2FB67C', AMBER = '#F2B24C';
export const SMOOTH = Easing.inOut(Easing.cubic), CRASH = Easing.bezier(0.16, 1, 0.3, 1);
// the one settle for the whole film: critically damped step response, no bounce
export const settle = (f: number, at: number, w = 14) => { const t = Math.max(0, (f - at) / FPS); return 1 - (1 + w * t) * Math.exp(-w * t); };
export const hash = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- layout: a 900x860 "visual canvas" + a caption zone, per output format ----------
export type Lay = {W: number; H: number; land: boolean; vx: number; vy: number; vs: number};
export const VW = 900, VH = 860;
export const layout = (W: number, H: number): Lay => W > H
  ? {W, H, land: true, vs: 1.12, vx: 1920 - 70 - 900 * 1.12, vy: (1080 - 860 * 1.12) / 2}   // native 16:9: copy left, visual right
  : {W, H, land: false, vs: 1, vx: 90, vy: 46};                                                // 4:5: visual on top, captions below

// ---------- app tiles ----------
const LOGO: Record<string, string> = {jotform: 'jotform.svg', telegram: 'telegram-bot.png', 'telegram-bot': 'telegram-bot.png'};
const HAVE = new Set(['clickup', 'calendly', 'pipedrive', 'xero', 'stripe', 'airtable', 'trello', 'discord', 'tally', 'hubspot', 'typeform', 'jotform', 'telegram', 'gmail']);
export const Tile: React.FC<{k: string; size: number; on?: boolean; dark?: boolean}> = ({k, size, on, dark}) => <div style={{width: size, height: size, borderRadius: size * 0.28, background: on ? 'rgba(47,182,124,0.14)' : dark ? 'rgba(255,255,255,0.08)' : '#F1EFF8', border: '1px solid rgba(32,28,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
  {k === 'filter' ? <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={PERI_D} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>
    : k === 'dm' ? <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke={PERI_D} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4z" /></svg>
    : k === 'mail' ? <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke={PERI_D} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
    : HAVE.has(k) ? <Img src={staticFile(`logos/ap/${LOGO[k] ?? k + '.png'}`)} style={{width: size * 0.6, height: size * 0.6, objectFit: 'contain'}} />
    : <Glyph k={k} size={size * 0.56} color={INK} />}
</div>;

export const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', borderRadius: 44, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: 'inset 0 1.5px 0 #fff, 0 50px 90px -40px rgba(40,30,80,0.38)', boxSizing: 'border-box', ...extra});

// letter write-in: per glyph opacity / rise / blur, 1.5 f stagger
export const Write: React.FC<{text: string; f: number; at: number; style: React.CSSProperties}> = ({text, f, at, style}) =>
  <span style={{...style, whiteSpace: 'nowrap'}}>{text.split('').map((c, i) => { const k = ez(f, at + i * 1.5, at + i * 1.5 + 9); return <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 12}px)`, filter: `blur(${(1 - k) * 8}px)`, whiteSpace: 'pre'}}>{c === ' ' ? <span style={{display: 'inline-block', width: '0.32em'}} /> : c}</span>; })}</span>;

// text measure + greedy wrap (browser canvas; estimate when there is no DOM)
let ctx: CanvasRenderingContext2D | null = null;
export const textW = (t: string, px: number, wt = 500, fam = FONT.ui) => { if (typeof document === 'undefined') return t.length * px * 0.53; ctx = ctx ?? document.createElement('canvas').getContext('2d'); ctx!.font = `${wt} ${px}px ${fam}`; return ctx!.measureText(t).width; };
const wrapCache = new Map<string, string[]>();
export const wrap = (text: string, maxW: number, px: number): string[] => {
  const key = `${text}|${maxW}|${px}`; const hit = wrapCache.get(key); if (hit) return hit;
  const out: string[] = []; let cur = '';
  for (const wd of text.split(' ')) { const nx = cur ? cur + ' ' + wd : wd; if (cur && textW(nx, px) > maxW) { out.push(cur); cur = wd; } else cur = nx; }
  if (cur) out.push(cur); wrapCache.set(key, out); return out;
};

// ---------- backdrop: soft periwinkle/blush aurora + dot grid lit by a travelling wave + faint connectors ----------
const P_ = '139,143,232', PD_ = '100,104,216', B_ = '244,184,168';
const bz = (p: number[][], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
export const Backdrop: React.FC<{f: number; W: number; H: number}> = ({f, W, H}) => {
  const t = f / FPS; const s = Math.min(W, H) / 1080;
  const blob = (x: number, y: number, c: string, a: number, r: number) => `radial-gradient(circle at ${x}% ${y}%, rgba(${c},${a}) 0%, rgba(${c},0) ${r}%)`;
  const aurora = [blob(22 + 14 * Math.sin(t * 0.42), 24 + 10 * Math.cos(t * 0.31), P_, 0.42, 42), blob(80 + 12 * Math.cos(t * 0.37), 30 + 14 * Math.sin(t * 0.45), B_, 0.40, 40), blob(62 + 16 * Math.sin(t * 0.27 + 1), 78 + 10 * Math.cos(t * 0.33), P_, 0.30, 46), blob(18 + 10 * Math.cos(t * 0.49 + 2), 86 + 8 * Math.sin(t * 0.38), B_, 0.30, 38)].join(',');
  const wave = ((t / 6) % 1) * 160 - 30; const mask = `linear-gradient(135deg, rgba(0,0,0,0.10) ${wave - 30}%, rgba(0,0,0,0.65) ${wave}%, rgba(0,0,0,0.10) ${wave + 30}%)`;
  const CV = [{y0: 0.14, y1: 0.34, c: PD_, sp: 1.0, ph: 0}, {y0: 0.78, y1: 0.5, c: B_, sp: 0.8, ph: 1.7}, {y0: 0.42, y1: 0.88, c: P_, sp: 1.2, ph: 3.1}, {y0: 0.98, y1: 0.06, c: PD_, sp: 0.7, ph: 4.4}];
  return <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: aurora, filter: 'blur(30px) saturate(1.1)'}} />
    <AbsoluteFill style={{backgroundImage: `radial-gradient(rgba(${PD_},0.55) ${1.6 * s}px, transparent ${2 * s}px)`, backgroundSize: `${44 * s}px ${44 * s}px`, backgroundPosition: `${(t * 6) % 44}px ${(t * 10) % 44}px`, WebkitMaskImage: mask, maskImage: mask, opacity: 0.5}} />
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs><filter id="pdglow"><feGaussianBlur stdDeviation="5" /></filter></defs>
      {CV.map((c, i) => { const sw = Math.sin(t * 0.35 * c.sp + c.ph) * 0.1 * H; const P = [[-0.07 * W, c.y0 * H], [0.33 * W, c.y0 * H + sw], [0.67 * W, c.y1 * H - sw], [1.07 * W, c.y1 * H]];
        const d = `M${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
        return <g key={i}>
          <path d={d} fill="none" stroke={`rgba(${c.c},0.16)`} strokeWidth={2.5} />
          <path d={d} fill="none" stroke={`rgba(${c.c},0.35)`} strokeWidth={2.5} strokeDasharray="10 26" strokeDashoffset={-f * 2.4 * c.sp} />
          {[0, 1, 2].map((j) => { const k = ((t * 0.16 * c.sp + j / 3 + i * 0.13) % 1); const [x, y] = bz(P, k);
            return <g key={j}><circle cx={x} cy={y} r={14} fill={`rgba(${c.c},0.35)`} filter="url(#pdglow)" /><circle cx={x} cy={y} r={5} fill={`rgba(${c.c},0.85)`} /></g>; })}
        </g>; })}
    </svg>
  </AbsoluteFill>;
};

// small shared pieces
export const Orb: React.FC<{s?: number}> = ({s = 22}) => <span style={{width: s, height: s, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #fff, ${PERI} 45%, ${PERI_D})`, flex: 'none', display: 'inline-block'}} />;
export const Pill: React.FC<{children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = '#fff', fg = INK, size = 30, style}) =>
  <div style={{padding: `${size * 0.4}px ${size * 0.8}px`, borderRadius: 999, background: bg, color: fg, border: '1px solid rgba(32,28,46,0.10)', fontFamily: FONT.ui, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap', ...style}}>{children}</div>;
// red cross that draws on
export const Cross: React.FC<{s?: number; k1: number; k2: number; on: boolean}> = ({s = 84, k1, k2, on}) => <svg width={s} height={s} viewBox="0 0 84 84" style={{flex: 'none'}}>
  <circle cx={42} cy={42} r={36} fill="none" stroke={on ? RED : 'rgba(32,28,46,0.25)'} strokeWidth={4} />
  <path d="M28 28 L56 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k1} fill="none" />
  <path d="M56 28 L28 56" stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k2} fill="none" />
</svg>;
