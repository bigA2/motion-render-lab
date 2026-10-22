// 1:1 recreation of the "3D Glass UI Explainer" result (Stephan Zammit tutorial): typed input pill -> Start Now button
// with glow rings + click -> isometric glass bar stack on cream -> collapse -> URL glass pill. All motion is keyframed
// with interpolate() + bezier easing (AE "easy ease" = bezier(0.33, 0, 0.67, 1); strong ease-out = bezier(0.16, 1, 0.3, 1)).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const EASE = Easing.bezier(0.33, 0, 0.67, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const k = (f: number, inp: number[], out: number[], e = EASE) => interpolate(f, inp, out, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const FONT = 'GlassFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;

const TYPED = 'Start your design journey now';
const BARS = ["Let's Build Your Brand", 'Bold Ideas, Bold Moves', 'Design Smarter, Not Harder', 'The Art of Interaction', "Let's Create Something Great"];

const Cursor: React.FC<{x: number; y: number; press: number; s?: number}> = ({x, y, press, s = 1}) => (
  <svg width={46 * s} height={46 * s} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.18})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))'}}>
    <path d="M3 2l17 9-7.5 2L9 21z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

// Scene 1 (0-4.3 s): navy gradient, text types into a pill, a button appears, the pill shrinks into the button, rings, click.
const SceneButton: React.FC<{f: number}> = ({f}) => {
  const typed = TYPED.slice(0, Math.floor(k(f, [6, 46], [0, TYPED.length], Easing.linear)));
  const pillW = k(f, [0, 10, 56, 78], [200, 980, 980, 360], OUT);
  const textOp = k(f, [56, 66], [1, 0]);
  const btnIn = k(f, [40, 54], [0, 1], OUT);
  const rings = k(f, [72, 100], [0, 1], OUT);
  const press = k(f, [104, 108, 114], [0, 1, 0]);
  const cx = k(f, [80, 104], [1180, 1000], OUT), cy = k(f, [80, 104], [700, 560], OUT);
  const zoom = k(f, [0, 128], [1, 1.12]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 30% 20%, #1d3a5f 0%, #0b1a2e 55%, #050b14 100%)', transform: `scale(${zoom})`}}>
      {[1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: '50%', top: '50%', width: 360 + i * 170 * rings, height: 132 + i * 120 * rings, borderRadius: 999,
          transform: 'translate(-50%,-50%)', border: `1.5px solid rgba(140,180,255,${0.35 * rings / i})`, boxShadow: `0 0 ${30 * rings}px rgba(90,150,255,${0.25 * rings})`}} />
      ))}
      <div style={{position: 'absolute', left: '50%', top: '50%', width: pillW, height: 132, transform: 'translate(-50%,-50%)', borderRadius: 999,
        background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03))', border: '1.5px solid rgba(255,255,255,.18)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 20px 50px rgba(0,0,0,.45)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 0 34px', boxSizing: 'border-box', overflow: 'hidden'}}>
        <span style={{position: 'absolute', left: 52, fontFamily: FONT, color: '#dfe8ff', fontSize: 46, whiteSpace: 'nowrap', opacity: textOp}}>{typed}</span>
        <div style={{flex: '0 0 auto', marginLeft: 'auto', height: 96, padding: '0 54px', borderRadius: 999, opacity: btnIn, transform: `scale(${0.8 + 0.2 * btnIn - press * 0.06})`,
          background: 'linear-gradient(180deg,#2d5ea8,#173867)', border: '1.5px solid rgba(160,200,255,.6)', boxShadow: `0 0 ${18 + 30 * rings}px rgba(80,150,255,.55)`,
          display: 'flex', alignItems: 'center', fontFamily: FONT, color: '#fff', fontSize: 40, whiteSpace: 'nowrap'}}>Start Now</div>
      </div>
      <div style={{opacity: k(f, [78, 86], [0, 1])}}><Cursor x={cx} y={cy} press={press} /></div>
    </AbsoluteFill>
  );
};

