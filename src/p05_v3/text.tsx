// Continuous typography motion for P05 v3 (our take on the AE text-animator workflow from the tutorial digest):
//  - reveal: 'glow' (glow-trail typewriter: letters snap on, newest few glow in the accent and settle)
//            'rise' (range selector with offset: each letter rises + scales from 0.4 em below, staggered)
//  - after the reveal, a second range selector keeps running: a soft wave lifts letters by <= 3 px in turn
//  - the whole word drifts and scales by <= 3 % over its life (the "null" the text is parented to)
// Every word is a guarded <G>; it reports anim=true until its letters have settled. MIT, our own code.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp, ease, lerp} from '../p05_07/kit/curves';
import {Glow} from '../p05_07/kit/glowtime';
import {G} from '../p05_07/kit/TextGuard';

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

export type Reveal = {kind: 'glow'; g: Glow; from: number} | {kind: 'rise'; f0: number; stagger?: number; dur?: number};

export const LiveWord: React.FC<{id: string; text: string; size: number; color: string; font: string; weight?: number; accent?: string;
  reveal: Reveal; out?: number; life?: [number, number]; seed?: number; style?: React.CSSProperties; owner?: string}> = ({id, text, size, color, font, weight = 800, accent = '#8BE9FF', reveal, out, life, seed = 0, style}) => {
  const f = useCurrentFrame(); const chars = [...text];
  let settled = true;
  const letters = chars.map((ch, j) => {
    let op = 1, dy = 0, sc = 1, col = color, glow = 0;
    if (reveal.kind === 'glow') {
      const typed = (f - reveal.g.start) / reveal.g.perChar; const i = j + reveal.from;
      if (i > typed) { op = 0; settled = false; } else {
        const age = clamp((typed - i) / reveal.g.head); const k = (1 - age) ** 1.5;
        if (age < 1) settled = false; col = mix(accent, color, age); glow = k;
      }
    } else {
      const st = reveal.stagger ?? 2, du = reveal.dur ?? 14; const p = ease((f - reveal.f0 - j * st) / du, 'snapOut');
      if (p < 1) settled = false; op = clamp(p * 2.2); dy = (1 - p) * size * 0.42; sc = lerp(1.25, 1, p);
    }
    // continuous range selector: a wave travelling through the word (offset per letter)
    const wave = Math.sin(f / 7 - j * 0.55 + seed) * 0.5 + 0.5; dy -= Math.pow(wave, 6) * 3;
    return <span key={j} style={{display: 'inline-block', whiteSpace: 'pre', opacity: op, color: col, transform: `translateY(${dy.toFixed(2)}px) scale(${sc})`, textShadow: glow > 0.02 ? `0 0 ${26 * glow}px ${accent}` : undefined}}>{ch}</span>;
  });
  // the parent null: slow drift + scale (<= 3 %) over the word's life, then a fast exit
  const [l0, l1] = life ?? [0, 120]; const lp = clamp((f - l0) / Math.max(1, l1 - l0));
  const o = out !== undefined ? ease((f - out) / 8, 'inHard') : 0;
  const tr = `translate(${(noise(seed, f) * 4).toFixed(2)}px, ${(-o * 26).toFixed(2)}px) scale(${(1 + 0.022 * lp) * (1 - o * 0.06)})`;
  return <G id={id} size={size} color={color} font={font} weight={weight} anim={!settled || o > 0}
    style={{lineHeight: 1.08, letterSpacing: '-0.025em', transform: tr, transformOrigin: '50% 55%', opacity: 1 - o, ...style}}>{letters}</G>;
};
const noise = (seed: number, f: number) => Math.sin(f / 37 + seed * 1.7) * 0.6 + Math.sin(f / 23 + seed) * 0.4;
