# Notes batch 4

## Prompt structure
- Most prompts are one-liners ("15-second showreel, go all out"); the strong ones add inputs, direction, structure, sound, build, gotchas and a start step. [promptsmotion/rossaxbt-3085b7]
- Open with an `<inputs>` block: ask for brand, logo, screenshots, colors, font, track, and give defaults if skipped. [promptsmotion/rossaxbt-3085b7]
- End with a `<start>` step: ask for inputs, then show stills (e.g. 8, or at named timestamps) before the full render. [prompt-motion/twoclipping-d89be5]
- A `<gotchas>` block lists known failure modes (instant pop-in fades, zoom snapping at handoffs, selection-box highlights). [promptsmotion/rossaxbt-3085b7]
- Explicit "Banned:" lists (cuts, glows, white flashes, 3D, templates) steer away from generic output. [prompt-motion/twoclipping-d89be5]
- Anti-slop asks: avoid corner frames and corner text as AI giveaways; avoid Pixar look as "slop". [promptsmotion/1littlecoder-9fef89] [promptsmotion/other-reality-24ec3b]
- Success criterion stated as a viewer test: someone without context believes it is a real trailer, not a demo. [promptsmotion/theparuchh-6e08c3]
- Give references and creative freedom together: source repo, original video, K-pop anchor, "stylistic freedom". [promptsmotion/other-reality-24ec3b]
- Ground factual content: use only facts and numbers that appear on the real site. [promptsmotion/wani-shola-16ca7a]

## Camera & composition
- Camera drifts constantly: push 1.0 to 1.04 per scene; next scene starts at the previous end zoom to avoid snaps. [promptsmotion/rossaxbt-3085b7]
- One continuous camera, never a cut; steady glide, no sideways swing, no zoom-in-then-out. [prompt-motion/twoclipping-d89be5]
- Shot plans name camera move, focal length, lighting and sound: dolly, crane, orbit, FPV, slow push-in. [promptsmotion/theparuchh-6e08c3]
- Layout for text: big lyrics on one side, characters opposite, quieter background behind text. [promptsmotion/other-reality-24ec3b]
- Premium brand rules: three colours, one idea per shot, centred key objects, space to breathe. [promptsmotion/wani-shola-16ca7a]

## Timing, easing & pacing
- Trailer arc: 0-8s quiet, 8-20s rising pace, 20-32s fast cuts on beat, 32-35s logo, 35-40s quiet end. [promptsmotion/theparuchh-6e08c3]
- Nothing appears instantly: eased fades of at least 0.3s; a 0.05s fade reads as a pop. [promptsmotion/rossaxbt-3085b7]
- Per-word text: 0.06s/word headline, 0.05s/word tail, each rising 16px out of 12px blur over 0.34s. [prompt-motion/twoclipping-d89be5]
- Drive motion from one speed curve (share of cruise: 0.5 at 0.6s, 1.0 at 1.6s, eased to 0.12 by 8.3s), integrated into position. [prompt-motion/twoclipping-d89be5]
- Zoom in log scale with trapezoid speed ramp; dive on quadratic ease in-out. [prompt-motion/twoclipping-d89be5]
- Infinite zoom: exponential zoom, segment duration proportional to log(zoom), layer scale = camera^Z with Z 0.45 to 1.22. [promptsmotion/koldo2k-5cff87]
- Cutout animation on twos (15fps) inside a 30fps, 20s loop. [promptsmotion/koldo2k-5cff87]

## Kinetic typography
- Captions typed word by word at the exact spoken time; one typeface, black ink on white. [promptsmotion/rossaxbt-3085b7]
- Emphasized word types in a brand-colour gradient with faint glow; no full stops on screen. [promptsmotion/rossaxbt-3085b7]
- Lyrics vary: big and present for the hook, subtitle-sized elsewhere. [promptsmotion/other-reality-24ec3b]

## Transitions
- Land scene changes on phrase starts; change images on 16th notes with a click each. [promptsmotion/rossaxbt-3085b7]
- Portal transitions: each object's glass holds the next world; cut seamlessly when it fills the frame; verify frame by frame. [promptsmotion/koldo2k-5cff87]
- Fade pieces into the haze colour first, cut to transparent only at the end, so nothing shows through. [prompt-motion/twoclipping-d89be5]

