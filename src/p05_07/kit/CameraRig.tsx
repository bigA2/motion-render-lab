// <CameraRig>: null parent for the whole UI world. Children are placed in world px; <Depth z> layers get real
// parallax from CSS 3D perspective; fast moves get directional motion blur from the camera velocity. MIT.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camera} from './camera';

export const CamCtx = React.createContext<Camera | null>(null);

export const CameraRig: React.FC<{cam: Camera; children: React.ReactNode; perspective?: number; blur?: number; id?: string}> = ({cam, children, perspective = 2200, blur = 0.45, id = 'rig'}) => {
  const f = useCurrentFrame(); const {width: w, height: h} = useVideoConfig();
  const c = cam.get(f); const v = cam.vel(f);
  // directional blur in screen px: proportional to velocity, ignored for slow drift
  const k = (n: number) => { const a = Math.abs(n) * blur; return a < 1.2 ? 0 : Math.min(28, a - 1.2); };
  const bx = k(v.vx), by = k(v.vy), bz = Math.min(10, Math.max(0, Math.abs(v.vz) * 0.08 - 0.6));
  const on = bx + by + bz > 0.3;
  const world = `translate(${w / 2}px, ${h / 2}px) translateZ(${c.dolly}px) rotateZ(${c.roll}deg) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg) scale(${c.zoom}) translate(${-c.x}px, ${-c.y}px)`;
  return (
    <CamCtx.Provider value={cam}>
      <AbsoluteFill style={{perspective, perspectiveOrigin: '50% 50%', filter: on ? `url(#mb-${id})` : undefined}}>
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={`mb-${id}`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${(bx + bz) / 2} ${(by + bz) / 2}`} /></filter>
        </svg>
        <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d', transformOrigin: '0 0', transform: world}}>
          {children}
        </div>
      </AbsoluteFill>
    </CamCtx.Provider>
  );
};

/** A layer at depth z (negative = further away). Optional rotation for 3D card fly-throughs. */
export const Depth: React.FC<{z?: number; x?: number; y?: number; ry?: number; rx?: number; rz?: number; s?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({z = 0, x = 0, y = 0, ry = 0, rx = 0, rz = 0, s = 1, children, style}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s})`, ...style}}>{children}</div>
);

/** World-positioned box (top-left at x,y). */
export const At: React.FC<{x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties; o?: number; s?: number; origin?: string}> = ({x, y, w, h, children, style, o = 1, s = 1, origin = '50% 50%'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: s !== 1 ? `scale(${s})` : undefined, transformOrigin: origin, ...style}}>{children}</div>
);

/** Small hit after a landing: scale pulse + 2-axis shake that dies with hit-decay. amount 0.1–0.2 for UI. */
export const hitShake = (f: number, at: number, amount = 0.15, len = 14) => {
  const d = f - at; if (d < 0 || d > len) return {x: 0, y: 0, s: 1};
  const e = Math.pow(1 - d / len, 3); const A = 40 * amount * e;
  return {x: Math.sin(d * 2.9) * A, y: Math.cos(d * 3.7) * A * 0.7, s: 1 + 0.2 * amount * e};
};
