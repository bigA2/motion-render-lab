// Renderers part 2: mythfact, beforeafter, lockscreen, retroos, terminal, bento, flow, calendar, checklist, quote, bignum, faq.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Spec, Theme, W, H, M, F, PAIRS, Rich, Txt, Meta, Logo, FLogo, Brand, Grain, Prompt, AppRow, fit, lines, mix, onC, appName} from './kit';
type RP = {s: Spec; th: Theme};

export const MythFact: React.FC<RP> = ({s, th}) => {
  const [m1, m2] = lines(s.head); const top = s.dark ? '#111' : '#E9E6DF';
  return <AbsoluteFill style={{background: th.main}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: top}} />
    <Meta c={s.dark ? '#aaa' : '#555'} s={{left: M, top: 70}}>Myth</Meta><Meta c={onC(th.main)} s={{left: M, top: 610}}>Fact</Meta>
    <div style={{position: 'absolute', left: M, right: M, top: 130, fontFamily: PAIRS[s.font].d, fontWeight: 800, fontSize: fit(s, [m2], W - 2 * M, 96), lineHeight: 1.02, color: s.dark ? '#888' : '#777', textDecoration: `line-through 8px ${th.main}`}}>{m2}</div>
    <div style={{position: 'absolute', right: M, top: 380, fontFamily: F.anton, fontSize: 120, color: th.main, transform: 'rotate(-8deg)', border: `8px solid ${th.main}`, padding: '0 24px', borderRadius: 14}}>FALSE</div>
    <Rich s={s} text={s.sub.replace('Fact: ', '')} size={fit(s, [s.sub], (W - 2 * M) * 2, 84)} color={onC(th.main)} acc={th.acc} style={{position: 'absolute', left: M, right: M, top: 670, whiteSpace: 'normal'}} />
    <Prompt s={s} th={{...th, card: '#FFFFFF'}} size={22} style={{position: 'absolute', left: M, top: 960}} />
    <Brand c={onC(th.main)} /><Grain o={0.08} />
  </AbsoluteFill>;
};

export const BeforeAfter: React.FC<RP> = ({s, th}) => {
  const [hb, ha] = lines(s.head); const b = s.x.b as string[]; const a = s.x.a as string[];
  const col = (title: string, items: string[], good: boolean, x: number) => <div style={{position: 'absolute', left: x, top: 260, width: 440}}>
    <div style={{fontFamily: PAIRS[s.font].d, fontWeight: PAIRS[s.font].w, fontSize: 64, color: good ? th.main : (s.dark ? '#777' : '#888'), lineHeight: 1}}>{title}</div>
    {items.map((it, i) => <div key={i} style={{marginTop: 22, padding: '22px 22px', borderRadius: 20, background: good ? (s.dark ? mix(th.main, '#000', 0.6) : mix(th.main, '#fff', 0.85)) : (s.dark ? '#1A1A1F' : '#EDEBE6'), fontFamily: s.font === 'C' ? F.cav : F.inter, fontSize: s.font === 'C' ? 36 : 26, color: good ? th.ink : (s.dark ? '#999' : '#666'), textDecoration: !good && i === items.length - 1 ? 'line-through' : 'none', fontWeight: good && i === items.length - 1 ? 800 : 500}}>{good ? '✓ ' : '· '}{it}</div>)}
  </div>;
  return <AbsoluteFill style={{background: th.bg}}>
    <Txt w={800} size={30} c={th.soft} s={{position: 'absolute', left: M, top: 80, textTransform: 'uppercase', letterSpacing: 2}}>{s.aud}</Txt>
    <Txt f={F.serif} w={400} size={64} c={th.ink} s={{position: 'absolute', left: M, top: 130, fontStyle: 'italic'}}>{hb} {ha.startsWith('vs') ? ha : `→ ${ha}`}</Txt>
    {col('Before', b, false, M)}{col('After', a, true, W / 2 + 12)}
    <div style={{position: 'absolute', left: W / 2 - 2, top: 260, width: 4, height: 600, background: th.main}} />
    <div style={{position: 'absolute', left: W / 2 - 36, top: 520, width: 72, height: 72, borderRadius: 36, background: th.main, color: onC(th.main), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontFamily: F.inter}}>⇆</div>
    <Txt size={26} c={th.soft} s={{position: 'absolute', left: M, top: 960, width: W - 2 * M}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 1060}}><AppRow apps={s.apps} size={62} c={th.soft} /></div>
    <Brand c={th.ink} /><Grain o={0.07} />
  </AbsoluteFill>;
};