## Product UI / app demo techniques
- Break screenshots into components and icons and animate each; never use raw screenshots. [promptsmotion/ho-ba-f3f0e9]
- Capture the live site in headless Chromium, tag pieces with data-layer, export each as transparent PNG plus position JSON. [prompt-motion/twoclipping-d89be5]
- Lifted pieces tilt up toward the lens (30 to 54 deg) with offset-blurred shadows; keep lifts small (20-40px). [prompt-motion/twoclipping-d89be5]
- Liquid-glass controls: frost and blur backdrop, magnified edge band, sheen, rim, shadow; add a pastel aura on white. [promptsmotion/rossaxbt-3085b7]
- Replace demo UI with the product's real inputs, outputs, settings; sliders move as each is named. [promptsmotion/rossaxbt-3085b7]
- Show the site's chat answering real questions in browser and phone frames. [promptsmotion/wani-shola-16ca7a]

## Charts, diagrams, data
- Ground any numbers in real site facts only; no invented metrics. [promptsmotion/wani-shola-16ca7a]

## Particles, shapes, 3D, shaders
- Badge as solid 3D object, gold particle celebration, tilt follows cursor. [promptsmotion/bthreeagency-b9b8d9]
- Procedural Blender: terrain, instancing, Nishita sky, volumetrics, god rays, sparks, ash, EEVEE Next. [promptsmotion/theparuchh-6e08c3]
- Depth of field per pixel: blur radius 75x(focus-depth)/depth in front, 6x behind, cap 120px, 40 golden-angle taps. [prompt-motion/twoclipping-d89be5]
- Parallax: split landscapes into 3 depth layers from depth maps; collage look with halftone, grain, vignette, flicker. [promptsmotion/koldo2k-5cff87]

## Sound & music sync
- Code-synthesized soundtrack, no samples; every cut and transition on the beat. [promptsmotion/prasenx-8d9323]
- Anchor beat grid so the drop lands on the key line (129.83 BPM, drop 75.39s). [promptsmotion/rossaxbt-3085b7]
- Sidechain duck in 3 bands (30/85/55%, 0.3s hold, 50ms look-ahead, 0.5s release); voice ~9 dB above music; -14 LUFS. [promptsmotion/rossaxbt-3085b7]
- One SFX per event placed by measured peak: click per image, key per letter, whooshes, drop impacts. [promptsmotion/rossaxbt-3085b7]

## Tooling & workflow
- Every frame a pure function of time in seek(t); no timers or CSS transitions. [promptsmotion/rossaxbt-3085b7]
- Render via Playwright with 8-16 motion-blur subframes, then ffmpeg encode. [prompt-motion/twoclipping-d89be5]
- GPU flags: --use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist. [prompt-motion/twoclipping-d89be5]
- Verify: contact sheet, frame-difference scan for pops, optical-flow speed check, low-res previews, 3 stills per shot. [promptsmotion/rossaxbt-3085b7] [promptsmotion/theparuchh-6e08c3]

## Top 8 prompts worth copying
- promptsmotion/rossaxbt-3085b7: full launch-film template with script, voice, glass UI, sound mix, build, gotchas.
- prompt-motion/twoclipping-d89be5: second-by-second camera spec, speed curve and DOF maths.
- promptsmotion/theparuchh-6e08c3: staged concept, storyboard, build, QC pipeline with success criterion.
- promptsmotion/koldo2k-5cff87: loop maths, layers, approval gates, deliverables.
- promptsmotion/other-reality-24ec3b: lyric-video direction on attention, text layout, verification loops.
- promptsmotion/ho-ba-f3f0e9: concise pro-quality asks: componentize screenshots, music-matched motion.
- promptsmotion/wani-shola-16ca7a: premium brand rules plus real-site grounding.
- promptsmotion/prasenx-8d9323: tiny prompt with strong constraints: synthesized audio, beat cuts, specs.
