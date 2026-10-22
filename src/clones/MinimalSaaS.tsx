// v2 — 1:1 recreation of "Minimalist SaaS Motion Graphics Masterclass" (Sumama), matched beat-by-beat against the
// reference (E:\reel_study\wl\DU6gClmzkVU\ref48.jpg): big diagonal green wash, tiny centred copy with a coloured
// keyword, warning triangles, red-highlight sheet, floating UI fragments, ONE dark-green 3D card that flips between
// problems, avatar + "EXPERT" outline type, badges, checklist card, swoosh lines, finance chips, tilted dashboards,
// "tax-ready reports" + document, green Start pill. ~1 s per beat.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FONT = 'MinFont';
const css = `@font-face{font-family:${FONT};src:url(${staticFile('fonts/InterTight-500.woff2')}) format('woff2');}`;
const POP = Easing.bezier(0.16, 1, 0.3, 1), EASE = Easing.bezier(0.65, 0, 0.35, 1);
const k = (f: number, i: number[], o: number[], e = POP) => interpolate(f, i, o, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const G = '#22a447', DG = '#0d4a24', RED = '#e3342f';
const T = (s: number, c = '#151515'): React.CSSProperties => ({fontFamily: FONT, fontSize: s, color: c, whiteSpace: 'nowrap'});

const Words: React.FC<{f: number; t: string; hot?: string[]; hotColor?: string; size?: number; align?: 'center' | 'left'}> = ({f, t, hot = [], hotColor = RED, size = 40, align = 'center'}) => (
  <div style={{display: 'flex', gap: size * 0.26, justifyContent: align === 'left' ? 'flex-start' : 'center', flexWrap: 'wrap', maxWidth: 1300, width: 'fit-content'}}>
    {t.split(' ').map((w, i) => {
      const a = k(f, [i * 2.5, i * 2.5 + 9], [0, 1]);
      const isHot = hot.includes(w.replace(/[.,?]/g, ''));
      return <span key={i} style={{...T(size, isHot ? hotColor : undefined), opacity: a, transform: `translateY(${(1 - a) * 18}px)`, filter: `blur(${(1 - a) * 5}px)`,
        textShadow: isHot && hotColor === G ? '0 0 24px rgba(34,164,71,.55)' : undefined}}>{w}</span>;
    })}
  </div>
);
const Warn: React.FC<{f: number; x: number; y: number; s?: number}> = ({f, x, y, s = 1}) => (
  <svg width={90 * s} height={80 * s} viewBox="0 0 90 80" style={{position: 'absolute', left: x, top: y, transform: `scale(${k(f, [0, 10], [0, 1])}) rotate(${k(f, [0, 10], [-25, -8])}deg)`, filter: 'drop-shadow(0 10px 18px rgba(227,52,47,.35))'}}>
    <path d="M45 4 L86 74 Q88 78 83 78 L7 78 Q2 78 4 74 Z" fill={RED} /><rect x="41" y="26" width="8" height="28" rx="4" fill="#fff" /><circle cx="45" cy="64" r="5" fill="#fff" />
  </svg>
);
const Frag: React.FC<{x: number; y: number; w: number; h: number; z: number; f: number; kind?: 'table' | 'bars' | 'chip'}> = ({x, y, w, h, z, f, kind = 'table'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#fff', borderRadius: 10, boxShadow: '0 14px 30px rgba(0,0,0,.10)', border: '1px solid #e7e7e7',
    filter: `blur(${z}px)`, opacity: k(f, [0, 10], [0, 1]), transform: `translateY(${k(f, [0, 30], [24, -10], Easing.linear)}px)`, padding: 8, boxSizing: 'border-box', overflow: 'hidden'}}>
    {kind === 'table' && [0, 1, 2, 3, 4].map((r) => <div key={r} style={{height: 8, margin: '6px 0', borderRadius: 4, background: r ? '#eef1f6' : '#c9d6f0', width: `${90 - r * 7}%`}} />)}
    {kind === 'bars' && <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, height: '100%'}}>{[40, 70, 55, 85, 60, 95].map((v, j) => <div key={j} style={{flex: 1, height: `${v}%`, background: j % 2 ? '#3d7cf2' : '#36c26a', borderRadius: 3}} />)}</div>}
  </div>
);
// the one dark-green card: swings in, flips (rotateY) between problem faces
const FACES = [
  {t: 'Inaccurate financial reports', c: 'lines'}, {t: 'Wrong tax filings', c: 'lines'}, {t: 'Unclear financial standing', c: 'chart'}, {t: 'Costly Penalties', c: 'money'},
] as const;
const GreenCard: React.FC<{f: number}> = ({f}) => {
  const per = 26, idx = Math.min(FACES.length - 1, Math.floor(f / per)), lf = f - idx * per;
  const flip = idx === 0 ? k(lf, [0, 14], [-70, 0], EASE) : k(lf, [0, 12], [80, 0], EASE);
  const exit = idx === FACES.length - 1 ? k(lf, [20, 26], [0, 1], EASE) : 0;
  const face = FACES[idx];
  return (
    <div style={{perspective: 1600}}>
      <div style={{width: 640, height: 470, borderRadius: 64, background: 'linear-gradient(170deg, #1f6b3a 0%, #0f4d27 55%, #0a3a1d 100%)', position: 'relative',
        boxShadow: '0 50px 80px rgba(13,74,36,.35), inset 0 3px 0 rgba(255,255,255,.25), inset 0 -18px 30px rgba(0,0,0,.25)',
        transform: `rotateY(${flip + exit * -70}deg) translateX(${exit * 900}px) rotateX(4deg)`}}>
        <div style={{position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)', padding: '8px 26px', borderRadius: 30, background: 'rgba(255,255,255,.12)', ...T(28, '#e6ffe9')}}>{face.t}</div>
        <Warn f={lf} x={560} y={-36} s={0.9} />
        <div style={{position: 'absolute', inset: '110px 70px 50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {face.c === 'lines' && <div style={{width: '100%'}}>{[1, 0.85, 0.95, 0.7].map((w, j) => <div key={j} style={{height: 30, width: `${w * 100}%`, margin: '0 0 22px', borderRadius: 16, background: '#fff', opacity: k(lf, [4 + j * 2, 10 + j * 2], [0, 1])}} />)}</div>}
          {face.c === 'chart' && <svg width={480} height={220}><polyline points="0,190 60,120 110,175 170,60 230,180 300,90 360,170 480,30" fill="none" stroke="#ffffff" strokeWidth={7} strokeDasharray={1000} strokeDashoffset={1000 * (1 - k(lf, [2, 20], [0, 1]))} /></svg>}
          {face.c === 'money' && <span style={{...T(170, '#fff'), fontWeight: 800}}>-{Math.round(k(lf, [0, 16], [0, 170]))}$</span>}
        </div>
      </div>
    </div>
  );
};
const Avatar: React.FC<{s?: number}> = ({s = 1}) => (
  <div style={{width: 120 * s, height: 120 * s, borderRadius: 99, background: 'radial-gradient(circle at 50% 35%, #f2c9a8 0 28%, #2b1d17 29% 46%, #2fa04a 47%)', border: `${5 * s}px solid #fff`, boxShadow: '0 12px 30px rgba(0,0,0,.18)'}} />
);
const Chip: React.FC<{t: string; f: number; x: number; y: number; c?: string}> = ({t, f, x, y, c = '#fff'}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '12px 22px', borderRadius: 14, background: c, border: '1.5px solid #cfe9d6', boxShadow: '0 10px 24px rgba(0,0,0,.08)', ...T(24, '#2b2b2b'),
    opacity: k(f, [0, 8], [0, 1]), transform: `translateY(${k(f, [0, 10], [20, 0])}px)`}}>{t}</div>
);
const Check: React.FC<{f: number; items: string[]; title?: boolean}> = ({f, items, title = true}) => (
  <div style={{width: 640, background: '#fff', borderRadius: 30, boxShadow: '0 30px 70px rgba(0,0,0,.12)', padding: '36px 44px', transform: `scale(${k(f, [0, 12], [0.85, 1])})`, opacity: k(f, [0, 8], [0, 1])}}>
    {title && <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18}}><Avatar s={0.45} /><span style={{...T(40), borderBottom: `3px solid ${G}`}}>My Expertise</span></div>}
    {items.map((t, j) => {
      const on = k(f, [6 + j * 4, 12 + j * 4], [0, 1]);
      return <div key={t} style={{display: 'flex', gap: 20, alignItems: 'center', margin: '18px 0', ...T(30, '#333')}}>
        <span style={{width: 36, height: 36, borderRadius: 9, border: `3px solid ${on > 0.5 ? G : '#bbb'}`, background: on > 0.5 ? G : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24}}>{on > 0.5 ? '✓' : ''}</span>
        <span style={{background: on > 0.5 ? '#eefaf1' : 'transparent', padding: '4px 10px', borderRadius: 8}}>{t}</span></div>;
    })}
  </div>
);
const Swoosh: React.FC<{f: number; c1: string; c2: string; y: number; flip?: boolean}> = ({f, c1, c2, y, flip}) => (
  <svg width={1920} height={300} style={{position: 'absolute', left: 0, top: y, transform: flip ? 'scaleX(-1)' : undefined}}>
    <defs><linearGradient id={`s${c1}${y}`}><stop offset="0" stopColor={c1} stopOpacity={0} /><stop offset=".5" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
    <path d="M-50 230 C 500 40, 1100 300, 1980 60" fill="none" stroke={`url(#s${c1}${y})`} strokeWidth={10} strokeLinecap="round" strokeDasharray={2300} strokeDashoffset={2300 * (1 - k(f, [0, 22], [0, 1]))} />
  </svg>
);
const Dash: React.FC<{f: number; x: number; y: number; r: number; s: number}> = ({f, x, y, r, s}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 520 * s, height: 320 * s, background: '#fff', borderRadius: 16, boxShadow: '0 30px 60px rgba(0,0,0,.14)', transform: `perspective(1200px) rotateX(38deg) rotateZ(${r}deg) translateY(${k(f, [0, 20], [60, 0])}px)`, opacity: k(f, [0, 10], [0, 1]), padding: 18, boxSizing: 'border-box'}}>
    <div style={{height: 12, width: '40%', background: '#cfd9ee', borderRadius: 6, marginBottom: 14}} />
    <div style={{display: 'flex', gap: 10, alignItems: 'flex-end', height: '62%'}}>{[45, 70, 50, 90, 65, 80, 55, 95].map((v, j) => <div key={j} style={{flex: 1, height: `${v}%`, borderRadius: 4, background: j % 3 ? '#3d7cf2' : '#36c26a'}} />)}</div>
  </div>
);

