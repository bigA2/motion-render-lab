// Reference 1 (twoclipping-d89be5) land view: workflows lie on a studio floor, the camera glides along it,
// steps lift and stand up toward the lens, and connections rise OUT of the mockup as arches above the floor.
import React from 'react';
import {FONT, Glyph} from '../intro27/ui';
import {ez, glass, INK, lerp, PERI, PERI_D} from './kit';

export type FStep = {k: string; label: string; c: number; r?: number};
export type FRow = {title: string; steps: FStep[]; edges: [number, number, string?][]; at: number; lit?: number; extra?: React.ReactNode};
export type FTheme = {plate: string; plateLine: string; ink: string; lo: string; arch: string; archGlow: string; node: string; dark: boolean};

const TILT = 56, GX = 430, ROW = 880, NODE = 128;
export const rowY = (i: number) => i * ROW;

const Arch: React.FC<{x1: number; y1: number; x2: number; y2: number; k: number; pulse: number; th: FTheme; label?: string; hi?: boolean}> = ({x1, y1, x2, y2, k, pulse, th, label, hi}) => {
  const d = Math.hypot(x2 - x1, y2 - y1), ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const H = 240 + d * 0.12, m = NODE * 0.5; // the arch springs from just outside each node
  const path = `M${m},${H} C${d * 0.3},${H - H * 1.25} ${d * 0.7},${H - H * 1.25} ${d - m},${H}`;
  const col = hi ? PERI : th.arch;
  return <div style={{position: 'absolute', left: x1, top: y1, transformStyle: 'preserve-3d', transform: `rotateZ(${ang}deg)`}}>
    <div style={{position: 'absolute', left: 0, top: -H, width: d, height: H, transformOrigin: '0 100%', transform: 'rotateX(-90deg)'}}>
      <svg width={d} height={H} style={{overflow: 'visible'}}>
        <path d={path} stroke={th.archGlow} strokeWidth={18} fill="none" opacity={0.35 * k} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" />
        <path d={path} stroke={col} strokeWidth={hi ? 6 : 4.5} fill="none" pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" />
        {/* a data pulse travelling along the arch: every step "goes through" */}
        {k >= 1 ? <path d={path} stroke="#FFFFFF" strokeWidth={9} fill="none" pathLength={1} strokeDasharray={`0.06 0.94`} strokeDashoffset={-pulse} strokeLinecap="round" opacity={0.95} /> : null}
        {label && k > 0.6 ? <g transform={`translate(${d / 2},${H - H * 0.95})`}><rect x={-44} y={-22} width={88} height={40} rx={20} fill={hi ? PERI_D : th.node} stroke={th.plateLine} /><text x={0} y={7} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={20} fill={hi ? '#fff' : th.ink}>{label}</text></g> : null}
      </svg>
    </div>
  </div>;
};

const Node: React.FC<{x: number; y: number; s: FStep; i: number; up: number; blur: number; th: FTheme; on: boolean}> = ({x, y, s, i, up, blur, th, on}) => (
  <div style={{position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d', transform: `translateZ(${up * 36}px) rotateX(${-TILT * up}deg)`}}>
    <div style={{position: 'absolute', left: -110, top: -NODE, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, filter: blur > 0.4 ? `blur(${blur}px)` : undefined}}>
      <div style={{position: 'relative', width: NODE, height: NODE, borderRadius: '50%', ...glass(th.dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.9)', th.dark), border: `2.5px solid ${on ? PERI : th.dark ? 'rgba(255,255,255,0.35)' : INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 0 10px ${PERI}33, 0 30px 50px -24px rgba(0,0,0,0.5)` : '0 30px 50px -24px rgba(0,0,0,0.45)'}}>
        <Glyph k={s.k} size={58} color={s.k === 'ai' ? PERI_D : th.ink} />
        <div style={{position: 'absolute', left: -6, top: -6, width: 38, height: 38, borderRadius: 99, background: PERI_D, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
      </div>
      <div style={{...glass(th.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)', th.dark), padding: '10px 18px', borderRadius: 16, fontFamily: FONT.ui, fontWeight: 600, fontSize: 26, color: th.ink, whiteSpace: 'nowrap'}}>{s.label}</div>
    </div>
  </div>
);

export const Floor: React.FC<{f: number; W: number; H: number; camY: number; camZ: number; rows: FRow[]; th: FTheme; logoTiles?: boolean}> = ({f, W, H, camY, camZ, rows, th}) => {
  const w = W > H;
  return <div style={{position: 'absolute', inset: 0, perspective: 1700, perspectiveOrigin: `50% ${w ? 30 : 34}%`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: W / 2, top: H * (w ? 0.6 : 0.58), transformStyle: 'preserve-3d', transform: `translateZ(${-camZ}px) rotateX(${TILT}deg) translate3d(0, ${-camY}px, 0)`}}>
      {rows.map((row, ri) => {
        const y0 = rowY(ri); const cols = Math.max(...row.steps.map((s) => s.c)) + 1; const x0 = -((cols - 1) * GX) / 2;
        const dist = Math.abs(y0 - camY);
        const pos = (s: FStep) => [x0 + s.c * GX, y0 + (s.r ?? 0) * 300] as [number, number];
        return <div key={ri} style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d'}}>
          {/* the mockup plate: the builder canvas lying on the floor */}
          <div style={{position: 'absolute', left: x0 - 240, top: y0 - 420, width: (cols - 1) * GX + 480, height: 760, borderRadius: 44, background: th.plate, border: `1.5px solid ${th.plateLine}`, boxShadow: th.dark ? '0 0 120px rgba(0,0,0,0.6)' : '0 60px 120px -40px rgba(40,30,80,0.30)', backgroundImage: `radial-gradient(${th.plateLine} 2px, transparent 2px)`, backgroundSize: '36px 36px'}}>
            <div style={{position: 'absolute', left: 40, top: 30, fontFamily: FONT.sora, fontWeight: 600, fontSize: 38, color: th.ink}}>{row.title}<span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: 26, color: th.lo, marginLeft: 18}}>{row.steps.length} steps · built from chat</span></div>
          </div>
          {row.edges.map(([a, b, lab], j) => { const pa = pos(row.steps[a]), pb = pos(row.steps[b]); const k = ez(f, row.at + 14 + j * 9, row.at + 40 + j * 9); const hi = row.lit !== undefined && f >= row.lit && lab !== undefined && j === row.edges.length - 2; return <Arch key={j} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} k={k} pulse={((f - row.at) / 70 + j * 0.3) % 1} th={th} label={lab} hi={hi} />; })}
          {row.steps.map((s, i) => { const [x, y] = pos(s); const up = ez(f, row.at - 10 + i * 6, row.at + 22 + i * 6); return <Node key={i} x={x} y={y} s={s} i={i} up={up} blur={Math.min(8, Math.max(0, (dist - 520) / 120))} th={th} on={f >= row.at + 30 + i * 9} />; })}
          {row.extra}
        </div>;
      })}
    </div>
  </div>;
};
export const lerpCam = lerp;
