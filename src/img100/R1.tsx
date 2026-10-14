// Renderers part 1: intro, hero3d (5 treatments), receipt, notes, chat, tweet, search, ticket, magazine, newspaper, swiss, bauhaus, neobrutal.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Spec, Theme, theme, W, H, M, F, PAIRS, Rich, Txt, Meta, Logo, Chip, Hero3D, FLogo, Brand, Grain, Ring, Prompt, AppRow, fit, lines, ts, mix, onC, appName} from './kit';

type RP = {s: Spec; th: Theme};
const vol = (s: Spec) => `No. ${s.id.slice(4)}`;

export const Intro: React.FC<RP> = ({s, th}) => {
  const [l1, l2, l3] = lines(s.head);
  return <AbsoluteFill style={{background: `radial-gradient(60% 45% at 50% 32%, ${mix(th.main, th.bg, 0.25)}, ${th.bg} 70%)`}}>
    <Meta c={th.soft} s={{left: M, top: 64}}>Introducing</Meta><Meta c={th.soft} s={{right: M, top: 64}}>2026 · Launching November</Meta>
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}><div style={{boxShadow: `0 0 120px 30px ${th.main}66`, borderRadius: 90}}><FLogo size={300} /></div></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center'}}>
      <Txt f={F.inter} w={600} size={ts(s, 3)} c={th.ink}>{l1}</Txt>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 168, lineHeight: 1.0, color: th.acc, marginTop: 6}}>{l2.replace(/\*/g, '')}</div>
      <div style={{fontFamily: F.unb, fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em', color: th.ink, marginTop: 4}}>{l3}</div>
      <Txt size={34} c={th.soft} s={{marginTop: 26, marginLeft: 120, marginRight: 120}}>{s.sub}</Txt>
    </div>
    <Prompt s={s} th={th} style={{position: 'absolute', left: M, top: 1060}} size={23} />
    <Brand c={th.ink} />
    <Grain o={0.08} blend="screen" />
  </AbsoluteFill>;
};

export const Hero3d: React.FC<RP> = ({s, th}) => {
  const t = s.x.treat as string; const ls = lines(s.head); const p = PAIRS[s.font];
  if (t === 'bold') {
    const sz = fit(s, ls, W - 2 * M, 190);
    return <AbsoluteFill style={{background: th.main, overflow: 'hidden'}}>
      {s.x.big && <div style={{position: 'absolute', left: -20, right: -20, bottom: 150, fontFamily: F.inter, fontWeight: 800, fontSize: 300, lineHeight: 0.8, color: mix(th.main, '#000', 0.6), letterSpacing: '-0.07em', textAlign: 'center', whiteSpace: 'nowrap'}}>{s.x.big}</div>}
      <Hero3D hero={s.hero} size={620} x={650} y={760} rot={-8} shadow={mix(th.main, '#000000', 0.6) + 'aa'} />
      <Rich s={s} text={s.head} size={sz} color={onC(th.main)} acc={th.con} style={{position: 'absolute', left: M, top: 70}} />
      <Txt size={26} c={onC(th.main)} s={{position: 'absolute', left: M, top: 90 + sz * ls.length * p.lh, maxWidth: 330}}>{s.sub}</Txt>
      <Meta c={onC(th.main)} s={{right: M, top: 80, textAlign: 'right'}}>{vol(s)}<br />for {s.aud}</Meta>
      <Ring x={W - M - 44} y={560} c={onC(th.main)} /><Brand c={onC(th.main)} /><Grain o={0.18} />
    </AbsoluteFill>;
  }
  if (t === 'minimal') {
    const words = ls.map((l) => l.replace(/\*/g, ''));
    return <AbsoluteFill style={{background: mix(th.neu, '#FFFFFF', 0.85)}}>
      <Meta c="#111" s={{left: M, top: 64}}>{vol(s)} — {s.aud}</Meta><Meta c="#111" s={{right: M, top: 64}}>2026</Meta>
      <Hero3D hero={s.hero} size={560} x={540} y={620} shadow={th.main + '55'} />
      <div style={{position: 'absolute', left: M, top: 380, fontFamily: p.d, fontWeight: p.w, fontSize: 64, color: '#111', letterSpacing: '-0.02em'}}>{words[0]}</div>
      <div style={{position: 'absolute', right: M, top: 720, fontFamily: p.a, fontStyle: 'italic', fontSize: 72, color: th.main}}>{words[1]}</div>
      <Txt f={F.serif} w={400} size={46} c="#111" s={{position: 'absolute', left: 120, right: 120, top: 980, textAlign: 'center', fontStyle: 'italic', lineHeight: 1.15}}>{s.sub}</Txt>
      <Ring x={518} y={1150} c="#111" /><Brand c="#111" /><Grain o={0.07} />
    </AbsoluteFill>;
  }
  if (t === 'brutal') {
    const sz = fit(s, ls, W - 2 * M, 230, PAIRS.A);
    return <AbsoluteFill style={{background: '#E9E9E6', overflow: 'hidden'}}>
      {ls.map((l, i) => <div key={i} style={{position: 'absolute', left: M - 10, top: 60 + i * sz * 0.98, fontFamily: F.anton, fontSize: sz, lineHeight: 1, color: th.main, textTransform: 'uppercase'}}>{l.replace(/\*/g, '')}</div>)}
      <svg style={{position: 'absolute', left: 0, bottom: 0}} width={W} height="440"><polygon points="0,440 0,140 120,210 210,90 330,230 470,150 560,260 700,120 820,230 960,100 1080,200 1080,440" fill="#0E0E0E" /></svg>
      <Hero3D hero={s.hero} size={600} x={690} y={680} filter="grayscale(1) contrast(1.25)" />
      <Meta c="#0E0E0E" s={{right: M, top: 64, textAlign: 'right'}}>{s.aud}<br />{vol(s)}</Meta>
      <Txt size={26} c="#fff" s={{position: 'absolute', left: M, top: 1150, maxWidth: 760}}>{s.sub}</Txt>
      <Ring x={W - M - 44} y={1150} c="#fff" /><Brand c="#fff" /><Grain o={0.15} />
    </AbsoluteFill>;
  }
  if (t === 'cinema') {
    const w = ls.map((l) => l.replace(/\*/g, ''));
    return <AbsoluteFill style={{background: `radial-gradient(70% 55% at 50% 45%, ${mix(th.main, '#000', 0.6)}, #07070A 75%)`}}>
      <Meta c={mix(th.main, '#fff', 0.45)} s={{left: 0, right: 0, top: 60, textAlign: 'center'}}>A FansaChat original · {s.aud}</Meta>
      <Hero3D hero={s.hero} size={660} x={540} y={680} rot={14} filter="saturate(1.2)" shadow={th.main + '66'} />
      <div style={{position: 'absolute', left: M, top: 140, fontFamily: p.d, fontWeight: p.w, fontSize: fit(s, [w[0]], W - 2 * M, 240), lineHeight: 1, color: th.main, textTransform: 'uppercase'}}>{w[0]}</div>
      <div style={{position: 'absolute', right: M, top: 760, fontFamily: p.d, fontWeight: p.w, fontSize: fit(s, [w[1]], W - 2 * M, 240), lineHeight: 1, color: th.main, textTransform: 'uppercase'}}>{w[1]}</div>
      <div style={{position: 'absolute', left: M, top: 1040, fontFamily: F.serif, fontStyle: 'italic', fontSize: 60, color: '#F3E6D8'}}>{s.x.small}</div>
      <Txt size={24} c={mix(th.main, '#fff', 0.55)} s={{position: 'absolute', left: M, top: 1125, maxWidth: 640}}>{s.sub}</Txt>
      <Meta c={mix(th.main, '#fff', 0.45)} s={{right: M, top: 1060, textAlign: 'right'}}>2026<br />Now on the waitlist</Meta>
      <Ring x={90} y={64} c={mix(th.main, '#fff', 0.45)} /><Brand c="#F3E6D8" /><Grain o={0.22} blend="screen" />
    </AbsoluteFill>;
  }
  // editorial
  const [a, b] = ls;
  return <AbsoluteFill style={{background: '#F4ECDD'}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 380, background: `linear-gradient(180deg, ${th.acc}, ${th.con})`}} />
    <Meta c={th.con} s={{left: M, top: 60}}>Issue {s.id.slice(4)}</Meta><Meta c={th.con} s={{right: M, top: 60}}>The {s.aud} edition</Meta>
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: p.a, fontStyle: 'italic', fontSize: 104, color: th.main}}>{a.replace(/\*/g, '')}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', fontFamily: F.anton, fontSize: fit(s, [b], W - 120, 260, PAIRS.A), lineHeight: 1, color: th.main, textTransform: 'uppercase'}}>{b.replace(/\*/g, '')}</div>
    <Hero3D hero={s.hero} size={640} x={540} y={770} rot={-8} shadow="rgba(60,30,10,0.4)" />
    <Txt size={26} c="#fff" s={{position: 'absolute', left: M, top: 1090, maxWidth: 580}}>{s.sub}</Txt>
    <Ring x={W - M - 60} y={1100} c="#fff" /><Brand c="#fff" /><Grain o={0.12} />
  </AbsoluteFill>;
};

