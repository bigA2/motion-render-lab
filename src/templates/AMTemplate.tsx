// Plays the neutral spec produced by scripts/am2json.py (real Alight Motion schema). Pass the spec via props
// ({spec}) or put it at public/templates/am/<name>.json. Only the effects am2json maps are drawn; everything else
// is listed in spec.unsupported and never faked. Media fills are not shipped with AM packs -> grey placeholder.
import React from 'react';
import {AbsoluteFill, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fit, FIT_SIZE, fitScale, parseHex, Replace, swapText} from './common';

type Ease = 'linear' | (string | number)[];
type KF = {t: number; v: any; ease: Ease};
type Anim<T = any> = T | {kf: KF[]};
type Effect = {kind: string; [k: string]: any};
export type Scene = {w: number; h: number; background: string; duration: number; layers: Layer[]; speed?: number; inTime?: number};
export type Layer = {
  kind: 'shape' | 'text' | 'group' | 'null'; id: string; label: string; start: number; end: number; parent?: string; blend?: string;
  transform: {location: Anim<number[]>; scale: Anim<number[]>; rotation: Anim<number>; opacity: Anim<number>; pivot: Anim<number[]>};
  shape?: string | null; size?: Anim<number[]>; radius?: Anim<number>; path?: string; points?: number; inner?: number; stem?: number;
  fill?: any; stroke?: {color: Anim<string>; width: Anim<number>}; shadow?: {color: Anim<string>; opacity: Anim<number>; blur: Anim<number>; offset: Anim<number[]>};
  text?: {content: string; font: string; weight: number; size: number; wrap: number; align: string}; effects?: Effect[]; scene?: Scene;
};
export type Spec = {title?: string; fps: number; duration: number; size: {w: number; h: number}; background: string; layers: Layer[]; unsupported: {effect: string; layer: string}[]; warnings?: string[]};
export type AMProps = {name: string; replace?: Replace; fit?: Fit; mode?: 'meet' | 'cover'; spec?: Spec};

const easeFn = (e: Ease): ((x: number) => number) => {
  if (!Array.isArray(e)) return (x) => x;
  const [k, ...p] = e as [string, ...number[]];
  if (k === 'bezier') return Easing.bezier(Math.min(1, Math.max(0, p[0])), p[1], Math.min(1, Math.max(0, p[2])), p[3]);
  if (k === 'elastic') return Easing.out(Easing.elastic(1)); // approximation (AM elastic params undocumented)
  if (k === 'bounce') return Easing.bounce;
  return (x) => x;
};

/** Anim value at layer-local time t (s). Easing stored on keyframe b shapes the segment a -> b. */
export const val = <T,>(a: Anim<T>, t: number): T => {
  if (!a || typeof a !== 'object' || !('kf' in (a as any))) return a as T;
  const k = (a as {kf: KF[]}).kf;
  if (t <= k[0].t) return k[0].v;
  for (let i = 1; i < k.length; i++) {
    const A = k[i - 1], B = k[i];
    if (t < B.t) {
      const p = easeFn(B.ease)((t - A.t) / Math.max(1e-6, B.t - A.t));
      if (typeof A.v === 'number') return (A.v + (B.v - A.v) * p) as T;
      if (Array.isArray(A.v)) return A.v.map((x: number, j: number) => x + (B.v[j] - x) * p) as T;
      return A.v;
    }
  }
  return k[k.length - 1].v;
};

const withAlpha = (c: string, a: number) => {
  const m = /rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(c);
  return m ? `rgba(${m[1]},${m[2]},${m[3]},${Math.max(0, Math.min(1, +m[4] * a))})` : c;
};

const xform = (l: Layer, t: number) => {
  const lt = t - l.start, T = l.transform;
  const [x, y, z = 0] = val(T.location, lt), [sx, sy] = val(T.scale, lt), r = val(T.rotation, lt), [px, py] = val(T.pivot, lt);
  return `translate3d(${x}px,${y}px,${z}px) translate(${px}px,${py}px) rotate(${r}deg) scale(${sx},${sy}) translate(${-px}px,${-py}px)`;
};
const Wrap: React.FC<{l: Layer; t: number; children: React.ReactNode}> = ({l, t, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transform: xform(l, t)}}>{children}</div>
);

