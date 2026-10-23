// Replays a camera curve MEASURED from a reference video (tools/camera_curve.py -> public/cameras/<id>.json):
// per frame cumulative zoom / pan / roll inside each shot. Wrap a scene in <RefCamera id shot> and lay the scene out
// as it looks on the shot's FIRST frame; the measured curve then moves it exactly like the reference camera did.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Shot = {start: number; end: number; z: number[]; x: number[]; y: number[]; r: number[]};
const cache: Record<string, {fps: number; shots: Shot[]}> = {};

export const useCamera = (id: string) => {
  const [data, setData] = React.useState(cache[id]);
  const [h] = React.useState(() => (cache[id] ? null : delayRender(`camera ${id}`)));
  React.useEffect(() => {
    if (cache[id]) return;
    fetch(staticFile(`cameras/${id}.camera.json`)).then((r) => r.json()).then((j) => { cache[id] = j; setData(j); if (h !== null) continueRender(h); });
  }, [id, h]);
  return data;
};

// sample shot curve at local time (seconds), linear between measured frames, scaled by `amount` (1 = exact)
export const camAt = (shot: Shot, fps: number, t: number, amount = 1) => {
  const n = shot.z.length, fi = Math.max(0, Math.min(n - 1, t * fps)), a = Math.floor(fi), b = Math.min(n - 1, a + 1), u = fi - a;
  const L = (arr: number[]) => arr[a] + (arr[b] - arr[a]) * u;
  return {z: Math.pow(L(shot.z), amount), x: L(shot.x) * amount, y: L(shot.y) * amount, r: L(shot.r) * amount};
};

// `at` = the shot's start time in the reference (seconds, as printed by camera_curve.py)
export const RefCamera: React.FC<{id: string; at: number; from?: number; amount?: number; children: React.ReactNode}> = ({id, at, from = 0, amount = 1, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const data = useCamera(id);
  if (!data) return null;
  const s = data.shots.reduce((b, x) => (Math.abs(x.start - at) < Math.abs(b.start - at) ? x : b), data.shots[0]);
  const c = camAt(s, data.fps, (f - from) / fps, amount);
  return (
    <AbsoluteFill style={{transform: `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg) scale(${c.z})`, transformOrigin: '50% 50%'}}>
      {children}
    </AbsoluteFill>
  );
};

// Scene-sequenced camera: for a clone made of scenes with durations `durs` (in the clone's own frame units),
// scene i gets the i-th MOVING shot of the reference, time-stretched to the scene length. Zoom is clamped and the
// frame over-scanned so our layouts never reveal edges.
export const CamSeq: React.FC<{id: string; durs: number[]; scale?: number; amount?: number; children: React.ReactNode}> = ({id, durs, scale = 1, amount = 1, children}) => {
  const f = useCurrentFrame() / scale;
  const data = useCamera(id);
  if (!data) return null;
  const moving = data.shots.filter((s) => {
    const n = s.z.length - 1;
    return s.end - s.start > 0.5 && (Math.abs(s.z[n] - 1) > 0.05 || Math.abs(s.x[n]) + Math.abs(s.y[n]) > 60 || Math.abs(s.r[n]) > 2);
  });
  let acc = 0, i = 0;
  while (i < durs.length - 1 && f >= acc + durs[i]) { acc += durs[i]; i++; }
  const s = moving[i % Math.max(1, moving.length)] ?? data.shots[0];
  const u = Math.min(1, (f - acc) / durs[i]);
  const c = camAt(s, data.fps, u * (s.end - s.start), amount);
  const z = Math.min(3.2, Math.max(0.6, c.z)); // keep the reference's big zooms (only extreme 7x is capped)
  const r = Math.max(-25, Math.min(25, c.r));
  // never reveal frame edges: total scale covers the rotated frame, pans limited to the spare margin
  const need = 1.04 + Math.abs(r) * 0.03, outer = Math.max(1.12, need / z), total = outer * z;
  const pan = (v: number, half: number) => { const m = ((total - need) * half) / outer; return Math.max(-m, Math.min(m, v * 0.8)); };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${outer}) translate(${pan(c.x, 960)}px, ${pan(c.y, 540)}px) rotate(${r}deg) scale(${z})`, transformOrigin: '50% 50%'}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Smooth keyframed camera (replaces CamSeq replay): each scene glides in with a gentle push (quick start, never stops),
// and scenes hand off with a short zoom-through + motion blur. No measured shake, no roll, no slow-mo zooms.
export const SmoothCam: React.FC<{durs: number[]; scale?: number; children: React.ReactNode}> = ({durs, scale = 1, children}) => {
  const f = useCurrentFrame() / scale;
  let acc = 0, i = 0;
  while (i < durs.length - 1 && f >= acc + durs[i]) { acc += durs[i]; i++; }
  const d = durs[i], lf = f - acc;
  const cl = (v: number) => Math.max(0, Math.min(1, v));
  const glide = 1 - Math.pow(1 - cl(lf / d), 3);
  const inn = i ? 1 - Math.pow(cl(lf / 6), 0.5) : 0, out = i < durs.length - 1 ? Math.pow(cl((lf - (d - 5)) / 5), 2) : 0;
  const z = 1 + 0.06 * glide - 0.05 * inn + 0.14 * out;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 6}px)` : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
