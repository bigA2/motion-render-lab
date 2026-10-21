// The "say it, FansaChat builds it" scene: sentence types into the composer, keywords fly out and land as app nodes,
// connectors run OUTSIDE the cards, Approve & Run lights the rows green. Drawn in the 900x860 visual canvas.
import React from 'react';
import {Easing} from 'remotion';
import {Cursor, glass} from '../intro28/kit';
import {TL} from './timeline';
import {card, CRASH, ez, FONT, GREEN, INK, LO, lerp, Orb, PERI, PERI_D, Pill, settle, textW, Tile, VH, wrap} from './ui';

export type NodeSpec = {app: string; name: string; action: string; done: string};
const CW = 860, CX = 20, TXT = 40, LH = 56, PADX = 40, PADY = 36;
const LIFT_S = 0.58;

// all cue frames of a compose act, LOCAL to the act (shared with the audio mix)
export const composeTimes = (a: any, tl: TL) => {
  const st: number = a.start; const rel = (abs: number) => abs - st;
  const n = a.nodes.length;
  const tType = a.typeFrom ? rel(tl.w(a.typeLine, a.typeFrom)) : rel(tl.S[a.typeLine]);
  const tEnd = Math.max(tType + 30, rel(tl.lineEnd(a.typeLine)) - 8);
  const send = tEnd + 4, lift = send + 6, think = lift + 6, reply = lift + 20, nodesAt = lift + 24;
  const ready = nodesAt + 7 * n + 10;
  const runF = a.runAt ? Math.max(ready, rel(tl.w(a.runAt[0], a.runAt[1])) - 2) : ready;
  const step = a.litStep ?? (a.runAt ? 12 : 7);
  const lit = a.nodes.map((_: unknown, i: number) => runF + 10 + step * i);
  const done = lit[n - 1] + 12;
  return {tType, tEnd, send, lift, think, reply, nodesAt, ready, runF, lit, done};
};

