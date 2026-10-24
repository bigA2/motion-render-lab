# Part 3: per-video hook layout, liquid-glass brand, flow staging, 7 proof mockups, end-card variants, Ad11 wrapper.
import sys
P = 'src/ads/v11/kit.tsx'
s = open(P, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: sys.exit(f'expected {count}, got {n}: {old[:90]!r}')
    s = s.replace(old, new)

# ---- hook: 'stack' (visual above words) | 'side' (visual left, words right) | 'behind' (big faded visual behind words)
rep("""          {hasV && <At x={960} y={hasV ? 380 : 540}><VisView v={p.vis!} u={u} seed={i * 7 + 3} /></At>}
          <At x={960} y={hasV ? 790 : 540}><div style={T(hasV ? 104 : 140)}><Words t={p.text} t0={t} at={ats[i]} hot={p.hot} off={i} /></div></At>""",
"""          {hasV && (lay === 'side' ? <At x={600} y={540}><div style={{transform: 'scale(.9)'}}><VisView v={p.vis!} u={u} seed={i * 7 + 3} /></div></At>
            : lay === 'behind' ? <At x={960} y={430}><div style={{transform: 'scale(1.25)', opacity: 0.55, filter: 'blur(1.5px)'}}><VisView v={p.vis!} u={u} seed={i * 7 + 3} /></div></At>
              : <At x={960} y={380}><VisView v={p.vis!} u={u} seed={i * 7 + 3} /></At>)}
          {lay === 'side' && hasV ? <At x={1390} y={540}><div style={{...T(96), width: 700, whiteSpace: 'normal'}}><Words t={p.text} t0={t} at={ats[i]} hot={p.hot} off={i} style={{maxWidth: 700, justifyContent: 'flex-start'}} /></div></At>
            : <At x={960} y={hasV && lay === 'stack' ? 790 : 540}><div style={{...T(hasV && lay === 'stack' ? 104 : 132), width: 1380, whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.08}}><Words t={p.text} t0={t} at={ats[i]} hot={p.hot} off={i} /></div></At>}""")
rep("  const push = k(t, [0, d], [1.0, 1.05], Easing.linear);", "  const push = k(t, [0, d], [1.0, 1.05], Easing.linear), lay = useTh().hook;")

# ---- brand: liquid-glass search pill + round glass buttons (LiquidGlass clone) for liquid themes ------------------------
rep("      <div style={{position: 'absolute', top: 560 - lift * 120, ...T(54, SUB, FONT)}}><Words t={s.sub} t0={t} at={L + 1.0} hot={['automation', 'autopilot', 'busywork', 'sentence', 'plain-English', 'FansaChat']} /></div>",
"""      {th.liquid ? <div style={{position: 'absolute', top: 520 - lift * 120, display: 'flex', gap: 20, alignItems: 'center', opacity: k(t, [L + 0.8, L + 1.1], [0, 1]), transform: `translateX(${k(t, [L + 0.8, d], [60, -60], Easing.linear)}px)`}}>
        <div style={{...GLASS_LIQUID, width: 820, height: 110, borderRadius: 55, display: 'flex', alignItems: 'center', padding: '0 40px', boxSizing: 'border-box', ...T(38, INK, FONT), overflow: 'hidden'}}>⌕&nbsp;&nbsp;{typed(s.sub, t, L + 1.0, L + 1.0 + s.sub.length * 0.035)}</div>
        {['✎', '◐', '⊕', '⋯'].map((c, j) => { const e = spring({frame: Math.max(0, (t - L - 1.1 - j * 0.08) * 60), fps: 60, config: {damping: 13, stiffness: 160}});
          return <div key={c} style={{...GLASS_LIQUID, width: 110, height: 110, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(40, INK, FONT), transform: `scale(${e})`}}>{c}</div>; })}</div>
        : <div style={{position: 'absolute', top: 560 - lift * 120, ...T(54, SUB, FONT)}}><Words t={s.sub} t0={t} at={L + 1.0} hot={['automation', 'autopilot', 'busywork', 'sentence', 'plain-English', 'FansaChat']} /></div>}
      <div style={{position: 'absolute', left: 1490, top: 250 - lift * 120, width: 150, height: 150, opacity: k(t, [L + 0.3, L + 0.6], [0, 1])}}><Lottie src={lottie('sparkle')} /></div>""")

# ---- flow staging: laptop | land | panel; per-video tilt; cursor Lottie clicks Approve & Run ------------------------------
rep("  const tilt = lap ? k(t, [0, 0.9], [18, 4], IO) : k(t, [0, d], [26, 14], IO), rz = lap ? 0 : k(t, [0, d], [-6, -2], IO);",
    "  const panel = th.stage === 'panel', tilt = lap ? k(t, [0, 0.9], [18, 4], IO) : panel ? k(t, [0, d], [th.tilt, th.tilt * 0.4], IO) : k(t, [0, d], [26, 14], IO), rz = lap ? 0 : panel ? k(t, [0, d], [th.tilt * 0.3, 0], IO) : k(t, [0, d], [-6, -2], IO);")
rep("""            <div style={{padding: '22px 46px', borderRadius: 50, background: interpolateColors(k(t, [runAt + 0.2, runAt + 0.5], [0, 1]), [0, 1], [H0, OK]), ...T(40, '#fff'), boxShadow: '0 20px 50px rgba(30,40,90,.25)'}}>{t < runAt + 0.35 ? (s.button ?? 'Approve & Run') : 'Running ✓'}</div></div>""",
"""            <div style={{padding: '22px 46px', borderRadius: 50, background: interpolateColors(k(t, [runAt + 0.2, runAt + 0.5], [0, 1]), [0, 1], [H0, OK]), ...T(40, '#fff'), boxShadow: '0 20px 50px rgba(30,40,90,.25)'}}>{t < runAt + 0.35 ? (s.button ?? 'Approve & Run') : 'Running ✓'}</div>
            <div style={{position: 'absolute', left: 150, top: 10, width: 130, height: 130, opacity: k(t, [runAt - 0.5, runAt - 0.3, runAt + 0.6, runAt + 0.8], [0, 1, 1, 0]), transform: `translate(${k(t, [runAt - 0.5, runAt], [180, 0], P3)}px, ${k(t, [runAt - 0.5, runAt], [120, 0], P3)}px)`}}><Lottie src={lottie('click')} /></div></div>""")
# flow screen + chat panel follow dark/light ink
rep("background: 'rgba(255,255,255,.97)', boxShadow: lap ? undefined : '0 70px 140px rgba(30,40,90,.18)', border: '1px solid #fff'}} />",
    "background: 'rgba(255,255,255,.97)', boxShadow: lap ? undefined : '0 70px 140px rgba(10,20,60,.22)', border: '1px solid #fff'}} />")

# ---- the 7 proof mockups (replace the shared "Team workspace") -----------------------------------------------------------
PROOF = r'''
// Closing proof scene — a DIFFERENT real-product mockup per video (founder: no shared "Team workspace" in all seven).
const Row: React.FC<{children: React.ReactNode; on?: number; style?: React.CSSProperties}> = ({children, on = 1, style}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginTop: 18, padding: '18px 24px', borderRadius: 18, background: INK === '#0E1222' ? '#F5F7FB' : 'rgba(255,255,255,.06)', opacity: on, transform: `translateY(${(1 - on) * 18}px)`, ...style}}>{children}</div>
);
const Proof: React.FC<P<Extract<Scene, {kind: 'proof'}>>> = ({s, t, d, m}) => {
  const th = useTh(), [H0, H1] = th.hot, v = th.proof;
  const trustAt = Math.max(1.4, Math.min(d - 1.6, m[m.length - 1] > 0.5 ? m[m.length - 1] : d * 0.55));
  const press = k(t, [trustAt + 0.6, trustAt + 0.75, trustAt + 0.9], [1, 0.93, 1], Easing.linear), conn = k(t, [trustAt + 0.9, trustAt + 1.3], [0, 1], IO);
  const rowOn = (i: number) => k(t, [0.5 + i * 0.22, 0.85 + i * 0.22], [0, 1], P3);
  const rows = s.rows.length ? s.rows : [['Workflow approved', 'You'], ['Apps connected', '3'], ['Next run', 'Monday 9:00']] as [string, string][];
  const title: Record<Proof, string> = {dashboard: 'Owner dashboard', approvals: 'Waiting for your approval', history: 'Workflow history', billing: 'Your plan', inbox: 'All leads, one inbox', checklist: 'New client onboarding', report: 'Weekly client report'};
  const body = (() => {
    switch (v) {
      case 'dashboard': return <>
        <div style={{display: 'flex', gap: 18, marginTop: 20}}>{[['Runs today', '1,284'], ['Hours saved', '37'], ['Apps live', '9']].map(([a, b], i) => (
          <div key={a} style={{flex: 1, padding: 22, borderRadius: 20, background: `${[H0, H1, OK][i]}14`, opacity: rowOn(i)}}><div style={T(24, SUB, FONT)}>{a}</div><div style={{...T(56, [H0, H1, OK][i]), marginTop: 8}}>{countUp(b, k(t, [0.6 + i * 0.2, 1.6 + i * 0.2], [0, 1], P3))}</div></div>))}</div>
        <svg width={1030} height={120} style={{marginTop: 18}}><path d="M0 100 C 120 90, 200 40, 320 60 S 520 20, 640 40 S 860 10, 1030 18" fill="none" stroke={H0} strokeWidth={5} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - k(t, [0.8, 2.2], [0, 1], IO))} /></svg></>;
      case 'approvals': return <>{rows.map(([a, b], i) => { const ok = k(t, [1.2 + i * 0.45, 1.5 + i * 0.45], [0, 1]); return <Row key={a} on={rowOn(i)}>
        <span style={{...T(32, INK, FONT), whiteSpace: 'normal'}}>{a}</span><div style={{display: 'flex', alignItems: 'center', gap: 12}}>{ok > 0.5 ? <div style={{width: 56, height: 56}}><Lottie src={lottie('check')} loop={false} /></div> : <Pill c={H0} s={22}>Review</Pill>}<span style={T(24, SUB, FONT)}>{b}</span></div></Row>; })}</>;
      case 'history': return <div style={{position: 'relative', paddingLeft: 40, marginTop: 10}}><div style={{position: 'absolute', left: 14, top: 20, bottom: 10, width: 3, background: `${H0}44`}} />
        {rows.map(([a, b], i) => <Row key={a} on={rowOn(i)} style={{background: i === 0 ? `${H0}14` : undefined}}><div style={{position: 'absolute', marginLeft: -64, width: 22, height: 22, borderRadius: 99, background: i === 0 ? H0 : '#C9CEDC'}} />
          <span style={{...T(32, INK, FONT), whiteSpace: 'normal'}}>{a}</span><span style={T(24, i === 0 ? H0 : SUB, FONT)}>{b}</span></Row>)}</div>;
      case 'billing': { const tiers = [['Starter', '$15'], ['Pro', '$45'], ['Team', '$149'], ['Scale', '$299']]; const sel = Math.min(3, Math.floor(k(t, [0.6, 2.2], [0, 1.99], Easing.linear)));
        return <><div style={{display: 'flex', gap: 14, marginTop: 20, position: 'relative'}}>{tiers.map(([a, b], i) => <div key={a} style={{flex: 1, padding: '20px 16px', borderRadius: 18, textAlign: 'center', border: `3px solid ${i === sel ? H0 : 'transparent'}`, background: i === sel ? `${H0}12` : 'rgba(127,127,160,.08)', opacity: rowOn(i)}}>
          <div style={T(28, i === sel ? H0 : SUB)}>{a}</div><div style={{...T(44, INK), marginTop: 6}}>{b}<span style={T(20, SUB, FONT)}>/mo</span></div></div>)}</div>
          <Row on={rowOn(4)}><span style={T(30, INK, FONT)}>Pay only after you approve</span><div style={{width: 84, height: 46, borderRadius: 99, background: interpolateColors(k(t, [1.6, 1.9], [0, 1]), [0, 1], ['#C9CEDC', OK]), position: 'relative'}}><div style={{position: 'absolute', top: 5, left: 5 + 38 * k(t, [1.6, 1.9], [0, 1], IO), width: 36, height: 36, borderRadius: 99, background: '#fff'}} /></div></Row></>; }
      case 'inbox': { const ch = ['ap/typeform.png', 'si/instagram.svg', 'si/whatsapp.svg']; return <>{rows.map(([a, b], i) => { const rep = k(t, [1.3 + i * 0.4, 1.6 + i * 0.4], [0, 1]);
        return <Row key={a} on={rowOn(i)}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><Icon app={ch[i % 3]} s={56} /><span style={{...T(30, INK, FONT), whiteSpace: 'normal'}}>{a}</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Avatar seed={120 + i} s={44} /><Pill c={rep > 0.5 ? OK : H1} s={20}>{rep > 0.5 ? 'Replied ✓' : 'New'}</Pill></div></Row>; })}
        <div style={{position: 'absolute', right: 30, top: 18, width: 110, height: 110}}><Lottie src={lottie('notify')} /></div></>; }
      case 'checklist': { const done = k(t, [0.9, 2.6], [0, rows.length], Easing.linear); return <><div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 12}}>
        <svg width={120} height={120}><circle cx={60} cy={60} r={50} stroke="#E3E6F0" strokeWidth={12} fill="none" /><circle cx={60} cy={60} r={50} stroke={H0} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={314} strokeDashoffset={314 * (1 - done / rows.length)} transform="rotate(-90 60 60)" /></svg>
        <div style={T(44, INK)}>{Math.round((done / rows.length) * 100)}%</div></div>
        {rows.map(([a, b], i) => <Row key={a} on={rowOn(i)}><div style={{display: 'flex', alignItems: 'center', gap: 16}}><div style={{width: 34, height: 34, borderRadius: 10, background: done > i + 0.5 ? OK : '#E3E6F0', ...T(24, '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{done > i + 0.5 ? '✓' : ''}</div>
          <span style={{...T(30, INK, FONT), whiteSpace: 'normal'}}>{a}</span></div><span style={T(24, SUB, FONT)}>{b}</span></Row>)}</>; }
      default: return <><div style={{display: 'flex', gap: 24, marginTop: 16, alignItems: 'center'}}><div style={{width: 230, height: 190, borderRadius: 18, background: `${H0}10`, padding: 10, boxSizing: 'border-box'}}><Lottie src={lottie('growth')} /></div>
        <div style={{flex: 1}}><div style={T(26, SUB, FONT)}>To: client@acme.co</div><div style={{...T(36, INK), marginTop: 8, whiteSpace: 'normal'}}>Your weekly report is ready</div><div style={{marginTop: 14, display: 'flex', gap: 10}}><Pill c={H0} s={22}>Sessions +18%</Pill><Pill c={H1} s={22}>Ads ROAS 3.4</Pill></div></div></div>
        {rows.map(([a, b], i) => <Row key={a} on={rowOn(i + 1)}><span style={{...T(28, INK, FONT), whiteSpace: 'normal'}}>{a}</span><Pill c={OK} s={20}>{b} ✓</Pill></Row>)}</>;
    }
  })();
  const keys: Key[] = [[0, 0, -20, 1.12], [trustAt - 0.5, 0, 20, 1.04], [trustAt + 0.2, 0, 300, 1.3], [d, 0, 300, 1.34]];
  return (
    <World t={t} keys={keys} id="pf">
      <At x={0} y={-40}><div style={{opacity: k(t, [0, 0.4], [0, 1], OUT), transform: `translateY(${k(t, [0, 0.5], [40, 0], OUT)}px) scale(${k(t, [0, 0.5], [0.96, 1], OUT)})`}}><Card w={1100} style={{padding: 36, position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><span style={T(44)}>{title[v]}</span>{s.chip && <Pill c={H0} s={24}>{s.chip}</Pill>}</div>{body}</Card></div></At>
      <At x={0} y={330}><div style={{opacity: k(t, [trustAt - 0.1, trustAt + 0.2], [0, 1]), transform: `scale(${press})`}}>
        <div style={{width: 320 + 160 * conn, height: 110, borderRadius: 60, background: interpolateColors(conn, [0, 1], [H0, OK]), display: 'flex', alignItems: 'center', justifyContent: 'center', ...T(50, '#fff'), boxShadow: '0 20px 50px rgba(20,30,80,.25)'}}>{conn < 0.5 ? 'Approve' : 'Connected ✓'}</div></div></At>
      <At x={0} y={470}><div style={{...T(44, SUB, FONT), width: 1300, whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2, opacity: k(t, [trustAt + 1.0, trustAt + 1.3], [0, 1])}}>
        <Words t={s.trust} t0={t} at={trustAt + 1.0} hot={['approve', 'pay', "don't", 'Nothing', 'every']} /></div></At>
    </World>
  );
};
'''
rep("// End card (reel 46–52 s)", PROOF + "\n// End card (reel 46–52 s)")

# ---- end card layouts: center | left | split -----------------------------------------------------------------------------
rep("""      <div style={{position: 'absolute', top: 210, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={124} /></Pop>
        <span style={{...T(110), minWidth: 560}}>{typed('FansaChat', t, 0.25, 0.75)}</span></div>
      <div style={{position: 'absolute', top: 420, ...T(66)}}><Words t="Get every update first." t0={t} at={0.6} hot={['every', 'first.']} /></div>
      <div style={{position: 'absolute', top: 580, display: 'flex', gap: 30}}>""",
"""      <div style={{position: 'absolute', top: lay === 'split' ? 300 : 210, left: lay === 'center' ? undefined : 260, display: 'flex', alignItems: 'center', gap: 26}}><Pop t={t} at={0.05}><Logo s={124} /></Pop>
        <span style={{...T(110), minWidth: 560}}>{typed('FansaChat', t, 0.25, 0.75)}</span></div>
      <div style={{position: 'absolute', top: lay === 'split' ? 470 : 420, left: lay === 'center' ? undefined : 260, ...T(66)}}><Words t="Get every update first." t0={t} at={0.6} hot={['every', 'first.']} style={{justifyContent: lay === 'center' ? 'center' : 'flex-start'}} /></div>
      {lay === 'split' && <div style={{position: 'absolute', right: 230, top: 250, width: 520, height: 520, borderRadius: 60, ...glass, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${k(t, [0, d], [-6, 0], IO)}deg) scale(${k(t, [0.1, 0.7], [0.85, 1], BACK)})`}}><div style={{width: 300, height: 300}}><Lottie src={lottie('connect')} /></div></div>}
      <div style={{position: 'absolute', top: lay === 'split' ? 640 : 580, left: lay === 'center' ? undefined : 260, display: 'flex', gap: 30}}>""")
rep("  const th = useTh(), bio = m[1] ?? d - 1.4;", "  const th = useTh(), bio = m[1] ?? d - 1.4, lay = th.end;")
rep("      <div style={{position: 'absolute', top: 790, ...T(44, SUB, FONT), opacity: k(t, [bio, bio + 0.4], [0, 1])}}>Link in bio</div>",
    "      <div style={{position: 'absolute', top: lay === 'split' ? 820 : 790, left: lay === 'center' ? undefined : 260, ...T(44, SUB, FONT), opacity: k(t, [bio, bio + 0.4], [0, 1])}}>Link in bio</div>")

rep("const VIEW: Record<Scene['kind'], React.FC<P<any>>> = {hook: Hook, brand: Brand, flow: Flow, glass: Glass, cycle: Cycle, cards: Cards, people: People, tiers: Tiers, team: Team, end: End};",
    "const VIEW: Record<Scene['kind'], React.FC<P<any>>> = {hook: Hook, brand: Brand, flow: Flow, glass: Glass, cycle: Cycle, cards: Cards, people: People, tiers: Tiers, team: Team, proof: Proof, end: End};")
rep("    if (sc.kind === 'team') {", "    if (sc.kind === 'team' || sc.kind === 'proof') {")

# ---- Ad11: theme ink/glass, 5 wipe styles, portrait fit that keeps text inside the 4:5 frame ---------------------------
rep("export const Ad10: React.FC<{spec: Spec; music?: boolean}> = ({spec, music = false}) => {",
    "export const Ad11: React.FC<{spec: Spec; music?: boolean}> = ({spec, music = false}) => {\n"
    "  INK = spec.theme.dark ? '#F4F6FF' : '#0E1222'; SUB = spec.theme.dark ? '#B9C3E6' : '#545B70';\n"
    "  glass = spec.theme.dark ? GLASS_DARK : spec.theme.liquid ? GLASS_LIQUID : GLASS_SOFT;")
rep("  const fit = height > width ? width / 1500 : Math.max(width / 1920, height / 1080);",
    "  const fit = height > width ? width / 1440 : Math.max(width / 1920, height / 1080); // 4:5: every text block is <= 1380 wide")
rep("""      : {transform: `scale(${1 - inn * 0.06 + out * 0.16})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 10}px)` : undefined, opacity: 1 - out * 0.5};""",
"""        : w === 'slide' ? {transform: `translateY(${(inn * 0.22 - out * 0.22) * height}px)`, opacity: 1 - Math.max(inn, out), filter: inn + out > 0.02 ? `blur(${(inn + out) * 8}px)` : undefined}
          : w === 'zoom' ? {transform: `scale(${1 + inn * 0.35 - out * 0.12})`, opacity: 1 - Math.max(inn, out), filter: inn + out > 0.02 ? `blur(${(inn + out) * 12}px)` : undefined}
            : {transform: `scale(${1 - inn * 0.06 + out * 0.16})`, filter: inn + out > 0.02 ? `blur(${(inn + out) * 10}px)` : undefined, opacity: 1 - out * 0.5};""")
open(P, 'w', encoding='utf-8').write(s)
print('scenes patched')
