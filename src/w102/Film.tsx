// W1-02 "Ghosted invoice" — freelancers. Colour structure B2 BRIGHT ORANGE. Motion graphics + the FansaChat orb.
// Story told in DAYS (counter = tension). Tools shown: Stripe, WhatsApp, Notion, Telegram, QuickBooks (+ orbit of freelancer stack).
// Components (MOTION_COMPONENT_LIBRARY.md): TX1 TX3 TX6 TX7 TX13 TX14 UI1 UI2 UI3 UI4 UI5 CAM2 CAM5 CAM7 CAM9 DG1 CH6.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import vo from '../../public/w102/vo.json';
import {Pip, Studio} from '../v3/kit3d';
import {BlurWords, Caret, clamp, ease, Flip3D, sp, typed} from '../v5/fx';
import {AppTile, F, Logo} from '../v5/ui';

type Line = {file: string; dur: number; text: string; words: {w: string; s: number; e: number}[]};
const V = vo as unknown as Line[]; // 12 spoken lines (typing beat inserted after line 7)
const GAP = 6, LEAD = 10, TYPE_BEAT = 120, BUILD_BEAT = 80;
export const AT: number[] = [];
{ let t = LEAD; V.forEach((l, i) => { AT.push(t); t += Math.round(l.dur * 30) + GAP + (i === 6 ? TYPE_BEAT : 0) + (i === 7 ? BUILD_BEAT : 0); }); }
export const TOTAL = AT[11] + Math.round(V[11].dur * 30) + 75;
const wd = (i: number, k: number) => AT[i] + Math.round((V[i]?.words[k]?.s ?? 0) * 30);
// frame of the first word in line i starting with `p` (robust to Whisper tokenisation)
const wf = (i: number, p: string) => { const w = V[i]?.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(p)); return AT[i] + Math.round((w?.s ?? 0) * 30); };
const C = {o1: '#FF6A13', o2: '#FF9A3D', o3: '#FFC77A', ink: '#1A1206', cream: '#FFF6EC', red: '#E8362B', green: '#19A55A', white: '#FFFFFF'};
const between = (f: number, a: number, b: number) => f >= a && f < b;