export const Receipt: React.FC<RP> = ({s, th}) => {
  const it = s.x.items as string[][];
  return <AbsoluteFill style={{background: `linear-gradient(160deg, ${th.main}, ${mix(th.main, '#000000', 0.45)})`}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), 470, 92)} color={onC(th.main)} acc={onC(th.main)} style={{position: 'absolute', left: M, top: 90}} />
    <Txt size={24} c={onC(th.main)} s={{position: 'absolute', left: M, top: 470, width: 400, opacity: 0.85}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: 560, top: 70, width: 440, padding: '44px 36px 60px', background: '#FAF8F2', transform: 'rotate(4deg)', boxShadow: '0 40px 80px rgba(0,0,0,0.35)', fontFamily: F.mono, color: '#1B1B1B', clipPath: 'polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)'}}>
      <div style={{textAlign: 'center', fontWeight: 700, fontSize: 30, letterSpacing: 2}}>FANSACHAT</div>
      <div style={{textAlign: 'center', fontSize: 17, marginTop: 6, opacity: 0.7}}>{s.aud.toUpperCase()} · {s.id}</div>
      <div style={{borderTop: '2px dashed #333', margin: '22px 0'}} />
      {it.map(([a, b], i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, margin: '14px 0'}}><span style={{maxWidth: 250}}>{a}</span><span>{b}</span></div>)}
      <div style={{borderTop: '2px dashed #333', margin: '22px 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 24}}><span>{s.x.total[0]}</span><span>{s.x.total[1]}</span></div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 24, marginTop: 12, color: mix(th.main, '#000000', 0.2)}}><span>{s.x.after[0]}</span><span>{s.x.after[1]}</span></div>
      <div style={{marginTop: 30, height: 60, background: 'repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 6px,#111 6px 7px,transparent 7px 11px)'}} />
      <div style={{textAlign: 'center', fontSize: 16, marginTop: 10}}>THANK YOU · NO CODE REQUIRED</div>
    </div>
    <Prompt s={s} th={{...th, card: '#FFFFFF'}} size={22} style={{position: 'absolute', left: M, top: 1000}} />
    <Brand c={onC(th.main)} /><Grain o={0.14} />
  </AbsoluteFill>;
};

export const Notes: React.FC<RP> = ({s, th}) => {
  const it = s.x.items as string[]; const dk = s.dark; const paper = dk ? '#1C1C1E' : '#FFFDF5'; const ink = dk ? '#F2F2F7' : '#1C1C1E';
  return <AbsoluteFill style={{background: dk ? '#000' : mix(th.main, '#FFFFFF', 0.25)}}>
    <div style={{position: 'absolute', left: 70, top: 90, width: W - 140, height: 1000, borderRadius: 48, background: paper, boxShadow: '0 40px 90px rgba(0,0,0,0.3)', padding: '40px 54px', transform: 'rotate(-2deg)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontSize: 30, color: th.main === '#FFD60A' ? '#D4A600' : th.main}}><span>‹ Notes</span><span>⋯</span></div>
      <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 260, 70)} color={ink} acc={th.main} style={{marginTop: 30}} />
      <div style={{marginTop: 34}}>{it.map((x, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.inter, fontSize: 32, color: ink, margin: '22px 0', opacity: s.x.strike && i === it.length - 1 ? 1 : 0.92}}>
        {s.x.check ? <div style={{width: 34, height: 34, borderRadius: 17, border: `3px solid ${th.main}`, background: th.main, color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div> : <span style={{color: th.main}}>•</span>}
        <span style={{textDecoration: s.x.strike && i < it.length - 1 ? `line-through 3px ${th.acc}` : 'none', fontWeight: s.x.strike && i === it.length - 1 ? 700 : 400}}>{x}</span></div>)}</div>
    </div>
    <div style={{position: 'absolute', left: M, top: 1110, display: 'flex', alignItems: 'center', gap: 18}}><AppRow apps={s.apps} size={58} c={dk ? '#fff' : '#111'} /></div>
    <Txt size={24} c={dk ? '#ddd' : '#111'} s={{position: 'absolute', left: M, top: 1190, width: W - 2 * M}}>{s.sub}</Txt>
    <Brand c={dk ? '#fff' : '#111'} y={H - 90} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const Chat: React.FC<RP> = ({s, th}) => {
  const steps = [...new Set(s.apps)];
  const ink = s.dark ? '#F5F3EE' : '#151515'; const panel = s.dark ? '#14151C' : '#FFFFFF';
  const bg = s.style.includes('Mesh') ? `radial-gradient(50% 40% at 20% 20%, ${th.acc}88, transparent), radial-gradient(50% 50% at 85% 70%, ${th.main}aa, transparent), ${th.bg}` : th.bg;
  return <AbsoluteFill style={{background: bg}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 104)} color={th.ink} acc={th.main} style={{position: 'absolute', left: M, top: 76}} />
    <div style={{position: 'absolute', left: M, top: 430, width: W - 2 * M, height: 730, borderRadius: 34, background: panel, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', overflow: 'hidden'}}>
      <div style={{height: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', borderBottom: `1px solid ${s.dark ? '#262838' : '#EEE'}`}}><FLogo size={40} /><Txt w={700} size={24} c={ink}>FansaChat</Txt><Txt size={18} c={th.main} s={{marginLeft: 'auto'}}>● building</Txt></div>
      <div style={{padding: 30}}>
        <div style={{marginLeft: 'auto', maxWidth: 700, padding: '20px 24px', borderRadius: '24px 24px 6px 24px', background: th.main, color: onC(th.main), fontFamily: F.inter, fontSize: 25, lineHeight: 1.38}}>{s.t[0].toUpperCase() + s.t.slice(1)}.</div>
        <div style={{marginTop: 26, maxWidth: 760, padding: '20px 24px', borderRadius: '24px 24px 24px 6px', background: s.dark ? '#1E2030' : '#F3F2F8', color: ink, fontFamily: F.inter, fontSize: 23}}>
          Done — here’s your workflow:
          <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12}}>{steps.map((a, i) => <div key={a} style={{display: 'flex', alignItems: 'center', gap: 14}}><Txt w={700} size={18} c={th.main} s={{width: 64}}>{i === 0 ? 'WHEN' : 'THEN'}</Txt><Logo app={a} size={42} /><Txt w={600} size={22} c={ink}>{appName(a)}</Txt><Txt size={18} c={th.main} s={{marginLeft: 'auto'}}>✓</Txt></div>)}</div>
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 26, padding: '16px 22px', borderRadius: 18, border: `1px solid ${s.dark ? '#2A2C3C' : '#E6E6EE'}`, color: s.dark ? '#777' : '#999', fontFamily: F.inter, fontSize: 22}}>Describe another workflow…</div>
      </div>
    </div>
    <Txt size={24} c={th.soft} s={{position: 'absolute', left: M, top: 1185}}>{s.sub}</Txt>
    <Brand c={th.ink} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const Tweet: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const card = dk ? '#15202B' : '#FFFFFF'; const ink = dk ? '#F7F9F9' : '#0F1419'; const g = dk ? '#8B98A5' : '#536471';
  return <AbsoluteFill style={{background: `linear-gradient(140deg, ${th.main}, ${th.con})`}}>
    <div style={{position: 'absolute', left: 70, top: 150, width: W - 140, borderRadius: 36, background: card, padding: 46, boxShadow: '0 40px 100px rgba(0,0,0,0.35)', transform: 'rotate(-1.5deg)'}}>
      <div style={{display: 'flex', gap: 18, alignItems: 'center'}}><div style={{width: 76, height: 76, borderRadius: 38, background: `linear-gradient(135deg, ${th.acc}, ${th.main})`}} /><div><Txt w={800} size={28} c={ink}>{s.x.name}</Txt><Txt size={24} c={g}>{s.x.handle}</Txt></div></div>
      <Txt size={40} c={ink} s={{marginTop: 30, whiteSpace: 'pre-line', lineHeight: 1.3, fontWeight: 500}}>{s.x.text}</Txt>
      <Txt size={22} c={g} s={{marginTop: 26}}>11:04 PM · 2026</Txt>
      <div style={{borderTop: `1px solid ${dk ? '#38444D' : '#EFF3F4'}`, marginTop: 26, paddingTop: 26, display: 'flex', gap: 18}}>
        <FLogo size={64} /><div style={{flex: 1}}><Txt w={800} size={26} c={ink}>FansaChat <span style={{color: g, fontWeight: 400}}>@fansachat · replying</span></Txt><Txt size={30} c={ink} s={{marginTop: 8}}>{s.x.reply}</Txt>
          <div style={{marginTop: 18}}><AppRow apps={s.apps} size={50} c={g} /></div></div>
      </div>
    </div>
    <Brand c={onC(th.con)} /><Grain o={0.08} />
  </AbsoluteFill>;
};

export const Search: React.FC<RP> = ({s, th}) => {
  const dk = s.dark; const ink = th.ink;
  return <AbsoluteFill style={{background: dk ? `radial-gradient(60% 40% at 50% 40%, ${th.main}33, ${th.bg})` : th.bg}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 96)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 110}} />
    <div style={{position: 'absolute', left: M, top: 420, width: W - 2 * M, borderRadius: 34, background: dk ? '#1A1C24' : '#FFFFFF', boxShadow: dk ? `0 0 0 2px ${th.main}, 0 0 60px ${th.main}55` : '0 18px 50px rgba(0,0,0,0.14)', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '28px 30px', fontFamily: F.inter, fontSize: 36, color: ink}}><span style={{fontSize: 34, opacity: 0.6}}>⌕</span>{s.x.q}<span style={{width: 3, height: 40, background: th.main}} /></div>
      {(s.x.sugg as string[]).map((q, i, a) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 30px', borderTop: `1px solid ${dk ? '#262833' : '#F0F0F0'}`, fontFamily: F.inter, fontSize: 30, color: i === a.length - 1 ? th.main : ink, fontWeight: i === a.length - 1 ? 700 : 400, background: i === a.length - 1 ? (dk ? '#22253A' : mix(th.main, '#fff', 0.9)) : 'transparent'}}><span style={{opacity: 0.5}}>⌕</span>{q}</div>)}
    </div>
    <Txt size={28} c={th.soft} s={{position: 'absolute', left: M, top: 920, width: W - 2 * M}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 1030}}><AppRow apps={s.apps} size={64} c={th.soft} /></div>
    <Brand c={ink} /><Grain o={0.07} />
  </AbsoluteFill>;
};

export const Ticket: React.FC<RP> = ({s, th}) => {
  const x = s.x; const dk = s.dark;
  return <AbsoluteFill style={{background: dk ? `linear-gradient(180deg, ${th.bg}, ${mix(th.main, '#000', 0.6)})` : `linear-gradient(180deg, ${mix(th.main, '#fff', 0.75)}, ${mix(th.main, '#fff', 0.45)})`}}>
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 130)} color={th.ink} acc={th.acc} style={{position: 'absolute', left: M, top: 90}} />
    <div style={{position: 'absolute', left: 60, top: 460, width: W - 120, height: 470, borderRadius: 30, background: '#FFFFFF', boxShadow: '0 40px 90px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden', transform: 'rotate(-3deg)'}}>
      <div style={{flex: 1, padding: 40, position: 'relative'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{display: 'flex', gap: 12, alignItems: 'center'}}><FLogo size={46} /><Txt w={800} size={24} c="#111">FANSACHAT AIR</Txt></div><Txt w={700} size={22} c={th.main}>{x.flight}</Txt></div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40}}>
          <div><Txt size={18} c="#888">FROM</Txt><div style={{fontFamily: F.bebas, fontSize: 110, color: '#111', lineHeight: 1}}>{x.from}</div></div>
          <div style={{fontSize: 50, color: th.main}}>✈</div>
          <div style={{textAlign: 'right'}}><Txt size={18} c="#888">TO</Txt><div style={{fontFamily: F.bebas, fontSize: 110, color: '#111', lineHeight: 1}}>{x.to}</div></div>
        </div>
        <div style={{display: 'flex', gap: 50, marginTop: 30}}>{[['GATE', x.gate], ['SEAT', x.seat], ['CLASS', 'PLAIN ENGLISH']].map(([k, v]) => <div key={k}><Txt size={16} c="#888">{k}</Txt><Txt w={800} size={24} c="#111">{v}</Txt></div>)}</div>
        <div style={{position: 'absolute', left: 40, bottom: 34}}><AppRow apps={s.apps} size={46} c="#999" /></div>
      </div>
      <div style={{width: 190, borderLeft: '4px dashed #DDD', background: th.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{transform: 'rotate(90deg)', fontFamily: F.bebas, fontSize: 64, color: onC(th.main), whiteSpace: 'nowrap'}}>BOARDING · {s.id.slice(4)}</div></div>
    </div>
    <Txt size={28} c={th.ink} s={{position: 'absolute', left: M, top: 1030, width: W - 2 * M, opacity: 0.85}}>{s.sub}</Txt>
    <Brand c={th.ink} /><Grain o={0.1} />
  </AbsoluteFill>;
};

