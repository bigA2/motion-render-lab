import React from 'react';
import {AbsoluteFill, Html5Audio, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {AppIcon, C, Chip, clamp, ease, fr, HEAVY, plate, Rise, Scene, SERIF, sp, UI, useLayout, Words} from './ui';
import {CAPTIONED, SCENES, VO} from './timing';
import {BD_H, BD_PATHS, BD_W, DHAKA} from './bangladesh';

// FansaChat introduction film — script: docs/scripts/00_intro.md. Two native masters share every scene:
// Intro16x9 (1920x1080) and Intro4x5 (1080x1350); scenes branch on `wide` for layout only.
const LOGO = staticFile('logo-fansa.png');
const at = (s: number, from: number) => fr(s) - from;

// ---------- 1 · Hook: Ctrl+C / Ctrl+V wall ----------
const Keycap: React.FC<{label: string; w: number; h: number; pressed?: number}> = ({label, w, h, pressed = 0}) => (
  <div style={{width: w, height: h, position: 'relative', transform: `translateY(${pressed * h * 0.08}px)`}}>
    <div style={{position: 'absolute', inset: 0, top: h * 0.1, borderRadius: h * 0.2, background: '#D9D6EC'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: pressed * h * 0.06, height: h * 0.9, borderRadius: h * 0.2, background: 'linear-gradient(180deg,#fff,#F3F1FA)',
      border: '2px solid #E4E1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontWeight: 700, fontSize: h * 0.36, color: C.ink}}>
      {label}
    </div>
  </div>
);
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {W, H, wide} = useLayout();
  const cols = wide ? 15 : 9;
  const rows = wide ? 8 : 11;
  const cell = 128;
  const press = (t: number) => Math.max(0, 1 - Math.abs(f - t) / 3);
  const pushOut = ease(f, 88, 110, 0, 1);
  const kb = wide ? 150 : 140;
  return (
    <AbsoluteFill>
      {/* keycap wall multiplying behind (multimedia grid zoom, tilted like a 3D card wall) */}
      <AbsoluteFill style={{perspective: 1400}}>
        <div style={{position: 'absolute', left: W / 2 - (cols * cell) / 2, top: H / 2 - (rows * cell) / 2, width: cols * cell, height: rows * cell,
          transform: `rotateX(28deg) scale(${1.15 - 0.12 * ease(f, 0, 90) + pushOut * 0.5})`, opacity: 0.32}}>
          {Array.from({length: cols * rows}, (_, i) => {
            const t = random(`k${i}`) * 70;
            const s = sp(f, t, 12, 220);
            return (
              <div key={i} style={{position: 'absolute', left: (i % cols) * cell + 14, top: Math.floor(i / cols) * cell + 14, transform: `scale(${s})`}}>
                <Keycap label={i % 2 ? 'V' : 'C'} w={100} h={100} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: wide ? 170 : 250, display: 'flex', justifyContent: 'center', gap: 26,
        transform: `scale(${1 + pushOut * 0.6})`, opacity: 1 - pushOut}}>
        {[['Ctrl', -4, kb * 1.6], ['C', 0, kb], ['V', 8, kb]].map(([l, t, w]) => (
          <div key={l as string} style={{transform: `scale(${sp(f, t as number, 11, 220)})`}}>
            <Keycap label={l as string} w={w as number} h={kb} pressed={l === 'Ctrl' ? Math.min(1, f / 4) : press(l === 'C' ? 4 : 13) + press(l === 'C' ? 22 : 30)} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: wide ? 430 : 560, display: 'flex', justifyContent: 'center', opacity: 1 - pushOut}}>
        <Rise at={0} dy={30} style={{...plate, padding: wide ? '44px 70px' : '40px 46px', borderRadius: 40}}>
          <Words size={wide ? 104 : 88} maxWidth={wide ? 1500 : 900} words={[
            {w: 'You', at: 4}, {w: 'didn’t', at: 8}, {w: 'start', at: 13}, {w: 'a', at: 18}, {w: 'business', at: 22},
            {w: 'to', at: 57, br: true}, {w: 'copy', at: 62}, {w: 'and', at: 68}, {w: 'paste.', at: 74, serif: true, color: C.coral},
          ]} />
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2 · Pain: the copy-paste day ----------
const Card: React.FC<{icon: 'mail' | 'sheet' | 'chat'; title: string; w: number; h: number; children: React.ReactNode}> = ({icon, title, w, h, children}) => (
  <div style={{...plate, width: w, height: h, padding: 26, boxSizing: 'border-box', overflow: 'hidden'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16}}>
      <AppIcon kind={icon} size={48} />
      <span style={{fontFamily: UI, fontWeight: 700, fontSize: 28, color: C.ink}}>{title}</span>
    </div>
    {children}
  </div>
);
const Row: React.FC<{on: number; hi?: boolean; children: React.ReactNode}> = ({on, hi, children}) => (
  <div style={{opacity: on, transform: `translateX(${(1 - on) * 20}px)`, fontFamily: UI, fontWeight: 500, fontSize: 23, color: C.ink, padding: '9px 12px', borderRadius: 12,
    background: hi ? C.lavSoft : 'transparent', marginBottom: 4, whiteSpace: 'nowrap'}}>{children}</div>
);
const Pain: React.FC = () => {
  const F = SCENES.pain[0];
  const f = useCurrentFrame();
  const {wide} = useLayout();
  const t = [at(3.65, F), at(4.25, F), at(4.95, F)];
  const stamps = [at(5.9, F), at(6.3, F), at(6.75, F)];
  const shake = stamps.reduce((a, s) => a + Math.max(0, 1 - (f - s) / 6) * (f >= s ? 1 : 0), 0);
  const cw = wide ? 470 : 860;
  const ch = wide ? 330 : 236;
  const pos = (i: number) => (wide ? {left: 960 - cw / 2 + (i - 1) * 540, top: 190, ry: (i - 1) * 16} : {left: 110, top: 120 + i * 262, ry: 0});
  const cells = ['#1042', 'Acme Ltd', 'Invoice', '#1043', 'North & Co', 'Invoice', '#1044', 'Bloom St.', 'Invoice'];
  // cursor ferrying a "Ctrl+V" chip from inbox to sheet, twice
  const loop = (f - 12) % 22;
  const cp = Math.min(1, Math.max(0, loop / 14));
  const a = pos(0);
  const b = pos(1);
  const cx = a.left + 120 + (b.left + 140 - a.left - 120) * cp;
  const cy = a.top + 130 + (b.top + 110 - a.top - 130) * cp - Math.sin(cp * Math.PI) * 80;
  return (
    <AbsoluteFill style={{transform: `translate(${Math.sin(f * 2.3) * shake * 8}px, ${Math.cos(f * 1.9) * shake * 6}px)`}}>
      <AbsoluteFill style={{perspective: 1600}}>
        {(['mail', 'sheet', 'chat'] as const).map((k, i) => {
          const s = sp(f, t[i], 13, 170);
          const p = pos(i);
          return (
            <div key={k} style={{position: 'absolute', left: p.left, top: p.top, opacity: Math.min(1, s * 2),
              transform: `translateY(${(1 - s) * 140}px) rotateY(${p.ry + (1 - s) * 30}deg) rotateZ(${(1 - s) * (i - 1) * 6}deg)`}}>
              {k === 'mail' && (
                <Card icon="mail" title="Inbox · invoices" w={cw} h={ch}>
                  {['Invoice #1042 — Acme Ltd', 'Invoice #1043 — North & Co', 'Invoice #1044 — Bloom St.'].map((r, j) => (
                    <Row key={r} on={ease(f, t[0] + 4 + j * 4, t[0] + 12 + j * 4)} hi={j === Math.floor(Math.max(0, f - 12) / 22) % 3}>● {r}</Row>
                  ))}
                </Card>
              )}
              {k === 'sheet' && (
                <Card icon="sheet" title="Invoices sheet" w={cw} h={ch}>
                  <div style={{display: 'grid', gridTemplateColumns: '0.8fr 1.3fr 1fr', gap: 6}}>
                    {cells.map((c, j) => (
                      <div key={j} style={{fontFamily: UI, fontWeight: 500, fontSize: 21, padding: '8px 10px', borderRadius: 8, background: '#F4F3FA', color: C.ink,
                        opacity: wide || j < 6 ? 1 : 0}}>{f > t[1] + 8 + j * 5 ? c : ''}</div>
                    ))}
                  </div>
                </Card>
              )}
              {k === 'chat' && (
                <Card icon="chat" title="#leads" w={cw} h={ch}>
                  {['New lead: Sam R. (web form)', 'New lead: Priya K. (web form)', 'New lead: Tom B. (web form)'].map((r, j) => (
                    <Row key={r} on={ease(f, t[2] + 6 + j * 7, t[2] + 14 + j * 7)}>{r}</Row>
                  ))}
                </Card>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
      {f > 12 && f < stamps[0] && (
        <div style={{position: 'absolute', left: cx, top: cy}}>
          <svg width="40" height="48" viewBox="0 0 20 24"><path d="M2 2 L2 19 L7 14 L10 21 L13 20 L10 13 L17 13 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" /></svg>
          <Chip size={20} bg={C.lav} color="#fff" style={{position: 'absolute', left: 30, top: 34}}>Ctrl+V</Chip>
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: wide ? 610 : 950, display: 'flex', justifyContent: 'center', gap: 28}}>
        {['Every.', 'Single.', 'Day.'].map((w, i) => {
          const s = sp(f, stamps[i], 12, 260);
          return (
            <div key={w} style={{opacity: f >= stamps[i] ? 1 : 0, transform: `scale(${2.2 - 1.2 * s}) rotate(${i === 2 ? -4 : 0}deg)`}}>
              <span style={{...plate, display: 'inline-block', padding: '14px 34px', borderRadius: 26, fontFamily: HEAVY, fontWeight: 800, fontSize: wide ? 110 : 96,
                letterSpacing: '-0.04em', color: i === 2 ? '#fff' : C.ink, background: i === 2 ? C.orange : '#fff'}}>{w}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3 · Meet: glass card + logo reveal ----------
const Wordmark: React.FC<{start: number; size: number}> = ({start, size}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', fontFamily: HEAVY, fontWeight: 800, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1}}>
      {'FansaChat'.split('').map((ch, i) => {
        const s = sp(f, start + i * 2, 14, 200);
        return <span key={i} style={{display: 'inline-block', color: i < 5 ? C.ink : C.lav, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * size * 0.5}px)`}}>{ch}</span>;
      })}
    </div>
  );
};
const Meet: React.FC = () => {
  const F = SCENES.meet[0];
  const f = useCurrentFrame();
  const {W, H, wide} = useLayout();
  const card = sp(f, 0, 16, 120);
  const logo = sp(f, 8, 10, 160);
  const sweep = ease(f, 26, 58, -40, 140);
  const breathe = 1 + Math.sin(f / 14) * 0.05;
  const cw = wide ? 1300 : 920;
  const chh = wide ? 560 : 960;
  return (
    <AbsoluteFill>
      {[{c: 'rgba(100,104,216,.55)', x: -0.3, y: -0.25, r: 340}, {c: 'rgba(255,184,154,.75)', x: 0.32, y: 0.28, r: 300}, {c: 'rgba(255,122,107,.35)', x: 0.2, y: -0.35, r: 180}].map((o, i) => (
        <div key={i} style={{position: 'absolute', left: W / 2 + o.x * cw - o.r + Math.sin(f / 30 + i) * 30, top: H / 2 + o.y * chh - o.r + Math.cos(f / 26 + i) * 24,
          width: o.r * 2, height: o.r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${o.c}, rgba(255,255,255,0) 70%)`, transform: `scale(${breathe})`}} />
      ))}
      <div style={{position: 'absolute', left: W / 2 - cw / 2, top: H / 2 - chh / 2, width: cw, height: chh, borderRadius: 56, overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.6))', border: '2px solid rgba(255,255,255,.95)',
        boxShadow: '0 40px 100px rgba(100,104,216,.22)', backdropFilter: 'blur(26px)', opacity: Math.min(1, card * 1.4),
        transform: `translateY(${(1 - card) * 120}px) rotateX(${(1 - card) * 20}deg) scale(${0.9 + 0.1 * card})`,
        display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: wide ? 50 : 30}}>
        <div style={{position: 'absolute', top: -200, bottom: -200, left: `${sweep}%`, width: 160, transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.9), rgba(255,255,255,0))'}} />
        <div style={{position: 'relative', width: wide ? 360 : 380, height: wide ? 360 : 380, transform: `scale(${logo}) rotate(${(1 - logo) * -20}deg)`}}>
          <div style={{position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,104,216,.35), rgba(100,104,216,0) 65%)', transform: `scale(${breathe})`}} />
          <Img src={LOGO} style={{position: 'relative', width: '100%', height: '100%'}} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: wide ? 'flex-start' : 'center', gap: 22}}>
          <Rise at={at(8.35, F)} dy={20}><Chip size={26} bg={C.lavSoft} color={C.lavDeep}>Meet</Chip></Rise>
          <Wordmark start={at(8.6, F)} size={wide ? 150 : 140} />
          <Words size={wide ? 58 : 56} maxWidth={wide ? 720 : 820} align={wide ? 'flex-start' : 'center'} words={[
            {w: 'AI', at: at(9.6, F)}, {w: 'workflow', at: at(9.85, F)}, {w: 'automation,', at: at(10.25, F)},
            {w: 'in', at: at(10.9, F)}, {w: 'plain English.', at: at(11.1, F), serif: true},
          ]} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4 · Type: browser reveal + live prompt ----------
const PROMPT = 'When a client emails me an invoice, add it to my Google Sheet and send me a Telegram message.';
const Type: React.FC = () => {
  const F = SCENES.type[0];
  const f = useCurrentFrame();
  const {W, wide} = useLayout();
  const rise = sp(f, 0, 18, 110);
  const t0 = at(13.3, F);
  const t1 = at(17.5, F);
  const send = at(17.7, F);
  const n = Math.round(interpolate(f, [t0, t1], [0, PROMPT.length], clamp));
  const sent = f >= send + 3;
  const bw = wide ? 1440 : 980;
  const bh = wide ? 760 : 940;
  const bx = (W - bw) / 2;
  const by = wide ? 110 : 120;
  const push = ease(f, 26, t1, 1, 1.1);
  const caret = Math.floor(f / 8) % 2 === 0;
  const sb = wide ? 280 : 0;
  return (
    <AbsoluteFill>
      <Rise at={4} dy={20} style={{position: 'absolute', left: bx, top: by - 70}}>
        <Chip size={26} bg={C.lav} color="#fff">Step 1 · say it</Chip>
      </Rise>
      <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, perspective: 1800}}>
        <div style={{...plate, width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden', transformOrigin: '50% 90%',
          transform: `translateY(${(1 - rise) * 700}px) rotateX(${(1 - rise) * 24}deg) scale(${push})`}}>
          <div style={{height: 62, background: '#F6F4FB', display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: '1px solid #ECEAF5'}}>
            {['#FF7A6B', '#FFC15A', '#55C98A'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
            <div style={{marginLeft: 24, padding: '8px 22px', borderRadius: 999, background: '#fff', fontFamily: UI, fontWeight: 500, fontSize: 21, color: C.sub}}>fansachat.com</div>
          </div>
          <div style={{display: 'flex', height: bh - 62}}>
            {wide && (
              <div style={{width: sb, background: '#FBFAFE', borderRight: '1px solid #ECEAF5', padding: 26, boxSizing: 'border-box'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30}}>
                  <Img src={LOGO} style={{width: 44, height: 44}} /><span style={{fontFamily: HEAVY, fontWeight: 800, fontSize: 28, color: C.ink}}>FansaChat</span>
                </div>
                {['New chat', 'Workflows', 'Templates', 'Connections'].map((x, i) => (
                  <div key={x} style={{fontFamily: UI, fontWeight: i ? 500 : 700, fontSize: 23, color: i ? C.sub : C.lavDeep, padding: '12px 14px', borderRadius: 12, background: i ? 'transparent' : C.lavSoft, marginBottom: 6}}>{x}</div>
                ))}
              </div>
            )}
            <div style={{flex: 1, position: 'relative', padding: wide ? '40px 60px' : '40px 40px', boxSizing: 'border-box'}}>
              {!sent ? (
                <div style={{textAlign: 'center', marginTop: wide ? 110 : 170, opacity: 1 - ease(f, send, send + 4)}}>
                  <div style={{fontFamily: HEAVY, fontWeight: 800, fontSize: wide ? 64 : 60, color: C.ink, letterSpacing: '-0.03em'}}>What should I <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.lav}}>automate?</span></div>
                  <div style={{fontFamily: UI, fontWeight: 500, fontSize: 25, color: C.sub, marginTop: 14}}>Describe it in plain English.</div>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                  <div style={{alignSelf: 'flex-end', maxWidth: '78%', background: C.lav, color: '#fff', fontFamily: UI, fontWeight: 500, fontSize: wide ? 28 : 30, lineHeight: 1.35,
                    padding: '20px 26px', borderRadius: '26px 26px 6px 26px', transform: `translateY(${(1 - sp(f, send + 3, 14, 180)) * 160}px)`}}>{PROMPT}</div>
                  <Rise at={send + 14} dy={20} style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 27, color: C.lavDeep,
                    background: C.lavSoft, padding: '16px 24px', borderRadius: '26px 26px 26px 6px'}}>
                    <Img src={LOGO} style={{width: 36, height: 36}} /> Building your workflow
                    {[0, 1, 2].map((i) => <span key={i} style={{opacity: 0.3 + 0.7 * Math.max(0, Math.sin((f - i * 4) / 4))}}>•</span>)}
                  </Rise>
                </div>
              )}
              <div style={{position: 'absolute', left: wide ? 60 : 40, right: wide ? 60 : 40, bottom: 40, minHeight: wide ? 150 : 230, borderRadius: 24, background: '#fff',
                border: `3px solid ${f > t0 - 6 && !sent ? C.lav : '#E4E1F2'}`, boxShadow: f > t0 - 6 && !sent ? '0 0 0 8px rgba(100,104,216,.12)' : 'none',
                padding: '22px 110px 22px 28px', boxSizing: 'border-box', fontFamily: UI, fontWeight: 500, fontSize: wide ? 33 : 34, lineHeight: 1.38, color: C.ink}}>
                {sent ? <span style={{color: '#A9A6BF'}}>Ask FansaChat to automate something…</span> : (
                  <>
                    {n === 0 ? <span style={{color: '#A9A6BF'}}>Ask FansaChat to automate something…</span> : PROMPT.slice(0, n)}
                    <span style={{display: 'inline-block', width: 3, height: 38, marginLeft: 2, verticalAlign: 'middle', background: caret ? C.lav : 'transparent'}} />
                  </>
                )}
                <div style={{position: 'absolute', right: 20, bottom: 20, width: 70, height: 70, borderRadius: 35, background: n >= PROMPT.length ? C.lav : '#D9D6EC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - Math.max(0, 1 - Math.abs(f - send) / 4) * 0.15})`}}>
                  <svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: bx + 8, top: by + bh + 10, fontFamily: UI, fontWeight: 500, fontSize: 18, color: '#9C99B3', opacity: rise}}>product illustration</div>
    </AbsoluteFill>
  );
};

// ---------- 5 · Build: nodes bloom + connectors ----------
const bez = (p: number[][], t: number) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
};
const NODES = [
  {icon: 'mail' as const, app: 'Gmail', what: 'New email with an invoice'},
  {icon: 'sheet' as const, app: 'Google Sheets', what: 'Add a row'},
  {icon: 'send' as const, app: 'Telegram', what: 'Send me a message'},
];
const Build: React.FC = () => {
  const F = SCENES.build[0];
  const f = useCurrentFrame();
  const {W, H, wide} = useLayout();
  const tn = [at(18.8, F), at(19.7, F), at(20.6, F)];
  const ok = at(21.8, F);
  const nw = wide ? 440 : 800;
  const nh = wide ? 190 : 156;
  const centers = wide ? [[400, 470], [960, 470], [1520, 470]] : [[540, 330], [540, 570], [540, 810]];
  const cam = ease(f, 0, 150, 1.06, 1);
  const paths = [0, 1].map((i) => {
    const [a, b] = [centers[i], centers[i + 1]];
    return wide
      ? [[a[0] + nw / 2, a[1]], [a[0] + nw / 2 + 60, a[1]], [b[0] - nw / 2 - 60, b[1]], [b[0] - nw / 2, b[1]]]
      : [[a[0], a[1] + nh / 2], [a[0], a[1] + nh / 2 + 40], [b[0], b[1] - nh / 2 - 40], [b[0], b[1] - nh / 2]];
  });
  const runP = sp(f, ok - 8, 14, 180);
  return (
    <AbsoluteFill style={{transform: `scale(${cam})`}}>
      <Rise at={2} dy={20} style={{position: 'absolute', left: 0, right: 0, top: wide ? 150 : 110, display: 'flex', justifyContent: 'center'}}>
        <Chip size={wide ? 28 : 26} bg={C.lav} color="#fff">“When a client emails me an invoice…”</Chip>
      </Rise>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {paths.map((p, i) => {
          const d = `M${p[0]} C${p[1]} ${p[2]} ${p[3]}`;
          const dr = ease(f, tn[i + 1] - 6, tn[i + 1] + 8);
          return (
            <g key={i}>
              <path d={d} pathLength={1} fill="none" stroke={C.lav} strokeWidth={5} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - dr} />
              {dr >= 1 && [0, 0.5].map((o) => {
                const [x, y] = bez(p, ((f / 24 + o) % 1));
                return <circle key={o} cx={x} cy={y} r={9} fill={C.orange} />;
              })}
            </g>
          );
        })}
      </svg>
      {NODES.map((nd, i) => {
        const s = sp(f, tn[i], 11, 190);
        const ring = ease(f, tn[i], tn[i] + 18);
        const done = sp(f, ok + i * 4, 12, 220);
        const [x, y] = centers[i];
        return (
          <div key={nd.app} style={{position: 'absolute', left: x - nw / 2, top: y - nh / 2, width: nw, height: nh, opacity: Math.min(1, s * 2), transform: `scale(${0.4 + 0.6 * s})`}}>
            <div style={{position: 'absolute', inset: -ring * 40, borderRadius: 30 + ring * 40, border: `3px solid rgba(100,104,216,${0.5 * (1 - ring)})`}} />
            <div style={{...plate, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', borderRadius: 30, border: `3px solid ${C.lavSoft}`}}>
              <AppIcon kind={nd.icon} size={wide ? 92 : 84} />
              <div>
                <div style={{fontFamily: UI, fontWeight: 700, fontSize: 20, color: C.lav, letterSpacing: '0.08em'}}>STEP {i + 1}{i === 0 ? ' · TRIGGER' : ''}</div>
                <div style={{fontFamily: HEAVY, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: '-0.03em'}}>{nd.app}</div>
                <div style={{fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.sub}}>{nd.what}</div>
              </div>
            </div>
            <div style={{position: 'absolute', right: -14, top: -14, width: 48, height: 48, borderRadius: 24, background: C.green, transform: `scale(${done})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(31,164,99,.35)'}}>
              <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: wide ? 680 : 960, display: 'flex', justifyContent: 'center', opacity: Math.min(1, runP * 2), transform: `scale(${0.6 + 0.4 * runP})`}}>
        <Chip size={34} bg={f >= ok ? C.green : C.ink} color="#fff">{f >= ok ? '✓  Test run succeeded' : '▶  Run test'}</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6 · Stats: orbit hub + counters ----------
const KINDS = ['mail', 'sheet', 'send', 'chat', 'doc', 'cal', 'cart', 'db', 'sheet', 'mail', 'chat', 'doc'] as const;
const Stats: React.FC = () => {
  const F = SCENES.stats[0];
  const f = useCurrentFrame();
  const {wide} = useLayout();
  const [cx, cy] = wide ? [560, 520] : [540, 380];
  const R1 = wide ? 340 : 280;
  const R2 = wide ? 215 : 178;
  const tc = [at(24.0, F), at(26.5, F), at(29.2, F)];
  const stats = [
    {n: 700, plus: true, label: 'integrations'},
    {n: 22, label: 'verified MCP servers'},
    {n: 478, label: 'templates'},
  ];
  const hub = sp(f, 0, 12, 160);
  const rot = f * 0.35;
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R1} fill="none" stroke="rgba(100,104,216,.22)" strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${rot} ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={R2} fill="none" stroke="rgba(100,104,216,.28)" strokeWidth={2} />
        {Array.from({length: 22}, (_, i) => {
          const a = ((i / 22) * 360 - rot * 1.6) * (Math.PI / 180);
          const lit = f >= tc[1] + i * 2;
          return <circle key={i} cx={cx + Math.cos(a) * R2} cy={cy + Math.sin(a) * R2} r={lit ? 11 : 6} fill={lit ? C.lav : 'rgba(100,104,216,.25)'} />;
        })}
      </svg>
      {KINDS.map((k, i) => {
        const a = ((i / KINDS.length) * 360 + rot) * (Math.PI / 180);
        const s = sp(f, 4 + i * 2, 12, 200);
        return (
          <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * R1 - 38, top: cy + Math.sin(a) * R1 - 38, transform: `scale(${s})`,
            filter: 'drop-shadow(0 8px 14px rgba(30,27,58,.12))'}}>
            <AppIcon kind={k} size={76} />
          </div>
        );
      })}
      {f >= tc[2] && Array.from({length: 14}, (_, i) => {
        const p = ease(f, tc[2], tc[2] + 30);
        const a = (i / 14) * Math.PI * 2 + 0.3;
        return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * p * (R1 + 120) - 26, top: cy + Math.sin(a) * p * (R1 + 120) - 18, width: 52, height: 36, borderRadius: 8,
          background: i % 3 ? '#fff' : C.peach, border: `2px solid ${C.lavSoft}`, opacity: 1 - ease(f, tc[2] + 18, tc[2] + 40), transform: `rotate(${a * 57}deg) scale(${p})`}} />;
      })}
      <div style={{position: 'absolute', left: cx - 130, top: cy - 130, width: 260, height: 260, borderRadius: 130, background: '#fff', transform: `scale(${hub})`,
        boxShadow: `0 0 0 ${14 + Math.sin(f / 10) * 6}px rgba(100,104,216,.12), 0 30px 70px rgba(100,104,216,.30)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={LOGO} style={{width: 190, height: 190}} />
      </div>
      {stats.map((s, i) => {
        const p = sp(f, tc[i], 14, 170);
        const v = Math.round(interpolate(f, [tc[i], tc[i] + 26], [0, s.n], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)}));
        const style: React.CSSProperties = wide
          ? {left: 1040, top: 210 + i * 230, width: 760, height: 190}
          : {left: 70, top: 730 + i * 160, width: 940, height: 136};
        return (
          <div key={i} style={{...plate, position: 'absolute', ...style, display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px', boxSizing: 'border-box',
            opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 160}px)`, border: f >= tc[i] && (i === 2 || f < tc[i + 1]) ? `3px solid ${C.lav}` : '3px solid transparent'}}>
            <div style={{fontFamily: HEAVY, fontWeight: 800, fontSize: wide ? 120 : 96, color: C.ink, letterSpacing: '-0.05em', minWidth: wide ? 270 : 230}}>
              {v}{s.plus && <span style={{color: C.orange}}>+</span>}
            </div>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: wide ? 42 : 38, color: C.sub, lineHeight: 1.1}}>{s.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 7 · Origin: Bangladesh map, Dhaka pin, "#1 first" ----------
const MapScene: React.FC = () => {
  const F = SCENES.map[0];
  const f = useCurrentFrame();
  const {wide} = useLayout();
  const mh = wide ? 800 : 560;
  const sc = mh / BD_H;
  const mw = BD_W * sc;
  const mx = wide ? 300 : 540 - mw / 2;
  const my = wide ? 140 : 110;
  const draw = ease(f, 4, 52);
  const fill = ease(f, 36, 66);
  const pinAt = at(34.4, F);
  const pin = sp(f, pinAt, 9, 200);
  const px = mx + DHAKA.x * sc;
  const py = my + DHAKA.y * sc;
  const orbit = ease(f, 40, 60);
  const arcs = [[-900, -400], [1700, -500], [1900, 500], [-900, 700], [400, -900], [1400, 1500]];
  const arcP = ease(f, at(34.1, F), at(35.2, F));
  const arcO = 1 - ease(f, at(36.6, F), at(37.6, F));
  const stamp = at(36.9, F);
  const st = sp(f, stamp, 9, 260);
  const badge = sp(f, at(35.3, F), 15, 150);
  const fs = wide ? 62 : 58;
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="bdFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6E6FB" />
            <stop offset="100%" stopColor="#FFD9C7" />
          </linearGradient>
        </defs>
        <g opacity={orbit} transform={`rotate(${f * 0.4} ${mx + mw / 2} ${my + mh / 2})`}>
          <circle cx={mx + mw / 2} cy={my + mh / 2} r={mh * 0.58} fill="none" stroke="rgba(100,104,216,.25)" strokeWidth={2} strokeDasharray="4 12" />
          {[0, 90, 180, 270].map((a) => (
            <circle key={a} cx={mx + mw / 2 + Math.cos((a * Math.PI) / 180) * mh * 0.58} cy={my + mh / 2 + Math.sin((a * Math.PI) / 180) * mh * 0.58} r={9} fill={C.peach} />
          ))}
        </g>
        <g transform={`translate(${mx} ${my}) scale(${sc})`}>
          {BD_PATHS.map((d, i) => <path key={'g' + i} d={d} fill="none" stroke="rgba(100,104,216,.18)" strokeWidth={22 / sc} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} strokeLinejoin="round" />)}
          {BD_PATHS.map((d, i) => <path key={'f' + i} d={d} fill="url(#bdFill)" opacity={fill} />)}
          {BD_PATHS.map((d, i) => <path key={'s' + i} d={d} fill="none" stroke={C.lav} strokeWidth={4.5 / sc} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} strokeLinejoin="round" />)}
        </g>
        {arcO > 0 && arcs.map(([tx, ty], i) => {
          const mxp = (px + tx) / 2 + (ty - py) * 0.25;
          const myp = (py + ty) / 2 - (tx - px) * 0.25;
          return <path key={i} d={`M${px} ${py} Q${mxp} ${myp} ${tx} ${ty}`} pathLength={1} fill="none" stroke={i % 2 ? C.coral : C.lav} strokeWidth={3.5}
            strokeDasharray="1" strokeDashoffset={1 - ease(arcP, i * 0.08, 0.6 + i * 0.08)} opacity={arcO * 0.8} strokeLinecap="round" />;
        })}
        {f >= pinAt && [0, 1, 2].map((k) => {
          const ph = ((f - pinAt + k * 15) % 45) / 45;
          return <circle key={k} cx={px} cy={py} r={14 + ph * 70} fill="none" stroke={C.orange} strokeWidth={3} opacity={(1 - ph) * 0.7} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: px - 22, top: py - 66 - (1 - pin) * 140, opacity: f >= pinAt ? 1 : 0}}>
        <svg width="44" height="66" viewBox="0 0 44 66"><path d="M22 64C22 64 2 38 2 22a20 20 0 0 1 40 0c0 16-20 42-20 42z" fill={C.orange} stroke="#fff" strokeWidth="3" /><circle cx="22" cy="22" r="8" fill="#fff" /></svg>
      </div>
      <Rise at={pinAt + 8} dy={14} style={{position: 'absolute', left: px + 34, top: py - 30}}>
        <Chip size={24} bg={C.ink} color="#fff">Dhaka</Chip>
      </Rise>
      <div style={{position: 'absolute', left: wide ? 960 : 60, top: wide ? 150 : 720, width: wide ? 880 : 960, display: 'flex', flexDirection: 'column', alignItems: wide ? 'flex-start' : 'center', gap: wide ? 40 : 26}}>
        <Words size={wide ? 70 : 60} maxWidth={wide ? 880 : 960} align={wide ? 'flex-start' : 'center'} words={[
          {w: 'Built', at: at(33.05, F)}, {w: 'from', at: at(33.3, F)}, {w: 'Bangladesh,', at: at(33.5, F)},
          {w: 'for', at: at(34.15, F), br: true}, {w: 'the', at: at(34.3, F)}, {w: 'world.', at: at(34.45, F), serif: true},
        ]} />
        <div style={{...plate, borderRadius: 40, padding: wide ? '40px 44px' : '30px 34px', display: 'flex', alignItems: 'center', gap: wide ? 36 : 28, width: '100%', boxSizing: 'border-box',
          opacity: Math.min(1, badge * 2), transform: `translateY(${(1 - badge) * 60}px)`, border: `3px solid ${C.lavSoft}`}}>
          <div style={{flexShrink: 0, width: wide ? 190 : 150, height: wide ? 190 : 150, borderRadius: '50%', background: C.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: HEAVY, fontWeight: 800, fontSize: wide ? 96 : 76, letterSpacing: '-0.05em', opacity: f >= stamp ? 1 : 0, transform: `scale(${2 - st}) rotate(${(1 - st) * -25}deg)`,
            boxShadow: '0 18px 40px rgba(255,90,31,.35)'}}>#1</div>
          <div>
            <Rise at={at(35.35, F)} dy={14}><div style={{fontFamily: UI, fontWeight: 700, fontSize: wide ? 28 : 24, color: C.lav, letterSpacing: '0.06em'}}>FANSACHAT IS</div></Rise>
            <Words size={fs} maxWidth={wide ? 560 : 680} align="flex-start" style={{marginTop: 10}} words={[
              {w: 'Bangladesh’s', at: at(36.1, F)}, {w: 'first', at: at(36.8, F), color: C.orange},
              {w: 'plain-English', at: at(37.3, F), serif: true}, {w: 'workflow', at: at(37.9, F)}, {w: 'automation', at: at(38.4, F)}, {w: 'tool.', at: at(39.3, F)},
            ]} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 8 · Founder line ----------
const Founder: React.FC = () => {
  const F = SCENES.founder[0];
  const f = useCurrentFrame();
  const {wide} = useLayout();
  const size = wide ? 124 : 104;
  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46}}>
      <Rise at={at(42.3, F)} dy={20}>
        <Chip size={32} style={{gap: 16}}>
          <svg width="34" height="34" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.5" fill={C.lav} /><path d="M3.5 21c1-4.5 4.4-7 8.5-7s7.5 2.5 8.5 7z" fill={C.lav} /></svg>
          Made by a solo founder
        </Chip>
      </Rise>
      <div style={{position: 'relative'}}>
        <Words size={size} maxWidth={wide ? 1600 : 960} words={[
          {w: 'For', at: at(43.75, F)}, {w: 'teams', at: at(43.95, F)}, {w: 'who’d', at: at(44.2, F)}, {w: 'rather', at: at(44.4, F)},
          {w: 'say it,', at: at(44.8, F), serif: true}, {w: 'than', at: at(45.3, F)}, {w: 'build', at: at(45.5, F), color: C.sub, strike: ease(f, at(45.95, F), at(46.2, F))}, {w: 'it.', at: at(45.7, F), color: C.sub, strike: ease(f, at(46.15, F), at(46.35, F))},
        ]} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 9 · CTA: 3D card logo reveal ----------
const Cta: React.FC = () => {
  const F = SCENES.cta[0];
  const f = useCurrentFrame();
  const {W, wide} = useLayout();
  const flip = sp(f, 0, 13, 90);
  const cs = wide ? 440 : 330;
  const [ccx, ccy] = wide ? [560, 470] : [540, 280];
  const sweep = ease(f, 26, 56, -60, 160);
  const bob = Math.sin(f / 20) * 8;
  const click = at(51.4, F);
  const press = Math.max(0, 1 - Math.abs(f - click) / 5);
  const curP = ease(f, click - 26, click - 2);
  const btn = sp(f, at(49.7, F), 13, 200);
  const colX = wide ? 900 : 0;
  const colW = wide ? 960 : W;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: ccx - cs / 2, top: ccy - cs / 2 + bob, width: cs, height: cs, perspective: 1600}}>
        <div style={{width: '100%', height: '100%', borderRadius: cs * 0.18, background: 'linear-gradient(145deg,#fff,#F4F2FF)', overflow: 'hidden', position: 'relative',
          boxShadow: '0 50px 100px rgba(100,104,216,.30), 0 0 0 3px rgba(255,255,255,.9) inset',
          transform: `rotateY(${(1 - flip) * -110}deg) rotateX(${(1 - flip) * 18 + Math.sin(f / 30) * 3}deg) scale(${0.7 + 0.3 * flip})`}}>
          <Img src={LOGO} style={{position: 'absolute', inset: cs * 0.1, width: cs * 0.8, height: cs * 0.8}} />
          <div style={{position: 'absolute', top: -cs, bottom: -cs, left: `${sweep}%`, width: cs * 0.3, transform: 'rotate(20deg)', background: 'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0))'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: colX, top: wide ? 250 : 520, width: colW, display: 'flex', flexDirection: 'column', alignItems: wide ? 'flex-start' : 'center', gap: wide ? 30 : 26}}>
        <Wordmark start={at(46.95, F)} size={wide ? 150 : 128} />
        <Rise at={at(47.5, F)} dy={16}><div style={{fontFamily: UI, fontWeight: 500, fontSize: wide ? 38 : 34, color: C.sub}}>AI workflow automation in plain English</div></Rise>
        <Rise at={at(47.95, F)} dy={20} scale>
          <Chip size={wide ? 40 : 38} bg={C.lav} color="#fff">from <span style={{fontFamily: HEAVY, fontWeight: 800, fontSize: wide ? 54 : 50}}>$15</span>/mo</Chip>
        </Rise>
        <div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', gap: 22, marginTop: 10}}>
          <div style={{transform: `scale(${btn * (1 - press * 0.06)})`, position: 'relative'}}>
            <Chip size={wide ? 44 : 42} bg={C.orange} color="#fff" style={{boxShadow: '0 18px 40px rgba(255,90,31,.35)'}}>Join the waitlist →</Chip>
            {f >= click && <div style={{position: 'absolute', left: '50%', top: '50%', width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: 15,
              border: `4px solid ${C.orange}`, transform: `scale(${1 + ease(f, click, click + 18) * 12})`, opacity: 1 - ease(f, click, click + 18)}} />}
          </div>
          <Rise at={at(51.0, F)} dy={16}><Chip size={wide ? 40 : 38} style={{border: `3px solid ${C.lavSoft}`}}>fansachat.com</Chip></Rise>
        </div>
      </div>
      {f > click - 28 && (
        <div style={{position: 'absolute', left: (wide ? 1100 : 560) + (1 - curP) * 300, top: (wide ? 720 : 960) + (1 - curP) * 200 + press * 4, opacity: 1 - ease(f, click + 20, click + 30)}}>
          <svg width="46" height="56" viewBox="0 0 20 24"><path d="M2 2 L2 19 L7 14 L10 21 L13 20 L10 13 L17 13 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" /></svg>
        </div>
      )}
      <Rise at={at(52.4, F)} dy={10} style={{position: 'absolute', left: 0, right: 0, bottom: wide ? 70 : 110, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: wide ? 26 : 24, color: C.sub, background: 'rgba(255,255,255,.85)', padding: '10px 26px', borderRadius: 999, textAlign: 'center'}}>
          Bangladesh’s first workflow automation tool · built by a solo founder
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

// ---------- Captions: word-synced pill (OpusClip-style keyword highlight) ----------
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {H, wide} = useLayout();
  const t = f / 30;
  for (const k of CAPTIONED) {
    const v = VO[k];
    if (t < v.at - 0.05 || t > v.at + v.dur + 0.3) continue;
    const words = v.text.split(' ');
    const wts = words.map((w) => w.replace(/[^\w]/g, '').length + 2);
    const tot = wts.reduce((a, b) => a + b, 0);
    let acc = 0;
    const starts = wts.map((w) => {
      const s = v.at + (acc / tot) * v.dur;
      acc += w;
      return s;
    });
    let cur = starts.findIndex((s, i) => t >= s && (i === starts.length - 1 || t < starts[i + 1]));
    if (cur < 0) cur = t < starts[0] ? 0 : words.length - 1;
    const g0 = Math.floor(cur / 4) * 4;
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: wide ? H - 140 : H - 210, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', gap: 10, padding: '12px 18px', borderRadius: 22, background: 'rgba(255,255,255,.96)', boxShadow: '0 14px 40px rgba(30,27,58,.14)'}}>
          {words.slice(g0, g0 + 4).map((w, i) => (
            <span key={g0 + i} style={{fontFamily: UI, fontWeight: 700, fontSize: wide ? 44 : 46, padding: '4px 12px', borderRadius: 12,
              color: g0 + i === cur ? '#fff' : C.ink, background: g0 + i === cur ? C.lav : 'transparent'}}>{w}</span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const Intro: React.FC = () => (
  <AbsoluteFill style={{background: C.cream}}>
    <Scene from={SCENES.hook[0]} to={SCENES.hook[1]}><Hook /></Scene>
    <Scene from={SCENES.pain[0]} to={SCENES.pain[1]} enter="whip" tint="peach"><Pain /></Scene>
    <Scene from={SCENES.meet[0]} to={SCENES.meet[1]} enter="iris"><Meet /></Scene>
    <Scene from={SCENES.type[0]} to={SCENES.type[1]} enter="zoom" tint="peach"><Type /></Scene>
    <Scene from={SCENES.build[0]} to={SCENES.build[1]} enter="zoom"><Build /></Scene>
    <Scene from={SCENES.stats[0]} to={SCENES.stats[1]} enter="whip" tint="peach"><Stats /></Scene>
    <Scene from={SCENES.map[0]} to={SCENES.map[1]} enter="iris" origin={[30, 50]}><MapScene /></Scene>
    <Scene from={SCENES.founder[0]} to={SCENES.founder[1]} enter="whip" tint="peach"><Founder /></Scene>
    <Scene from={SCENES.cta[0]} to={SCENES.cta[1]} enter="zoom"><Cta /></Scene>
    <Captions />
    <Html5Audio src={staticFile('intro/intro_mix.m4a')} />
  </AbsoluteFill>
);
