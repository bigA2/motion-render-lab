---
name: fansachat-motion-design
description: Motion-graphics craft for FansaChat videos (Remotion / HyperFrames / HTML seek(t)). Distilled from 251 real Claude motion prompts (prompt-motion.com + promptsmotion.com). Use before writing any video script, storyboard, Remotion composition or motion prompt.
---

# FansaChat motion design

Source library: `E:\motion-skills\prompt_library\` (INDEX.md, prompts/<site>/<slug>.md, images/, skills_src/).
Reference videos: GitHub releases `motion-videos-prompt-motion` and `motion-videos-promptsmotion` on the private repo `bigA2/fansachat-research`. Each asset is named `<slug>.mp4`.
Full per-batch notes with slug citations: `references/notes1-4.md`. Open a cited prompt only when you need its exact wording.

## 0. FansaChat locks (these override everything below)
- Formats: 16:9 for X and 4:5 for IG. Motion only, no slides. A new thing every 0.5–1 s.
- Use our real chat UI and dashboard/landing components. Never invented screens, metrics or customer names.
- Mascot: faceless glass orb. Glass plates. Prices only as "from $15/mo", and only in pricing-themed videos.
- Audio: master at −14 LUFS, true peak −1 dBTP. Every reel ships with sound plus an SFX map.

## 1. Write the brief like the top prompts
Use tagged sections: `<inputs>` (each input with a default) → `<direction>` → `<structure>` (beat map) → `<sound>` → `<build>` → `<gotchas>` → `<start>` (ask for inputs, then show 4–8 stills before the full render).
- Give a role, plus explicit NOT-this lines. Bar: "not a template, not PowerPoint, not five screenshots sliding". Aim for 3 extraordinary moments, not 10 mediocre ones.
- Source of truth: read the real site and repo first. Quote copy verbatim. Ban features the product doesn't have.
- Lock the palette as hex roles, 1–3 named fonts and exact copy order. No extra slogans.
- **Banned list:** crossfades, frozen frames, stock UI kits, glows on UI text, bouncy easing, particle bursts, lens flares, glassmorphism spam, Math.random, corner text, a Pixar look.
- Pass test: a viewer with no context believes it's a real launch film, not a demo.

## 2. Camera
- Use one continuous world layer with one camera transform on a container. Keyframes are `[t, zoom, x, y]`, with zoom interpolated in log space.
- Each close-up is a camera move through that world. End with a pull-back that reveals everything.
- One eased move per scene. Never zoom in then out, never reverse direction, never run two moves at once.
- Shots enter already moving and leave on an accelerating move or a blur ramp. Never cut on a still frame.
- Constant drift: a 1.0→1.04 push per scene, and the next scene starts at the previous end zoom so nothing snaps.
- Screen-Studio zoom: each UI state fills the frame, and the cursor scales with it.

## 3. Timing, easing, pacing
- Easing: `cubic-bezier(0.16,1,0.3,1)`, or an exponential ease-out covering 12–19% of the remaining distance per frame. Overshoot under 2%.
- Springs are closed-form step responses. With many retargets, sum one spring per change.
- Beat grid: at 120 BPM, something happens on every beat. Hard cuts land 2 frames before a beat. Glyph stagger is a 1/16 note (125 ms).
- No holds over 1 s. Include one deliberate 400 ms stillness so the next change feels earned.
- Nothing pops: fades take at least 0.3 s.
- Floods overscale past all four corners in 0.3–0.35 s.
- First product moment by 2 s, with no long logo intro.
- Loops: the last frame equals the first frame, including the cursor position and speed.

## 4. Kinetic type
- Word-by-word rise: 16 px up, out of a 12 px blur, over 0.34 s, at 0.05–0.06 s per word.
- Per-glyph springs on y, opacity and blur. Masked line reveals.
- The outgoing word leaves before the incoming one arrives, or its outline becomes the mask for the next word.
- Other moves:
  - Typing: about 1 character per frame, with a 1-frame hold every 2–3 characters, on fixed lines.
  - A huge display word is clipped by a card edge.
  - A wordmark squeezes into its own period.
  - Zoom streaks: 20–30 scaled, faded copies of the word.

## 5. Transitions (object-driven, never generic)
- Shape morph handoffs:
  - A button expands into the page.
  - A circle opens out of a button on the drop.
  - A flood shrinks into the next object.
  - A tile blooms into its page.
- Shared geometry carries content: a chart line becomes a connector, a number becomes an amount, a bubble's words ride the flood.
- One continuity device threads every scene, such as an accent dot or a ball that never teleports.
- Allowed: whip-tilts through a flash, blur-dissolves on the drop, iris and goo (blur plus alpha threshold), portals (the object's glass holds the next world).
- Banned: crossfade, random wipe, spin, glitch spam, generic slide-left.

## 6. Product UI demos (our core use)
- Rebuild screens from real components, or capture the live site in headless Chromium:
  - Tag pieces with `data-layer`.
  - Export each piece as a transparent PNG plus position JSON.
  - Animate the pieces. Never scale up a raw screenshot.
- One SVG cursor:
  - It rotates toward its travel direction.
  - It scales ×1.55 on hover and shrinks 15% on press.
  - It homes on the button's live position.
- One shape never cuts: it morphs size, radius and colour while its content swaps with a short blur.
- Tab indicators: the two edges ride different springs. Drags are direct manipulation.
- Frosted glass is a blurred, lightened copy of the background clipped to the shape. Liquid glass adds feDisplacementMap at 3 scales for chromatic edges.
- Lifted UI pieces tilt toward the lens with offset-blurred shadows. Keep lifts to 20–40 px.

## 7. Charts and data
- Draw the graph from the same spring that moves the dot.
- The hero number resolves first, then the line draws in, then supporting metrics settle with a stagger.
- Real numbers only.

## 8. Depth, 3D, particles (use sparingly)
- Parallax: 3 depth layers taken from depth maps, plus grain, vignette and halftone for a collage look.
- Depth of field: blur radius = 75×(focus−depth)/depth in front of the focus, 6× behind it, capped at 120 px.
- Never set opacity or a filter on a preserve-3d element. Fade its wrapper instead.
- Use seeded randomness only.

## 9. Sound sync
- Find the beat grid with numpy. Start on a downbeat. The drop lands on the key line; start the song about 12 beats before the drop.
- One SFX per event, placed by its measured peak rather than the file start: a click per image, a key tick about every 32 ms, whooshes at cuts. Otherwise, silence.
- Ducking: 3-band sidechain duck, voice about 9 dB above the music.
- Master: −14 LUFS, re-measured after the AAC encode. Fade only the last 60 ms.
- If there's no safe audio, deliver a silent master plus a cue sheet.

## 10. Build and verify
- Each frame is a pure function of time, `window.seek(t)` or Remotion frames. No CSS transitions, timers or carried state. Set from-states at t=0.
- Measure text only after fonts load.
- Remotion code layout:
  - `timeline.ts` holds the timing, in beats.
  - `copy.ts` holds the strings.
  - Scenes contain no magic numbers.
- Motion blur:
  - Render 4–8 subframes per frame and blend them with `ffmpeg tmix` at 60 fps; 4 leaves ghosts on fast moves.
  - Encode H.264 yuv420p.
- **QA before showing:**
  1. Render one still per beat or cut.
  2. Build a contact sheet.
  3. Run a frame-difference scan; a spike over 3× its neighbours is a pop.
  4. Check frames at 10%, 50% and 90%.
  5. Fix clipped text.
  6. Have a fresh critic agent review the render.

## Skills referenced by the library (sources in `skills_src/`)
- Leonxlnx/cinetic: cinematic launch film.
- Rieranthony/product-film-skill: Remotion product film from your design system.
- heygen-com/hyperframes-community-skills: session-story.

## Best prompts to open verbatim
These are under `prompt_library/prompts/`.
- `promptsmotion/notdwd-7de38a`, `promptsmotion/notdwd-c2037d`: frame-exact spec.
- `promptsmotion/twoclipping-221cab`, `prompt-motion/twoclipping-d89be5`: morph and one-take camera maths.
- `promptsmotion/ultimaxbt-2ddf1e`: beat-mapped flood handoffs.
- `promptsmotion/rossaxbt-3085b7`: full launch film with VO, glass UI and mix.
- `promptsmotion/daniel-haida-8691d4`: quality bar and transitions.
- `promptsmotion/antonio-kodheli-490109`: storyboard, timeline.ts and critic loop.
- `promptsmotion/ann-nnng-d69f71`: compact BRIEF/LOOK/BEATS/SELF-CHECK template.

## SFX library
- Kenyset pack: `E:\motion-skills\sfx\kenyset\` (also `sfx/` in the private repo). 94 unique sounds.
- `KENYSET_CATALOG.md` lists each sound's category (typing, whoosh, glitch, notification, pop, click, success/error, UI, music), its duration and **peak_at_s**. Place each sound so its peak lands on the on-screen hit.
- Never use `clash-royale-king-cry.mp3`; it's a copyrighted game asset. Check where `88300.mp3`, `App Click 1.wav` and `App Click 11.wav` came from before using them publicly.

## Camera & zoom
For camera/zoom movement ALWAYS also load the skill `fansachat-camera-zoom` (founder's favourite: one continuous camera, crash zooms, 3D card tilt, motion blur, match-cut morphs; ref reel Db5zGx4O5oa).
