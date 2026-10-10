import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {blinkAt, e, EXPO, mounted, O, ORDER, SC, SceneId, spr, vf, wob} from './core';
import {canvasTex, COL, Gloss, Glyph, IconTile, Keycap, LogoTile, Pip, ribbonGeo, slice, tubeGeo} from './kit3d';

type P = {lf: number; w: boolean};
const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

const checkTex = () =>
  canvasTex('check', 128, 128, (g) => {
    g.beginPath();
    g.arc(64, 64, 60, 0, Math.PI * 2);
    g.fillStyle = COL.green;
    g.fill();
    g.strokeStyle = '#fff';
    g.lineWidth = 13;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(38, 66);
    g.lineTo(56, 84);
    g.lineTo(92, 46);
    g.stroke();
  });

const Shock: React.FC<{lf: number; at: number; pos: [number, number, number]; color?: string; size?: number}> = ({lf, at, pos, color = '#FFFFFF', size = 3.2}) => {
  if (lf < at || lf > at + 22) return null;
  const p = e(lf, at, at + 20);
  return (
    <mesh position={pos} scale={0.3 + p * size}>
      <torusGeometry args={[1, 0.02 + 0.05 * (1 - p), 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={(1 - p) * 0.95} toneMapped={false} />
    </mesh>
  );
};

// ---------------- 2 · Pain ----------------
export const PAIN_TILES = (w: boolean): {g: Glyph; p: [number, number, number]}[] =>
  w
    ? [{g: 'mail', p: [-2.45, 1.35, 0.3]}, {g: 'sheet', p: [0, 1.35, 0.3]}, {g: 'hash', p: [2.45, 1.35, 0.3]}]
    : [{g: 'mail', p: [-1.5, 1.75, 0.3]}, {g: 'sheet', p: [0, 1.75, 0.3]}, {g: 'hash', p: [1.5, 1.75, 0.3]}];
const Pain3D: React.FC<P> = ({lf, w}) => {
  const day = vf('chase') - SC.pain[0];
  return (
    <group>
      {PAIN_TILES(w).map((t, i) => {
        const s = spr(lf, 4 + i * 5, 11, 170);
        const hop = Math.max(0, Math.sin(((lf - 10 - i * 4) / 12) * Math.PI)) * 0.08;
        return <IconTile key={t.g} glyph={t.g} position={[t.p[0], t.p[1] + hop, t.p[2]]} rotation={[0.1, (1 - s) * 3 + Math.sin(lf / 20 + i) * 0.12, 0]} scale={(w ? 0.62 : 0.55) * s} />;
      })}
      <Pip position={w ? [2.85, -1.05, 0.8] : [1.45, -2.0, 0.6]} scale={0.48 * spr(lf, 10)} mood="meh" squash={wob(lf, day, 0.3, 5) + wob(lf, day - 24, 0.2, 5)} blink={blinkAt(lf, 30, 50)} look={[-0.5, 0.2]} tilt={0.1 * Math.sin(lf / 8)} />
      {/* sweat drop */}
      {lf > 30 ? (
        <mesh position={w ? [3.15, -0.68 - ((lf - 30) % 40) * 0.012, 1.2] : [1.72, -1.65 - ((lf - 30) % 40) * 0.012, 1.0]} scale={[0.06, 0.09, 0.06]}>
          <sphereGeometry args={[1, 16, 12]} />
          <Gloss color={COL.icy} />
        </mesh>
      ) : null}
    </group>
  );
};

// ---------------- 3 · Meet (logo smash) ----------------
export const MEET_TILE = (w: boolean): [number, number, number] => (w ? [-2.45, 0.05, 0] : [0, 1.35, 0]);
const Meet3D: React.FC<P> = ({lf, w}) => {
  const T = MEET_TILE(w);
  const hit = 10;
  const fly = e(lf, -6, hit, 0, 1, (x) => x * x * x);
  const start: [number, number, number] = [T[0] - 6, T[1] + 3.5, -4];
  const perch: [number, number, number] = [T[0] + (w ? 1.0 : 0.95), T[1] + (w ? 1.05 : 1.0), 0.3];
  const hop = spr(lf, hit + 4, 10, 120);
  const pipP: [number, number, number] =
    lf < hit ? (start.map((x, i) => x + (T[i] - x) * fly) as [number, number, number]) : (T.map((x, i) => x + (perch[i] - x) * hop + (i === 1 ? Math.sin(hop * Math.PI) * 1.0 : 0)) as [number, number, number]);
  const pipS = lf < hit ? 0.75 : 0.75 - 0.35 * hop;
  const tile = spr(lf, hit + 1, 11, 140);
  return (
    <group>
      <Pip position={pipP} scale={pipS} squash={lf < hit ? 0.35 * fly : wob(lf, hit, 0.55, 5) + wob(lf, hit + 16, 0.25, 4)} tilt={lf < hit ? -0.55 : 0} mood={lf > 40 ? 'happy' : 'wow'} blink={blinkAt(lf, 10, 58)} look={[-0.45, -0.25]} />
      <LogoTile position={[T[0], T[1] + Math.sin(lf / 18) * 0.05, T[2]]} rotation={[0.08, (1 - tile) * Math.PI * 2 + Math.sin(lf / 25) * 0.15, 0]} scale={(w ? 1.45 : 1.3) * tile} />
      <Shock lf={lf} at={hit} pos={T} size={4} />
      <Shock lf={lf} at={hit + 4} pos={T} color={COL.lavLight} size={3} />
    </group>
  );
};

// ---------------- 4 · Type ----------------
const Type3D: React.FC<P> = ({lf, w}) => {
  const s = spr(lf, 16, 12, 140);
  const typing = lf > 35 && lf < 112;
  return (
    <group>
      <Pip position={w ? [2.65, 0.95 - (1 - s) * 1.2, -0.2] : [1.6, 1.4 - (1 - s) * 1.2, -0.2]} scale={0.52} mood={lf > 112 ? 'happy' : 'wow'} squash={typing ? Math.sin(lf / 2.2) * 0.05 : wob(lf, 112, 0.35)} look={[-0.6, -0.5]} blink={blinkAt(lf, 5, 45)} />
    </group>
  );
};

// ---------------- 5 · Build ----------------
export const BUILD_TILES = (w: boolean): [number, number, number][] => (w ? [[-2.8, 0.25, 0], [0, 0.25, 0], [2.8, 0.25, 0]] : [[-1.25, 1.95, 0], [-1.25, 0.2, 0], [-1.25, -1.55, 0]]);
export const BUILD_T = {pop: [10, 22, 34], check: [52, 62, 72]};
const Build3D: React.FC<P> = ({lf, w}) => {
  const T = BUILD_TILES(w);
  const glyphs: Glyph[] = ['mail', 'sheet', 'send'];
  const links = useMemo(
    () =>
      [0, 1].map((i) => {
        const a = V(...T[i]);
        const b = V(...T[i + 1]);
        const d = b.clone().sub(a);
        const n = w ? V(0, 0.55, 0.6) : V(-0.7, 0, 0.5);
        const s = a.clone().addScaledVector(d.clone().normalize(), w ? 0.68 : 0.5);
        const t = b.clone().addScaledVector(d.clone().normalize(), w ? -0.68 : -0.5);
        return tubeGeo([s, s.clone().lerp(t, 0.5).add(n), t], 0.045, 80);
      }),
    [w],
  );
  const tex = checkTex();
  // Pip hops tile -> tile as each step completes
  const hopIdx = lf < BUILD_T.check[0] ? -1 : lf < BUILD_T.check[1] ? 0 : lf < BUILD_T.check[2] ? 1 : 2;
  const pipBase = (i: number) => (i < 0 ? [T[1][0], T[1][1] + (w ? 1.2 : 0), w ? 0.3 : 0] : [T[i][0] + (w ? 0 : 0), T[i][1] + (w ? 0.98 : 0), w ? 0.2 : 0]);
  const from = pipBase(Math.max(-1, hopIdx - 1));
  const to = pipBase(hopIdx);
  const hs = hopIdx < 0 ? 1 : spr(lf, BUILD_T.check[hopIdx], 13, 150);
  const arc = Math.sin(Math.min(1, hs) * Math.PI) * 0.7;
  const pipP: [number, number, number] = w
    ? [from[0] + (to[0] - from[0]) * hs, from[1] + (to[1] - from[1]) * hs + arc + Math.sin(lf / 9) * 0.04, from[2] + (to[2] - from[2]) * hs]
    : [T[0][0] + 1.25 + 1.55, 0.2 + Math.sin(lf / 9) * 0.06, 0];
  return (
    <group>
      {T.map((p, i) => {
        const s = spr(lf, BUILD_T.pop[i], 10, 160);
        const c = spr(lf, BUILD_T.check[i], 10, 200);
        return (
          <group key={i}>
            <IconTile glyph={glyphs[i]} position={[p[0], p[1] + Math.sin((lf + i * 20) / 16) * 0.05, p[2]]} rotation={[0.06, (1 - s) * -3.2 + Math.sin((lf + i * 10) / 30) * 0.1, 0]} scale={(w ? 1.15 : 0.92) * s * (1 + wob(lf, BUILD_T.check[i], 0.12, 4))} />
            {lf > BUILD_T.check[i] ? (
              <mesh position={[p[0] + 0.5, p[1] + 0.5, p[2] + 0.35]} scale={0.22 * c}>
                <circleGeometry args={[1, 40]} />
                <meshBasicMaterial map={tex} transparent toneMapped={false} />
              </mesh>
            ) : null}
            <Shock lf={lf} at={BUILD_T.check[i]} pos={[p[0], p[1], p[2] - 0.1]} color={COL.icy} size={1.8} />
          </group>
        );
      })}
      {links.map((l, i) => {
        const a = BUILD_T.pop[i] + 6;
        slice(l.geo, l.count, 0, e(lf, a, a + 16));
        return (
          <group key={i}>
            <mesh geometry={l.geo}>
              <meshPhysicalMaterial color={COL.lav} emissive={COL.lav} emissiveIntensity={0.25} roughness={0.2} clearcoat={1} />
            </mesh>
            {[0, 1, 2].map((k) => {
              const t = ((lf - a - 18 - k * 9) / 26) % 1;
              if (lf < a + 18 + k * 9) return null;
              const pt = l.curve.getPointAt(Math.max(0, t));
              return (
                <mesh key={k} position={pt} scale={0.085}>
                  <sphereGeometry args={[1, 16, 12]} />
                  <meshBasicMaterial color={COL.orange} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      {w || lf > 70 ? <Pip position={pipP} scale={w ? 0.36 : 0.42 * spr(lf, 70)} mood={hopIdx === 2 ? 'wink' : 'happy'} squash={hopIdx >= 0 ? wob(lf, BUILD_T.check[hopIdx] + 8, 0.35, 4) : 0} blink={blinkAt(lf, 12, 55)} look={[0, -0.3]} /> : null}
    </group>
  );
};

// ---------------- 6 · Stats (orbit rings) ----------------
export const STATS_C = (w: boolean): [number, number, number] => (w ? [-1.95, -0.1, 0] : [0, 1.35, 0]);
const RA = new THREE.Euler(1.02, 0, 0.3);
const RB = new THREE.Euler(1.12, 0, -0.38);
const onRing = (r: number, th: number, eu: THREE.Euler) => V(r * Math.cos(th), r * Math.sin(th), 0).applyEuler(eu);
const Stats3D: React.FC<P> = ({lf, w}) => {
  const C = STATS_C(w);
  const sc = w ? 0.8 : 0.78;
  const t22 = vf('l8') - SC.stats[0];
  const lit = Math.floor(e(lf, t22, t22 + 52, 0, 22, (x) => x));
  const ringIn = e(lf, 0, 26);
  const glyA: Glyph[] = ['mail', 'sheet', 'send', 'cal'];
  const glyB: Glyph[] = ['chat', 'doc', 'cart', 'db', 'bolt', 'hash'];
  return (
    <group position={C} scale={sc}>
      <LogoTile rotation={[0.05, Math.sin(lf / 30) * 0.35, 0]} scale={1.05 * spr(lf, 2, 12, 140)} />
      {[{r: 1.95, eu: RA, n: glyA, sp: 0.012}, {r: 2.85, eu: RB, n: glyB, sp: -0.008}].map((ring, ri) => (
        <group key={ri}>
          <mesh rotation={ring.eu} scale={ring.r * (0.6 + 0.4 * ringIn)}>
            <torusGeometry args={[1, 0.007 / ring.r * 2.2, 8, 160]} />
            <meshBasicMaterial color={ri ? '#B9BBF7' : '#FFFFFF'} transparent opacity={0.9 * ringIn} toneMapped={false} />
          </mesh>
          {ring.n.map((g, k) => {
            const th = (k / ring.n.length) * Math.PI * 2 + lf * ring.sp + ri;
            const p = onRing(ring.r, th, ring.eu);
            const s = spr(lf, 6 + k * 4 + ri * 10, 11, 160);
            return <IconTile key={g} glyph={g} position={[p.x, p.y, p.z]} rotation={[0.1, Math.sin(lf / 25 + k) * 0.25, 0]} scale={0.52 * s} />;
          })}
        </group>
      ))}
      {/* 22 MCP dots on ring A */}
      {Array.from({length: 22}, (_, k) => {
        const p = onRing(1.95, (k / 22) * Math.PI * 2 + lf * 0.012 + 0.14, RA);
        const on = k < lit;
        return (
          <mesh key={k} position={p} scale={on ? 0.07 : 0.04}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshBasicMaterial color={on ? COL.orange : '#D8D9FA'} toneMapped={false} />
          </mesh>
        );
      })}
      <Pip position={(() => {
        const p = onRing(2.85, -lf * 0.008 + 4.0, RB);
        return [p.x, p.y + 0.35, p.z] as [number, number, number];
      })()} scale={0.33 * spr(lf, 20)} mood="happy" blink={blinkAt(lf, 3, 60)} squash={wob(lf, t22, 0.3, 4)} look={[0.3, 0]} />
    </group>
  );
};

// ---------------- 8 · Founder (sweeping ribbons) ----------------
const Founder3D: React.FC<P> = ({lf, w}) => {
  const r1 = useMemo(() => ribbonGeo([V(-8, -3.4, -2), V(-3, -1.2, 0.5), V(0, 0.2, 1), V(3, 1.6, 0), V(8, 3.8, -2.5)], 1.3, 220, [COL.icyDeep, COL.lav, COL.peach, COL.orange], 0.6), []);
  const r2 = useMemo(() => ribbonGeo([V(-8, 3, -3), V(-3, 2.2, -1.5), V(1, -0.5, -1), V(4, -2.2, -1.5), V(8, -3.6, -3)], 0.7, 200, [COL.peach, COL.lav, COL.icy], -0.5), []);
  slice(r1.geo, r1.count, e(lf, 30, 120, 0, 1, (x) => x), e(lf, 0, 40, 0, 1, EXPO));
  slice(r2.geo, r2.count, e(lf, 70, 140, 0, 1, (x) => x), e(lf, 22, 66, 0, 1, EXPO));
  const sayIt = vf('l10') - SC.founder[0];
  return (
    <group>
      <mesh geometry={r1.geo}>
        <meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={0.15} clearcoat={1} emissive="#ffffff" emissiveIntensity={0.08} />
      </mesh>
      <mesh geometry={r2.geo}>
        <meshPhysicalMaterial vertexColors side={THREE.DoubleSide} roughness={0.15} clearcoat={1} transparent opacity={0.85} />
      </mesh>
      <Pip position={w ? [0, 1.3 + Math.abs(Math.sin(lf / 7)) * 0.05, 0.4] : [0, 1.85, 0.4]} scale={0.5 * spr(lf, 6)} mood={lf > sayIt ? 'wink' : 'happy'} tilt={0.18 * Math.sin(lf / 5)} squash={wob(lf, 6, 0.4) + wob(lf, sayIt, 0.3, 4)} blink={blinkAt(lf, 40)} />
    </group>
  );
};

// ---------------- 9 · CTA (logo smash) ----------------
export const CTA_TILE = (w: boolean): [number, number, number] => (w ? [-2.6, 0.15, 0] : [0, 1.3, 0]);
export const CTA_HIT = 14;
const Cta3D: React.FC<P> = ({lf, w}) => {
  const T = CTA_TILE(w);
  const fly = e(lf, 0, CTA_HIT, 0, 1, (x) => x * x * x);
  const tile = spr(lf, CTA_HIT + 1, 11, 130);
  const hop = spr(lf, CTA_HIT + 5, 11, 120);
  const perch: [number, number, number] = [T[0] + 0.05, T[1] + (w ? 1.6 : 1.3), 0.45];
  const pipP: [number, number, number] =
    lf < CTA_HIT ? [T[0] * fly, T[1] * fly + (1 - fly) * 1.2, -14 + 14 * fly] : (T.map((x, i) => x + (perch[i] - x) * hop + (i === 1 ? Math.sin(hop * Math.PI) * 0.8 : 0)) as [number, number, number]);
  const ringIn = e(lf, CTA_HIT + 10, CTA_HIT + 40);
  const glyphs: Glyph[] = ['mail', 'sheet', 'send', 'chat', 'bolt'];
  return (
    <group>
      <Pip position={pipP} scale={lf < CTA_HIT ? 0.8 : 0.8 - (w ? 0.42 : 0.47) * hop} squash={lf < CTA_HIT ? 0.3 : wob(lf, CTA_HIT, 0.6, 5) + wob(lf, CTA_HIT + 20, 0.3, 4)} mood={lf > 95 ? 'wink' : 'happy'} blink={blinkAt(lf, 30, 70)} look={[w ? 0.4 : 0, -0.2]} />
      <LogoTile position={[T[0], T[1] + Math.sin(lf / 20) * 0.05, 0]} rotation={[0.06, (1 - tile) * Math.PI * 2 + Math.sin(lf / 28) * 0.18, 0]} scale={(w ? 1.6 : 1.35) * tile} />
      <Shock lf={lf} at={CTA_HIT} pos={T} size={5} />
      <Shock lf={lf} at={CTA_HIT + 3} pos={T} color={COL.peach} size={3.6} />
      <group position={T}>
        <mesh rotation={RA} scale={(w ? 2.2 : 1.8) * (0.5 + 0.5 * ringIn)}>
          <torusGeometry args={[1, 0.006, 8, 160]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={ringIn} toneMapped={false} />
        </mesh>
        {glyphs.map((g, k) => {
          const p = onRing(w ? 2.2 : 1.8, (k / glyphs.length) * Math.PI * 2 + lf * 0.014, RA);
          return <IconTile key={g} glyph={g} position={[p.x, p.y, p.z]} scale={0.36 * spr(lf, CTA_HIT + 14 + k * 3)} rotation={[0.1, Math.sin(lf / 22 + k) * 0.3, 0]} />;
        })}
      </group>
    </group>
  );
};

const MAP3D: Record<SceneId, React.FC<P>> = {meet: Meet3D, pain: Pain3D, type: Type3D, build: Build3D, stats: Stats3D, founder: Founder3D, cta: Cta3D};
export const MainWorld: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const w = width > height;
  return (
    <>
      {ORDER.filter((id) => mounted(id, f)).map((id) => {
        const C = MAP3D[id];
        return (
          <group key={id} position={O[id]}>
            <C lf={f - SC[id][0]} w={w} />
          </group>
        );
      })}
    </>
  );
};

// ---------------- depth-of-field layers ----------------
// Back layer: soft glossy orbs + far app tiles behind every station (rendered in a CSS-blurred canvas).
// Front layer: big near-camera orbs + flight dust between stations (heavier blur) = real parallax DOF.
const GLY: Glyph[] = ['mail', 'sheet', 'send', 'chat', 'doc', 'cal', 'cart', 'db', 'bolt', 'hash'];
const ORB_COLS = [COL.lavLight, COL.icy, COL.peach, '#FFFFFF', COL.lav];
export const BackWorld: React.FC<{dense?: boolean}> = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const w = width > height;
  return (
    <>
      {ORDER.filter((id) => mounted(id, f, 14)).map((id, si) => {
        const lf = f - SC[id][0];
        const n = id === 'stats' ? 16 : 10;
        return (
          <group key={id} position={O[id]}>
            {Array.from({length: n}, (_, k) => {
              const r = (s: string) => random(`${id}${k}${s}`);
              const x = (r('x') - 0.5) * (w ? 20 : 13);
              const y = (r('y') - 0.5) * (w ? 11 : 14);
              const z = -5 - r('z') * 10;
              const dy = Math.sin((lf + r('t') * 200) / 40) * 0.25;
              const icon = r('k') < (id === 'stats' ? 0.75 : 0.45);
              const s = (0.5 + r('s') * 0.9) * spr(lf, -4 + r('d') * 20, 14, 90);
              return icon ? (
                <IconTile key={k} glyph={GLY[Math.floor(r('g') * GLY.length)]} position={[x, y + dy, z]} rotation={[r('a') - 0.5, lf / 60 + r('b') * 6, 0]} scale={s} />
              ) : (
                <mesh key={k} position={[x, y + dy, z]} scale={s * 0.6}>
                  <sphereGeometry args={[1, 32, 24]} />
                  <Gloss color={ORB_COLS[Math.floor(r('c') * ORB_COLS.length)]} />
                </mesh>
              );
            })}
            {id === 'pain'
              ? Array.from({length: 28}, (_, k) => {
                  const cx = (k % 7) - 3;
                  const cy = Math.floor(k / 7) - 1.5;
                  const s = spr(lf, 2 + random(`kc${k}`) * 40, 12, 160);
                  return <Keycap key={'k' + k} label={k % 2 ? 'V' : 'C'} position={[cx * 2.3, cy * 2.3 + 0.5, -9]} rotation={[-0.35, 0.12, 0]} scale={1.3 * s} press={Math.max(0, Math.sin((lf + k * 5) / 4))} />;
                })
              : null}
          </group>
        );
      })}
    </>
  );
};
export const FrontWorld: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const w = width > height;
  return (
    <>
      {ORDER.map((id, i) => {
        if (!mounted(id, f, 16)) return null;
        const lf = f - SC[id][0];
        const next = ORDER[i + 1];
        return (
          <group key={id} position={O[id]}>
            {Array.from({length: 3}, (_, k) => {
              const r = (s: string) => random(`f${id}${k}${s}`);
              const side = k % 2 ? 1 : -1;
              const x = side * (w ? 2.6 + r('x') * 1.2 : 1.6 + r('x') * 0.8);
              const y = (r('y') - 0.5) * (w ? 3 : 5);
              const z = 3.4 + r('z') * 1.4;
              const dy = Math.sin((lf + r('t') * 100) / 30) * 0.15;
              return (
                <mesh key={k} position={[x, y + dy, z]} scale={0.32 + r('s') * 0.3}>
                  <sphereGeometry args={[1, 32, 24]} />
                  <Gloss color={ORB_COLS[Math.floor(r('c') * ORB_COLS.length)]} />
                </mesh>
              );
            })}
            {/* flight dust toward the next station */}
            {next
              ? Array.from({length: 10}, (_, k) => {
                  const r = (s: string) => random(`d${id}${k}${s}`);
                  const d = O[next].map((x, j) => x - O[id][j]);
                  const t = 0.15 + r('t') * 0.7;
                  const sd = k % 2 ? 1 : -1;
                  const off = [sd * (2.6 + r('x') * 3), (r('y') - 0.5) * 5, 8 + (r('z') - 0.5) * 6];
                  return (
                    <mesh key={'d' + k} position={[d[0] * t + off[0], d[1] * t + off[1], d[2] * t + off[2]]} scale={0.25 + r('s') * 0.45}>
                      <sphereGeometry args={[1, 24, 16]} />
                      <Gloss color={ORB_COLS[k % ORB_COLS.length]} />
                    </mesh>
                  );
                })
              : null}
          </group>
        );
      })}
    </>
  );
};
