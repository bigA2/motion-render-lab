// Shared kit for the 100 designed posters: fonts, palette, rich text, fitted type, logos, heroes, brand row.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as anton} from '@remotion/google-fonts/Anton';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as instr} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as brico} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as space} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as syne} from '@remotion/google-fonts/Syne';
import {loadFont as unb} from '@remotion/google-fonts/Unbounded';
import {loadFont as dms} from '@remotion/google-fonts/DMSerifDisplay';
import {loadFont as cav} from '@remotion/google-fonts/Caveat';
import {loadFont as arch} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as play} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as mont} from '@remotion/google-fonts/Montserrat';
import {loadFont as frau} from '@remotion/google-fonts/Fraunces';
import {loadFont as jet} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as px} from '@remotion/google-fonts/PressStart2P';
import {loadFont as beb} from '@remotion/google-fonts/BebasNeue';
import LOGOS from './logos.json';

const o = {subsets: ['latin']};
export const F = {
  anton: anton('normal', {weights: ['400'], ...o}).fontFamily,
  inter: inter('normal', {weights: ['400', '500', '600', '800'], ...o}).fontFamily,
  serif: instr('italic', {weights: ['400'], ...o}).fontFamily,
  serifUp: instr('normal', {weights: ['400'], ...o}).fontFamily,
  brico: brico('normal', {weights: ['500', '800'], ...o}).fontFamily,
  space: space('normal', {weights: ['400', '700'], ...o}).fontFamily,
  syne: syne('normal', {weights: ['700', '800'], ...o}).fontFamily,
  unb: unb('normal', {weights: ['400', '800'], ...o}).fontFamily,
  dms: dms('normal', {weights: ['400'], ...o}).fontFamily,
  dmsI: dms('italic', {weights: ['400'], ...o}).fontFamily,
  cav: cav('normal', {weights: ['500', '700'], ...o}).fontFamily,
  arch: arch('normal', {weights: ['400'], ...o}).fontFamily,
  play: play('normal', {weights: ['700', '900'], ...o}).fontFamily,
  playI: play('italic', {weights: ['400'], ...o}).fontFamily,
  mont: mont('normal', {weights: ['500', '800'], ...o}).fontFamily,
  frau: frau('normal', {weights: ['600', '800'], ...o}).fontFamily,
  frauI: frau('italic', {weights: ['400'], ...o}).fontFamily,
  mono: jet('normal', {weights: ['400', '700'], ...o}).fontFamily,
  pix: px('normal', {weights: ['400'], ...o}).fontFamily,
  bebas: beb('normal', {weights: ['400'], ...o}).fontFamily,
};
// display family, weight, body family, accent family, uppercase?, average glyph width (em) for fitting
type Pair = {d: string; w: number; b: string; a: string; up?: boolean; cw: number; lh: number};
export const PAIRS: Record<string, Pair> = {
  A: {d: F.anton, w: 400, b: F.inter, a: F.serif, up: true, cw: 0.46, lh: 0.95},
  B: {d: F.brico, w: 800, b: F.inter, a: F.serif, cw: 0.56, lh: 0.98},
  S: {d: F.syne, w: 800, b: F.space, a: F.serif, cw: 0.66, lh: 0.98},
  U: {d: F.unb, w: 800, b: F.inter, a: F.serif, cw: 0.78, lh: 1.02},
  D: {d: F.dms, w: 400, b: F.inter, a: F.dmsI, cw: 0.5, lh: 1.02},
  IS: {d: F.serifUp, w: 400, b: F.inter, a: F.serif, cw: 0.42, lh: 1.0},
  F: {d: F.frau, w: 800, b: F.inter, a: F.frauI, cw: 0.56, lh: 1.0},
  P: {d: F.play, w: 900, b: F.mont, a: F.playI, cw: 0.56, lh: 1.0},
  BB: {d: F.bebas, w: 400, b: F.inter, a: F.serif, up: true, cw: 0.4, lh: 0.92},
  AB: {d: F.arch, w: 400, b: F.inter, a: F.serif, cw: 0.66, lh: 0.98},
  M: {d: F.mono, w: 700, b: F.mono, a: F.serif, cw: 0.6, lh: 1.08},
  X: {d: F.pix, w: 400, b: F.mono, a: F.pix, up: true, cw: 1.0, lh: 1.35},
  C: {d: F.cav, w: 700, b: F.inter, a: F.cav, cw: 0.42, lh: 1.0},
};