export const Lockscreen: React.FC<RP> = ({s, th}) => {
  const n = s.x.notifs as string[][]; const calm = n.length === 1;
  return <AbsoluteFill style={{background: calm ? `linear-gradient(180deg, ${mix(th.main, '#fff', 0.4)}, ${mix(th.acc, '#fff', 0.5)})` : `linear-gradient(180deg, #0B1020, ${mix(th.main, '#000', 0.3)})`}}>
    <div style={{position: 'absolute', left: 270, top: 70, width: 540, height: 1090, borderRadius: 70, background: '#000', padding: 14, boxShadow: '0 50px 100px rgba(0,0,0,0.45)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 58, overflow: 'hidden', background: calm ? `linear-gradient(180deg, ${th.main}, ${th.acc})` : 'linear-gradient(180deg, #3A2E6E, #121628)', position: 'relative'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', color: '#fff', fontFamily: F.inter, fontWeight: 600, fontSize: 120, letterSpacing: '-0.03em'}}>{s.x.time}</div>
        <div style={{position: 'absolute', left: 16, right: 16, top: calm ? 420 : 260}}>{n.map(([app, msg], i) => <div key={i} style={{display: 'flex', gap: 12, alignItems: 'center', padding: 14, marginBottom: 10, borderRadius: 22, background: 'rgba(255,255,255,0.82)', transform: calm ? 'scale(1.02)' : `translateX(${(i % 2) * 6}px)`}}>
          {app === 'FansaChat' ? <FLogo size={44} /> : <Logo app={app} size={44} radius={12} />}
          <div style={{flex: 1}}><Txt w={700} size={17} c="#111">{appName(app)}</Txt><Txt size={18} c="#222">{msg}</Txt></div><Txt size={14} c="#555">now</Txt></div>)}</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: M, right: M, top: 1180}}><Rich s={s} text={s.head.replace('|', ' ')} size={fit(s, [s.head.replace('|', ' ')], W - 2 * M, 54)} color={calm ? '#111' : '#fff'} acc={calm ? th.con : th.acc} /></div>
    <Brand c={calm ? '#111' : '#fff'} y={H - 80} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const RetroOS: React.FC<RP> = ({s, th}) => {
  const win = s.font === 'X'; const face = win ? '#C0C0C0' : '#EEEEEE';
  return <AbsoluteFill style={{background: win ? th.main : `repeating-linear-gradient(0deg, #B8B8B8 0 2px, #C8C8C8 2px 4px)`}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, win ? 44 : 84)} color={win ? '#fff' : '#111'} acc={win ? '#FFFF55' : th.main} style={{position: 'absolute', left: M, top: 90}} />
    <div style={{position: 'absolute', left: 90, top: 380, width: W - 180, background: face, border: '3px solid', borderColor: '#fff #404040 #404040 #fff', boxShadow: '12px 12px 0 rgba(0,0,0,0.35)'}}>
      <div style={{background: win ? 'linear-gradient(90deg,#000080,#1084D0)' : '#fff', borderBottom: win ? 'none' : '2px solid #000', color: win ? '#fff' : '#000', padding: '10px 14px', fontFamily: win ? F.pix : F.mono, fontSize: win ? 18 : 22, display: 'flex', justifyContent: 'space-between'}}><span>{s.x.title}</span><span>✕</span></div>
      <div style={{padding: 36, display: 'flex', gap: 28}}>
        <div style={{width: 90, height: 90, borderRadius: win ? 45 : 14, background: win ? '#FF0000' : th.main, color: '#fff', fontFamily: F.inter, fontWeight: 800, fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{win ? '✕' : '!'}</div>
        <Txt f={win ? F.pix : F.mono} w={400} size={win ? 20 : 26} c="#111" s={{lineHeight: win ? 1.7 : 1.4}}>{s.x.msg}</Txt>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 30, paddingBottom: 34}}>{(s.x.btns as string[]).map((b, i) => <div key={b} style={{padding: '14px 30px', background: face, border: '3px solid', borderColor: '#fff #404040 #404040 #fff', outline: i === 0 ? '2px dotted #000' : 'none', fontFamily: win ? F.pix : F.mono, fontSize: win ? 18 : 24, color: '#111'}}>{b}</div>)}</div>
    </div>
    <Txt f={win ? F.pix : F.mono} size={win ? 18 : 24} c={win ? '#fff' : '#111'} s={{position: 'absolute', left: M, top: 900, width: W - 2 * M, lineHeight: 1.6}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 1020}}><AppRow apps={s.apps} size={60} c={win ? '#fff' : '#111'} /></div>
    <Brand c={win ? '#fff' : '#111'} />
  </AbsoluteFill>;
};

