// Procedural 3D John (code-only, img2threejs-style reconstruction from the 2D Open Peeps John): soft clay toy,
// full face rig (eyes + pupils + lids, brows, mouth curve + open jaw, cheeks), squash & stretch like the intro orb,
// emotion keyframes with springy blends, blinks, breathing, talk amplitude from the VO.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBox} from '@react-three/drei';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Emo = 'neutral' | 'tired' | 'frustrated' | 'surprised' | 'happy' | 'relieved' | 'focused' | 'sleepy';
type P = {lid: number; lidLow: number; browY: number; browA: number; smile: number; open: number; tilt: number; pitch: number; lookX: number; lookY: number; blush: number; slump: number; armUp: number};
const E: Record<Emo, P> = {
  neutral:    {lid: 0.12, lidLow: 0,    browY: 0,     browA: 0,     smile: 0.15, open: 0,    tilt: 0,     pitch: 0,     lookX: 0,    lookY: 0,     blush: 0,   slump: 0,   armUp: 0},
  tired:      {lid: 0.55, lidLow: 0.12, browY: -0.03, browA: -0.25, smile: -0.25, open: 0,   tilt: 0.12,  pitch: 0.12,  lookX: 0,    lookY: -0.25, blush: 0,   slump: 0.6, armUp: 0},
  sleepy:     {lid: 0.85, lidLow: 0.2,  browY: -0.04, browA: -0.3,  smile: -0.1, open: 0.05, tilt: 0.22,  pitch: 0.22,  lookX: 0,    lookY: -0.4,  blush: 0,   slump: 0.9, armUp: 0},
  frustrated: {lid: 0.3,  lidLow: 0.1,  browY: -0.07, browA: 0.55,  smile: -0.7, open: 0.15, tilt: -0.05, pitch: 0.04,  lookX: 0.25, lookY: -0.1,  blush: 0,   slump: 0.3, armUp: 0},
  surprised:  {lid: 0,    lidLow: 0,    browY: 0.12,  browA: -0.1,  smile: 0,    open: 0.55, tilt: 0,     pitch: -0.08, lookX: 0,    lookY: 0.05,  blush: 0,   slump: 0,   armUp: 0},
  focused:    {lid: 0.25, lidLow: 0.05, browY: -0.02, browA: 0.2,   smile: 0.05, open: 0,    tilt: -0.04, pitch: 0.08,  lookX: -0.2, lookY: -0.2,  blush: 0,   slump: 0.2, armUp: 0},
  happy:      {lid: 0.08, lidLow: 0.18, browY: 0.06,  browA: -0.15, smile: 0.95, open: 0.3,  tilt: 0.08,  pitch: -0.04, lookX: 0,    lookY: 0.05,  blush: 1,   slump: 0,   armUp: 0.4},
  relieved:   {lid: 0.45, lidLow: 0.2,  browY: 0.05,  browA: -0.25, smile: 0.8,  open: 0.05, tilt: -0.12, pitch: -0.15, lookX: 0,    lookY: 0.1,   blush: 0.7, slump: 0,   armUp: 1},
};
const KEYS = Object.keys(E.neutral) as (keyof P)[];

