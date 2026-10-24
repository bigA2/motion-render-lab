---
name: fansachat-camera-zoom
description: The founder's favourite camera language — one continuous "virtual camera" that dollies, crash-zooms, tilts in 3D and match-cuts through native-looking UI (Apple Notes/Calendar style), with motion blur on every move. Reverse-engineered from reel Db5zGx4O5oa (henryexists). Use with fansachat-motion-design whenever a FansaChat video needs camera/zoom movement.
---

# FansaChat camera & zoom language

Reference: `E:\reel_study\Db5zGx4O5oa\reel.mp4` (14 s, 1:1, 30 fps), frame sheet `sheet4fps.jpg`. The full shot list + master prompt are in `references/db5z_master_prompt.md`. Founder (2026-10-18): "I wanted this type of camera and zoom movement always."

## The 8 rules
1. **One camera, never a cut** (until the end card). Each scene hands off to the next by camera move or shape morph, not by fade.
2. **Always drifting.** Even on a "hold", the camera keeps a slow push-in (scale +3–6 % over 1 s) and a 1–3° rotation drift. Nothing is ever static.
3. **Crash zoom = the beat.** On a key word, zoom 1.6–3× in 8–12 frames with a strong ease-out (cubic-bezier(0.16,1,0.3,1)) and motion blur. Zoom-outs are slower (15–20 frames) to reveal context.
4. **3D card tilt.** UI cards live in perspective (perspective 1200–1600 px). rotateX/rotateY of 8–25° while zooming. The card bends/curls slightly near the end (think page lift).
5. **Motion blur on everything that moves fast**: directional blur in the move's direction (CameraMotionBlur samples 8–10, shutter 180°). Text writes in with per-letter blur + slide.
6. **Match-cut morphs**: object A becomes object B with the same position/colour. Here: app icon → red circle "11" → date cell in the calendar. Use a shared element: same centre, interpolate size/radius/colour.
7. **Depth of field**: the focus area is sharp, edges are soft-blurred (radial blur mask), the background is light grey #E5E5EA. It reads as a real lens.
8. **Particles carry transitions**: text dissolves into dots that fly and re-form as the next object (let's fix that → today. → calendar icon).

## Timing map of the reference (seconds)
0.0–0.5 black → a tiny yellow speck scales up with blur = Notes card · 0.5–2.2 slow push-in + slight rotate · 2.2–3.0 card tilts in 3D + crash zoom into the checklist · 3.0–4.5 list items write in with letter blur; ❌ draws on Quality, ❌ Quantity, ✅ fills on Consistency; push further in · 4.75 whip to dark, list scatters to particles · 5.0–5.5 "let's fix that" (RGB glitch on "fix") · 5.5–6.5 letters scatter → blue "today." on black, stretches/blurs out · 6.75–7.25 particles converge → Calendar app icon "Tue Aug 11", icon turns red · 7.5 morph → red circle "11" · 8.0–8.5 number columns slide in with blur around it, then a fast pull-back · 8.5–9.25 zoom-out reveal of the full AUGUST card · 9.25–10.5 red pill highlights sweep row by row (13–19, 20–26) · 10.75–12.25 3D push/tilt toward 26, card curls, red circle on 26 · 12.5–14 hard cut to black, wordmark "henryexists" with a slight scale-down + blur-in.

## How to apply to FansaChat
- Replace Notes/Calendar with **our real UI** (chat box → workflow nodes → run log) or native-looking app cards the founder's audience knows (pick apps per audience from the 722-app catalogue, never Gmail/Sheets/Slack defaults).
- Story fits Hero's journey: problem checklist (❌❌✅) → "let's fix that" → the fix appears (workflow building) → zoom-out to the whole system → end card = FansaChat logo + wordmark.
- Colours: our brand palette replaces Apple red/blue; keep the light-grey stage + one accent per scene.
- Remotion recipe: `references/remotion_recipe.md`. Effects packs: fansa-knowledge/raw/video_research/effects/EFFECTS_PACKS.md (@remotion/motion-blur, @remotion/noise).

## Techniques from YT 2026-10-19
Sources: Bart_VFX "Apple Style Motion Graphics" (cpQzSKuEAkM) + Somrat Dutta roadmap (CF2xAa8Wujg). Full notes: `E:\fansachat-scripts\learning\motion_videos_2026-10-19.md`.
- **One spring for the whole film**: every morph property (size, x, y, radius, rotation) uses the same settle (damping 18, stiffness 170, ≤2 % overshoot). 60 fps for UI-morph films.
- **Follower delay**: children copy the parent's move 0.1 s late (`frame - 0.1*fps`). Stagger button 0 → icon +6f → label +10f @60fps.
- **"Push" morph**: the button's x and the container's width animate together, so the button looks like it pushes the card open. Fill colour swaps on the same keyframe.
- **Press before a big move**: scale 1 → 0.92 → 1 over 8f, ending 4f before the next morph. A move never starts "out of the blue".
- **Curved paths via a parent wrapper**: travel on an arc (sin-arc 40–80 px) in an outer div, with the spring on the inner child, so holds never drift.
- **Master wobble**: the camera container rotates 0 → +0.6° → −0.4° → 0 per scene (springed), on top of rule 2's push. It "stitches" the whole film together.
- **Rack-focus emphasis**: blur the world to 14 px and dim it to 70 % over 8f while one key line sits sharp. Max 2× per video.
- **Numeral carousel**: giant outlined numerals in a row. The camera tracks x per beat. Active = filled and sharp, others = 25 % opacity with a 6 px blur.
- **Persistent card**: list items swap INSIDE one fixed card (the active bullet lights up). No slide cuts between list items.
