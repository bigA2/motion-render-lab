// Renderers part 3: appwall, sticky, sign, label, pixel, neon, cover, subway, whiteboard, sheet, postcard, card, glass, collage, maya, iso, cta.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Spec, Theme, W, H, M, F, PAIRS, Rich, Txt, Meta, Logo, FLogo, Brand, Grain, Prompt, AppRow, Hero3D, fit, lines, mix, onC, appName} from './kit';
import LOGOS from './logos.json';
type RP = {s: Spec; th: Theme};
const ALL = Object.keys(LOGOS).filter((k) => (LOGOS as Record<string, string | null>)[k] && !['Schedule', 'Webhook', 'Delay', 'RSS Feed'].includes(k));

export const AppWall: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const cols = 7, sz = 108, gap = 28; const ox = (W - (cols * sz + (cols - 1) * gap)) / 2;
  return <AbsoluteFill style={{background: th.bg, overflow: 'hidden'}}>
    {Array.from({length: 7 * 6}).map((_, i) => { const a = ALL[(i * 7 + 3) % ALL.length]; const hl = s.apps.includes(a); return <div key={i} style={{position: 'absolute', left: ox + (i % cols) * (sz + gap), top: 330 + Math.floor(i / cols) * (sz + gap), opacity: hl ? 1 : 0.9}}><Logo app={a} size={sz} bg={dk ? '#1B1C24' : '#fff'} /></div>; })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F.unb, fontWeight: 800, fontSize: fit(s, lines(s.head), W - 80, 200, PAIRS.U), lineHeight: 1, letterSpacing: '-0.04em', color: dk ? 'transparent' : th.ink, WebkitTextStroke: dk ? `3px ${th.main}` : 'none'}}>{lines(s.head).map((l, i) => <div key={i}>{l.replace(/\*/g, '')}</div>)}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, height: 200, background: `linear-gradient(180deg, transparent, ${th.bg})`}} />
    <Txt w={700} size={34} c={th.ink} s={{position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center'}}>{s.sub || '700+ apps. One sentence.'}</Txt>
    <Brand c={th.ink} /><Grain o={0.05} />
  </AbsoluteFill>;
};

export const Sticky: React.FC<RP> = ({s, th}) => {
  const n = s.x.notes as string[]; const one = n.length === 1; const cs = ['#FDE047', '#A7F3D0', '#FBCFE8', '#BFDBFE', '#FED7AA', '#DDD6FE'];
  return <AbsoluteFill style={{background: '#D9CBB4', backgroundImage: 'radial-gradient(#00000012 1px, transparent 1px)', backgroundSize: '6px 6px'}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 120)} color="#1F1A14" acc={th.con} style={{position: 'absolute', left: M, top: 60}} />
    {one ? <div style={{position: 'absolute', left: 240, top: 380, width: 600, height: 600, background: th.main, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', transform: 'rotate(-4deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 50}}><Txt f={F.cav} w={700} size={84} c="#1F1A14" s={{textAlign: 'center', lineHeight: 1.05}}>{n[0]}</Txt></div>
      : n.map((x, i) => <div key={i} style={{position: 'absolute', left: 60 + (i % 3) * 330 + ((i * 37) % 30), top: 360 + Math.floor(i / 3) * 330 + ((i * 53) % 40), width: 290, height: 290, background: cs[i % cs.length], boxShadow: '0 18px 36px rgba(0,0,0,0.25)', transform: `rotate(${((i * 47) % 14) - 7}deg)`, padding: 28}}><Txt f={F.cav} w={700} size={52} c="#1F1A14" s={{lineHeight: 1.0}}>{x}</Txt></div>)}
    <Txt w={600} size={28} c="#1F1A14" s={{position: 'absolute', left: M, top: 1060, width: W - 2 * M}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 1150}}><AppRow apps={s.apps} size={52} c="#1F1A14" /></div>
    <Brand c="#1F1A14" y={H - 80} /><Grain o={0.12} />
  </AbsoluteFill>;
};

