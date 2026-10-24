# Notes 3 - motion craft distilled from batch3

## Prompt structure
- Strongest prompts use tagged sections: inputs, direction, structure, build, gotchas, start. [promptsmotion/antonio-kodheli-490109]
- Open with a role ("senior motion designer, product designer and Remotion engineer") plus explicit NOT-this lines. [promptsmotion/daniel-haida-8691d4]
- Point at a real source of truth (repo, tokens, wordmark, screenshots) and forbid invented screens or metrics. [promptsmotion/daniel-haida-8691d4]
- Scrape the real site first; quote taglines, handles and prompts verbatim; ban features the site lacks. [promptsmotion/antonio-kodheli-490109]
- Lock a short palette with hex codes, named fonts and a banned list (bouncy easing, glassmorphism, gradients, particle bursts). [promptsmotion/techhalla-7acbc2]
- Lock exact copy and its order; forbid extra slogans or filler. [promptsmotion/techhalla-7acbc2]
- Ask for inputs first, then a storyboard on the beat grid before any code. [promptsmotion/twoclipping-6dd14e]
- Self-reject quality bar: "template", "PowerPoint animation", "five screenshots sliding around"; prefer 3 extraordinary moments over 10 mediocre. [promptsmotion/daniel-haida-8691d4]

## Camera & composition
- One continuous camera over a single world layer; never two camera moves at once. [promptsmotion/antonio-kodheli-490109]
- Drive the camera as (focus x, focus y, log-scale) tracks; tile radius goes to 0 at full-bleed for exact match cuts. [promptsmotion/antonio-kodheli-490109]
- Camera feels like a macro product shoot: push-ins, pull-outs, controlled depth of field. [promptsmotion/daniel-haida-8691d4]
- Orthographic camera: only punch-in 1.0 to 1.08 and beat-timed horizontal smash-pans, no random drift. [promptsmotion/techhalla-7acbc2]

## Timing, easing & pacing
- 120 BPM grid; 10 bars of 2 s; something happens every beat. [promptsmotion/twoclipping-6dd14e]
- Most ideas last about 1 s; continuous acceleration/deceleration; no repeated bounce. [promptsmotion/brainextends-e19ac3]
- Easing cubic-bezier(0.16, 1, 0.3, 1); overshoot under 2%; staggered arrivals. [promptsmotion/daniel-haida-8691d4]
- Premium film: first 1.5 s already polished, first product moment by 2 s, no long logo intro. [promptsmotion/daniel-haida-8691d4]
- Include one 400 ms moment of absolute stillness so the change feels earned. [promptsmotion/gdgtify-287ddf]
- Make last frame equal first frame (cursor included) so the loop does not stutter. [promptsmotion/demonugc-4c5753]

## Kinetic typography
- Per-glyph spring on y, opacity, blur; stagger one 1/16 note at 120 BPM (125 ms). [promptsmotion/techhalla-7acbc2]
- Outgoing word's outlines become the mask that reveals the incoming word. [promptsmotion/techhalla-7acbc2]
- Words take architectural roles (lintel, support, platform) derived from real glyph paths and counters. [promptsmotion/gdgtify-287ddf]
- Short masked vertical line reveals; outgoing titles leave before incoming ones occupy the space. [promptsmotion/brainextends-e19ac3]

## Transitions
- Object-driven: chart line to connector, receipt to booking, number to amount, shared geometry. [promptsmotion/daniel-haida-8691d4]
- Bad list: crossfade, random wipe, spin, glitch, zoom-blur spam, generic slide-left. [promptsmotion/daniel-haida-8691d4]
- Match cut: last reel shrinks back into its own tile, then the tile blooms into its page. [promptsmotion/antonio-kodheli-490109]
- A circle opens out of the button into a dark scene on the drop. [promptsmotion/twoclipping-6dd14e]

## Product UI / app demo techniques
- Rebuild screens in React from the real design system rather than scaling a giant screenshot. [promptsmotion/daniel-haida-8691d4]
- One shape never cuts: it morphs size, radius, colour while content swaps with a short blur. [promptsmotion/demonugc-4c5753]
- Cursor with accent halo clicks; one cursor homes on the live button position despite camera creep. [promptsmotion/antonio-kodheli-490109]
- Tab indicator edges ride different springs so the leading edge stretches. [promptsmotion/demonugc-4c5753]

## Charts / diagrams / data
- Hero number resolves crisply, chart line draws in, supporting metrics settle later with subtle stagger. [promptsmotion/daniel-haida-8691d4]
- Explainer canvas-only, every frame a pure function of time so a renderer can screenshot. [promptsmotion/parkerrex-1a54fe]

## Particles, shapes, 3D, shaders
- Many prompts ban particle bursts, shockwave rings, lens flares, neon glow, grid floors. [promptsmotion/twoclipping-6dd14e]
- 3D carousel of real videos with floor reflections and motion-blurred whip onto the hero clip. [promptsmotion/twoclipping-6dd14e]
- Never set opacity or filter on a preserve-3d element; fade its wrapper. [promptsmotion/twoclipping-6dd14e]

## Sound & music sync
- Analyze song with numpy for beat grid; start on a downbeat; calibrate to real kick hits. [promptsmotion/twoclipping-6dd14e]
- Place SFX by measured peak, not file start; mix quieter than music; loudnorm -14 LUFS. [promptsmotion/antonio-kodheli-490109]
- No safe audio? Deliver silent master plus a cue sheet of music/SFX hits. [promptsmotion/daniel-haida-8691d4]

## Tooling & workflow
- Timeline in beats in timeline.ts, strings in copy.ts; scenes hold no magic numbers (Remotion). [promptsmotion/antonio-kodheli-490109]
- Single HTML with window.seek(t); no CSS transitions, timers or inter-frame state. [promptsmotion/demonugc-4c5753]
- Springs as closed-form step responses; sum one spring per target change. [promptsmotion/demonugc-4c5753]
- Motion blur: Playwright renders 3-4 subframes per frame, blended by ffmpeg tmix at 60 fps. [promptsmotion/twoclipping-6dd14e]
- Real video: ffmpeg to 30 fps JPEG sequences, swap img src per frame, seek awaits decode. [promptsmotion/twoclipping-6dd14e]
- Run scdet on clips; loop only cut-free windows with a 12-frame dissolve; stagger tile phases. [promptsmotion/antonio-kodheli-490109]
- Render stills at every cut/beat before full render; inspect 20+ frames; decode exact MP4 frames afterwards. [promptsmotion/daniel-haida-8691d4]
- Have a fresh critic who did not build it review the render, then fix. [promptsmotion/antonio-kodheli-490109]

## Top 8 prompts worth copying
- promptsmotion/antonio-kodheli-490109: beat-indexed storyboard, timeline.ts discipline, scdet, critic loop.
- promptsmotion/daniel-haida-8691d4: best quality bar, transition rules, real-product-only constraint, review workflow.
- promptsmotion/brainextends-e19ac3: second-by-second timeline plus persistent player and motion-quality rules.
- promptsmotion/demonugc-4c5753: single-morphing-shape loop with spring math and gotchas.
- promptsmotion/twoclipping-6dd14e: bar-by-bar structure, subframe blur, SFX peak placement.
- promptsmotion/techhalla-7acbc2: strict palette, three-font system, 9 concrete techniques.
- promptsmotion/gdgtify-287ddf: type-as-architecture concept with exact copy and quality gate.
- promptsmotion/jhylee95-e1152f: compact brief: hook, proof, AI beat, retime until synced.
