// Recreation of Motion Array "100 Photo Logo Reveal" with ~100 of OUR app icons instead of photos:
// start full-frame on one tile -> camera pulls back through a 3D field of white-framed tiles (light streaks, drift)
// -> every tile converges into one stack -> flips into the FansaChat logo + line.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import LOGOS from './app_logos.json';

const FONT = 'FieldFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const k = (f: number, i: number[], o: number[], e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const N = (LOGOS as string[]).length;
const TILES = (LOGOS as string[]).map((file, i) => ({
  file, x: (random(`x${i}`) - 0.5) * 3600, y: (random(`y${i}`) - 0.5) * 2000, z: -random(`z${i}`) * 2400,
  r: (random(`r${i}`) - 0.5) * 30, s: 0.8 + random(`s${i}`) * 0.6, delay: random(`d${i}`) * 40,
}));

export const LogoField: React.FC = () => {
  const f = useCurrentFrame();
  const pull = k(f, [0, 150], [0, 1], Easing.bezier(0.5, 0, 0.1, 1)); // dolly out
  const camZ = 2200 - pull * 2500;
  const drift = k(f, [0, 300], [-120, 120], Easing.linear);
  const conv = k(f, [210, 270], [0, 1]); // converge to centre stack
  const logo = k(f, [270, 300], [0, 1], Easing.bezier(0.16, 1, 0.3, 1));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 40%, #2b2f3d 0%, #11131b 60%, #07080c 100%)', perspective: 1400, overflow: 'hidden'}}>
      <style>{css}</style>
      {/* light streaks */}
      {[0, 1].map((j) => <div key={j} style={{position: 'absolute', left: -400 + ((f * (6 + j * 3)) % 2800), top: 300 + j * 420, width: 900, height: 6, borderRadius: 9, background: 'linear-gradient(90deg, transparent, rgba(140,170,255,.55), transparent)', filter: 'blur(4px)', transform: 'rotate(-8deg)'}} />)}
      <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `translate3d(${drift}px, 0, ${-camZ}px)`, opacity: 1 - logo}}>
        {TILES.map((t, i) => {
          const a = k(f, [t.delay * 0.5, t.delay * 0.5 + 20], [0, 1]);
          const x = t.x * (1 - conv), y = t.y * (1 - conv), z = t.z * (1 - conv) + i * 0.6 * conv;
          return (
            <div key={t.file} style={{position: 'absolute', left: 960, top: 540, transform: `translate3d(-50%,-50%,0) translate3d(${x}px, ${y}px, ${z}px) rotate(${t.r * (1 - conv)}deg) scale(${t.s * (1 - 0.3 * conv)})`,
              width: 220, height: 220, background: '#fff', padding: 14, boxSizing: 'border-box', borderRadius: 18, boxShadow: '0 30px 60px rgba(0,0,0,.55)', opacity: a,
              display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={staticFile(`logos/ap/${t.file}`)} style={{width: 150, height: 150, objectFit: 'contain'}} />
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, opacity: logo}}>
        <Img src={staticFile('logo-fansa.png')} style={{width: 220, height: 220, objectFit: 'contain', transform: `perspective(900px) rotateY(${(1 - logo) * 90}deg)`, filter: 'drop-shadow(0 0 40px rgba(124,131,255,.6))'}} />
        <div style={{fontFamily: FONT, color: '#fff', fontSize: 64, letterSpacing: 6, display: 'flex', gap: 4}}>
          {'FansaChat'.split('').map((c, i) => <span key={i} style={{display: 'inline-block', transform: `translateY(${Math.sin((f - 270) / 5 + i * 0.7) * 10 * (1 - k(f, [285, 310], [0, 1]))}px)`}}>{c}</span>)}
        </div>
        <div style={{fontFamily: FONT, color: '#aab0c8', fontSize: 34, opacity: k(f, [290, 305], [0, 1])}}>{N}+ apps on screen · 700+ apps connected</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