export const Sign: React.FC<RP> = ({s, th}) => {
  const haz = s.style.includes('Hazard');
  return <AbsoluteFill style={{background: haz ? '#121212' : `linear-gradient(180deg, #8EC5FF, #E6F2FF 60%, #6E8B5B 60%)`}}>
    <div style={{position: 'absolute', left: 530, top: 700, width: 26, height: 560, background: '#777'}} />
    {haz ? <div style={{position: 'absolute', left: 140, top: 120, width: 800, height: 800, background: th.main, transform: 'rotate(45deg) scale(0.78)', border: '28px solid #111', boxShadow: '0 0 0 14px ' + th.main}} />
      : <div style={{position: 'absolute', left: 120, top: 140, width: 840, height: 600, borderRadius: 40, background: th.main, border: '16px solid #111', boxShadow: '0 30px 60px rgba(0,0,0,0.3)'}} />}
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), haz ? 520 : 720, 150, PAIRS.BB)} pair={PAIRS.BB} color="#111" acc="#111" align="center" upper style={{position: 'absolute', left: 0, right: 0, top: haz ? 300 : 210}} />
    {haz && <div style={{position: 'absolute', left: 0, right: 0, top: 960, height: 70, background: `repeating-linear-gradient(45deg, ${th.main} 0 40px, #111 40px 80px)`}} />}
    {s.sub && <Txt w={700} size={32} c={haz ? '#fff' : '#111'} s={{position: 'absolute', left: M, right: M, top: 1060, textAlign: 'center'}}>{s.sub}</Txt>}
    {!haz && <div style={{position: 'absolute', left: M, top: 1100}}><AppRow apps={s.apps} size={60} c="#fff" /></div>}
    <Brand c="#fff" /><Grain o={0.1} />
  </AbsoluteFill>;
};

export const Label: React.FC<RP> = ({s, th}) => {
  const wine = s.style.includes('Wine'); const rows = s.x.rows as string[][];
  if (wine) return <AbsoluteFill style={{background: `radial-gradient(60% 50% at 50% 40%, ${mix(th.main, '#000', 0.2)}, #120406)`}}>
    <div style={{position: 'absolute', left: 240, top: 150, width: 600, height: 900, background: '#F3E9D6', borderRadius: 10, boxShadow: '0 40px 90px rgba(0,0,0,0.5)', padding: 50, textAlign: 'center', border: `3px double ${th.main}`}}>
      <Txt f={F.playI} w={400} size={34} c={th.main}>Domaine FansaChat</Txt>
      <div style={{margin: '24px auto', width: 120, height: 2, background: th.main}} />
      <Rich s={s} text={s.head} size={96} color="#2A1508" acc={th.main} align="center" />
      <Txt f={F.playI} w={400} size={30} c="#4A2A18" s={{marginTop: 26}}>{s.sub}</Txt>
      <div style={{marginTop: 40}}>{rows.map(([k, v]) => <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mont, fontSize: 22, color: '#2A1508', padding: '10px 30px', borderBottom: '1px solid #C9B79A'}}><span style={{letterSpacing: 2}}>{k.toUpperCase()}</span><span style={{fontWeight: 800}}>{v}</span></div>)}</div>
      <div style={{marginTop: 34, display: 'flex', justifyContent: 'center'}}><AppRow apps={s.apps} size={52} c="#7A5A3A" /></div>
    </div>
    <Brand c="#F3E9D6" /><Grain o={0.14} blend="screen" />
  </AbsoluteFill>;
  return <AbsoluteFill style={{background: th.acc}}>
    <div style={{position: 'absolute', left: 190, top: 90, width: 700, padding: 30, background: '#fff', border: '4px solid #111', boxShadow: '20px 20px 0 rgba(0,0,0,0.25)'}}>
      <div style={{fontFamily: F.arch, fontSize: 84, color: '#111', lineHeight: 1}}>{s.head}</div>
      <Txt size={24} c="#111" s={{borderBottom: '14px solid #111', paddingBottom: 10, marginTop: 8}}>{s.sub}</Txt>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.arch, fontSize: 30, color: '#111', borderBottom: '6px solid #111', padding: '12px 0'}}><span>Effort per run</span><span>0</span></div>
      {rows.map(([k, v]) => <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontSize: 28, color: '#111', borderBottom: '2px solid #111', padding: '14px 0'}}><span style={{fontWeight: 700}}>{k}</span><span>{v}</span></div>)}
      <Txt size={20} c="#111" s={{marginTop: 14, lineHeight: 1.4}}>Ingredients: {[...new Set(s.apps)].map(appName).join(', ')}, plain English.</Txt>
    </div>
    <Txt w={800} size={36} c={onC(th.acc)} s={{position: 'absolute', left: M, right: M, top: 1110, textAlign: 'center'}}>Serving size: one sentence.</Txt>
    <Brand c={onC(th.acc)} /><Grain o={0.08} />
  </AbsoluteFill>;
};