export const Terminal: React.FC<RP> = ({s, th}) => {
  const ls = s.x.lines as string[]; const c = th.main;
  return <AbsoluteFill style={{background: '#07090B'}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 80)} color={c} acc={'#fff'} style={{position: 'absolute', left: M, top: 90, textShadow: `0 0 24px ${c}88`}} />
    <Txt f={F.mono} size={28} c="#9AA4AE" s={{position: 'absolute', left: M, top: 210}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, right: M, top: 320, height: 720, borderRadius: 20, background: '#0F1316', border: `1px solid ${c}55`, boxShadow: `0 0 80px ${c}22`, overflow: 'hidden'}}>
      <div style={{height: 50, background: '#161B1F', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((x) => <div key={x} style={{width: 16, height: 16, borderRadius: 8, background: x}} />)}<Txt f={F.mono} size={18} c="#6B7680" s={{marginLeft: 20}}>fansachat — plain-english</Txt></div>
      <div style={{padding: 34}}>{ls.map((l, i) => <div key={i} style={{fontFamily: F.mono, fontSize: 27, color: l.startsWith('✓') ? c : l.startsWith('$') ? '#fff' : '#B9C3CC', margin: '18px 0', textShadow: l.startsWith('✓') ? `0 0 14px ${c}` : 'none', whiteSpace: 'pre-wrap'}}>{l}</div>)}<span style={{display: 'inline-block', width: 16, height: 32, background: c}} /></div>
    </div>
    <div style={{position: 'absolute', left: M, top: 1080}}><AppRow apps={s.apps} size={60} c="#6B7680" /></div>
    <Brand c="#DDE3E8" /><Grain o={0.08} blend="screen" />
  </AbsoluteFill>;
};

