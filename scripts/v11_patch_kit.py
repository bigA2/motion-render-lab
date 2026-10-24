# One-off: derive src/ads/v11/kit.tsx from the v10 engine (copied verbatim first). Every replacement must match once.
import re, sys
P = 'src/ads/v11/kit.tsx'
s = open(P, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'expected {count} match(es), got {n}: {old[:80]!r}')
    s = s.replace(old, new)

def section(start, end, new):
    global s
    a, b = s.index(start), s.index(end)
    s = s[:a] + new + s[b:]

# ---- header -------------------------------------------------------------------------------------------------------
rep(s[:s.index("import React from 'react';")], """// AdKit v11 — P01–P07 rebuilt per the founder's v11 brief (motion-render-lab docs/tasks/v11/BRIEF.md + addendum):
// every video its OWN dynamic background TYPE + colour combo (liquid / aurora / waves (dark) / color-bends / metaballs /
// silk / contours), liquid-glass UI in P01–P02, text that always fits (wrapping max widths), contrast-checked solid hot
// colours (scripts/v11_checks.mjs), 1440p comps, motion curves from the skills (emil-design-eng: ease-out enters,
// ease-in exits, ease-in-out morphs, spring pops; gsap power3/expo; anime.js staggers), a different closing proof
// mockup per video (no shared "Team workspace"), different flow staging / hook layout / transition / end card per video,
// and free LottieFiles assets (public/assets/v11/SOURCES.md). Timing still comes from the VO (times.json + words.json).
""")
rep("import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';",
    "import {AbsoluteFill, Audio, Easing, Img, interpolate, interpolateColors, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';\nimport {Lottie, type LottieAnimationData} from '@remotion/lottie';")

# ---- curves (emil-design-eng + gsap names) ------------------------------------------------------------------------
rep("const OUT = Easing.bezier(0.16, 1, 0.3, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.7, 0, 0.84, 0), BACK = Easing.bezier(0.2, 1.25, 0.4, 1);",
    "// emil-design-eng: enter = ease-out, exit = ease-in, on-screen morph = ease-in-out; gsap expo.out / power3.out / back.out(1.4)\n"
    "const OUT = Easing.bezier(0.16, 1, 0.3, 1), P3 = Easing.bezier(0.215, 0.61, 0.355, 1), IO = Easing.bezier(0.65, 0, 0.35, 1), IN = Easing.bezier(0.55, 0, 1, 0.45), BACK = Easing.bezier(0.34, 1.4, 0.64, 1);")

# ---- theme-dependent ink / glass (dark video support) -------------------------------------------------------------
rep("const INK = '#0E1222', SUB = '#5A6075', OK = '#12A150', RED = '#E5484D';",
    "// Set per render from the theme (P03 is dark+blue). Module-level on purpose: one composition per render process.\n"
    "let INK = '#0E1222', SUB = '#5A6075';\nconst OK = '#12A150', RED = '#E5484D';")
rep("const glass: React.CSSProperties = {background: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 30px 70px rgba(30,40,90,.12), inset 0 1px 0 #fff'};",
    "const GLASS_SOFT: React.CSSProperties = {background: 'rgba(255,255,255,.84)', border: '1px solid rgba(255,255,255,.95)', boxShadow: '0 30px 70px rgba(30,40,90,.12), inset 0 1px 0 #fff'};\n"
    "// liquid glass = our LiquidGlass clone (src/clones/GlassTrio.tsx) — P01/P02\n"
    "const GLASS_LIQUID: React.CSSProperties = {background: 'linear-gradient(160deg, rgba(255,255,255,.78), rgba(255,255,255,.42))', border: '1.5px solid rgba(255,255,255,.85)', boxShadow: 'inset 0 2px 1px rgba(255,255,255,.95), inset 0 -8px 20px rgba(255,255,255,.22), 0 24px 60px rgba(20,40,110,.18)', backdropFilter: 'blur(24px) saturate(180%)'};\n"
    "const GLASS_DARK: React.CSSProperties = {background: 'rgba(22,30,58,.78)', border: '1px solid rgba(140,170,255,.28)', boxShadow: '0 30px 70px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)'};\n"
    "let glass: React.CSSProperties = GLASS_SOFT;\n"
    "const lottie = (name: string) => staticFile(`assets/v11/lottie/${name}.json`);")

# ---- theme type ---------------------------------------------------------------------------------------------------
rep("export type Fx = 'streaks' | 'bokeh' | 'dots' | 'prisms' | 'ripples' | 'silk' | 'constellation';\nexport type Theme = {bg: [string, string]; bloom: [string, string]; hot: [string, string]; fx: Fx; stage: 'laptop' | 'land'; wipe: 'blur' | 'circle' | 'whip'};",
    "export type Bg = 'liquid' | 'aurora' | 'waves' | 'bends' | 'metaballs' | 'silk' | 'contours';\n"
    "export type Proof = 'dashboard' | 'approvals' | 'history' | 'billing' | 'inbox' | 'checklist' | 'report';\n"
    "export type Theme = {bg: [string, string]; bloom: [string, string, string]; hot: [string, string]; type: Bg; dark?: boolean; liquid?: boolean;\n"
    "  stage: 'laptop' | 'land' | 'panel'; tilt: number; hook: 'stack' | 'side' | 'behind'; wipe: 'blur' | 'circle' | 'whip' | 'slide' | 'zoom'; end: 'center' | 'left' | 'split'; proof: Proof};")
rep("  | {kind: 'team'; from: number; rows: [string, string][]; chip?: string; trust: string}",
    "  | {kind: 'team'; from: number; rows: [string, string][]; chip?: string; trust: string}\n  | {kind: 'proof'; from: number; rows: [string, string][]; chip?: string; trust: string}")
rep("const C = React.createContext<Ctx>({words: [], a: 0, th: {bg: ['#fff', '#fff'], bloom: ['#ccd', '#ccd'], hot: ['#2563EB', '#6D28D9'], fx: 'bokeh', stage: 'land', wipe: 'blur'}});",
    "const C = React.createContext<Ctx>({words: [], a: 0, th: {bg: ['#fff', '#fff'], bloom: ['#ccd', '#ccd', '#ccd'], hot: ['#2563EB', '#6D28D9'], type: 'liquid', stage: 'land', tilt: 14, hook: 'stack', wipe: 'blur', end: 'center', proof: 'dashboard'}});")

# ---- words always wrap inside a safe width (no text leaving the 4:5 frame) -------------------------------------------
rep("    <div style={{display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: 'center', gap: '0 0.24em', ...style}}>",
    "    <div style={{display: 'flex', flexWrap: 'wrap', maxWidth: wrap === false ? undefined : 1380, margin: '0 auto', justifyContent: 'center', gap: '0 0.24em', ...style}}>")
# pills wrap instead of overflowing
rep("  <div style={{padding: `${s * 0.45}px ${s * 0.9}px`, borderRadius: 99, background: solid ? c : '#fff', border: solid ? 'none' : `2px solid ${c}33`, boxShadow: '0 10px 26px rgba(30,40,90,.12)', ...T(s, solid ? '#fff' : c, FONT), fontWeight: 600}}>{children}</div>",
    "  <div style={{padding: `${s * 0.45}px ${s * 0.9}px`, borderRadius: 99, background: solid ? c : glass.background, border: solid ? 'none' : `2px solid ${c}33`, boxShadow: '0 10px 26px rgba(30,40,90,.12)', ...T(s, solid ? '#fff' : c, FONT), fontWeight: 600, maxWidth: 900, whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.15}}>{children}</div>")

open(P, 'w', encoding='utf-8').write(s)
print('header/theme/curves/text patched')