export const Compose: React.FC<{f: number; a: any; tl: TL}> = ({f, a, tl}) => {
  const nodes: NodeSpec[] = a.nodes; const n = nodes.length; const sentence: string = a.sentence;
  const T = composeTimes(a, tl);
  const top = a.tag ? 112 : 0;
  const lines = wrap(sentence, CW - 2 * PADX - 8, TXT);
  const chatH = PADY * 2 + lines.length * LH + 64;
  const top0 = Math.max(top + 30, (VH - chatH) / 2 - 10);
  const cps = sentence.length / Math.max(30, T.tEnd - T.tType);
  const typed = Math.max(0, Math.min(sentence.length, Math.floor((f - T.tType) * cps)));
  const liftK = ez(f, T.lift, T.lift + 20, CRASH);
  const press = Math.max(0, 1 - Math.abs(f - T.send) / 5), runPress = Math.max(0, 1 - Math.abs(f - T.runF) / 5);
  const ty = lerp(top0, top, liftK), sc = lerp(1, LIFT_S, liftK);
  const inK = a.flipIn ? ez(f, 0, 14) : ez(f, -6, 10);
  const replyY = top + chatH * LIFT_S + 16;
  const nodesTop = replyY + 66, avail = VH - nodesTop - 6, gap = 26;
  const nodeH = Math.min(170, (avail - (n - 1) * gap) / n), dense = nodeH < 140;
  const nodeX = 16, nodeW = 800, nodeY = (i: number) => nodesTop + i * (nodeH + gap);
  const ran = f >= T.runF, allDone = f >= T.done;
  // sentence layout (chat-local), keyword boxes
  let used = 0; const L = lines.map((l) => { const start = used; used += l.length + 1; return {l, start}; });
  const kwPos = (a.kw ?? []).map((k: {kw: string; node: number}) => { const li = L.findIndex((x) => x.l.includes(k.kw)); if (li < 0) return null;
    return {...k, li, idx: L[li].l.indexOf(k.kw), x: PADX + textW(L[li].l.slice(0, L[li].l.indexOf(k.kw)), TXT), w: textW(k.kw, TXT)}; }).filter(Boolean) as any[];
  const tileS = dense ? 70 : 92;
  const sendX = CX + CW - 24 - 76 / 2, sendY = top0 + chatH - 24 - 76 / 2;
  const pillX = CX + CW - 150, pillY = replyY + 24;

  return <>
    {a.tag ? <div style={{position: 'absolute', left: CX, top: 0, width: CW, height: 92, display: 'flex', alignItems: 'center', gap: 26, opacity: ez(f, -6, 12), transform: `translateY(${(1 - ez(f, -6, 12)) * -16}px)`}}>
      <div style={{fontFamily: FONT.clash, fontWeight: 600, fontSize: 84, color: PERI_D, letterSpacing: '-0.03em', lineHeight: 1}}>{a.tag.n}</div>
      <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: 52, color: INK, whiteSpace: 'nowrap'}}>{a.tag.t}</div>
    </div> : null}
    {/* the composer */}
    <div style={{position: 'absolute', left: CX, top: ty, width: CW, height: chatH, transform: `scale(${sc * lerp(0.94, 1, inK)}, ${sc * lerp(0.94, 1, inK)}) ${a.flipIn ? `scaleX(${Math.max(0.02, inK)})` : ''}`, transformOrigin: '50% 0', opacity: Math.max(0.0, Math.min(1, inK * 1.6))}}>
      <div style={{...glass('rgba(255,255,255,0.55)'), position: 'absolute', inset: 0, borderRadius: 44, background: 'linear-gradient(100deg, rgba(232,233,251,0.95), rgba(253,236,231,0.95))', border: '1.5px solid rgba(255,255,255,0.98)'}} />
      {typed === 0 ? <div style={{position: 'absolute', left: PADX, top: PADY, height: LH, display: 'flex', alignItems: 'center', fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT, color: LO}}>Describe a workflow…{f < T.tType && Math.floor(f / 8) % 2 === 0 ? <span style={{width: 4, height: TXT, background: PERI_D, marginLeft: 6, borderRadius: 2}} /> : null}</div> : null}
      {L.map(({l, start}, li) => { const m = Math.min(l.length, Math.max(0, typed - start)); if (m <= 0) return null;
        const segs: React.ReactNode[] = []; let pos = 0;
        (a.kw ?? []).forEach((k: {kw: string}, ki: number) => { const fi = l.indexOf(k.kw); if (fi < 0 || fi >= m || fi < pos) return; const end = Math.min(m, fi + k.kw.length);
          const fly = kwPos.find((p: any) => p.kw === k.kw); const away = fly ? ez(f, T.nodesAt + 7 * fly.node - 8, T.nodesAt + 7 * fly.node) : 0;
          segs.push(<span key={'a' + ki}>{l.slice(pos, fi)}</span>);
          segs.push(<span key={'k' + ki} style={{background: 'rgba(100,104,216,0.18)', color: PERI_D, borderRadius: 10, boxShadow: '0 0 0 4px rgba(100,104,216,0.18)', opacity: 1 - 0.75 * away}}>{l.slice(fi, end)}</span>); pos = end; });
        segs.push(<span key="z">{l.slice(pos, m)}</span>);
        const cur = L.findIndex((x, j) => j === L.length - 1 || typed < L[j + 1].start);
        const caret = li === cur && f < T.send && Math.floor(f / 8) % 2 === 0;
        return <div key={li} style={{position: 'absolute', left: PADX, top: PADY + li * LH, height: LH, fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT, color: INK, whiteSpace: 'pre', display: 'flex', alignItems: 'center'}}>{segs}{caret ? <span style={{width: 4, height: TXT * 1.05, background: PERI_D, marginLeft: 3, borderRadius: 2}} /> : null}</div>; })}
      <div style={{position: 'absolute', right: 24, bottom: 24, width: 76, height: 76, borderRadius: 999, background: typed > 0 ? PERI_D : 'transparent', border: `2px solid ${typed > 0 ? PERI_D : '#2B2734'}`, color: typed > 0 ? '#fff' : INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.ui, fontWeight: 700, fontSize: 38, transform: `scale(${1 - 0.1 * press})`}}>↑</div>
    </div>
    {/* agent: Thinking… shimmer -> reply + Approve & Run */}
    {f >= T.think ? (() => { const kT = ez(f, T.think, T.think + 8) * (1 - ez(f, T.reply - 2, T.reply + 6)); const kR = ez(f, T.reply, T.reply + 12); const sh = ((f - T.think) * 14) % 700;
      return <div style={{position: 'absolute', left: CX + 6, top: replyY, width: CW, height: 56, display: 'flex', alignItems: 'center', gap: 14}}>
        <Orb s={24} />
        {kT > 0.01 ? <span style={{position: 'absolute', left: 38, opacity: kT, fontFamily: FONT.ui, fontWeight: 600, fontSize: 32, backgroundImage: `linear-gradient(90deg, ${LO} 0px, ${LO} ${sh - 120}px, ${PERI} ${sh}px, ${LO} ${sh + 120}px, ${LO} 900px)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>Thinking…</span> : null}
        <span style={{opacity: kR, transform: `translateY(${(1 - kR) * 12}px)`, fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: LO, whiteSpace: 'nowrap'}}>Here it is — {n} steps.</span>
        <div style={{marginLeft: 'auto', opacity: kR, transform: `scale(${(1 - 0.08 * runPress)})`, transformOrigin: '100% 50%'}}>
          <Pill size={28} bg={allDone ? GREEN : ran ? PERI_D : '#fff'} fg={ran || allDone ? '#fff' : INK}>{allDone ? '✓ Done' : '▷ Approve & Run'}</Pill>
        </div>
      </div>; })() : null}
    {/* connectors: arcs OUTSIDE the cards (right edge to right edge) */}
    <svg width={900} height={VH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {nodes.slice(0, -1).map((_, i) => { const k = ez(f, T.nodesAt + 7 * i + 10, T.nodesAt + 7 * i + 24); const x = nodeX + nodeW, y1 = nodeY(i) + nodeH * 0.7, y2 = nodeY(i + 1) + nodeH * 0.3; const on = f >= T.lit[i + 1];
        return k <= 0 ? null : <g key={i}><path d={`M${x} ${y1} C ${x + 52} ${y1}, ${x + 52} ${y2}, ${x} ${y2}`} fill="none" stroke={on ? GREEN : '#2B2734'} strokeWidth={4} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" />
          <circle cx={x} cy={y2} r={8} fill={on ? GREEN : '#2B2734'} opacity={k >= 0.98 ? 1 : 0} /></g>; })}
    </svg>
    {/* node cards */}
    {nodes.map((nd, i) => { const at = T.nodesAt + 7 * i + 4; if (f < at - 1) return null;
      const k = settle(f, at, 16), lit = f >= T.lit[i], sweep = ez(f, T.lit[i], T.lit[i] + 10), tileK = ez(f, at + 8, at + 18);
      return <div key={i} style={{position: 'absolute', left: nodeX, top: nodeY(i), width: nodeW, height: nodeH, opacity: Math.min(1, k * 1.8), transform: `translateY(${(1 - k) * 46}px) scale(${0.95 + 0.05 * k})`}}>
        <div style={card({inset: 0, borderRadius: 38, border: `2px solid ${lit ? GREEN : 'rgba(255,255,255,0.95)'}`})} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`, borderRadius: 38, background: 'rgba(47,182,124,0.10)'}} />
        <div style={{position: 'absolute', inset: 0, padding: `0 ${dense ? 74 : 84}px 0 ${dense ? 26 : 32}px`, display: 'flex', alignItems: 'center', gap: dense ? 20 : 26}}>
          <div style={{opacity: tileK}}><Tile k={nd.app} size={tileS} on={lit} /></div>
          <div style={{minWidth: 0}}>
            <div style={{fontFamily: FONT.sora, fontWeight: 600, fontSize: dense ? 38 : 46, color: INK, lineHeight: 1.12}}>{nd.name}</div>
            <div style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: dense ? 27 : 31, lineHeight: 1.22, color: lit ? '#1F8F60' : LO, marginTop: 3}}>{lit ? nd.done : nd.action}</div>
          </div>
          <div style={{position: 'absolute', right: 22, top: dense ? 14 : 20, width: 44, height: 44, borderRadius: 99, background: lit ? GREEN : PERI_D, color: '#fff', fontFamily: FONT.ui, fontWeight: 700, fontSize: 25, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{lit ? '✓' : i + 1}</div>
        </div>
      </div>; })}
    {/* signature: typed keywords fly out of the sentence and land as the node icons */}
    {kwPos.map((p: any) => { const t0 = T.nodesAt + 7 * p.node - 8, k = ez(f, t0, t0 + 18, Easing.inOut(Easing.cubic)); if (f < t0 || k >= 1) return null;
      const sx = CX + CW / 2 + (p.x + p.w / 2 - CW / 2) * LIFT_S, sy = top + (PADY + p.li * LH + LH / 2) * LIFT_S;
      const tx = nodeX + (dense ? 26 : 32) + tileS / 2, tyy = nodeY(p.node) + nodeH / 2;
      const x = lerp(sx, tx, k), y = lerp(sy, tyy, k) - Math.sin(k * Math.PI) * 60, w = lerp(p.w * LIFT_S + 14, tileS, k), h = lerp(LH * LIFT_S, tileS, k);
      return <div key={p.kw} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: lerp(8, tileS * 0.28, k), background: k > 0.6 ? '#F1EFF8' : 'rgba(100,104,216,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `blur(${Math.sin(k * Math.PI) * 4}px)`, overflow: 'hidden'}}>
        {k < 0.55 ? <span style={{fontFamily: FONT.ui, fontWeight: 500, fontSize: TXT * LIFT_S, color: PERI_D, opacity: 1 - k * 1.8, whiteSpace: 'nowrap'}}>{p.kw}</span> : <Tile k={nodes[p.node].app} size={Math.min(w, h)} />}
      </div>; })}
    {/* cursor: presses Send, later presses Approve & Run */}
    {f >= T.tEnd - 18 && f < T.lift + 16 ? (() => { const k = ez(f, T.tEnd - 18, T.send - 2, Easing.inOut(Easing.cubic)), lv = ez(f, T.send + 4, T.lift + 16, Easing.in(Easing.cubic));
      return <Cursor x={lerp(900, sendX - 8, k) + lv * 120} y={lerp(sendY + 260, sendY - 8, k) + lv * 200} rot={-12 + (1 - k) * 18} hover={ez(f, T.send - 8, T.send - 2)} press={press} s={1.7} />; })() : null}
    {f >= T.runF - 22 && f < T.runF + 24 ? (() => { const k = ez(f, T.runF - 22, T.runF - 3, Easing.inOut(Easing.cubic)), lv = ez(f, T.runF + 4, T.runF + 24, Easing.in(Easing.cubic));
      return <Cursor x={lerp(880, pillX, k) + lv * 100} y={lerp(pillY + 300, pillY + 4, k) + lv * 240} rot={-12 + (1 - k) * 18} hover={ez(f, T.runF - 10, T.runF - 3)} press={runPress} s={1.7} />; })() : null}
  </>;
};