// ---------------- background: bright orange mesh + confetti shards + dust ----------------
const Bg: React.FC<{calm?: number}> = ({calm = 0}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: `radial-gradient(70% 60% at ${40 + Math.sin(f / 70) * 12}% ${35 + Math.cos(f / 80) * 10}%, ${C.o3}, transparent 70%), radial-gradient(60% 60% at ${75 + Math.cos(f / 60) * 10}% 80%, #FF4D2E, transparent 70%), linear-gradient(160deg, ${C.o2}, ${C.o1})`, filter: calm ? `saturate(${1 - calm * 0.35})` : undefined}}>
    {Array.from({length: 26}).map((_, i) => {
      const r = (k: string) => random(`sh${i}${k}`);
      const x = r('x') * 110 - 5, y = ((r('y') * 120 + f * (0.04 + r('v') * 0.08)) % 120) - 10;
      return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: 14 + r('w') * 26, height: 6 + r('h') * 10, borderRadius: 3, background: ['#FFFFFF', '#FFE2B8', '#FF3D6E', '#1A1206'][Math.floor(r('c') * 4)], opacity: 0.18 + r('o') * 0.35, transform: `rotate(${r('a') * 360 + f * (r('s') - 0.5) * 2}deg) skewX(-18deg)`}} />;
    })}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1.4px, transparent 1.4px)', backgroundSize: '34px 34px', opacity: 0.35, transform: `translateY(${-f * 0.3}px)`}} />
  </AbsoluteFill>;
};
const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <div style={{background: 'rgba(255,255,255,0.86)', border: '1px solid rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderRadius: 30, boxShadow: '0 40px 80px -30px rgba(120,40,0,0.45), inset 0 1px 0 #fff', ...style}}>{children}</div>;

// ---------------- the orb (one small 3D canvas, positioned in HTML) ----------------
const Orb: React.FC<{x: number; y: number; size: number; mood?: 'happy' | 'meh' | 'wow' | 'wink'; squash?: number; look?: [number, number]; tilt?: number; o?: number}> = ({x, y, size, mood = 'happy', squash = 0, look = [0, 0], tilt = 0, o = 1}) => {
  const f = useCurrentFrame();
  const blink = Math.max(0, 1 - Math.abs(((f + 13) % 70) - 3) / 3);
  if (o <= 0.01) return null;
  return <div style={{position: 'absolute', left: x - size * 0.8, top: y - size * 0.8, width: size * 1.6, height: size * 1.6, opacity: o, filter: 'drop-shadow(0 30px 40px rgba(120,30,0,0.35))'}}>
    <ThreeCanvas width={Math.round(size * 1.6)} height={Math.round(size * 1.6)} camera={{position: [0, 0, 5.4], fov: 32}} gl={{alpha: true, antialias: true}}>
      <Studio />
      <Pip mood={mood} squash={squash + Math.sin(f / 9) * 0.02} blink={blink} look={look} tilt={tilt} />
    </ThreeCanvas>
  </div>;
};

// ---------------- day counter (TX14 roll) ----------------
const DayCounter: React.FC<{days: number[]; ats: number[]; red?: number; done?: number}> = ({days, ats, red = 99999, done = 99999}) => {
  const f = useCurrentFrame();
  let i = 0; ats.forEach((a, k) => { if (f >= a) i = k; });
  const roll = ease(f, ats[i], ats[i] + 10);
  const isRed = f >= red && f < done;
  const isDone = f >= done;
  const s = sp(f, ats[0], 30, 12, 200);
  return <div style={{position: 'absolute', right: 70, top: 60, transform: `scale(${s * (1 + 0.12 * Math.max(0, 1 - Math.abs(f - ats[i] - 4) / 6))})`, transformOrigin: 'right top'}}>
    <div style={{padding: '16px 34px', borderRadius: 26, background: isDone ? C.green : isRed ? C.red : C.ink, color: '#fff', fontFamily: F.head, fontWeight: 800, fontSize: 64, letterSpacing: '-0.03em', boxShadow: '0 20px 40px -14px rgba(0,0,0,0.5)', display: 'flex', gap: 18, alignItems: 'baseline', overflow: 'hidden', height: 82}}>
      {isDone ? <span>PAID ✓</span> : <>
        <span style={{fontFamily: F.ui, fontWeight: 700, fontSize: 30, opacity: 0.75}}>DAY</span>
        <span style={{position: 'relative', display: 'inline-block', width: 80, height: 70}}>
          {i > 0 && <span style={{position: 'absolute', left: 0, top: -roll * 70, opacity: 1 - roll}}>{days[i - 1]}</span>}
          <span style={{position: 'absolute', left: 0, top: (1 - roll) * 70}}>{days[i]}</span>
        </span>
      </>}
    </div>
  </div>;
};

// ---------------- invoice card ----------------
const Invoice: React.FC<{w?: number; stamp?: number; overdue?: number}> = ({w = 520, stamp, overdue}) => {
  const f = useCurrentFrame();
  const st = stamp !== undefined ? sp(f, stamp, 30, 9, 260) : 0;
  return <Glass style={{width: w, padding: 32, position: 'relative'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Logo k="stripe" size={44} /><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 30, color: C.ink}}>Invoice #0042</div>
      <div style={{marginLeft: 'auto', fontFamily: F.ui, fontWeight: 700, fontSize: 20, padding: '6px 14px', borderRadius: 20, background: overdue !== undefined && f >= overdue ? '#FFE1DD' : '#FFF1E2', color: overdue !== undefined && f >= overdue ? C.red : '#B4560B'}}>{overdue !== undefined && f >= overdue ? 'Overdue' : 'Sent'}</div></div>
    <div style={{fontFamily: F.ui, fontSize: 22, color: '#6B5A4A', marginTop: 14}}>Bloom Studio · Logo &amp; brand kit</div>
    <div style={{fontFamily: F.head, fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: '-0.03em', marginTop: 6}}>$1,200.00</div>
    <div style={{height: 10, borderRadius: 5, background: '#F3E6D8', marginTop: 12}} /><div style={{height: 10, width: '60%', borderRadius: 5, background: '#F3E6D8', marginTop: 10}} />
    {stamp !== undefined && f >= stamp && <div style={{position: 'absolute', right: 20, top: 70, padding: '8px 26px', border: `8px solid ${C.green}`, borderRadius: 18, color: C.green, fontFamily: F.head, fontWeight: 800, fontSize: 70, transform: `rotate(-14deg) scale(${2.6 - 1.6 * st})`, opacity: Math.min(1, st * 2)}}>PAID</div>}
  </Glass>;
};

// ---------------- scenes ----------------
const Center: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 0}) => { const {width: W, height: H} = useVideoConfig(); const k = W > H ? 1.55 : 1.25; return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px) scale(${k})`}}>{children}</AbsoluteFill>; };

const S1: React.FC = () => { // delivered + sent (lines 1-2)
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const a2 = AT[1];
  const cardS = sp(f, 4, 30, 11, 180);
  const fold = ease(f, a2 + 14, a2 + 26), fly = ease(f, a2 + 30, a2 + 44, Easing.in(Easing.cubic));
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, top: w ? 110 : 150, display: 'flex', justifyContent: 'center', opacity: 1 - ease(f, a2 - 4, a2 + 4)}}><Flip3D text="Delivered. On time." at={2} size={w ? 120 : 96} color={C.ink} font={F.head} stagger={1.2} /></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: w ? 110 : 150, display: 'flex', justifyContent: 'center', opacity: ease(f, a2, a2 + 6)}}><BlurWords text="Invoice sent. Feeling proud." at={a2} size={w ? 104 : 84} color={C.ink} accent="#FFFFFF" em={['proud.']} font={F.head} stagger={4} /></div>
    <Center y={w ? 90 : 120}>
      <div style={{transform: `translate(${fly * (w ? 900 : 700)}px, ${-fly * 500}px) rotate(${fly * 25}deg) scale(${(0.6 + 0.4 * cardS) * (1 - fold * 0.35) * (1 - fly * 0.5)})`, filter: fly > 0.05 ? `blur(${fly * 12}px)` : undefined, opacity: 1 - ease(f, a2 + 40, a2 + 46)}}>
        {fold < 0.5 ? <div style={{transform: `rotateX(${fold * 120}deg)`, transformOrigin: '50% 100%'}}>{f < a2 ? <Glass style={{padding: '30px 44px', display: 'flex', alignItems: 'center', gap: 20}}><div style={{width: 64, height: 64, borderRadius: 32, background: C.green, color: '#fff', fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900}}>✓</div><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 44, color: C.ink}}>Project delivered</div></Glass> : <Invoice />}</div>
          : <div style={{width: 360, height: 240, borderRadius: 24, background: '#FFF6EC', boxShadow: '0 30px 60px -20px rgba(120,40,0,0.5)', position: 'relative', overflow: 'hidden'}}><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 0, borderLeft: '180px solid transparent', borderRight: '180px solid transparent', borderTop: `130px solid ${C.o3}`}} /><div style={{position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', fontFamily: F.ui, fontWeight: 800, fontSize: 26, color: C.ink}}>$1,200 → Bloom Studio</div></div>}
      </div>
    </Center>
  </AbsoluteFill>;
};

const S3: React.FC = () => { // day 7 seen
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const seen = wf(2, 'seen') - AT[2] + 2;
  const dots = between(f, seen + 10, seen + 40);
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, top: w ? 120 : 160, display: 'flex', justifyContent: 'center'}}><BlurWords text="Seen. No reply." at={seen - 4} size={w ? 120 : 96} color={C.ink} accent="#FFFFFF" em={['No', 'reply.']} font={F.head} stagger={6} /></div>
    <Center y={w ? 110 : 150}>
      <Glass style={{width: w ? 760 : 820, padding: 30}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #F1E3D3', paddingBottom: 16}}><div style={{width: 54, height: 54, borderRadius: 27, background: '#7C6CFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.ui, fontWeight: 800, fontSize: 24}}>BS</div><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 28, color: C.ink}}>Bloom Studio</div><div style={{marginLeft: 'auto', fontFamily: F.ui, fontSize: 20, color: '#8C7B6A'}}>online 2 min ago</div></div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}><div style={{maxWidth: 520, background: '#FFE7CC', padding: '16px 22px', borderRadius: '22px 22px 6px 22px', fontFamily: F.ui, fontSize: 26, color: C.ink}}>Hi! Here's the invoice for the brand kit 🙌 <b>stripe.com/inv/0042</b><div style={{textAlign: 'right', fontSize: 18, color: f >= seen ? '#2D8CFF' : '#9C8B7A', marginTop: 6}}>9:14 PM {f >= seen ? '✓✓ Seen' : '✓'}</div></div></div>
        <div style={{height: 60, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: dots ? 1 : 0}}>{[0, 1, 2].map((k) => <div key={k} style={{width: 14, height: 14, borderRadius: 7, background: '#B9A895', transform: `translateY(${Math.sin(f / 3 + k) * 5}px)`}} />)}<span style={{fontFamily: F.ui, fontSize: 20, color: '#9C8B7A', marginLeft: 8}}>typing…</span></div>
      </Glass>
    </Center>
  </AbsoluteFill>;
};

const DRAFT = 'Hi! Just following up on the invoice';
const S4: React.FC = () => { // day 14: type, delete, retype + Notion board stuck
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const len = DRAFT.length;
  const n = f < 40 ? Math.floor(len * ease(f, 4, 40, (x) => x)) : f < 58 ? Math.floor(len * (1 - ease(f, 44, 58, (x) => x))) : Math.floor(len * ease(f, 62, 96, (x) => x));
  const cols = ['Sent', 'Waiting', 'Paid'];
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: w ? 80 : 60, right: w ? undefined : 60, top: w ? 260 : 230, width: w ? 900 : undefined}}>
      <Glass style={{padding: 0, overflow: 'hidden'}}>
        <div style={{background: '#128C7E', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14}}><Logo k="whatsapp" size={34} color="#fff" /><span style={{fontFamily: F.ui, fontWeight: 800, fontSize: w ? 34 : 28, color: '#fff'}}>Bloom Studio</span></div>
        <div style={{padding: 26, background: '#ECE5DD', minHeight: 120}}><div style={{background: '#fff', borderRadius: 22, padding: '16px 22px', fontFamily: F.ui, fontSize: w ? 40 : 32, color: C.ink, minHeight: 40}}>{DRAFT.slice(0, n)}<Caret h={30} color="#128C7E" /></div></div>
      </Glass>
    </div>
    <div style={{position: 'absolute', left: w ? 1030 : 60, right: w ? 70 : 60, top: w ? 260 : 650, display: 'flex', gap: 16}}>
      {cols.map((c, i) => <div key={c} style={{flex: 1, background: 'rgba(255,255,255,0.55)', borderRadius: 22, padding: 16, minHeight: w ? 360 : 300}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.ui, fontWeight: 800, fontSize: 22, color: C.ink, marginBottom: 12}}>{i === 0 && <Logo k="notion" size={22} />}{c}</div>
        {i === 1 && <div style={{background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 10px 20px -10px rgba(0,0,0,0.3)', transform: `translateX(${Math.sin(f / 2) * (f > 70 ? 3 : 0)}px)`}}><div style={{fontFamily: F.ui, fontWeight: 700, fontSize: w ? 26 : 20, color: C.ink}}>Bloom Studio · $1,200</div><div style={{marginTop: 8, display: 'inline-block', padding: '4px 10px', borderRadius: 10, background: '#FFE1DD', color: C.red, fontFamily: F.ui, fontWeight: 700, fontSize: 16, opacity: 0.6 + 0.4 * Math.sin(f / 5)}}>14 days</div></div>}
      </div>)}
    </div>
  </AbsoluteFill>;
};

const S5: React.FC = () => { // day 21 ghosted + rent
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const rent = wf(4, 'rent') - AT[4] + 2, gh = wf(4, 'ghost') - AT[4] + 2;
  return <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(70% 60% at 50% 50%, transparent 40%, rgba(90,10,0,${0.35 * ease(f, 0, 30)}) 100%)`}} />
    <Center y={w ? 40 : 60}><div style={{transform: `scale(${0.95 + 0.02 * Math.sin(f / 4)})`}}><Invoice overdue={4} /></div></Center>
    {Array.from({length: 9}).map((_, i) => { const a = (i / 9) * Math.PI * 2 + f * 0.01; const s = sp(f, 6 + i * 3, 30, 10, 220); const R = w ? 430 : 400; return <div key={i} style={{position: 'absolute', left: W / 2 + Math.cos(a) * R * (w ? 1.25 : 1) - 34, top: H / 2 + (w ? 40 : 60) + Math.sin(a) * R * 0.75 - 34, width: 68, height: 68, borderRadius: 34, background: '#FFB020', color: '#fff', fontFamily: F.head, fontWeight: 900, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 0 30px rgba(255,176,32,0.8)'}}>!</div>; })}
    <div style={{position: 'absolute', left: w ? 90 : 60, top: w ? 640 : 1000, transform: `translateX(${(1 - sp(f, rent, 30, 13, 170)) * -700}px) rotate(-4deg)`}}><Glass style={{padding: '18px 26px', display: 'flex', gap: 14, alignItems: 'center'}}><span style={{fontSize: 40}}>🏠</span><div style={{fontFamily: F.ui}}><div style={{fontWeight: 800, fontSize: 28, color: C.ink}}>Rent due</div><div style={{fontSize: 20, color: C.red, fontWeight: 700}}>Tomorrow</div></div></Glass></div>
    {f >= gh && <div style={{position: 'absolute', left: 0, right: 0, top: w ? 90 : 140, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 50px', background: C.ink, color: '#fff', fontFamily: F.head, fontWeight: 800, fontSize: w ? 120 : 100, letterSpacing: '-0.03em', transform: `rotate(-5deg) scale(${2 - sp(f, gh, 30, 9, 260)})`, boxShadow: '0 20px 0 rgba(0,0,0,0.15)'}}>GHOSTED. 👻</div></div>}
  </AbsoluteFill>;
};

const S6: React.FC = () => { // second job -> zoom-through (CAM5)
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const end = AT[6] - AT[5];
  const z = ease(f, end - 16, end + 2, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{transform: `scale(${1 + z * 30})`, transformOrigin: w ? '73% 50%' : '62% 56%', opacity: 1 - ease(f, end - 4, end + 2)}}>
      <BlurWords text="Chasing money shouldn't be your second job." at={0} size={w ? 110 : 88} color={C.ink} accent="#FFFFFF" em={['second', 'job.']} font={F.head} stagger={4} style={{maxWidth: w ? 1600 : 960}} />
    </div>
    <AbsoluteFill style={{background: C.cream, opacity: ease(f, end - 8, end + 2)}} />
  </AbsoluteFill>;
};

const PROMPT = "If a Stripe invoice isn't paid in 7 days, send a polite WhatsApp reminder, update my Notion board and ping me on Telegram. When it's paid, thank them and add it to QuickBooks.";
const S7: React.FC = () => { // chat box + typing (lines 7 + typing beat)
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const typeAt = AT[6] - AT[6] + Math.round(V[6].dur * 30) + 4, sentAt = typeAt + TYPE_BEAT - 14;
  const box = sp(f, 4, 30, 14, 140);
  const t = typed(PROMPT, f - typeAt, 42);
  const sent = f >= sentAt;
  const zoom = interpolate(f, [typeAt - 6, typeAt + 10, sentAt - 4, sentAt + 6], [1, w ? 1.18 : 1.06, w ? 1.18 : 1.06, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return <AbsoluteFill style={{background: C.cream}}>
    <AbsoluteFill style={{background: `radial-gradient(60% 50% at 50% 30%, rgba(255,154,61,0.35), transparent 70%)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: w ? 90 : 130, display: 'flex', justifyContent: 'center', opacity: 1 - ease(f, typeAt, typeAt + 8)}}><BlurWords text="So tell FansaChat, once." at={0} size={w ? 96 : 80} color={C.ink} accent={C.o1} em={['FansaChat,', 'once.']} font={F.head} stagger={4} /></div>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateY(${w ? 70 : 90}px)`}}>
      <div style={{transform: `scale(${box * zoom}) perspective(1600px) rotateX(${(1 - box) * 30}deg)`, width: w ? 1300 : 900}}>
        <Glass style={{padding: 34, background: '#fff', border: `3px solid ${f >= typeAt && !sent ? C.o1 : '#F1E3D3'}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.ui, fontWeight: 700, fontSize: 24, color: '#8C7B6A', marginBottom: 16}}><Img src={staticFile('logo-fansa.png')} style={{width: 40, height: 40}} />FansaChat · new workflow</div>
          <div style={{fontFamily: F.ui, fontWeight: 500, fontSize: w ? 40 : 38, lineHeight: 1.35, color: C.ink, minHeight: w ? 160 : 260, paddingRight: 90}}>{sent ? PROMPT : t}{!sent && f >= typeAt && <Caret h={40} color={C.o1} />}{f < typeAt && <span style={{color: '#B9A895'}}>Describe what should happen…</span>}</div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10}}>
            <div style={{height: 70, minWidth: 70, padding: sent ? '0 30px' : 0, borderRadius: 35, background: `linear-gradient(90deg, ${C.o1}, ${C.o2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: F.ui, fontWeight: 800, fontSize: 26, transform: `scale(${1 - 0.15 * Math.max(0, 1 - Math.abs(f - sentAt) / 3)})`, boxShadow: '0 16px 30px -10px rgba(255,106,19,0.6)'}}>
              {sent ? <><div style={{width: 26, height: 26, borderRadius: 13, border: '4px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', transform: `rotate(${f * 20}deg)`}} />Building your workflow…</> : '↑'}
            </div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};

// workflow mind-map (UI2) with ribbon wipe (CAM7) and camera pan
const NODES: {k: string; t: string; s: string; x: number; y: number}[] = [
  {k: 'stripe', t: 'Stripe', s: 'Invoice unpaid', x: 0, y: 0},
  {k: 'clock', t: 'Wait 7 days', s: 'Then check again', x: 1, y: 0},
  {k: 'whatsapp', t: 'WhatsApp', s: 'Polite reminder', x: 2, y: 0},
  {k: 'notion', t: 'Notion', s: 'Board → "Reminded"', x: 3, y: 0},
  {k: 'telegram', t: 'Telegram', s: 'Ping you', x: 4, y: 0},
  {k: 'quickbooks', t: 'QuickBooks', s: 'Paid → add entry', x: 2, y: 1},
];
const S9: React.FC = () => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const nodeW = w ? 440 : 380, nodeH = w ? 130 : 120;
  const pos = (n: typeof NODES[0]) => { if (w) { const L = [[120, 230], [740, 230], [1360, 230], [1360, 560], [740, 560], [120, 640]]; const i = NODES.indexOf(n); return {x: L[i][0], y: L[i][1]}; } return n.y ? {x: 640, y: 250 + 2 * 200} : {x: 80, y: 220 + n.x * 200}; };
  const pan = interpolate(f, [0, 140], [40, -40], clamp);
  const rib = ease(f, 0, 16);
  return <AbsoluteFill style={{background: C.cream}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(26,18,6,0.12) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px', transform: `translateX(${pan * 0.3}px)`}} />
    <AbsoluteFill style={{transform: `translateX(${pan}px)`}}>
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%">
        {NODES.slice(0, 5).map((n, i) => { if (i === 0) return null; const A = pos(NODES[i - 1]), B = pos(n); const ax = A.x + nodeW / 2, ay = A.y + nodeH / 2, bx = B.x + nodeW / 2, by = B.y + nodeH / 2; const k = ease(f, 12 + i * 10, 22 + i * 10); return <line key={i} x1={ax} y1={ay} x2={ax + (bx - ax) * k} y2={ay + (by - ay) * k} stroke={C.o1} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 16" />; })}
        {(() => { const A = pos(NODES[0]), B = pos(NODES[5]); const k = ease(f, 70, 86); const ax = A.x + nodeW / 2, ay = A.y + nodeH / 2, bx = B.x + nodeW / 2, by = B.y + nodeH / 2; return <path d={`M${ax},${ay} C${ax - 60},${(ay + by) / 2} ${bx - 60},${(ay + by) / 2} ${bx},${by}`} stroke={C.green} strokeWidth={7} fill="none" pathLength={1} strokeDasharray={`${k} 1`} />; })()}
      </svg>
      {NODES.map((n, i) => { const p = pos(n); const at = 8 + i * 10; const s = sp(f, at, 30, 12, 200); const ok = f >= 90 + i * 5; return <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: nodeW, transform: `scale(${s})`}}>
        <Glass style={{padding: '20px 24px', height: nodeH, boxSizing: 'border-box', display: 'flex', gap: 18, alignItems: 'center', background: '#fff', border: i === 5 ? `3px solid ${C.green}` : undefined}}>
          {n.k === 'clock' ? <div style={{width: 86, height: 86, borderRadius: 18, background: '#FFF1E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34}}>⏱</div> : <AppTile k={n.k} size={86} />}
          <div><div style={{fontFamily: F.ui, fontWeight: 800, fontSize: w ? 38 : 32, color: C.ink}}>{n.t}</div><div style={{fontFamily: F.ui, fontSize: w ? 26 : 22, color: '#8C7B6A'}}>{ok ? <span style={{color: C.green, fontWeight: 800}}>✓ Tested</span> : n.s}</div></div>
        </Glass>
        {i === 5 && <div style={{position: 'absolute', top: -30, left: 10, fontFamily: F.ui, fontWeight: 800, fontSize: 26, color: C.green}}>IF PAID</div>}
      </div>; })}
    </AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: w ? 70 : 110, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 30px', borderRadius: 40, background: C.ink, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 40, opacity: ease(f, 110, 120), transform: `scale(${sp(f, 110, 30, 10, 220)})`}}>✓ Test run succeeded</div></div>
    {/* ribbon wipe */}
    <svg style={{position: 'absolute', inset: 0, pointerEvents: 'none'}} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stopColor="#FF3D6E" /><stop offset="0.5" stopColor={C.o1} /><stop offset="1" stopColor="#FFC77A" /></linearGradient></defs>
      <path d={`M${-200},${H * 0.9} C${W * 0.3},${H * 0.2} ${W * 0.6},${H * 1.1} ${W + 200},${H * 0.1}`} stroke="url(#rb)" strokeWidth={w ? 260 : 300} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.min(1, rib * 1.2)} 1`} strokeDashoffset={-ease(f, 12, 26)} opacity={1 - ease(f, 22, 28)} />
    </svg>
  </AbsoluteFill>;
};

const S10: React.FC = () => { // phone + notifications (lines 10-11)
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const up = sp(f, 2, 30, 13, 110);
  const n1 = 18, n2 = n1 + 26;
  const a11 = AT[9] - AT[8] + 2;
  const notes = [{at: n1, i: 'whatsapp', t: 'Friendly reminder sent ✓', b: 'Bloom Studio · invoice #0042'}, {at: n2, i: 'stripe', t: '💸 Paid! $1,200.00', b: 'Thank-you sent · added to QuickBooks'}];
  const phoneX = w ? 1200 : W / 2 - 210;
  return <AbsoluteFill>
    <svg style={{position: 'absolute', inset: 0}} width="100%" height="100%"><path d={w ? `M${W * 0.45},${H} Q${W * 0.62},${H * 0.05} ${W * 0.98},${H * 0.55}` : `M0,${H * 0.95} Q${W * 0.5},${H * 0.15} ${W},${H * 0.95}`} stroke="rgba(255,255,255,0.7)" strokeWidth={4} fill="none" strokeDasharray="4 14" pathLength={1} /></svg>
    <div style={{position: 'absolute', left: phoneX, top: (w ? 120 : 420) + (1 - up) * 900, width: 420, height: 840, borderRadius: 66, background: '#121212', padding: 12, transformOrigin: '50% 0%', transform: `scale(${w ? 1.12 : 1}) rotate(${(1 - up) * 14 + Math.sin(f / 30) * 2}deg)`, boxShadow: '0 60px 120px -40px rgba(80,20,0,0.6)'}}>
      <div style={{width: '100%', height: '100%', borderRadius: 56, background: 'linear-gradient(170deg,#FFE7CC,#FFB27A)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 14, left: 150, width: 108, height: 30, borderRadius: 15, background: '#121212'}} />
        <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: F.ui, fontWeight: 300, fontSize: 90, color: C.ink}}>9:41</div>
        {notes.map((n, i) => { const s = sp(f, n.at, 30, 12, 190); return <div key={i} style={{position: 'absolute', left: 14, right: 14, top: 240 + i * 128, padding: '14px 16px', borderRadius: 24, background: 'rgba(255,255,255,0.88)', display: 'flex', gap: 12, alignItems: 'center', transform: `translateY(${(1 - s) * -80}px)`, opacity: s}}><Img src={staticFile('logo-fansa.png')} style={{width: 46, height: 46, borderRadius: 12, background: '#fff'}} /><div style={{fontFamily: F.ui, flex: 1}}><div style={{fontSize: 14, color: '#7A6A5A', display: 'flex'}}>FANSACHAT<span style={{marginLeft: 'auto'}}>now</span></div><div style={{fontSize: 20, fontWeight: 800, color: '#111'}}>{n.t}</div><div style={{fontSize: 15, color: '#444'}}>{n.b}</div></div></div>; })}
      </div>
    </div>
    <div style={{position: 'absolute', left: w ? 100 : 60, right: w ? undefined : 60, top: w ? 300 : 150, width: w ? 900 : undefined}}>
      <BlurWords text="Reminders go out without you." at={0} size={w ? 96 : 78} color={C.ink} accent="#FFFFFF" em={['without', 'you.']} font={F.head} stagger={4} align={w ? 'left' : 'center'} style={{opacity: 1 - ease(f, a11 - 4, a11 + 4)}} />
      {f >= a11 - 4 && <div style={{opacity: ease(f, a11, a11 + 6)}}>
        <div style={{fontFamily: F.head, fontWeight: 800, fontSize: w ? 90 : 74, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.05, textAlign: w ? 'left' : 'center'}}>No <span style={{position: 'relative'}}>awkward follow-ups.<span style={{position: 'absolute', left: -6, right: -6, top: '55%', height: 12, background: C.red, borderRadius: 6, transform: `scaleX(${ease(f, a11 + 14, a11 + 24)})`, transformOrigin: '0 50%'}} /></span></div>
        <div style={{fontFamily: F.head, fontWeight: 800, fontSize: w ? 90 : 74, color: '#fff', letterSpacing: '-0.03em', textAlign: w ? 'left' : 'center', opacity: ease(f, wf(9, 'just') - AT[8] + 2, wf(9, 'just') - AT[8] + 8)}}>Just paid invoices.</div>
      </div>}
    </div>
  </AbsoluteFill>;
};

const ORBIT = ['stripe', 'paypal', 'wise', 'notion', 'whatsapp', 'telegram', 'quickbooks', 'trello', 'calendly', 'toggl', 'upwork', 'xero'];
const S12: React.FC = () => { // logo + orbit + waitlist
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const cta = AT[11] - AT[10] - 4;
  const s = sp(f, 10, 30, 10, 170);
  const cx = W / 2, cy = w ? 400 : 520;
  return <AbsoluteFill>
    {ORBIT.map((k, i) => { const a = (i / ORBIT.length) * Math.PI * 2 + f * 0.012; const r = (w ? 520 : 420) * ease(f, 8 + i, 26 + i); const front = Math.sin(a) > 0; return <div key={k} style={{position: 'absolute', left: cx + Math.cos(a) * r - 46, top: cy + Math.sin(a) * r * 0.42 - 46, zIndex: front ? 3 : 1, transform: `scale(${0.75 + 0.25 * Math.sin(a)})`, opacity: ease(f, 8 + i, 18 + i)}}><AppTile k={k} size={92} /></div>; })}
    <div style={{position: 'absolute', left: cx - 150, top: cy - 150, width: 300, height: 300, borderRadius: 80, background: '#fff', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 40px 100px -20px rgba(120,30,0,0.5)'}}><Img src={staticFile('logo-fansa.png')} style={{width: 240, height: 240, objectFit: 'contain'}} /></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: cy + (w ? 200 : 230), display: 'flex', justifyContent: 'center', zIndex: 4}}><Flip3D text="FansaChat" at={14} size={w ? 130 : 120} color={C.ink} font={F.head} stagger={1.3} /></div>
    <div style={{position: 'absolute', left: 0, right: 0, top: cy + (w ? 350 : 380), display: 'flex', justifyContent: 'center', zIndex: 4, opacity: ease(f, 26, 34), fontFamily: F.ui, fontWeight: 800, fontSize: w ? 46 : 44, color: '#fff'}}>Get paid, without chasing.</div>
    {f >= cta - 4 && <div style={{position: 'absolute', left: 0, right: 0, top: cy + (w ? 440 : 480), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 4}}>
      <div style={{padding: '22px 52px', borderRadius: 60, background: C.ink, color: '#fff', fontFamily: F.ui, fontWeight: 800, fontSize: 44, transform: `scale(${sp(f, cta, 30, 9, 230)})`}}>Join the waitlist →</div>
      <div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: C.ink, opacity: ease(f, cta + 10, cta + 20)}}>fansachat.com · t.me/fansachat</div>
    </div>}
  </AbsoluteFill>;
};

// ---------------- orb choreography (CAM2: camera follows the orb between scenes) ----------------
const orbAt = (f: number, W: number, H: number, w: boolean) => {
  const K: [number, number, number, number, string][] = [ // frame, x, y, size, mood
    [0, W * 0.82, H * 0.78, w ? 230 : 260, 'happy'],
    [AT[2], W * 0.85, H * 0.8, w ? 210 : 240, 'meh'],
    [AT[3], w ? W * 0.5 : W * 0.75, w ? H * 0.82 : H * 0.92, w ? 200 : 230, 'meh'],
    [AT[4], W * 0.84, H * 0.78, w ? 220 : 240, 'wow'],
    [AT[5], W * 0.5, H * 0.86, w ? 200 : 220, 'meh'],
    [AT[6] + 2, w ? W * 0.88 : W * 0.84, w ? H * 0.42 : H * 0.28, w ? 170 : 180, 'happy'],
    [AT[6] + Math.round(V[6].dur * 30) + 4, w ? W * 0.84 : W * 0.82, w ? 170 : 200, 150, 'wow'],
    [AT[7], W * 0.9, H * 0.86, 170, 'happy'],
    [AT[9], w ? W * 0.62 : W * 0.15, H * 0.82, w ? 190 : 200, 'wink'],
    [AT[10] + 4, W / 2, w ? 400 : 520, w ? 300 : 300, 'happy'],
  ];
  let i = 0; K.forEach((k, j) => { if (f >= k[0]) i = j; });
  const a = K[i], b = K[Math.min(K.length - 1, i + 1)];
  const k = i === K.length - 1 ? 1 : ease(f, a[0], a[0] + 16, Easing.inOut(Easing.cubic));
  const prev = K[Math.max(0, i - 1)];
  const p = i === 0 ? 1 : ease(f, a[0], a[0] + 16, Easing.inOut(Easing.cubic));
  const x = prev[1] + (a[1] - prev[1]) * p, y = prev[2] + (a[2] - prev[2]) * p - Math.sin(p * Math.PI) * 140, size = prev[3] + (a[3] - prev[3]) * p;
  return {x, y, size, mood: a[4] as 'happy', hop: i === 0 ? 0 : Math.sin(p * Math.PI), land: a[0] + 16, k, b};
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const {width: W, height: H} = useVideoConfig(); const w = W > H;
  const scene = (i: number) => [AT[i] - (i === 0 ? AT[0] : 2), i];
  const o = orbAt(f, W, H, w);
  const landSquash = f >= o.land && f < o.land + 14 ? -0.35 * Math.exp(-(f - o.land) / 4) * Math.cos((f - o.land) / 2) : 0;
  const end12 = AT[10] + 10;
  const orbOpacity = f < end12 ? 1 : 1 - ease(f, end12, end12 + 8);
  // CAM2 follow + micro drift
  const camX = -(o.x - W / 2) * 0.06 + Math.sin(f / 50) * 6, camY = -(o.y - H / 2) * 0.04 + Math.cos(f / 60) * 4;
  const seg = (from: number, to: number, el: React.ReactNode) => <Sequence from={from} durationInFrames={Math.max(1, to - from)}>{el}</Sequence>;
  const typingEnd = AT[7] - 2;
  return <AbsoluteFill style={{background: C.o1, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `translate(${camX}px, ${camY}px) scale(1.03)`}}>
      <Bg />
      {seg(0, AT[2] - 2, <S1 />)}
      {seg(AT[2] - 2, AT[3] - 2, <S3 />)}
      {seg(AT[3] - 2, AT[4] - 2, <S4 />)}
      {seg(AT[4] - 2, AT[5] - 2, <S5 />)}
      {seg(AT[5] - 2, AT[6], <S6 />)}
      {seg(AT[6], typingEnd, <S7 />)}
      {seg(typingEnd, AT[8] - 2, <S9 />)}
      {seg(AT[8] - 2, AT[10] + 4, <S10 />)}
      {seg(AT[10] + 4, TOTAL, <S12 />)}
      {f < AT[5] + 6 && <div style={{opacity: 1 - ease(f, AT[5] - 4, AT[5] + 6)}}><DayCounter days={[1, 7, 14, 21]} ats={[AT[1] + 30, AT[2], AT[3], AT[4]]} red={AT[4]} /></div>}
      <Orb x={o.x} y={o.y} size={o.size} mood={o.mood} squash={landSquash + o.hop * 0.15} look={[0, 0.1]} o={orbOpacity} tilt={Math.sin(f / 20) * 0.08} />
    </AbsoluteFill>
    <Mix />
  </AbsoluteFill>;
};

// counter visible only during story (lines 2-5)
// ---------------- audio ----------------
const Mix: React.FC = () => {
  const talking = (x: number) => V.some((l, i) => x >= AT[i] - 4 && x <= AT[i] + l.dur * 30 + 4);
  const sfx: [number, string, number][] = [
    [8, 'k_pluck_001', 0.25], [AT[1] + 40, 'k_drop_002', 0.22], [AT[2] + 8, 'k_tick_001', 0.2], [wf(4, 'ghost'), 'k_bong_001', 0.18],
    [AT[6] + 6, 'k_click_002', 0.22], [AT[7] + 110, 'k_confirmation_002', 0.22], [AT[8] + 18, 'k_glass_002', 0.25], [AT[8] + 44, 'k_glass_002', 0.25],
  ];
  return <>
    <Audio src={staticFile('audio/09_upbeat-uplifting_uplifting-bass_mixkit-173.mp3')} volume={(x) => interpolate(x, [0, 10, TOTAL - 40, TOTAL], [0, 1, 1, 0], clamp) * (talking(x) ? 0.15 : 0.32)} />
    {V.map((l, i) => <Sequence key={i} from={AT[i]}><Audio src={staticFile(l.file)} /></Sequence>)}
    {sfx.map(([at, s, v], i) => <Sequence key={'s' + i} from={at}><Audio src={staticFile(`audio/sfx/${s}.ogg`)} volume={v} /></Sequence>)}
  </>;
};
export const FILM_FRAMES = TOTAL;