// Scene 2 (4.3-8 s): cream gradient, isometric glass bar stack slides in, cursor hovers bar 2, stack collapses into a slab.
const SceneStack: React.FC<{f: number}> = ({f}) => {
  const enter = k(f, [0, 26], [0, 1], OUT);
  const collapse = k(f, [86, 108], [0, 1], EASE);
  const spin = k(f, [0, 110], [-8, 6]);
  const press = k(f, [52, 56, 62], [0, 1, 0]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 70% 20%, #efe2d2 0%, #e2cdb6 55%, #cdb59b 100%)', perspective: 1800}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', transformStyle: 'preserve-3d',
        transform: `translate(-50%,-50%) rotateX(${55 - 10 * collapse}deg) rotateZ(${-32 + spin}deg) scale(${(1.15 + 0.45 * enter) * (1 - 0.75 * collapse)})`}}>
        {BARS.map((t, i) => {
          const y = (i - 2) * 118 * (1 - collapse);
          const d = k(f, [i * 4, 20 + i * 4], [1, 0], OUT);
          const hot = i === 1 ? k(f, [40, 50], [0, 1]) : 0;
          return (
            <div key={t} style={{position: 'absolute', left: -380, top: y - 46, width: 760, height: 92, borderRadius: 22, transform: `translateZ(${hot * 40 - d * 300}px)`, opacity: 1 - d,
              background: `linear-gradient(135deg, rgba(255,255,255,${0.30 + hot * 0.12}) 0%, rgba(95,88,98,.55) 40%, rgba(38,34,42,.70) 100%)`,
              border: '1.5px solid rgba(255,255,255,.55)', backdropFilter: 'blur(18px) saturate(140%)',
              boxShadow: `inset 0 2px 0 rgba(255,255,255,.75), inset 0 -10px 24px rgba(255,255,255,.10), inset 0 0 0 1px rgba(255,255,255,.08), 0 ${30 + hot * 20}px 60px rgba(60,40,20,.28)`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', boxSizing: 'border-box'}}>
              <div style={{width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.7)', boxShadow: 'inset 0 1px 0 #fff'}} />
              <span style={{fontFamily: FONT, color: 'rgba(255,255,255,.96)', fontSize: 30, textShadow: '0 1px 2px rgba(0,0,0,.25)'}}>{t}</span>
            </div>
          );
        })}
      </div>
      <div style={{opacity: k(f, [30, 38, 80, 86], [0, 1, 1, 0])}}><Cursor x={k(f, [30, 48], [1300, 1010], OUT)} y={k(f, [30, 48], [760, 470], OUT)} press={press} /></div>
    </AbsoluteFill>
  );
};

// Scene 3 (8-10 s): the slab lands and morphs into a glass URL pill.
const SceneUrl: React.FC<{f: number}> = ({f}) => {
  const m = k(f, [0, 22], [0, 1], OUT);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 70% 20%, #efe2d2 0%, #e2cdb6 55%, #cdb59b 100%)'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 160 + 780 * m, height: 150 - 40 * m, borderRadius: 24 + 30 * m, transform: `translate(-50%,-50%) rotate(${(1 - m) * -30}deg)`,
        background: 'linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.45))', border: '1.5px solid rgba(255,255,255,.7)',
        boxShadow: '0 24px 60px rgba(90,60,30,.25), inset 0 1px 0 #fff', filter: `blur(${(1 - m) * 6}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: FONT, color: '#3f3328', fontSize: 40, opacity: k(f, [14, 26], [0, 1]), letterSpacing: 0.5}}>www.fansachat.com</span>
      </div>
    </AbsoluteFill>
  );
};

export const GlassUI: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = Math.round(4.3 * fps), s2 = Math.round(8 * fps);
  // short cross-blur between scenes (the reference uses quick blur dissolves)
  const blur = (a: number) => k(f, [a - 4, a, a + 4], [0, 14, 0]);
  return (
    <AbsoluteFill style={{filter: `blur(${blur(s1) + blur(s2)}px)`}}>
      <style>{css}</style>
      {f < s1 ? <SceneButton f={f} /> : f < s2 ? <SceneStack f={f - s1} /> : <SceneUrl f={f - s2} />}
    </AbsoluteFill>
  );
};
