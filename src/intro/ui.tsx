import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';

// Shared look for the intro film (bright theme). Both masters have a 1080 px short side, so pixel sizes are shared
// and only positions change between 16:9 and 4:5 (see useLayout).
// Fonts are self-hosted from public/fonts (SIL OFL 1.1, latin subset from Google Fonts) so renders work offline.
export const HEAVY = 'FC Bricolage';
export const SERIF = 'FC Instrument Serif';
export const UI = 'FC Inter Tight';
const FONTS: [string, string, string, string][] = [
  [HEAVY, 'BricolageGrotesque-800.woff2', '800', 'normal'],
  [SERIF, 'InstrumentSerif-400i.woff2', '400', 'italic'],
  [UI, 'InterTight-500.woff2', '500 700', 'normal'],
];
if (typeof document !== 'undefined') {
  const handle = delayRender('intro fonts');
  Promise.all(FONTS.map(([family, file, weight, style]) => new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {weight, style}).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(handle));
}

export const C = {
  cream: '#FFF8F0',
  white: '#FFFFFF',
  ink: '#1E1B3A',
  sub: '#5B5874',
  lav: '#6468D8',
  lavDeep: '#4B4FC4',
  lavSoft: '#E6E6FB',
  peach: '#FFB89A',
  coral: '#FF7A6B',
  orange: '#FF5A1F',
  green: '#1FA463',
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);

export const useLayout = () => {
  const {width, height} = useVideoConfig();
  return {W: width, H: height, wide: width > height};
};
export const sp = (f: number, at: number, damping = 14, stiffness = 160, mass = 0.9) =>
  spring({frame: f - at, fps: FPS, config: {damping, stiffness, mass}});
export const ease = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

export const plate: React.CSSProperties = {
  background: C.white,
  borderRadius: 28,
  boxShadow: '0 24px 60px rgba(30,27,58,.10), 0 2px 8px rgba(30,27,58,.06)',
};