const gradientCss = (f: any, w: number, h: number) => {
  const dx = (f.end[0] - f.start[0]) * w, dy = (f.end[1] - f.start[1]) * h;
  if (f.radial) return `radial-gradient(circle at ${f.start[0] * 100}% ${f.start[1] * 100}%, ${f.from} 0px, ${f.to} ${Math.hypot(dx, dy)}px)`;
  return `linear-gradient(${(Math.atan2(dx, -dy) * 180) / Math.PI}deg, ${f.from}, ${f.to})`;
};

/** Text with texttransform (per-unit reveal), textprogress (type-on) and counter effects. */
const TextBody: React.FC<{l: Layer; lt: number}> = ({l, lt}) => {
  let s = l.text!.content;
  for (const e of l.effects ?? []) {
    if (e.kind === 'counter') s = s.replace(/-?\d+(\.\d+)?/, (n) => {
      const d = (n.split('.')[1] ?? '').length;
      return (parseFloat(n) * val<number>(e.scale, lt) + val<number>(e.offset, lt)).toFixed(d);
    });
    if (e.kind === 'textProgress') {
      const a = [...s];
      s = a.slice(Math.round(val<number>(e.start, lt) * a.length), Math.round(val<number>(e.end, lt) * a.length)).join('');
    }
  }
  const tr = l.effects?.find((e) => e.kind === 'textReveal');
  if (!tr) return <>{s}</>;
  const units = tr.unit === 'line' ? s.split(/(?<=\n)/) : tr.unit === 'word' ? s.split(/(?<=\s)/) : [...s];
  const n = units.length, ph = val<number>(tr.phase, lt), st = val<number>(tr.start, lt) + ph, en = val<number>(tr.end, lt) + ph;
  const [ox, oy] = val<number[]>(tr.offset, lt), ang = val<number>(tr.angle, lt), sc = val<number>(tr.scale, lt), al = val<number>(tr.alpha, lt);
  return <>{units.map((u, i) => {
    // weight = share of unit i's [i/n,(i+1)/n] slot inside the affected [start,end] range
    const w = Math.max(0, Math.min(1, (Math.min(en, (i + 1) / n) - Math.max(st, i / n)) * n));
    return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: Math.max(0, Math.min(1, 1 + al * w)),
      transform: `translate(${ox * w}px,${oy * w}px) rotate(${ang * w}deg) scale(${Math.max(0, 1 + sc * w)})`}}>{u}</span>;
  })}</>;
};

