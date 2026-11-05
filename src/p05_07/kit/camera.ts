// Camera maths for <CameraRig>: a virtual camera (null parent) that glides between subjects, can follow a
// moving target, and is smoothed by a critically damped spring (soft settle, no overshoot). Pure TS. MIT.
import {Curve, ease, lerp} from './curves';
import {Sfx} from './events';

export type Cam = {x: number; y: number; zoom: number; roll: number; yaw: number; pitch: number; dolly: number};
export const CAM0: Cam = {x: 0, y: 0, zoom: 1, roll: 0, yaw: 0, pitch: 0, dolly: 0};
type Target = Partial<Cam> | ((f: number) => Partial<Cam>);
/** A move: from frame f, over dur frames, ease to `to` (a fixed framing or a function = follow a subject). */
export type Move = {f: number; dur: number; to: Target; curve?: Curve; cut?: boolean; stiff?: number};

const KEYS: (keyof Cam)[] = ['x', 'y', 'zoom', 'roll', 'yaw', 'pitch', 'dolly'];
const resolveT = (t: Target, f: number) => (typeof t === 'function' ? t(f) : t);

export class Camera {
  private raw: Cam[] = []; private sm: Cam[] = []; private cuts = new Set<number>();
  constructor(public moves: Move[], public frames: number, public w: number, public h: number, start: Partial<Cam> = {}, public omega = 6.5) {
    const ms = [...moves].sort((a, b) => a.f - b.f);
    let base: Cam = {...CAM0, ...start}; let i = -1;
    for (let f = 0; f < frames; f++) {
      while (i + 1 < ms.length && ms[i + 1].f <= f) { i++; if (f > 0) base = this.raw[f - 1]; }
      this.raw.push(i < 0 ? base : this.blend(ms[i], f, base));
    }
    // spring smoothing (critically damped): x'' = w^2 (target - x) - 2 w x'
    const dt = 1 / 60, sub = 4; let x: Cam = {...this.raw[0]}; const v: Record<string, number> = {};
    KEYS.forEach((k) => (v[k] = 0));
    const cutAt = new Set(ms.filter((m) => m.cut).map((m) => m.f)); this.cuts = cutAt;
    for (let f = 0; f < frames; f++) {
      if (cutAt.has(f)) { x = {...this.raw[f]}; KEYS.forEach((k) => (v[k] = 0)); }
      const m = ms.filter((mm) => mm.f <= f).pop(); const w = m?.stiff ?? omega;
      for (let s = 0; s < sub; s++) for (const k of KEYS) {
        const a = w * w * (this.raw[f][k] - x[k]) - 2 * w * v[k];
        v[k] += a * (dt / sub); x = {...x, [k]: x[k] + v[k] * (dt / sub)};
      }
      this.sm.push({...x});
    }
  }
  private blend(m: Move, f: number, base: Cam): Cam {
    const t = m.dur <= 0 ? 1 : ease((f - m.f) / m.dur, m.curve ?? 'inOut');
    const to = resolveT(m.to, f); const out = {...base};
    for (const k of KEYS) if (to[k] !== undefined) out[k] = lerp(base[k], to[k] as number, t);
    return out;
  }
  get(f: number): Cam { const i = Math.max(0, Math.min(this.frames - 1, Math.floor(f))); return this.sm[i] ?? CAM0; }
  /** screen-space velocity of the world point under the centre, px per frame */
  vel(f: number) {
    if (this.cuts.has(Math.floor(f))) return {vx: 0, vy: 0, vz: 0, vr: 0};
    const a = this.get(f - 1), b = this.get(f);
    const s = (b.zoom + a.zoom) / 2 * (1 + (a.dolly + b.dolly) / 2 / 2000);
    return {vx: (b.x - a.x) * s, vy: (b.y - a.y) * s, vz: (b.zoom - a.zoom) * this.h + (b.dolly - a.dolly), vr: b.roll - a.roll};
  }
  speed(f: number) { const v = this.vel(f); return Math.hypot(v.vx, v.vy, v.vz * 0.6); }
  /** whooshes from camera speed peaks (fast moves only), peak of the sound on the fastest frame */
  whooshes(src = 'cam', thr = 1.3): Sfx[] {
    const out: Sfx[] = []; const fw = this.w;
    const sp = Array.from({length: this.frames}, (_, f) => (this.cuts.has(f) || this.cuts.has(f + 1) ? 0 : (this.speed(f) * 60) / fw)); // frame-widths per s
    for (let f = 2; f < this.frames - 2; f++) {
      if (sp[f] > thr && sp[f] >= sp[f - 1] && sp[f] > sp[f + 1]) {
        let a = f, b = f; while (a > 0 && sp[a] > sp[f] * 0.35) a--; while (b < this.frames - 1 && sp[b] > sp[f] * 0.35) b++;
        if (out.length && out[out.length - 1].f + (out[out.length - 1].dur ?? 0) > a) continue;
        out.push({f: a, kind: 'whoosh', dur: Math.max(10, b - a), gain: Math.min(2, -8 + Math.log2(sp[f]) * 4), src});
      }
    }
    return out;
  }
}