// Cream base + drifting lavender/peach light + faint dot grid.
export const Bg: React.FC<{tint?: 'lav' | 'peach'}> = ({tint = 'lav'}) => {
  const f = useCurrentFrame();
  const t = f / FPS / 4;
  const blobs = [
    {c: tint === 'lav' ? 'rgba(100,104,216,.20)' : 'rgba(255,184,154,.42)', r: 46, s: 'a'},
    {c: tint === 'lav' ? 'rgba(255,184,154,.36)' : 'rgba(100,104,216,.16)', r: 42, s: 'b'},
    {c: 'rgba(255,122,107,.10)', r: 34, s: 'c'},
  ].map(({c, r, s}, i) => {
    const x = 50 + 38 * noise2D(s + 'x', t, i);
    const y = 50 + 38 * noise2D(s + 'y', i, t);
    return `radial-gradient(circle at ${x}% ${y}%, ${c} 0%, rgba(255,248,240,0) ${r}%)`;
  });
  return (
    <AbsoluteFill style={{background: [...blobs, C.cream].join(',')}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(30,27,58,.07) 1.6px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
    </AbsoluteFill>
  );
};

type Enter = 'iris' | 'whip' | 'zoom' | 'rise' | 'none';
const EnterFx: React.FC<{kind: Enter; origin: [number, number]; children: React.ReactNode}> = ({kind, origin, children}) => {
  const f = useCurrentFrame();
  const {W, H} = useLayout();
  const p = ease(f, 0, 12, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  let style: React.CSSProperties = {};
  if (kind === 'iris') style = {clipPath: `circle(${p * 150}% at ${origin[0]}% ${origin[1]}%)`};
  if (kind === 'whip') style = {transform: `translateX(${(1 - p) * W}px) skewX(${-(1 - p) * 12}deg)`, filter: p < 1 ? `blur(${(1 - p) * 18}px)` : undefined};
  if (kind === 'zoom') style = {transform: `scale(${1.25 - 0.25 * p})`, opacity: p};
  if (kind === 'rise') style = {transform: `translateY(${(1 - p) * H}px)`, borderRadius: (1 - p) * 60, overflow: 'hidden'};
  return <AbsoluteFill style={{overflow: 'hidden', ...style}}>{children}</AbsoluteFill>;
};

export const Scene: React.FC<{from: number; to: number; enter?: Enter; origin?: [number, number]; tint?: 'lav' | 'peach'; children: React.ReactNode}> = ({
  from, to, enter = 'none', origin = [50, 50], tint, children,
}) => (
  <Sequence from={from} durationInFrames={to - from}>
    <EnterFx kind={enter} origin={origin}>
      <Bg tint={tint} />
      {children}
    </EnterFx>
  </Sequence>
);

// Spring rise + de-blur (the "premium" text entrance used across AutoAE launch templates).
export const Rise: React.FC<{at: number; dy?: number; scale?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({at, dy = 40, scale, style, children}) => {
  const f = useCurrentFrame();
  const s = sp(f, at, 15, 170);
  const o = ease(f, at, at + 8);
  const b = (1 - ease(f, at, at + 10)) * 10;
  return (
    <div style={{...style, opacity: o, filter: b > 0.2 ? `blur(${b}px)` : undefined, transform: `translateY(${(1 - s) * dy}px) scale(${scale ? 0.6 + 0.4 * s : 1})`}}>
      {children}
    </div>
  );
};

export type Word = {w: string; at: number; serif?: boolean; color?: string; br?: boolean; strike?: number};
export const Words: React.FC<{words: Word[]; size: number; maxWidth: number; align?: 'center' | 'flex-start'; style?: React.CSSProperties}> = ({words, size, maxWidth, align = 'center', style}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align, alignItems: 'baseline', columnGap: size * 0.26, rowGap: size * 0.08, maxWidth, ...style}}>
    {words.map((x, i) => [
      x.br ? <div key={'br' + i} style={{flexBasis: '100%', height: 0}} /> : null,
      <Rise key={i} at={x.at} dy={size * 0.5} style={{position: 'relative'}}>
        <span style={x.serif
          ? {fontFamily: SERIF, fontStyle: 'italic', fontSize: size * 1.12, color: x.color ?? C.lav, lineHeight: 1, letterSpacing: '-0.01em'}
          : {fontFamily: HEAVY, fontWeight: 800, fontSize: size, color: x.color ?? C.ink, lineHeight: 1.02, letterSpacing: '-0.035em'}}>
          {x.w}
        </span>
        {x.strike ? <div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: size * 0.09, borderRadius: 99, background: C.coral,
          transformOrigin: 'left center', transform: `scaleX(${x.strike})`}} /> : null}
      </Rise>,
    ])}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = C.white, color = C.ink, size = 30, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.36}px ${size * 0.8}px`, borderRadius: 999, background: bg, color,
    fontFamily: UI, fontWeight: 700, fontSize: size, letterSpacing: '-0.01em', boxShadow: '0 10px 30px rgba(30,27,58,.10)', whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

// Generic app glyphs drawn by us (no third-party logos).
export const AppIcon: React.FC<{kind: 'mail' | 'sheet' | 'send' | 'chat' | 'doc' | 'cal' | 'cart' | 'db'; size?: number}> = ({kind, size = 64}) => {
  const bg = {mail: '#FFE3DE', sheet: '#DDF3E6', send: '#DCEBFF', chat: '#ECE4FF', doc: '#FFF0D6', cal: '#FFE7EF', cart: '#E3F6F8', db: '#EDEDF3'}[kind];
  const fg = {mail: '#E5483B', sheet: C.green, send: '#2A8BE0', chat: '#7A4FD6', doc: '#E59A1A', cal: '#E0457B', cart: '#1A9AA8', db: '#55536E'}[kind];
  const g: Record<string, React.ReactNode> = {
    mail: <path d="M14 20h36v26H14z M14 21l18 14 18-14" fill="none" stroke={fg} strokeWidth="4.5" strokeLinejoin="round" />,
    sheet: <g fill="none" stroke={fg} strokeWidth="4.5"><rect x="16" y="14" width="32" height="36" rx="4" /><path d="M16 26h32M16 38h32M30 14v36" /></g>,
    send: <path d="M14 31 50 16 42 50 32 38 46 22 28 35z" fill={fg} />,
    chat: <path d="M15 18h34v22H30l-9 8v-8h-6z" fill={fg} />,
    doc: <g fill="none" stroke={fg} strokeWidth="4.5"><path d="M20 13h17l9 9v29H20z" /><path d="M26 32h14M26 40h14" /></g>,
    cal: <g fill="none" stroke={fg} strokeWidth="4.5"><rect x="15" y="17" width="34" height="32" rx="5" /><path d="M15 28h34M24 12v9M40 12v9" /></g>,
    cart: <g fill="none" stroke={fg} strokeWidth="4.5"><path d="M12 16h7l6 22h20l5-15H22" /><circle cx="27" cy="46" r="3" fill={fg} /><circle cx="43" cy="46" r="3" fill={fg} /></g>,
    db: <g fill="none" stroke={fg} strokeWidth="4.5"><ellipse cx="32" cy="18" rx="15" ry="6" /><path d="M17 18v26c0 3 7 6 15 6s15-3 15-6V18M17 31c0 3 7 6 15 6s15-3 15-6" /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill={bg} />
      {g[kind]}
    </svg>
  );
};