const skinC = '#8A5634', hairC = '#16110E', hoodC = '#3B47A8', hoodIn = '#2A3380', white = '#FBF8F4', pupilC = '#1A1210';
const mat = (color: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => new THREE.MeshPhysicalMaterial({color, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.6, ...o});

// deterministic hash for hair curls
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const John3D: React.FC<{keys: {at: number; e: Emo}[]; talk?: (f: number) => number; position?: [number, number, number]; scale?: number; enterAt?: number; lookAt?: (f: number) => [number, number] | null}> = ({keys, talk, position = [0, 0, 0], scale = 1, enterAt = 0, lookAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const M = useMemo(() => ({skin: mat(skinC), hair: mat(hairC, {roughness: 0.75, sheen: 0.9, sheenColor: new THREE.Color('#5a4636')}), hood: mat(hoodC, {roughness: 0.8, clearcoat: 0, sheen: 1, sheenColor: new THREE.Color('#9aa6ff')}), hoodIn: mat(hoodIn, {roughness: 0.85, clearcoat: 0}), white: mat(white, {roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05}), pupil: mat(pupilC, {roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0}), mouth: mat('#2A0C10', {roughness: 0.9, clearcoat: 0, sheen: 0}), tongue: mat('#D8636A', {roughness: 0.5}), blush: new THREE.MeshBasicMaterial({color: '#FF7F7F', transparent: true, opacity: 0, depthWrite: false}), shine: new THREE.MeshBasicMaterial({color: '#ffffff'})}), []);
  const curls = useMemo(() => Array.from({length: 46}, (_, i) => { const th = rnd(i) * Math.PI * 2, ph = 0.15 + rnd(i + 99) * 0.95; return {p: [Math.sin(ph) * Math.cos(th) * 1.0, 0.25 + Math.cos(ph) * 1.0, Math.sin(ph) * Math.sin(th) * 1.0 - 0.08] as [number, number, number], r: 0.26 + rnd(i + 7) * 0.14}; }).filter((c) => c.p[2] < 0.35 && c.p[1] > 0.55), []);

  // ---- emotion blend with springy transitions + squash pulse on each change ----
  let ki = 0; for (let i = 0; i < keys.length; i++) if (f >= keys[i].at) ki = i;
  const cur = E[keys[ki].e], prev = E[keys[Math.max(0, ki - 1)].e];
  const since = f - keys[ki].at;
  const k = ki === 0 ? 1 : spring({frame: since, fps, config: {damping: 13, stiffness: 140, mass: 0.7}});
  const p = {} as P; for (const key of KEYS) p[key] = prev[key] + (cur[key] - prev[key]) * k;
  const pulse = ki === 0 ? 0 : Math.sin(Math.min(1, since / 9) * Math.PI) * Math.exp(-since / 14);
  const frustrated = keys[ki].e === 'frustrated';

  // ---- life: breathing, idle sway, blink, talk ----
  const t = f / fps;
  const breathe = Math.sin(t * 2.1) * 0.018;
  const sway = Math.sin(t * 0.9) * 0.04;
  const blinkPhase = (f + 23) % 97; const blink = blinkPhase < 5 ? Math.sin((blinkPhase / 5) * Math.PI) : 0;
  const tk = talk ? talk(f) : 0;
  const lid = Math.min(1, p.lid + blink * (1 - p.lid));
  const shake = frustrated ? Math.sin(since * 1.9) * 0.09 * Math.exp(-since / 20) : 0;
  const look = lookAt ? lookAt(f) : null;
  const lx = look ? look[0] : p.lookX + Math.sin(t * 0.7) * 0.05, ly = look ? look[1] : p.lookY;
  const enter = spring({frame: f - enterAt, fps, config: {damping: 11, stiffness: 120}});
  const sq = 1 + pulse * 0.12; // squash & stretch

  const mouthW = 0.42 + p.smile * 0.06, open = Math.min(0.75, p.open + tk * 0.55);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(-mouthW / 2, p.smile * 0.11, -0.02), new THREE.Vector3(0, -p.smile * 0.16, 0.04), new THREE.Vector3(mouthW / 2, p.smile * 0.11, -0.02)), [mouthW, p.smile]);
  const lipGeo = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.034, 12, false), [curve]);

  const Eye: React.FC<{side: 1 | -1}> = ({side}) => (
    <group position={[0.33 * side, 0.14, 0.83]} rotation={[0, 0.28 * side, 0]}>
      <mesh material={M.white} scale={[1, 1.12, 0.62]}><sphereGeometry args={[0.21, 32, 24]} /></mesh>
      <group position={[lx * 0.08, ly * 0.07, 0.11]}>
        <mesh material={M.pupil} scale={[1, 1.1, 0.5]}><sphereGeometry args={[0.095, 24, 16]} /></mesh>
        <mesh material={M.shine} position={[0.035, 0.045, 0.05]}><sphereGeometry args={[0.03, 12, 8]} /></mesh>
      </group>
      {/* upper lid: skin cap rotating down over the eye */}
      <mesh material={M.skin} rotation={[-1.2 + lid * 1.55, 0, 0]} scale={[1.07, 1.16, 0.68]}><sphereGeometry args={[0.212, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      {/* lower lid (cheek push / smile squint) */}
      <mesh material={M.skin} rotation={[-(0.15 + p.lidLow * 0.85), 0, 0]} scale={[1.07, 1.16, 0.68]}><sphereGeometry args={[0.212, 32, 12, 0, Math.PI * 2, Math.PI - 1.0, 1.0]} /></mesh>
      {/* brow */}
      <group position={[0, 0.3 + p.browY + pulse * 0.03, 0.12]} rotation={[0, 0, side * p.browA * 0.6]}>
        <RoundedBox args={[0.32, 0.075, 0.08]} radius={0.035} smoothness={4} material={M.hair} />
      </group>
    </group>
  );

  return (
    <group position={[position[0], position[1] - (1 - enter) * 3, position[2]]} scale={scale * Math.max(0.001, enter)}>
      <group rotation={[0, sway, 0]} scale={[1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)]}>
        {/* body: hoodie */}
        <group position={[0, -2.05 - p.slump * 0.12, 0]} rotation={[0.1 + p.slump * 0.18, 0, 0]} scale={[1 + breathe, 1 + breathe * 1.5, 1 + breathe]}>
          <mesh material={M.hood} scale={[1.25, 1, 0.85]}><capsuleGeometry args={[0.85, 0.9, 12, 32]} /></mesh>
          <mesh material={M.hoodIn} position={[0, 0.95, 0.15]} rotation={[0.35, 0, 0]} scale={[1, 0.55, 0.6]}><torusGeometry args={[0.55, 0.16, 16, 40]} /></mesh>
          <mesh material={M.white} position={[-0.18, 0.45, 0.72]} scale={[1, 3, 1]}><sphereGeometry args={[0.035, 8, 8]} /></mesh>
          <mesh material={M.white} position={[0.18, 0.45, 0.72]} scale={[1, 3, 1]}><sphereGeometry args={[0.035, 8, 8]} /></mesh>
          {/* arms */}
          {([1, -1] as const).map((s) => (
            <group key={s} position={[1.05 * s, 0.55, 0]} rotation={[0, 0, s * (0.35 + p.armUp * 2.4 + Math.sin(t * 1.3 + s) * 0.03)]}>
              <mesh material={M.hood} position={[0, -0.75, 0]}><capsuleGeometry args={[0.3, 1.0, 8, 20]} /></mesh>
              <mesh material={M.skin} position={[0, -1.45, 0]}><sphereGeometry args={[0.27, 20, 16]} /></mesh>
            </group>
          ))}
        </group>
        {/* neck */}
        <mesh material={M.skin} position={[0, -1.0, -0.05]}><cylinderGeometry args={[0.32, 0.36, 0.5, 20]} /></mesh>
        {/* head */}
        <group position={[0, 0.02 + breathe * 2, 0]} rotation={[p.pitch + pulse * 0.08 + p.slump * 0.08, shake + lx * 0.12, p.tilt + Math.sin(t * 1.1) * 0.025]}>
          <mesh material={M.skin} scale={[1, 1.06, 0.96]}><sphereGeometry args={[1, 64, 48]} /></mesh>
          {/* ears */}
          <mesh material={M.skin} position={[0.98, 0.02, -0.05]} scale={[0.5, 1, 0.8]}><sphereGeometry args={[0.24, 20, 16]} /></mesh>
          <mesh material={M.skin} position={[-0.98, 0.02, -0.05]} scale={[0.5, 1, 0.8]}><sphereGeometry args={[0.24, 20, 16]} /></mesh>
          {/* hair: curly cap */}
          <mesh material={M.hair} position={[0, 0.42, -0.2]} scale={[1.03, 0.8, 0.98]}><sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} /></mesh>
          {Array.from({length: 13}, (_, i) => { const a = -1.25 + i * (2.5 / 12); return <mesh key={'h' + i} material={M.hair} position={[Math.sin(a) * 0.93, 0.58 + Math.cos(a * 1.4) * 0.12, Math.cos(a) * 0.42]}><sphereGeometry args={[0.2 + rnd(i + 50) * 0.06, 14, 10]} /></mesh>; })}
          {curls.map((c, i) => <mesh key={i} material={M.hair} position={c.p} scale={1 + Math.sin(t * 2 + i) * 0.01}><sphereGeometry args={[c.r, 14, 10]} /></mesh>)}
          {/* nose */}
          <mesh material={M.skin} position={[0, -0.12, 0.98]} scale={[1, 0.85, 0.9]}><sphereGeometry args={[0.15, 24, 16]} /></mesh>
          <Eye side={1} /><Eye side={-1} />
          {/* cheeks blush */}
          {([1, -1] as const).map((s) => <mesh key={s} position={[0.55 * s, -0.22, 0.8]} rotation={[0, 0.5 * s, 0]} material={M.blush} material-opacity={p.blush * 0.45}><circleGeometry args={[0.16, 24]} /></mesh>)}
          {/* mouth: closed = lip curve; open = D-shaped grin (flat top, round bottom) with teeth + tongue */}
          <group position={[0, -0.47 - p.smile * 0.02, 0.89]} rotation={[-0.2, 0, 0]}>
            {open > 0.12 && <group position={[0, p.smile * 0.05, -0.03]} scale={[mouthW * 1.08, Math.max(0.02, open * 0.3 + Math.max(0, p.smile - 0.4) * 0.08), 0.12]}>
              <mesh material={M.mouth}><sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, Math.PI / 2 - (p.smile > 0.3 ? 0.05 : 0.9), Math.PI / 2 + (p.smile > 0.3 ? 0.05 : 0.9)]} /></mesh>
              {p.smile > 0.3 && <mesh material={M.white} position={[0, -0.12, 0.55]} scale={[0.82, 0.22, 0.3]}><sphereGeometry args={[1, 20, 10]} /></mesh>}
              {open > 0.2 && <mesh material={M.tongue} position={[0, -0.72, 0.35]} scale={[0.5, 0.25, 0.4]}><sphereGeometry args={[1, 16, 12]} /></mesh>}
            </group>}
            {open < 0.3 && <mesh geometry={lipGeo} material={M.mouth} scale={[1, 1, 1]} />}
          </group>
        </group>
      </group>
    </group>
  );
};

// talk amplitude from a list of VO line windows (frames) — smooth syllable-like flap, silent between lines
export const talkFrom = (lines: {from: number; to: number}[]) => (f: number) => {
  for (const l of lines) if (f >= l.from && f < l.to) {
    const t = f - l.from, env = interpolate(t, [0, 3, l.to - l.from - 4, l.to - l.from], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return env * (0.45 + 0.35 * Math.abs(Math.sin(t * 0.85)) + 0.2 * Math.abs(Math.sin(t * 2.3 + 1)));
  }
  return 0;
};
