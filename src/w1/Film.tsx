import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import tl from './timeline.json';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {noise2D} from '@remotion/noise';
import {AppIcon, C, HEAVY, SERIF, UI} from '../intro/ui';
import {at3, CamRig, e, EXPO, flight, HALF, mounted, ORDER, project, SC, SceneId, spr, TOTAL_FRAMES, vf} from './core';
import {BackWorld, BUILD_T, BUILD_TILES, CTA_HIT, CTA_TILE, FrontWorld, MainWorld, MEET_TILE, PAIN_TILES} from './scenes3d';
import {IconTile, Studio} from './kit3d';

export type EndCard = 'generic' | 'ig' | 'x';
export type FilmProps = {endcard: EndCard; audio: boolean};
const clampO = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useL = () => {
  const {width: W, height: H} = useVideoConfig();
  return {W, H, w: W > H};
};

// ---------------- shared HTML pieces ----------------
const plate: React.CSSProperties = {
  background: 'rgba(255,255,255,.94)', borderRadius: 34, boxShadow: '0 30px 70px rgba(48,44,120,.14), 0 3px 10px rgba(48,44,120,.07), inset 0 1px 0 #fff',
  border: '1px solid rgba(255,255,255,.9)',
};
const Rise: React.FC<{at: number; f: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode; scale?: number}> = ({at, f, dy = 40, style, children, scale = 0}) => {
  const s = spr(f, at, 14, 180);
  const o = e(f, at, at + 7);
  const b = (1 - e(f, at, at + 10)) * 12;
  return <div style={{...style, opacity: o, filter: b > 0.3 ? `blur(${b}px)` : undefined, transform: `translateY(${(1 - s) * dy}px) scale(${1 - scale + scale * s})`}}>{children}</div>;
};
type Wd = {w: string; at: number; serif?: boolean; color?: string; br?: boolean; strike?: number; icon?: React.ReactNode};
const Words: React.FC<{f: number; words: Wd[]; size: number; maxWidth?: number; align?: 'center' | 'flex-start'}> = ({f, words, size, maxWidth = 1700, align = 'center'}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align, alignItems: 'center', columnGap: size * 0.25, rowGap: size * 0.06, maxWidth}}>
    {words.map((x, i) => [
      x.br ? <div key={'b' + i} style={{flexBasis: '100%', height: 0}} /> : null,
      <Rise key={i} at={x.at} f={f} dy={size * 0.55} style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
        {x.icon ?? (
          <span style={x.serif
            ? {fontFamily: SERIF, fontStyle: 'italic', fontSize: size * 1.12, color: x.color ?? C.lav, lineHeight: 1.05, letterSpacing: '-0.01em'}
            : {fontFamily: HEAVY, fontWeight: 800, fontSize: size, color: x.color ?? C.ink, lineHeight: 1.08, letterSpacing: '-0.035em'}}>
            {x.w}
          </span>
        )}
        {x.strike ? <div style={{position: 'absolute', left: -6, right: -6, top: '54%', height: size * 0.09, borderRadius: 99, background: C.coral, transformOrigin: 'left', transform: `scaleX(${x.strike})`}} /> : null}
      </Rise>,
    ])}
  </div>
);
const Chip: React.FC<{children: React.ReactNode; size?: number; bg?: string; color?: string; style?: React.CSSProperties}> = ({children, size = 30, bg = '#fff', color = C.ink, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.38}px ${size * 0.8}px`, borderRadius: 999, background: bg, color, fontFamily: UI, fontWeight: 700,
    fontSize: size, letterSpacing: '-0.01em', boxShadow: '0 12px 30px rgba(48,44,120,.12)', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Cursor: React.FC<{x: number; y: number; press?: number; o?: number}> = ({x, y, press = 0, o = 1}) => (
  <svg width={54} height={54} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${1 - press * 0.18})`, transformOrigin: '20% 15%',
    filter: 'drop-shadow(0 6px 10px rgba(30,27,58,.25))'}}>
    <path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.6L4 18z" fill={C.ink} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
const Ripple: React.FC<{x: number; y: number; f: number; at: number; color?: string; size?: number}> = ({x, y, f, at, color = C.lav, size = 160}) => {
  if (f < at || f > at + 18) return null;
  const p = e(f, at, at + 18);
  return <div style={{position: 'absolute', left: x - (size * p) / 2, top: y - (size * p) / 2, width: size * p, height: size * p, borderRadius: '50%', border: `4px solid ${color}`, opacity: 1 - p}} />;
};

