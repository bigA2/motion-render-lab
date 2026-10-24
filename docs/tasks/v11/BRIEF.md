# P01–P07 v11 — founder brief (2026-10-24). Read ALL of this before touching code.

Scripts, voice-over and word timings stay the same (public/audio/p0Xv8/{vo.wav,times.json,words.json}; specs in src/ads/specs10.ts).
v10 engine = src/ads/AdKit10.tsx (read it; reuse what works). v10 output frames: docs/tasks/v11/refs/qa_v10/*.jpg.

## Step 0 — load the skills (they are in .claude/skills/ of this repo). Mandatory, in this order
1. `design-taste-frontend` (TASTE skill — anti-slop, pre-flight check). Founder ordered this first.
2. `emil-design-eng` (animation decisions, easing, durations, polish).
3. `fansachat-motion-design`, `fansachat-camera-zoom`, `remotion-best-practices`, `remotion-saas`.
4. Motion libraries — translate their curves/techniques into Remotion (interpolate + Easing.bezier / spring()):
   `gsap-scrolltrigger` (power3/expo/back eases, timelines, stagger), `animejs` (stagger grids, spring, keyframes),
   `framer-motion-react` / `framer-motion-variants` / `framer-motion-layout` / `motion-framer` (variants, layout morphs),
   `react-spring-physics` (spring configs), `lottie-animations` (@remotion/lottie).
5. Design audit: `ui-ux-pro-max` (palette/type/contrast), `color-palette`, `design-review`, `frontend-design`, `modern-web-design`, `design-loop`.
Write which skill rule you applied next to the code that uses it (one short comment).

## Read the research (docs/tasks/v11/refs/)
- REEL_DeKoRsNgOPK_clean_liquid_glass.md — the quality bar (clean, liquid glass, airy, solid text).
- WL3_TOMS_SAAS_AE_and_USMAN_STORY_2026-10-24.md — TomsProject techniques (grid-selector reveal, glow search bar, avatar orbit) + Usman editorial style.
- AD_RULES.md + CAMERA_RULE.md — binding founder rules. P01-P07_v10_STORYBOARD.md — per-video themes.
- research/MIXKIT_AE_REPORT.md + research/mixkit_ae.json — Mixkit templates studied; gh-pages branch assets/asset_gallery.json — collected free LottieFiles/Mixkit assets.

## What the founder said is WRONG in v10 — fix every one
1. **Background has no colour motion.** Wanted: like our landing page — colour glows that flow and move left↔right within a few seconds.
   The landing background is reference/landing-bg/ColorBends.jsx (+ SiteBackground.jsx). Port that flowing colour-bend field into
   Remotion (frame-driven, deterministic; WebGL via @remotion/three or a canvas/CSS port — must render headless on GitHub runners with --gl=swangle).
   **7 different, beautiful colour combos** (one per video). Keep each video's subtle design-element layer on top only if it still looks clean.
2. **Same mockups in every video** (e.g. the "Team workspace" mockup appears in all 7; same end card, same flow staging, same hook layout).
   Every video must have its OWN mockups and scene set. Suggested closing proof scenes (one each, never repeated):
   P01 owner dashboard · P02 approval queue · P03 edit history / "change it anytime" · P04 plan & billing card · P05 unified lead inbox ·
   P06 client onboarding checklist · P07 weekly report email preview. Vary the workflow-tree staging per video too (laptop / land view / phone / floating panel …).
3. **Text breaks out of boxes.** Every text must fit its container at both 16:9 and 4:5: measure (widths are deterministic — use fixed widths +
   wrap + auto-fit font size), never let text overflow a card/pill/button. Add a QA check that fails if any element's scrollWidth > clientWidth.
4. **Colour contrast is bad.** All text ≥ 4.5:1 against the ACTUAL background behind it (including glows); large display text ≥ 3:1.
   Compute it (script) for every hot colour × every background stop of that video; adjust colours until it passes.
5. **Quality: 1440p.** Compositions at 2560×1440 (16:9) and 1440×1800 (4:5), 60 fps. Scale the 1920×1080 design stage up — do not just upscale bitmaps; logos/icons must be sharp.
6. **Motion curves are poor.** Use proper curves from the skills: enters ease-out (expo/power3 style), exits ease-in, morphs ease-in-out,
   springs (damping/stiffness from react-spring/remotion spring) for pops, staggered sequences (anime.js/GSAP stagger), no linear moves
   except continuous loops. Keep camera moves as transitions locked to text beats (CAMERA_RULE.md).
7. **Too much is the same across videos.** Each video: different scene types, different transitions, different hook visual style, different end card layout.
8. **Assets forgotten.** Use the Mixkit / LottieFiles assets we collected (research/mixkit_ae.json, gh-pages assets/asset_gallery.json) —
   pick the MINIMAL set that fits each video's story, animated (Lottie via @remotion/lottie, or rebuilt in code like research/MIXKIT_AE_REPORT.md says),
   download them into public/assets/v11/<video>/ (only free-licensed; note the source URL in public/assets/v11/SOURCES.md).
   NO random unrelated objects (no watches/trophies/rockets/calendars) — design elements and topic-true UI only.
9. Keep from v10: solid (never gradient) text; hot words in the centre zone; nouns → visuals; illustrated people (no real faces); real FansaChat workflow tree.

## How the work is split (each GitHub job = one agent)
- Phase A (engine agent): shared engine src/ads/v11/kit.tsx (ColorBends background port, fit-text, contrast helper, curve library, 1440 comps),
  stubs src/ads/v11/P01.tsx … P07.tsx that render the v10 version through the new kit, and src/ads/v11/index.ts registering
  `P0Xv11-16x9`, `P0Xv11-4x5` and `-music` variants at 1440. Then `npm run`-free check: `npx tsc --noEmit` and 1 still per video.
- Phase B (7 agents in parallel, one per video): each edits ONLY its own src/ads/v11/P0X.tsx (+ its own public/assets/v11/P0X/),
  designs that video uniquely, renders QA stills on the runner (npx remotion still … --gl=swangle), LOOKS at them, runs the
  overflow + contrast checks, fixes, max 3 rounds. Commit with a clear message. Never edit another video's file or kit.tsx
  (if the kit needs a change, note it in docs/tasks/v11/KIT_REQUESTS.md).
- Phase C: dispatch render-fast.yml for the 4 comps of each video (crf 16) and frames.yml QA sheets.

## Done = all true
- 28 renders (7 × 16:9/4:5 × music/no-music) at 1440, durations unchanged.
- Overflow check: 0 overflowing elements. Contrast check: every text ≥ 4.5:1 (≥ 3:1 display).
- No mockup/scene layout used in two videos. Background visibly flows left↔right in every video.
- docs/tasks/v11/REPORT_P0X.md per video: skills used, assets used (+source), checks output, 3 QA frames.
