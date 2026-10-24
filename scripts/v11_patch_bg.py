# Part 2: replace the v10 background (FxLayer + Backdrop) with the 7 per-video dynamic background types.
import sys
P = 'src/ads/v11/kit.tsx'
s = open(P, encoding='utf-8').read()
a, b = s.index('// ---- background:'), s.index('// ---- camera')
NEW = r'''// ---- background: every video its own dynamic TYPE + colour combo; colours always flow (left<->right within seconds) --
// Techniques (re-implemented frame-driven so they render headless): liquid blooms = our LiquidGlass clone; aurora bands
// (Stripe/whatamesh-style mesh feel); layered sine waves (vanta "waves" idea); color bends = landing ColorBends look
// (reference/landing-bg/ColorBends.jsx); SVG goo metaballs (CSS-tricks gooey technique); silk ribbons; topographic contours.
const sw = (s: number, period: number, ph = 0) => Math.sin((s / period) * Math.PI * 2 + ph); // smooth periodic drift
const Blur: React.FC<{px: number; children: React.ReactNode}> = ({px, children}) => <AbsoluteFill style={{filter: `blur(${px}px)`}}>{children}</AbsoluteFill>;

const BgLayer: React.FC<{th: Theme; s: number}> = ({th, s}) => {
  const [c0, c1, c2] = th.bloom;
  switch (th.type) {
    case 'liquid': // P01: sky blue + white, LiquidGlass wave, richer variation (three blues travelling left<->right)
      return <AbsoluteFill style={{background: [
        `radial-gradient(62% 56% at ${32 + 22 * sw(s, 7)}% ${66 + 6 * sw(s, 9, 1)}%, ${c0} 0%, rgba(255,255,255,0) 62%)`,
        `radial-gradient(52% 46% at ${76 - 20 * sw(s, 8, 2)}% ${30 + 8 * sw(s, 6)}%, ${c1} 0%, rgba(255,255,255,0) 60%)`,
        `radial-gradient(40% 36% at ${54 + 30 * sw(s, 11, 4)}% ${48 + 10 * sw(s, 10, 3)}%, ${c2} 0%, rgba(255,255,255,0) 60%)`].join(',')}} />;
    case 'aurora': // P02: lavender + peach aurora bands sweeping left<->right
      return <Blur px={70}>{[c0, c1, c2, c0].map((c, i) => <div key={i} style={{position: 'absolute', left: `${-20 + 30 * sw(s, 9 + i * 2, i)}%`, top: 120 + i * 210, width: '140%', height: 230,
        borderRadius: '50%', background: `linear-gradient(90deg, rgba(255,255,255,0), ${c}, rgba(255,255,255,0))`, transform: `rotate(${-8 + 10 * sw(s, 12, i * 1.3)}deg)`, opacity: 0.85}} />)}</Blur>;
    case 'waves': { // P03: dark navy + electric blue layered glowing waves
      const layers = [0, 1, 2, 3, 4, 5];
      return <AbsoluteFill><svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>{layers.map((i) => <linearGradient key={i} id={`wv${i}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={i % 2 ? c0 : c1} stopOpacity={0.05} />
          <stop offset={0.5 + 0.3 * sw(s, 6, i)} stopColor={i % 3 === 2 ? c2 : i % 2 ? c1 : c0} stopOpacity={0.55} /><stop offset="1" stopColor={c0} stopOpacity={0.05} /></linearGradient>)}</defs>
        {layers.map((i) => { let d = 'M -40 1100 '; for (let x = -40; x <= 1960; x += 40) { const y = 610 + i * 52 + 70 * Math.sin(x / (260 + i * 30) + s * (0.9 + i * 0.12) + i) + 30 * Math.sin(x / 140 - s * 0.6); d += `L ${x} ${y} `; }
          d += 'L 1960 1100 Z'; return <path key={i} d={d} fill={`url(#wv${i})`} opacity={0.5 + i * 0.05} />; })}
        {layers.slice(0, 3).map((i) => { let d = ''; for (let x = -40; x <= 1960; x += 30) { const y = 560 + i * 90 + 60 * Math.sin(x / 300 + s * 1.1 + i * 2); d += `${x === -40 ? 'M' : 'L'} ${x} ${y} `; }
          return <path key={`l${i}`} d={d} fill="none" stroke={c1} strokeWidth={2} opacity={0.7} style={{filter: `drop-shadow(0 0 8px ${c1})`}} />; })}
      </svg></AbsoluteFill>;
    }
    case 'bends': // P04: orange + warm — landing ColorBends look: wide bending colour bands flowing left<->right
      return <Blur px={60}><svg width={1920} height={1080} style={{position: 'absolute'}}>{[c0, c1, c2, c1, c0].map((c, i) => { let d = '';
        for (let x = -200; x <= 2120; x += 60) { const y = 100 + i * 210 + 140 * Math.sin(x / 520 + s * 0.55 + i * 0.9) + 60 * sw(s, 8, i); d += `${x === -200 ? 'M' : 'L'} ${x + 160 * sw(s, 10, i)} ${y} `; }
        return <path key={i} d={d} fill="none" stroke={c} strokeWidth={190} strokeLinecap="round" opacity={0.75} />; })}</svg></Blur>;
    case 'metaballs': { // P05: aqua + magenta liquid blobs that merge (SVG goo filter)
      const balls = Array.from({length: 9}, (_, i) => [960 + 760 * sw(s, 9 + i, i * 1.7), 540 + 380 * sw(s, 7 + i * 0.6, i * 2.3), 120 + 70 * ((i * 37) % 5) / 4] as const);
      return <AbsoluteFill style={{opacity: 0.7}}><svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="40" result="b" /><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -14" /></filter>
          <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c0} /><stop offset={0.5 + 0.3 * sw(s, 6)} stopColor={c2} /><stop offset="1" stopColor={c1} /></linearGradient></defs>
        <g filter="url(#goo)" fill="url(#mbg)">{balls.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g></svg>
        <AbsoluteFill style={{backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)'}} /></AbsoluteFill>;
    }
    case 'silk': // P06: rose + plum silk ribbons flowing
      return <Blur px={10}><svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>{[0, 1, 2].map((i) => <linearGradient key={i} id={`sk${i}`} x1="0" x2="1"><stop offset="0" stopColor={[c0, c1, c2][i]} stopOpacity={0} />
          <stop offset={0.5 + 0.35 * sw(s, 7, i)} stopColor={[c0, c1, c2][i]} /><stop offset="1" stopColor={[c0, c1, c2][i]} stopOpacity={0} /></linearGradient>)}</defs>
        {Array.from({length: 7}, (_, i) => { let d = ''; for (let x = -80; x <= 2000; x += 40) { const y = 300 + i * 85 + 90 * Math.sin(x / 330 + s * 0.75 + i * 0.8) + 40 * Math.sin(x / 160 - s * 0.5 + i); d += `${x === -80 ? 'M' : 'L'} ${x} ${y} `; }
          return <path key={i} d={d} fill="none" stroke={`url(#sk${i % 3})`} strokeWidth={46 - i * 4} strokeLinecap="round" opacity={0.65} />; })}</svg></Blur>;
    default: { // contours — P07: cream + indigo topographic lines drifting, a soft light beam sweeping left<->right
      const cx = 960 + 420 * sw(s, 12), cy = 540 + 160 * sw(s, 9, 1);
      return <AbsoluteFill><svg width={1920} height={1080} style={{position: 'absolute'}}>{Array.from({length: 16}, (_, i) => { let d = '';
        for (let a = 0; a <= 64; a++) { const t = (a / 64) * Math.PI * 2, r = 70 + i * 62 + 26 * Math.sin(t * 3 + s * 0.6 + i * 0.4) + 14 * Math.sin(t * 5 - s * 0.4); d += `${a ? 'L' : 'M'} ${cx + Math.cos(t) * r * 1.5} ${cy + Math.sin(t) * r} `; }
        return <path key={i} d={d + 'Z'} fill="none" stroke={i % 4 === 0 ? c1 : c0} strokeWidth={i % 4 === 0 ? 2.2 : 1.3} opacity={0.5 - i * 0.022} />; })}</svg>
        <AbsoluteFill style={{background: `linear-gradient(100deg, rgba(255,255,255,0) ${30 + 30 * sw(s, 8)}%, ${c2} ${42 + 30 * sw(s, 8)}%, rgba(255,255,255,0) ${56 + 30 * sw(s, 8)}%)`, opacity: 0.55}} /></AbsoluteFill>;
    }
  }
};
const Backdrop: React.FC<{th: Theme; s: number}> = ({th, s}) => (
  <AbsoluteFill style={{background: `linear-gradient(${160 + 20 * sw(s, 14)}deg, ${th.bg[0]}, ${th.bg[1]})`}}>
    <BgLayer th={th} s={s} />
    {/* soft centre clearing so text sits on calm colour (contrast is checked against bg[0]/bg[1]) */}
    <AbsoluteFill style={{background: th.dark ? 'radial-gradient(48% 40% at 50% 50%, rgba(8,12,28,.55), rgba(8,12,28,0) 75%)' : 'radial-gradient(48% 42% at 50% 52%, rgba(255,255,255,.58), rgba(255,255,255,0) 75%)'}} />
  </AbsoluteFill>
);

'''
s = s[:a] + NEW + s[b:]
open(P, 'w', encoding='utf-8').write(s)
print('backgrounds patched')