// Light-ray burst + spinning diamond frames (reference: opening "portal" + logo smash flashes).
const Burst: React.FC<{f: number; at: number; x: number; y: number; dur?: number; size?: number; diamonds?: boolean}> = ({f, at, x, y, dur = 30, size = 1700, diamonds}) => {
  if (f < at - 2 || f > at + dur) return null;
  const p = (f - at) / dur;
  const o = interpolate(p, [0, 0.12, 0.55, 1], [0, 1, 0.7, 0], clampO);
  const s = 0.4 + e(f, at, at + dur, 0, 1) * 1.1;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', transform: `scale(${s}) rotate(${p * 40}deg)`,
        background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,.95) 2.2deg, rgba(210,232,255,.4) 4deg, rgba(255,255,255,0) 7deg, rgba(255,255,255,0) 13deg)',
        WebkitMaskImage: 'radial-gradient(circle, #000 4%, rgba(0,0,0,.85) 22%, transparent 62%)', maskImage: 'radial-gradient(circle, #000 4%, rgba(0,0,0,.85) 22%, transparent 62%)'}} />
      <div style={{position: 'absolute', inset: '30%', borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, rgba(220,238,255,.9) 25%, rgba(200,205,255,0) 70%)', transform: `scale(${0.6 + s * 0.6})`}} />
      {diamonds
        ? [0, 1, 2].map((k) => {
            const q = e(f, at + k * 4, at + dur, 0, 1);
            return (
              <div key={k} style={{position: 'absolute', left: '50%', top: '50%', width: 300, height: 300, marginLeft: -150, marginTop: -150, border: '3px solid rgba(255,255,255,.95)', borderRadius: 18,
                boxShadow: '0 0 30px rgba(160,200,255,.8), inset 0 0 30px rgba(160,200,255,.5)', transform: `perspective(900px) rotateX(${50 - q * 30}deg) rotateZ(${45 + q * 60 + k * 15}deg) scale(${0.3 + q * (2.2 + k)})`, opacity: 1 - q}} />
            );
          })
        : null}
    </div>
  );
};
const Flash: React.FC<{f: number; at: number; peak?: number}> = ({f, at, peak = 0.75}) => {
  const o = interpolate(f, [at - 1, at + 1, at + 9], [0, peak, 0], clampO);
  return o > 0 ? <AbsoluteFill style={{background: 'radial-gradient(circle, #fff 30%, rgba(235,244,255,.9))', opacity: o}} /> : null;
};

// Each scene's HTML: in/out matched to the camera flight direction.
const Layer: React.FC<{id: SceneId; children: (lf: number) => React.ReactNode}> = ({id, children}) => {
  const f = useCurrentFrame();
  const {W, H} = useL();
  if (!mounted(id, f, HALF + 1)) return null;
  const [a, b] = SC[id];
  const i = ORDER.indexOf(id);
  const din = i > 0 ? flight(ORDER[i - 1]) : null;
  const dout = flight(id);
  const pin = e(f, a - 3, a + HALF + 2, 0, 1, EXPO);
  const pout = e(f, b - HALF - 1, b + 2, 0, 1, (x) => x * x);
  const tf = (d: 'x' | 'y' | 'z' | null, p: number, sign: number) =>
    d === 'x' ? `translateX(${-sign * p * W * 0.6}px)` : d === 'y' ? `translateY(${-sign * p * H * 0.7}px)` : d === 'z' ? `scale(${sign > 0 ? 1 + p * 1.2 : 1 - p * 0.35})` : '';
  const o = Math.min(i > 0 ? pin : 1, 1 - pout);
  const blur = (i > 0 ? (1 - pin) * 14 : 0) + pout * 18;
  return (
    <AbsoluteFill style={{opacity: o, filter: blur > 0.4 ? `blur(${blur}px)` : undefined, transform: `${i > 0 ? tf(din, 1 - pin, -1) : ''} ${tf(dout, pout, 1)}`}}>
      {children(f - a)}
    </AbsoluteFill>
  );
};

