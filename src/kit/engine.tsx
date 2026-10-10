// FansaChat motion engine: one data spec per video -> a camera-tracked motion-graphics film.
// World = a chain of "slots" (one per beat). The camera FLIES between slots following the hero object
// (orb / Maya), so every transition is a tracked camera move: pan (right/left/down/up), whip, zoom-through, iris.
// Every element animates in on the narrator's words and keeps idling, so nothing is ever static.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as brico} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as instr} from '@remotion/google-fonts/InstrumentSerif';
import * as si from 'simple-icons';
import {Pip, Studio} from '../v3/kit3d';
import {BlurWords, ez, Flip3DGrad, RollText, Tape, typedSlice} from './text';

export const FONT = {
  ui: inter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily,
  head: brico('normal', {weights: ['700', '800'], subsets: ['latin']}).fontFamily,
  serif: instr('italic', {weights: ['400'], subsets: ['latin']}).fontFamily,
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, d = 13, s = 170) => spring({frame: f - at, fps: 30, config: {damping: d, stiffness: s}});

// ---------------- palettes (colour structures, MOTION_COMPONENT_LIBRARY.md §H) ----------------
type Pal = {bg: string[]; ink: string; accent: string; accent2: string; card: string; cardInk: string; sub: string; dark: boolean; bgKind: string; music: string; maya: string; grad: [string, string]};
export const PAL: Record<string, Pal> = {
  B1: {bg: ['#FFFFFF', '#F2EEFF', '#FFE9DF'], ink: '#17122E', accent: '#6468D8', accent2: '#FF7A5A', card: '#FFFFFF', cardInk: '#17122E', sub: '#6A6489', dark: false, bgKind: 'spheres', music: '07_warm-emotional_everything-is-love_komiku.mp3', maya: '#6468D8', grad: ['#6468D8', '#E68C74']},
  B2: {bg: ['#FF9A3D', '#FF6A13', '#FFC77A'], ink: '#1A1206', accent: '#FFFFFF', accent2: '#1A1206', card: '#FFFFFF', cardInk: '#1A1206', sub: '#7A5A3A', dark: false, bgKind: 'shards', music: '07_warm-emotional_everything-is-love_komiku.mp3', maya: '#2D6BFF', grad: ['#FFFFFF', '#FFE2B8']},
  B3: {bg: ['#7CC8FF', '#2F9BFF', '#C9ECFF'], ink: '#06203A', accent: '#FFFFFF', accent2: '#FFD84D', card: '#FFFFFF', cardInk: '#06203A', sub: '#4C6A86', dark: false, bgKind: 'bokeh', music: '04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3', maya: '#FF5A8A', grad: ['#FFFFFF', '#FFE58A']},
  B4: {bg: ['#5BE38F', '#19B866', '#C8FFD9'], ink: '#062A16', accent: '#FFFFFF', accent2: '#0E5132', card: '#FFFFFF', cardInk: '#062A16', sub: '#3F6B52', dark: false, bgKind: 'dots', music: '05_lofi-warm_roof-tops_holiznacc0.mp3', maya: '#FF7A1A', grad: ['#FFFFFF', '#D9FFE6']},
  B5: {bg: ['#C9B8FF', '#8C72FF', '#F1EAFF'], ink: '#1B1240', accent: '#FFFFFF', accent2: '#FFB4D6', card: '#FFFFFF', cardInk: '#1B1240', sub: '#6B5FA0', dark: false, bgKind: 'rings', music: '06_warm-emotional_washed-up_holiznacc0.mp3', maya: '#FF7A1A', grad: ['#FFFFFF', '#FFD3EA']},
  B6: {bg: ['#FFB3A0', '#FF6F61', '#FFE3D9'], ink: '#2A0E0A', accent: '#FFFFFF', accent2: '#2A0E0A', card: '#FFFFFF', cardInk: '#2A0E0A', sub: '#8A5A50', dark: false, bgKind: 'confetti', music: '07_warm-emotional_everything-is-love_komiku.mp3', maya: '#2D6BFF', grad: ['#FFFFFF', '#FFE0D6']},
  B7: {bg: ['#FFE15C', '#FFC800', '#FFF4BD'], ink: '#0B1D5C', accent: '#2C4BFF', accent2: '#FF4D6D', card: '#FFFFFF', cardInk: '#0B1D5C', sub: '#5A6290', dark: false, bgKind: 'stickers', music: '01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3', maya: '#2C4BFF', grad: ['#2C4BFF', '#FF4D6D']},
  B8: {bg: ['#B8F5DE', '#3FD3A0', '#E9FFF6'], ink: '#073B2C', accent: '#073B2C', accent2: '#B6FF3D', card: '#FFFFFF', cardInk: '#073B2C', sub: '#3E7A66', dark: false, bgKind: 'aurora', music: '03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3', maya: '#7C4DFF', grad: ['#073B2C', '#3FD3A0']},
  D1: {bg: ['#2B1F6E', '#120C34', '#3D2A9A'], ink: '#FFFFFF', accent: '#B4A9FF', accent2: '#FF9E7A', card: '#1E1750', cardInk: '#FFFFFF', sub: '#A8A2D8', dark: true, bgKind: 'aurora', music: '04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3', maya: '#FF9E7A', grad: ['#B4A9FF', '#FF9E7A']},
  D2: {bg: ['#0B2350', '#050B1E', '#0E3A6E'], ink: '#FFFFFF', accent: '#3DE0FF', accent2: '#7CFFB2', card: '#0F1B3D', cardInk: '#FFFFFF', sub: '#8FA6D0', dark: true, bgKind: 'code', music: '01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3', maya: '#3DE0FF', grad: ['#3DE0FF', '#7CFFB2']},
  D3: {bg: ['#2A211C', '#120E0B', '#3A2414'], ink: '#FFFFFF', accent: '#FF8A3D', accent2: '#FFD27A', card: '#221A15', cardInk: '#FFFFFF', sub: '#B9A08A', dark: true, bgKind: 'embers', music: '01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3', maya: '#FF8A3D', grad: ['#FF8A3D', '#FFD27A']},
  D4: {bg: ['#0E3B22', '#06180E', '#145232'], ink: '#FFFFFF', accent: '#B6FF3D', accent2: '#5BE38F', card: '#0F2A1A', cardInk: '#FFFFFF', sub: '#9CC4A8', dark: true, bgKind: 'grid', music: '02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3', maya: '#B6FF3D', grad: ['#B6FF3D', '#5BE38F']},
};

// ---------------- spec types ----------------
export type El = {t: string; x?: number; y?: number; w?: number; s?: number; d?: number; word?: string; p45?: {x?: number; y?: number; w?: number; s?: number}; [k: string]: unknown};
export type Beat = {line?: number; dur?: number; hold?: number; go?: 'right' | 'left' | 'down' | 'up' | 'zoom' | 'whip' | 'iris'; hero?: {x: number; y: number; mood?: string; size?: number; who?: 'orb' | 'maya'; expr?: string}; els: El[]; focus?: [number, number]};
export type Spec = {id: string; pal: string; lines: string[]; beats: Beat[]; music?: string};
export type Vo = {file: string; dur: number; words: {w: string; s: number; e: number}[]}[];

