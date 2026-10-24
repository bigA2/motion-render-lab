# Notes batch 2

## Prompt structure
- Most prompts are one-liners ("15-second showreel, go all out"); the strong ones add role, scene list, bans and checks. [promptsmotion/3xtihor-0f6911]
- Structured template: inputs to ask for, direction, structure, build, gotchas, then "start" (show stills first). [promptsmotion/notdwd-c2037d]
- Same template ends by asking for stills (4 frames) or the beat map before a full render. [promptsmotion/ultimaxbt-bbebf5]
- Name a Banned list: crossfades, frozen frames, stock UI kits, glows on UI text, Math.random, template look. [promptsmotion/notdwd-c2037d]
- Ban bouncy easing, particle bursts, glows, gradients on UI chrome, dead time. [promptsmotion/twoclipping-5cba86]
- Ask the agent to read landing page and codebase for real copy, colors, font, logo before designing. [promptsmotion/aschapmann-131210]
- Demand real components, screenshots, logo assets, not a demo or prototype look. [promptsmotion/tdinh-me-84f579]
- Self-challenge: question your strategy and plan; if it doesn't feel pro, start over. [promptsmotion/heyiammallik-e72d17]
- Five-scene explainer: problem, what I do, 3 steps, one proof point, name. [promptsmotion/alex-prompter-1ea044]
- Palette given as named roles with hex codes plus a banned-hue list. [promptsmotion/notdwd-c2037d]
- Ask for loops: last frame identical to first, cursor position and speed included. [promptsmotion/twoclipping-5cba86]

## Camera & composition
- Camera never cuts on a still frame: shots enter already moving and leave on accelerating move or blur ramp. [promptsmotion/notdwd-c2037d]
- Start on a single dot, multiple windows appear, zoom to many scales, zoom out until desktop is a point in space. [promptsmotion/dale-vaz-cc612a]
- Camera zooms so each UI state fills the frame. [promptsmotion/twoclipping-5cba86]
- When a shape fills the screen, scale it past all four corners. [promptsmotion/ultimaxbt-bbebf5]

## Timing, easing & pacing
- Exponential ease-out moving 12-19% of remaining distance per frame. [promptsmotion/notdwd-c2037d]
- 12 s at 29.97 fps (f0-f359), master rendered 59.94 fps; hard cuts land 2 frames before a beat. [promptsmotion/notdwd-c2037d]
- 124 BPM: beat k = 0.048 + 0.4838k s, one beat = 14.5 frames. [promptsmotion/notdwd-c2037d]
- Everything is a pure function of time in seek(t); no CSS transitions, timers or carried state. [promptsmotion/ultimaxbt-bbebf5]
- Closed-form spring step responses; many retargets are a sum of one spring per change. [promptsmotion/twoclipping-5cba86]
- 120 BPM, 7 bars, something happens on every beat; springs with tiny overshoot at most. [promptsmotion/twoclipping-5cba86]
- Keep each scene on screen long enough to read; build elements in on the beat. [promptsmotion/aschapmann-131210]

## Kinetic typography
- Word-by-word kinetic type with spring easing. [promptsmotion/aschapmann-131210]
- Animate letters individually: "Reduce Motion" collapses to "Motion", dot stays on the "i". [promptsmotion/ultimaxbt-bbebf5]
- Orbiting words on a circular path, letters then move outward into a dot field. [promptsmotion/ultimaxbt-bbebf5]
- Giant frosted-glass titles clipped to the letters, cut off by card bottom. [promptsmotion/notdwd-c2037d]
- Outgoing and incoming text need separate timing so letters don't overlap. [promptsmotion/twoclipping-5cba86]
- End-card wordmark with zoom streaks: 20-30 scaled, faded copies of the word. [promptsmotion/notdwd-c2037d]