// ---------------- 2 · Pain: 3D card stacks ----------------
const ROWS = {
  mail: ['Invoice #1042 · Acme Ltd', 'Invoice #1043 · North & Co', 'Invoice #1044 · Bloom St.', 'Invoice #1045 · Kite Labs'],
  sheet: ['#1042   Acme Ltd   paid?', '#1043   North & Co   —', '#1044   ', '#1045   '],
  hash: ['New lead: Sam R. (web form)', 'New lead: Priya K. (web form)', 'New lead: Leo M. (web form)', 'New lead: Ana T. (web form)'],
} as const;
const TITLES = {mail: 'Inbox · invoices', sheet: 'Invoices sheet', hash: '#leads'};
const MiniCard: React.FC<{kind: 'mail' | 'sheet' | 'hash'; w: number; rows?: number}> = ({kind, w, rows = 3}) => (
  <div style={{width: w, padding: w > 400 ? 24 : 18, borderRadius: 24, background: '#fff', boxShadow: '0 18px 40px rgba(48,44,120,.13)', border: '1px solid #EEEDF8'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: UI, fontWeight: 700, fontSize: w > 400 ? 27 : 21, color: C.ink, marginBottom: 10}}>
      <AppIcon kind={kind === 'hash' ? 'chat' : kind} size={w > 400 ? 38 : 30} />
      {TITLES[kind]}
    </div>
    {ROWS[kind].slice(0, rows).map((r, i) => (
      <div key={i} style={{fontFamily: UI, fontWeight: 500, fontSize: w > 400 ? 21 : 16, color: '#5B5874', padding: w > 400 ? '9px 12px' : '7px 10px', borderRadius: 10, background: i === 0 ? '#F3F2FD' : 'transparent', whiteSpace: 'nowrap', overflow: 'hidden'}}>{r}</div>
    ))}
  </div>
);
const PainHtml: React.FC = () => {
  const {W, H, w} = useL();
  const f = useCurrentFrame();
  const tiles = PAIN_TILES(w).map((t) => project(at3('pain', t.p), f, W, H));
  const cw = w ? 470 : 330;
  const stamps = [vf('copy'), vf('paste'), vf('chase')].map((x) => x - SC.pain[0]);
  const l3 = vf('l3') - SC.pain[0];
  return (
    <Layer id="pain">
      {(lf) => {
        const rack = e(lf, stamps[0] - 4, stamps[0] + 6) * 3;
        const kinds = ['mail', 'sheet', 'hash'] as const;
        // copies piling up: each stack grows over time
        const pile = (i: number) => 2 + Math.floor(e(lf, 10 + i * 6, 100, 0, 4, (x) => x));
        const flights = [8, 20, 32, 44, 56].map((t, k) => ({t, from: 0, to: k < 3 ? 1 : 2}));
        return (
          <>
            <div style={{position: 'absolute', inset: 0, filter: rack > 0.3 ? `blur(${rack}px)` : undefined}}>
              {kinds.map((k, i) => {
                const [x, y] = tiles[i];
                const n = pile(i);
                return (
                  <div key={k} style={{position: 'absolute', left: x - cw / 2, top: y + (w ? 110 : 80), perspective: 1000}}>
                    {Array.from({length: n}, (_, j) => {
                      const d = n - 1 - j; // depth index, 0 = front
                      const s = spr(lf, 8 + i * 5 + j * 6, 13, 160);
                      return (
                        <div key={j} style={{position: 'absolute', left: 0, top: 0, transformOrigin: '50% 100%',
                          transform: `rotateX(${18 - d * 2}deg) rotateY(${(i - 1) * -16 + Math.sin((lf + i * 20) / 30) * 3}deg) translateX(${d * (i - 1) * 22}px) translateY(${-d * 30 + (1 - s) * 160}px) translateZ(${-d * 90}px) rotateZ(${(d % 2 ? 1 : -1) * d * 1.2}deg)`,
                          opacity: s * (1 - d * 0.08), filter: d > 0 ? `blur(${d * 2.4}px)` : undefined}}>
                          <MiniCard kind={k} w={cw} rows={4} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {flights.map(({t, from, to}, k) => {
                if (lf < t || lf > t + 16) return null;
                const p = e(lf, t, t + 16, 0, 1, (x) => x * x * (3 - 2 * x));
                const [x0, y0] = tiles[from];
                const [x1, y1] = tiles[to];
                const x = x0 + (x1 - x0) * p;
                const y = y0 + 150 + (y1 - y0) * p - Math.sin(p * Math.PI) * 140;
                return (
                  <div key={k} style={{position: 'absolute', left: x - 110, top: y, transform: `rotate(${(p - 0.5) * 16}deg) skewX(${-Math.sin(p * Math.PI) * 14}deg)`, filter: `blur(${Math.sin(p * Math.PI) * 3}px)`}}>
                    <Chip size={22} bg={C.lav} color="#fff">Ctrl+V · {k < 3 ? `invoice #104${2 + k}` : 'new lead'}</Chip>
                  </div>
                );
              })}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: w ? 70 : 90, display: 'flex', justifyContent: 'center', gap: 16}}>
              <Rise at={4} f={lf}><Chip size={w ? 30 : 26}>Gmail · Sheets · Slack · Notion · Shopify · +7</Chip></Rise>
              <Rise at={l3} f={lf}><Chip size={w ? 30 : 26} bg={C.coral} color="#fff">None of them talk</Chip></Rise>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: w ? 700 : 940, display: 'flex', justifyContent: 'center', gap: w ? 26 : 18}}>
              {['Copy.', 'Paste.', 'Chase.'].map((s, i) => {
                const at = stamps[i];
                const k = spr(lf, at, 11, 260);
                return (
                  <div key={s} style={{...plate, padding: w ? '20px 40px 26px' : '16px 28px 22px', opacity: e(lf, at, at + 3), transform: `scale(${2.2 - 1.2 * k}) rotate(${(i - 1) * -3}deg)`,
                    background: i === 2 ? C.orange : plate.background, fontFamily: HEAVY, fontWeight: 800, fontSize: w ? 104 : 84, letterSpacing: '-0.04em', color: i === 2 ? '#fff' : C.ink}}>
                    {s}
                  </div>
                );
              })}
            </div>
          </>
        );
      }}
    </Layer>
  );
};

// ---------------- 3 · Meet ----------------
const Wordmark: React.FC<{lf: number; at: number; size: number}> = ({lf, at, size}) => (
  <div style={{display: 'flex', fontFamily: HEAVY, fontWeight: 800, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1}}>
    {'FansaChat'.split('').map((ch, i) => {
      const s = spr(lf, at + i * 1.6, 9, 230);
      return (
        <span key={i} style={{display: 'inline-block', color: i > 4 ? C.lav : C.ink, opacity: e(lf, at + i * 1.6, at + i * 1.6 + 3), transform: `translateY(${(1 - s) * -size * 0.9}px) scaleY(${0.6 + 0.4 * s + (s > 1 ? (s - 1) * 1.5 : 0)}) scaleX(${1 + (1 - Math.min(1, s)) * 0.3})`, transformOrigin: 'bottom'}}>
          {ch}
        </span>
      );
    })}
  </div>
);
const MeetHtml: React.FC = () => {
  const {W, H, w} = useL();
  const f = useCurrentFrame();
  const T = project(at3('meet', MEET_TILE(w)), f, W, H);
  return (
    <Layer id="meet">
      {(lf) => (
        <>
          <Flash f={lf} at={10} peak={0.55} />
          <Burst f={lf} at={9} x={T[0]} y={T[1]} dur={26} size={1500} />
          <div style={{position: 'absolute', left: w ? 860 : 0, right: w ? undefined : 0, top: w ? 330 : 800, display: 'flex', flexDirection: 'column', alignItems: w ? 'flex-start' : 'center', gap: 22}}>
            <Rise at={8} f={lf}><Chip size={26} bg={C.lav} color="#fff">This is</Chip></Rise>
            <Wordmark lf={lf} at={14} size={w ? 168 : 150} />
            <Rise at={44} f={lf} style={{...plate, padding: '16px 28px', borderRadius: 24}}>
              <Words f={lf} size={w ? 46 : 42} maxWidth={w ? 1000 : 960} align={w ? 'flex-start' : 'center'} words={[
                {w: 'AI', at: 44}, {w: 'workflow', at: 47}, {w: 'automation,', at: 51}, {w: 'in', at: 62}, {w: 'plain', at: 65, serif: true}, {w: 'English.', at: 68, serif: true},
              ]} />
            </Rise>
          </div>
        </>
      )}
    </Layer>
  );
};

// ---------------- 4 · Type: icon-in-text + prompt + button morph ----------------
const InlineIcon: React.FC<{lf: number; size: number}> = ({lf, size}) => (
  <div style={{width: size, height: size, position: 'relative', margin: `0 ${size * 0.05}px`}}>
    <ThreeCanvas width={size} height={size} camera={{position: [0, 0, 2.5], fov: 30}} style={{position: 'absolute', inset: 0}}>
      <Studio />
      <IconTile glyph="chatL" body="#C9CBFF" rotation={[0.2 * Math.sin(lf / 9), (1 - spr(lf, 14, 10, 140)) * 4 + Math.sin(lf / 14) * 0.35, 0]} scale={1.05 * (1 - 0.16 * Math.max(0, 1 - Math.abs(lf - 30) / 3))} />
    </ThreeCanvas>
  </div>
);
const PROMPT = 'When a client emails me an invoice, add it to my Google Sheet and ping me on Telegram.';
const TypeHtml: React.FC = () => {
  const {W, w} = useL();
  return (
    <Layer id="type">
      {(lf) => {
        const iconSz = w ? 190 : 150;
        const iconW = e(lf, 12, 24) * iconSz;
        const typed = Math.floor(e(lf, 34, 108, 0, PROMPT.length, (x) => x));
        const cardIn = spr(lf, 18, 14, 120);
        const click = 114;
        const cx0 = w ? 1500 : 940;
        const cy0 = w ? 1000 : 1300;
        const cardW = w ? 1240 : 980;
        const cardH = w ? 340 : 420;
        const cardTop = w ? 400 : 480;
        const bx = (W + cardW) / 2 - 76; // send button centre (inside the card, bottom-right)
        const by = cardTop + cardH - 70;
        const cur = e(lf, 96, 112);
        const morph = e(lf, click + 1, click + 12);
        const collapse = e(lf, 128, 138, 0, 1, (x) => x * x);
        const pillW = 74 + morph * (w ? 430 : 380) - collapse * (w ? 430 : 380);
        return (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: w ? 70 : 110, display: 'flex', justifyContent: 'center'}}>
              <Rise at={2} f={lf} style={{...plate, padding: w ? '6px 56px' : '6px 40px', borderRadius: 999, display: 'flex', alignItems: 'center'}}>
                <Words f={lf} size={w ? 112 : 88} words={[
                  {w: 'Just', at: 6},
                  {w: '', at: 14, icon: <div style={{width: iconW, overflow: 'visible', display: 'flex', justifyContent: 'center'}}>{iconW > 4 ? <InlineIcon lf={lf} size={iconSz} /> : null}</div>},
                  {w: 'type', at: 10, serif: true}, {w: 'it.', at: 14, serif: true},
                ]} />
              </Rise>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: cardTop, display: 'flex', justifyContent: 'center', perspective: 1400}}>
              <div style={{...plate, width: cardW, height: cardH, boxSizing: 'border-box', padding: 34, borderRadius: 40, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 300}px) rotateX(${28 * (1 - cardIn) + 10 - e(lf, 20, 130) * 10}deg) rotateY(${-6 + e(lf, 20, 130) * 6}deg) scale(${0.9 + 0.1 * e(lf, 20, 130)})`,
                background: 'linear-gradient(160deg, rgba(255,255,255,.98), rgba(246,245,255,.96))', border: '2px solid rgba(100,104,216,.18)', boxShadow: '0 40px 90px rgba(48,44,120,.20), 0 0 0 10px rgba(255,255,255,.45)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: UI, fontWeight: 700, fontSize: 24, color: C.sub, marginBottom: 18}}>
                  <Img src={staticFile('logo-fansa.png')} style={{width: 40, height: 40}} />FansaChat · new workflow
                  <span style={{marginLeft: 'auto', fontSize: 18, color: '#9A98B3'}}>product illustration</span>
                </div>
                <div style={{fontFamily: UI, fontWeight: 500, fontSize: w ? 46 : 42, lineHeight: 1.3, color: C.ink, paddingRight: 60}}>
                  {PROMPT.slice(0, typed)}
                  <span style={{display: 'inline-block', width: 3, height: '1em', background: C.lav, marginLeft: 3, verticalAlign: '-0.12em', opacity: Math.floor(lf / 8) % 2 || (lf > 34 && lf < 108) ? 1 : 0}} />
                </div>
              </div>
            </div>
            {/* send button -> pill morph -> collapses into a dot that flies on */}
            <div style={{position: 'absolute', left: bx - pillW + 37, top: by - 37, width: pillW, height: 74, borderRadius: 99, opacity: cardIn * (1 - e(lf, 136, 140)),
              background: morph > 0 ? `linear-gradient(90deg, ${C.lav}, #8D90F0)` : C.lav, boxShadow: '0 16px 40px rgba(100,104,216,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              transform: `scale(${1 - 0.12 * Math.max(0, 1 - Math.abs(lf - click) / 3) + collapse * 0.3})`}}>
              {morph < 0.3 ? (
                <svg width="34" height="34" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 30, color: '#fff', whiteSpace: 'nowrap', opacity: morph * (1 - collapse * 2)}}>
                  <div style={{width: 26, height: 26, borderRadius: '50%', border: '4px solid rgba(255,255,255,.35)', borderTopColor: '#fff', transform: `rotate(${lf * 24}deg)`}} />
                  Building your workflow…
                </div>
              )}
            </div>
            <Ripple x={bx} y={by} f={lf} at={click} size={220} />
            {lf > 94 && lf < 132 ? <Cursor x={cx0 + (bx - 6 - cx0) * cur} y={cy0 + (by - 6 - cy0) * cur} press={Math.max(0, 1 - Math.abs(lf - click) / 3)} o={1 - e(lf, 124, 132)} /> : null}
            {lf > 16 && lf < 44 ? <Cursor x={W / 2 + (w ? 10 : 0) + (1 - e(lf, 16, 28)) * 260} y={(w ? 70 : 110) + iconSz * 0.55 + (1 - e(lf, 16, 28)) * 200} press={Math.max(0, 1 - Math.abs(lf - 30) / 3)} o={1 - e(lf, 38, 44)} /> : null}
            <div style={{position: 'absolute', left: 0, right: 0, top: w ? 940 : 1200, display: 'flex', justifyContent: 'center'}}>
              <Rise at={9} f={lf}>
                <Chip size={w ? 30 : 30} style={{background: 'rgba(30,27,58,.82)', color: '#fff'}}>Just type what you need, in <span style={{color: '#C9CAFF'}}>one sentence.</span></Chip>
              </Rise>
            </div>
          </>
        );
      }}
    </Layer>
  );
};