const ICON: Record<string, {path: string; hex: string}> = {};
const ICON_KEYS: Record<string, string> = {gmail: 'siGmail', sheets: 'siGooglesheets', slack: 'siSlack', telegram: 'siTelegram', notion: 'siNotion', trello: 'siTrello', shopify: 'siShopify', stripe: 'siStripe', hubspot: 'siHubspot', discord: 'siDiscord', whatsapp: 'siWhatsapp', drive: 'siGoogledrive', dropbox: 'siDropbox', airtable: 'siAirtable', asana: 'siAsana', calendly: 'siCalendly', zoom: 'siZoom', gcal: 'siGooglecalendar', mailchimp: 'siMailchimp', figma: 'siFigma', canva: 'siCanva', instagram: 'siInstagram', youtube: 'siYoutube', xero: 'siXero', quickbooks: 'siQuickbooks', salesforce: 'siSalesforce', jira: 'siJira', github: 'siGithub', linear: 'siLinear', clickup: 'siClickup', typeform: 'siTypeform', woo: 'siWoocommerce', paypal: 'siPaypal', wise: 'siWise', toggl: 'siToggl', upwork: 'siUpwork', fiverr: 'siFiverr', x: 'siX', threads: 'siThreads', linkedin: 'siLinkedin', tiktok: 'siTiktok', facebook: 'siFacebook', zendesk: 'siZendesk', intercom: 'siIntercom', freshdesk: 'siFreshdesk', gitlab: 'siGitlab', vercel: 'siVercel', openai: 'siOpenai', claude: 'siClaude', monday: 'siMondaydotcom', pinterest: 'siPinterest', squarespace: 'siSquarespace', wix: 'siWix', webflow: 'siWebflow', docusign: 'siDocusign', googledocs: 'siGoogledocs', googleforms: 'siGoogleforms', outlook: 'siMicrosoftoutlook', teams: 'siMicrosoftteams', excel: 'siMicrosoftexcel', bitbucket: 'siBitbucket', sentry: 'siSentry', etsy: 'siEtsy', amazon: 'siAmazon', klaviyo: 'siKlaviyo', ebay: 'siEbay', lemon: 'siLemonsqueezy', gumroad: 'siGumroad', patreon: 'siPatreon', spotify: 'siSpotify', twitch: 'siTwitch', medium: 'siMedium', substack: 'siSubstack', wordpress: 'siWordpress', ghost: 'siGhost', bufferapp: 'siBuffer', zapierless: 'siZapier'};
for (const [k, v] of Object.entries(ICON_KEYS)) { const ic = (si as unknown as Record<string, {path: string; hex: string}>)[v]; if (ic) ICON[k] = ic; }
const lum = (h: string) => { const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
export const Icon: React.FC<{k: string; size: number; dark?: boolean}> = ({k, size, dark}) => {
  const i = ICON[k];
  if (!i) return <span style={{fontSize: size * 0.85, lineHeight: 1}}>{k}</span>;
  const fill = dark && lum(i.hex) < 0.22 ? '#FFFFFF' : '#' + i.hex;
  return <svg viewBox="0 0 24 24" width={size} height={size}><path d={i.path} fill={fill} /></svg>;
};
const Tile: React.FC<{k: string; size: number; P: Pal}> = ({k, size, P}) => <div style={{width: size, height: size, borderRadius: size * 0.26, background: P.dark ? 'linear-gradient(160deg,#2A2F55,#161A33)' : 'linear-gradient(160deg,#FFFFFF,#F1F1F7)', boxShadow: P.dark ? '0 18px 36px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)' : '0 18px 36px -14px rgba(40,30,80,0.4), inset 0 1px 0 #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><Icon k={k} size={size * 0.54} dark={P.dark} /></div>;

// ---------------- backgrounds ----------------
const Bg: React.FC<{P: Pal}> = ({P}) => {
  const f = useCurrentFrame();
  const [a, b, c] = P.bg;
  const kind = P.bgKind;
  const items = (n: number, draw: (i: number, r: (k: string) => number) => React.ReactNode) => Array.from({length: n}).map((_, i) => draw(i, (k: string) => random(`${kind}${i}${k}`)));
  return <AbsoluteFill style={{background: `radial-gradient(70% 60% at ${40 + Math.sin(f / 70) * 12}% ${35 + Math.cos(f / 80) * 10}%, ${c}, transparent 70%), radial-gradient(60% 60% at ${75 + Math.cos(f / 60) * 10}% 80%, ${b}, transparent 70%), linear-gradient(160deg, ${a}, ${b})`}}>
    {kind === 'shards' || kind === 'confetti' ? items(28, (i, r) => <div key={i} style={{position: 'absolute', left: `${r('x') * 110 - 5}%`, top: `${((r('y') * 120 + f * (0.04 + r('v') * 0.08)) % 120) - 10}%`, width: 14 + r('w') * 26, height: kind === 'confetti' ? 14 + r('h') * 14 : 6 + r('h') * 10, borderRadius: kind === 'confetti' ? '50%' : 3, background: ['#FFFFFF', P.accent2, P.grad[1], P.ink][Math.floor(r('c') * 4)], opacity: 0.16 + r('o') * 0.3, transform: `rotate(${r('a') * 360 + f * (r('s') - 0.5) * 2}deg) skewX(-18deg)`}} />) : null}
    {kind === 'bokeh' || kind === 'spheres' ? items(16, (i, r) => <div key={i} style={{position: 'absolute', left: `${r('x') * 100}%`, top: `${r('y') * 100 + Math.sin(f / 50 + i) * 2}%`, width: 60 + r('s') * 220, height: 60 + r('s') * 220, borderRadius: '50%', background: kind === 'spheres' ? `radial-gradient(circle at 35% 30%, #FFFFFF, ${[P.accent, P.accent2, P.grad[1]][i % 3]} 70%)` : 'radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)', opacity: kind === 'spheres' ? 0.35 : 0.5, filter: `blur(${r('b') * 10}px)`}} />) : null}
    {kind === 'dots' || kind === 'grid' ? <AbsoluteFill style={{backgroundImage: kind === 'dots' ? `radial-gradient(${P.dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.45)'} 2px, transparent 2px)` : `linear-gradient(${P.accent}22 1px, transparent 1px), linear-gradient(90deg, ${P.accent}22 1px, transparent 1px)`, backgroundSize: kind === 'dots' ? '38px 38px' : '64px 64px', transform: `translate(${-f * 0.4}px, ${-f * 0.2}px)`}} /> : null}
    {kind === 'rings' ? items(5, (i) => <div key={i} style={{position: 'absolute', left: '50%', top: '50%', width: 600, height: 600, marginLeft: -300, marginTop: -300, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', transform: `scale(${0.4 + i * 0.5 + ((f / 90) % 1) * 0.5})`, opacity: 0.6 - i * 0.1}} />) : null}
    {kind === 'aurora' ? items(3, (i) => <div key={i} style={{position: 'absolute', left: '-20%', right: '-20%', top: `${20 + i * 25}%`, height: 220, background: `linear-gradient(90deg, transparent, ${[P.accent, P.accent2, P.grad[1]][i]}66, transparent)`, filter: 'blur(40px)', transform: `translateX(${Math.sin(f / 60 + i * 2) * 15}%) skewY(-8deg)`}} />) : null}
    {kind === 'code' ? items(26, (i, r) => <div key={i} style={{position: 'absolute', left: `${r('x') * 100}%`, top: `${((r('y') * 120 + f * 0.15 * (0.5 + r('v'))) % 120) - 10}%`, fontFamily: 'monospace', fontSize: 14 + r('s') * 14, color: [P.accent, P.accent2, '#FFFFFF'][i % 3], opacity: 0.12 + r('o') * 0.2, filter: `blur(${r('b') * 2.5}px)`, whiteSpace: 'nowrap'}}>{['await run(flow)', 'trigger: webhook', '✓ test passed', 'step.next()', 'if (paid) notify()', '{ "ok": true }'][i % 6]}</div>) : null}
    {kind === 'embers' ? items(30, (i, r) => <div key={i} style={{position: 'absolute', left: `${r('x') * 100}%`, top: `${100 - ((r('y') * 120 + f * 0.25 * (0.5 + r('v'))) % 120)}%`, width: 4 + r('s') * 6, height: 4 + r('s') * 6, borderRadius: '50%', background: P.accent, boxShadow: `0 0 12px ${P.accent}`, opacity: 0.25 + r('o') * 0.5}} />) : null}
    {kind === 'stickers' ? items(12, (i, r) => <div key={i} style={{position: 'absolute', left: `${r('x') * 95}%`, top: `${r('y') * 92 + Math.sin(f / 40 + i) * 1.2}%`, transform: `rotate(${(r('a') - 0.5) * 30}deg)`, opacity: 0.22}}><Icon k={['notion', 'slack', 'stripe', 'figma', 'trello', 'hubspot'][i % 6]} size={60 + r('s') * 40} /></div>) : null}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '6px 6px', opacity: P.dark ? 0.25 : 0.15, mixBlendMode: 'overlay'}} />
  </AbsoluteFill>;
};

// ---------------- characters ----------------
const Orb: React.FC<{size: number; mood?: string; squash?: number}> = ({size, mood = 'happy', squash = 0}) => {
  const f = useCurrentFrame();
  const blink = Math.max(0, 1 - Math.abs(((f + 13) % 70) - 3) / 3);
  const S = Math.round(size * 1.6);
  return <div style={{width: S, height: S, marginLeft: -S / 2, marginTop: -S / 2, filter: 'drop-shadow(0 30px 34px rgba(30,20,80,0.35))'}}>
    <ThreeCanvas width={S} height={S} camera={{position: [0, 0, 5.4], fov: 32}} gl={{alpha: true, antialias: true}}>
      <Studio />
      <Pip mood={mood as 'happy'} squash={squash + Math.sin(f / 9) * 0.02} blink={blink} look={[Math.sin(f / 40) * 0.2, 0.1]} tilt={Math.sin(f / 22) * 0.08} />
    </ThreeCanvas>
  </div>;
};
// Maya: Open Peeps (CC0) bust, recoloured BRIGHT (clothes = palette colour, white sticker outline); hair kept.
// Talking = switching to the open-mouth 'explaining' pose on the narrator's syllables; hop + bob always on.
const Maya: React.FC<{size: number; expr?: string; talk?: boolean; color: string}> = ({size, expr = 'smileBig', talk, color}) => {
  const f = useCurrentFrame();
  const mouth = talk && Math.floor(f / 4) % 3 !== 0 ? 'explaining' : expr;
  const blink = (f + 7) % 90 < 3 && !talk ? 'eyesClosed' : mouth;
  const bob = Math.sin(f / 7) * 0.012;
  return <div style={{width: size, height: size, marginLeft: -size / 2, marginTop: -size * 0.9, transform: `scale(${1 - bob}, ${1 + bob}) rotate(${Math.sin(f / 30) * 2}deg)`, transformOrigin: '50% 100%'}}>
    <div style={{position: 'absolute', inset: '12% 10% 0', borderRadius: '50% 50% 30% 30%', background: color, opacity: 0.95, boxShadow: '0 0 0 10px #FFFFFF, 0 30px 50px -20px rgba(0,0,0,0.4)'}} />
    <Img src={staticFile(`maya/${blink}.svg`)} style={{position: 'absolute', inset: 0, width: size, height: size, filter: `drop-shadow(0 0 0 #fff) hue-rotate(0deg)`}} />
  </div>;
};

// ---------------- element library ----------------
type Ctx = {P: Pal; w: boolean; at: number; lf: number; W: number; H: number; wordAt: (word?: string) => number; sc: number};
const glass = (P: Pal): React.CSSProperties => ({background: P.dark ? 'rgba(255,255,255,0.07)' : P.card, border: P.dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.95)', borderRadius: 30, boxShadow: P.dark ? '0 40px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 40px 80px -30px rgba(40,20,0,0.35), inset 0 1px 0 #fff', backdropFilter: 'blur(14px)'});

const EL: Record<string, React.FC<{e: El; c: Ctx; a: number}>> = {
  // headline: style roll | flip | blur | tape
  title: ({e, c, a}) => {
    const {P} = c; const size = ((e.size as number) ?? 110) * c.sc; const st = (e.style as string) ?? 'blur';
    const col = (e.color as string) ?? P.ink;
    if (st === 'roll') return <RollText text={e.text as string} from={e.from as string | undefined} at={a} size={size} color={col} font={FONT.head} />;
    if (st === 'flip') return <Flip3DGrad text={e.text as string} at={a} flipAt={e.flipAt !== undefined ? c.at + (e.flipAt as number) : a + 26} size={size} color={col} font={FONT.head} grad={P.grad} />;
    if (st === 'tape') return <Tape text={e.text as string} at={a} bg={(e.bg as string) ?? P.ink} color={(e.fg as string) ?? (P.dark ? P.ink : '#FFFFFF')} size={size} font={FONT.head} rot={(e.rot as number) ?? -4} />;
    return <BlurWords text={e.text as string} at={a} size={size} color={col} font={FONT.head} em={(e.em as string[]) ?? []} accent={P.dark ? P.accent : P.accent === '#FFFFFF' ? '#FFFFFF' : P.accent} align={(e.align as 'left') ?? 'center'} style={{maxWidth: (e.maxW as number ?? 1500) * c.sc}} />;
  },
  // glass card with icon + title + sub (+badge)
  card: ({e, c, a}) => {
    const {P} = c; const s = sp(c.lf, a, 12, 190); const W = ((e.cw as number) ?? 520) * c.sc;
    return <div style={{...glass(P), width: W, padding: 26 * c.sc, transform: `scale(${s}) translateY(${Math.sin((c.lf + a) / 25) * 6}px) rotate(${(e.rot as number) ?? 0}deg)`, opacity: Math.min(1, s * 1.4), display: 'flex', gap: 18 * c.sc, alignItems: 'center', position: 'relative'}}>
      {e.icon ? <Tile k={e.icon as string} size={78 * c.sc} P={P} /> : null}
      <div style={{flex: 1}}><div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 32 * c.sc, color: P.cardInk, lineHeight: 1.15}}>{e.title as string}</div>{e.sub ? <div style={{fontFamily: FONT.ui, fontSize: 22 * c.sc, color: P.sub, marginTop: 4}}>{e.sub as string}</div> : null}{e.big ? <div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 60 * c.sc, color: P.cardInk, letterSpacing: '-0.03em'}}>{e.big as string}</div> : null}</div>
      {e.badge ? <div style={{position: 'absolute', right: -14, top: -14, padding: `${6 * c.sc}px ${14 * c.sc}px`, borderRadius: 20, background: (e.badgeColor as string) ?? '#E8362B', color: '#fff', fontFamily: FONT.ui, fontWeight: 800, fontSize: 20 * c.sc, transform: `scale(${sp(c.lf, a + 10, 9, 240)})`}}>{e.badge as string}</div> : null}
    </div>;
  },
  // stack of cards fanned at depth (problem pile)
  pile: ({e, c, a}) => {
    const {P} = c; const items = e.items as [string, string, string?][];
    return <div style={{position: 'relative', width: 560 * c.sc, height: 420 * c.sc, perspective: 1200}}>{items.map(([ic, t, sub], i) => { const s = sp(c.lf, a + i * 5, 12, 170); const d = items.length - 1 - i; return <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 560 * c.sc, transform: `translate(${d * 26 * c.sc}px, ${-d * 34 * c.sc + (1 - s) * 300}px) translateZ(${-d * 80}px) rotate(${(i % 2 ? 1 : -1) * d * 2}deg)`, opacity: s * (1 - d * 0.1), filter: d ? `blur(${d * 1.6}px)` : undefined}}><div style={{...glass(P), padding: 22 * c.sc, display: 'flex', gap: 16, alignItems: 'center'}}><Tile k={ic} size={64 * c.sc} P={P} /><div><div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 28 * c.sc, color: P.cardInk}}>{t}</div>{sub ? <div style={{fontFamily: FONT.ui, fontSize: 20 * c.sc, color: '#E8362B', fontWeight: 700}}>{sub}</div> : null}</div></div></div>; })}</div>;
  },
  // "!" alert badges swarming around a point
  badges: ({e, c, a}) => {
    const n = (e.n as number) ?? 8; const R = ((e.r as number) ?? 360) * c.sc;
    return <div style={{position: 'relative', width: 0, height: 0}}>{Array.from({length: n}).map((_, i) => { const ang = (i / n) * Math.PI * 2 + c.lf * 0.012; const s = sp(c.lf, a + i * 2.5, 10, 220); return <div key={i} style={{position: 'absolute', left: Math.cos(ang) * R * 1.3 - 30 * c.sc, top: Math.sin(ang) * R * 0.75 - 30 * c.sc, width: 60 * c.sc, height: 60 * c.sc, borderRadius: '50%', background: (e.color as string) ?? '#FFB020', color: '#fff', fontFamily: FONT.head, fontWeight: 900, fontSize: 38 * c.sc, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 0 26px rgba(255,176,32,0.8)'}}>{(e.glyph as string) ?? '!'}</div>; })}</div>;
  },
  // big counter pill (DAY 7, 700+, $15...)
  counter: ({e, c, a}) => {
    const {P} = c; const to = e.to as number; const from = (e.from as number) ?? 0;
    const v = Math.round(from + (to - from) * ez(c.lf, a, a + 24));
    return <div style={{transform: `scale(${sp(c.lf, a, 11, 200) * (1 + 0.1 * Math.max(0, 1 - Math.abs(c.lf - a - 24) / 6))})`, padding: `${16 * c.sc}px ${34 * c.sc}px`, borderRadius: 28, background: (e.bg as string) ?? P.ink, color: (e.fg as string) ?? (P.dark ? P.card : '#fff'), fontFamily: FONT.head, fontWeight: 800, fontSize: ((e.size as number) ?? 80) * c.sc, letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', gap: 14, boxShadow: '0 24px 40px -16px rgba(0,0,0,0.45)'}}>{e.label ? <span style={{fontFamily: FONT.ui, fontWeight: 700, fontSize: 30 * c.sc, opacity: 0.75}}>{e.label as string}</span> : null}{(e.prefix as string) ?? ''}{v.toLocaleString('en-US')}{(e.suffix as string) ?? ''}</div>;
  },
  // FansaChat prompt box (typing beat)
  chat: ({e, c, a}) => {
    const {P} = c; const text = e.text as string; const typeAt = a + 10; const dur = (e.typeDur as number) ?? 90; const sent = c.lf >= typeAt + dur;
    const cps = text.length / (dur / 30);
    const box = sp(c.lf, a, 14, 140);
    return <div style={{width: ((e.cw as number) ?? 1300) * c.sc, transform: `scale(${box}) perspective(1600px) rotateX(${(1 - box) * 30}deg)`}}>
      <div style={{...glass(P), background: P.dark ? '#141A3A' : '#FFFFFF', padding: 34 * c.sc, border: `3px solid ${!sent && c.lf >= typeAt ? P.accent2 : 'transparent'}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.ui, fontWeight: 700, fontSize: 24 * c.sc, color: P.sub, marginBottom: 16}}><Img src={staticFile('logo-fansa.png')} style={{width: 40 * c.sc, height: 40 * c.sc}} />FansaChat · new workflow</div>
        <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 40 * c.sc, lineHeight: 1.35, color: P.cardInk, minHeight: 150 * c.sc, paddingRight: 90}}>{sent ? text : typedSlice(text, c.lf - typeAt, cps)}{!sent && c.lf >= typeAt ? <span style={{display: 'inline-block', width: 4, height: 40 * c.sc, background: P.accent2, marginLeft: 3, verticalAlign: 'middle', opacity: Math.floor(c.lf / 8) % 2 ? 0.2 : 1, boxShadow: `0 0 14px ${P.accent2}`}} /> : null}</div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}><div style={{height: 70 * c.sc, minWidth: 70 * c.sc, padding: sent ? `0 ${30 * c.sc}px` : 0, borderRadius: 40, background: `linear-gradient(90deg, ${P.grad[0] === '#FFFFFF' ? '#6468D8' : P.grad[0]}, ${P.grad[1] === '#FFFFFF' ? '#E68C74' : P.grad[1]})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: FONT.ui, fontWeight: 800, fontSize: 26 * c.sc, transform: `scale(${1 - 0.15 * Math.max(0, 1 - Math.abs(c.lf - typeAt - dur) / 3)})`}}>{sent ? <><span style={{width: 24, height: 24, borderRadius: 12, border: '4px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', transform: `rotate(${c.lf * 20}deg)`, display: 'inline-block'}} />Building your workflow…</> : '↑'}</div></div>
      </div></div>;
  },
  // workflow nodes (row / col / snake) with ✓ Tested
  flow: ({e, c, a}) => {
    const {P, w} = c; const nodes = e.nodes as [string, string, string][]; const lay = (w ? (e.layout as string) : (e.layout45 as string)) ?? (w ? 'row' : 'col');
    const nw = (w ? 330 : 400) * c.sc, nh = 120 * c.sc, gx = nw + 70 * c.sc, gy = nh + 60 * c.sc;
    const perRow = lay === 'row' ? nodes.length : lay === 'col' ? 1 : 3;
    const pos = (i: number) => { const r = Math.floor(i / perRow), k = i % perRow; const col = lay === 'snake' && r % 2 ? perRow - 1 - k : k; return [col * gx, r * gy]; };
    const total = [Math.min(nodes.length, perRow) * gx - 70 * c.sc, Math.ceil(nodes.length / perRow) * gy - 60 * c.sc];
    return <div style={{position: 'relative', width: total[0], height: total[1]}}>
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={total[0]} height={total[1]}>{nodes.map((_, i) => { if (!i) return null; const [x1, y1] = pos(i - 1), [x2, y2] = pos(i); const k = ez(c.lf, a + i * 8, a + i * 8 + 10); const ax = x1 + nw / 2, ay = y1 + nh / 2, bx = x2 + nw / 2, by = y2 + nh / 2; return <line key={i} x1={ax} y1={ay} x2={ax + (bx - ax) * k} y2={ay + (by - ay) * k} stroke={P.dark ? P.accent : P.accent2 === '#1A1206' ? '#FF6A13' : P.accent2} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 16" />; })}</svg>
      {nodes.map(([k, t, s2], i) => { const [x, y] = pos(i); const s = sp(c.lf, a + i * 8, 12, 200); const ok = c.lf >= a + nodes.length * 8 + 20 + i * 5; return <div key={i} style={{position: 'absolute', left: x, top: y, width: nw, height: nh, transform: `scale(${s})`}}><div style={{...glass(P), background: P.dark ? '#1A2246' : '#fff', height: '100%', boxSizing: 'border-box', padding: `${16 * c.sc}px ${20 * c.sc}px`, display: 'flex', gap: 16, alignItems: 'center'}}><Tile k={k} size={74 * c.sc} P={P} /><div><div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 30 * c.sc, color: P.cardInk}}>{t}</div><div style={{fontFamily: FONT.ui, fontSize: 21 * c.sc, color: ok ? '#19A55A' : P.sub, fontWeight: ok ? 800 : 500}}>{ok ? '✓ Tested' : s2}</div></div></div></div>; })}
    </div>;
  },
  // phone with FansaChat notifications
  phone: ({e, c, a}) => {
    const {P} = c; const up = sp(c.lf, a, 13, 110); const notes = e.notes as [string, string, string][]; const sc = c.sc * ((e.ps as number) ?? 1);
    return <div style={{width: 420 * sc, height: 840 * sc, borderRadius: 66 * sc, background: '#121212', padding: 12 * sc, transform: `translateY(${(1 - up) * 700}px) rotate(${(1 - up) * 14 + Math.sin(c.lf / 30) * 2}deg)`, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.6)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 56 * sc, background: `linear-gradient(170deg, ${P.bg[2]}, ${P.bg[0]})`, position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 14 * sc, left: 150 * sc, width: 108 * sc, height: 30 * sc, borderRadius: 15, background: '#121212'}} />
        <div style={{position: 'absolute', top: 70 * sc, width: '100%', textAlign: 'center', fontFamily: FONT.ui, fontWeight: 300, fontSize: 90 * sc, color: P.dark ? '#fff' : P.ink}}>9:41</div>
        {notes.map(([ic, t, b], i) => { const s = sp(c.lf, a + 16 + i * 22, 12, 190); return <div key={i} style={{position: 'absolute', left: 14 * sc, right: 14 * sc, top: (240 + i * 128) * sc, padding: `${14 * sc}px ${16 * sc}px`, borderRadius: 24 * sc, background: 'rgba(255,255,255,0.9)', display: 'flex', gap: 12, alignItems: 'center', transform: `translateY(${(1 - s) * -80}px)`, opacity: s}}><div style={{width: 46 * sc, height: 46 * sc, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic} size={34 * sc} /></div><div style={{fontFamily: FONT.ui, flex: 1}}><div style={{fontSize: 14 * sc, color: '#7A6A5A'}}>FANSACHAT · now</div><div style={{fontSize: 20 * sc, fontWeight: 800, color: '#111'}}>{t}</div><div style={{fontSize: 15 * sc, color: '#444'}}>{b}</div></div></div>; })}
      </div></div>;
  },
  // single floating notification
  notif: ({e, c, a}) => {
    const s = sp(c.lf, a, 12, 190);
    return <div style={{width: 640 * c.sc, padding: `${18 * c.sc}px ${22 * c.sc}px`, borderRadius: 28, background: 'rgba(255,255,255,0.92)', boxShadow: '0 30px 60px -24px rgba(0,0,0,0.45)', display: 'flex', gap: 16, alignItems: 'center', transform: `translateY(${(1 - s) * -120}px) scale(${0.9 + 0.1 * s})`, opacity: s}}>
      <Img src={staticFile('logo-fansa.png')} style={{width: 60 * c.sc, height: 60 * c.sc, borderRadius: 14}} />
      <div style={{fontFamily: FONT.ui, flex: 1}}><div style={{fontSize: 17 * c.sc, color: '#666', display: 'flex', gap: 8, alignItems: 'center'}}>FANSACHAT{e.icon ? <Icon k={e.icon as string} size={18 * c.sc} /> : null}<span style={{marginLeft: 'auto'}}>now</span></div><div style={{fontSize: 27 * c.sc, fontWeight: 800, color: '#111'}}>{e.title as string}</div>{e.sub ? <div style={{fontSize: 21 * c.sc, color: '#444'}}>{e.sub as string}</div> : null}</div>
    </div>;
  },
  // ring of app tiles orbiting a centre (DG1)
  orbit: ({e, c, a}) => {
    const {P} = c; const apps = e.apps as string[]; const R = ((e.r as number) ?? 420) * c.sc;
    return <div style={{position: 'relative', width: 0, height: 0}}>{apps.map((k, i) => { const ang = (i / apps.length) * Math.PI * 2 + c.lf * 0.012; const r = R * ez(c.lf, a + i, a + 18 + i); return <div key={k + i} style={{position: 'absolute', left: Math.cos(ang) * r * 1.2 - 46 * c.sc, top: Math.sin(ang) * r * 0.5 - 46 * c.sc, transform: `scale(${0.75 + 0.25 * Math.sin(ang)})`, zIndex: Math.sin(ang) > 0 ? 3 : 0, opacity: ez(c.lf, a + i, a + 10 + i)}}><Tile k={k} size={92 * c.sc} P={P} /></div>; })}</div>;
  },
  // cloud of floating tiles (problem: too many tools)
  cloud: ({e, c, a}) => {
    const {P} = c; const apps = e.apps as string[];
    return <div style={{position: 'relative', width: 0, height: 0}}>{apps.map((k, i) => { const r = (q: string) => random(`cl${i}${q}`); const ang = r('a') * Math.PI * 2; const R = (220 + r('r') * 420) * c.sc; const s = sp(c.lf, a + i * 1.5, 11, 170); return <div key={i} style={{position: 'absolute', left: Math.cos(ang) * R * 1.4 - 55 * c.sc, top: Math.sin(ang) * R * 0.75 - 55 * c.sc + Math.sin((c.lf + i * 9) / 18) * 10, transform: `scale(${s * (0.7 + r('z') * 0.6)}) rotate(${(r('t') - 0.5) * 20}deg)`, filter: r('z') < 0.25 ? 'blur(3px)' : undefined}}><Tile k={k} size={110 * c.sc} P={P} /></div>; })}</div>;
  },
  // horizontal conveyor of tiles
  conveyor: ({e, c}) => {
    const {P} = c; const apps = e.apps as string[]; const dir = (e.dir as number) ?? 1; const span = apps.length * 130 * c.sc;
    const x = (((c.lf * 6 * dir) % span) + span) % span - span;
    return <div style={{position: 'relative', width: 0, height: 0}}><div style={{position: 'absolute', left: x - c.W, top: -55 * c.sc, display: 'flex', gap: 20 * c.sc}}>{[...apps, ...apps, ...apps, ...apps].map((k, i) => <Tile key={i} k={k} size={110 * c.sc} P={P} />)}</div></div>;
  },
  // 3D carousel of category cards, index advances on given words
  carousel: ({e, c, a}) => {
    const items = e.items as [string, string][]; const ats = (e.words as string[] | undefined)?.map((wd) => c.wordAt(wd)) ?? items.map((_, i) => a + i * 18);
    let idx = 0; ats.forEach((t, i) => { if (c.lf >= t) idx = i; }); const t = idx + ez(c.lf, ats[idx], ats[idx] + 9) - 1;
    return <div style={{position: 'relative', width: 0, height: 0, perspective: 1400}}>{items.map(([label, col], i) => { const o = i - Math.max(0, t); if (Math.abs(o) > 1.7 || c.lf < ats[0] - 4) return null; return <div key={i} style={{position: 'absolute', left: -200 * c.sc, top: -150 * c.sc, width: 400 * c.sc, height: 300 * c.sc, borderRadius: 40, background: `linear-gradient(160deg, ${col}, ${col}CC)`, boxShadow: `0 40px 80px -30px ${col}`, transform: `translateX(${o * 340 * c.sc}px) rotateY(${-o * 34}deg) scale(${1 - Math.min(1, Math.abs(o)) * 0.25})`, opacity: 1 - Math.abs(o) * 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontWeight: 800, fontSize: 72 * c.sc, color: '#fff', letterSpacing: '-0.04em'}}>{label}</div>; })}</div>;
  },
  // stamp (PAID / DONE / GHOSTED)
  stamp: ({e, c, a}) => { const s = sp(c.lf, a, 9, 260); if (c.lf < a) return null; const col = (e.color as string) ?? '#19A55A'; return <div style={{padding: `${8 * c.sc}px ${28 * c.sc}px`, border: `${8 * c.sc}px solid ${col}`, borderRadius: 18, color: col, fontFamily: FONT.head, fontWeight: 800, fontSize: ((e.size as number) ?? 80) * c.sc, transform: `rotate(${(e.rot as number) ?? -12}deg) scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 2), background: 'rgba(255,255,255,0.85)'}}>{e.text as string}</div>; },
  // text with animated strike-through
  strike: ({e, c, a}) => { const {P} = c; const size = ((e.size as number) ?? 90) * c.sc; return <span style={{position: 'relative', fontFamily: FONT.head, fontWeight: 800, fontSize: size, color: (e.color as string) ?? P.ink, letterSpacing: '-0.03em', opacity: ez(c.lf, a - 6, a)}}>{e.text as string}<span style={{position: 'absolute', left: -6, right: -6, top: '55%', height: size * 0.12, background: '#E8362B', borderRadius: 6, transform: `scaleX(${ez(c.lf, a + 6, a + 16)})`, transformOrigin: '0 50%'}} /></span>; },
  // checklist (5 automations lists, features)
  list: ({e, c, a}) => {
    const {P} = c; const items = e.items as [string, string][];
    return <div style={{display: 'flex', flexDirection: 'column', gap: 16 * c.sc, width: ((e.cw as number) ?? 1000) * c.sc}}>{items.map(([ic, t], i) => { const s = sp(c.lf, a + i * 7, 12, 190); return <div key={i} style={{...glass(P), padding: `${16 * c.sc}px ${22 * c.sc}px`, display: 'flex', gap: 18, alignItems: 'center', transform: `translateX(${(1 - s) * -200}px)`, opacity: s}}><div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 40 * c.sc, color: P.dark ? P.accent : P.ink, width: 50 * c.sc}}>{i + 1}</div><Tile k={ic} size={64 * c.sc} P={P} /><div style={{fontFamily: FONT.ui, fontWeight: 700, fontSize: 30 * c.sc, color: P.cardInk}}>{t}</div></div>; })}</div>;
  },
  // two-column comparison (other tools vs FansaChat) with animated bars / checks
  compare: ({e, c, a}) => {
    const {P} = c; const L = e.left as {t: string; rows: string[]; meter?: number}; const R = e.right as {t: string; rows: string[]; meter?: number};
    const col = (side: typeof L, good: boolean, d: number) => <div style={{...glass(P), flex: 1, padding: 28 * c.sc, border: good ? `3px solid ${P.dark ? P.accent : '#19A55A'}` : undefined, transform: `translateY(${(1 - sp(c.lf, a + d, 12, 160)) * 300}px)`}}>
      <div style={{fontFamily: FONT.head, fontWeight: 800, fontSize: 42 * c.sc, color: P.cardInk, marginBottom: 16}}>{side.t}</div>
      {side.rows.map((r, i) => <div key={i} style={{display: 'flex', gap: 12, alignItems: 'center', fontFamily: FONT.ui, fontSize: 26 * c.sc, color: P.cardInk, padding: '8px 0', opacity: ez(c.lf, a + d + 10 + i * 6, a + d + 16 + i * 6)}}><span style={{color: good ? '#19A55A' : '#E8362B', fontWeight: 900}}>{good ? '✓' : '✕'}</span>{r}</div>)}
      {side.meter !== undefined ? <div style={{marginTop: 18, height: 26 * c.sc, borderRadius: 13, background: P.dark ? 'rgba(255,255,255,0.1)' : '#EEE'}}><div style={{height: '100%', borderRadius: 13, width: `${side.meter * ez(c.lf, a + d + 30, a + d + 70) * 100}%`, background: good ? '#19A55A' : '#E8362B'}} /></div> : null}
    </div>;
    return <div style={{display: 'flex', gap: 30 * c.sc, width: ((e.cw as number) ?? 1500) * c.sc, flexDirection: c.w ? 'row' : 'column'}}>{col(L, false, 0)}{col(R, true, 12)}</div>;
  },
  // tangled path vs straight line (DG6)
  paths: ({e, c, a}) => {
    const {P} = c; const W = 1300 * c.sc, H = 300 * c.sc; const k1 = ez(c.lf, a, a + 50), k2 = ez(c.lf, a + 20, a + 40);
    const tangle = `M0,${H * 0.3} C${W * 0.15},${-H * 0.5} ${W * 0.2},${H * 1.2} ${W * 0.35},${H * 0.3} S${W * 0.5},${-H * 0.4} ${W * 0.55},${H * 0.6} S${W * 0.8},${H * 1.3} ${W},${H * 0.3}`;
    return <svg width={W} height={H * 1.6} style={{overflow: 'visible'}}><path d={tangle} stroke="#E8362B" strokeWidth={10} fill="none" pathLength={1} strokeDasharray={`${k1} 1`} opacity={0.85} /><text x={0} y={-10} fill={P.ink} fontFamily={FONT.ui} fontWeight={800} fontSize={30 * c.sc}>{(e.l as string) ?? 'Other tools'}</text><path d={`M0,${H * 1.4} L${W},${H * 1.4}`} stroke="#19A55A" strokeWidth={12} fill="none" pathLength={1} strokeDasharray={`${k2} 1`} /><text x={0} y={H * 1.4 - 24} fill={P.ink} fontFamily={FONT.ui} fontWeight={800} fontSize={30 * c.sc}>{(e.r as string) ?? 'FansaChat'}</text></svg>;
  },
  // Maya placed as an element
  maya: ({e, c}) => <Maya size={((e.size as number) ?? 420) * c.sc} expr={(e.expr as string) ?? 'smileBig'} talk={Boolean(e.talk)} color={c.P.maya} />,
  // big emoji / glyph pop
  pop: ({e, c, a}) => { const s = sp(c.lf, a, 9, 220); return <div style={{fontSize: ((e.size as number) ?? 140) * c.sc, transform: `scale(${s}) rotate(${(1 - s) * 30 + Math.sin(c.lf / 12) * 6}deg)`, lineHeight: 1}}>{e.text as string}</div>; },
  // end card with logo, orbit and waitlist
  end: ({e, c, a}) => {
    const {P} = c; const s = sp(c.lf, a, 10, 170); const apps = (e.apps as string[]) ?? [];
    return <div style={{position: 'relative', width: 0, height: 0}}>
      {apps.map((k, i) => { const ang = (i / apps.length) * Math.PI * 2 + c.lf * 0.012; const r = 480 * c.sc * ez(c.lf, a + i, a + 20 + i); return <div key={i} style={{position: 'absolute', left: Math.cos(ang) * r - 44 * c.sc, top: -120 * c.sc + Math.sin(ang) * r * 0.4 - 44 * c.sc, zIndex: Math.sin(ang) > 0 ? 3 : 1, transform: `scale(${0.75 + 0.25 * Math.sin(ang)})`, opacity: ez(c.lf, a + i, a + 10 + i)}}><Tile k={k} size={88 * c.sc} P={P} /></div>; })}
      <div style={{position: 'absolute', left: -140 * c.sc, top: -260 * c.sc, width: 280 * c.sc, height: 280 * c.sc, borderRadius: 76 * c.sc, background: '#fff', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 40px 100px -20px rgba(0,0,0,0.45)'}}><Img src={staticFile('logo-fansa.png')} style={{width: 220 * c.sc, height: 220 * c.sc, objectFit: 'contain'}} /></div>
      <div style={{position: 'absolute', left: -800, width: 1600, top: 60 * c.sc, display: 'flex', justifyContent: 'center', zIndex: 4}}><Flip3DGrad text="FansaChat" at={a + 6} flipAt={a + 40} size={120 * c.sc} color={P.ink} font={FONT.head} grad={P.dark ? P.grad : ['#6468D8', '#E68C74']} /></div>
      <div style={{position: 'absolute', left: -800, width: 1600, top: 200 * c.sc, textAlign: 'center', zIndex: 4, opacity: ez(c.lf, a + 20, a + 30), fontFamily: FONT.ui, fontWeight: 800, fontSize: 44 * c.sc, color: P.dark ? P.accent : P.ink}}>{e.tag as string}</div>
      {c.lf >= (e.ctaWord ? c.wordAt(e.ctaWord as string) : a + 40) ? <div style={{position: 'absolute', left: -800, width: 1600, top: 290 * c.sc, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 4}}>
        <div style={{padding: `${20 * c.sc}px ${50 * c.sc}px`, borderRadius: 60, background: P.dark ? P.accent : P.ink, color: P.dark ? '#111' : '#fff', fontFamily: FONT.ui, fontWeight: 800, fontSize: 42 * c.sc, transform: `scale(${sp(c.lf, e.ctaWord ? c.wordAt(e.ctaWord as string) : a + 40, 9, 230)})`}}>Join the waitlist →</div>
        <div style={{fontFamily: FONT.ui, fontWeight: 600, fontSize: 28 * c.sc, color: P.ink, opacity: ez(c.lf, (e.ctaWord ? c.wordAt(e.ctaWord as string) : a + 40) + 10, (e.ctaWord ? c.wordAt(e.ctaWord as string) : a + 40) + 20)}}>fansachat.com · t.me/fansachat</div>
      </div> : null}
    </div>;
  },
};

// ---------------- timing ----------------
export const TYPE_HOLD = 20, GAP = 8, TR = 18; // TR = transition frames (camera flight)
export const layoutBeats = (spec: Spec, vo: Vo) => {
  const starts: number[] = []; const durs: number[] = []; let t = 0;
  spec.beats.forEach((b) => { starts.push(t); const d = b.line !== undefined ? Math.round((vo[b.line]?.dur ?? 2) * 30) + GAP + 6 + (b.hold ?? 0) : (b.dur ?? 90); durs.push(d); t += d; });
  return {starts, durs, total: t + 40};
};

// ---------------- camera + world ----------------
const DIRV: Record<string, [number, number]> = {right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1], whip: [1, 0], zoom: [0, 0], iris: [0, 0]};
export const Film: React.FC<{spec: Spec; vo: Vo}> = ({spec, vo}) => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const P = PAL[spec.pal]; const sc = w ? 1.2 : 1;
  const {starts, durs} = layoutBeats(spec, vo);
  // world anchors
  const anchors: [number, number][] = []; let ax = 0, ay = 0;
  spec.beats.forEach((b, i) => { if (i > 0) { const d = DIRV[b.go ?? 'right']; ax += d[0] * W * 1.15; ay += d[1] * H * 1.15; } anchors.push([ax, ay]); });
  let cur = 0; starts.forEach((s, i) => { if (f >= s) cur = i; });
  const lf = f - starts[cur];
  const go = spec.beats[cur].go ?? 'right';
  const trLen = go === 'whip' ? 10 : TR;
  const k = cur === 0 ? 1 : ez(lf, 0, trLen, Easing.inOut(Easing.cubic));
  const prev = anchors[Math.max(0, cur - 1)], next = anchors[cur];
  let camX = prev[0] + (next[0] - prev[0]) * k, camY = prev[1] + (next[1] - prev[1]) * k;
  let zoom = 1;
  // zoom-through: punch into the previous slot's focus, then the new slot scales up from small
  const isZoom = go === 'zoom' && cur > 0;
  if (isZoom) zoom = lf < trLen / 2 ? 1 + 3 * ez(lf, 0, trLen / 2, Easing.in(Easing.cubic)) : 1;
  // velocity blur
  const vel = cur > 0 && lf < trLen ? Math.sin((lf / trLen) * Math.PI) : 0;
  const blurX = Math.abs((next[0] - prev[0]) / W) * vel * (go === 'whip' ? 40 : 18), blurY = Math.abs((next[1] - prev[1]) / H) * vel * 18;
  // continuous micro drift + slow push
  camX += Math.sin(f / 55) * 10; camY += Math.cos(f / 63) * 7; zoom *= 1 + 0.03 * ez(lf, 0, durs[cur]);
  // hero (tracked object): world position interpolates along an arc during the flight, camera leans toward it
  const heroOf = (i: number) => { const h = spec.beats[i].hero; if (!h) return null; const a = anchors[i]; return {...h, x: a[0] + h.x * W, y: a[1] + h.y * H}; };
  const hPrev = heroOf(Math.max(0, cur - 1)) ?? heroOf(cur), hNext = heroOf(cur);
  let hero: null | {x: number; y: number; size: number; mood?: string; who?: string; expr?: string} = null;
  if (hNext) {
    const from = hPrev ?? hNext; const kk = cur === 0 ? 1 : ez(lf, 0, trLen + 4, Easing.inOut(Easing.cubic));
    hero = {x: from.x + (hNext.x - from.x) * kk, y: from.y + (hNext.y - from.y) * kk - Math.sin(kk * Math.PI) * 220 * (cur ? 1 : 0), size: (hNext.size ?? 220) * sc, mood: hNext.mood, who: hNext.who, expr: hNext.expr};
  }
  const land = cur > 0 && lf >= trLen && lf < trLen + 14 ? -0.35 * Math.exp(-(lf - trLen) / 4) * Math.cos((lf - trLen) / 2) : 0;
  const wordAtFor = (i: number) => (word?: string) => { const b = spec.beats[i]; if (!word || b.line === undefined) return 6; const ws = vo[b.line]?.words ?? []; const hit = ws.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(word.toLowerCase())); return Math.round((hit?.s ?? 0) * 30) + 8; };
  const talking = (x: number) => spec.beats.some((b, i) => b.line !== undefined && x >= starts[i] + 6 && x <= starts[i] + 6 + (vo[b.line]?.dur ?? 0) * 30);
  // render slots cur-1..cur
  const Slot: React.FC<{i: number}> = ({i}) => {
    const b = spec.beats[i]; const a = anchors[i]; const slf = f - starts[i];
    const c: Ctx = {P, w, at: 0, lf: slf, W, H, sc, wordAt: wordAtFor(i)};
    const zIn = spec.beats[i].go === 'zoom' && i > 0 ? (slf < trLen / 2 ? 0 : 0.55 + 0.45 * ez(slf, trLen / 2, trLen)) : 1;
    const irisR = spec.beats[i].go === 'iris' && i > 0 ? ez(slf, 0, trLen + 6) * 140 : 200;
    if (spec.beats[i].go === 'zoom' && i === cur && slf < trLen / 2) return null;
    return <div style={{position: 'absolute', left: a[0], top: a[1], width: W, height: H, transform: `scale(${zIn})`, opacity: spec.beats[i].go === 'zoom' && i > 0 ? Math.min(1, zIn * 1.2) : 1, clipPath: irisR < 200 ? `circle(${irisR}% at 50% 50%)` : undefined}}>
      {b.els.map((e, j) => {
        const o = !w && e.p45 ? {...e, ...e.p45} : e;
        const at = (e.word ? c.wordAt(e.word) : 8) + (e.d ?? 0);
        const Comp = EL[e.t]; if (!Comp) return null;
        const isCenter = (e.t === 'badges' || e.t === 'orbit' || e.t === 'cloud' || e.t === 'conveyor' || e.t === 'carousel' || e.t === 'end' || e.t === 'maya');
        return <div key={j} style={{position: 'absolute', left: (o.x ?? 0.5) * W, top: (o.y ?? 0.5) * H, transform: isCenter ? undefined : 'translate(-50%, -50%)', zIndex: (e.z as number) ?? 1}}><div style={{transform: `scale(${o.s ?? 1})`, transformOrigin: 'center'}}><Comp e={o} c={c} a={at} /></div></div>;
      })}
    </div>;
  };
  return <AbsoluteFill style={{overflow: 'hidden', background: P.bg[1]}}>
    <Bg P={P} />
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: spec.beats[cur].focus ? `${spec.beats[cur].focus![0] * 100}% ${spec.beats[cur].focus![1] * 100}%` : '50% 50%', filter: blurX + blurY > 0.6 ? `blur(${Math.max(blurX, blurY) * 0.35}px)` : undefined}}>
      <div style={{position: 'absolute', left: -camX, top: -camY, width: W, height: H}}>
        {[cur - 1, cur].filter((i) => i >= 0).map((i) => <Slot key={i} i={i} />)}
        {hero ? <div style={{position: 'absolute', left: hero.x, top: hero.y, zIndex: 20}}>{hero.who === 'maya' ? <Maya size={hero.size * 1.6} expr={hero.expr} talk={talking(f)} color={P.maya} /> : <Orb size={hero.size} mood={hero.mood} squash={land} />}</div> : null}
      </div>
    </AbsoluteFill>
    {/* audio */}
    <Audio src={staticFile(`audio/${spec.music ?? P.music}`)} volume={(x) => interpolate(x, [0, 10, layoutBeats(spec, vo).total - 40, layoutBeats(spec, vo).total], [0, 1, 1, 0], clamp) * (talking(x) ? 0.14 : 0.3)} />
    {spec.beats.map((b, i) => b.line !== undefined && vo[b.line] ? <Sequence key={i} from={starts[i] + 6}><Audio src={staticFile(vo[b.line].file)} /></Sequence> : null)}
    {autoSfx(spec, starts).map(([at, s], i) => <Sequence key={'x' + i} from={at}><Audio src={staticFile(`audio/sfx/${s}.ogg`)} volume={0.2} /></Sequence>)}
  </AbsoluteFill>;
};

// soft SFX only on meaningful lands, max 7, at least 40 frames apart
const autoSfx = (spec: Spec, starts: number[]) => {
  const out: [number, string][] = [];
  const map: Record<string, string> = {card: 'k_pluck_001', notif: 'k_glass_002', phone: 'k_glass_002', stamp: 'k_drop_002', chat: 'k_click_002', flow: 'k_confirmation_002', counter: 'k_tick_001', badges: 'k_bong_001', end: 'k_pluck_002'};
  spec.beats.forEach((b, i) => { const e = b.els.find((x) => map[x.t]); if (!e) return; const at = starts[i] + (e.t === 'chat' ? 10 + ((e.typeDur as number) ?? 90) : e.t === 'flow' ? 70 : 12); if (!out.length || at - out[out.length - 1][0] >= 40) out.push([at, map[e.t]]); });
  return out.slice(0, 7);
};
