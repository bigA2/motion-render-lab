// Curve vocabulary for P05–P07. Pure TS (no React) so the SFX dump can import it. MIT, our own code.
export type Bez = readonly [number, number, number, number];
export const C = {
  linear: [0, 0, 1, 1],
  snapOut: [0, 0, 0, 1],          // instant start, long settle: moves, scale pops
  hitDecay: [0, 1, 0.2, 1],       // shake / blur dropping to 0 after an impact
  inHard: [1, 0, 1, 0],           // accelerate into a cut
  swift: [0.7, 0, 0.41, 1],       // strong in-out: text slides, wipes
  swift2: [0.65, 0, 0.23, 1],
  softOut: [0, 0.4, 0.5, 1],      // UI settling
  flyAccel: [0, 0.32, 1, 1],      // camera charging into depth
  slideOut: [0.82, 0, 1, 0.25],   // slide pair, leaving
  slideIn: [0, 0.75, 0.18, 1],    // slide pair, arriving
  glide: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, Bez>;
export type CurveName = keyof typeof C;
export type Curve = CurveName | Bez | 'spring';

const cache = new Map<string, (t: number) => number>();
export function bezier([x1, y1, x2, y2]: Bez): (t: number) => number {
  const key = `${x1},${y1},${x2},${y2}`;
  const hit = cache.get(key); if (hit) return hit;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const solve = (x: number) => { // bisection: robust for x1=x2=0 style curves
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 40; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-7) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return t;
  };
  const fn = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
  cache.set(key, fn); return fn;
}
/** elastic settle (UI chips/buttons): ~16 % overshoot, 2.5 half-wobbles, continuous at 0 and 1 */
export const springEase = (t: number, decay = 5) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * decay) * (1 - t) - 0 * t);
export const ease = (t: number, c: Curve = 'softOut') => {
  const x = Math.min(1, Math.max(0, t));
  if (c === 'spring') return springEase(x);
  return bezier(typeof c === 'string' ? C[c] : c)(x);
};
export const prog = (f: number, start: number, dur: number, c: Curve = 'softOut') => ease(dur <= 0 ? (f >= start ? 1 : 0) : (f - start) / dur, c);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** deterministic hash noise 0..1 */
export const rnd = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** smooth 1D value noise -1..1 */
export const noise1 = (t: number, seed = 0) => {
  const i = Math.floor(t), fr = t - i, u = fr * fr * (3 - 2 * fr);
  return lerp(rnd(i + seed * 101) * 2 - 1, rnd(i + 1 + seed * 101) * 2 - 1, u);
};
