// Event-driven SFX timeline. Animation helpers below return BOTH the motion (functions of frame) and the sound
// events they cause, so picture and sound come from the same numbers. Pure TS. MIT, our own code.
import {Curve, ease, prog, rnd} from './curves';

export type Kind = 'key' | 'space' | 'enter' | 'click' | 'pop' | 'whoosh' | 'land' | 'chime' | 'tick' | 'data' | 'mech'
  | 'stamp' | 'swipe' | 'riser' | 'impact';
/** f = frame (fractional ok) at 60 fps; dur in frames; gain = dB offset from the sound map level; pitch = ratio */
export type Sfx = {f: number; kind: Kind; dur?: number; gain?: number; pitch?: number; src?: string};

export class Timeline {
  ev: Sfx[] = [];
  constructor(public fps = 60) {}
  add(e: Sfx | Sfx[]) { (Array.isArray(e) ? e : [e]).forEach((x) => this.ev.push(x)); return this; }
  sorted() { return [...this.ev].sort((a, b) => a.f - b.f); }
}

// ---------- typing: one key per character, human rhythm ----------
export type Typed = {text: string; times: number[]; end: number; count: (f: number) => number; ev: Sfx[]};
export function typing(text: string, f0: number, o: {cps?: number; seed?: number; enter?: boolean; src?: string} = {}): Typed {
  const fps = 60, cps = o.cps ?? 17, seed = o.seed ?? 1;
  const times: number[] = []; let t = f0;
  for (let i = 0; i < text.length; i++) {
    times.push(t);
    const ch = text[i];
    let gap = (fps / cps) * (0.6 + rnd(seed * 97 + i) * 0.8);
    if (ch === ' ') gap *= 1.15;
    if (/[,.:;—]/.test(ch)) gap *= 2.4;
    t += gap;
  }
  const end = t;
  const ev: Sfx[] = times.map((f, i) => ({f, kind: text[i] === ' ' ? 'space' : 'key', src: o.src, gain: (rnd(seed * 31 + i) - 0.5) * 5, pitch: 1 + (rnd(seed * 53 + i) - 0.5) * 0.12}));
  if (o.enter) ev.push({f: end + 6, kind: 'enter', src: o.src});
  const count = (f: number) => { let n = 0; while (n < times.length && times[n] <= f) n++; return n; };
  return {text, times, end, count, ev};
}

// ---------- count-up: ticks only while the shown value changes ----------
export function countUp(from: number, to: number, f0: number, dur: number, curve: Curve = 'softOut', step = 1, src?: string) {
  const value = (f: number) => from + (to - from) * prog(f, f0, dur, curve);
  const shown = (f: number) => Math.round(value(f) / step) * step;
  const ev: Sfx[] = []; let last = shown(f0), lastF = -99;
  for (let f = f0; f <= f0 + dur; f += 0.5) {
    const v = shown(f);
    if (v !== last && f - lastF >= 2.1) { ev.push({f, kind: 'tick', src, pitch: 1 + 0.03 * ((f - f0) / dur)}); lastF = f; last = v; }
  }
  return {value, shown, ev};
}

// ---------- arrive: a panel moves in; whoosh scaled to its speed, land when it settles ----------
export function arrive(f0: number, dur: number, dist: number, curve: Curve = 'snapOut', o: {land?: boolean; frameW?: number; src?: string} = {}) {
  const p = (f: number) => prog(f, f0, dur, curve);
  let peak = 0, peakF = f0;
  for (let f = f0; f < f0 + dur; f += 0.5) { const v = Math.abs(p(f + 0.5) - p(f)) * 2 * dist; if (v > peak) { peak = v; peakF = f; } }
  const fw = o.frameW ?? 1080, speed = (peak * 60) / fw; // frame-widths per second
  const ev: Sfx[] = [];
  if (speed > 1.2) {
    const wd = Math.min(54, Math.max(12, dur * 0.6));
    ev.push({f: Math.max(0, peakF - wd * 0.55), kind: 'whoosh', dur: wd, gain: Math.min(0, -10 + Math.log2(speed) * 4), src: o.src});
  }
  if (o.land) { let fl = f0 + dur; for (let f = f0; f <= f0 + dur; f += 0.5) if (p(f) >= 0.97) { fl = f; break; } ev.push({f: fl, kind: 'land', src: o.src}); }
  return {p, ev, speed};
}

// ---------- pops / chimes / clicks ----------
export const pop = (f: number, gain = 0, src?: string): Sfx => ({f, kind: 'pop', gain, src, pitch: 1 + (rnd(f) - 0.5) * 0.1});
export const chime = (f: number, gain = 0, src?: string): Sfx => ({f, kind: 'chime', gain, src});
export const click = (f: number, gain = 0, src?: string): Sfx => ({f, kind: 'click', gain, src});
export const flow = (f0: number, dur: number, src?: string): Sfx => ({f: f0, kind: 'data', dur, src});
export const stepped = (frames: number[], src?: string): Sfx[] => frames.map((f, i) => ({f, kind: 'mech', src, pitch: 1 + (rnd(i * 7 + f) - 0.5) * 0.08}));

// ---------- cursor: a path through points with dwell + clicks ----------
export type CurPt = {f: number; x: number; y: number; click?: boolean};
export function cursorPath(pts: CurPt[], curve: Curve = 'swift2') {
  const at = (f: number) => {
    if (f <= pts[0].f) return {x: pts[0].x, y: pts[0].y, press: 0};
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (f <= b.f) { const t = ease((f - a.f) / (b.f - a.f), curve); return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, press: press(f)}; }
    }
    const l = pts[pts.length - 1]; return {x: l.x, y: l.y, press: press(f)};
  };
  const clicks = pts.filter((p) => p.click).map((p) => p.f);
  const press = (f: number) => { for (const c of clicks) { const d = f - c; if (d >= -2 && d < 10) return d < 0 ? (d + 2) / 2 : 1 - d / 10; } return 0; };
  return {at, clicks, ev: clicks.map((f) => click(f))};
}
