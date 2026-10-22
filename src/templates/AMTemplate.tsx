// Plays the neutral spec produced by scripts/am2json.py (public/templates/am/<name>.json). Effects are NOT faked:
// they are listed in spec.unsupported and shown only in the render log, never drawn.
import React from 'react';
import {AbsoluteFill, Easing, staticFile, useCurrentFrame, useVideoConfig, Img} from 'remotion';
import {Fit, FIT_SIZE, fitScale, Replace, swapText} from './common';

type Ease = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'hold' | number[];
type KF = {t: number | null; v: number | number[] | string | null; easing: Ease};
export type Layer = {type: 'text' | 'shape' | 'image' | 'group'; id: string; start: number | null; end: number | null; props: Record<string, any>; keyframes: Record<string, KF[]>; children?: Layer[]};
export type Spec = {fps: number; duration: number; size: {w: number; h: number}; background: string | null; layers: Layer[]; unsupported: string[]; warnings?: string[]};
export type AMProps = {name: string; replace?: Replace; fit?: Fit; mode?: 'meet' | 'cover'; spec?: Spec};

const ease = (e: Ease): ((x: number) => number) =>
  Array.isArray(e) ? Easing.bezier(e[0], e[1], e[2], e[3]) : e === 'easeIn' ? Easing.bezier(0.42, 0, 1, 1) : e === 'easeOut' ? Easing.bezier(0, 0, 0.58, 1) : e === 'easeInOut' ? Easing.bezier(0.42, 0, 0.58, 1) : e === 'hold' ? (x) => (x < 1 ? 0 : 1) : (x) => x;

/** Value of a property at time t (s): keyframes if any, else static prop, else fallback. The easing on keyframe i shapes i -> i+1. */
const at = (l: Layer, key: string, t: number, fallback: any) => {
  const k = l.keyframes[key];
  if (!k || !k.length) return l.props[key] ?? fallback;
  if (t <= (k[0].t ?? 0)) return k[0].v;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1], ta = a.t ?? 0, tb = b.t ?? 0;
    if (t < tb) {
      const p = ease(a.easing)(Math.max(0, Math.min(1, (t - ta) / Math.max(1e-6, tb - ta))));
      if (typeof a.v === 'number' && typeof b.v === 'number') return a.v + (b.v - a.v) * p;
      if (Array.isArray(a.v) && Array.isArray(b.v)) return a.v.map((x, j) => x + ((b.v as number[])[j] - x) * p);
      return p < 1 ? a.v : b.v;
    }
  }
  return k[k.length - 1].v;
};

export const applySpecReplace = (spec: Spec, r: Replace = {}): Spec => {
  const colors: Record<string, string> = {};
  for (const [a, b] of Object.entries(r.colors ?? {})) colors[a.toLowerCase()] = b;
  const walk = (l: Layer): Layer => {
    const props = {...l.props};
    if (typeof props.text === 'string') props.text = swapText(props.text, r.text);
    for (const k of Object.keys(props)) if (typeof props[k] === 'string' && colors[props[k].toLowerCase()]) props[k] = colors[props[k].toLowerCase()];
    const keyframes: Layer['keyframes'] = {};
    for (const [k, fr] of Object.entries(l.keyframes)) keyframes[k] = fr.map((f) => (typeof f.v === 'string' && colors[f.v.toLowerCase()] ? {...f, v: colors[f.v.toLowerCase()]} : f));
    return {...l, props, keyframes, children: l.children?.map(walk)};
  };
  const bg = spec.background && colors[spec.background.toLowerCase()] ? colors[spec.background.toLowerCase()] : spec.background;
  return {...spec, background: bg, layers: spec.layers.map(walk)};
};

export const amMeta = async (p: AMProps) => {
  const spec = applySpecReplace(await (await fetch(staticFile(`templates/am/${p.name}.json`))).json(), p.replace);
  if (spec.unsupported.length) console.warn(`[AMTemplate] unsupported effects (not drawn): ${spec.unsupported.join(', ')}`);
  const fit = p.fit ?? 'native';
  const size = fit === 'native' ? spec.size : {w: FIT_SIZE[fit].w, h: FIT_SIZE[fit].h};
  return {durationInFrames: Math.max(1, Math.round(spec.duration * spec.fps)), fps: spec.fps, width: size.w, height: size.h, props: {...p, spec}};
};

const LayerView: React.FC<{l: Layer; t: number}> = ({l, t}) => {
  if ((l.start ?? 0) > t || (l.end ?? Infinity) <= t) return null;
  const pos = at(l, 'position', t, [0, 0]) as number[];
  const sc = at(l, 'scale', t, 1);
  const [sx, sy] = Array.isArray(sc) ? sc : [sc, sc];
  const rot = at(l, 'rotation', t, 0), op = at(l, 'opacity', t, 1);
  const base: React.CSSProperties = {position: 'absolute', left: pos[0], top: pos[1], transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sx},${sy})`, opacity: op};
  const p = l.props;
  if (l.type === 'text') return <div style={{...base, color: p.color ?? '#fff', fontSize: p.fontSize ?? 64, fontFamily: p.fontFamily ?? 'Inter Tight, system-ui, sans-serif', fontWeight: p.fontWeight ?? 700, whiteSpace: 'pre', textAlign: 'center', lineHeight: 1.1}}>{p.text}</div>;
  if (l.type === 'image') return p.src ? <Img src={staticFile(p.src)} style={{...base, width: p.width, height: p.height}} /> : null;
  if (l.type === 'group') return <div style={{position: 'absolute', left: 0, top: 0}}><div style={{...base, width: 0, height: 0}}>{l.children?.map((c, i) => <LayerView key={i} l={c} t={t} />)}</div></div>;
  const ell = p.shape === 'ellipse';
  return <div style={{...base, width: p.width ?? 100, height: p.height ?? 100, background: p.color ?? '#fff', borderRadius: ell ? '50%' : p.radius ?? 0, border: p.strokeWidth ? `${p.strokeWidth}px solid ${p.strokeColor ?? '#000'}` : undefined, boxSizing: 'border-box'}} />;
};

export const AMTemplate: React.FC<AMProps> = ({spec, fit = 'native', mode = 'meet'}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  if (!spec) return null;
  const s = fitScale(spec.size.w, spec.size.h, W, H, mode), t = frame / spec.fps;
  return (
    <AbsoluteFill style={{background: spec.background ?? '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (W - spec.size.w * s) / 2, top: (H - spec.size.h * s) / 2, width: spec.size.w, height: spec.size.h, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'hidden'}}>
        {spec.layers.map((l, i) => <LayerView key={i} l={l} t={t} />)}
      </div>
    </AbsoluteFill>
  );
};