// ---------------- 5 · Build ----------------
const BuildHtml: React.FC = () => {
  const {W, H, w} = useL();
  const f = useCurrentFrame();
  const T = BUILD_TILES(w).map((p) => project(at3('build', p), f, W, H));
  const steps = [['STEP 1 · TRIGGER', 'Gmail', 'New invoice email'], ['STEP 2', 'Google Sheets', 'Add a row'], ['STEP 3', 'Telegram', 'Send me a message']];
  return (
    <Layer id="build">
      {(lf) => (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: w ? 70 : 64, display: 'flex', justifyContent: 'center'}}>
            <Rise at={4} f={lf}><Chip size={w ? 26 : 26} bg={C.lav} color="#fff">“When a client emails me an invoice…”</Chip></Rise>
          </div>
          {T.map(([x, y], i) => (
            <div key={i} style={w ? {position: 'absolute', left: x - 170, top: y + 108, width: 340, display: 'flex', justifyContent: 'center'} : {position: 'absolute', left: x + 120, top: y - 52}}>
              <Rise at={BUILD_T.pop[i] + 6} f={lf} style={{...plate, padding: '14px 24px', borderRadius: 22}}>
                <div style={{fontFamily: UI, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', color: C.lav}}>{steps[i][0]}</div>
                <div style={{fontFamily: HEAVY, fontWeight: 800, fontSize: 34, color: C.ink, letterSpacing: '-0.03em'}}>{steps[i][1]}</div>
                <div style={{fontFamily: UI, fontWeight: 500, fontSize: 20, color: C.sub}}>{steps[i][2]}</div>
              </Rise>
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: w ? 860 : 1160, display: 'flex', justifyContent: 'center'}}>
            <Rise at={8} f={lf} style={{...plate, padding: w ? '16px 36px' : '14px 30px', borderRadius: 26}}>
              <Words f={lf} size={w ? 56 : 48} words={[{w: 'It', at: 10}, {w: 'builds', at: 13}, {w: 'the', at: 16}, {w: 'whole', at: 19}, {w: 'workflow.', at: 23, serif: true}]} />
            </Rise>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: w ? 980 : 1262, display: 'flex', justifyContent: 'center'}}>
            <Rise at={BUILD_T.check[2] + 6} f={lf}><Chip size={22} bg="#E4F6EC" color={C.green}>✓ Test run succeeded</Chip></Rise>
          </div>
        </>
      )}
    </Layer>
  );
};

