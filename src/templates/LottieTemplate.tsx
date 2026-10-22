// Plays public/templates/lottie/<name>.json (After Effects -> Bodymovin export) with FansaChat text/colour swaps.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {Fit, FIT_SIZE, fitScale, parseHex, Replace, swapText, toHex} from './common';

type J = any;
const EPS = 1.5 / 255;

/** Map one [r,g,b(,a)] 0..1 colour through the colours map (tolerance ~1/255). Returns same array or a new one. */
const mapRgb = (c: number[], pairs: [number[], number[]][]) => {
  for (const [from, to] of pairs) if (Math.abs(c[0] - from[0]) < EPS && Math.abs(c[1] - from[1]) < EPS && Math.abs(c[2] - from[2]) < EPS) return [to[0], to[1], to[2], ...c.slice(3)];
  return c;
};
const isRgb = (a: unknown): a is number[] => Array.isArray(a) && a.length >= 3 && a.length <= 4 && a.every((x) => typeof x === 'number');
/** Colour property {a, k}: static k = [r,g,b,a] or animated k = [{s:[..], e:[..]}, ...]. */
const mapColorProp = (p: J, pairs: [number[], number[]][]) => {
  if (!p || !p.k) return;
  if (isRgb(p.k)) p.k = mapRgb(p.k, pairs);
  else if (Array.isArray(p.k)) for (const kf of p.k) { if (isRgb(kf.s)) kf.s = mapRgb(kf.s, pairs); if (isRgb(kf.e)) kf.e = mapRgb(kf.e, pairs); }
};

/** Deep-copies the Lottie JSON and applies the replace map. Covers text (t.d.k[].s.t), shape fills/strokes (fl/st .c),
 *  solid layers (sc hex), text fill/stroke (fc/sc arrays). Gradients, expressions and effect colours are not touched. */
export const applyReplace = (data: J, replace: Replace = {}): J => {
  const d = JSON.parse(JSON.stringify(data));
  const pairs: [number[], number[]][] = [];
  for (const [a, b] of Object.entries(replace.colors ?? {})) { const x = parseHex(a), y = parseHex(b); if (x && y) pairs.push([x.map((v) => v / 255), y.map((v) => v / 255)]); }
  const solid: Record<string, string> = {};
  for (const [a, b] of Object.entries(replace.colors ?? {})) { const x = parseHex(a); if (x) solid[toHex(x)] = b; }
  const walk = (n: J) => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (!n || typeof n !== 'object') return;
    if (n.t?.d && Array.isArray(n.t.d.k)) for (const k of n.t.d.k) if (k?.s && typeof k.s.t === 'string') {
      k.s.t = swapText(k.s.t, replace.text);
      if (isRgb(k.s.fc)) k.s.fc = mapRgb(k.s.fc, pairs);
      if (isRgb(k.s.sc)) k.s.sc = mapRgb(k.s.sc, pairs);
    }
    if ((n.ty === 'fl' || n.ty === 'st') && n.c) mapColorProp(n.c, pairs);
    if (n.ty === 1 && typeof n.sc === 'string') { const x = parseHex(n.sc); if (x && solid[toHex(x)]) n.sc = solid[toHex(x)]; }
    for (const v of Object.values(n)) walk(v);
  };
  walk(d);
  return d;
};

export type LottieProps = {name: string; replace?: Replace; fit?: Fit; mode?: 'meet' | 'cover'; bg?: string; data?: LottieAnimationData};

export const loadLottie = async (name: string, replace?: Replace) => applyReplace(await (await fetch(staticFile(`templates/lottie/${name}.json`))).json(), replace) as LottieAnimationData;

export const lottieMeta = async (p: LottieProps) => {
  const data = await loadLottie(p.name, p.replace);
  const fps = data.fr >= 1 && data.fr <= 120 ? data.fr : 30;
  const ip = Number((data as J).ip ?? 0);
  const fit = p.fit ?? 'native';
  const size = fit === 'native' ? {w: data.w, h: data.h} : FIT_SIZE[fit];
  return {durationInFrames: Math.max(1, Math.round(data.op - ip)), fps, width: size.w, height: size.h, props: {...p, data}};
};

export const LottieTemplate: React.FC<LottieProps> = ({data, fit = 'native', mode = 'meet', bg = '#111111'}) => {
  if (!data) return null;
  const W = fit === 'native' ? data.w : FIT_SIZE[fit].w, H = fit === 'native' ? data.h : FIT_SIZE[fit].h;
  const s = fitScale(data.w, data.h, W, H, mode);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (W - data.w * s) / 2, top: (H - data.h * s) / 2, width: data.w, height: data.h, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Lottie animationData={data} style={{width: data.w, height: data.h}} />
      </div>
    </AbsoluteFill>
  );
};