export const Pixel: React.FC<RP> = ({s, th}) => {
  const over = s.style.includes('Game Over'); const hud = s.x.hud as string[];
  return <AbsoluteFill style={{background: '#0B0B12', imageRendering: 'pixelated'}}>
    <div style={{position: 'absolute', inset: 40, border: `8px solid ${th.main}`, boxShadow: `0 0 0 8px #0B0B12, 0 0 0 16px ${th.main}55`}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 5px)'}} />
    <Txt f={F.pix} w={400} size={over ? 92 : 64} c={th.main} s={{position: 'absolute', left: 0, right: 0, top: over ? 300 : 170, textAlign: 'center', lineHeight: 1.4, textShadow: `6px 6px 0 ${mix(th.main, '#000', 0.6)}`}}>{lines(s.head).map((l, i) => <div key={i}>{l}</div>)}</Txt>
    {!over && <div style={{position: 'absolute', left: 340, top: 470, width: 400, height: 400, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)'}}>{'0011110001111110111111111101101111111111011111100100001010000001'.split('').map((b, i) => <div key={i} style={{background: b === '1' ? th.acc : 'transparent'}} />)}</div>}
    <Txt f={F.pix} w={400} size={26} c="#fff" s={{position: 'absolute', left: 0, right: 0, top: over ? 520 : 930, textAlign: 'center', lineHeight: 1.6}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: 0, right: 0, top: over ? 680 : 1020, textAlign: 'center'}}>{hud.map((h, i) => <Txt key={i} f={F.pix} w={400} size={over ? 34 : 22} c={i === 1 && over ? th.main : '#ddd'} s={{lineHeight: 2}}>{h}</Txt>)}</div>
    {over && <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center'}}><AppRow apps={s.apps} size={64} c="#888" /></div>}
    <Brand c="#fff" y={H - 120} />
  </AbsoluteFill>;
};

export const Neon: React.FC<RP> = ({s, th}) => {
  const c = th.main; const glow = `0 0 8px #fff, 0 0 22px ${c}, 0 0 48px ${c}, 0 0 90px ${c}`;
  return <AbsoluteFill style={{background: '#0B0A10', backgroundImage: 'linear-gradient(#ffffff06 2px, transparent 2px), linear-gradient(90deg, #ffffff06 2px, transparent 2px)', backgroundSize: '90px 60px'}}>
    <div style={{position: 'absolute', left: 80, right: 80, top: 160, height: 640, borderRadius: 40, border: `6px solid ${th.acc}`, boxShadow: `0 0 30px ${th.acc}, inset 0 0 30px ${th.acc}66`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', fontFamily: F.cav, fontWeight: 700, fontSize: fit(s, lines(s.head), 820, 210, PAIRS.C), lineHeight: 1.0, color: '#FFF6FB', textShadow: glow}}>{lines(s.head).map((l, i) => <div key={i}>{l}</div>)}</div>
    {s.sub && <Txt f={F.inter} w={500} size={32} c="#D8D4E8" s={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center'}}>{s.sub}</Txt>}
    <Prompt s={s} th={{...th, card: '#17161F'}} size={21} style={{position: 'absolute', left: M, top: 980}} />
    <Brand c="#F5F0FF" /><Grain o={0.08} blend="screen" />
  </AbsoluteFill>;
};

export const Cover: React.FC<RP> = ({s, th}) => {
  const vinyl = s.style.includes('Vinyl');
  if (vinyl) return <AbsoluteFill style={{background: '#16130F'}}>
    <div style={{position: 'absolute', left: 300, top: 150, width: 720, height: 720, borderRadius: 360, background: 'repeating-radial-gradient(#111 0 3px, #1D1D1D 3px 5px)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}><div style={{position: 'absolute', left: 250, top: 250, width: 220, height: 220, borderRadius: 110, background: th.acc, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FLogo size={90} /></div></div>
    <div style={{position: 'absolute', left: M, top: 120, width: 760, height: 760, background: `linear-gradient(135deg, ${th.main}, ${th.con})`, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', padding: 50, overflow: 'hidden'}}>
      <Hero3D hero={s.hero} size={460} x={520} y={500} rot={-12} shadow="rgba(0,0,0,0.5)" />
      <Rich s={s} text={s.head} size={64} color="#fff" acc="#FFE3C8" style={{position: 'relative'}} />
      <Meta c="#fff" s={{left: 50, bottom: 40}}>FansaChat Records · LP {s.id.slice(4)}</Meta>
    </div>
    <Txt size={26} c="#E9DFD2" s={{position: 'absolute', left: M, top: 950, width: W - 2 * M}}>Now playing: “{s.t}”</Txt>
    <div style={{position: 'absolute', left: M, top: 1080}}><AppRow apps={s.apps} size={58} c="#aaa" /></div>
    <Brand c="#E9DFD2" /><Grain o={0.14} blend="screen" />
  </AbsoluteFill>;
  return <AbsoluteFill style={{background: '#D9D2C3'}}>
    <div style={{position: 'absolute', left: 190, top: 90, width: 700, height: 1000, background: th.main, boxShadow: '-14px 0 0 ' + mix(th.main, '#000', 0.35) + ', 0 40px 80px rgba(0,0,0,0.4)', padding: '70px 60px', overflow: 'hidden'}}>
      <Txt f={F.mont} w={800} size={20} c="#E8D9B5" s={{letterSpacing: 6, textAlign: 'center'}}>A NOVEL</Txt>
      <Rich s={s} text={s.head} size={fit(s, lines(s.head), 580, 96)} color="#F3E6C8" acc="#E8B04A" align="center" style={{marginTop: 40}} />
      <Hero3D hero={s.hero} size={360} x={350} y={640} shadow="rgba(0,0,0,0.45)" />
      <Txt f={F.playI} w={400} size={28} c="#E8D9B5" s={{position: 'absolute', left: 60, right: 60, bottom: 110, textAlign: 'center'}}>{s.sub}</Txt>
      <Txt f={F.mont} w={800} size={22} c="#E8B04A" s={{position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center', letterSpacing: 4}}>FANSACHAT PRESS</Txt>
    </div>
    <Brand c="#2A2418" /><Grain o={0.12} />
  </AbsoluteFill>;
};

export const Subway: React.FC<RP> = ({s, th}) => {
  const st = s.x.stops as string[]; const dk = s.dark; const ink = th.ink; const apps = [...new Set(s.apps)];
  const pts = [[150, 520], [420, 520], [600, 700], [600, 950], [880, 950]].slice(0, st.length);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p.join(' ')).join(' ');
  return <AbsoluteFill style={{background: dk ? '#101114' : '#F5F4EF'}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 120)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 80}} />
    <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={H}><path d={d} stroke={dk ? '#333' : '#DDD'} strokeWidth="44" fill="none" strokeLinejoin="round" /><path d={d} stroke={th.main} strokeWidth="26" fill="none" strokeLinejoin="round" strokeLinecap="round" /></svg>
    {pts.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 34, top: y - 34}}><div style={{width: 68, height: 68, borderRadius: 34, background: '#fff', border: `10px solid ${dk ? '#101114' : '#222'}`}} />
      <div style={{position: 'absolute', left: i === 2 ? 90 : -40, top: i === 2 ? 0 : 80, width: 260, display: 'flex', alignItems: 'center', gap: 10}}>{apps[i] && st[i] === apps[i] ? <Logo app={apps[i]} size={44} /> : null}<Txt w={800} size={28} c={ink}>{st[i]}</Txt></div></div>)}
    <Meta c={th.soft} s={{left: M, top: 1110}}>Line FC · runs every time · no changes</Meta>
    {s.sub && <Txt size={26} c={th.soft} s={{position: 'absolute', left: M, top: 1160, width: W - 2 * M}}>{s.sub}</Txt>}
    <Brand c={ink} y={H - 86} /><Grain o={0.05} />
  </AbsoluteFill>;
};

export const Whiteboard: React.FC<RP> = ({s, th}) => {
  const chalk = s.dark; const bg = chalk ? '#1F3A2E' : '#F7F7F4'; const ink = chalk ? '#F2F2EA' : '#1D3FBB';
  return <AbsoluteFill style={{background: bg, border: chalk ? '30px solid #6B4423' : '22px solid #C9CDD3'}}>
    <Txt f={F.cav} w={700} size={88} c={ink} s={{position: 'absolute', left: 60, top: 60, lineHeight: 1.0}}>{lines(s.head).map((l, i) => <div key={i}>{l.replace(/\*/g, '')}</div>)}</Txt>
    <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={H}><path d="M 80 290 Q 400 270 760 300" stroke={chalk ? '#F5D76E' : '#E11D48'} strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
    {[...new Set(s.apps)].map((a, i, arr) => <React.Fragment key={a}><div style={{position: 'absolute', left: 90 + i * 320, top: 420 + (i % 2) * 60, width: 230, padding: 18, border: `4px solid ${ink}`, borderRadius: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `rotate(${i % 2 ? 3 : -2}deg)`}}><Logo app={a} size={84} /><Txt f={F.cav} w={700} size={38} c={ink}>{appName(a)}</Txt></div>
      {i < arr.length - 1 && <Txt f={F.cav} w={700} size={90} c={ink} s={{position: 'absolute', left: 330 + i * 320, top: 480}}>→</Txt>}</React.Fragment>)}
    <Txt f={F.cav} w={700} size={52} c={chalk ? '#F5D76E' : '#E11D48'} s={{position: 'absolute', left: 80, top: 760, width: 900, lineHeight: 1.1}}>{s.sub || 'one sentence. that’s the whole plan.'}</Txt>
    <Txt f={F.cav} w={500} size={40} c={ink} s={{position: 'absolute', left: 80, top: 900, width: 900, lineHeight: 1.15}}>“{s.t}”</Txt>
    <Brand c={ink} y={H - 130} /><Grain o={0.1} />
  </AbsoluteFill>;
};

export const Sheet: React.FC<RP> = ({s, th}) => {
  const fixed = s.style.includes('Fixed'); const cols = ['A', 'B', 'C', 'D', 'E']; const rows = 12;
  return <AbsoluteFill style={{background: '#FFFFFF'}}>
    <div style={{height: 60, background: '#107C41', display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: F.inter, fontWeight: 700, fontSize: 22, color: '#fff'}}>{fixed ? 'donations_2026.xlsx — updated automatically' : 'campaign_numbers_FINAL_v7.xlsx'}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)'}}>
      <div style={{background: '#F3F3F3', height: 40, border: '1px solid #DDD'}} />{cols.map((c) => <div key={c} style={{background: '#F3F3F3', height: 40, border: '1px solid #DDD', fontFamily: F.inter, fontSize: 18, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c}</div>)}
      {Array.from({length: rows}).map((_, r) => <React.Fragment key={r}><div style={{background: '#F3F3F3', height: 54, border: '1px solid #DDD', fontFamily: F.inter, fontSize: 18, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{r + 1}</div>
        {cols.map((c, ci) => <div key={c} style={{height: 54, border: '1px solid #E5E5E5', fontFamily: F.mono, fontSize: 18, color: '#333', padding: '14px 10px', background: !fixed && (r * 7 + ci * 3) % 11 === 0 ? '#FDE2E2' : fixed && ci === 4 && r > 0 ? '#DCFCE7' : 'transparent'}}>{r === 0 ? ['Date', 'Source', 'Amount', 'Owner', 'Status'][ci] : !fixed && (r * 7 + ci * 3) % 11 === 0 ? '#REF!' : ci === 4 ? (fixed ? '✓ thanked' : '??') : ci === 0 ? `0${(r % 9) + 1}/10` : ci === 2 ? `${(r * 37) % 900 + 40}` : '…'}</div>)}</React.Fragment>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, bottom: 0, background: fixed ? th.main : '#111'}} />
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 110)} color={fixed ? onC(th.main) : '#fff'} acc={fixed ? th.con : th.main} style={{position: 'absolute', left: M, top: 800}} />
    <Txt size={28} c={fixed ? onC(th.main) : '#ddd'} s={{position: 'absolute', left: M, top: 1040, width: W - 2 * M}}>{s.sub}</Txt>
    <Brand c={fixed ? onC(th.main) : '#fff'} />
  </AbsoluteFill>;
};

export const Postcard: React.FC<RP> = ({s, th}) => {
  const stamps = s.style.includes('Stamp');
  return <AbsoluteFill style={{background: '#CDBFA6'}}>
    {stamps ? <div style={{position: 'absolute', left: 120, top: 120, display: 'grid', gridTemplateColumns: 'repeat(3, 260px)', gap: 30}}>{lines(s.head).map((l, i) => <div key={i} style={{width: 260, height: 320, background: '#FFF8EC', padding: 14, filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.25))', clipPath: 'polygon(0 4%,4% 0,8% 4%,12% 0,16% 4%,20% 0,24% 4%,28% 0,32% 4%,36% 0,40% 4%,44% 0,48% 4%,52% 0,56% 4%,60% 0,64% 4%,68% 0,72% 4%,76% 0,80% 4%,84% 0,88% 4%,92% 0,96% 4%,100% 0,100% 100%,0 100%)'}}>
      <div style={{width: '100%', height: '100%', background: [th.main, th.acc, th.con][i], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}><Logo app={[...new Set(s.apps)][i] ?? s.apps[0]} size={90} /><Txt f={F.play} w={900} size={40} c="#fff">{l.replace(/\*/g, '')}</Txt></div></div>)}</div>
      : <div style={{position: 'absolute', left: 80, top: 140, width: 920, height: 600, background: `linear-gradient(160deg, ${th.main}, ${th.acc})`, boxShadow: '0 30px 70px rgba(0,0,0,0.35)', transform: 'rotate(-3deg)', padding: 50, overflow: 'hidden'}}>
        <Rich s={s} text={s.head} size={96} color="#fff" acc="#FFF3D6" />
        <div style={{position: 'absolute', right: 40, top: 40, width: 150, height: 180, border: '4px dashed #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FLogo size={100} /></div>
        <Txt f={F.playI} w={400} size={30} c="#fff" s={{position: 'absolute', left: 50, bottom: 40}}>{s.sub}</Txt>
      </div>}
    <div style={{position: 'absolute', left: 120, top: stamps ? 520 : 820, width: 840, padding: 34, background: '#FFF8EC', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', transform: stamps ? 'none' : 'rotate(1.5deg)'}}>
      <Txt f={F.cav} w={500} size={40} c="#2B2118" s={{lineHeight: 1.2}}>Dear {s.aud},<br />just type: “{s.t}.”<br />— FansaChat</Txt>
    </div>
    {stamps && <Txt f={F.play} w={900} size={64} c="#2B2118" s={{position: 'absolute', left: 120, top: 980}}>{s.sub || 'Every order, handled.'}</Txt>}
    <Brand c="#2B2118" /><Grain o={0.16} />
  </AbsoluteFill>;
};

export const Card: React.FC<RP> = ({s, th}) => {
  const tarot = s.style.includes('Tarot');
  return <AbsoluteFill style={{background: tarot ? `radial-gradient(60% 50% at 50% 45%, ${mix(th.main, '#000', 0.2)}, #08050F)` : `linear-gradient(135deg, ${th.main}, ${th.acc}, ${th.con})`}}>
    <div style={{position: 'absolute', left: 220, top: 110, width: 640, height: 1000, borderRadius: tarot ? 24 : 40, padding: 22, background: tarot ? '#E9D9A8' : 'linear-gradient(135deg,#fff,#dfe9ff,#ffe6f3,#e2fff4)', boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: tarot ? 14 : 28, border: tarot ? `3px solid ${th.main}` : '3px solid #fff', background: tarot ? '#140B26' : '#101828', position: 'relative', overflow: 'hidden'}}>
        <Txt f={tarot ? F.play : F.arch} w={900} size={34} c={tarot ? '#E9D9A8' : '#fff'} s={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', letterSpacing: tarot ? 6 : 1}}>{tarot ? 'XXI' : '★ ★ ★ ★ ★'}</Txt>
        <div style={{position: 'absolute', left: 120, top: 120, width: 360, height: 360, borderRadius: 180, background: tarot ? `radial-gradient(${th.acc}, transparent 70%)` : `conic-gradient(${th.main}, ${th.acc}, ${th.con}, ${th.main})`, opacity: 0.85}} />
        <div style={{position: 'absolute', left: 190, top: 190}}><FLogo size={220} /></div>
        <Txt f={tarot ? F.play : F.arch} w={900} size={tarot ? 54 : 58} c={tarot ? '#E9D9A8' : '#fff'} s={{position: 'absolute', left: 20, right: 20, top: 560, textAlign: 'center', lineHeight: 1.05}}>{lines(s.head).map((l, i) => <div key={i}>{l}</div>)}</Txt>
        <Txt f={tarot ? F.playI : F.inter} w={tarot ? 400 : 700} size={28} c={tarot ? '#CDB98A' : '#9FB4FF'} s={{position: 'absolute', left: 40, right: 40, top: tarot ? 700 : 720, textAlign: 'center'}}>{s.sub}</Txt>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center'}}><AppRow apps={s.apps} size={56} c={tarot ? '#CDB98A' : '#9FB4FF'} /></div>
      </div>
    </div>
    <Brand c="#fff" /><Grain o={0.12} blend="screen" />
  </AbsoluteFill>;
};

export const Glass: React.FC<RP> = ({s, th}) => {
  const fluted = s.style.includes('Fluted'); const ink = fluted ? '#2A1D18' : '#fff';
  return <AbsoluteFill style={{background: fluted ? `linear-gradient(160deg, ${mix(th.main, '#fff', 0.55)}, ${mix(th.acc, '#fff', 0.6)})` : '#05060C', overflow: 'hidden'}}>
    {!fluted && <><div style={{position: 'absolute', left: -200, top: -100, width: 900, height: 700, borderRadius: 450, background: th.main, filter: 'blur(140px)', opacity: 0.9}} /><div style={{position: 'absolute', right: -200, top: 500, width: 800, height: 700, borderRadius: 400, background: th.acc, filter: 'blur(150px)', opacity: 0.7}} /></>}
    <Hero3D hero={s.hero} size={560} x={680} y={560} rot={-8} shadow="rgba(0,0,0,0.3)" />
    <div style={{position: 'absolute', left: fluted ? 0 : 110, top: fluted ? 280 : 300, width: fluted ? 640 : 860, height: fluted ? 560 : 520, borderRadius: fluted ? 0 : 40, background: fluted ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 22px, rgba(255,255,255,0.08) 22px 44px)' : 'rgba(255,255,255,0.12)', backdropFilter: 'blur(28px)', border: fluted ? 'none' : '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.2)'}} />
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), 700, 150)} color={ink} acc={fluted ? th.con : mix(th.acc, '#fff', 0.4)} style={{position: 'absolute', left: fluted ? M : 160, top: fluted ? 380 : 380}} />
    {s.sub && <Txt size={30} c={ink} s={{position: 'absolute', left: M, top: 900, width: 700}}>{s.sub}</Txt>}
    <Prompt s={s} th={{...th, card: fluted ? '#FFFFFFdd' : '#FFFFFF22'}} size={21} style={{position: 'absolute', left: M, top: fluted ? 1030 : 980}} />
    <Brand c={ink} /><Grain o={0.08} blend={fluted ? 'multiply' : 'screen'} />
  </AbsoluteFill>;
};

export const Collage: React.FC<RP> = ({s, th}) => {
  const ransom = s.style.includes('Ransom');
  const letters = (w: string, i0: number) => w.split('').map((ch, i) => { const k = i0 + i; const bgs = ['#fff', '#111', th.main, '#F5E663', '#E6E1D3', th.acc]; const b = bgs[k % bgs.length]; const fams = [F.arch, F.play, F.bebas, F.dms, F.mono, F.unb]; return ch === ' ' ? <span key={i} style={{display: 'inline-block', width: 30}} /> : <span key={i} style={{display: 'inline-block', margin: '0 3px', padding: '2px 10px', background: b, color: onC(b), fontFamily: fams[k % fams.length], fontWeight: 900, fontSize: 74 + ((k * 13) % 26), transform: `rotate(${((k * 29) % 14) - 7}deg)`, boxShadow: '3px 4px 0 rgba(0,0,0,0.3)'}}>{ch.toUpperCase()}</span>; });
  return <AbsoluteFill style={{background: ransom ? '#E9E3D5' : mix(th.main, '#fff', 0.7)}}>
    {ransom ? <div style={{position: 'absolute', left: 60, right: 60, top: 120, textAlign: 'center', lineHeight: 1.6}}>{lines(s.head).map((l, i) => <div key={i}>{letters(l, i * 11)}</div>)}</div>
      : <><div style={{position: 'absolute', left: 90, top: 120, width: 520, height: 640, background: '#fff', padding: 18, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'rotate(-5deg)'}}><div style={{width: '100%', height: 520, background: `linear-gradient(135deg, ${th.main}, ${th.con})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Hero3D hero="3d:camera:clay" size={380} x={242} y={260} /></div><Txt f={F.cav} w={700} size={40} c="#333" s={{marginTop: 10, textAlign: 'center'}}>client gallery ✓</Txt></div>
        <div style={{position: 'absolute', left: 580, top: 200, width: 220, height: 50, background: '#F5E663AA', transform: 'rotate(20deg)'}} />
        <Rich s={s} text={s.head} size={fit(s, lines(s.head), 420, 110)} color="#1F1A14" acc={th.con} style={{position: 'absolute', left: 620, top: 300}} /></>}
    <Txt w={600} size={32} c="#1F1A14" s={{position: 'absolute', left: M, right: M, top: ransom ? 700 : 830, textAlign: ransom ? 'center' : 'left'}}>{s.sub}</Txt>
    {ransom && <div style={{position: 'absolute', left: 0, right: 0, top: 1040, display: 'flex', justifyContent: 'center'}}><AppRow apps={s.apps} size={80} c="#1F1A14" /></div>}
    <Prompt s={s} th={{...th, card: '#FFFFFF'}} size={21} style={{position: 'absolute', left: M, top: ransom ? 860 : 960}} />
    <Brand c="#1F1A14" /><Grain o={0.16} />
  </AbsoluteFill>;
};

export const Maya: React.FC<RP> = ({s, th}) => {
  const comic = s.style.includes('Comic');
  return <AbsoluteFill style={{background: comic ? '#FFF7E6' : `linear-gradient(170deg, ${mix(th.main, '#fff', 0.75)}, ${mix(th.acc, '#fff', 0.7)})`}}>
    {comic && <AbsoluteFill style={{backgroundImage: `radial-gradient(${th.main}55 3px, transparent 3px)`, backgroundSize: '22px 22px'}} />}
    <div style={{position: 'absolute', left: comic ? 60 : 420, top: comic ? 420 : 300, width: 600, height: 800, border: comic ? '8px solid #111' : 'none', background: comic ? '#fff' : 'transparent', overflow: 'hidden'}}><Img src={staticFile(comic ? 'maya/smileBig.svg' : 'maya/explaining.svg')} style={{width: 600, height: 800, objectFit: 'contain', objectPosition: 'bottom'}} /></div>
    <div style={{position: 'absolute', left: comic ? 440 : M, top: comic ? 90 : 110, width: comic ? 580 : 560, padding: comic ? 34 : 0, background: comic ? '#fff' : 'transparent', border: comic ? '6px solid #111' : 'none', borderRadius: comic ? 50 : 0}}>
      <Rich s={s} text={s.head} size={fit(s, lines(s.head), comic ? 500 : 560, comic ? 100 : 92)} color="#111" acc={th.main} />
    </div>
    <Txt w={600} size={30} c="#111" s={{position: 'absolute', left: comic ? 700 : M, top: comic ? 480 : 420, width: comic ? 320 : 380}}>{s.sub}</Txt>
    <Prompt s={s} th={{...th, card: '#FFFFFF'}} size={20} w={comic ? 360 : 400} style={{position: 'absolute', left: comic ? 680 : M, top: comic ? 700 : 620}} />
    <div style={{position: 'absolute', left: comic ? 690 : M, top: comic ? 1060 : 1050}}><AppRow apps={s.apps} size={54} c="#333" /></div>
    <Brand c="#111" /><Grain o={0.08} />
  </AbsoluteFill>;
};

export const Iso: React.FC<RP> = ({s, th}) => {
  const rooms = ['Sales', 'Support', 'Finance', 'HR']; const apps = ['HubSpot', 'Front', 'Xero', 'BambooHR'];
  return <AbsoluteFill style={{background: mix(th.neu, '#fff', 0.75)}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 96)} color="#141414" acc={th.main} style={{position: 'absolute', left: M, top: 70}} />
    <div style={{position: 'absolute', left: 540, top: 760, width: 0, height: 0, transform: 'scaleY(0.58) rotate(45deg)'}}>
      {rooms.map((r, i) => <div key={r} style={{position: 'absolute', left: (i % 2) * 300 - 290, top: Math.floor(i / 2) * 300 - 290, width: 280, height: 280, background: [th.main, th.acc, mix(th.main, '#fff', 0.4), mix(th.acc, '#fff', 0.4)][i], boxShadow: `14px 14px 0 ${mix(th.con, '#000', 0.2)}`, borderRadius: 16}} />)}
      <div style={{position: 'absolute', left: -60, top: -60, width: 120, height: 120, borderRadius: 60, background: '#fff', boxShadow: '0 0 0 10px #ffffff88'}} />
    </div>
    <div style={{position: 'absolute', left: 498, top: 718}}><FLogo size={84} /></div>
    {rooms.map((r, i) => <div key={r} style={{position: 'absolute', left: [M, 760, 120, 700][i], top: [480, 480, 1020, 1020][i], display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.12)'}}><Logo app={apps[i]} size={44} /><Txt w={700} size={24} c="#141414">{r}</Txt></div>)}
    <Txt size={26} c="#333" s={{position: 'absolute', left: M, top: 1140, width: W - 2 * M}}>{s.sub}</Txt>
    <Brand c="#141414" y={H - 84} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const CTA: React.FC<RP> = ({s, th}) => <AbsoluteFill style={{background: `radial-gradient(70% 55% at 50% 40%, ${mix(th.main, '#000', 0.35)}, #07070D 75%)`}}>
  <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}><div style={{boxShadow: `0 0 140px 40px ${th.main}66`, borderRadius: 60}}><FLogo size={200} /></div></div>
  <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 190)} color="#fff" acc={th.acc} align="center" style={{position: 'absolute', left: 0, right: 0, top: 380}} />
  <Txt size={34} c="#C9C7D8" s={{position: 'absolute', left: M, right: M, top: 800, textAlign: 'center'}}>{s.sub}</Txt>
  <div style={{position: 'absolute', left: 240, top: 930, width: 600, height: 120, borderRadius: 60, background: `linear-gradient(90deg, #6468D8, #E68C74)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.inter, fontWeight: 800, fontSize: 40, color: '#fff', boxShadow: '0 20px 60px #6468D877'}}>Join the waitlist →</div>
  <div style={{position: 'absolute', left: 700, top: 1010, fontSize: 70, transform: 'rotate(-20deg)'}}>👆</div>
  <Txt w={700} size={30} c="#fff" s={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', letterSpacing: 2}}>FANSACHAT.COM</Txt>
  <Grain o={0.08} blend="screen" />
</AbsoluteFill>;
