# Notes 1: motion-prompt craft

## Prompt structure
- Strongest prompts use labelled sections: inputs, direction, structure (beat map), build, gotchas, start. [promptsmotion/twoclipping-221cab]
- Include defaults for every user input so the agent can proceed when the user skips one. [promptsmotion/ultimaxbt-2ddf1e]
- Name a reference video to match; naming a style beats describing it, else output defaults to centered text on gradient. [promptsmotion/rexan-wong-7d1b8e]
- Ban lists give quality bars: no crossfades, frozen frames, stock UI kits, Math.random, "anything that looks like a template". [promptsmotion/notdwd-7de38a]
- "No slop", "every morph perfect", study the reference's timing and fonts but change the design overall. [promptsmotion/lexnlin-038035]
- Copy rules: no invented results (%, multipliers, customer names), no animator jargon on screen, name what the product learns. [promptsmotion/ik-builds-b8bdcf]
- Give an art-direction brief: feeling, audience, format, look with hex palette, type sizes, beats, motion, self-check. [promptsmotion/ann-nnng-d69f71]

## Camera & composition
- Camera never cuts on a still frame: every shot enters already moving and leaves on an accelerating move or blur ramp. [promptsmotion/notdwd-7de38a]
- One camera transform on a container, keyed [time, zoom, x, y], zoom interpolated in log space. [promptsmotion/ultimaxbt-2ddf1e]
- One continuous layout world; each close-up is a camera move through it, then a pull-back to show everything. [prompt-motion/rossaxbt-94583b]
- One eased camera move per scene; never zoom in and out consecutively or reverse direction. [promptsmotion/ultimaxbt-2ddf1e]
- Screen-studio style zoom so each moment fills the square, with the cursor scaling too. [promptsmotion/twoclipping-221cab]

## Timing, easing & pacing
- A new idea every 1.5-2 s, with a sound on every hit. [promptsmotion/ik-builds-b8bdcf]
- Entrance easing: exponential ease-out covering 12-19% of the remaining distance per frame. [promptsmotion/notdwd-7de38a]
- 124 BPM: one beat is 14.5 frames at 29.97 fps. Land hard cuts 2 frames before a beat. [promptsmotion/notdwd-7de38a]
- No holds longer than 1 s; the only frozen stretch is ~18 frames. [promptsmotion/ultimaxbt-2ddf1e]
- Floods must overscale past the corners and take about 0.3-0.35 s, or they read as a flash. [promptsmotion/ultimaxbt-2ddf1e]
- Closed-form step-response springs; many targets means summing one spring per change. [promptsmotion/twoclipping-221cab]
- Small spring overshoots only, brief squash on impact. [prompt-motion/rossaxbt-94583b]

## Kinetic typography
- Huge kinetic type in Anton; Caveat handwriting drawn on with stroke-dashoffset. [promptsmotion/ik-builds-b8bdcf]
- Text rises from a mask line; words appear one by one at 92 px. [promptsmotion/ultimaxbt-2ddf1e]
- Typing: about 1 char per frame with a 1-frame hold every 2-3 chars, on fixed lines so the camera never follows wrapping. [promptsmotion/notdwd-7de38a]
- Giant frosted-glass titles clipped to letters, cut off by the card edge. [promptsmotion/notdwd-7de38a]
- Wordmark squeezes into its own period; letters keep touching by narrowing the wdth axis. [promptsmotion/twoclipping-221cab]

## Transitions
- Shape-morph handoffs instead of fades: a button expands into a page, a flood shrinks into the next object. [promptsmotion/ultimaxbt-2ddf1e]
- Shared elements carry content: the flood carries the bubble's words. [promptsmotion/ultimaxbt-2ddf1e]
- Hard light/dark switches; one primary move per transition, no generic push/slide/rotate-swing. [promptsmotion/ik-builds-b8bdcf]
- Iris of 6 blades around a hexagonal aperture; goo = blur plus alpha threshold. [promptsmotion/twoclipping-221cab]
- Whip-tilt through a light-blue flash, blur-dissolves and zoom smear from 20-30 scaled copies. [promptsmotion/notdwd-7de38a]
- Ball never teleports; every handoff shows a visible path. [prompt-motion/rossaxbt-94583b]