// ---------------- 6 · Stats ----------------
const Counter: React.FC<{lf: number; at: number; to: number; plus?: boolean; label: string; sub?: string; w: boolean; hot?: boolean}> = ({lf, at, to, plus, label, sub, w, hot}) => {
  const n = Math.round(e(lf, at, at + 26, 0, to, (x) => 1 - Math.pow(1 - x, 3)));
  const pulse = 1 + 0.06 * Math.max(0, 1 - Math.abs(lf - at - 26) / 5);
  return (
    <Rise at={at - 2} f={lf} dy={60} scale={0.2} style={{...plate, padding: w ? '20px 34px' : '18px 22px', display: 'flex', flexDirection: w ? 'row' : 'column', alignItems: w ? 'center' : 'flex-start', gap: w ? 26 : 2, borderRadius: 30,
      width: w ? 640 : 316, border: hot ? `2px solid ${C.lav}` : plate.border}}>
      <div style={{fontFamily: HEAVY, fontWeight: 800, fontSize: w ? 110 : 84, letterSpacing: '-0.05em', color: C.ink, minWidth: w ? 250 : undefined, transform: `scale(${pulse})`, transformOrigin: 'left center', lineHeight: 1}}>
        {n}{plus ? <span style={{color: C.orange}}>+</span> : null}
      </div>
      <div style={{fontFamily: UI, fontWeight: 700, fontSize: w ? 34 : 26, color: C.ink, lineHeight: 1.15}}>
        {label}
        {sub ? <div style={{fontWeight: 500, fontSize: w ? 22 : 18, color: C.sub}}>{sub}</div> : null}
      </div>
    </Rise>
  );
};
const USES: [string, string][] = [['Invoices', C.lav], ['Leads', C.orange], ['Orders', '#1FA463'], ['Support', '#2A8BE0']];
const StatsHtml: React.FC = () => {
  const {w} = useL();
  const ws = [vf('inv'), vf('lead'), vf('ord'), vf('sup')].map((x) => x - SC.stats[0]);
  const c = vf('l8') - SC.stats[0];
  return (
    <Layer id="stats">
      {(lf) => {
        let idx = 0; ws.forEach((t, i) => { if (lf >= t) idx = i; });
        const t = idx + e(lf, ws[idx], ws[idx] + 9) - 1;
        const out = e(lf, c - 6, c + 4);
        return (
          <>
            <div style={w ? {position: 'absolute', left: 1010, top: 250, width: 820, height: 420, perspective: 1600} : {position: 'absolute', left: 0, right: 0, top: 860, height: 400, perspective: 1400}}>
              {USES.map(([label, col], i) => {
                const o = i - Math.max(0, t);
                if (Math.abs(o) > 1.6 || lf < ws[0] - 4) return null;
                return (
                  <div key={label} style={{position: 'absolute', left: '50%', top: 0, width: w ? 400 : 380, height: w ? 300 : 280, marginLeft: w ? -200 : -190, borderRadius: 40,
                    background: `linear-gradient(160deg, ${col}, ${col}CC)`, boxShadow: `0 40px 80px -30px ${col}, inset 0 2px 0 rgba(255,255,255,.5)`,
                    transform: `translateX(${o * (w ? 330 : 300)}px) rotateY(${-o * 34}deg) scale(${1 - Math.min(1, Math.abs(o)) * 0.25})`, opacity: (1 - Math.abs(o) * 0.4) * (1 - out),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAVY, fontWeight: 800, fontSize: w ? 78 : 72, color: '#fff', letterSpacing: '-0.04em'}}>
                    {label}
                  </div>
                );
              })}
            </div>
            <div style={w ? {position: 'absolute', left: 1080, top: 320} : {position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center'}}>
              {lf > c - 4 ? <Counter lf={lf} at={c} to={700} plus label="apps, connected" w={w} /> : null}
            </div>
          </>
        );
      }}
    </Layer>
  );
};

// ---------------- 8 · Founder ----------------
const FounderHtml: React.FC = () => {
  const {w} = useL();
  const a = vf('l9') - SC.founder[0];
  const nc = vf('nocode') - SC.founder[0];
  const t = vf('l10') - SC.founder[0];
  return (
    <Layer id="founder">
      {(lf) => (
        <div style={{position: 'absolute', left: 0, right: 0, top: w ? 560 : 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
          <Rise at={a - 2} f={lf} style={{...plate, padding: w ? '24px 52px 30px' : '22px 34px 28px'}}>
            <Words f={lf} size={w ? 92 : 74} maxWidth={w ? 1500 : 940} words={[
              {w: 'No', at: a}, {w: 'flowcharts.', at: a + 4, strike: e(lf, a + 10, a + 18)}, {w: 'No', at: nc, br: !w}, {w: 'code.', at: nc + 4, color: C.orange, strike: e(lf, nc + 8, nc + 16)},
            ]} />
          </Rise>
          <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: w ? 1500 : 980}}>
            <Rise at={t} f={lf}><Chip size={w ? 34 : 30} bg="#E4F6EC" color={C.green}>✓ Tested before it runs</Chip></Rise>
            <Rise at={t + 30} f={lf}><Chip size={w ? 34 : 30} bg={C.ink} color="#fff">● Running while you rest ☾</Chip></Rise>
          </div>
        </div>
      )}
    </Layer>
  );
};

// ---------------- 9 · CTA + platform end cards ----------------
const TgIcon: React.FC<{size?: number}> = ({size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#2A9FD8" /><path d="M11 23.5 35 14l-4 21-8-6-4 4 1-6 11-10-14 8z" fill="#fff" /></svg>
);
const CtaHtml: React.FC<{endcard: EndCard}> = ({endcard}) => {
  const {W, H, w} = useL();
  const f = useCurrentFrame();
  const T = project(at3('cta', CTA_TILE(w)), f, W, H);
  const fc = vf('l11') - SC.cta[0];
  const btnAt = vf('l12') - SC.cta[0];
  const click = btnAt + 26;
  const varAt = btnAt + 32;
  return (
    <Layer id="cta">
      {(lf) => {
        const dot = spr(lf, btnAt, 10, 200);
        const grow = e(lf, btnAt + 6, btnAt + 18);
        const bw = 70 + grow * (w ? 400 : 420);
        const left = w ? 860 : 0;
        return (
          <>
            <Burst f={lf} at={CTA_HIT - 1} x={T[0]} y={T[1]} dur={30} size={2000} diamonds />
            <Flash f={lf} at={CTA_HIT} peak={0.7} />
            <div style={{position: 'absolute', left, right: w ? undefined : 0, top: w ? 250 : 690, display: 'flex', flexDirection: 'column', alignItems: w ? 'flex-start' : 'center', gap: 20}}>
              <Wordmark lf={lf} at={CTA_HIT + 3} size={w ? 156 : 132} />
              <Rise at={fc + 8} f={lf}><Chip size={w ? 30 : 28}>AI workflow automation in <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.15em', color: C.lav}}>plain English</span></Chip></Rise>
              {/* button morph: orb -> pill */}
              <div style={{height: 92, position: 'relative', width: w ? 520 : 520, display: 'flex', justifyContent: w ? 'flex-start' : 'center'}}>
                <div style={{width: bw, height: 86, borderRadius: 99, transform: `scale(${dot * (1 - 0.08 * Math.max(0, 1 - Math.abs(lf - click) / 3))})`, background: grow > 0.5 ? `linear-gradient(90deg, ${C.orange}, #FF8A4C)` : `radial-gradient(circle at 35% 30%, #BDE6FF, ${C.lav})`,
                  boxShadow: '0 18px 40px rgba(255,90,31,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 700, fontSize: 36, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  <span style={{opacity: e(lf, btnAt + 12, btnAt + 18)}}>Join the waitlist →</span>
                </div>
                <Ripple x={w ? bw / 2 : 260} y={43} f={lf} at={click} color={C.orange} size={300} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: w ? 'flex-start' : 'center', gap: 14}}>
                {endcard === 'generic' ? (
                  <Rise at={varAt} f={lf}><Chip size={w ? 34 : 32} style={{border: `2px solid ${C.lav}`}}>fansachat.com/waitlist</Chip></Rise>
                ) : null}
                {endcard === 'x' ? (
                  <Rise at={varAt} f={lf} style={{display: 'flex', alignItems: 'center', gap: 14}}>
                    <Chip size={w ? 34 : 32} style={{border: `2px solid ${C.lav}`}}>Link in the reply below</Chip>
                    <svg width="70" height="70" viewBox="0 0 48 48" style={{transform: `translateY(${Math.abs(Math.sin(lf / 7)) * 10}px)`}}>
                      <path d="M10 10v14c0 6 4 10 10 10h16" stroke={C.lav} strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M30 26l8 8-8 8" stroke={C.lav} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Rise>
                ) : null}
                <Rise at={varAt + 10} f={lf}>
                  <Chip size={w ? 26 : 25} style={{gap: 12}}><TgIcon size={w ? 36 : 34} />Join our Telegram channel · <span style={{color: '#2A8BE0'}}>t.me/fansachat</span></Chip>
                </Rise>
              </div>
            </div>
            {endcard === 'ig' ? (
              <div style={{position: 'absolute', left: w ? 60 : 40, top: w ? 40 : 40, display: 'flex', alignItems: 'center', gap: 16, opacity: e(lf, varAt, varAt + 8)}}>
                <svg width="80" height="96" viewBox="0 0 40 48" style={{transform: `translateY(${-Math.abs(Math.sin(lf / 7)) * 14}px)`}}>
                  <path d="M20 44V8M8 20 20 8l12 12" stroke={C.orange} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Rise at={varAt} f={lf} style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                  <Chip size={w ? 38 : 36} bg={C.ink} color="#fff">Link in bio</Chip>
                  <Chip size={22} style={{gap: 8}}>🔗 fansachat.com/waitlist</Chip>
                </Rise>
              </div>
            ) : null}
            <div style={{position: 'absolute', left: 0, right: 0, bottom: w ? 34 : 40, display: 'flex', justifyContent: 'center'}}>
              <Rise at={varAt + 18} f={lf}>
                <div style={{fontFamily: UI, fontWeight: 500, fontSize: 20, color: C.sub, background: 'rgba(255,255,255,.85)', padding: '8px 18px', borderRadius: 99}}>Bangladesh’s first workflow automation tool · built by a solo founder</div>
              </Rise>
            </div>
          </>
        );
      }}
    </Layer>
  );
};

// ---------------- background: cream + drifting lavender / peach / icy-blue light ----------------
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30 / 5;
  const blobs = [
    ['rgba(100,104,216,.22)', 46], ['rgba(255,184,154,.42)', 44], ['rgba(168,218,255,.45)', 40], ['rgba(255,122,107,.10)', 30],
  ].map(([c, r], i) => {
    const x = 50 + 42 * noise2D('x' + i, t, i);
    const y = 50 + 42 * noise2D('y' + i, i, t);
    return `radial-gradient(circle at ${x}% ${y}%, ${c} 0%, rgba(255,248,240,0) ${r}%)`;
  });
  return (
    <AbsoluteFill style={{background: [...blobs, 'radial-gradient(circle at 50% 42%, #FFFFFF 0%, #FFF8F0 60%, #F6F1FF 100%)'].join(',')}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(30,27,58,.06) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px', backgroundPosition: `${-f * 0.6}px ${-f * 0.3}px`, opacity: 0.8}} />
    </AbsoluteFill>
  );
};

// Audio: melodic music bed (Mixkit "Uplifting Bass", free commercial licence) ducked under the narrator; soft pops on scene changes (no whooshes).
const Mix: React.FC = () => {
  const LINES = tl.lines as {file: string; at: number; dur: number}[];
  const talking = (x: number) => LINES.some((l) => x >= l.at * 30 - 4 && x <= (l.at + l.dur) * 30 + 4);
  return (
    <>
      <Audio src={staticFile('audio/09_upbeat-uplifting_uplifting-bass_mixkit-173.mp3')} volume={(x) => interpolate(x, [0, 12, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 1, 1, 0], clampO) * (talking(x) ? 0.17 : 0.34)} />
      {LINES.map((l, i) => <Sequence key={i} from={Math.round(l.at * 30)}><Audio src={staticFile(l.file)} /></Sequence>)}
      {ORDER.slice(1).map((id) => <Sequence key={id} from={SC[id][0] - 2}><Audio src={staticFile('audio/sfx/pop_kenney.ogg')} volume={0.26} /></Sequence>)}
      <Sequence from={SC.cta[0] + CTA_HIT}><Audio src={staticFile('audio/sfx/success_kenney.ogg')} volume={0.22} /></Sequence>
    </>
  );
};

const onGl = ({gl}: {gl: THREE.WebGLRenderer}) => {
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 1.05;
};

export const Film: React.FC<FilmProps> = ({endcard, audio}) => {
  const {width, height} = useVideoConfig();
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('v3 fonts'));
  useEffect(() => {
    const specs = ['800 40px "FC Bricolage"', 'italic 400 40px "FC Instrument Serif"', '700 40px "FC Inter Tight"'];
    const poll = () => {
      if (specs.every((s) => document.fonts.check(s)) && [...document.fonts].some((ff) => ff.family.includes('FC Inter') && ff.status === 'loaded')) {
        setReady(true);
        continueRender(handle);
      } else setTimeout(poll, 50);
    };
    poll();
  }, [handle]);
  if (!ready) return null;
  const cam = {fov: 30, position: [0, 0, 9] as [number, number, number], near: 0.1, far: 220};
  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <Backdrop />
      <AbsoluteFill style={{filter: 'blur(7px)', opacity: 0.85}}>
        <ThreeCanvas width={width} height={height} camera={cam} onCreated={onGl} gl={{antialias: false, alpha: true}}>
          <Studio />
          <CamRig />
          <BackWorld />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} camera={cam} onCreated={onGl} gl={{antialias: true, alpha: true}}>
          <Studio />
          <CamRig />
          <MainWorld />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(16px)'}}>
        <ThreeCanvas width={width} height={height} camera={cam} onCreated={onGl} gl={{antialias: false, alpha: true}}>
          <Studio />
          <CamRig />
          <FrontWorld />
        </ThreeCanvas>
      </AbsoluteFill>
      <PainHtml />
      <MeetHtml />
      <TypeHtml />
      <BuildHtml />
      <StatsHtml />
      <FounderHtml />
      <CtaHtml endcard={endcard} />
      {audio ? <Mix /> : null}
    </AbsoluteFill>
  );
};
export const FILM_FRAMES = TOTAL_FRAMES;