export const Magazine: React.FC<RP> = ({s, th}) => {
  const p = PAIRS[s.font];
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${mix(th.main, '#fff', 0.15)}, ${th.main})`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: p.d, fontWeight: p.w, fontSize: Math.floor(fit(s, [s.x.mast], W - 80, 230) * 0.8), letterSpacing: '-0.04em', color: '#FFFFFF', lineHeight: 1}}>{s.x.mast}</div>
    <Meta c="#fff" s={{left: M, top: 280}}>{s.aud} special</Meta><Meta c="#fff" s={{right: M, top: 280}}>{vol(s)} · 2026</Meta>
    <Hero3D hero={s.hero} size={700} x={600} y={760} rot={-10} shadow="rgba(0,0,0,0.45)" />
    <div style={{position: 'absolute', left: M, top: 360, width: 360}}>{(s.x.lines as string[]).map((l, i) => <div key={i} style={{marginBottom: 26}}><div style={{width: 40, height: 4, background: '#fff', marginBottom: 10}} /><Txt w={700} size={30} c="#fff" s={{lineHeight: 1.15}}>{l}</Txt></div>)}</div>
    <Rich s={s} text={s.head} size={180} color="#fff" acc={th.acc} pair={p} style={{position: 'absolute', left: M, top: 960}} />
    <Txt size={24} c="#fff" s={{position: 'absolute', right: M, top: 1150, width: 420, textAlign: 'right'}}>{s.sub}</Txt>
    <div style={{position: 'absolute', right: M, top: 1040, width: 140, height: 70, background: 'repeating-linear-gradient(90deg,#fff 0 3px,transparent 3px 6px,#fff 6px 7px,transparent 7px 11px)'}} />
    <Brand c="#fff" /><Grain o={0.14} />
  </AbsoluteFill>;
};

export const Newspaper: React.FC<RP> = ({s, th}) => {
  const tab = s.style.includes('Tabloid');
  return <AbsoluteFill style={{background: '#EFEAE0'}}>
    <div style={{position: 'absolute', left: M, right: M, top: 50, textAlign: 'center', fontFamily: tab ? F.arch : F.play, fontWeight: 900, fontSize: tab ? 80 : 84, whiteSpace: 'nowrap', color: tab ? th.main : '#111', letterSpacing: tab ? '-0.02em' : '0.01em', borderBottom: '6px double #111', paddingBottom: 12}}>{s.x.paper}</div>
    <div style={{position: 'absolute', left: M, right: M, top: 190, display: 'flex', justifyContent: 'space-between', fontFamily: F.inter, fontSize: 18, color: '#333', borderBottom: '2px solid #111', paddingBottom: 8}}><span>VOL. {s.id.slice(4)}</span><span>EXTRA EDITION · 2026</span><span>FANSACHAT PRESS</span></div>
    <Rich s={s} text={s.head} size={Math.floor(fit(s, lines(s.head), W - 2 * M, 150, tab ? PAIRS.AB : PAIRS.P) * 0.82)} color="#111" acc={th.main} pair={tab ? PAIRS.AB : PAIRS.P} align="center" upper style={{position: 'absolute', left: M, right: M, top: 240}} />
    <Txt f={F.serif} w={400} size={36} c="#222" s={{position: 'absolute', left: M + 40, right: M + 40, top: 560, textAlign: 'center', fontStyle: 'italic'}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, top: 690, width: 470, height: 470, background: '#E2DCCF', filter: 'grayscale(1) contrast(1.1)', overflow: 'hidden'}}><Hero3D hero={s.hero} size={420} x={235} y={235} shadow="rgba(0,0,0,0.3)" /></div>
    <div style={{position: 'absolute', left: 580, right: M, top: 690, columnCount: 1}}>{(s.x.cols as string[]).map((c, i) => <Txt key={i} f={F.play} w={700} size={26} c="#111" s={{marginBottom: 22, lineHeight: 1.3, borderBottom: '1px solid #999', paddingBottom: 16}}>{c}</Txt>)}<Txt size={18} c="#333">Continued on fansachat.com →</Txt></div>
    <Brand c="#111" /><Grain o={0.16} />
  </AbsoluteFill>;
};

export const Swiss: React.FC<RP> = ({s, th}) => {
  const bg = s.dark ? th.con : '#F3F1EC'; const ink = s.dark ? '#fff' : '#111';
  const nums = s.x.nums as string[]; const labels = s.x.labels as string[];
  return <AbsoluteFill style={{background: bg}}>
    {[1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: (W / 4) * i, top: 0, bottom: 0, width: 1, background: s.dark ? '#ffffff22' : '#00000018'}} />)}
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W * 0.75 - 2 * M, 210)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 70}} />
    <div style={{position: 'absolute', right: 0, top: 0, width: W / 4, height: H * 0.55, background: th.main}} />
    <div style={{position: 'absolute', left: M, top: 830, right: M, display: 'grid', gridTemplateColumns: `repeat(${nums.length}, 1fr)`, gap: 0}}>
      {nums.map((n, i) => <div key={i} style={{borderTop: `6px solid ${i === 0 ? th.main : ink}`, paddingTop: 16, paddingRight: 16}}><Txt f={F.space} w={700} size={56} c={i === 0 ? th.main : ink}>{n}</Txt><Txt size={22} c={ink} s={{marginTop: 6}}>{labels[i]}</Txt><div style={{marginTop: 18}}>{s.apps[i] && <Logo app={[...new Set(s.apps)][Math.min(i, new Set(s.apps).size - 1)]} size={58} />}</div></div>)}
    </div>
    <Txt size={24} c={ink} s={{position: 'absolute', left: M, top: 1130, width: 600, opacity: 0.8}}>{s.sub}</Txt>
    <Meta c={ink} s={{right: M, top: 760}}>Fig. {s.id.slice(4)}</Meta>
    <Brand c={ink} /><Grain o={0.06} />
  </AbsoluteFill>;
};

export const Bauhaus: React.FC<RP> = ({s, th}) => {
  const bg = s.dark ? '#151515' : '#F1E9D8'; const ink = s.dark ? '#F1E9D8' : '#151515';
  return <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -120, top: 420, width: 640, height: 640, borderRadius: 320, background: th.main}} />
    <div style={{position: 'absolute', right: 80, top: 360, width: 360, height: 360, background: th.acc}} />
    <div style={{position: 'absolute', right: 140, top: 760, width: 0, height: 0, borderLeft: '200px solid transparent', borderRight: '200px solid transparent', borderBottom: `340px solid ${s.dark ? '#F1E9D8' : '#1D3FBB'}`}} />
    <div style={{position: 'absolute', left: 300, top: 640, width: 420, height: 22, background: ink, transform: 'rotate(-28deg)'}} />
    <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M, 120)} color={ink} acc={th.main} style={{position: 'absolute', left: M, top: 80}} />
    <Txt size={30} c={ink} s={{position: 'absolute', left: M, top: 330, width: 560}}>{s.sub}</Txt>
    <div style={{position: 'absolute', left: M, bottom: 140}}><AppRow apps={s.apps} size={66} c={ink} /></div>
    <Brand c={ink} /><Grain o={0.12} />
  </AbsoluteFill>;
};

export const NeoBrutal: React.FC<RP> = ({s, th}) => {
  const b = '4px solid #111'; const sh = '10px 10px 0 #111';
  return <AbsoluteFill style={{background: th.main}}>
    <div style={{position: 'absolute', left: M, top: 90, right: M, padding: '34px 36px', background: '#FFFFFF', border: b, boxShadow: sh, borderRadius: 20}}>
      <Rich s={s} text={s.head} size={fit(s, lines(s.head), W - 2 * M - 80, 108)} color="#111" acc={th.con} upper={false} style={{textTransform: 'lowercase'}} />
    </div>
    <div style={{position: 'absolute', left: M, top: 470, width: 520, padding: '24px 28px', background: th.acc, border: b, boxShadow: sh, borderRadius: 20, transform: 'rotate(-2deg)'}}><Txt w={700} size={30} c={onC(th.acc)}>{s.sub}</Txt></div>
    <div style={{position: 'absolute', right: M, top: 450, width: 300, height: 300, borderRadius: 150, background: '#FFE74C', border: b, boxShadow: sh, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(10deg)'}}><Txt f={F.arch} w={400} size={44} c="#111" s={{textAlign: 'center', lineHeight: 1.05}}>no code.<br />no stress.</Txt></div>
    <div style={{position: 'absolute', left: M, right: M, top: 820, padding: 26, background: '#FFFFFF', border: b, boxShadow: sh, borderRadius: 20}}>
      <Txt w={700} size={20} c="#111" s={{textTransform: 'uppercase', letterSpacing: 1.5}}>you type:</Txt>
      <Txt size={27} c="#111" s={{marginTop: 8}}>“{s.t}”</Txt>
      <div style={{marginTop: 16}}><AppRow apps={s.apps} size={56} c="#111" /></div>
    </div>
    <Brand c="#111" /><Grain o={0.05} />
  </AbsoluteFill>;
};
