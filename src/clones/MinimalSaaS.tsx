// 1:1 recreation of "Minimalist SaaS Motion Graphics Masterclass" (Sumama): white stage, soft green corner glows,
// small centred kinetic text with one coloured keyword, dark-green tilted 3D cards with red alert badges, a floating
// checklist card, a sweeping gradient line and a green CTA pill. Fast beats (~1.2 s each), blur-pop transitions.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'MinFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const POP = Easing.bezier(0.16, 1, 0.3, 1);
const k = (f: number, i: number[], o: number[], e = POP) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const GREEN = '#1f7a3a', DARK = '#0f3d22', RED = '#e0322b';

const Words: React.FC<{f: number; t: string; key2?: string; size?: number}> = ({f, t, key2, size = 46}) => (
  <div style={{display: 'flex', gap: size * 0.25, fontFamily: FONT, fontSize: size, color: '#1a1a1a'}}>
    {t.split(' ').map((w, i) => {
      const a = k(f, [i * 3, i * 3 + 10], [0, 1]);
      return <span key={i} style={{opacity: a, transform: `translateY(${(1 - a) * 24}px)`, filter: `blur(${(1 - a) * 6}px)`, color: w === key2 ? RED : undefined}}>{w}</span>;
    })}
  </div>
);
const AlertCard: React.FC<{f: number; title: string; children?: React.ReactNode}> = ({f, title, children}) => {
  const a = k(f, [0, 16], [0, 1]);
  return (
    <div style={{width: 640, height: 400, borderRadius: 40, background: `linear-gradient(160deg, #1d5a35, ${DARK})`, boxShadow: '0 50px 90px rgba(15,61,34,.35), inset 0 2px 0 rgba(255,255,255,.18)',
      transform: `perspective(1400px) rotateY(${(1 - a) * -35 - 8}deg) rotateX(6deg) scale(${0.8 + 0.2 * a})`, opacity: a, position: 'relative', padding: 40, boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', top: -22, right: -22, width: 58, height: 58, borderRadius: 99, background: RED, color: '#fff', fontFamily: FONT, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${k(f, [10, 22], [0, 1])})`}}>!</div>
      <div style={{fontFamily: FONT, color: '#d8f5e0', fontSize: 30, textAlign: 'center'}}>{title}</div>
      <div style={{marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240}}>{children}</div>
    </div>
  );
};
const Lines: React.FC = () => <div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 420}}>{[1, 0.8, 0.9, 0.6].map((w, i) => <div key={i} style={{height: 26, width: `${w * 100}%`, borderRadius: 14, background: '#e9f7ee'}} />)}</div>;

export const MinimalSaaS: React.FC = () => {
  const f = useCurrentFrame();
  const B = [0, 36, 72, 108, 144, 180, 216, 252, 300]; // beats @30fps
  const i = B.findIndex((b, j) => j === B.length - 1 || f < B[j + 1]);
  const lf = f - B[i];
  const glow = (x: string, y: string) => `radial-gradient(40% 50% at ${x} ${y}, rgba(80,200,120,.55), rgba(80,200,120,0) 70%)`;
  const pulse = k(f % 36, [0, 4, 8], [0, 1, 0]);
  const scenes: React.ReactNode[] = [
    <Words f={lf} t="Are your financial books messy?" key2="financial" />,
    <AlertCard f={lf} title="Inaccurate financial reports"><Lines /></AlertCard>,
    <AlertCard f={lf} title="Unclear financial standing"><svg width={420} height={200} viewBox="0 0 420 200"><polyline points="0,150 60,90 110,160 170,40 230,170 290,70 350,150 420,30" fill="none" stroke="#bff0cc" strokeWidth={8} strokeDasharray={900} strokeDashoffset={900 * (1 - k(lf, [6, 30], [0, 1]))} /></svg></AlertCard>,
    <AlertCard f={lf} title="Costly penalties"><span style={{fontFamily: FONT, color: '#fff', fontSize: 150}}>-{Math.round(k(lf, [4, 26], [0, 151]))}$</span></AlertCard>,
    <div style={{position: 'relative', width: 1200, height: 160}}><svg width={1200} height={160} style={{position: 'absolute'}}><path d="M0 120 C 300 -20, 700 200, 1200 40" fill="none" stroke="url(#g)" strokeWidth={10} strokeLinecap="round" strokeDasharray={1500} strokeDashoffset={1500 * (1 - k(lf, [0, 24], [0, 1]))} /><defs><linearGradient id="g"><stop offset="0" stopColor="#3ccf72" /><stop offset="1" stopColor="#2f7bff" /></linearGradient></defs></svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={lf - 8} t="Absolute clarity" size={60} /></div></div>,
    <div style={{width: 560, borderRadius: 34, background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,.12)', padding: 40, fontFamily: FONT, transform: `translateY(${(1 - k(lf, [0, 14], [0, 1])) * 80}px)`, opacity: k(lf, [0, 10], [0, 1])}}>
      <div style={{fontSize: 40, color: '#1a1a1a', marginBottom: 26}}>My Expertise</div>
      {['Initial setup', 'Deep cleanup', 'Historical catch-up', 'Accurate reconciliation', 'Monthly bookkeeping'].map((t, j) => {
        const on = k(lf, [6 + j * 4, 12 + j * 4], [0, 1]);
        return <div key={t} style={{display: 'flex', gap: 18, alignItems: 'center', fontSize: 30, color: '#333', margin: '14px 0', opacity: 0.4 + 0.6 * on}}><span style={{width: 34, height: 34, borderRadius: 8, border: `3px solid ${GREEN}`, background: on > 0.5 ? GREEN : 'transparent', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on > 0.5 ? '✓' : ''}</span>{t}</div>;
      })}
    </div>,
    <Words f={lf} t="Clean financials, tax-ready" key2="tax-ready" size={64} />,
    <div style={{padding: '22px 70px', borderRadius: 50, background: '#22b24c', color: '#fff', fontFamily: FONT, fontSize: 46, transform: `scale(${k(lf, [0, 14], [0.6, 1]) * (1 - 0.06 * k(lf, [20, 24, 28], [0, 1, 0], Easing.linear))})`, boxShadow: '0 20px 50px rgba(34,178,76,.45)'}}>Start</div>,
    <Words f={lf} t="and let's secure your business growth." size={44} />,
  ];
  return (
    <AbsoluteFill style={{background: `${glow('92%', '8%')}, ${glow('8%', '96%')}, #ffffff`}}>
      <style>{css}</style>
      <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 26, letterSpacing: 3, color: '#222'}}>IN THIS VIDEO...</div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', filter: `blur(${pulse * 8}px)`}}>{scenes[i]}</AbsoluteFill>
    </AbsoluteFill>
  );
};
