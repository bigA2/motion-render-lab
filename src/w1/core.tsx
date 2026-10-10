import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import tl from './timeline.json';

export const FPS = 30;
export const VO = tl.vo;
export type SceneId = keyof typeof tl.scenes;
export const SC = tl.scenes as Record<SceneId, [number, number]>;
export const ORDER: SceneId[] = ['meet', 'pain', 'type', 'build', 'stats', 'founder', 'cta'];
export const TOTAL_FRAMES = Math.round(tl.total * FPS);
export const vf = (k: keyof typeof tl.vo, plus = 0) => Math.round((tl.vo[k] + plus) * FPS);

// World "stations": one per scene. The camera flies between them (forward = fly-through, x = whip, y = drop).
export const O: Record<SceneId, [number, number, number]> = {
  meet: [0, 0, 0], pain: [0, 0, -34], type: [34, 0, -34], build: [34, 0, -68],
  stats: [68, 0, -68], founder: [68, -34, -68], cta: [102, -34, -68],
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const INOUT = Easing.bezier(0.76, 0, 0.24, 1);
export const e = (f: number, a: number, b: number, from = 0, to = 1, easing = EXPO) => interpolate(f, [a, b], [from, to], {...clamp, easing});
export const spr = (f: number, at: number, damping = 12, stiffness = 170, mass = 0.8) => spring({frame: f - at, fps: FPS, config: {damping, stiffness, mass}});
// damped wobble after an impact (squash & stretch)
export const wob = (f: number, at: number, amp = 0.35, decay = 5, freq = 2.1) => (f < at ? 0 : -amp * Math.exp(-(f - at) / decay) * Math.cos((f - at) / freq));
export const blinkAt = (f: number, off = 0, every = 64) => {
  const m = (f + off) % every;
  return Math.max(0, 1 - Math.abs(m - 3) / 3);
};
export const lerp3 = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i] - x) * t) as [number, number, number];

type CamState = {p: [number, number, number]; t: [number, number, number]; roll: number; fov: number};
const orbit = (az: number, el: number, r: number, c: [number, number, number] = [0, 0, 0]): [number, number, number] => [
  c[0] + r * Math.sin(az) * Math.cos(el), c[1] + r * Math.sin(el), c[2] + r * Math.cos(az) * Math.cos(el),
];

// Local camera per scene (lf = local frame). `w` = 16:9 layout.
const CAM: Record<SceneId, (lf: number, w: boolean) => Omit<CamState, 'fov'> & {fov?: number}> = {
  pain: (lf) => ({p: [-0.4 + 0.8 * e(lf, 0, 126, 0, 1, Easing.linear), 0.05, 8.4 - 0.6 * e(lf, 0, 126)], t: [0, 0, 0], roll: 0.012}),
  meet: (lf, w) => ({p: [-0.5 + 0.5 * e(lf, 0, 70), 0.1, 8.6 - 1.0 * e(lf, 0, 132, 0, 1, Easing.out(Easing.quad))], t: [0, w ? 0 : 0.3, 0], roll: -0.015 + 0.015 * e(lf, 0, 60)}),
  type: (lf) => ({p: [0.2 - 0.4 * e(lf, 0, 138, 0, 1, Easing.linear), 0.1, 8.2], t: [0, 0, 0], roll: 0}),
  build: (lf, w) => ({p: orbit(-0.24 + 0.44 * e(lf, 0, 138, 0, 1, Easing.inOut(Easing.quad)), 0.1, 9.4 - 0.9 * e(lf, 0, 138)), t: [0, w ? 0.15 : 0.1, 0], roll: 0}),
  stats: (lf, w) => {
    const c: [number, number, number] = w ? [0, 0, 0] : [0, 0.3, 0];
    return {p: orbit(0.42 - 0.6 * e(lf, 0, 246, 0, 1, Easing.inOut(Easing.quad)), 0.12, 9.6 - 1.2 * e(lf, 0, 246)), t: c, roll: 0};
  },
  founder: (lf) => ({p: [0.4 - 0.8 * e(lf, 0, 132, 0, 1, Easing.linear), 0, 8.4 - 0.5 * e(lf, 0, 132)], t: [0, 0, 0], roll: -0.01}),
  cta: (lf) => ({p: [0, 0.05, 9.4 - 1.2 * e(lf, 0, 90)], t: [0, 0, 0], roll: 0}),
};
// Camera shake events (frame, strength)
const SHAKES: [number, number][] = []; // founder rule: no camera shake

