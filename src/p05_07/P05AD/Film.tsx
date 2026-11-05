// P05 PRODUCTION AD (no voice, music-led). Timing = plan.ts (shared with the sound). Hook line with one boxed word →
// hard cut to a problem orbit on our rings → hard cut to bright: our REAL interface footage on three fanned 3D
// glass screens (camera tracks across them) → a glowing ring becomes the prompt bar → logo over a glowing horizon.
// Every piece of our own type is a <G> checked by the TextGuard + layout guard. No third-party logos. MIT.
import React, {useMemo} from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {At, CameraRig, Depth, hitShake} from '../kit/CameraRig';
import {clamp, lerp, noise1, prog} from '../kit/curves';
import {F} from '../kit/fonts';
import {Corners, LiveBorder, LivingBg, Pal, a} from '../kit/Living';
import {G, TextGuard} from '../kit/TextGuard';
import {TrackIn} from '../kit/type';
import * as P from './plan';

const {T, SCR} = P;
const DARK: Pal = {bg: '#07090D', bg2: '#0E1522', glow: '#7FA6CC', glow2: '#6A4CFF', line: '#253044', ink: '#EAF1F8', muted: '#9AA8BA', accent: '#7B5CFF', hot: '#FF5A36', panel: '#121824', panelLine: '#263042', dark: true};
const LIGHT: Pal = {bg: '#F6F8FB', bg2: '#DCE4EE', glow: '#FFFFFF', glow2: '#CBBFFF', line: '#C9D3DF', ink: '#0B1520', muted: '#3A475A', accent: '#6A4CFF', hot: '#E2491A', panel: '#FFFFFF', panelLine: '#D3DCE6', dark: false};
const ICE = '#BFD9F2', VIO = '#7B5CFF', INK = '#0B1520', SUB = '#3A475A';

// ---------------- 1. hook ----------------
const Word: React.FC<{id: string; t: string; f0: number; f: number; box?: number}> = ({id, t, f0, f, box}) => {
  const p = prog(f, f0, 16, 'snapOut'); const bp = box !== undefined ? prog(f, box, 12, 'snapOut') : 0;
  return <span style={{position: 'relative', display: 'inline-block', zIndex: 0, margin: '0 0.16em', opacity: clamp(p * 2.5), transform: `translateY(${(1 - p) * 34}px) scale(${lerp(1.08, 1, p)})`}}>
    {box !== undefined && f >= box && <span style={{position: 'absolute', left: '-0.1em', right: '-0.1em', top: '0.04em', bottom: '-0.02em', zIndex: -1, borderRadius: 18, background: VIO, boxShadow: `0 0 50px ${a(VIO, 0.6)}`, transformOrigin: '0% 50%', transform: `scaleX(${bp}) rotate(${lerp(-5, -2, bp)}deg) scale(${1 + (1 - bp) * 0.15})`}} />}
    <G id={id} size={116} color="#FFFFFF" font={F.display} weight={800} style={{lineHeight: 1.12, letterSpacing: '-0.03em'}}>{t}</G>
  </span>;
};
const Hook: React.FC<{f: number; h: number}> = ({f, h}) => {
  const push = lerp(1, 1.06, prog(f, 0, T.cut1, 'softOut')); const hs = hitShake(f, T.box, 0.1);
  return <div style={{position: 'absolute', left: 0, width: 1080, top: h / 2 - 150, textAlign: 'center', transform: `translate(${hs.x}px, ${hs.y}px) scale(${push * hs.s})`}}>
    <div><Word id="h-sales" t="Sales" f0={T.w1} f={f} /><Word id="h-calls" t="calls" f0={T.w2} f={f} /></div>
    <div style={{marginTop: 34}}><Word id="h-slip" t="slip" f0={T.w3} f={f} box={T.box} /><Word id="h-through" t="through." f0={T.w4} f={f} /></div>
  </div>;
};