export const Bento: React.FC<RP> = ({s, th}) => {
  const t = s.x.tiles as string[]; const ink = th.ink; const card = s.dark ? '#16171D' : '#FFFFFF';
  const g = [[0, 0, 2, 1], [2, 0, 1, 2], [0, 1, 1, 1], [1, 1, 1, 1], [0, 2, 1, 1], [1, 2, 2, 1]];
  const cw = (W - 2 * M - 2 * 18) / 3, ch = 210;
  return <AbsoluteFill style={{background: th.bg}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 120)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 70}} />
    {t.map((x, i) => { const [c, r, w, h] = g[i]; const hero = i === 1; return <div key={i} style={{position: 'absolute', left: M + c * (cw + 18), top: 470 + r * (ch + 18), width: w * cw + (w - 1) * 18, height: h * ch + (h - 1) * 18, borderRadius: 30, background: hero ? th.main : card, boxShadow: '0 12px 30px rgba(0,0,0,0.1)', padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <Txt w={800} size={hero ? 40 : 30} c={hero ? onC(th.main) : ink} s={{lineHeight: 1.1}}>{x}</Txt>
      {i === 0 && <AppRow apps={s.apps} size={52} c={th.soft} />}
      {i === 1 && <FLogo size={110} />}
      {i === 5 && <Txt size={22} c={th.soft}>“{s.t.slice(0, 64)}…”</Txt>}
    </div>; })}
    <Brand c={ink} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const Flow: React.FC<RP> = ({s, th}) => {
  const steps = [...new Set(s.apps)]; const dk = s.dark; const blue = s.style.includes('Blueprint');
  const bg = blue ? '#0B2A6F' : th.bg; const ink = dk || blue ? '#F2F4FA' : '#16161B'; const card = blue ? '#0F3A93' : dk ? '#171922' : '#FFFFFF';
  const nx = 600, y0 = 300, gap = 230;
  return <AbsoluteFill style={{background: bg, backgroundImage: `radial-gradient(${blue ? '#ffffff30' : dk ? '#ffffff14' : '#00000014'} 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px'}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), 470, 96)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 80}} />
    <div style={{position: 'absolute', left: M, top: 400, width: 440, padding: 26, borderRadius: 24, background: card, boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}>
      <div style={{display: 'flex', gap: 12, alignItems: 'center'}}><FLogo size={44} /><Txt w={700} size={22} c={ink}>You typed</Txt></div>
      <Txt size={26} c={ink} s={{marginTop: 16, lineHeight: 1.4}}>“{s.t[0].toUpperCase() + s.t.slice(1)}.”</Txt>
    </div>
    <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={H}>{steps.slice(1).map((_, i) => <path key={i} d={`M ${nx + 180} ${y0 + i * gap + 120} C ${nx + 180} ${y0 + i * gap + 170}, ${nx + 180} ${y0 + (i + 1) * gap + 30}, ${nx + 180} ${y0 + (i + 1) * gap}`} stroke={th.main} strokeWidth="4" fill="none" strokeDasharray="10 8" />)}
      <path d={`M ${M + 440} 560 C 560 560, 560 ${y0 + 60}, ${nx} ${y0 + 60}`} stroke={th.acc} strokeWidth="4" fill="none" /></svg>
    {steps.map((a, i) => <div key={a} style={{position: 'absolute', left: nx, top: y0 + i * gap, width: 360, height: 120, borderRadius: 22, background: card, border: `2px solid ${i === 0 ? th.acc : th.main}`, boxShadow: '0 16px 40px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px'}}>
      <Logo app={a} size={66} /><div><Txt w={700} size={16} c={i === 0 ? th.acc : th.main} s={{letterSpacing: 1.5}}>{i === 0 ? 'TRIGGER' : `STEP ${i}`}</Txt><Txt w={700} size={26} c={ink}>{appName(a)}</Txt></div>
      <div style={{marginLeft: 'auto', width: 30, height: 30, borderRadius: 15, background: '#22C55E', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div></div>)}
    {s.sub && <Txt size={26} c={ink} s={{position: 'absolute', left: M, top: 760, width: 440, opacity: 0.75}}>{s.sub}</Txt>}
    <Meta c={th.main} s={{left: M, top: 1150}}>● Live · built from one sentence</Meta>
    <Brand c={ink} />
  </AbsoluteFill>;
};

export const Calendar: React.FC<RP> = ({s, th}) => <AbsoluteFill style={{background: `linear-gradient(170deg, ${mix(th.neu, '#fff', 0.6)}, ${mix(th.main, '#fff', 0.6)})`}}>
  <div style={{position: 'absolute', left: 200, top: 120, width: 680, height: 780, borderRadius: 40, background: '#fff', boxShadow: '0 50px 100px rgba(0,0,0,0.25)', overflow: 'hidden', transform: 'rotate(-4deg)'}}>
    <div style={{height: 210, background: th.main, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.bebas, fontSize: 170, color: onC(th.main), letterSpacing: 6}}>{s.x.day}</div>
    <div style={{position: 'absolute', top: 175, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>{[0, 1, 2, 3].map((i) => <div key={i} style={{width: 30, height: 70, borderRadius: 15, background: '#333'}} />)}</div>
    <div style={{textAlign: 'center', fontFamily: F.bebas, fontSize: 300, color: '#111', lineHeight: 1.1, marginTop: 40}}>{s.x.num}</div>
    <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}><div style={{padding: '14px 26px', borderRadius: 999, background: mix(th.main, '#fff', 0.85), display: 'flex', alignItems: 'center', gap: 12}}><FLogo size={40} /><Txt w={700} size={24} c="#111">Already done ✓</Txt></div></div>
  </div>
  <Rich s={s} text={s.head.replace('|', ' ')} size={fit(s, [s.head.replace('|', ' ')], W - 2 * M, 96)} color="#111" acc={th.main} style={{position: 'absolute', left: M, top: 950}} />
  <Txt size={26} c="#222" s={{position: 'absolute', left: M, top: 1060, width: W - 2 * M}}>{s.sub}</Txt>
  <div style={{position: 'absolute', right: M, top: 70}}><AppRow apps={s.apps} size={54} c="#333" /></div>
  <Brand c="#111" /><Grain o={0.08} />
</AbsoluteFill>;

export const Checklist: React.FC<RP> = ({s, th}) => {
  const it = s.x.items as string[]; const dk = s.dark;
  return <AbsoluteFill style={{background: dk ? th.bg : mix(th.main, '#fff', 0.82)}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 92)} color={th.ink} acc={th.main} style={{position: 'absolute', left: M, top: 80}} />
    <div style={{position: 'absolute', left: 140, top: 330, width: W - 280, height: 860, borderRadius: 30, background: dk ? '#1A1B22' : '#fff', boxShadow: '0 40px 90px rgba(0,0,0,0.25)', padding: '90px 50px 40px'}}>
      <div style={{position: 'absolute', left: '50%', top: -36, transform: 'translateX(-50%)', width: 220, height: 74, borderRadius: 16, background: '#8A8F98', boxShadow: 'inset 0 -6px 0 #666'}} />
      {it.map((x, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 0', borderBottom: `2px solid ${dk ? '#2A2C36' : '#F0EEE8'}`}}>
        <div style={{width: 52, height: 52, borderRadius: 14, background: th.main, color: onC(th.main), fontSize: 34, fontFamily: F.inter, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
        <Txt w={600} size={34} c={th.ink}>{x}</Txt><Txt size={20} c={th.soft} s={{marginLeft: 'auto'}}>auto</Txt></div>)}
      <div style={{position: 'absolute', left: 50, bottom: 40}}><AppRow apps={s.apps} size={54} c={th.soft} /></div>
    </div>
    <Brand c={th.ink} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const Quote: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const ink = dk ? '#F4EFE6' : mix(th.main, '#000', 0.3);
  return <AbsoluteFill style={{background: dk ? `radial-gradient(70% 60% at 30% 30%, ${mix(th.acc, '#000', 0.7)}, #0A0B10)` : '#F5EFE4'}}>
    <div style={{position: 'absolute', left: M - 10, top: 40, fontFamily: F.serif, fontSize: 420, lineHeight: 1, color: th.acc, opacity: 0.35}}>“</div>
    <Rich s={s} text={s.head.replace(/[“”]/g, '')} size={fit(s, lines(s.head), W - 2 * M, 104)} color={ink} acc={th.acc} style={{position: 'absolute', left: M, top: 340}} />
    <Txt f={F.inter} w={600} size={26} c={dk ? '#B9B3A8' : '#6B5B4B'} s={{position: 'absolute', left: M, top: 780, letterSpacing: 1}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 860, width: 140, height: 4, background: th.acc}} />
    <Prompt s={s} th={th} size={21} style={{position: 'absolute', left: M, top: 960}} />
    <Brand c={dk ? '#F4EFE6' : '#2B2118'} /><Grain o={0.12} />
  </AbsoluteFill>;
};

export const BigNum: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const ink = th.ink;
  return <AbsoluteFill style={{background: dk ? th.bg : mix(th.main, '#fff', 0.88), overflow: 'hidden'}}>
    <Meta c={th.soft} s={{left: M, top: 70}}>{s.x.label}</Meta><Meta c={th.soft} s={{right: M, top: 70}}>FansaChat · 2026</Meta>
    <div style={{position: 'absolute', left: -20, right: -20, top: 170, textAlign: 'center', fontFamily: F.unb, fontWeight: 800, fontSize: s.x.n.length > 3 ? 360 : 440, letterSpacing: '-0.07em', lineHeight: 1, color: th.main, textShadow: dk ? `0 0 80px ${th.main}66` : 'none'}}>{s.x.n}</div>
    <Txt f={F.serif} w={400} size={64} c={ink} s={{position: 'absolute', left: M, right: M, top: 690, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.1}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}><AppRow apps={s.apps} size={70} c={th.soft} arrow="+" /></div>
    <Prompt s={s} th={th} size={20} style={{position: 'absolute', left: M, top: 1030}} />
    <Brand c={ink} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const FAQ: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const acc = s.style.includes('Accordion');
  return <AbsoluteFill style={{background: th.bg}}>
    <Meta c={th.main} s={{left: M, top: 70}}>FAQ · plain-English automation</Meta>
    <div style={{position: 'absolute', left: M, top: 130, width: 120, height: 120, borderRadius: 30, background: th.main, color: onC(th.main), fontFamily: F.serif, fontStyle: 'italic', fontSize: 110, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Q</div>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 96)} color={th.ink} acc={th.main} style={{position: 'absolute', left: M, top: 290}} />
    <div style={{position: 'absolute', left: M, right: M, top: 560, padding: 40, borderRadius: 30, background: dk ? '#16171D' : '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', borderLeft: `10px solid ${th.main}`}}>
      <Txt w={800} size={24} c={th.main} s={{letterSpacing: 2}}>ANSWER</Txt>
      <Txt size={38} c={th.ink} s={{marginTop: 14, lineHeight: 1.3}}>{s.sub}</Txt>
      <Txt size={24} c={th.soft} s={{marginTop: 24}}>Example: “{s.t}”</Txt>
    </div>
    {acc && ['How much does it cost? — from $15/mo', 'Which apps work with it? — 700+'].map((q, i) => <div key={q} style={{position: 'absolute', left: M, right: M, top: 1000 + i * 82, padding: '20px 30px', borderRadius: 18, background: dk ? '#16171D' : '#fff', display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontWeight: 600, fontSize: 26, color: th.ink}}><span>{q}</span><span style={{color: th.main}}>+</span></div>)}
    {!acc && <div style={{position: 'absolute', left: M, top: 1000}}><AppRow apps={s.apps} size={64} c={th.soft} /></div>}
    <Brand c={th.ink} /><Grain o={0.05} />
  </AbsoluteFill>;
};