export const HALF = 9; // half-length of a flight between stations (frames)
const sceneAt = (f: number) => {
  for (let i = 0; i < ORDER.length; i++) if (f < SC[ORDER[i]][1]) return i;
  return ORDER.length - 1;
};
const worldCam = (i: number, f: number, w: boolean) => {
  const id = ORDER[i];
  const c = CAM[id](f - SC[id][0], w);
  const o = O[id];
  return {p: lerp3(c.p, [0, 0, 0], 0).map((x, k) => x + o[k]) as [number, number, number], t: c.t.map((x, k) => x + o[k]) as [number, number, number], roll: c.roll, fov: c.fov};
};
export const camAt = (f: number, w: boolean): CamState => {
  const baseFov = w ? 30 : 41;
  const i = sceneAt(f);
  const [a, b] = SC[ORDER[i]];
  let c = worldCam(i, f, w);
  let fov = baseFov;
  let pair: [number, number, number] | null = null;
  if (i > 0 && f < a + HALF) pair = [i - 1, i, (f - (a - HALF)) / (2 * HALF)];
  else if (i < ORDER.length - 1 && f >= b - HALF) pair = [i, i + 1, (f - (b - HALF)) / (2 * HALF)];
  if (pair) {
    const [x, y, raw] = pair;
    const p = INOUT(Math.max(0, Math.min(1, raw)));
    const A = worldCam(x, f, w);
    const B = worldCam(y, f, w);
    const bump = Math.sin(Math.PI * Math.max(0, Math.min(1, raw)));
    const dir = O[ORDER[y]][0] - O[ORDER[x]][0] !== 0 ? 1 : 0;
    c = {p: lerp3(A.p, B.p, p), t: lerp3(A.t, B.t, p), roll: A.roll + (B.roll - A.roll) * p + bump * 0.1 * (dir ? -1 : 0.5), fov: undefined};
    fov += bump * 9;
  }
  let sh = 0;
  for (const [at, s] of SHAKES) if (f >= at && f < at + 14) sh += s * Math.exp(-(f - at) / 4);
  const n = (k: string) => noise2D(k, f / 1.6, 0) * sh * 0.09;
  return {p: [c.p[0] + n('x'), c.p[1] + n('y'), c.p[2]], t: [c.t[0] + n('tx'), c.t[1] + n('ty'), c.t[2]], roll: c.roll + n('r') * 0.3, fov};
};

// Apply camAt to the R3F camera (all three canvases share it, so blur layers stay locked to the main scene).
export const CamRig: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {camera} = useThree();
  const c = camAt(f, width > height);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...c.p);
  cam.up.set(0, 1, 0);
  cam.lookAt(...c.t);
  cam.rotateZ(c.roll);
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 220;
  cam.updateProjectionMatrix();
  return null;
};

// Screen-space position (px) of a world point at frame f, for anchoring HTML to 3D.
const tmpCam = new THREE.PerspectiveCamera();
export const project = (world: THREE.Vector3 | [number, number, number], f: number, W: number, H: number): [number, number, number] => {
  const c = camAt(f, W > H);
  tmpCam.fov = c.fov;
  tmpCam.aspect = W / H;
  tmpCam.near = 0.1;
  tmpCam.far = 220;
  tmpCam.position.set(...c.p);
  tmpCam.up.set(0, 1, 0);
  tmpCam.lookAt(...c.t);
  tmpCam.rotateZ(c.roll);
  tmpCam.updateMatrixWorld();
  tmpCam.updateProjectionMatrix();
  const v = (Array.isArray(world) ? new THREE.Vector3(...world) : world.clone()).project(tmpCam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z];
};
export const at3 = (id: SceneId, local: [number, number, number] | THREE.Vector3) => {
  const o = O[id];
  const v = Array.isArray(local) ? new THREE.Vector3(...local) : local.clone();
  return v.add(new THREE.Vector3(...o));
};
export const mounted = (id: SceneId, f: number, pad = HALF + 3) => f >= SC[id][0] - pad && f < SC[id][1] + pad;

// Direction of the flight leaving scene i (for HTML overlay exits matching the camera move).
export const flight = (id: SceneId): 'x' | 'z' | 'y' | null => {
  const i = ORDER.indexOf(id);
  if (i >= ORDER.length - 1) return null;
  const a = O[id];
  const b = O[ORDER[i + 1]];
  if (b[0] !== a[0]) return 'x';
  if (b[1] !== a[1]) return 'y';
  return 'z';
};