const LayerBody: React.FC<{l: Layer; t: number; fps: number}> = ({l, t, fps}) => {
  const lt = t - l.start, dur = l.end - l.start, fx = l.effects ?? [];
  let opacity = val<number>(l.transform.opacity, lt);
  const filters: string[] = [], overlays: React.ReactNode[] = [];
  const fillColor = l.fill?.type === 'color' ? val<string>(l.fill.color, lt) : l.fill?.type === 'gradient' ? l.fill.from : 'rgba(255,255,255,1)';
  let textGradient: string | undefined;
  for (const [i, e] of fx.entries()) {
    if (e.kind === 'blur') filters.push(`blur(${Math.max(0, val<number>(e.px, lt))}px)`);
    if (e.kind === 'motionBlur') {
      const a = val<number[]>(l.transform.location, lt), b = val<number[]>(l.transform.location, lt - 1 / fps);
      const v = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (v > 1) filters.push(`blur(${Math.min(24, v * 0.15 * val<number>(e.tune, lt))}px)`);
    }
    if (e.kind === 'opacity') opacity *= val<number>(e.value, lt);
    if (e.kind === 'fade') {
      const fi = val<number>(e.in, lt), fo = val<number>(e.out, lt);
      if (fi > 0) opacity *= Math.min(1, lt / fi);
      if (fo > 0) opacity *= Math.min(1, (dur - lt) / fo);
    }
    if (e.kind === 'glow') filters.push(`drop-shadow(0 0 ${Math.max(0, val<number>(e.radius, lt))}px ${withAlpha(e.color ?? fillColor, val<number>(e.alpha, lt))})`);
    if (e.kind === 'gradient') {
      const [c1, c2] = e.colors, g = e.radial ? `radial-gradient(circle, ${c1}, ${c2})` : `linear-gradient(${val<number>(e.angle, lt) + 90}deg, ${c1}, ${c2})`;
      if (l.kind === 'text') textGradient = g;
      else overlays.push(<div key={i} style={{position: 'absolute', inset: 0, borderRadius: 'inherit', background: g, opacity: val<number>(e.alpha, lt)}} />);
    }
    if (e.kind === 'fourColor') {
      const g = e.colors.map((c: string, j: number) => {
        const [ox, oy] = val<number[]>(e.offsets[j], lt);
        return `radial-gradient(circle at calc(50% + ${ox}px) calc(50% + ${oy}px), ${c}, transparent 70%)`;
      }).join(',');
      overlays.push(<div key={i} style={{position: 'absolute', inset: 0, borderRadius: 'inherit', background: g, opacity: val<number>(e.alpha, lt)}} />);
    }
    if (e.kind === 'innerGlow') overlays.push(<div key={i} style={{position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: `inset 0 0 ${val<number>(e.radius, lt)}px ${withAlpha(e.color, val<number>(e.alpha, lt))}`}} />);
  }
  const sh = l.shadow && {o: val<number[]>(l.shadow.offset, lt), b: val<number>(l.shadow.blur, lt), c: withAlpha(val<string>(l.shadow.color, lt), val<number>(l.shadow.opacity, lt))};
  const common: React.CSSProperties = {position: 'absolute', opacity, filter: filters.join(' ') || undefined, mixBlendMode: l.blend as any};

  if (l.kind === 'text') {
    const tx = l.text!;
    const paint: React.CSSProperties = textGradient ? {background: textGradient, WebkitBackgroundClip: 'text', color: 'transparent'} : {color: fillColor};
    return <div style={{...common, ...paint, left: 0, top: 0, transform: 'translate(-50%,-50%)', width: 'max-content', maxWidth: tx.wrap * 1.15 + tx.size,
      fontFamily: `'${tx.font}', 'Roboto', 'Segoe UI', Arial, sans-serif`, fontWeight: tx.weight, fontSize: tx.size, lineHeight: 1.2, whiteSpace: 'pre-wrap', textAlign: tx.align as any,
      textShadow: sh ? `${sh.o[0]}px ${sh.o[1]}px ${sh.b}px ${sh.c}` : undefined}}><TextBody l={l} lt={lt} /></div>;
  }
  if (l.kind === 'group') {
    const s = l.scene!, nt = lt * (s.speed ?? 1) + (s.inTime ?? 0);
    return <div style={{...common, left: -s.w / 2, top: -s.h / 2, width: s.w, height: s.h, background: s.background, transformStyle: 'preserve-3d'}}><SceneView scene={s} t={nt} fps={fps} /></div>;
  }
  if (!l.shape) return null;
  const [w, h] = val<number[]>(l.size!, lt);
  const box: React.CSSProperties = {...common, left: -w / 2, top: -h / 2, width: w, height: h, boxShadow: sh ? `${sh.o[0]}px ${sh.o[1]}px ${sh.b}px ${sh.c}` : undefined};
  const bg = l.fill?.type === 'color' ? fillColor : l.fill?.type === 'gradient' ? gradientCss(l.fill, w, h) : l.fill?.type === 'placeholder' ? 'rgba(128,128,128,0.35)' : 'transparent';
  const sw = l.stroke ? val<number>(l.stroke.width, lt) : 0, sc = l.stroke ? val<string>(l.stroke.color, lt) : 'none';
  if (l.shape === 'rect' || l.shape === 'roundrect' || l.shape === 'ellipse') {
    const br = l.shape === 'ellipse' ? '50%' : l.shape === 'roundrect' ? val<number>(l.radius!, lt) : 0;
    return <div style={{...box, background: bg, borderRadius: br, border: sw ? `${sw}px solid ${sc}` : undefined, boxSizing: 'border-box', overflow: 'hidden'}}>{overlays}</div>;
  }
  // path / star / plus as SVG (path coordinates are relative to the layer origin)
  let d = l.path ?? '';
  if (l.shape === 'star') {
    const n = l.points ?? 5, pts = Array.from({length: n * 2}, (_, i) => {
      const r = i % 2 ? l.inner ?? 0.5 : 1, a = (Math.PI * i) / n - Math.PI / 2;
      return `${((Math.cos(a) * r * w) / 2).toFixed(2)},${((Math.sin(a) * r * h) / 2).toFixed(2)}`;
    });
    d = `M${pts.join('L')}Z`;
  }
  if (l.shape === 'plus') {
    const a = ((l.stem ?? 0.33) * w) / 2, b = ((l.stem ?? 0.33) * h) / 2, X = w / 2, Y = h / 2;
    d = `M${-a},${-Y}H${a}V${-b}H${X}V${b}H${a}V${Y}H${-a}V${b}H${-X}V${-b}H${-a}Z`;
  }
  const fillSvg = l.fill?.type === 'color' ? fillColor : l.fill?.type === 'placeholder' ? 'rgba(128,128,128,0.35)' : l.fill?.type === 'gradient' ? l.fill.from : 'none';
  return <svg style={{...common, left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <path d={d} fill={fillSvg} stroke={sw ? sc : 'none'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
};

/** Draws one scene at scene-local time t (s). Layers are bottom-to-top in document order; parents resolve within the scene. */
const SceneView: React.FC<{scene: Scene; t: number; fps: number}> = ({scene, t, fps}) => {
  const byId = new Map(scene.layers.map((l) => [l.id, l]));
  return <>{scene.layers.map((l, i) => {
    if (l.kind === 'null' || t < l.start || t >= l.end) return null;
    let node: React.ReactNode = <Wrap l={l} t={t}><LayerBody l={l} t={t} fps={fps} /></Wrap>;
    for (let p = l.parent ? byId.get(l.parent) : undefined, guard = 0; p && guard < 32; p = p.parent ? byId.get(p.parent) : undefined, guard++) node = <Wrap l={p} t={t}>{node}</Wrap>;
    return <React.Fragment key={i}>{node}</React.Fragment>;
  })}</>;
};

export const applySpecReplace = (spec: Spec, r: Replace = {}): Spec => {
  let json = JSON.stringify(spec);
  for (const [a, b] of Object.entries(r.colors ?? {})) {
    const A = parseHex(a), B = parseHex(b);
    if (A && B) json = json.split(`rgba(${A.join(',')},`).join(`rgba(${B.join(',')},`);
  }
  const out: Spec = JSON.parse(json);
  const walk = (ls: Layer[]) => ls.forEach((l) => {
    if (l.text) l.text.content = swapText(l.text.content, r.text);
    if (l.scene) walk(l.scene.layers);
  });
  walk(out.layers);
  return out;
};

export const amMeta = async (p: AMProps) => {
  const raw: Spec = p.spec ?? (await (await fetch(staticFile(`templates/am/${p.name}.json`))).json());
  const spec = applySpecReplace(raw, p.replace);
  if (spec.unsupported.length) console.warn(`[AMTemplate] unsupported effects (not drawn): ${[...new Set(spec.unsupported.map((u) => u.effect))].join(', ')}`);
  const fit = p.fit ?? 'native';
  const size = fit === 'native' ? spec.size : {w: FIT_SIZE[fit].w, h: FIT_SIZE[fit].h};
  return {durationInFrames: Math.max(1, Math.round(spec.duration * spec.fps)), fps: spec.fps, width: size.w, height: size.h, props: {...p, spec}};
};

export const AMTemplate: React.FC<AMProps> = ({spec, mode = 'meet'}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  if (!spec) return null;
  const s = fitScale(spec.size.w, spec.size.h, W, H, mode), {w, h} = spec.size;
  const scene: Scene = {w, h, background: spec.background, duration: spec.duration, layers: spec.layers};
  return (
    <AbsoluteFill style={{background: spec.background ?? '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (W - w * s) / 2, top: (H - h * s) / 2, width: w, height: h, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'hidden',
        perspective: h / 2 / Math.tan(Math.PI / 6), transformStyle: 'preserve-3d'}}>
        <SceneView scene={scene} t={frame / spec.fps} fps={spec.fps} />
      </div>
    </AbsoluteFill>
  );
};