## Transitions
- Blur-dissolve and hard cut on the music drop; whip-tilt up through a light-blue flash. [promptsmotion/notdwd-c2037d]
- One shape never cuts: it morphs size, radius, colour while content swaps with short blur. [promptsmotion/twoclipping-5cba86]
- One accent dot threads every scene as the continuity device. [promptsmotion/ultimaxbt-bbebf5]
- Every shot transitions naturally into the next; art-directed, not random effects. [promptsmotion/lukasersil-0ed38e]

## Product UI / app demo techniques
- One SVG macOS cursor reused, rotating to face travel, growing x1.55 on hover, shrinking 15% on press. [promptsmotion/notdwd-c2037d]
- Frosted glass = blurred, lightened copy of the background clipped to the shape. [promptsmotion/notdwd-c2037d]
- Dribbble-style state chain: button, loader, check, island, player, slider, toggle, tabs, chart, cmd palette, toast. [promptsmotion/twoclipping-5cba86]
- Tab indicator edges on different springs so the leading edge stretches. [promptsmotion/twoclipping-5cba86]
- Drags are direct manipulation; on release the value springs back from where it was. [promptsmotion/twoclipping-5cba86]

## Charts / diagrams / data
- Draw the graph from the same spring function that moves the dot, or it feels fake. [promptsmotion/ultimaxbt-bbebf5]
- Chart that draws itself, with tooltip on hover. [promptsmotion/twoclipping-5cba86]

## Particles, shapes, 3D, shaders
- Circle, rotating square and pill are states of one shape, position preserved. [promptsmotion/ultimaxbt-bbebf5]
- Showreel brief lists 2D/3D, abstract geometry, fluid sims, particles, distortion, masking, lighting, depth. [promptsmotion/lukasersil-0ed38e]

## Sound & music sync
- Analyze the song with numpy for the beat grid; start on a downbeat; place UI sounds by measured peak. [promptsmotion/twoclipping-5cba86]
- One soft SFX per appearing element, silence otherwise. [promptsmotion/aschapmann-131210]
- Synthesized SFX list: impact 0.10 s, whooshes at cuts, clicks, key ticks about every 32 ms. [promptsmotion/notdwd-c2037d]
- Master -14 LUFS, true peak -1 dBTP, fade only last 60 ms. [promptsmotion/notdwd-c2037d]
- Ask the agent to compose the music itself, with video synced to it. [promptsmotion/bogdandragomir-35e024]

## Tooling & workflow
- Remotion, entirely in code so it is editable and re-renderable. [promptsmotion/aschapmann-131210]
- Render, inspect frames yourself, fix overlaps, clipping, rushed pacing before showing. [promptsmotion/aschapmann-131210]
- Render one frame per beat before the full render. [promptsmotion/ultimaxbt-bbebf5]
- Playwright screenshot per frame, fonts loaded first, H.264 yuv420p, mux audio. [promptsmotion/notdwd-c2037d]
- Motion blur: 4 subframes per frame blended with ffmpeg tmix at 60fps. [promptsmotion/twoclipping-5cba86]
- Agent skills: product-film for Remotion, session-story for HyperFrames. [promptsmotion/anthonyriera-9b1b2a, promptsmotion/jake11moran-a269c4]

## Top 8 prompts worth copying
- promptsmotion/notdwd-c2037d: frame-exact spec with palette, bans, beat math, SFX and gotchas.
- promptsmotion/twoclipping-5cba86: morphing-UI loop with spring math and beat grid.
- promptsmotion/ultimaxbt-bbebf5: single accent-dot continuity, loops, spring-drawn graph.
- promptsmotion/aschapmann-131210: complete single-sentence production brief with render-and-check loop.
- promptsmotion/tdinh-me-84f579: real assets, music-matched motion, anti-demo quality bar.
- promptsmotion/lukasersil-0ed38e: technique checklist plus art-direction cohesion demand.
- promptsmotion/alex-prompter-1ea044: reusable five-scene explainer fill-in template.
- promptsmotion/heyiammallik-e72d17: self-critique and restart instruction for pro quality.