// ---------------- 2. problem: bookings, notes and unread pings orbit a calendar ----------------
const Calendar: React.FC<{f: number}> = ({f}) => {
  const wob = noise1(f / 40, 2) * 2;
  return <div style={{position: 'absolute', left: -170, top: -170, width: 340, height: 340, borderRadius: 40, background: '#121A28', border: `2px solid ${a(ICE, 0.35)}`, boxShadow: `0 0 80px ${a(VIO, 0.35)}, 0 30px 60px rgba(0,0,0,.5)`, transform: `rotate(${wob}deg)`, overflow: 'hidden'}}>
    <div style={{height: 70, background: `linear-gradient(90deg, ${VIO}, #4E7BD9)`}} />
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: 22}}>
      {Array.from({length: 15}, (_, i) => { const busy = [1, 3, 4, 6, 8, 9, 11, 13].includes(i); const pulse = busy ? 0.6 + 0.4 * Math.sin(f / 6 + i) : 0;
        return <div key={i} style={{height: 56, borderRadius: 12, background: busy ? a('#FF5A36', 0.25 + pulse * 0.4) : a(ICE, 0.1), border: `1.5px solid ${a(busy ? '#FF5A36' : ICE, 0.4)}`}} />; })}
    </div>
  </div>;
};
type Item = {id: string; kind: 'note' | 'ping' | 'book'; t: string; c?: string};
const ITEMS: Item[] = [
  {id: 'o-note1', kind: 'note', t: 'prep call?', c: '#FFE066'},
  {id: 'o-ping1', kind: 'ping', t: '12'},
  {id: 'o-book1', kind: 'book', t: 'New booking'},
  {id: 'o-note2', kind: 'note', t: 'follow up', c: '#FF9EBB'},
  {id: 'o-ping2', kind: 'ping', t: '3'},
  {id: 'o-book2', kind: 'book', t: 'Call at 3:00'},
];
const OrbitItem: React.FC<{it: Item; i: number; f: number}> = ({it, i, f}) => {
  const r = noise1(f / 50, i + 4) * 5;
  if (it.kind === 'note') return <div style={{width: 200, height: 140, marginLeft: -100, marginTop: -70, background: it.c, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${r + (i % 2 ? 4 : -4)}deg)`, boxShadow: '0 18px 36px rgba(0,0,0,.45)'}}>
    <G id={it.id} size={32} color="#2A2418" font={F.sans} weight={700}>{it.t}</G></div>;
  if (it.kind === 'ping') return <div style={{width: 108, height: 108, marginLeft: -54, marginTop: -54, borderRadius: 54, background: '#FF5A36', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${a('#FF5A36', 0.6)}`, transform: `scale(${1 + 0.06 * Math.sin(f / 5 + i)})`}}>
    <G id={it.id} size={46} color="#FFFFFF" font={F.display} weight={800}>{it.t}</G></div>;
  return <div style={{width: 250, height: 92, marginLeft: -125, marginTop: -46, borderRadius: 22, background: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', boxShadow: '0 18px 36px rgba(0,0,0,.45)', transform: `rotate(${r * 0.5}deg)`}}>
    <div style={{width: 18, height: 18, borderRadius: 9, background: VIO, flexShrink: 0}} />
    <G id={it.id} size={30} color={INK} font={F.sans} weight={700}>{it.t}</G></div>;
};
const Problem: React.FC<{f: number; h: number}> = ({f, h}) => {
  const o = P.ORBIT(f, h);
  return <>
    {[1, 1.28].map((k, j) => <div key={j} style={{position: 'absolute', left: -o.rx * k, top: -o.ry * k, width: o.rx * 2 * k, height: o.ry * 2 * k, borderRadius: '50%', border: `${j ? 1.5 : 2.5}px solid ${a(ICE, j ? 0.18 : 0.42)}`, boxShadow: `0 0 30px ${a(VIO, j ? 0.12 : 0.3)}, inset 0 0 30px ${a(VIO, j ? 0.08 : 0.2)}`}} />)}
    <Calendar f={f} />
    {ITEMS.map((it, i) => { const th = o.ang + (i * Math.PI * 2) / ITEMS.length;
      return <div key={it.id} style={{position: 'absolute', left: Math.cos(th) * o.rx, top: Math.sin(th) * o.ry}}><OrbitItem it={it} i={i} f={f} /></div>; })}
  </>;
};

// ---------------- 3. product: real footage on three fanned glass screens ----------------
const Glass: React.FC<{s: {x: number; y: number; w: number; h: number; ry: number; z: number}; children: React.ReactNode; light?: number}> = ({s, children, light = 0}) => (
  <Depth x={s.x - s.w / 2 - 14} y={s.y - s.h / 2 - 14} z={s.z} ry={s.ry} style={{transformOrigin: `${s.w / 2 + 14}px ${s.h / 2 + 14}px`}}>
    <div style={{position: 'relative', width: s.w + 28, height: s.h + 28, padding: 14, borderRadius: 40, background: 'linear-gradient(145deg, rgba(255,255,255,.85), rgba(225,232,244,.6))', border: '1.5px solid rgba(255,255,255,.95)', boxShadow: `0 60px 120px rgba(20,30,70,.28), 0 12px 30px rgba(20,30,70,.16), 0 0 ${60 * light}px ${a(VIO, 0.5 * light)}`}}>
      <div style={{position: 'relative', width: s.w, height: s.h, borderRadius: 28, overflow: 'hidden', background: '#F6F6F8'}}>{children}</div>
      <LiveBorder color={a(VIO, 0.7)} r={40} width={3} speed={45} phase={s.x} />
    </div>
  </Depth>
);
const Footage: React.FC<{t: number; crop: {x: number; y: number; s: number}}> = ({t, crop}) => (
  <Freeze frame={0}><OffthreadVideo src={staticFile('real/P05_ui.webm')} trimBefore={Math.round(t * 60)} muted style={{position: 'absolute', left: -crop.x * crop.s, top: -crop.y * crop.s, width: 1920 * crop.s, height: 1080 * crop.s}} /></Freeze>
);
const Bar: React.FC<{w: number; o?: number}> = ({w, o = 1}) => <div style={{width: w, height: 20, borderRadius: 10, background: '#E7EBF1', opacity: o}} />;
const Results: React.FC<{f: number}> = ({f}) => {
  const pp = prog(f, T.page, 26, 'spring'), cp = prog(f, T.chat, 26, 'spring');
  const card: React.CSSProperties = {position: 'relative', borderRadius: 28, background: '#FFFFFF', boxShadow: '0 24px 50px rgba(20,25,60,.14)', border: '1.5px solid #E3E8EF', overflow: 'hidden'};
  return <div style={{position: 'absolute', inset: 0, padding: 34, display: 'flex', flexDirection: 'column', gap: 26, background: 'linear-gradient(180deg, #F3F5FA, #E9EDF5)'}}>
    <div style={{...card, height: 470, opacity: clamp(pp * 2), transform: `translateY(${(1 - pp) * 60}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '24px 34px', borderBottom: '2px solid #EEF1F5'}}>
        <div style={{width: 44, height: 52, borderRadius: 8, background: '#EEF0F6', border: '2px solid #C9D0DC'}} />
        <G id="c-page" size={34} color={SUB} font={F.sans} weight={600}>Deal page</G>
      </div>
      <div style={{padding: '30px 44px 0'}}>
        <G id="c-title" size={64} color={INK} font={F.display} weight={800} style={{letterSpacing: '-0.02em'}}>{P.PERSON}</G>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 30}}>
          {[0, 1, 2].map((i) => { const tk = prog(f, T.page + 22 + i * 7, 12, 'spring');
            return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{width: 36, height: 36, borderRadius: 9, border: `3px solid ${tk > 0 ? '#0E7A50' : '#C9D0DC'}`, background: tk > 0 ? '#0E7A50' : 'transparent', transform: `scale(${tk > 0 ? lerp(0.6, 1, tk) : 1})`}} />
              <Bar w={[460, 380, 520][i]} /></div>; })}
        </div>
      </div>
    </div>
    <div style={{...card, flex: 1, opacity: clamp(cp * 2), transform: `translateY(${(1 - cp) * 60}px)`, display: 'flex', gap: 22, padding: '30px 34px'}}>
      <div style={{width: 76, height: 76, borderRadius: 18, background: '#F1EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Img src={staticFile('logo-fansa.png')} style={{width: 64, height: 64}} /></div>
      <div style={{flex: 1}}>
        <G id="c-who" size={34} color={INK} font={F.sans} weight={800}>FansaChat</G>
        <div style={{marginTop: 10}}><G id="c-msg" size={38} color="#1D1C1D" font={F.sans} weight={500} style={{lineHeight: 1.28}}>{P.CHAT}</G></div>
      </div>
    </div>
  </div>;
};
const Product: React.FC<{f: number}> = ({f}) => {
  const tA = P.srcT(P.CLIP.A, f), tB = P.srcT(P.CLIP.B, f);
  const lit = (a0: number, a1: number) => clamp((f - a0) / 12) * (1 - clamp((f - a1) / 12));
  return <>
    <Glass s={SCR.A} light={lit(T.cut2, T.toB - 6)}><Footage t={tA} crop={SCR.A.crop} /></Glass>
    <Glass s={SCR.C} light={lit(T.toC - 6, T.cut3)}>{f >= T.page ? <Results f={f} /> : <div style={{position: 'absolute', inset: 0, padding: 40, display: 'flex', flexDirection: 'column', gap: 22, background: 'linear-gradient(180deg, #F3F5FA, #E9EDF5)'}}><Bar w={420} /><Bar w={600} o={0.7} /><Bar w={520} o={0.5} /></div>}</Glass>
    <Glass s={SCR.B} light={lit(T.toB - 6, T.toC - 6)}><Footage t={tB} crop={SCR.B.crop} /></Glass>
  </>;
};
const CAPS: [string, string, number, number][] = [['cap1', 'Say it once.', T.cut2 + 6, T.toB], ['cap2', 'It builds the flow.', T.toB, T.toC], ['cap3', 'Ready before the call.', T.toC, T.cut3]];
const Caption: React.FC<{f: number; h: number}> = ({f, h}) => {
  const c = CAPS.find(([, , a0, a1]) => f >= a0 && f < a1); if (!c) return null;
  const p = prog(f, c[2], 14, 'snapOut'); const out = c[3] === T.cut3 ? 1 : 1 - clamp((f - (c[3] - 6)) / 6);
  return <div style={{position: 'absolute', left: 0, width: 1080, top: h * 0.06 + 40, textAlign: 'center', opacity: clamp(p * 2) * out, transform: `translateY(${(1 - p) * 26}px) scale(${lerp(1.08, 1, p)})`}}>
    <G id={c[0]} size={76} color={INK} font={F.display} weight={800} style={{letterSpacing: '-0.025em', lineHeight: 1.12}}>{c[1]}</G></div>;
};

// ---------------- 4. prompt beat: a glowing ring becomes the prompt bar ----------------
const Prompt: React.FC<{f: number; h: number}> = ({f, h}) => {
  const ring = prog(f, T.cut3, 16, 'snapOut'), morph = prog(f, T.bar, 18, 'snapOut');
  const charge = prog(f, T.rise0, T.logo - T.rise0, 'linear'), push = lerp(1, 1.08, prog(f, T.rise0, T.out - T.rise0, 'softOut'));
  const out = prog(f, T.out, T.logo - T.out, 'inHard');
  const W = lerp(150, 940, morph), H = lerp(150, 230, morph);
  const words = P.PROMPT.split(' '); const wf = (i: number) => T.words + i * 4;
  const g0 = clamp((f - wf(0)) / 6) * (1 - clamp(out / 0.04)); // text leaves before the bar launches (safe area)
  return <div style={{position: 'absolute', left: 540 - W / 2, top: h / 2 - H / 2, width: W, height: H, transform: `scale(${lerp(0.2, 1, ring) * push * lerp(1, 2.6, out)})`, opacity: 1 - clamp((out - 0.6) / 0.4), filter: out > 0.02 ? `blur(${out * 24}px)` : undefined}}>
    <div style={{position: 'absolute', inset: -40, borderRadius: 200, background: `conic-gradient(from ${f * 3}deg, ${a(VIO, 0)}, ${a(VIO, 0.75)}, ${a(ICE, 0.6)}, ${a(VIO, 0)} 60%)`, filter: 'blur(28px)', opacity: 0.55 + charge * 0.45}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 120, background: '#111827', border: `4px solid ${a(ICE, 0.75 + charge * 0.25)}`, boxShadow: `0 0 ${40 + charge * 90}px ${a(VIO, 0.55 + charge * 0.4)}, inset 0 0 40px ${a(VIO, 0.25)}`}} />
    {morph > 0.6 && <div style={{position: 'absolute', left: 60, right: 170, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: g0}}>
      <G id="prompt" size={46} color="#F3F6FA" font={F.sans} weight={600} style={{lineHeight: 1.25}}>
        {words.map((w, i) => { const p = prog(f, wf(i), 10, 'snapOut'); return <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>{w}</span>; })}
      </G></div>}
    {morph > 0.6 && <div style={{position: 'absolute', right: 40, top: H / 2 - 50, width: 100, height: 100, borderRadius: 50, background: VIO, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${20 + charge * 40}px ${VIO}`, transform: `scale(${prog(f, T.bar + 8, 16, 'spring')})`}}>
      <svg width="46" height="46" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
  </div>;
};

// ---------------- 5. logo over a glowing horizon ----------------
const Logo: React.FC<{f: number; h: number}> = ({f, h}) => {
  const tall = h > 1500; const hz = prog(f, T.logo, 50, 'snapOut'); const hs = hitShake(f, T.logo, 0.14);
  const top = tall ? h * 0.42 - 300 : h * 0.44 - 250, hy = tall ? h * 0.7 : h * 0.73;
  const sweep = ((f - T.pill - 30) % 120) / 36;
  return <>
    <div style={{position: 'absolute', left: -540, width: 2160, top: hy + (1 - hz) * 260, height: 2160, borderRadius: '50%', background: `radial-gradient(ellipse 50% 22% at 50% 0%, ${a(VIO, 0.75)} 0%, ${a('#3E2E9E', 0.45)} 35%, ${a('#07090D', 0)} 70%)`, opacity: hz}} />
    <div style={{position: 'absolute', left: -540, width: 2160, top: hy + (1 - hz) * 260, height: 2160, borderRadius: '50%', borderTop: `3px solid ${a('#E4ECFF', 0.9)}`, boxShadow: `0 -10px 60px ${a(VIO, 0.8)}, 0 -2px 18px ${a(ICE, 0.9)}`, opacity: hz}} />
    <div style={{position: 'absolute', left: 0, width: 1080, top, textAlign: 'center', transform: `translate(${hs.x}px, ${hs.y}px) scale(${hs.s * lerp(1, 1.04, prog(f, T.logo, 180, 'softOut'))})`}}>
      <div style={{display: 'inline-flex', width: tall ? 200 : 160, height: tall ? 200 : 160, borderRadius: tall ? 52 : 42, background: '#FFFFFF', alignItems: 'center', justifyContent: 'center', transform: `scale(${prog(f, T.logo, 30, 'spring')})`, boxShadow: `0 0 80px ${a(VIO, 0.6)}`}}>
        <Img src={staticFile('logo-fansa.png')} style={{width: '82%', height: '82%'}} /></div>
      <TrackIn f0={T.word} dur={60} from={0.15} s0={0.85} s1={1} style={{marginTop: 28}}><G id="e-word" size={tall ? 124 : 108} color="#FFFFFF" font={F.display} weight={800} style={{lineHeight: 1.1}}>FansaChat</G></TrackIn>
      <div style={{marginTop: 14, opacity: clamp((f - T.tag) / 10), transform: `translateY(${(1 - prog(f, T.tag, 16, 'snapOut')) * 20}px)`}}><G id="e-tag" size={tall ? 46 : 40} color="#C9D5E3" font={F.sans} weight={500}>Make your work life hassle-free.</G></div>
      <div style={{marginTop: tall ? 52 : 34, display: 'inline-block', position: 'relative', overflow: 'hidden', borderRadius: 999, transform: `scale(${prog(f, T.pill, 20, 'spring')})`, boxShadow: `0 0 50px ${a(VIO, 0.55)}`}}>
        <div style={{padding: '22px 52px', background: '#6A4CFF'}}><G id="e-pill" size={tall ? 48 : 44} color="#FFFFFF" font={F.sans} weight={700}>Join the waitlist</G></div>
        {sweep >= 0 && sweep <= 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 140 - 30}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)', transform: 'skewX(-20deg)'}} />}
      </div>
    </div>
    <AbsoluteFill style={{background: '#FFFFFF', opacity: 0.55 * (1 - clamp((f - T.logo) / 8)), pointerEvents: 'none'}} />
  </>;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {height: h} = useVideoConfig();
  const {prod, prob} = useMemo(() => P.cams(h), [h]);
  const sec = f < T.cut1 ? 'hook' : f < T.cut2 ? 'problem' : f < T.cut3 ? 'product' : f < T.logo ? 'prompt' : 'logo';
  const pal = sec === 'product' ? LIGHT : DARK;
  return <AbsoluteFill style={{background: pal.bg}}>
    <LivingBg p={pal} cam={sec === 'product' ? prod : sec === 'problem' ? prob : undefined} rings={sec === 'problem' || sec === 'prompt'} grid={sec !== 'logo'} particles={sec === 'product' ? 24 : 40} />
    {sec === 'hook' && <Hook f={f} h={h} />}
    {sec === 'problem' && <CameraRig cam={prob} id="pr" blur={0.12}><Problem f={f} h={h} /></CameraRig>}
    {sec === 'product' && <CameraRig cam={prod} id="pd" blur={0.15} perspective={2200}><Product f={f} /></CameraRig>}
    {sec === 'product' && <Caption f={f} h={h} />}
    {sec === 'prompt' && <Prompt f={f} h={h} />}
    {sec === 'logo' && <Logo f={f} h={h} />}
    <Corners p={pal} />
    <TextGuard every={4} label="P05AD" />
  </AbsoluteFill>;
};
