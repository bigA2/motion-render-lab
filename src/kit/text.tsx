// Text effects ported frame-exactly from the FansaChat landing page:
//  - RollText = Nav TextRoll (Skiper58): two stacked copies, letters roll up, stagger from the word centre.
//  - Flip3DGrad = motion/Text3DFlip (Magic UI): per-letter 3D box, front face flips away, back face in the
//    brand gradient #6468D8 -> #E68C74 flips in.
// Plus BlurWords (Motion Primitives TextEffect blur), Typewriter, Tape (Ari), Strike.
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ez = (f: number, a: number, b: number, e = Easing.bezier(0.16, 1, 0.3, 1)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const inOut = Easing.inOut(Easing.ease);

type Common = {size: number; color: string; font: string; weight?: number; style?: React.CSSProperties};

// Skiper58 TextRoll. `at` = frame the roll starts; `from` -> `to` swaps the text (roll-in of a new word).
export const RollText: React.FC<Common & {text: string; at: number; from?: string; em?: string; stagger?: number}> = ({text, at, from, size, color, font, weight = 800, em, style, stagger = 1.05}) => {
  const f = useCurrentFrame();
  const L = Array.from(text), P = Array.from(from ?? '');
  const n = Math.max(L.length, P.length);
  const delay = (i: number) => stagger * Math.abs(i - (n - 1) / 2);
  return <span style={{display: 'inline-flex', overflow: 'hidden', lineHeight: 1.08, fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.035em', ...style}}>
    {Array.from({length: n}).map((_, i) => {
      const k = ez(f, at + delay(i), at + delay(i) + 13, inOut);
      const ch = L[i] ?? '', pc = P[i] ?? '';
      return <span key={i} style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
        <span style={{display: 'inline-block', transform: `translateY(${(1 - k) * 100}%)`, color: em && text.indexOf(em) <= i && i < text.indexOf(em) + em.length && text.indexOf(em) >= 0 ? undefined : undefined}}>{ch || ' '}</span>
        {from !== undefined && <span style={{position: 'absolute', left: 0, top: 0, display: 'inline-block', transform: `translateY(${-k * 100}%)`}}>{pc}</span>}
      </span>;
    })}
  </span>;
};

// Magic UI Text3DFlip with the landing-page gradient back face. flipAt: frame when letters flip to the gradient face.
export const Flip3DGrad: React.FC<Common & {text: string; at: number; flipAt?: number; grad?: [string, string]}> = ({text, at, flipAt, size, color, font, weight = 800, grad = ['#6468D8', '#E68C74'], style}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  let idx = 0;
  return <span style={{display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.26, perspective: 600, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.035em', ...style}}>
    {words.map((w, wi) => <span key={wi} style={{display: 'inline-flex', whiteSpace: 'nowrap'}}>{Array.from(w).map((ch, ci) => {
      const i = idx++;
      const kin = ez(f, at + i * 1.05, at + i * 1.05 + 16);
      const kf = flipAt === undefined ? 0 : ez(f, flipAt + i * 1.05, flipAt + i * 1.05 + 16);
      const front = kin < 1 ? 90 * (1 - kin) : -90 * kf;
      return <span key={ci} style={{display: 'inline-grid', transformStyle: 'preserve-3d'}}>
        <span style={{gridArea: '1/1', display: 'inline-block', backfaceVisibility: 'hidden', transformOrigin: '50% 50% -0.35em', transform: `rotateX(${front}deg)`, opacity: kin, color}}>{ch}</span>
        {flipAt !== undefined && <span style={{gridArea: '1/1', display: 'inline-block', backfaceVisibility: 'hidden', transformOrigin: '50% 50% -0.35em', transform: `rotateX(${90 * (1 - kf)}deg)`, backgroundImage: `linear-gradient(180deg, ${grad[0]}, ${grad[1]})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{ch}</span>}
      </span>;
    })}</span>)}
  </span>;
};

export const BlurWords: React.FC<Common & {text: string; at: number; em?: string[]; accent?: string; stagger?: number; align?: 'center' | 'left'}> = ({text, at, em = [], accent, size, color, font, weight = 800, stagger = 3, align = 'center', style}) => {
  const f = useCurrentFrame();
  return <span style={{display: 'inline-flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-start' : 'center', columnGap: size * 0.26, fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: '-0.035em', color, ...style}}>
    {text.split(' ').map((w, i) => { const k = ez(f, at + i * stagger, at + i * stagger + 12); const e = em.includes(w.replace(/[.,!?:]/g, '')); return <span key={i} style={{display: 'inline-block', opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `translateY(${(1 - k) * size * 0.4}px)`, color: e ? accent : undefined, fontStyle: e ? 'italic' : undefined}}>{w}</span>; })}
  </span>;
};

export const Tape: React.FC<Common & {text: string; at: number; bg: string; rot?: number}> = ({text, at, bg, rot = -4, size, color, font, weight = 800, style}) => {
  const f = useCurrentFrame();
  const k = ez(f, at, at + 9, Easing.out(Easing.back(1.6)));
  return <span style={{display: 'inline-block', padding: `${size * 0.12}px ${size * 0.35}px`, background: bg, color, fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: '-0.03em', transform: `rotate(${rot}deg) scaleX(${k}) translateX(${(1 - k) * -40}px)`, transformOrigin: '0 50%', clipPath: 'polygon(1% 4%, 99% 0, 100% 96%, 0 100%)', boxShadow: '0 14px 0 rgba(0,0,0,0.12)', ...style}}>{text}</span>;
};

export const typedSlice = (text: string, f: number, cps = 34) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f / 30) * cps))));