export type Spec = {id: string; r: string; style: string; aud: string; head: string; sub: string; t: string; apps: string[]; hero: string; font: string; ratio: number; dark: boolean; x: Record<string, any>; pal: string[]};
export const W = 1080, H = 1350, M = 64;

// palette helpers
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
export const lum = (c: string) => { const [r, g, b] = hx(c).map((v) => v / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const onC = (c: string) => (lum(c) > 0.55 ? '#121212' : '#F7F5F0');
export type Theme = {main: string; acc: string; neu: string; con: string; bg: string; ink: string; soft: string; card: string};
export const theme = (s: Spec): Theme => {
  const [main, acc, neu, con] = s.pal;
  const bg = s.dark ? mix(con, '#05060A', 0.55) : mix(neu, '#FFFFFF', 0.72);
  const ink = s.dark ? '#F5F3EE' : '#121212';
  return {main, acc, neu, con, bg, ink, soft: s.dark ? 'rgba(245,243,238,0.62)' : 'rgba(18,18,18,0.6)', card: s.dark ? mix(bg, '#FFFFFF', 0.07) : '#FFFFFF'};
};
// modular type scale: base 22px (meta) × ratio^n
export const ts = (s: Spec, n: number) => Math.round(22 * Math.pow(s.ratio, n));

// rich headline: "|" = line break, *x* = accent (serif italic, accent colour)
export const lines = (h: string) => h.split('|');
const plain = (l: string) => l.replace(/\*/g, '');
export const fit = (s: Spec, ls: string[], maxW: number, maxSize: number, pair?: Pair) => {
  const p = pair ?? PAIRS[s.font] ?? PAIRS.B;
  const longest = Math.max(...ls.map((l) => plain(l).length), 1);
  return Math.floor(Math.min(maxSize, maxW / (longest * p.cw)));
};
export const Rich: React.FC<{s: Spec; text: string; size: number; color: string; acc?: string; align?: 'left' | 'center' | 'right'; pair?: Pair; style?: React.CSSProperties; upper?: boolean}> = ({s, text, size, color, acc, align = 'left', pair, style, upper}) => {
  const p = pair ?? PAIRS[s.font] ?? PAIRS.B;
  const up = upper ?? p.up;
  return <div style={{fontFamily: p.d, fontWeight: p.w, fontSize: size, lineHeight: p.lh, color, textAlign: align, letterSpacing: p.d === F.anton || p.d === F.bebas ? '0.005em' : '-0.03em', textTransform: up ? 'uppercase' : 'none', ...style}}>
    {lines(text).map((l, i) => <div key={i} style={{whiteSpace: 'nowrap'}}>{l.split(/(\*[^*]+\*)/).map((seg, j) => seg.startsWith('*') ? <span key={j} style={{fontFamily: p.a, fontWeight: 400, fontStyle: 'italic', color: acc ?? color, textTransform: 'none', letterSpacing: '-0.01em'}}>{seg.slice(1, -1)}</span> : <span key={j}>{seg}</span>)}</div>)}
  </div>;
};
export const Txt: React.FC<{f?: string; w?: number; size: number; c: string; s?: React.CSSProperties; children: React.ReactNode}> = ({f = F.inter, w = 500, size, c, s, children}) => <div style={{fontFamily: f, fontWeight: w, fontSize: size, color: c, lineHeight: 1.32, ...s}}>{children}</div>;
export const Meta: React.FC<{c: string; s?: React.CSSProperties; children: React.ReactNode}> = ({c, s, children}) => <div style={{position: 'absolute', fontFamily: F.inter, fontWeight: 600, fontSize: 20, letterSpacing: 1.6, textTransform: 'uppercase', color: c, ...s}}>{children}</div>;

export const appName = (a: string) => a.replace(/ Bot$/, '').replace(/ Forms$/, '').replace(/ Cloud$/, '').replace(/ Online$/, '').replace(/ SMS$/, '').replace(/ Leads$/, '').replace(/ Analytics$/, '').replace('Anthropic Claude', 'Claude').replace('Microsoft ', '').replace('ConvertKit', 'Kit');
export const Logo: React.FC<{app: string; size: number; bg?: string; ring?: string; radius?: number}> = ({app, size, bg = '#FFFFFF', ring, radius}) => {
  const f = (LOGOS as Record<string, string | null>)[app];
  return <div style={{width: size, height: size, borderRadius: radius ?? size * 0.26, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: ring ? `0 0 0 2px ${ring}` : '0 6px 18px rgba(0,0,0,0.14)', flexShrink: 0, overflow: 'hidden'}}>
    {f ? <Img src={staticFile(`logos/ap/${f}`)} style={{width: size * 0.64, height: size * 0.64, objectFit: 'contain'}} /> : <span style={{fontFamily: F.inter, fontWeight: 800, fontSize: size * 0.36, color: '#222'}}>{app.slice(0, 1)}</span>}
  </div>;
};
export const Chip: React.FC<{app: string; c: string; bg: string; size?: number}> = ({app, c, bg, size = 26}) => <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: `${size * 0.3}px ${size * 0.6}px ${size * 0.3}px ${size * 0.3}px`, borderRadius: 999, background: bg, color: c, fontFamily: F.inter, fontWeight: 600, fontSize: size}}><Logo app={app} size={size * 1.5} radius={size * 0.75} />{appName(app)}</div>;
export const Hero3D: React.FC<{hero: string; size: number; x: number; y: number; rot?: number; filter?: string; shadow?: string}> = ({hero, size, x, y, rot = 0, filter = '', shadow = 'rgba(0,0,0,0.35)'}) => {
  const [, n, st] = hero.split(':');
  return <Img src={staticFile(`heroes/${n}-${st}.png`)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${rot}deg)`, filter: `${filter} drop-shadow(0 50px 50px ${shadow})`}} />;
};
export const FLogo: React.FC<{size: number; tile?: string}> = ({size, tile = '#FFFFFF'}) => <div style={{width: size, height: size, borderRadius: size * 0.26, background: tile, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.18)'}}><Img src={staticFile('logo-fansa.png')} style={{width: size * 0.78, height: size * 0.78, objectFit: 'contain'}} /></div>;
export const Brand: React.FC<{c: string; x?: number; y?: number; right?: string}> = ({c, x = M, y = H - 98, right}) => <>
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 12}}><FLogo size={46} /><span style={{fontFamily: F.inter, fontWeight: 800, fontSize: 26, color: c}}>FansaChat</span></div>
  <Meta c={c} s={{right: M, top: y + 13}}>{right ?? 'fansachat.com'}</Meta>
</>;
export const Grain: React.FC<{o?: number; blend?: 'multiply' | 'screen' | 'overlay'}> = ({o = 0.1, blend = 'multiply'}) => <AbsoluteFill style={{opacity: o, mixBlendMode: blend, pointerEvents: 'none'}}><svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg></AbsoluteFill>;
export const Ring: React.FC<{x: number; y: number; c: string; ch?: string}> = ({x, y, c, ch = '+'}) => <div style={{position: 'absolute', left: x, top: y, width: 44, height: 44, borderRadius: 22, border: `2px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c, fontFamily: F.inter, fontSize: 22}}>{ch}</div>;
// the plain-English sentence, as a typed prompt pill
export const Prompt: React.FC<{s: Spec; th: Theme; w?: number; size?: number; style?: React.CSSProperties}> = ({s, th, w = W - 2 * M, size = 24, style}) => <div style={{width: w, padding: '18px 22px', borderRadius: 22, background: th.card, boxShadow: '0 14px 40px rgba(0,0,0,0.16)', display: 'flex', gap: 16, alignItems: 'center', ...style}}>
  <FLogo size={size * 1.8} />
  <div style={{fontFamily: F.inter, fontWeight: 500, fontSize: size, lineHeight: 1.35, color: s.dark ? '#F5F3EE' : '#1A1A1A', flex: 1}}>“{s.t[0].toUpperCase() + s.t.slice(1)}.”</div>
  <div style={{width: size * 1.7, height: size * 1.7, borderRadius: 999, background: th.main, color: onC(th.main), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.inter, fontWeight: 800, fontSize: size}}>↑</div>
</div>;
export const AppRow: React.FC<{apps: string[]; size?: number; c: string; arrow?: string}> = ({apps, size = 64, c, arrow = '→'}) => <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
  {[...new Set(apps)].map((a, i) => <React.Fragment key={a}>{i > 0 && <span style={{fontFamily: F.inter, fontWeight: 600, fontSize: size * 0.42, color: c}}>{arrow}</span>}<Logo app={a} size={size} /></React.Fragment>)}
</div>;