type Beat = {d: number; wash?: number; node: (f: number) => React.ReactNode};
const BEATS: Beat[] = [
  {d: 24, node: (f) => <Words f={f} t="Are your financial" hot={['financial']} />},
  {d: 22, node: (f) => <><Words f={f} t="Are your financial books messy" hot={['financial']} /><Warn f={f} x={-560} y={60} s={1.4} /></>},
  {d: 18, node: (f) => <Words f={f} t="packed with" size={44} />},
  {d: 26, node: (f) => <div style={{position: 'relative', width: 760, height: 460, transform: `perspective(1400px) rotateY(-14deg) rotateX(8deg) translateX(${k(f, [0, 26], [80, -40], Easing.linear)}px)`}}>
    <div style={{position: 'absolute', top: -70, left: 40, ...T(48), fontWeight: 700}}>Uncategorized Transactions</div>
    <div style={{width: '100%', height: '100%', borderRadius: 18, background: '#fff', boxShadow: '0 40px 80px rgba(0,0,0,.16)', overflow: 'hidden'}}>
      {Array.from({length: 12}).map((_, r) => <div key={r} style={{height: 22, margin: '14px 20px', borderRadius: 6, background: r % 3 === 1 ? '#ffd2cf' : '#eef1f6'}} />)}</div>
    <div style={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${k(f, [4, 20], [0, 75])}%`, background: 'rgba(240,80,90,.55)', borderRadius: 18, mixBlendMode: 'multiply'}} /></div>},
  {d: 24, wash: 0.6, node: (f) => <div style={{position: 'relative', width: 1700, height: 900}}>
    <Frag f={f} x={60} y={40} w={300} h={180} z={2} /><Frag f={f} x={1300} y={20} w={260} h={140} z={4} kind="bars" /><Frag f={f} x={120} y={640} w={220} h={120} z={3} />
    <Frag f={f} x={1380} y={560} w={300} h={200} z={1} /><Frag f={f} x={620} y={60} w={180} h={110} z={6} kind="bars" />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={f - 4} t="that make zero sense?" size={36} /></div></div>},
  {d: 20, node: (f) => <Words f={f} t="Uncategorized transactions" size={36} />},
  {d: 104, node: (f) => <GreenCard f={f} />},
  {d: 18, node: (f) => <Words f={f} t="I take" size={36} />},
  {d: 26, wash: 1.4, node: (f) => <div style={{position: 'relative', width: 1400, height: 700}}>
    <div style={{position: 'absolute', left: 640, top: 290}}><Avatar /></div>
    {['#ff6b6b', '#ffb84d', '#36c26a', '#3d7cf2'].map((c, j) => <div key={c} style={{position: 'absolute', left: 1000 + j * 70, top: 420, width: 50, height: 50, borderRadius: 99, border: `7px solid ${c}`, borderRightColor: 'transparent', transform: `rotate(${f * 6}deg)`}} />)}
    <Frag f={f} x={120} y={80} w={260} h={120} z={0} kind="table" /><Frag f={f} x={160} y={460} w={220} h={160} z={0} kind="bars" /><Frag f={f} x={1000} y={90} w={220} h={120} z={0} /></div>},
  {d: 26, wash: 1.6, node: (f) => <div style={{position: 'relative', width: 1600, height: 300}}><Swoosh f={f} c1="#36c26a" c2="#3d7cf2" y={-20} /><div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={f - 6} t="Absolute clarity" size={48} /></div></div>},
  {d: 18, node: (f) => <Words f={f} t="Hi, I'm Fatima" hot={['Fatima']} hotColor={G} size={36} />},
  {d: 24, node: (f) => <div style={{position: 'relative', width: 700, height: 400}}><div style={{position: 'absolute', left: 290, top: 140, transform: `scale(${k(f, [0, 12], [0.4, 1])})`}}><Avatar /></div><Chip f={f - 6} t="Chartered Accountant" x={420} y={60} /></div>},
  {d: 26, node: (f) => <div style={{display: 'flex', alignItems: 'center', gap: 24, transform: `scale(${k(f, [0, 12], [0.9, 1])})`}}><div style={{width: 70, height: 70, borderRadius: 99, background: `conic-gradient(${G} 0 60%, #ffd23f 60% 100%)`}} /><Words f={f} t="QuickBooks ProAdvisor" size={64} /></div>},
  {d: 26, node: (f) => <div style={{position: 'relative', width: 1200, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <span style={{position: 'absolute', ...T(260, 'transparent'), WebkitTextStroke: `3px ${G}`, letterSpacing: 20, opacity: k(f, [0, 12], [0, 0.55]), transform: `scale(${k(f, [0, 26], [1.08, 1], Easing.linear)})`}}>EXPERT</span>
    <Avatar s={1.3} /><Chip f={f - 4} t="Chartered Accountant" x={760} y={40} /><Chip f={f - 8} t="QuickBooks ProAdvisor" x={40} y={330} /></div>},
  {d: 16, node: (f) => <Words f={f} t="certified in" size={36} />},
  {d: 22, node: (f) => <div style={{display: 'flex', gap: 30}}>{[0, 1].map((j) => <div key={j} style={{width: 150, height: 170, clipPath: 'polygon(50% 0, 100% 18%, 100% 70%, 50% 100%, 0 70%, 0 18%)', background: `linear-gradient(170deg, ${G}, ${DG})`, transform: `scale(${k(f, [j * 4, j * 4 + 12], [0, 1])})`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(20, '#fff')}}>{j ? 'Level 2' : 'Level 1'}</div>)}</div>},
  {d: 16, node: (f) => <Words f={f} t="I handle everything" hot={['everything']} hotColor={G} size={36} />},
  {d: 56, node: (f) => <Check f={f} items={['Initial setup', 'Deep cleanup', 'Historical catch-up', 'Accurate reconciliation', 'Monthly ongoing bookkeeping']} />},
  {d: 24, node: (f) => <div style={{position: 'relative', width: 1700, height: 400}}><Swoosh f={f} c1="#36c26a" c2="#ffd23f" y={50} /><div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={f - 4} t="With Ledger" hot={['Ledger']} hotColor={G} size={40} /></div></div>},
  {d: 30, node: (f) => <div style={{position: 'relative', width: 1600, height: 760}}>
    <Chip f={f} t="🛡 Insurance   $4,320" x={60} y={30} /><Chip f={f - 3} t="🏠 Rent" x={1320} y={40} c="#fff4e0" /><Chip f={f - 6} t="✈ Travel   $2,950" x={120} y={620} /><Chip f={f - 9} t="📣 Marketing" x={1280} y={610} c="#ffe6e6" />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={f - 4} t="you get accurately categorized transactions" hot={['categorized']} hotColor={G} size={34} /></div></div>},
  {d: 30, wash: 1.2, node: (f) => <div style={{position: 'relative', width: 1500, height: 800}}><Dash f={f} x={160} y={220} r={-14} s={1.1} /><Dash f={f - 4} x={700} y={120} r={-14} s={1.25} /><div style={{position: 'absolute', left: 120, top: 40, ...T(56, '#1f3b6b'), fontWeight: 700, opacity: k(f, [6, 14], [0, 1])}}>Clean financial</div></div>},
  {d: 28, node: (f) => <div style={{display: 'flex', alignItems: 'center', gap: 60}}><div style={{...T(84), fontWeight: 800, lineHeight: 1.05, opacity: k(f, [0, 10], [0, 1])}}>and<br />tax-ready<br />reports.</div>
    <div style={{width: 380, height: 500, background: '#fff', borderRadius: 14, boxShadow: '0 30px 70px rgba(0,0,0,.14)', transform: `perspective(1000px) rotateY(-24deg) translateX(${k(f, [0, 16], [200, 0])}px)`, padding: 34, boxSizing: 'border-box'}}>{Array.from({length: 11}).map((_, j) => <div key={j} style={{height: 12, margin: '16px 0', background: '#e6e6e6', borderRadius: 6, width: `${95 - (j % 4) * 12}%`}} />)}</div></div>},
  {d: 18, node: (f) => <Words f={f} t="Stop guessing your numbers" hot={['numbers']} hotColor={G} size={36} />},
  {d: 30, node: (f) => <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}><div style={{padding: '16px 64px', borderRadius: 40, background: G, ...T(40, '#fff'), boxShadow: '0 18px 40px rgba(34,164,71,.45)', transform: `scale(${k(f, [0, 12], [0.4, 1]) * (1 - 0.07 * k(f, [16, 19, 23], [0, 1, 0], Easing.linear))})`}}>Start</div><div style={{opacity: k(f, [8, 16], [0, 1])}}><Words f={f - 8} t="for a custom solution" size={26} /></div></div>},
  {d: 36, node: (f) => <div style={{position: 'relative', width: 1600, height: 300}}><Swoosh f={f} c1="#36c26a" c2="#ffd23f" y={0} flip /><div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Words f={f - 4} t="and let's secure your business growth." hot={['growth']} hotColor={G} size={34} /></div></div>},
];
export const MINIMAL_SAAS_FRAMES = BEATS.reduce((a, b) => a + b.d, 0);

export const MinimalSaaS: React.FC = () => {
  const f = useCurrentFrame() / 2; // authored at 30 fps, rendered at 60 fps
  let acc = 0, i = 0;
  while (i < BEATS.length - 1 && f >= acc + BEATS[i].d) { acc += BEATS[i].d; i++; }
  const lf = f - acc, b = BEATS[i];
  const pop = k(lf, [0, 4], [1, 0], Easing.linear); // quick blur-pop on every cut
  const wash = b.wash ?? 1;
  return (
    <AbsoluteFill style={{background: '#ffffff', overflow: 'hidden'}}>
      <style>{css}</style>
      <div style={{position: 'absolute', right: -300, top: -420, width: 1500, height: 1100, transform: `rotate(-28deg) scale(${wash})`, background: 'radial-gradient(closest-side, rgba(60,200,100,.75), rgba(60,200,100,.25) 55%, rgba(60,200,100,0))', filter: 'blur(30px)'}} />
      <div style={{position: 'absolute', left: -380, bottom: -420, width: 1000, height: 800, background: 'radial-gradient(closest-side, rgba(60,200,100,.55), rgba(60,200,100,0))', filter: 'blur(30px)'}} />
      <div style={{position: 'absolute', top: 18, width: '100%', textAlign: 'center', ...T(22, '#111'), letterSpacing: 2, fontWeight: 700}}>IN THIS VIDEO...</div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', filter: `blur(${pop * 7}px)`, transform: `scale(${1.38 + pop * 0.05})`}}>{b.node(lf)}</AbsoluteFill>
    </AbsoluteFill>
  );
};