## Product UI / app demo techniques
- Cursor reused as one SVG arrow that rotates toward its target, grows on hover and shrinks on press. [promptsmotion/notdwd-7de38a]
- Frosted glass = blurred lightened copy of what's behind, clipped to the shape. [promptsmotion/notdwd-7de38a]
- Liquid glass: clone the scene per element with feDisplacementMap at three scales for chromatic edges. [promptsmotion/twoclipping-221cab]
- Camera follows a ball through toggle, slider (value from ball x), notifications, keyboard. [prompt-motion/rossaxbt-94583b]
- Real UI components from 21st.dev plus real screenshots and brand assets rather than invented UI. [promptsmotion/rexan-wong-7d1b8e]

## Charts / diagrams / data
- Bars draw across; one black shape morphs through Ordered, Printing %, On its way, Delivered. [promptsmotion/twoclipping-221cab]
- A courier dot follows a route to a pin that becomes the brand mark. [promptsmotion/ultimaxbt-2ddf1e]

## Particles, shapes, 3D, shaders
- Seeded randomness for glitter reflections to avoid repetition. [promptsmotion/ann-nnng-d69f71]
- Real physics (ball airborne) with squash/stretch, stagger, overlap, smear, follow-through. [promptsmotion/ik-builds-b8bdcf]
- Use video-gen output as a base, then redraw as a JS animation overlay so only the drawing shows. [promptsmotion/donaldjewkes-063f3c]

## Sound & music sync
- Drums drop on the dark switch and while the ball is airborne; slam back on type and logo. [promptsmotion/ik-builds-b8bdcf]
- Start the song 12 beats before its drop; the zoom or flood lands on the drop. [promptsmotion/ultimaxbt-2ddf1e]
- Real SFX per event placed by measured peak; key ticks every ~32 ms. [promptsmotion/notdwd-7de38a]
- Master -14 LUFS, -2 dBTP, re-measured after AAC encode; log CC0 sources. [promptsmotion/ik-builds-b8bdcf]

## Tooling & workflow
- Build in HyperFrames or Remotion so every scene is code and a change is one re-render. [promptsmotion/rexan-wong-7d1b8e]
- Pure seek(t): no CSS transitions, timers or carried state; set from-states at t=0. [prompt-motion/rossaxbt-94583b]
- Render with Playwright, 8 subframes per frame blended with ffmpeg tmix; 4 leaves ghosts on fast moves. [promptsmotion/ultimaxbt-2ddf1e]
- Scan for single-frame pops (frame-difference spikes 3x neighbours); check one frame per beat. [promptsmotion/twoclipping-221cab]
- Self-check: render, inspect frames at 10%, 50%, 90%, fix clipped text. [promptsmotion/ann-nnng-d69f71]
- Measure text only after fonts load; declare variables before first seek(). [promptsmotion/notdwd-7de38a]

## Top 8 prompts worth copying
- promptsmotion/notdwd-7de38a: frame-exact shot spec with keyframe tables, beats, SFX times and gotchas.
- promptsmotion/twoclipping-221cab: one-take morph-everything structure, liquid glass and iris build recipes.
- promptsmotion/ultimaxbt-2ddf1e: beat-mapped narrative with flood handoffs and render-quality fixes.
- prompt-motion/rossaxbt-94583b: loopable single-world camera film driven by one ball.
- promptsmotion/ik-builds-b8bdcf: compact templated brief with copy rules, craft list and audio spec.
- promptsmotion/rexan-wong-7d1b8e: reference-first director workflow with storyboards and stills.
- promptsmotion/ann-nnng-d69f71: BRIEF/FORMAT/LOOK/TYPE/BEATS/MOTION/SELF-CHECK template.
- promptsmotion/donaldjewkes-063f3c: ambitious music-video brief on attention, hooks and verification loops.
