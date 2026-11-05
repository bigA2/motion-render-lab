// Kinetic typography. Every animated text takes its timing from a pure helper (events.ts) so its sound events
// come from the same numbers. SOLID colours only. MIT, our own code.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Curve, ease, lerp, prog} from './curves';
import {Typed} from './events';

/** Typed line driven by typing(): chars appear on their key frames, caret blinks only while idle. */
export const TypedText: React.FC<{t: Typed; style?: React.CSSProperties; caret?: string; hot?: string[]; hotColor?: string}> = ({t, style, caret = 'currentColor', hot = [], hotColor}) => {
  const f = useCurrentFrame(); const n = t.count(f);
  const shown = t.text.slice(0, n);
  const typingNow = n > 0 && n < t.text.length;
  const blink = typingNow || Math.floor(f / 18) % 2 === 0;
  // colour hot words once they are complete
  const parts: React.ReactNode[] = []; let i = 0;
  const re = hot.length ? new RegExp(`(${hot.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g') : null;
  const segs = re ? shown.split(re) : [shown];
  for (const s of segs) {
    const isHot = hot.includes(s);
    parts.push(<span key={i++} style={isHot ? {color: hotColor, fontWeight: 700} : undefined}>{s}</span>);
  }
  return <span style={style}>{parts}{f >= t.times[0] - 20 && <span style={{display: 'inline-block', width: '0.07em', height: '1.05em', verticalAlign: '-0.15em', marginLeft: '0.04em', background: caret, opacity: blink ? 1 : 0}} />}</span>;
};

/** Long shadow: stacked offsets in a darker solid colour. */
export const longShadow = (col: string, n = 18, dx = 1, dy = 1) => Array.from({length: n}, (_, i) => `${(i + 1) * dx}px ${(i + 1) * dy}px 0 ${col}`).join(',');

/** Giant per-letter type: each letter its own layer with a push (scale + slide), staggered. */
export const GiantLetters: React.FC<{text: string; f0: number; stagger?: number; size: number; color: string; shadow?: string; font: string; weight?: number; push?: [number, number]; track?: number}> = ({text, f0, stagger = 5, size, color, shadow, font, weight = 800, push = [1.25, 1], track = -0.04}) => {
  const f = useCurrentFrame();
  return <div style={{display: 'flex', justifyContent: 'center', fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 0.9, letterSpacing: `${track}em`, color}}>
    {text.split('').map((ch, i) => {
      const p = prog(f, f0 + i * stagger, 26, 'snapOut'); const sl = prog(f, f0 + i * stagger, 70, 'softOut');
      return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - p) * size * 0.5}px) scale(${lerp(push[0], push[1], sl)})`, textShadow: shadow}}>{ch}</span>;
    })}
  </div>;
};

/** Rotating word: words swap on the same spot at the given frames (vertical snap + blur clear). */
export const RotatingWord: React.FC<{words: string[]; at: number[]; style?: React.CSSProperties; color?: string[]}> = ({words, at, style, color}) => {
  const f = useCurrentFrame(); let k = 0; for (let i = 0; i < at.length; i++) if (f >= at[i]) k = i;
  const p = prog(f, at[k], 14, 'snapOut'); const out = k > 0 ? prog(f, at[k], 8, 'inHard') : 1;
  return <span style={{position: 'relative', display: 'inline-block', ...style}}>
    {k > 0 && out < 1 && <span style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${-out * 0.6}em)`, opacity: 1 - out, filter: `blur(${out * 8}px)`, color: color?.[k - 1]}}>{words[k - 1]}</span>}
    <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 0.6}em)`, opacity: f >= at[0] ? p : 0, filter: `blur(${(1 - p) * 10}px)`, color: color?.[k]}}>{words[k]}</span>
  </span>;
};

/** Tracking wide -> tight with a slow breathing push (0.6 -> 1.05 over ~1.2 s by default). */
export const TrackIn: React.FC<{children: React.ReactNode; f0: number; dur?: number; from?: number; to?: number; s0?: number; s1?: number; style?: React.CSSProperties; curve?: Curve}> = ({children, f0, dur = 72, from = 0.6, to = -0.02, s0 = 0.6, s1 = 1.05, style, curve = 'snapOut'}) => {
  const f = useCurrentFrame(); const p = prog(f, f0, dur, curve); const b = prog(f, f0, dur, 'softOut');
  return <div style={{letterSpacing: `${lerp(from, to, p)}em`, transform: `scale(${lerp(s0, s1, b)})`, opacity: f >= f0 ? Math.min(1, (f - f0) / 6) : 0, ...style}}>{children}</div>;
};

/** Stepped (time-quantised) reveal: the line appears in `steps` mechanical steps at the given frames. */
export const SteppedText: React.FC<{text: string; frames: number[]; style?: React.CSSProperties}> = ({text, frames, style}) => {
  const f = useCurrentFrame(); let k = 0; frames.forEach((x) => { if (f >= x) k++; });
  const words = text.split(' '); const per = Math.ceil(words.length / frames.length);
  return <span style={style}>{words.map((w, i) => <span key={i} style={{opacity: i < k * per ? 1 : 0, display: 'inline-block', transform: i < k * per && i >= (k - 1) * per ? `translateY(${Math.max(0, 3 - (f - frames[k - 1])) * -4}px)` : undefined}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}</span>;
};

/** Word-by-word rise synced to VO word times (frames). Hot words in accent colour + weight. */
export const VoLine: React.FC<{words: {w: string; f: number}[]; style?: React.CSSProperties; hot?: Record<string, string>; f1?: number}> = ({words, style, hot = {}, f1}) => {
  const f = useCurrentFrame(); const out = f1 !== undefined ? prog(f, f1, 12, 'inHard') : 0;
  return <div style={{...style, opacity: 1 - out, transform: `translateY(${-out * 30}px)`}}>
    {words.map((w, i) => { const p = prog(f, w.f - 3, 12, 'snapOut'); const key = w.w.replace(/[^\w']/g, '').toLowerCase();
      return <span key={i} style={{display: 'inline-block', marginRight: '0.24em', opacity: p, transform: `translateY(${(1 - p) * 0.35}em)`, color: hot[key], filter: `blur(${(1 - p) * 6}px)`}}>{w.w}</span>; })}
  </div>;
};

export const breathe = (f: number, f0: number, dur = 72, s0 = 0.6, s1 = 1.05) => lerp(s0, s1, prog(f, f0, dur, 'softOut'));
export const easeIn = ease;
