// Motion kit distilled from the tutorial transcripts (KB: AE_TECHNIQUES_FROM_TUTORIALS_2026-10-23.md).
import {Easing, interpolate} from 'remotion';

// AE graph editor with the influence pulled in: fast start, long soft landing (the "premium" ease)
export const PREMIUM = Easing.bezier(0.12, 0.85, 0.15, 1);
// AE easy ease (33%) and a stronger symmetric in-out for camera nulls
export const EASY = Easing.bezier(0.33, 0, 0.67, 1);
export const CAMERA = Easing.bezier(0.6, 0, 0.15, 1);

// AE inertial bounce expression (amp .05, freq 4, decay 8) applied after a keyframe that ends at `end` (frames)
export const bounce = (f: number, end: number, fps: number, velocity: number, amp = 0.05, freq = 4, decay = 8) => {
  const t = (f - end) / fps;
  if (t <= 0) return 0;
  return velocity * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
};

// keyframe + bounce in one call: value goes a->b over [s,e] with PREMIUM ease then overshoots/settles
export const kb = (f: number, s: number, e: number, a: number, b: number, fps = 60, ease = PREMIUM) => {
  const v = interpolate(f, [s, e], [a, b], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return v + bounce(f, e, fps, (b - a) / Math.max(1, (e - s) / fps));
};

// range-selector text reveal per word (opacity 0, blur 15, y +100 -> rest), offset sweep over [s,e]
export const wordReveal = (f: number, i: number, n: number, s: number, e: number, spread = 0.45) => {
  const p = interpolate(f, [s, e], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const local = Math.min(1, Math.max(0, (p * (1 + spread) - i / Math.max(1, n)) / spread));
  const a = Easing.bezier(0.7, 0, 0.15, 1)(local);
  return {opacity: a, filter: `blur(${(1 - a) * 15}px)`, transform: `translateY(${(1 - a) * 100}px)`};
};

// 3D-camera null with Z-depth parallax: a layer at depth z (0 = focal plane, + = far) moves less than the camera
export const parallax = (camX: number, camY: number, camZoom: number, z: number) => {
  const depth = 1 / (1 + z / 1000);
  return `translate(${-camX * depth}px, ${-camY * depth}px) scale(${1 + (camZoom - 1) * depth})`;
};
