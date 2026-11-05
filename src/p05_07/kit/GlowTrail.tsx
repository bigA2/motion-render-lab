// Glow-trail typewriter, ported from motion-presets-lab presets/text/GlowTrailTypewriter.tsx (MIT, our own code):
// letters snap on one by one (no fade/blur/bounce); only the newest `head` letters glow in the accent and settle to
// the base colour as the next ones arrive. Added here: `from` (index of this run's first letter inside a longer
// line, so several <G> words can share one typing head) and pure timing helpers so the SFX can use the same numbers.
import React from 'react';
import {useCurrentFrame} from 'remotion';

export type Glow = {start: number; perChar: number; head: number};
/** frame the i-th letter of the line snaps on */
export const glowAt = (g: Glow, i: number) => g.start + i * g.perChar;
/** frame the whole line has settled (last letter + head) */
export const glowDone = (g: Glow, n: number) => g.start + (n - 1 + g.head) * g.perChar;

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

export const GlowTrail: React.FC<{text: string; g: Glow; from?: number; base?: string; accent?: string; glow?: number}> = ({text, g, from = 0, base = '#F4F7FA', accent = '#8BE9FF', glow = 18}) => {
  const f = useCurrentFrame();
  const typed = (f - g.start) / g.perChar;
  return <span style={{whiteSpace: 'pre'}}>
    {[...text].map((ch, j) => {
      const i = j + from;
      if (i > typed) return <span key={j} style={{opacity: 0}}>{ch}</span>; // keeps layout stable
      const age = Math.min(1, Math.max(0, (typed - i) / g.head)); const k = (1 - age) ** 1.5;
      return <span key={j} style={{color: mix(accent, base, age), textShadow: k > 0.02 ? `0 0 ${glow * k}px ${accent}` : 'none'}}>{ch}</span>;
    })}
  </span>;
};
